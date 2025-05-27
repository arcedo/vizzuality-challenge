import { Emission } from "../src/domain/Emission";
import { CreateEmissionsUseCase } from "../src/application/CreateEmissionsUseCase";
import { EmissionsRepository } from "../src/application/ports/EmissionsRepository";

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

    expect(mockEmissionRepo.import).toHaveBeenCalledWith(data);
    expect(mockEmissionRepo.import).toHaveBeenCalledTimes(1);
  });

  it("should not call the repository's import method if no emissions are provided", async () => {
    const data: Emission[] = [];

    await createEmissionsUseCase.execute(data);

    expect(mockEmissionRepo.import).toHaveBeenCalledWith([]);
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
});
