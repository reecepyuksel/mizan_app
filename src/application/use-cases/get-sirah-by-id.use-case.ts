import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { Sirah } from "../../domain/entities/sirah.entity";
import { SirahRepositoryPort } from "../ports/repositories/sirah-repository.port";
import { SIRAH_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class GetSirahByIdUseCase {
  public constructor(
    @Inject(SIRAH_REPOSITORY)
    private readonly sirahRepository: SirahRepositoryPort,
  ) {}

  public async execute(id: string): Promise<Sirah> {
    const sirah = await this.sirahRepository.findById(id);
    if (!sirah) {
      throw new NotFoundException("Siyer kaydi bulunamadi");
    }

    return sirah;
  }
}
