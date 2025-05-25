import { Sector } from "../domain/Sector";
import { SectorRepository } from "./ports/SectorRepository";

export class CreateSectorsUseCase {
  public constructor(private readonly sectorRepository: SectorRepository) {}

  public async execute(sector: Sector[]): Promise<boolean> {
    return await this.sectorRepository.import(sector);
  }
}
