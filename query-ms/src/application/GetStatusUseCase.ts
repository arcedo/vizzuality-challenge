import { StatusRepository } from "./ports/StatusRepository";
import { Status } from "../domain/Status";

export class GetStatusUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  async execute(): Promise<Status> {
    try {
      return await this.statusRepository.getStatus();
    } catch (error) {
      console.error("Error during get status operation:", error);
      throw new Error("Internal server error during get status operation");
    }
  }
}
