import { Sector } from "../domain/Sector";
import { SectorRepository } from "../application/ports/SectorRepository";
import { PrismaClient } from "@prisma/client";

export class PrismaSectorRepository implements SectorRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async import(data: Sector[]): Promise<boolean> {
    try {
      const result = await this.client.sector.createMany({
        data: data.map((sector) => ({
          id: sector.id,
          name: sector.name,
          country: sector.country,
          parentSector: sector.parentSector,
        })),
        skipDuplicates: true,
      });

      if (result.count === 0) {
        console.warn("No sectors were imported.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error importing emissions:", error);
      return false;
    }
  }
}
