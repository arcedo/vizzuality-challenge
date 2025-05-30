import { PrismaClient, Prisma } from "@prisma/client";
import { EmissionsQueryRepository } from "../application/ports/EmissionsQueryRepository";
import { GetEmissionsQuery } from "../application/dto/GetEmissionsQuery";
import { EmissionWithSector } from "../domain/EmissionWithSector";
import { GetEmissionsError } from "../domain/errors/GetEmissionsError";

export class PrismaEmissionQueryRepository implements EmissionsQueryRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async findEmissions(
    query: GetEmissionsQuery,
  ): Promise<EmissionWithSector[]> {
    try {
      const {
        sortBy = "year",
        sortOrder = "asc",
        page = 1,
        pageSize = 10,
      } = query;

      const whereClause = this.buildWhereClause(query);
      const orderByClause = this.buildOrderByClause(sortBy, sortOrder);

      const emissions = await this.client.emission.findMany({
        where: whereClause,
        include: { Sector: true },
        orderBy: orderByClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return emissions.map(
        (emission) =>
          new EmissionWithSector(
            emission.year,
            emission.value,
            emission.Sector.name,
            emission.Sector.country,
            emission.Sector.parentSector,
          ),
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new GetEmissionsError(
          "Invalid query parameters provided for emissions retrieval",
        );
      }
      console.error("Error during find emissions operation:", error);
      throw new GetEmissionsError(
        "Internal server error during find emissions operation",
      );
    }
  }

  public async countEmissions(query: GetEmissionsQuery): Promise<number> {
    const whereClause = this.buildWhereClause(query);
    return this.client.emission.count({ where: whereClause });
  }

  private buildWhereClause(
    query: GetEmissionsQuery,
  ): Prisma.EmissionWhereInput {
    const whereClause: Prisma.EmissionWhereInput = {};

    if (query.year) {
      if (typeof query.year === "object") {
        whereClause.year = {
          gte: query.year.gte ? Number(query.year.gte) : undefined,
          lte: query.year.lte ? Number(query.year.lte) : undefined,
        };
      } else {
        whereClause.year = Number(query.year);
      }
    }

    if (query.value) {
      whereClause.value = {};
      if (query.value.gte !== undefined) {
        whereClause.value.gte = Number(query.value.gte);
      }
      if (query.value.lte !== undefined) {
        whereClause.value.lte = Number(query.value.lte);
      }
      if (query.value.eq !== undefined) {
        whereClause.value = Number(query.value.eq);
      }
    }

    const sectorFilters: any = {};
    if (query.sector) {
      sectorFilters.name = {
        contains: query.sector,
        mode: "insensitive" as const,
      };
    }

    if (query.country) {
      sectorFilters.country = { equals: query.country };
    }

    if (query.sectorParent !== undefined) {
      sectorFilters.parentSector = query.sectorParent;
    }

    if (Object.keys(sectorFilters).length > 0) {
      whereClause.Sector = sectorFilters;
    }

    return whereClause;
  }

  private buildOrderByClause(sortBy: string, sortOrder: "asc" | "desc") {
    if (!sortBy || sortBy.trim() === "") {
      return { year: sortOrder };
    }

    switch (sortBy) {
      case "sector":
        return { Sector: { name: sortOrder } };
      case "country":
        return { Sector: { country: sortOrder } };
      case "year":
      case "value":
      default:
        return { [sortBy]: sortOrder };
    }
  }
}
