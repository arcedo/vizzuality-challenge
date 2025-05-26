import { SectorRepository } from "./ports/SectorRepository";
import { EmissionsRepository } from "./ports/EmissionsRepository";

export class DeleteAllUseCase {
  public constructor(
    private readonly sectorRepository: SectorRepository,
    private readonly emissionRepository: EmissionsRepository,
  ) {}

  public async execute(): Promise<{
    sectorsDeleted: number;
    emissionsDeleted: number;
  }> {
    const emissionsDeleted = await this.emissionRepository.deleteAll();
    const sectorsDeleted = await this.sectorRepository.deleteAll();
    return {
      sectorsDeleted,
      emissionsDeleted,
    };
  }
}
