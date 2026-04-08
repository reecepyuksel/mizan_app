import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";

export abstract class BaseSequelizeRepository {
  protected constructor(protected readonly sequelize: Sequelize) {}

  protected async runRawQuery<T extends object>(
    sql: string,
    replacements: Record<string, unknown>,
  ): Promise<T[]> {
    const rows = (await this.sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
      raw: true,
    })) as T[];

    return rows;
  }
}
