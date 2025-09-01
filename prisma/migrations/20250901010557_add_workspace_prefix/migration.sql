/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,sequenceNumber]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[prefix]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequenceNumber` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefix` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "sequenceNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Workspace" ADD COLUMN     "prefix" TEXT NOT NULL,
ADD COLUMN     "taskSeq" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Task_workspaceId_sequenceNumber_key" ON "public"."Task"("workspaceId", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_prefix_key" ON "public"."Workspace"("prefix");
