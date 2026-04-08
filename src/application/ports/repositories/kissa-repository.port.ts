import { Kissa } from "../../../domain/entities/kissa.entity";

export interface KissaRepositoryPort {
  searchByText(query: string, limit: number): Promise<Kissa[]>;
}
