import { Emission } from "../../domain/Emission";
import { EmissionStats } from "../../domain/Stats";

export interface EmissionsRepository {
  import(emissions: Emission[]): Promise<void>;
  getImportedStats(): Promise<EmissionStats>;
  deleteAll(): Promise<number>;
}
