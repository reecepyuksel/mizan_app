import { Module } from "@nestjs/common";

import { ApplicationModule } from "../application/application.module";
import { SearchController } from "./controllers/search.controller";

@Module({
  imports: [ApplicationModule],
  controllers: [SearchController],
})
export class PresentationModule {}
