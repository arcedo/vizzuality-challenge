import { EmissionsRepository } from "../application/ports/EmissionsRepository";
import { Emission } from "../domain/Emission";
import { PrismaClient } from "@prisma/client";

export class PrismaEmissionRepository implements EmissionsRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async import(data: Emission[]): Promise<boolean> {
    try {
      const result = await this.client.emission.createMany({
        data: data.map((emission) => ({
          idSector: emission.idSector,
          year: emission.year,
          value: emission.value,
        })),
      });

      if (result.count === 0) {
        console.warn("No emissions were imported.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error importing emissions:", error);
      return false;
    }
  }
}
