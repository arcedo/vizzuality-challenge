import { EmissionsRepository } from "../application/ports/EmissionsRepository";
import { Emission } from "../domain/Emission";
import { PrismaClient } from "@prisma/client";
import { RepositoryError } from "../domain/errors/RepositoryError";

export class PrismaEmissionRepository implements EmissionsRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async import(data: Emission[]): Promise<void> {
    try {
      const result = await this.client.emission.createMany({
        data: data.map((emission) => ({
          idSector: emission.idSector,
          year: emission.year,
          value: emission.value,
        })),
      });

      if (result.count === 0) {
        throw new RepositoryError("No emissions were imported.");
      }
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      console.error("Error importing emissions:", error);
      throw new RepositoryError("Failed to import emissions.");
    }
  }
}
