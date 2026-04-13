import { Inject, Injectable } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";

import { SirahRepositoryPort } from "../../../application/ports/repositories/sirah-repository.port";
import { Sirah } from "../../../domain/entities/sirah.entity";
import { SEQUELIZE } from "../database.constants";
import { BaseSequelizeRepository } from "./base-sequelize.repository";

@Injectable()
export class SirahSequelizeRepository
  extends BaseSequelizeRepository
  implements SirahRepositoryPort
{
  public constructor(@Inject(SEQUELIZE) sequelize: Sequelize) {
    super(sequelize);
  }

  public async searchByText(query: string, limit: number): Promise<Sirah[]> {
    const sql = `
      SELECT
        id,
        title,
        slug,
        part_title AS "partTitle",
        unit_number AS "unitNumber",
        unit_title AS "unitTitle",
        "order",
        summary,
        content
      FROM sirahs
      WHERE search_vector @@ plainto_tsquery('mizan_tr', :query)
      ORDER BY ts_rank(search_vector, plainto_tsquery('mizan_tr', :query)) DESC, "order" ASC
      LIMIT :limit;
    `;

    return this.runRawQuery<Sirah>(sql, { query, limit });
  }

  public async list(
    limit: number,
    offset: number,
    partTitle?: string,
    unitNumber?: string,
  ): Promise<Sirah[]> {
    const sql = `
      SELECT
        id,
        title,
        slug,
        part_title AS "partTitle",
        unit_number AS "unitNumber",
        unit_title AS "unitTitle",
        "order",
        summary,
        content
      FROM sirahs
      WHERE (:partTitle::text IS NULL OR part_title = :partTitle)
        AND (:unitNumber::text IS NULL OR unit_number = :unitNumber)
      ORDER BY "order" ASC
      LIMIT :limit OFFSET :offset;
    `;

    return this.runRawQuery<Sirah>(sql, {
      limit,
      offset,
      partTitle: partTitle ?? null,
      unitNumber: unitNumber ?? null,
    });
  }

  public async findById(id: string): Promise<Sirah | null> {
    const sql = `
      SELECT
        id,
        title,
        slug,
        part_title AS "partTitle",
        unit_number AS "unitNumber",
        unit_title AS "unitTitle",
        "order",
        summary,
        content
      FROM sirahs
      WHERE id = :id
      LIMIT 1;
    `;

    const rows = await this.runRawQuery<Sirah>(sql, { id });
    return rows[0] ?? null;
  }
}
