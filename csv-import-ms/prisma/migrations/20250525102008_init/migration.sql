-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "parentSector" TEXT,
    "country" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Emission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idSector" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "value" REAL NOT NULL,
    CONSTRAINT "Emission_idSector_fkey" FOREIGN KEY ("idSector") REFERENCES "Sector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
