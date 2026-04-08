import { Controller, Get, Query } from "@nestjs/common";

import { SearchAyahUseCase } from "../../application/use-cases/search-ayah.use-case";
import { SearchHadithUseCase } from "../../application/use-cases/search-hadith.use-case";
import { SearchKissaUseCase } from "../../application/use-cases/search-kissa.use-case";
import { SearchQueryDto } from "../dto/search-query.dto";

@Controller("search")
export class SearchController {
  public constructor(
    private readonly searchAyahUseCase: SearchAyahUseCase,
    private readonly searchHadithUseCase: SearchHadithUseCase,
    private readonly searchKissaUseCase: SearchKissaUseCase,
  ) {}

  @Get("ayahs")
  public async searchAyahs(@Query() query: SearchQueryDto) {
    return this.searchAyahUseCase.execute(query.q, query.limit);
  }

  @Get("hadiths")
  public async searchHadiths(@Query() query: SearchQueryDto) {
    return this.searchHadithUseCase.execute(query.q, query.limit);
  }

  @Get("kissas")
  public async searchKissas(@Query() query: SearchQueryDto) {
    return this.searchKissaUseCase.execute(query.q, query.limit);
  }
}
