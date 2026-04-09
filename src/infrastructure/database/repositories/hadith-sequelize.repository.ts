import { Inject, Injectable } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";

import { HadithRepositoryPort } from "../../../application/ports/repositories/hadith-repository.port";
import { Hadith } from "../../../domain/entities/hadith.entity";
import { SEQUELIZE } from "../database.constants";
import { BaseSequelizeRepository } from "./base-sequelize.repository";

@Injectable()
export class HadithSequelizeRepository
  extends BaseSequelizeRepository
  implements HadithRepositoryPort
{
  public constructor(@Inject(SEQUELIZE) sequelize: Sequelize) {
    super(sequelize);
  }

  public async searchByText(query: string, limit: number): Promise<Hadith[]> {
    const sql = `
      SELECT
        id,
        source,
        chapter,
        content
      FROM hadiths
      WHERE search_vector @@ (plainto_tsquery('mizan_ar', :query) || plainto_tsquery('mizan_tr', :query))
      ORDER BY ts_rank(search_vector, plainto_tsquery('mizan_tr', :query)) DESC
      LIMIT :limit;
    `;

    return this.runRawQuery<Hadith>(sql, { query, limit });
  }

  public async list(
    limit: number,
    offset: number,
    source?: string,
  ): Promise<Hadith[]> {
    const sql = `
      SELECT
        id,
        source,
        chapter,
        content
      FROM hadiths
      WHERE (:source::text IS NULL OR source = :source)
      ORDER BY source ASC, id ASC
      LIMIT :limit OFFSET :offset;
    `;

    return this.runRawQuery<Hadith>(sql, {
      limit,
      offset,
      source: source ?? null,
    });
  }

  public async findById(id: string): Promise<Hadith | null> {
    const sql = `
      SELECT
        id,
        source,
        chapter,
        content
      FROM hadiths
      WHERE id = :id
      LIMIT 1;
    `;

    const rows = await this.runRawQuery<Hadith>(sql, { id });
    return rows[0] ?? null;
  }
}
