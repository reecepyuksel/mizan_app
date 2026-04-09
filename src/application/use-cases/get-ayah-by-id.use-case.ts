import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { Ayah } from "../../domain/entities/ayah.entity";
import { AyahRepositoryPort } from "../ports/repositories/ayah-repository.port";
import { AYAH_REPOSITORY } from "../ports/repositories/repository.tokens";

@Injectable()
export class GetAyahByIdUseCase {
  public constructor(
    @Inject(AYAH_REPOSITORY)
    private readonly ayahRepository: AyahRepositoryPort,
  ) {}

  public async execute(id: string): Promise<Ayah> {
    const ayah = await this.ayahRepository.findById(id);
    if (!ayah) {
      throw new NotFoundException("Ayet bulunamadi");
    }

    return ayah;
  }
}
