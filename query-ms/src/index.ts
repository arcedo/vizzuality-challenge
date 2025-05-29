import { Server } from "./presentation/Server";
import { GetEmissionsController } from "./presentation/GetEmissionsController";
import { GetEmissionsUseCase } from "./application/GetEmissionsUseCase";
import { PrismaEmissionQueryRepository } from "./infrastructure/PrismaEmissionsQueryRepository";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { GetStatusController } from "./presentation/GetStatusController";
import { GetStatusUseCase } from "./application/GetStatusUseCase";
import { PrismaStatusRepository } from "./infrastructure/PrismaStatusRepository";

export async function main(): Promise<void> {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const client = new PrismaClient();
  const emissionsQueryRepository = new PrismaEmissionQueryRepository(client);
  const getEmissionsUseCase = new GetEmissionsUseCase(emissionsQueryRepository);
  const getEmissionsController = new GetEmissionsController(
    getEmissionsUseCase,
  );
  const statusRepository = new PrismaStatusRepository(client);
  const getStatusUseCase = new GetStatusUseCase(statusRepository);
  const getStatusController = new GetStatusController(getStatusUseCase);
  await Server.run(PORT, getEmissionsController, getStatusController);
}

main();
