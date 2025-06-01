// types/prisma.ts or at the top of your file
import { PrismaClient } from "@prisma/client";

export type PrismaTransaction = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];
