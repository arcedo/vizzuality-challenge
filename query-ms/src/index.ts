import { Server } from "./presentation/Server";
import { GetEmissionsController } from "./presentation/GetEmissionsController";
import { GetEmissionsUseCase } from "./application/GetEmissionsUseCase";
import { PrismaEmissionQueryRepository } from "./infrastructure/PrismaEmissionsQueryRepository";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

export async function main(): Promise<void> {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const client = new PrismaClient();
  const emissionsQueryRepository = new PrismaEmissionQueryRepository(client);
  const getEmissionsUseCase = new GetEmissionsUseCase(emissionsQueryRepository);
  const getEmissionsController = new GetEmissionsController(
    getEmissionsUseCase,
  );
  await Server.run(PORT, getEmissionsController);
}

main();
