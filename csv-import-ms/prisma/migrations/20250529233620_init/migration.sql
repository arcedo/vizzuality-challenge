-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentSector" TEXT,
    "country" TEXT NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emission" (
    "id" SERIAL NOT NULL,
    "idSector" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Emission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sector_country_idx" ON "Sector"("country");

-- CreateIndex
CREATE INDEX "Sector_name_idx" ON "Sector"("name");

-- CreateIndex
CREATE INDEX "Sector_parentSector_idx" ON "Sector"("parentSector");

-- CreateIndex
CREATE INDEX "Emission_idSector_idx" ON "Emission"("idSector");

-- CreateIndex
CREATE INDEX "Emission_year_idx" ON "Emission"("year");

-- AddForeignKey
ALTER TABLE "Emission" ADD CONSTRAINT "Emission_idSector_fkey" FOREIGN KEY ("idSector") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
