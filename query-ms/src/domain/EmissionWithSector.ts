export class EmissionWithSector {
  public constructor(
    public readonly year: number,
    public readonly value: number,
    public readonly sector: string,
    public readonly country: string,
    public readonly parentSector: string | null,
  ) {}
}
