import { Inject, Injectable } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";

import { KissaRepositoryPort } from "../../../application/ports/repositories/kissa-repository.port";
import { Kissa } from "../../../domain/entities/kissa.entity";
import { SEQUELIZE } from "../database.constants";
import { BaseSequelizeRepository } from "./base-sequelize.repository";

@Injectable()
export class KissaSequelizeRepository
  extends BaseSequelizeRepository
  implements KissaRepositoryPort
{
  public constructor(@Inject(SEQUELIZE) sequelize: Sequelize) {
    super(sequelize);
  }

  public async searchByText(query: string, limit: number): Promise<Kissa[]> {
    const sql = `
      SELECT
        id,
        title,
        content
      FROM kissas
      WHERE search_vector @@ plainto_tsquery('mizan_tr', :query)
      ORDER BY ts_rank(search_vector, plainto_tsquery('mizan_tr', :query)) DESC
      LIMIT :limit;
    `;

    return this.runRawQuery<Kissa>(sql, { query, limit });
  }
}
