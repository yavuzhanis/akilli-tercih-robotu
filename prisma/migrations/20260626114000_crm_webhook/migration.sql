-- CreateTable
CREATE TABLE "CrmIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'CRM Webhook',
    "webhookUrl" TEXT,
    "secret" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "events" TEXT NOT NULL DEFAULT '["lead.created","lead.updated"]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CrmDeliveryLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event" TEXT NOT NULL,
    "targetUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'skipped',
    "statusCode" INTEGER,
    "requestBody" TEXT,
    "responseBody" TEXT,
    "error" TEXT,
    "leadId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrmDeliveryLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CrmDeliveryLog_event_idx" ON "CrmDeliveryLog"("event");

-- CreateIndex
CREATE INDEX "CrmDeliveryLog_status_idx" ON "CrmDeliveryLog"("status");

-- CreateIndex
CREATE INDEX "CrmDeliveryLog_leadId_idx" ON "CrmDeliveryLog"("leadId");

-- CreateIndex
CREATE INDEX "CrmDeliveryLog_createdAt_idx" ON "CrmDeliveryLog"("createdAt");
