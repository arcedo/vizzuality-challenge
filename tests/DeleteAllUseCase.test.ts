import { DeleteAllUseCase } from "../src/application/DeleteAllUseCase";
import { SectorRepository } from "../src/application/ports/SectorRepository";
import { EmissionsRepository } from "../src/application/ports/EmissionsRepository";

describe("DeleteAllUseCase", () => {
  let useCase: DeleteAllUseCase;
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

    useCase = new DeleteAllUseCase(mockSectorRepo, mockEmissionsRepo);
  });

  it("should delete all emissions and sectors successfully", async () => {
    mockEmissionsRepo.deleteAll.mockResolvedValue(10);
    mockSectorRepo.deleteAll.mockResolvedValue(5);

    const result = await useCase.execute();

    expect(mockEmissionsRepo.deleteAll).toHaveBeenCalledTimes(1);
    expect(mockSectorRepo.deleteAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      sectorsDeleted: 5,
      emissionsDeleted: 10,
    });
  });

  it("should handle zero deletions", async () => {
    mockEmissionsRepo.deleteAll.mockResolvedValue(0);
    mockSectorRepo.deleteAll.mockResolvedValue(0);

    const result = await useCase.execute();

    expect(result).toEqual({
      sectorsDeleted: 0,
      emissionsDeleted: 0,
    });
  });

  it("should call emissions repository before sectors repository", async () => {
    const executionOrder: string[] = [];

    mockEmissionsRepo.deleteAll.mockImplementation(async () => {
      executionOrder.push("emissions");
      return 5;
    });

    mockSectorRepo.deleteAll.mockImplementation(async () => {
      executionOrder.push("sectors");
      return 3;
    });

    await useCase.execute();

    expect(executionOrder).toEqual(["emissions", "sectors"]);
  });

  it("should handle emissions repository error", async () => {
    const error = new Error("Database connection failed");
    mockEmissionsRepo.deleteAll.mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow(
      "Database connection failed",
    );

    expect(mockSectorRepo.deleteAll).not.toHaveBeenCalled();
  });

  it("should handle sectors repository error", async () => {
    mockEmissionsRepo.deleteAll.mockResolvedValue(10);
    const error = new Error("Sector deletion failed");
    mockSectorRepo.deleteAll.mockRejectedValue(error);

    await expect(useCase.execute()).rejects.toThrow("Sector deletion failed");

    expect(mockEmissionsRepo.deleteAll).toHaveBeenCalledTimes(1);
  });
});
