/*
  Warnings:

  - You are about to drop the column `backupAutomatico` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `manterHistorico` on the `Setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Setting" DROP COLUMN "backupAutomatico",
DROP COLUMN "manterHistorico",
ADD COLUMN     "asaasActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "assasApiKey" TEXT,
ADD COLUMN     "assasEnvironment" TEXT NOT NULL DEFAULT 'production',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BRL';
