export class EmissionStats {
  public constructor(
    public readonly emissionValues: {
      min: number;
      max: number;
    },
    public readonly yearRange: {
      min: number;
      max: number;
    },
    public readonly totalEmissions: number,
  ) {}
}

export class SectorStats {
  public constructor(
    public readonly totalCountries: number,
    public readonly totalSectors: number,
  ) {}
}

export class ImportStats {
  public constructor(
    public readonly sectors: SectorStats,
    public readonly emissions: EmissionStats,
  ) {}
}
