import { Emission } from "../domain/Emission";
import { EmissionsRepository } from "./ports/EmissionsRepository";

export class CreateEmissionsUseCase {
  public constructor(
    private readonly emissionsRepository: EmissionsRepository,
  ) {}

  public async execute(emissions: Emission[]): Promise<boolean> {
    return await this.emissionsRepository.import(emissions);
  }
}
