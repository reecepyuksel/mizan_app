import { Ayah } from "../../../domain/entities/ayah.entity";

export interface AyahRepositoryPort {
  searchByText(query: string, limit: number): Promise<Ayah[]>;
  list(limit: number, offset: number, surahNumber?: number): Promise<Ayah[]>;
  findById(id: string): Promise<Ayah | null>;
}
