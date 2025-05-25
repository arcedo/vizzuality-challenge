import { Sector } from "../domain/Sector";
import { SectorRepository } from "../application/ports/SectorRepository";
import { PrismaClient } from "@prisma/client";
import { RepositoryError } from "../domain/errors/RepositoryError";

export class PrismaSectorRepository implements SectorRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async import(data: Sector[]): Promise<void> {
    try {
      const result = await this.client.sector.createMany({
        data: data.map((sector) => ({
          id: sector.id,
          name: sector.name,
          country: sector.country,
          parentSector: sector.parentSector,
        })),
      });

      if (result.count === 0) {
        throw new RepositoryError("No sectors were imported.");
      }
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      console.error("Error importing sectors:", error);
      throw new RepositoryError("Failed to import sectors.");
    }
  }
}
