import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";

import { FtsInfrastructureService } from "../search/fts-infrastructure.service";
import { SEQUELIZE } from "./database.constants";

@Injectable()
export class DatabaseBootstrapService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(DatabaseBootstrapService.name);

  public constructor(
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly ftsInfrastructureService: FtsInfrastructureService,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.sequelize.authenticate();
    await this.sequelize.sync();
    await this.ftsInfrastructureService.setup();
    this.logger.log("PostgreSQL baglantisi ve FTS altyapisi hazir.");
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.sequelize.close();
  }
}
