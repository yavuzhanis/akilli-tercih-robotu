-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "followUpAt" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "followUpNote" TEXT;

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL DEFAULT 'system',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "leadId" TEXT,
    "dueAt" DATETIME,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminNotification_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AdminNotification_isRead_dueAt_idx" ON "AdminNotification"("isRead", "dueAt");

-- CreateIndex
CREATE INDEX "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");

-- CreateIndex
CREATE INDEX "AdminNotification_leadId_idx" ON "AdminNotification"("leadId");
