import { Sector } from "../domain/Sector";
import { Emission } from "../domain/Emission";
import { CreateEmissionsUseCase } from "./CreateEmissionsUseCase";
import { CreateSectorsUseCase } from "./CreateSectorsUseCase";
import { CsvParser } from "./ports/CsvParser";
import { randomUUID } from "crypto";

export interface RawCsvRow {
  country_code: string;
  sector: string;
  parent_sector: string | null;
  year: number;
  value: number;
}

export class CsvImportService {
  public constructor(
    private readonly csvParser: CsvParser<RawCsvRow>,
    private readonly createSectorUseCase: CreateSectorsUseCase,
    private readonly createEmissionsUseCase: CreateEmissionsUseCase,
  ) {}

  private extractData(rawRows: RawCsvRow[]): {
    sectors: Sector[];
    emissions: Emission[];
  } {
    const sectors: Sector[] = [];
    const emissions: Emission[] = [];

    for (const row of rawRows) {
      const id = randomUUID();
      const sector = new Sector(
        id,
        row.sector,
        row.country_code,
        row.parent_sector,
      );
      sectors.push(sector);

      const emission = new Emission(id, row.year, row.value);
      emissions.push(emission);
    }

    return { sectors, emissions };
  }

  public async import(filePath: string): Promise<void> {
    const rawRows = await this.csvParser.parse(filePath);
    const { sectors, emissions } = this.extractData(rawRows);

    await this.createSectorUseCase.execute(sectors);
    await this.createEmissionsUseCase.execute(emissions);
  }
}
