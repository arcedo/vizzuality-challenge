import { EmissionsRepository } from "../application/ports/EmissionsRepository";
import { Emission } from "../domain/Emission";
import { PrismaClient } from "@prisma/client";
import { RepositoryError } from "../domain/errors/RepositoryError";
import { EmissionStats } from "../domain/Stats";

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

  public async getImportedStats(): Promise<EmissionStats> {
    try {
      const result = await this.client.emission.aggregate({
        _count: { id: true },
        _min: { value: true, year: true },
        _max: { value: true, year: true },
      });

      return new EmissionStats(
        {
          min: result._min.value ?? 0,
          max: result._max.value ?? 0,
        },
        {
          min: result._min.year ?? 0,
          max: result._max.year ?? 0,
        },
        result._count.id ?? 0,
      );
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      console.error("Error fetching stats:", error);
      throw new RepositoryError("Failed to fetch import stats.");
    }
  }

  public async deleteAll(): Promise<number> {
    try {
      const result = await this.client.emission.deleteMany({});
      if (result.count === 0) {
        throw new RepositoryError("No emissions were found to delete.");
      }
      return result.count;
    } catch (error) {
      if (error instanceof RepositoryError) {
        throw error;
      }
      console.error("Error deleting all emissions:", error);
      throw new RepositoryError("Failed to delete all emissions.");
    }
  }
}
