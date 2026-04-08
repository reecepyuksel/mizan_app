import { Ayah } from "../../../domain/entities/ayah.entity";

export interface AyahRepositoryPort {
  searchByText(query: string, limit: number): Promise<Ayah[]>;
}
