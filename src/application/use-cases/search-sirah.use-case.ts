import { Inject, Injectable } from "@nestjs/common";

import { Sirah } from "../../domain/entities/sirah.entity";
import { SIRAH_REPOSITORY } from "../ports/repositories/repository.tokens";
import { SirahRepositoryPort } from "../ports/repositories/sirah-repository.port";

@Injectable()
export class SearchSirahUseCase {
  public constructor(
    @Inject(SIRAH_REPOSITORY)
    private readonly sirahRepository: SirahRepositoryPort,
  ) {}

  public async execute(query: string, limit = 20): Promise<Sirah[]> {
    return this.sirahRepository.searchByText(query, limit);
  }
}
