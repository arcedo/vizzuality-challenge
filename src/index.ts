import { Server } from "./presentation/Server";
import { CsvImportController } from "./presentation/CsvImportController";
import { CsvImportService, RawCsvRow } from "./application/CsvImportService";
import { CreateSectorsUseCase } from "./application/CreateSectorsUseCase";
import { CreateEmissionsUseCase } from "./application/CreateEmissionsUseCase";
import { FastCsvParser } from "./infrastructure/parsers/FastCsvParser";
import { PrismaSectorRepository } from "./infrastructure/PrismaSectorRepository";
import { PrismaEmissionRepository } from "./infrastructure/PrismaEmissionRepository";
import { PrismaClient } from "@prisma/client";

const PORT = 3000;

export async function main(): Promise<void> {
  const client = new PrismaClient();
  const csvParser = new FastCsvParser<RawCsvRow>();
  const sectorRepository = new PrismaSectorRepository(client);
  const emissionsRepository = new PrismaEmissionRepository(client);
  const csvImportService = new CsvImportService(csvParser);
  const createSectorsUseCase = new CreateSectorsUseCase(sectorRepository);
  const createEmissionsUseCase = new CreateEmissionsUseCase(
    emissionsRepository,
  );
  const importController = new CsvImportController(
    csvImportService,
    createSectorsUseCase,
    createEmissionsUseCase,
  );

  await Server.run(PORT, importController);
}

main();
