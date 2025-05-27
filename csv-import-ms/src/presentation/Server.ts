import express from "express";
import rateLimit from "express-rate-limit";
import { upload } from "../infrastructure/middleware/upload";
import { CsvImportController } from "./CsvImportController";
import { Request, Response, NextFunction } from "express";
import { CsvParseError } from "../domain/errors/CsvParseError";
import { ResponseBuilder } from "./responses/ResponseBuilder";
import { DeleteAllController } from "./DeleteAllController";

export class Server {
  public static async run(
    port: number,
    importController: CsvImportController,
    deleteController: DeleteAllController,
  ): Promise<void> {
    const app = express();
    app.use(express.json());

    const limiter = rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);

    const importLimiter = rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
    });

    const router = express.Router();

    router.post("/import", importLimiter, upload.single("file"), (req, res) =>
      importController.handle(req, res),
    );

    router.delete("/delete-all", (req, res) =>
      deleteController.handle(req, res),
    );

    app.use("/api", router);

    app.use(this.errorHandler);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }

  private static errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (err instanceof CsvParseError) {
      res.status(400).json(ResponseBuilder.error(err.message));
      return;
    }

    console.error(err);
    res.status(500).json(ResponseBuilder.error("Internal server error."));
  }
}
