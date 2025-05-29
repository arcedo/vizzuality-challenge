import { Status } from "../../domain/Status";

export interface StatusRepository {
  getStatus(): Promise<Status>;
}
