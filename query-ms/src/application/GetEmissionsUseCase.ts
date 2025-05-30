import { GetEmissionsResponse } from "./dto/GetEmissionsResponse";
import { GetEmissionsQuery } from "./dto/GetEmissionsQuery";
import { EmissionsQueryRepository } from "./ports/EmissionsQueryRepository";
import { GetEmissionsError } from "../domain/errors/GetEmissionsError";

export class GetEmissionsUseCase {
  public constructor(
    private readonly emissionsWithSectorRepository: EmissionsQueryRepository,
  ) {}

  public async execute(
    query: GetEmissionsQuery,
  ): Promise<GetEmissionsResponse> {
    this.validateGetEmissionsQuery(query);

    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;

    // Create the query with defaults for repository calls
    const queryWithDefaults = { ...query, page, pageSize };

    const [emissionsResponse, totalCount] = await Promise.all([
      this.emissionsWithSectorRepository.findEmissions(queryWithDefaults),
      this.emissionsWithSectorRepository.countEmissions(query),
    ]);

    return {
      emissions: emissionsResponse,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  private validateGetEmissionsQuery(query: GetEmissionsQuery): void {
    if (query.page !== undefined && query.page < 1) {
      throw new GetEmissionsError("Page must be greater than 0");
    }

    if (
      query.pageSize !== undefined &&
      (query.pageSize < 1 || query.pageSize > 100)
    ) {
      throw new GetEmissionsError("Page size must be between 1 and 100");
    }

    if (
      query.value?.gte &&
      query.value?.lte &&
      query.value.gte > query.value.lte
    ) {
      throw new GetEmissionsError(
        "Value gte must be less than or equal to lte",
      );
    }

    if (
      query.sortBy &&
      !["year", "value", "sector", "country"].includes(query.sortBy)
    ) {
      throw new GetEmissionsError(
        "Sort by must be one of year, value, sector, or country",
      );
    }

    if (query.sortOrder && !["asc", "desc"].includes(query.sortOrder)) {
      throw new GetEmissionsError("Sort order must be either asc or desc");
    }
  }
}
