import { GetStatsUseCase } from "../src/application/GetStatsUseCase";
import { SectorRepository } from "../src/application/ports/SectorRepository";
import { EmissionsRepository } from "../src/application/ports/EmissionsRepository";
import { EmissionStats, ImportStats, SectorStats } from "../src/domain/Stats";

describe("GetStatsUseCase", () => {
  let useCase: GetStatsUseCase;
  let mockSectorRepo: jest.Mocked<SectorRepository>;
  let mockEmissionsRepo: jest.Mocked<EmissionsRepository>;

  beforeEach(() => {
    mockSectorRepo = {
      import: jest.fn(),
      getImportedStats: jest.fn(),
      deleteAll: jest.fn(),
    } as jest.Mocked<SectorRepository>;

    mockEmissionsRepo = {
      import: jest.fn(),
      getImportedStats: jest.fn(),
      deleteAll: jest.fn(),
    } as jest.Mocked<EmissionsRepository>;

    useCase = new GetStatsUseCase(mockSectorRepo, mockEmissionsRepo);
  });

  it("should return import stats successfully", async () => {
    // Arrange
    const mockSectorStats: SectorStats = {
      totalCountries: 5,
      totalSectors: 10,
    };
    const mockEmissionStats: EmissionStats = {
      emissionValues: { max: 100, min: 0.01 },
      yearRange: { max: 2025, min: 2024 },
      totalEmissions: 100,
    };

    mockSectorRepo.getImportedStats.mockResolvedValue(mockSectorStats);
    mockEmissionsRepo.getImportedStats.mockResolvedValue(mockEmissionStats);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(mockSectorRepo.getImportedStats).toHaveBeenCalledTimes(1);
    expect(mockEmissionsRepo.getImportedStats).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(ImportStats);
    // Note: Add specific assertions based on your ImportStats implementation
  });

  it("should handle empty stats", async () => {
    // Arrange
    const emptySectorStats: SectorStats = {
      totalCountries: 0,
      totalSectors: 0,
    };
    const emptyEmissionStats: EmissionStats = {
      emissionValues: { max: 0, min: 0 },
      yearRange: { max: 0, min: 0 },
      totalEmissions: 0,
    };

    mockSectorRepo.getImportedStats.mockResolvedValue(emptySectorStats);
    mockEmissionsRepo.getImportedStats.mockResolvedValue(emptyEmissionStats);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toBeInstanceOf(ImportStats);
    // Add assertions based on how ImportStats handles empty data
  });

  it("should handle sector repository error", async () => {
    // Arrange
    const error = new Error("Sector stats query failed");
    mockSectorRepo.getImportedStats.mockRejectedValue(error);
    mockEmissionsRepo.getImportedStats.mockResolvedValue({
      emissionValues: { max: 0, min: 0 },
      yearRange: { max: 0, min: 0 },
      totalEmissions: 0,
    });

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow(
      "Sector stats query failed",
    );
  });

  it("should handle emissions repository error", async () => {
    // Arrange
    const error = new Error("Emissions stats query failed");
    mockSectorRepo.getImportedStats.mockResolvedValue({
      totalCountries: 0,
      totalSectors: 0,
    });
    mockEmissionsRepo.getImportedStats.mockRejectedValue(error);

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow(
      "Emissions stats query failed",
    );
  });

  it("should handle both repositories failing", async () => {
    const sectorError = new Error("Sector error");
    const emissionError = new Error("Emission error");

    mockSectorRepo.getImportedStats.mockRejectedValue(sectorError);
    mockEmissionsRepo.getImportedStats.mockRejectedValue(emissionError);

    await expect(useCase.execute()).rejects.toThrow();
  });
});
