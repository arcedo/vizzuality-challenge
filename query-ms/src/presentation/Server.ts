import express from "express";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { GetEmissionsController } from "./GetEmissionsController";
import { GetStatusController } from "./GetStatusController";
import { parseQueryOperators } from "../infrastructure/middleware/queryParser";

export class Server {
  public static async run(
    port: number,
    getEmissionsController: GetEmissionsController,
    getStatusController: GetStatusController,
  ): Promise<void> {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    const limiter = rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);

    const router = express.Router();

    router.get(
      "/emissions",
      parseQueryOperators,
      async (req: Request, res: Response) =>
        getEmissionsController.handle(req, res),
    );

    router.get("/status", async (req: Request, res: Response) =>
      getStatusController.handle(req, res),
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
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
}
