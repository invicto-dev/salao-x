/*
  Warnings:

  - You are about to drop the column `assasApiKey` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `assasEnvironment` on the `Setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Setting" DROP COLUMN "assasApiKey",
DROP COLUMN "assasEnvironment",
ADD COLUMN     "asaasApiKey" TEXT,
ADD COLUMN     "asaasEnvironment" TEXT DEFAULT 'production';
