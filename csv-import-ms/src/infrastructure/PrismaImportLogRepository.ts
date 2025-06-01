import { PrismaClient } from "@prisma/client";
import { ImportLogRepository } from "../application/ports/ImportLogRepository";
import { RepositoryError } from "../domain/errors/RepositoryError";
import { PrismaTransaction } from "../types/prisma";

export class PrismaImportLogRepository implements ImportLogRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async addLog(
    totalRows: number,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const transaction = tx || this.client;
    try {
      await transaction.importLog.create({
        data: {
          totalRows,
        },
      });
    } catch (error) {
      console.error("Error adding import log:", error);
      throw new RepositoryError("Failed to add import log.");
    }
  }
}
