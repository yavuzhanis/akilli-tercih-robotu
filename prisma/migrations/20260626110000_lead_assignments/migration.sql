-- Add lead assignment and appointment fields
ALTER TABLE "Lead" ADD COLUMN "assignedUserId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "appointmentAt" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "appointmentNote" TEXT;

CREATE INDEX "Lead_assignedUserId_idx" ON "Lead"("assignedUserId");
CREATE INDEX "Lead_appointmentAt_idx" ON "Lead"("appointmentAt");
