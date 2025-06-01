import { Sector } from "../../domain/Sector";
import { SectorStats } from "../../domain/Stats";
import { PrismaTransaction } from "../../types/prisma";

export interface SectorRepository {
  import(sectors: Sector[], tx?: PrismaTransaction): Promise<void>;
  getImportedStats(tx?: PrismaTransaction): Promise<SectorStats>;
  deleteAll(): Promise<number>;
}
