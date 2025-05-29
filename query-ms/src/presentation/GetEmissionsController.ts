import { Request, Response } from "express";
import { GetEmissionsUseCase } from "../application/GetEmissionsUseCase";
import { ResponseBuilder } from "./responses/ResponseBuilder";
import { GetEmissionsError } from "../domain/errors/GetEmissionsError";
import { GetEmissionsQuery } from "../application/dto/GetEmissionsQuery";

export class GetEmissionsController {
  public constructor(
    private readonly getEmissionsUseCase: GetEmissionsUseCase,
  ) {}

  public async handle(req: Request, res: Response): Promise<void> {
    try {
      const query = res.locals?.parsedQuery || req.query;
      const result = await this.getEmissionsUseCase.execute(
        query as GetEmissionsQuery,
      );

      res.status(200).json(ResponseBuilder.success(result));
    } catch (error) {
      if (error instanceof GetEmissionsError) {
        res.status(400).json(ResponseBuilder.error(error.message));
        return;
      }
      console.error("Error during get emissions operation:", error);
      res
        .status(500)
        .json(
          ResponseBuilder.error(
            "Internal server error during get emissions operation.",
          ),
        );
    }
  }
}
