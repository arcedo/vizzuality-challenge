import { Sector } from "../domain/Sector";
import { Emission } from "../domain/Emission";
import { CreateEmissionsUseCase } from "./CreateEmissionsUseCase";
import { CreateSectorsUseCase } from "./CreateSectorsUseCase";
import { CsvParser } from "./ports/CsvParser";
import { ValidationResult } from "../domain/shared/ValidationResult";
import { randomUUID } from "crypto";

export interface RawCsvRow {
  Country: string;
  Sector: string;
  "Parent sector": string | null;
  [year: string]: string | null;
}

export class CsvImportService {
  public constructor(
    private readonly csvParser: CsvParser<RawCsvRow>,
    private readonly createSectorUseCase: CreateSectorsUseCase,
    private readonly createEmissionsUseCase: CreateEmissionsUseCase,
  ) {}

  public async import(
    filePath: string,
  ): Promise<{ sectors: Sector[]; emissions: Emission[] }> {
    const rawRows = await this.csvParser.parse(filePath);
    return this.extractData(rawRows);
  }

  private extractData(rawRows: RawCsvRow[]): {
    sectors: Sector[];
    emissions: Emission[];
    validationResult: ValidationResult;
  } {
    if (rawRows.length === 0) {
      return {
        sectors: [],
        emissions: [],
        validationResult: ValidationResult.error("No data found in CSV file."),
      };
    }

    const sectors: Sector[] = [];
    const emissions: Emission[] = [];
    const errors: string[] = [];

    for (const [index, row] of rawRows.entries()) {
      if (!row.Country || !row.Sector) {
        errors.push(
          `Row ${index + 1} missing required fields: ${JSON.stringify(row)}`,
        );
        continue;
      }

      const sector = new Sector(
        randomUUID(),
        row.Country,
        row.Sector,
        row["Parent sector"] ?? null,
      );
      sectors.push(sector);

      const yearColumns = this.getYearColumns(row);
      if (yearColumns.length === 0) {
        errors.push(
          `Row ${index + 1} has no valid year columns: ${JSON.stringify(row)}`,
        );
        continue;
      }

      for (const [year, value] of yearColumns) {
        if (isNaN(value)) {
          errors.push(
            `Invalid value for year ${year} in row ${index + 1}: ${JSON.stringify(row)}`,
          );
          continue;
        }
        const emission = new Emission(sector.id, year, value);
        emissions.push(emission);
      }
    }

    return {
      sectors,
      emissions,
      validationResult:
        errors.length > 0
          ? ValidationResult.fromErrors(errors)
          : ValidationResult.success(),
    };
  }

  private getYearColumns(row: RawCsvRow): [number, number][] {
    return Object.entries(row)
      .filter(([key]) => /^\d{4}$/.test(key))
      .map(
        ([year, value]) =>
          [Number(year), parseFloat(value ?? "")] as [number, number],
      )
      .filter(([, value]) => !isNaN(value));
  }
}
