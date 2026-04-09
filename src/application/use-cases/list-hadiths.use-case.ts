import { Inject, Injectable } from "@nestjs/common";

import { Hadith } from "../../domain/entities/hadith.entity";
import { HadithRepositoryPort } from "../ports/repositories/hadith-repository.port";
import { HADITH_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class ListHadithsUseCase {
  public constructor(
    @Inject(HADITH_REPOSITORY)
    private readonly hadithRepository: HadithRepositoryPort,
  ) {}

  public execute(
    limit: number,
    offset: number,
    source?: string,
  ): Promise<Hadith[]> {
    return this.hadithRepository.list(limit, offset, source);
  }
}
