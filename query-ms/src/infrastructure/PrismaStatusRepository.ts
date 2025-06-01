import { PrismaClient, Prisma } from "@prisma/client";
import { StatusRepository } from "../application/ports/StatusRepository";
import { Status } from "../domain/Status";
import { StatusError } from "../domain/errors/StatusError";

export class PrismaStatusRepository implements StatusRepository {
  public constructor(private readonly client: PrismaClient) {}

  async getStatus(): Promise<Status> {
    try {
      const totalRows = await this.client.emission.count();
      const result = await this.client.importLog.findFirst({
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
        },
      });

      if (!result) {
        throw new StatusError("No import logs found.");
      }

      return new Status(
        totalRows,
        Prisma.prismaVersion.client,
        result.createdAt,
      );
    } catch (error) {
      throw new StatusError("Failed to retrieve imported status.");
    }
  }
}
