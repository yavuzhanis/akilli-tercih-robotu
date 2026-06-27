-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "note" TEXT,
    "assignedUserId" TEXT,
    "appointmentAt" DATETIME,
    "appointmentNote" TEXT,
    "followUpAt" DATETIME,
    "followUpNote" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("appointmentAt", "appointmentNote", "assignedUserId", "createdAt", "email", "followUpAt", "followUpNote", "fullName", "id", "note", "phone", "source", "status") SELECT "appointmentAt", "appointmentNote", "assignedUserId", "createdAt", "email", "followUpAt", "followUpNote", "fullName", "id", "note", "phone", "source", "status" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_assignedUserId_idx" ON "Lead"("assignedUserId");
CREATE INDEX "Lead_appointmentAt_idx" ON "Lead"("appointmentAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
