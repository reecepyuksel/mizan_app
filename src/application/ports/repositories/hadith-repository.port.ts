import { Hadith } from "../../../domain/entities/hadith.entity";

export interface HadithRepositoryPort {
  searchByText(query: string, limit: number): Promise<Hadith[]>;
  list(limit: number, offset: number, source?: string): Promise<Hadith[]>;
  findById(id: string): Promise<Hadith | null>;
}
