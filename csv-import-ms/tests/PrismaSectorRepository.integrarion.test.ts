import { PrismaClient } from "@prisma/client";
import { Sector } from "../src/domain/Sector";
import { PrismaSectorRepository } from "../src/infrastructure/PrismaSectorRepository";

describe("PrismaSectorRepository Integration", () => {
  let prisma: PrismaClient;
  let repository: PrismaSectorRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    repository = new PrismaSectorRepository(prisma);

    await prisma.emission.deleteMany();
    await prisma.sector.deleteMany();
  });

  beforeEach(async () => {
    await prisma.emission.deleteMany();
    await prisma.sector.deleteMany();
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.emission.deleteMany(),
      prisma.sector.deleteMany(),
    ]);
    await prisma.$disconnect();
  });

  it("should save and retrieve sectors", async () => {
    const sectors: Sector[] = [
      {
        id: "mock-sector-id",
        name: "Energy",
        country: "ESP",
        parentSector: null,
      },
    ];

    await repository.import(sectors);

    const stored = await prisma.sector.findMany();
    expect(stored[0]).toEqual(
      expect.objectContaining({
        id: "mock-sector-id",
        name: "Energy",
        country: "ESP",
        parentSector: null,
      }),
    );
  });

  it("should delete all sectors", async () => {
    const sectors: Sector[] = [
      {
        id: "mock-sector-id",
        name: "Some",
        country: "ESP",
        parentSector: null,
      },
      {
        id: "another-mock-id",
        name: "Another Sector",
        country: "ESP",
        parentSector: null,
      },
    ];

    await repository.import(sectors);
    const countBefore = await prisma.sector.count();
    expect(countBefore).toBe(2);

    await repository.deleteAll();
    const countAfter = await prisma.sector.count();
    expect(countAfter).toBe(0);
  });
});
