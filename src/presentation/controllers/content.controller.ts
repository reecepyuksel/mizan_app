import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetAyahByIdUseCase } from "../../application/use-cases/get-ayah-by-id.use-case";
import { GetHadithByIdUseCase } from "../../application/use-cases/get-hadith-by-id.use-case";
import { ListAyahsUseCase } from "../../application/use-cases/list-ayahs.use-case";
import { ListHadithsUseCase } from "../../application/use-cases/list-hadiths.use-case";
import { AyahListQueryDto } from "../dto/ayah-list-query.dto";
import { HadithListQueryDto } from "../dto/hadith-list-query.dto";

@Controller("content")
@ApiTags("Content")
export class ContentController {
  public constructor(
    private readonly listAyahsUseCase: ListAyahsUseCase,
    private readonly getAyahByIdUseCase: GetAyahByIdUseCase,
    private readonly listHadithsUseCase: ListHadithsUseCase,
    private readonly getHadithByIdUseCase: GetHadithByIdUseCase,
  ) {}

  @Get("ayahs")
  @ApiOperation({ summary: "Ayet listeleme" })
  @ApiOkResponse({ description: "Ayet listesi" })
  public listAyahs(@Query() query: AyahListQueryDto) {
    const offset = (query.page - 1) * query.limit;
    return this.listAyahsUseCase.execute(
      query.limit,
      offset,
      query.surahNumber,
    );
  }

  @Get("ayahs/:id")
  @ApiOperation({ summary: "ID ile ayet detayi" })
  @ApiOkResponse({ description: "Ayet detayi" })
  public getAyahById(@Param("id") id: string) {
    return this.getAyahByIdUseCase.execute(id);
  }

  @Get("hadiths")
  @ApiOperation({ summary: "Hadis listeleme" })
  @ApiOkResponse({ description: "Hadis listesi" })
  public listHadiths(@Query() query: HadithListQueryDto) {
    const offset = (query.page - 1) * query.limit;
    return this.listHadithsUseCase.execute(query.limit, offset, query.source);
  }

  @Get("hadiths/:id")
  @ApiOperation({ summary: "ID ile hadis detayi" })
  @ApiOkResponse({ description: "Hadis detayi" })
  public getHadithById(@Param("id") id: string) {
    return this.getHadithByIdUseCase.execute(id);
  }
}
