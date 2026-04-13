import { Inject, Injectable } from "@nestjs/common";

import { Ayah } from "../../domain/entities/ayah.entity";
import { AyahRepositoryPort } from "../ports/repositories/ayah-repository.port";
import { AYAH_REPOSITORY } from "../ports/repositories/repository.tokens";

interface QuranMetaPage {
  first: [number, number];
  last: [number, number];
}

export interface QuranPageAyah {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  turkishMeal?: string;
}

export interface QuranPageResponse {
  page: number;
  firstAyah: { surahNumber: number; ayahNumber: number };
  lastAyah: { surahNumber: number; ayahNumber: number };
  ayahCount: number;
  items: QuranPageAyah[];
}

@Injectable()
export class ListQuranPageUseCase {
  public constructor(
    @Inject(AYAH_REPOSITORY)
    private readonly ayahRepository: AyahRepositoryPort,
  ) {}

  public async execute(input: {
    page: number;
    includeMeal: boolean;
  }): Promise<QuranPageResponse> {
    const pageMeta = await getQuranPageMeta(input.page);
    const [firstSurah, firstAyah] = pageMeta.first;
    const [lastSurah, lastAyah] = pageMeta.last;

    const items = await this.ayahRepository.listBySurahAyahRange(
      firstSurah,
      firstAyah,
      lastSurah,
      lastAyah,
    );

    const mappedItems = items.map((ayah) =>
      this.mapAyah(ayah, input.includeMeal),
    );

    return {
      page: input.page,
      firstAyah: {
        surahNumber: firstSurah,
        ayahNumber: firstAyah,
      },
      lastAyah: {
        surahNumber: lastSurah,
        ayahNumber: lastAyah,
      },
      ayahCount: mappedItems.length,
      items: mappedItems,
    };
  }

  private mapAyah(ayah: Ayah, includeMeal: boolean): QuranPageAyah {
    return {
      id: ayah.id,
      surahNumber: ayah.surahNumber,
      ayahNumber: ayah.ayahNumber,
      arabicText: ayah.arabicText,
      ...(includeMeal ? { turkishMeal: ayah.turkishMeal } : {}),
    };
  }
}

async function getQuranPageMeta(page: number): Promise<QuranMetaPage> {
  const quranMetaModule = (await import("quran-meta/hafs")) as {
    getPageMeta: (pageNumber: number) => QuranMetaPage;
  };

  return quranMetaModule.getPageMeta(page);
}
