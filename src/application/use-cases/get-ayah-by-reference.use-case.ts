import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { Ayah } from "../../domain/entities/ayah.entity";
import { AyahRepositoryPort } from "../ports/repositories/ayah-repository.port";
import { AYAH_REPOSITORY } from "../ports/repositories/repository.tokens";

export interface AyahReferenceResponse {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  turkishMeal?: string;
}

@Injectable()
export class GetAyahByReferenceUseCase {
  public constructor(
    @Inject(AYAH_REPOSITORY)
    private readonly ayahRepository: AyahRepositoryPort,
  ) {}

  public async execute(input: {
    surahNumber: number;
    ayahNumber: number;
    includeMeal: boolean;
  }): Promise<AyahReferenceResponse> {
    const ayah = await this.ayahRepository.findBySurahAyah(
      input.surahNumber,
      input.ayahNumber,
    );

    if (!ayah) {
      throw new NotFoundException("Ayet bulunamadi");
    }

    return this.mapAyah(ayah, input.includeMeal);
  }

  private mapAyah(ayah: Ayah, includeMeal: boolean): AyahReferenceResponse {
    return {
      id: ayah.id,
      surahNumber: ayah.surahNumber,
      ayahNumber: ayah.ayahNumber,
      arabicText: ayah.arabicText,
      ...(includeMeal ? { turkishMeal: ayah.turkishMeal } : {}),
    };
  }
}
