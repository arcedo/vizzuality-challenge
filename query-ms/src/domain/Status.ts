export class Status {
  public constructor(
    public readonly totalRecords: number,
    public readonly schemaVersion: string,
    public readonly lastImport: Date,
  ) {}
}
