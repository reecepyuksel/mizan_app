import { Ayah } from "../../../domain/entities/ayah.entity";

export interface AyahRepositoryPort {
  searchByText(query: string, limit: number): Promise<Ayah[]>;
  list(limit: number, offset: number, surahNumber?: number): Promise<Ayah[]>;
  listBySurahAyahRange(
    startSurah: number,
    startAyah: number,
    endSurah: number,
    endAyah: number,
  ): Promise<Ayah[]>;
  count(surahNumber?: number): Promise<number>;
  findBySurahAyah(
    surahNumber: number,
    ayahNumber: number,
  ): Promise<Ayah | null>;
  findById(id: string): Promise<Ayah | null>;
}
