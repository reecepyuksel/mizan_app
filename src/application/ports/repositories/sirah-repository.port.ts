import { Sirah } from "../../../domain/entities/sirah.entity";

export interface SirahRepositoryPort {
  searchByText(query: string, limit: number): Promise<Sirah[]>;
  list(
    limit: number,
    offset: number,
    partTitle?: string,
    unitNumber?: string,
  ): Promise<Sirah[]>;
  findById(id: string): Promise<Sirah | null>;
}
