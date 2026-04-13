import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { SearchAyahUseCase } from "../../application/use-cases/search-ayah.use-case";
import { SearchHadithUseCase } from "../../application/use-cases/search-hadith.use-case";
import { SearchKissaUseCase } from "../../application/use-cases/search-kissa.use-case";
import { SearchSirahUseCase } from "../../application/use-cases/search-sirah.use-case";
import { SearchQueryDto } from "../dto/search-query.dto";

@Controller("search")
@ApiTags("Search")
export class SearchController {
  public constructor(
    private readonly searchAyahUseCase: SearchAyahUseCase,
    private readonly searchHadithUseCase: SearchHadithUseCase,
    private readonly searchKissaUseCase: SearchKissaUseCase,
    private readonly searchSirahUseCase: SearchSirahUseCase,
  ) {}

  @Get("ayahs")
  @ApiOperation({ summary: "Ayet arama" })
  @ApiOkResponse({ description: "Ayet arama sonuclari" })
  public async searchAyahs(@Query() query: SearchQueryDto) {
    return this.searchAyahUseCase.execute(query.q, query.limit);
  }

  @Get("hadiths")
  @ApiOperation({ summary: "Hadis arama" })
  @ApiOkResponse({ description: "Hadis arama sonuclari" })
  public async searchHadiths(@Query() query: SearchQueryDto) {
    return this.searchHadithUseCase.execute(query.q, query.limit);
  }

  @Get("kissas")
  @ApiOperation({ summary: "Kissa arama" })
  @ApiOkResponse({ description: "Kissa arama sonuclari" })
  public async searchKissas(@Query() query: SearchQueryDto) {
    return this.searchKissaUseCase.execute(query.q, query.limit);
  }

  @Get("sirahs")
  @ApiOperation({ summary: "Siyer arama" })
  @ApiOkResponse({ description: "Siyer arama sonuclari" })
  public async searchSirahs(@Query() query: SearchQueryDto) {
    return this.searchSirahUseCase.execute(query.q, query.limit);
  }
}
