import { PrismaClient } from "@prisma/client";
import { ImportLogRepository } from "../application/ports/ImportLogRepository";
import { RepositoryError } from "../domain/errors/RepositoryError";

export class PrismaImportLogRepository implements ImportLogRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async addLog(totalRows: number): Promise<void> {
    try {
      await this.client.importLog.create({
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
