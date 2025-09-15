/*
  Warnings:

  - You are about to drop the column `sequenceNumber` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `prefix` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `taskSeq` on the `Workspace` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Task_workspaceId_sequenceNumber_key";

-- DropIndex
DROP INDEX "public"."Workspace_prefix_key";

-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "sequenceNumber",
ADD COLUMN     "epicId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Workspace" DROP COLUMN "prefix",
DROP COLUMN "taskSeq",
ADD COLUMN     "key" VARCHAR(5) NOT NULL,
ADD COLUMN     "nextEpicSeq" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nextTaskSeq" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."Epic" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "priorityId" INTEGER,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Epic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Epic_key_key" ON "public"."Epic"("key");

-- CreateIndex
CREATE INDEX "Epic_workspaceId_status_idx" ON "public"."Epic"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Task_epicId_idx" ON "public"."Task"("epicId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_key_key" ON "public"."Workspace"("key");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "public"."Epic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Epic" ADD CONSTRAINT "Epic_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "public"."Priority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Epic" ADD CONSTRAINT "Epic_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
