import { Inject, Injectable } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";

import { AyahRepositoryPort } from "../../../application/ports/repositories/ayah-repository.port";
import { Ayah } from "../../../domain/entities/ayah.entity";
import { SEQUELIZE } from "../database.constants";
import { BaseSequelizeRepository } from "./base-sequelize.repository";

@Injectable()
export class AyahSequelizeRepository
  extends BaseSequelizeRepository
  implements AyahRepositoryPort
{
  public constructor(@Inject(SEQUELIZE) sequelize: Sequelize) {
    super(sequelize);
  }

  public async searchByText(query: string, limit: number): Promise<Ayah[]> {
    const sql = `
      SELECT
        id,
        surah_number AS "surahNumber",
        ayah_number AS "ayahNumber",
        arabic_text AS "arabicText",
        turkish_meal AS "turkishMeal"
      FROM ayahs
      WHERE search_vector @@ (plainto_tsquery('mizan_ar', :query) || plainto_tsquery('mizan_tr', :query))
      ORDER BY ts_rank(search_vector, plainto_tsquery('mizan_tr', :query)) DESC
      LIMIT :limit;
    `;

    return this.runRawQuery<Ayah>(sql, { query, limit });
  }

  public async list(
    limit: number,
    offset: number,
    surahNumber?: number,
  ): Promise<Ayah[]> {
    const sql = `
      SELECT
        id,
        surah_number AS "surahNumber",
        ayah_number AS "ayahNumber",
        arabic_text AS "arabicText",
        turkish_meal AS "turkishMeal"
      FROM ayahs
      WHERE (:surahNumber::int IS NULL OR surah_number = :surahNumber)
      ORDER BY surah_number ASC, ayah_number ASC
      LIMIT :limit OFFSET :offset;
    `;

    return this.runRawQuery<Ayah>(sql, {
      limit,
      offset,
      surahNumber: surahNumber ?? null,
    });
  }

  public async count(surahNumber?: number): Promise<number> {
    const sql = `
      SELECT COUNT(*)::int AS count
      FROM ayahs
      WHERE (:surahNumber::int IS NULL OR surah_number = :surahNumber);
    `;

    const rows = await this.runRawQuery<{ count: number }>(sql, {
      surahNumber: surahNumber ?? null,
    });

    return rows[0]?.count ?? 0;
  }

  public async listBySurahAyahRange(
    startSurah: number,
    startAyah: number,
    endSurah: number,
    endAyah: number,
  ): Promise<Ayah[]> {
    const sql = `
      SELECT
        id,
        surah_number AS "surahNumber",
        ayah_number AS "ayahNumber",
        arabic_text AS "arabicText",
        turkish_meal AS "turkishMeal"
      FROM ayahs
      WHERE
        (
          surah_number > :startSurah
          OR (surah_number = :startSurah AND ayah_number >= :startAyah)
        )
        AND
        (
          surah_number < :endSurah
          OR (surah_number = :endSurah AND ayah_number <= :endAyah)
        )
      ORDER BY surah_number ASC, ayah_number ASC;
    `;

    return this.runRawQuery<Ayah>(sql, {
      startSurah,
      startAyah,
      endSurah,
      endAyah,
    });
  }

  public async findBySurahAyah(
    surahNumber: number,
    ayahNumber: number,
  ): Promise<Ayah | null> {
    const sql = `
      SELECT
        id,
        surah_number AS "surahNumber",
        ayah_number AS "ayahNumber",
        arabic_text AS "arabicText",
        turkish_meal AS "turkishMeal"
      FROM ayahs
      WHERE surah_number = :surahNumber
        AND ayah_number = :ayahNumber
      LIMIT 1;
    `;

    const rows = await this.runRawQuery<Ayah>(sql, {
      surahNumber,
      ayahNumber,
    });

    return rows[0] ?? null;
  }

  public async findById(id: string): Promise<Ayah | null> {
    const sql = `
      SELECT
        id,
        surah_number AS "surahNumber",
        ayah_number AS "ayahNumber",
        arabic_text AS "arabicText",
        turkish_meal AS "turkishMeal"
      FROM ayahs
      WHERE id = :id
      LIMIT 1;
    `;

    const rows = await this.runRawQuery<Ayah>(sql, { id });
    return rows[0] ?? null;
  }
}
