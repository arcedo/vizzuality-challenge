import { Sector } from "../../domain/Sector";

export interface SectorRepository {
  import(sectors: Sector[]): Promise<void>;
}
