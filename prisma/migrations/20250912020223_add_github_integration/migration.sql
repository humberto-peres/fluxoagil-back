-- CreateTable
CREATE TABLE "public"."IntegrationGithub" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationGithub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GithubAutomationRule" (
    "id" SERIAL NOT NULL,
    "integrationId" INTEGER NOT NULL,
    "event" TEXT NOT NULL,
    "conditionsJson" JSONB NOT NULL,
    "actionJson" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GithubAutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookEventLog" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WebhookEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationGithub_workspaceId_key" ON "public"."IntegrationGithub"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEventLog_deliveryId_key" ON "public"."WebhookEventLog"("deliveryId");

-- AddForeignKey
ALTER TABLE "public"."IntegrationGithub" ADD CONSTRAINT "IntegrationGithub_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GithubAutomationRule" ADD CONSTRAINT "GithubAutomationRule_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."IntegrationGithub"("id") ON DELETE CASCADE ON UPDATE CASCADE;
