-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "scoreType" TEXT NOT NULL,
    "educationType" TEXT NOT NULL,
    "campus" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Nevsehir',
    "duration" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "scholarshipOptions" TEXT NOT NULL,
    "quota" INTEGER NOT NULL,
    "careers" TEXT NOT NULL,
    "baseScore" REAL NOT NULL,
    "rank" TEXT NOT NULL,
    "sourceYear" TEXT NOT NULL,
    "sourceStatus" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priorities" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "feeStatus" TEXT,
    "baseScoreYear" TEXT,
    "rankYear" TEXT,
    "quotaYear" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "note" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LeadChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LeadChoice_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeadChoice_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadChoice_leadId_programId_key" ON "LeadChoice"("leadId", "programId");
