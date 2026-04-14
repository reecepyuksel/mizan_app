import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetAyahByIdUseCase } from "../../application/use-cases/get-ayah-by-id.use-case";
import { GetAyahByReferenceUseCase } from "../../application/use-cases/get-ayah-by-reference.use-case";
import { GetHadithByIdUseCase } from "../../application/use-cases/get-hadith-by-id.use-case";
import { GetSirahByIdUseCase } from "../../application/use-cases/get-sirah-by-id.use-case";
import { ListAyahsUseCase } from "../../application/use-cases/list-ayahs.use-case";
import { ListHadithsUseCase } from "../../application/use-cases/list-hadiths.use-case";
import { ListQuranPageUseCase } from "../../application/use-cases/list-quran-page.use-case";
import { ListSirahsUseCase } from "../../application/use-cases/list-sirahs.use-case";
import { AyahListQueryDto } from "../dto/ayah-list-query.dto";
import { AyahReferenceQueryDto } from "../dto/ayah-reference-query.dto";
import { HadithListQueryDto } from "../dto/hadith-list-query.dto";
import { QuranPageQueryDto } from "../dto/quran-page-query.dto";
import { SirahListQueryDto } from "../dto/sirah-list-query.dto";

@Controller("content")
@ApiTags("Content")
export class ContentController {
  public constructor(
    private readonly listAyahsUseCase: ListAyahsUseCase,
    private readonly listQuranPageUseCase: ListQuranPageUseCase,
    private readonly getAyahByIdUseCase: GetAyahByIdUseCase,
    private readonly getAyahByReferenceUseCase: GetAyahByReferenceUseCase,
    private readonly listHadithsUseCase: ListHadithsUseCase,
    private readonly getHadithByIdUseCase: GetHadithByIdUseCase,
    private readonly listSirahsUseCase: ListSirahsUseCase,
    private readonly getSirahByIdUseCase: GetSirahByIdUseCase,
  ) {}

  @Get("quran-pages")
  @ApiOperation({
    summary: "Kur'an sayfa okuma listesi (Arapca + opsiyonel meal)",
  })
  @ApiOkResponse({ description: "Sayfa bazli ayet listesi" })
  public listQuranPages(@Query() query: QuranPageQueryDto) {
    return this.listQuranPageUseCase.execute({
      page: query.page,
      includeMeal: query.includeMeal,
    });
  }

  @Get("quran-pages/meal")
  @ApiOperation({ summary: "Mushaf sayfasinin komple Turkce meali" })
  @ApiOkResponse({ description: "Sayfa bazli toplu meal" })
  public async getQuranPageMeal(@Query() query: QuranPageQueryDto) {
    const pageData = await this.listQuranPageUseCase.execute({
      page: query.page,
      includeMeal: true,
    });

    const mealItems = pageData.items.map((item) => ({
      surahNumber: item.surahNumber,
      ayahNumber: item.ayahNumber,
      turkishMeal: item.turkishMeal ?? "",
    }));

    return {
      page: pageData.page,
      firstAyah: pageData.firstAyah,
      lastAyah: pageData.lastAyah,
      ayahCount: pageData.ayahCount,
      fullMealText: mealItems.map((item) => item.turkishMeal).join("\n"),
      items: mealItems,
    };
  }

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

  @Get("ayahs/reference")
  @ApiOperation({ summary: "Sure + ayet numarasiyla ayet detayi" })
  @ApiOkResponse({ description: "Ayet detayi (opsiyonel meal)" })
  public getAyahByReference(@Query() query: AyahReferenceQueryDto) {
    return this.getAyahByReferenceUseCase.execute({
      surahNumber: query.surahNumber,
      ayahNumber: query.ayahNumber,
      includeMeal: query.includeMeal,
    });
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

  @Get("sirahs")
  @ApiOperation({ summary: "Siyer listeleme" })
  @ApiOkResponse({ description: "Siyer listesi" })
  public listSirahs(@Query() query: SirahListQueryDto) {
    const offset = (query.page - 1) * query.limit;
    return this.listSirahsUseCase.execute(
      query.limit,
      offset,
      query.partTitle,
      query.unitNumber,
    );
  }

  @Get("sirahs/:id")
  @ApiOperation({ summary: "ID ile siyer detayi" })
  @ApiOkResponse({ description: "Siyer detayi" })
  public getSirahById(@Param("id") id: string) {
    return this.getSirahByIdUseCase.execute(id);
  }
}

