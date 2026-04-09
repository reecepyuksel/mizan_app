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
      DECLARE
        use_tr_hunspell boolean := false;
        use_ar_hunspell boolean := false;
        use_unaccent boolean := false;
        use_tr_stem boolean := false;
      BEGIN
        BEGIN
          PERFORM ts_lexize('unaccent', 'test');
          use_unaccent := true;
        EXCEPTION
          WHEN OTHERS THEN
            use_unaccent := false;
        END;

        BEGIN
          PERFORM to_tsvector('turkish_stem', 'test');
          use_tr_stem := true;
        EXCEPTION
          WHEN OTHERS THEN
            use_tr_stem := false;
        END;

        BEGIN
          IF EXISTS (SELECT 1 FROM pg_ts_dict WHERE dictname = 'mizan_tr_hunspell') THEN
            DROP TEXT SEARCH DICTIONARY mizan_tr_hunspell;
          END IF;

          CREATE TEXT SEARCH DICTIONARY mizan_tr_hunspell (
            TEMPLATE = ispell,
            DictFile = tr_tr,
            AffFile = tr_tr
          );

          PERFORM ts_lexize('mizan_tr_hunspell', 'test');
          use_tr_hunspell := true;
        EXCEPTION
          WHEN OTHERS THEN
            use_tr_hunspell := false;
            IF EXISTS (SELECT 1 FROM pg_ts_dict WHERE dictname = 'mizan_tr_hunspell') THEN
              DROP TEXT SEARCH DICTIONARY mizan_tr_hunspell;
            END IF;
        END;

        IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'mizan_tr') THEN
          CREATE TEXT SEARCH CONFIGURATION mizan_tr (COPY = simple);
        END IF;

        IF use_tr_hunspell THEN
          IF use_unaccent THEN
            ALTER TEXT SEARCH CONFIGURATION mizan_tr
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH unaccent, mizan_tr_hunspell, simple;
          ELSE
            ALTER TEXT SEARCH CONFIGURATION mizan_tr
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH mizan_tr_hunspell, simple;
          END IF;
        ELSE
          IF use_tr_stem AND use_unaccent THEN
            ALTER TEXT SEARCH CONFIGURATION mizan_tr
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH unaccent, turkish_stem;
          ELSIF use_tr_stem THEN
            ALTER TEXT SEARCH CONFIGURATION mizan_tr
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH turkish_stem;
          ELSIF use_unaccent THEN
            ALTER TEXT SEARCH CONFIGURATION mizan_tr
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH unaccent, simple;
          ELSE
            ALTER TEXT SEARCH CONFIGURATION mizan_tr
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH simple;
          END IF;
        END IF;

        BEGIN
          IF EXISTS (SELECT 1 FROM pg_ts_dict WHERE dictname = 'mizan_ar_hunspell') THEN
            DROP TEXT SEARCH DICTIONARY mizan_ar_hunspell;
          END IF;

          CREATE TEXT SEARCH DICTIONARY mizan_ar_hunspell (
            TEMPLATE = ispell,
            DictFile = ar,
            AffFile = ar
          );

          PERFORM ts_lexize('mizan_ar_hunspell', 'test');
          use_ar_hunspell := true;
        EXCEPTION
          WHEN OTHERS THEN
            use_ar_hunspell := false;
            IF EXISTS (SELECT 1 FROM pg_ts_dict WHERE dictname = 'mizan_ar_hunspell') THEN
              DROP TEXT SEARCH DICTIONARY mizan_ar_hunspell;
            END IF;
        END;

        IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'mizan_ar') THEN
          CREATE TEXT SEARCH CONFIGURATION mizan_ar (COPY = simple);
        END IF;

        IF use_ar_hunspell THEN
          IF use_unaccent THEN
            ALTER TEXT SEARCH CONFIGURATION mizan_ar
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH unaccent, mizan_ar_hunspell, simple;
          ELSE
            ALTER TEXT SEARCH CONFIGURATION mizan_ar
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH mizan_ar_hunspell, simple;
          END IF;
        ELSE
          IF use_unaccent THEN
            ALTER TEXT SEARCH CONFIGURATION mizan_ar
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH unaccent, simple;
          ELSE
            ALTER TEXT SEARCH CONFIGURATION mizan_ar
            ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
            WITH simple;
          END IF;
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
      CREATE INDEX IF NOT EXISTS ayahs_surah_ayah_idx ON ayahs (surah_number, ayah_number);
      CREATE INDEX IF NOT EXISTS ayahs_updated_at_idx ON ayahs (updated_at);
      CREATE INDEX IF NOT EXISTS hadiths_source_id_idx ON hadiths (source, id);
      CREATE INDEX IF NOT EXISTS hadiths_updated_at_idx ON hadiths (updated_at);
      CREATE INDEX IF NOT EXISTS kissas_updated_at_idx ON kissas (updated_at);
      CREATE INDEX IF NOT EXISTS user_favorites_device_updated_idx ON user_favorites (device_id, updated_at);
      CREATE INDEX IF NOT EXISTS user_notes_device_updated_idx ON user_notes (device_id, updated_at);
      CREATE INDEX IF NOT EXISTS notification_devices_device_active_idx ON notification_devices (device_id, is_active);

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
