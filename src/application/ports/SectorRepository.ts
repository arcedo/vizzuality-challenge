import { Sector } from "../../domain/Sector";
import { SectorStats } from "../../domain/Stats";

export interface SectorRepository {
  import(sectors: Sector[]): Promise<void>;
  getImportedStats(): Promise<SectorStats>;
  deleteAll(): Promise<number>;
}
