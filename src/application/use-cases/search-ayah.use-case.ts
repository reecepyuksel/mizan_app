import { Inject, Injectable } from "@nestjs/common";

import { Ayah } from "../../domain/entities/ayah.entity";
import { AyahRepositoryPort } from "../ports/repositories/ayah-repository.port";
import { AYAH_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class SearchAyahUseCase {
  public constructor(
    @Inject(AYAH_REPOSITORY)
    private readonly ayahRepository: AyahRepositoryPort,
  ) {}

  public async execute(query: string, limit = 20): Promise<Ayah[]> {
    return this.ayahRepository.searchByText(query, limit);
  }
}
