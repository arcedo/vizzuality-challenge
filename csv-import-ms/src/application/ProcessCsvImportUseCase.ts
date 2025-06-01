import { PrismaClient } from "@prisma/client";
import { CreateSectorsUseCase } from "./CreateSectorsUseCase";
import { CreateEmissionsUseCase } from "./CreateEmissionsUseCase";
import { CreateImportLogUseCase } from "./CreateImportLogUseCase";
import { GetStatsUseCase } from "./GetStatsUseCase";
import { Sector } from "../domain/Sector";
import { Emission } from "../domain/Emission";
import { ImportStats } from "../domain/Stats";

export class ProcessCsvImportUseCase {
  private readonly BATCH_SIZE = 10000;

  constructor(
    private readonly client: PrismaClient,
    private readonly createSectorsUseCase: CreateSectorsUseCase,
    private readonly createEmissionsUseCase: CreateEmissionsUseCase,
    private readonly createImportLogUseCase: CreateImportLogUseCase,
    private readonly getStatsUseCase: GetStatsUseCase,
  ) {}

  async execute(
    sectors: Sector[],
    emissions: Emission[],
  ): Promise<ImportStats> {
    const totalRecords = sectors.length + emissions.length;

    if (totalRecords <= this.BATCH_SIZE) {
      return await this.processSingleTransaction(sectors, emissions); // Single transaction for small datasets
    } else {
      return await this.processBatched(sectors, emissions); // Batched processing for large datasets, with transactions each batch
    }
  }

  private async processSingleTransaction(
    sectors: Sector[],
    emissions: Emission[],
  ): Promise<ImportStats> {
    return await this.client.$transaction(
      async (tx) => {
        await this.createSectorsUseCase.execute(sectors, tx);
        await this.createEmissionsUseCase.execute(emissions, tx);
        await this.createImportLogUseCase.execute(emissions.length, tx);
        return await this.getStatsUseCase.execute(tx);
      },
      {
        maxWait: 30000, // 30 seconds
        timeout: 60000, // 60 seconds
      },
    );
  }

  private async processBatched(
    sectors: Sector[],
    emissions: Emission[],
  ): Promise<ImportStats> {
    console.log(
      `Processing large dataset: ${sectors.length} sectors, ${emissions.length} emissions`,
    );
    await this.processSectorsInBatches(sectors);
    await this.processEmissionsInBatches(emissions);
    await this.createImportLogUseCase.execute(emissions.length);
    return await this.getStatsUseCase.execute();
  }

  private async processSectorsInBatches(sectors: Sector[]): Promise<void> {
    const totalBatches = Math.ceil(sectors.length / this.BATCH_SIZE); // Calculate total number of batches

    for (let i = 0; i < sectors.length; i += this.BATCH_SIZE) {
      const batch = sectors.slice(i, i + this.BATCH_SIZE); // Slice the array into batches
      const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1; // Calculate current batch number

      await this.client.$transaction(async (tx) => {
        await this.createSectorsUseCase.execute(batch, tx);
      });

      console.log(
        ` - ✅ Sectors batch ${batchNumber}/${totalBatches} completed (${batch.length} records)`,
      );
    }
    console.log(
      `✅ All sectors batches processed successfully (${sectors.length} total records)`,
    );
  }

  private async processEmissionsInBatches(
    emissions: Emission[],
  ): Promise<void> {
    const totalBatches = Math.ceil(emissions.length / this.BATCH_SIZE);

    for (let i = 0; i < emissions.length; i += this.BATCH_SIZE) {
      const batch = emissions.slice(i, i + this.BATCH_SIZE);
      const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;

      await this.client.$transaction(async (tx) => {
        await this.createEmissionsUseCase.execute(batch, tx);
      });

      console.log(
        ` - ✅ Emissions batch ${batchNumber}/${totalBatches} completed (${batch.length} records)`,
      );
    }
    console.log(
      `✅ All emissions batches processed successfully (${emissions.length} total records)`,
    );
  }
}
