import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { Hadith } from "../../domain/entities/hadith.entity";
import { HadithRepositoryPort } from "../ports/repositories/hadith-repository.port";
import { HADITH_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class GetHadithByIdUseCase {
  public constructor(
    @Inject(HADITH_REPOSITORY)
    private readonly hadithRepository: HadithRepositoryPort,
  ) {}

  public async execute(id: string): Promise<Hadith> {
    const hadith = await this.hadithRepository.findById(id);
    if (!hadith) {
      throw new NotFoundException("Hadis bulunamadi");
    }

    return hadith;
  }
}
