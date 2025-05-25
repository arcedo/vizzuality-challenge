import fs from "fs/promises";
import { Request, Response } from "express";
import { CreateEmissionsUseCase } from "../application/CreateEmissionsUseCase";
import { CreateSectorsUseCase } from "../application/CreateSectorsUseCase";
import { CsvImportService } from "../application/CsvImportService";

export class CsvImportController {
  public constructor(
    private readonly csvImportService: CsvImportService,
    private readonly createSectorsUseCase: CreateSectorsUseCase,
    private readonly createEmissionsUseCase: CreateEmissionsUseCase,
  ) {}

  public async handle(req: Request, res: Response): Promise<void> {
    try {
      const filePath = req.file?.path;
      if (!filePath) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      const { sectors, emissions, validationResult } =
        await this.csvImportService.import(filePath);

      if (!validationResult.isValid) {
        res.status(400).json({ error: validationResult.errors });
        return;
      }

      if (!(await this.createSectorsUseCase.execute(sectors))) {
        res.status(500).json({ error: "Failed to create sectors." });
        return;
      }

      if (!(await this.createEmissionsUseCase.execute(emissions))) {
        res.status(500).json({ error: "Failed to create emissions." });
        return;
      }

      await fs.unlink(filePath);

      res.status(200).json({
        data: {
          recordCount: {
            sectors: sectors.length,
            emissions: emissions.length,
          },
        },
        message: "Data imported successfully.",
      });
    } catch (error) {
      console.error("Error during CSV import:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
}
