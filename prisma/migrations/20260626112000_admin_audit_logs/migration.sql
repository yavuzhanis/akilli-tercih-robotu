-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_userId_idx" ON "AdminAuditLog"("userId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_idx" ON "AdminAuditLog"("entityType");
