import { Emission } from "../../domain/Emission";
import { EmissionStats } from "../../domain/Stats";
import { PrismaTransaction } from "../../types/prisma";

export interface EmissionsRepository {
  import(emissions: Emission[], tx?: PrismaTransaction): Promise<void>;
  getImportedStats(tx?: PrismaTransaction): Promise<EmissionStats>;
  deleteAll(): Promise<number>;
}
