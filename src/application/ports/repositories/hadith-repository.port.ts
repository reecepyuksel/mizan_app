import { Hadith } from "../../../domain/entities/hadith.entity";

export interface HadithRepositoryPort {
  searchByText(query: string, limit: number): Promise<Hadith[]>;
}
