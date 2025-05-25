import { Sector } from "../domain/Sector";
import { Emission } from "../domain/Emission";
import { CsvParser } from "./ports/CsvParser";
import { CsvParseError } from "../domain/errors/CsvParseError";
import { randomUUID } from "crypto";

export interface RawCsvRow {
  Country: string;
  Sector: string;
  "Parent sector": string | null;
  [year: string]: string | null;
}

export class CsvImportService {
  public constructor(private readonly csvParser: CsvParser<RawCsvRow>) {}

  public async import(filePath: string): Promise<{
    sectors: Sector[];
    emissions: Emission[];
  }> {
    const rawRows = await this.csvParser.parse(filePath);

    if (rawRows.length === 0) {
      throw new CsvParseError("CSV file is empty.");
    }

    return this.extractData(rawRows);
  }

  private extractData(rawRows: RawCsvRow[]): {
    sectors: Sector[];
    emissions: Emission[];
  } {
    const sectors: Sector[] = [];
    const emissions: Emission[] = [];

    for (const [index, row] of rawRows.entries()) {
      if (!row.Country || !row.Sector) {
        throw new CsvParseError(
          `Row ${index + 1} is missing required fields: Country or Sector.`,
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
        throw new CsvParseError(`Row ${index + 1} has no valid year columns.`);
        continue;
      }

      for (const [year, value] of yearColumns) {
        const parsedValue = parseFloat(value ?? "");
        const parsedYear = Number(year);
        if (isNaN(parsedYear)) {
          throw new CsvParseError(
            `Invalid year ${year} for ${row.Country} ${row.Sector}, must be number.`,
          );
        }
        if (isNaN(parsedValue)) {
          throw new CsvParseError(
            `Invalid value ${value} for year ${year} in row ${index + 1}, must be a number.`,
          );
        }
        const emission = new Emission(sector.id, parsedYear, parsedValue);
        emissions.push(emission);
      }
    }

    return {
      sectors,
      emissions,
    };
  }

  private getYearColumns(row: RawCsvRow): [string, string][] {
    const excludedKeys = new Set(["Country", "Sector", "Parent sector"]);
    return Object.entries(row)
      .filter(([key]) => !excludedKeys.has(key))
      .map(([year, value]) => [year, value ?? ""] as [string, string]);
  }
}
