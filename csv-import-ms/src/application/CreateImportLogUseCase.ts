import { PrismaTransaction } from "../types/prisma";
import { ImportLogRepository } from "./ports/ImportLogRepository";

export class CreateImportLogUseCase {
  constructor(private readonly importLogRepository: ImportLogRepository) {}

  async execute(totalRows: number, tx?: PrismaTransaction): Promise<void> {
    await this.importLogRepository.addLog(totalRows);
  }
}
