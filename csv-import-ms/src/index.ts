import { Server } from "./presentation/Server";
import { CsvImportController } from "./presentation/CsvImportController";
import { DeleteAllController } from "./presentation/DeleteAllController";
import { CsvImportService, RawCsvRow } from "./application/CsvImportService";
import { CreateSectorsUseCase } from "./application/CreateSectorsUseCase";
import { CreateEmissionsUseCase } from "./application/CreateEmissionsUseCase";
import { CreateImportLogUseCase } from "./application/CreateImportLogUseCase";
import { DeleteAllUseCase } from "./application/DeleteAllUseCase";
import { FastCsvParser } from "./infrastructure/parsers/FastCsvParser";
import { PrismaSectorRepository } from "./infrastructure/PrismaSectorRepository";
import { PrismaEmissionRepository } from "./infrastructure/PrismaEmissionRepository";
import { PrismaImportLogRepository } from "./infrastructure/PrismaImportLogRepository";
import { GetStatsUseCase } from "./application/GetStatsUseCase";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

export async function main(): Promise<void> {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const client = new PrismaClient();
  const csvParser = new FastCsvParser<RawCsvRow>();
  const sectorRepository = new PrismaSectorRepository(client);
  const emissionsRepository = new PrismaEmissionRepository(client);
  const importLogRepository = new PrismaImportLogRepository(client);
  const csvImportService = new CsvImportService(csvParser);
  const createSectorsUseCase = new CreateSectorsUseCase(sectorRepository);
  const createEmissionsUseCase = new CreateEmissionsUseCase(
    emissionsRepository,
  );
  const getStatsUseCase = new GetStatsUseCase(
    sectorRepository,
    emissionsRepository,
  );
  const createImportLogUseCase = new CreateImportLogUseCase(
    importLogRepository,
  );
  const importController = new CsvImportController(
    csvImportService,
    createSectorsUseCase,
    createEmissionsUseCase,
    getStatsUseCase,
    createImportLogUseCase,
  );
  const deleteAllUseCase = new DeleteAllUseCase(
    sectorRepository,
    emissionsRepository,
  );
  const deleteController = new DeleteAllController(deleteAllUseCase);
  await Server.run(PORT, importController, deleteController);
}

main();
