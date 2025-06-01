import fs from "fs";
import fsPromis from "fs/promises";
import { Request, Response } from "express";
import { CsvImportService } from "../application/CsvImportService";
import { CsvParseError } from "../domain/errors/CsvParseError";
import { RepositoryError } from "../domain/errors/RepositoryError";
import { ResponseBuilder } from "./responses/ResponseBuilder";
import { ProcessCsvImportUseCase } from "../application/ProcessCsvImportUseCase";
import { performance } from "perf_hooks";

export class CsvImportController {
  public constructor(
    private readonly csvImportService: CsvImportService,
    private readonly processCsvImportUseCase: ProcessCsvImportUseCase,
  ) {}

  public async handle(req: Request, res: Response): Promise<void> {
    const filePath = req.file?.path;
    if (!filePath) {
      res.status(400).json(ResponseBuilder.error("No file uploaded."));
      return;
    }
    const startTime = performance.now();
    try {
      const { sectors, emissions } =
        await this.csvImportService.import(filePath);
      const importDuration = ((performance.now() - startTime) / 1000).toFixed(
        2,
      );

      const transactionStartTime = performance.now();
      const stats = await this.processCsvImportUseCase.execute(
        sectors,
        emissions,
      );
      const transactionDuration = (
        (performance.now() - transactionStartTime) /
        1000
      ).toFixed(2);

      await fsPromis.unlink(filePath);

      const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);

      res.status(200).json(
        ResponseBuilder.success({
          message: "CSV import successful.",
          stats: stats,
          performance: {
            totalDuration: totalDuration + "s",
            importDuration: importDuration + "s",
            transactionDuration: transactionDuration + "s",
          },
        }),
      );
    } catch (error) {
      if (fs.existsSync(filePath)) {
        await fsPromis.unlink(filePath);
      }
      if (error instanceof CsvParseError) {
        res.status(400).json(ResponseBuilder.csvParseError(error.message));
        return;
      } else if (error instanceof RepositoryError) {
        res.status(500).json(ResponseBuilder.repositoryError(error.message));
        return;
      }

      console.error("Error during CSV import:", error);
      res
        .status(500)
        .json(
          ResponseBuilder.error("Internal server error during CSV import."),
        );
    }
  }
}
