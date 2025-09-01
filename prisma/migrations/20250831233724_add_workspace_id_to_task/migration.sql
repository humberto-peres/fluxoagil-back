/*
  Warnings:

  - Added the required column `workspaceId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "workspaceId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Task_workspaceId_idx" ON "public"."Task"("workspaceId");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
