import { Module } from "@nestjs/common";

import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { SearchAyahUseCase } from "./use-cases/search-ayah.use-case";
import { SearchHadithUseCase } from "./use-cases/search-hadith.use-case";
import { SearchKissaUseCase } from "./use-cases/search-kissa.use-case";

@Module({
  imports: [InfrastructureModule],
  providers: [SearchAyahUseCase, SearchHadithUseCase, SearchKissaUseCase],
  exports: [SearchAyahUseCase, SearchHadithUseCase, SearchKissaUseCase],
})
export class ApplicationModule {}
