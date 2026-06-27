-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MessageDeliveryLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" TEXT,
    "leadId" TEXT,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "provider" TEXT NOT NULL DEFAULT 'demo',
    "error" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageDeliveryLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MessageTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MessageDeliveryLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MessageTemplate_channel_idx" ON "MessageTemplate"("channel");

-- CreateIndex
CREATE INDEX "MessageTemplate_isActive_idx" ON "MessageTemplate"("isActive");

-- CreateIndex
CREATE INDEX "MessageDeliveryLog_templateId_idx" ON "MessageDeliveryLog"("templateId");

-- CreateIndex
CREATE INDEX "MessageDeliveryLog_leadId_idx" ON "MessageDeliveryLog"("leadId");

-- CreateIndex
CREATE INDEX "MessageDeliveryLog_channel_idx" ON "MessageDeliveryLog"("channel");

-- CreateIndex
CREATE INDEX "MessageDeliveryLog_status_idx" ON "MessageDeliveryLog"("status");

-- CreateIndex
CREATE INDEX "MessageDeliveryLog_createdAt_idx" ON "MessageDeliveryLog"("createdAt");
