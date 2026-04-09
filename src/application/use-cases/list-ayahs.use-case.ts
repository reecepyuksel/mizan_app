import { Inject, Injectable } from "@nestjs/common";

import { Ayah } from "../../domain/entities/ayah.entity";
import { AyahRepositoryPort } from "../ports/repositories/ayah-repository.port";
import { AYAH_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class ListAyahsUseCase {
  public constructor(
    @Inject(AYAH_REPOSITORY)
    private readonly ayahRepository: AyahRepositoryPort,
  ) {}

  public execute(
    limit: number,
    offset: number,
    surahNumber?: number,
  ): Promise<Ayah[]> {
    return this.ayahRepository.list(limit, offset, surahNumber);
  }
}
