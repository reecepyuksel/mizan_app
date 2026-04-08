import { Inject, Injectable } from "@nestjs/common";

import { Kissa } from "../../domain/entities/kissa.entity";
import { KissaRepositoryPort } from "../ports/repositories/kissa-repository.port";
import { KISSA_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class SearchKissaUseCase {
  public constructor(
    @Inject(KISSA_REPOSITORY)
    private readonly kissaRepository: KissaRepositoryPort,
  ) {}

  public async execute(query: string, limit = 20): Promise<Kissa[]> {
    return this.kissaRepository.searchByText(query, limit);
  }
}
