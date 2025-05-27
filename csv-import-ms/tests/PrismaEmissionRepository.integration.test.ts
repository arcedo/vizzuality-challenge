import { PrismaClient } from "@prisma/client";
import { Emission } from "../src/domain/Emission";
import { PrismaEmissionRepository } from "../src/infrastructure/PrismaEmissionRepository";
import { randomUUID } from "crypto";

describe("PrismaEmissionRepository Integration", () => {
  let prisma: PrismaClient;
  let repository: PrismaEmissionRepository;
  let mockSectorId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();

    await prisma.$connect();

    repository = new PrismaEmissionRepository(prisma);

    await prisma.emission.deleteMany();
    await prisma.sector.deleteMany();
  });

  beforeEach(async () => {
    await prisma.emission.deleteMany();
    await prisma.sector.deleteMany();

    mockSectorId = randomUUID();
    await prisma.sector.create({
      data: {
        id: mockSectorId,
        name: "Energy",
        country: "Testland",
      },
    });
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.emission.deleteMany(),
      prisma.sector.deleteMany(),
    ]);
    await prisma.$disconnect();
  });

  it("should save and retrieve emissions", async () => {
    const emissions: Emission[] = [
      { idSector: mockSectorId, value: 100, year: 2020 },
    ];

    await repository.import(emissions);

    const stored = await prisma.emission.findMany();
    expect(stored).toHaveLength(1);
    expect(stored[0].value).toBe(100);
    expect(stored[0].year).toBe(2020);
  });

  it("should delete all emissions", async () => {
    const emissions: Emission[] = [
      { idSector: mockSectorId, value: 100, year: 2023 },
    ];

    await repository.import(emissions);
    const countBefore = await prisma.emission.count();
    expect(countBefore).toBe(1);

    const deletedCount = await repository.deleteAll();
    expect(deletedCount).toBe(1);

    const countAfter = await prisma.emission.count();
    expect(countAfter).toBe(0);
  });

  it("should return correct imported stats", async () => {
    const emissions: Emission[] = [
      { idSector: mockSectorId, value: 50, year: 2019 },
    ];

    await repository.import(emissions);

    const stats = await repository.getImportedStats();
    expect(stats.totalEmissions).toBe(1);
    expect(stats.emissionValues.min).toBe(50);
    expect(stats.emissionValues.max).toBe(50);
    expect(stats.yearRange.min).toBe(2019);
    expect(stats.yearRange.max).toBe(2019);
  });
});
