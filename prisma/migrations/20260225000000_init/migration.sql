-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "hostname" TEXT,
    "name" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emailRecipients" TEXT NOT NULL,
    "serviceArea" TEXT NOT NULL,
    "logoUrl" TEXT,
    "stripePaymentLink" TEXT,
    "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyBySms" BOOLEAN NOT NULL DEFAULT true,
    "landingConfigJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "serviceType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "preferredDate" DATETIME,
    "notes" TEXT,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");
CREATE UNIQUE INDEX "Client_hostname_key" ON "Client"("hostname");
CREATE INDEX "Lead_clientId_status_createdAt_idx" ON "Lead"("clientId", "status", "createdAt");
CREATE INDEX "NotificationLog_clientId_leadId_idx" ON "NotificationLog"("clientId", "leadId");
