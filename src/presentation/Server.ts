import express from "express";
import { upload } from "../infrastructure/middleware/upload";
import { CsvImportController } from "./CsvImportController";
import { Request, Response, NextFunction } from "express";
import { CsvParseError } from "../domain/errors/CsvParseError";
import { ResponseBuilder } from "./responses/ResponseBuilder";

export class Server {
  public static async run(
    port: number,
    importController: CsvImportController,
  ): Promise<void> {
    const app = express();
    app.use(express.json());

    const router = express.Router();

    router.post("/import", upload.single("file"), (req, res) =>
      importController.handle(req, res),
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
