export interface ImportLogRepository {
  addLog(totalRows: number): Promise<void>;
}
