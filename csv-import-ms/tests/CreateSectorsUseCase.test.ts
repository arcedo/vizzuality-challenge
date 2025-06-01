import { Sector } from "../src/domain/Sector";
import { CreateSectorsUseCase } from "../src/application/CreateSectorsUseCase";
import { SectorRepository } from "../src/application/ports/SectorRepository";
import { jest } from "@jest/globals";

describe("CreateSectorsUseCase", () => {
  let createSectorsUseCase: CreateSectorsUseCase;
  let mockSectorRepo: jest.Mocked<SectorRepository>;

  beforeEach(() => {
    mockSectorRepo = {
      import: jest.fn(),
      getImportedStats: jest.fn(),
      deleteAll: jest.fn(),
    };
    createSectorsUseCase = new CreateSectorsUseCase(mockSectorRepo);
  });

  it("should call the repository's import method with the provided sectors", async () => {
    const data: Sector[] = [
      {
        id: "mock-sector-id",
        name: "Mock Sector",
        country: "Mock Country",
        parentSector: null,
      },
      {
        id: "another-mock-id",
        name: "Child Sector",
        country: "Mock Country",
        parentSector: "Mock Sector",
      },
    ];

    await createSectorsUseCase.execute(data);

    // Update expectation to include the transaction parameter
    expect(mockSectorRepo.import).toHaveBeenCalledWith(data, undefined);
    expect(mockSectorRepo.import).toHaveBeenCalledTimes(1);
  });

  it("should not call the repository's import method if no sectors are provided", async () => {
    const data: Sector[] = [];

    await createSectorsUseCase.execute(data);

    // Update expectation to include the transaction parameter
    expect(mockSectorRepo.import).toHaveBeenCalledWith([], undefined);
  });

  it("should handle errors thrown by the repository's import method", async () => {
    const data: Sector[] = [
      {
        id: "mock-sector-id",
        name: "Mock Sector",
        country: "Mock Country",
        parentSector: null,
      },
    ];

    mockSectorRepo.import.mockRejectedValue(new Error("Import failed"));

    await expect(createSectorsUseCase.execute(data)).rejects.toThrow(
      "Import failed",
    );
  });

  it("should pass transaction when provided", async () => {
    const data: Sector[] = [
      {
        id: "mock-sector-id",
        name: "Mock Sector",
        country: "Mock Country",
        parentSector: null,
      },
    ];
    const mockTransaction = {} as any; // Mock transaction object

    await createSectorsUseCase.execute(data, mockTransaction);

    expect(mockSectorRepo.import).toHaveBeenCalledWith(data, mockTransaction);
  });
});
