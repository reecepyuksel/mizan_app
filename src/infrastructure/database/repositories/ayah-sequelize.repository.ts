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
}
