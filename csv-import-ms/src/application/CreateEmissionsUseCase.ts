import { Emission } from "../domain/Emission";
import { PrismaTransaction } from "../types/prisma";
import { EmissionsRepository } from "./ports/EmissionsRepository";

export class CreateEmissionsUseCase {
  public constructor(
    private readonly emissionsRepository: EmissionsRepository,
  ) {}

  public async execute(
    emissions: Emission[],
    tx?: PrismaTransaction,
  ): Promise<void> {
    await this.emissionsRepository.import(emissions, tx);
  }
}
