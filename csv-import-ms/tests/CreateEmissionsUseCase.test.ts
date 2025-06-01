import { Emission } from "../src/domain/Emission";
import { CreateEmissionsUseCase } from "../src/application/CreateEmissionsUseCase";
import { EmissionsRepository } from "../src/application/ports/EmissionsRepository";
import { jest } from "@jest/globals";

describe("CreateEmissionsUseCase", () => {
  let createEmissionsUseCase: CreateEmissionsUseCase;
  let mockEmissionRepo: jest.Mocked<EmissionsRepository>;

  beforeEach(() => {
    mockEmissionRepo = {
      import: jest.fn(),
      getImportedStats: jest.fn(),
      deleteAll: jest.fn(),
    };
    createEmissionsUseCase = new CreateEmissionsUseCase(mockEmissionRepo);
  });

  it("should call the repository's import method with the provided emissions", async () => {
    const data: Emission[] = [
      { idSector: "mock-sector-id", value: 100, year: 2020 },
      { idSector: "another-mock-id", value: 0.51, year: 2021 },
    ];

    await createEmissionsUseCase.execute(data);

    // Update expectation to include the transaction parameter (undefined when no tx passed)
    expect(mockEmissionRepo.import).toHaveBeenCalledWith(data, undefined);
    expect(mockEmissionRepo.import).toHaveBeenCalledTimes(1);
  });

  it("should not call the repository's import method if no emissions are provided", async () => {
    const data: Emission[] = [];

    await createEmissionsUseCase.execute(data);

    // Update expectation to include the transaction parameter
    expect(mockEmissionRepo.import).toHaveBeenCalledWith([], undefined);
  });

  it("should handle errors thrown by the repository's import method", async () => {
    const data: Emission[] = [
      { idSector: "mock-sector-id", value: 100, year: 2020 },
    ];

    mockEmissionRepo.import.mockRejectedValue(new Error("Import failed"));

    await expect(createEmissionsUseCase.execute(data)).rejects.toThrow(
      "Import failed",
    );
  });

  it("should pass transaction when provided", async () => {
    const data: Emission[] = [
      { idSector: "mock-sector-id", value: 100, year: 2020 },
    ];
    const mockTransaction = {} as any; // Mock transaction object

    await createEmissionsUseCase.execute(data, mockTransaction);

    expect(mockEmissionRepo.import).toHaveBeenCalledWith(data, mockTransaction);
  });
});
