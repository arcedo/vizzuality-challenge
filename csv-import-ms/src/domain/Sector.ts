export class Sector {
  public constructor(
    public readonly id: string,
    public readonly country: string,
    public readonly name: string,
    public readonly parentSector: string | null,
  ) {}
}
