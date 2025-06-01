import { Sector } from "../domain/Sector";
import { SectorRepository } from "./ports/SectorRepository";
import { PrismaTransaction } from "../types/prisma";

export class CreateSectorsUseCase {
  public constructor(private readonly sectorRepository: SectorRepository) {}

  public async execute(
    sector: Sector[],
    tx?: PrismaTransaction,
  ): Promise<void> {
    await this.sectorRepository.import(sector, tx);
  }
}
