import { PrismaTransaction } from "../../types/prisma";

export interface ImportLogRepository {
  addLog(totalRows: number, tx?: PrismaTransaction): Promise<void>;
}
