-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'user';
