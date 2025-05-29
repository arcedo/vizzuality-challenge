import { GetEmissionsUseCase } from "../src/application/GetEmissionsUseCase";
import { EmissionsQueryRepository } from "../src/application/ports/EmissionsQueryRepository";
import { GetEmissionsError } from "../src/domain/errors/GetEmissionsError";
import { EmissionWithSector } from "../src/domain/EmissionWithSector";
import { GetEmissionsQuery } from "../src/application/dto/GetEmissionsQuery";

// Mock repository
const mockRepository: jest.Mocked<EmissionsQueryRepository> = {
  findEmissions: jest.fn(),
  countEmissions: jest.fn(),
};

describe("GetEmissionsUseCase", () => {
  let useCase: GetEmissionsUseCase;

  beforeEach(() => {
    useCase = new GetEmissionsUseCase(mockRepository);
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const mockEmissions = [
      new EmissionWithSector(2023, 100.5, "Energy", "USA", null),
      new EmissionWithSector(2022, 95.2, "Transport", "USA", "Energy"),
    ];

    it("should return emissions with pagination when valid query is provided", async () => {
      // Arrange
      const query: GetEmissionsQuery = {
        page: 1,
        pageSize: 10,
        sectorCountry: "USA",
      };

      mockRepository.findEmissions.mockResolvedValue(mockEmissions);
      mockRepository.countEmissions.mockResolvedValue(25);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result).toEqual({
        emissions: mockEmissions,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 25,
          totalPages: 3,
        },
      });

      expect(mockRepository.findEmissions).toHaveBeenCalledWith({
        ...query,
        page: 1,
        pageSize: 10,
      });
      expect(mockRepository.countEmissions).toHaveBeenCalledWith(query);
    });

    it("should apply default values for page and pageSize", async () => {
      // Arrange
      const query: GetEmissionsQuery = {};

      mockRepository.findEmissions.mockResolvedValue([]);
      mockRepository.countEmissions.mockResolvedValue(0);

      // Act
      await useCase.execute(query);

      // Assert
      expect(mockRepository.findEmissions).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
      });
    });

    it("should throw error when pageSize is greater than 100", async () => {
      const query: GetEmissionsQuery = {
        pageSize: 150,
      };

      await expect(useCase.execute(query)).rejects.toThrow(
        new GetEmissionsError("Page size must be between 1 and 100"),
      );
    });

    it("should calculate totalPages correctly", async () => {
      const query: GetEmissionsQuery = {
        pageSize: 10,
      };

      mockRepository.findEmissions.mockResolvedValue([]);
      mockRepository.countEmissions.mockResolvedValue(23);

      const result = await useCase.execute(query);

      expect(result.pagination.totalPages).toBe(3);
    });

    it("should handle zero results", async () => {
      const query: GetEmissionsQuery = {};

      mockRepository.findEmissions.mockResolvedValue([]);
      mockRepository.countEmissions.mockResolvedValue(0);

      const result = await useCase.execute(query);

      expect(result.emissions).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe("validation", () => {
    it("should throw error when page is less than 1", async () => {
      const query: GetEmissionsQuery = { page: 0 };

      await expect(useCase.execute(query)).rejects.toThrow(
        new GetEmissionsError("Page must be greater than 0"),
      );
    });

    it("should throw error when pageSize is less than 1", async () => {
      const query: GetEmissionsQuery = { pageSize: 0 };

      await expect(useCase.execute(query)).rejects.toThrow(
        new GetEmissionsError("Page size must be between 1 and 100"),
      );
    });

    it("should throw error when pageSize is greater than 100", async () => {
      const query: GetEmissionsQuery = { pageSize: 101 };

      await expect(useCase.execute(query)).rejects.toThrow(
        new GetEmissionsError("Page size must be between 1 and 100"),
      );
    });

    it("should throw error when value gte is greater than lte", async () => {
      const query: GetEmissionsQuery = {
        value: { gte: 100, lte: 50 },
      };

      await expect(useCase.execute(query)).rejects.toThrow(
        new GetEmissionsError("Value gte must be less than or equal to lte"),
      );
    });

    it("should throw error for invalid sortBy", async () => {
      const query: GetEmissionsQuery = {
        sortBy: "invalidField" as any,
      };

      await expect(useCase.execute(query)).rejects.toThrow(
        new GetEmissionsError(
          "Sort by must be one of year, value, sector, or country",
        ),
      );
    });

    it("should throw error for invalid sortOrder", async () => {
      const query: GetEmissionsQuery = {
        sortOrder: "invalid" as any,
      };

      await expect(useCase.execute(query)).rejects.toThrow(
        new GetEmissionsError("Sort order must be either asc or desc"),
      );
    });

    it("should accept valid sortBy values", async () => {
      const validSortBys = ["year", "value", "sector", "country"];

      mockRepository.findEmissions.mockResolvedValue([]);
      mockRepository.countEmissions.mockResolvedValue(0);

      for (const sortBy of validSortBys) {
        const query: GetEmissionsQuery = { sortBy: sortBy as any };
        await expect(useCase.execute(query)).resolves.toBeDefined();
      }
    });

    it("should accept valid sortOrder values", async () => {
      const validSortOrders = ["asc", "desc"];

      mockRepository.findEmissions.mockResolvedValue([]);
      mockRepository.countEmissions.mockResolvedValue(0);

      for (const sortOrder of validSortOrders) {
        const query: GetEmissionsQuery = { sortOrder: sortOrder as any };
        await expect(useCase.execute(query)).resolves.toBeDefined();
      }
    });
  });
});
