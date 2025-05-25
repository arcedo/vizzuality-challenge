import { Emission } from "../../domain/Emission";

export interface EmissionsRepository {
  import(emissions: Emission[]): Promise<void>;
}
