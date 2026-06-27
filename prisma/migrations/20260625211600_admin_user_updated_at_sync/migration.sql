-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdminUser" ("createdAt", "email", "id", "isActive", "name", "passwordHash", "role", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "name", "passwordHash", "role", "updatedAt" FROM "AdminUser";
DROP TABLE "AdminUser";
ALTER TABLE "new_AdminUser" RENAME TO "AdminUser";
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
