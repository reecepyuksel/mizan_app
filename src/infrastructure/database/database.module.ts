import { Module } from "@nestjs/common";

import { FtsInfrastructureService } from "../search/fts-infrastructure.service";
import { DatabaseBootstrapService } from "./database.bootstrap";
import { databaseProviders } from "./database.providers";

@Module({
  providers: [
    ...databaseProviders,
    FtsInfrastructureService,
    DatabaseBootstrapService,
  ],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
