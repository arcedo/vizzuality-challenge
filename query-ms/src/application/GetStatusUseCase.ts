import { StatusRepository } from "./ports/StatusRepository";
import { Status } from "../domain/Status";
import { StatusError } from "../domain/errors/StatusError";

export class GetStatusUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  async execute(): Promise<Status> {
    try {
      return await this.statusRepository.getStatus();
    } catch (error) {
      if (error instanceof StatusError) {
        throw error; // Re-throw the specific StatusError
      }

      throw new Error("Internal server error during get status operation");
    }
  }
}
