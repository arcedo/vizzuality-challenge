import { Response, Request } from "express";
import { ResponseBuilder } from "./responses/ResponseBuilder";
import { GetStatusUseCase } from "../application/GetStatusUseCase";

export class GetStatusController {
  constructor(private readonly getStatusUseCase: GetStatusUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.getStatusUseCase.execute();
      res.status(200).json(ResponseBuilder.success(status));
    } catch (error) {
      console.error("Error during get status operation:", error);
      res
        .status(500)
        .json(
          ResponseBuilder.error(
            "Internal server error during get status operation.",
          ),
        );
    }
  }
}
