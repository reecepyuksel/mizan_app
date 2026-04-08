import { Inject, Injectable } from "@nestjs/common";

import { Hadith } from "../../domain/entities/hadith.entity";
import { HadithRepositoryPort } from "../ports/repositories/hadith-repository.port";
import { HADITH_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class SearchHadithUseCase {
  public constructor(
    @Inject(HADITH_REPOSITORY)
    private readonly hadithRepository: HadithRepositoryPort,
  ) {}

  public async execute(query: string, limit = 20): Promise<Hadith[]> {
    return this.hadithRepository.searchByText(query, limit);
  }
}
