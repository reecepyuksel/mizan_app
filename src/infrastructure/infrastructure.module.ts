import { Module } from "@nestjs/common";

import {
  AYAH_REPOSITORY,
  HADITH_REPOSITORY,
  KISSA_REPOSITORY,
} from "../application/ports/repositories/repository.tokens";
import { DatabaseModule } from "./database/database.module";
import { AyahSequelizeRepository } from "./database/repositories/ayah-sequelize.repository";
import { HadithSequelizeRepository } from "./database/repositories/hadith-sequelize.repository";
import { KissaSequelizeRepository } from "./database/repositories/kissa-sequelize.repository";

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: AYAH_REPOSITORY,
      useClass: AyahSequelizeRepository,
    },
    {
      provide: HADITH_REPOSITORY,
      useClass: HadithSequelizeRepository,
    },
    {
      provide: KISSA_REPOSITORY,
      useClass: KissaSequelizeRepository,
    },
  ],
  exports: [AYAH_REPOSITORY, HADITH_REPOSITORY, KISSA_REPOSITORY],
})
export class InfrastructureModule {}
