import { CsvParser } from "../src/application/ports/CsvParser";
import { RawCsvRow } from "../src/application/CsvImportService";
import { CsvImportService } from "../src/application/CsvImportService";
import { CsvParseError } from "../src/domain/errors/CsvParseError";

describe("CsvImportService", () => {
  let service: CsvImportService;
  let mockCsvParser: jest.Mocked<CsvParser<RawCsvRow>>;

  beforeEach(() => {
    mockCsvParser = {
      parse: jest.fn(),
    } as jest.Mocked<CsvParser<RawCsvRow>>;
    service = new CsvImportService(mockCsvParser);
  });

  it("should import CSV successfully", async () => {
    const filePath = "/fake/path/to/file.csv";

    mockCsvParser.parse.mockResolvedValue([
      {
        Country: "ESP",
        Sector: "Energy",
        "Parent sector": null,
        "2020": "0.98",
        "2021": "0.01",
      },
    ]);

    const result = await service.import(filePath);

    expect(mockCsvParser.parse).toHaveBeenCalledWith(filePath);
    expect(result).toBeDefined();
  });

  it("should throw an error for empty CSV", async () => {
    const filePath = "/fake/path/to/empty.csv";

    mockCsvParser.parse.mockResolvedValue([]);

    await expect(service.import(filePath)).rejects.toThrow(
      "CSV file is empty.",
    );
  });

  it("should handle CSV parse errors", async () => {
    const filePath = "/fake/path/to/invalid.csv";
    mockCsvParser.parse.mockRejectedValue(new CsvParseError("Invalid format"));

    await expect(service.import(filePath)).rejects.toThrow("Invalid format");
  });

  it("should throw an error for missing required fields", async () => {
    const filePath = "/fake/path/to/missing-fields.csv";

    mockCsvParser.parse.mockResolvedValue([
      {
        Country: "ESP",
        Sector: "",
        "Parent sector": null,
        "2020": "0.98",
        "2021": "0.01",
      },
    ]);

    await expect(service.import(filePath)).rejects.toThrow(
      "Row 1 is missing required fields: Country or Sector.",
    );
  });
});
