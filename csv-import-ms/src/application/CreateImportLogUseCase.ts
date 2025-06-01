import { ImportLogRepository } from "./ports/ImportLogRepository";

export class CreateImportLogUseCase {
  constructor(private readonly importLogRepository: ImportLogRepository) {}

  async execute(totalRows: number): Promise<void> {
    await this.importLogRepository.addLog(totalRows);
  }
}
