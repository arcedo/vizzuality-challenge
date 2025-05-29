import { EmissionWithSector } from "../../domain/EmissionWithSector";
import { GetEmissionsQuery } from "../dto/GetEmissionsQuery";

export interface EmissionsQueryRepository {
  findEmissions(query: GetEmissionsQuery): Promise<EmissionWithSector[]>;
  countEmissions(query: GetEmissionsQuery): Promise<number>;
}
