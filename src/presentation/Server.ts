import express from "express";
import { upload } from "../infrastructure/middleware/upload";
import { CsvImportController } from "./CsvImportController";
import { Request, Response, NextFunction } from "express";

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
    if (err.message) {
      res.status(400).json({ error: err.message });
      return;
    }

    console.error(err); // Log unhandled errors
    res.status(500).json({ error: "Internal server error" });
  }
}
