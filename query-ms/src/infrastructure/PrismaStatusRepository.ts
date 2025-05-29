import packajeJson from "../../package.json";
import { PrismaClient } from "@prisma/client";
import { StatusRepository } from "../application/ports/StatusRepository";
import { Status } from "../domain/Status";

export class PrismaStatusRepository implements StatusRepository {
  public constructor(private readonly client: PrismaClient) {}

  async getStatus(): Promise<Status> {
    const totalRecords = await this.client.emission.count();

    return new Status(totalRecords, packajeJson.version);
  }
}
