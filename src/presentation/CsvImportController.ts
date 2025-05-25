import fs from "fs";
import fsPromis from "fs/promises";
import { Request, Response } from "express";
import { CreateEmissionsUseCase } from "../application/CreateEmissionsUseCase";
import { CreateSectorsUseCase } from "../application/CreateSectorsUseCase";
import { CsvImportService } from "../application/CsvImportService";
import { CsvParseError } from "../domain/errors/CsvParseError";
import { RepositoryError } from "../domain/errors/RepositoryError";
import { ResponseBuilder } from "./responses/ResponseBuilder";

export class CsvImportController {
  public constructor(
    private readonly csvImportService: CsvImportService,
    private readonly createSectorsUseCase: CreateSectorsUseCase,
    private readonly createEmissionsUseCase: CreateEmissionsUseCase,
  ) {}

  public async handle(req: Request, res: Response): Promise<void> {
    const filePath = req.file?.path;
    if (!filePath) {
      res.status(400).json(ResponseBuilder.error("No file uploaded."));
      return;
    }
    try {
      const { sectors, emissions } =
        await this.csvImportService.import(filePath);
      // TODO: maybe we should do a transaction here to ensure both sectors and emissions are created successfully
      // if one fails, we should rollback the other :/
      await this.createSectorsUseCase.execute(sectors);

      await this.createEmissionsUseCase.execute(emissions);

      await fsPromis.unlink(filePath);

      res.status(200).json(
        ResponseBuilder.success({
          message: "CSV import successful.",
          sectorsCreated: sectors.length,
          emissionsCreated: emissions.length,
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
