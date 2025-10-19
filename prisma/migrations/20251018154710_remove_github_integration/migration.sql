/*
  Warnings:

  - You are about to drop the `GithubAutomationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationGithub` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WebhookEventLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."GithubAutomationRule" DROP CONSTRAINT "GithubAutomationRule_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IntegrationGithub" DROP CONSTRAINT "IntegrationGithub_workspaceId_fkey";

-- DropTable
DROP TABLE "public"."GithubAutomationRule";

-- DropTable
DROP TABLE "public"."IntegrationGithub";

-- DropTable
DROP TABLE "public"."WebhookEventLog";
