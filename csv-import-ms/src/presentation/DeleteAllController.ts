import { Request, Response } from "express";
import { DeleteAllUseCase } from "../application/DeleteAllUseCase";
import { ResponseBuilder } from "./responses/ResponseBuilder";
import { RepositoryError } from "../domain/errors/RepositoryError";

export class DeleteAllController {
  public constructor(private readonly deleteAllUseCase: DeleteAllUseCase) {}

  public async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.deleteAllUseCase.execute();
      res.status(200).json(
        ResponseBuilder.success({
          message: "All sectors and emissions deleted successfully.",
          data: result,
        }),
      );
    } catch (error) {
      if (error instanceof RepositoryError) {
        res.status(400).json(ResponseBuilder.error(error.message));
        return;
      }
      console.error("Error during delete all operation:", error);
      res
        .status(500)
        .json(
          ResponseBuilder.error(
            "Internal server error during delete all operation.",
          ),
        );
    }
  }
}
