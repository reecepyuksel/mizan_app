import { Inject, Injectable } from "@nestjs/common";

import { Sirah } from "../../domain/entities/sirah.entity";
import { SirahRepositoryPort } from "../ports/repositories/sirah-repository.port";
import { SIRAH_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class ListSirahsUseCase {
  public constructor(
    @Inject(SIRAH_REPOSITORY)
    private readonly sirahRepository: SirahRepositoryPort,
  ) {}

  public execute(
    limit: number,
    offset: number,
    partTitle?: string,
    unitNumber?: string,
  ): Promise<Sirah[]> {
    return this.sirahRepository.list(limit, offset, partTitle, unitNumber);
  }
}
