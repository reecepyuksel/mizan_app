import { Inject, Injectable } from "@nestjs/common";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";

import { SEQUELIZE } from "../database/database.constants";

@Injectable()
export class FtsInfrastructureService {
  public constructor(
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
  ) {}

  public async setup(): Promise<void> {
    await this.sequelize.query(
      `
      DO
      $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'mizan_tr') THEN
          CREATE TEXT SEARCH CONFIGURATION mizan_tr (COPY = turkish);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'mizan_ar') THEN
          -- Hunspell sozlukleri eklendiginde burasi arabic parser/sozluk ile guncellenecek.
          CREATE TEXT SEARCH CONFIGURATION mizan_ar (COPY = simple);
        END IF;
      END;
      $$;
      `,
      { type: QueryTypes.RAW },
    );

    await this.sequelize.query(
      `
      CREATE OR REPLACE FUNCTION set_ayah_search_vector()
      RETURNS trigger AS
      $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('mizan_ar', COALESCE(NEW.arabic_text, '')), 'A') ||
          setweight(to_tsvector('mizan_tr', COALESCE(NEW.turkish_meal, '')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION set_hadith_search_vector()
      RETURNS trigger AS
      $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('mizan_ar', COALESCE(NEW.content, '')), 'A') ||
          setweight(to_tsvector('mizan_tr', COALESCE(NEW.content, '')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION set_kissa_search_vector()
      RETURNS trigger AS
      $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('mizan_tr', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('mizan_tr', COALESCE(NEW.content, '')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS ayahs_search_vector_trigger ON ayahs;
      CREATE TRIGGER ayahs_search_vector_trigger
      BEFORE INSERT OR UPDATE OF arabic_text, turkish_meal ON ayahs
      FOR EACH ROW EXECUTE FUNCTION set_ayah_search_vector();

      DROP TRIGGER IF EXISTS hadiths_search_vector_trigger ON hadiths;
      CREATE TRIGGER hadiths_search_vector_trigger
      BEFORE INSERT OR UPDATE OF content ON hadiths
      FOR EACH ROW EXECUTE FUNCTION set_hadith_search_vector();

      DROP TRIGGER IF EXISTS kissas_search_vector_trigger ON kissas;
      CREATE TRIGGER kissas_search_vector_trigger
      BEFORE INSERT OR UPDATE OF title, content ON kissas
      FOR EACH ROW EXECUTE FUNCTION set_kissa_search_vector();

      CREATE INDEX IF NOT EXISTS ayahs_search_vector_gin_idx ON ayahs USING GIN (search_vector);
      CREATE INDEX IF NOT EXISTS hadiths_search_vector_gin_idx ON hadiths USING GIN (search_vector);
      CREATE INDEX IF NOT EXISTS kissas_search_vector_gin_idx ON kissas USING GIN (search_vector);

      UPDATE ayahs
      SET search_vector =
        setweight(to_tsvector('mizan_ar', COALESCE(arabic_text, '')), 'A') ||
        setweight(to_tsvector('mizan_tr', COALESCE(turkish_meal, '')), 'B')
      WHERE search_vector IS NULL;

      UPDATE hadiths
      SET search_vector =
        setweight(to_tsvector('mizan_ar', COALESCE(content, '')), 'A') ||
        setweight(to_tsvector('mizan_tr', COALESCE(content, '')), 'B')
      WHERE search_vector IS NULL;

      UPDATE kissas
      SET search_vector =
        setweight(to_tsvector('mizan_tr', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('mizan_tr', COALESCE(content, '')), 'B')
      WHERE search_vector IS NULL;
      `,
      { type: QueryTypes.RAW },
    );
  }
}
