import { SectorRepository } from "./ports/SectorRepository";
import { EmissionsRepository } from "./ports/EmissionsRepository";
import { ImportStats } from "../domain/Stats";
import { PrismaTransaction } from "../types/prisma";

export class GetStatsUseCase {
  public constructor(
    private readonly sectorRepository: SectorRepository,
    private readonly emissionRepository: EmissionsRepository,
  ) {}

  public async execute(tx?: PrismaTransaction): Promise<ImportStats> {
    const [sectorStats, emissionStats] = await Promise.all([
      this.sectorRepository.getImportedStats(),
      this.emissionRepository.getImportedStats(),
    ]);

    return new ImportStats(sectorStats, emissionStats);
  }
}
