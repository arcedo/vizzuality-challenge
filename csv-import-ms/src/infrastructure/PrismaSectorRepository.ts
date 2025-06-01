import { Sector } from "../domain/Sector";
import { SectorStats } from "../domain/Stats";
import { SectorRepository } from "../application/ports/SectorRepository";
import { PrismaClient } from "@prisma/client";
import { RepositoryError } from "../domain/errors/RepositoryError";
import { PrismaTransaction } from "../types/prisma";

export class PrismaSectorRepository implements SectorRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async import(data: Sector[], tx?: PrismaTransaction): Promise<void> {
    const transaction = tx || this.client;
    try {
      const result = await transaction.sector.createMany({
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

  public async getImportedStats(tx?: PrismaTransaction): Promise<SectorStats> {
    const transaction = tx || this.client;
    try {
      const [countryGroups, overallCount] = await Promise.all([
        transaction.sector.groupBy({
          by: ["country"],
          _count: { _all: true },
        }),
        transaction.sector.aggregate({
          _count: { name: true },
        }),
      ]);

      return new SectorStats(countryGroups.length, overallCount._count.name);
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      console.error("Error fetching import stats:", error);
      throw new RepositoryError("Failed to fetch import stats.");
    }
  }

  public async deleteAll(): Promise<number> {
    try {
      const result = await this.client.sector.deleteMany({});
      if (result.count === 0) {
        throw new RepositoryError("No sectors were found to delete.");
      }
      return result.count;
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      console.error("Error deleting all sectors:", error);
      throw new RepositoryError("Failed to delete all sectors.");
    }
  }
}
