/*
  Warnings:

  - You are about to drop the column `postosFidelidade` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `ultimoAtendimento` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "postosFidelidade",
DROP COLUMN "ultimoAtendimento",
ALTER COLUMN "ativo" SET DEFAULT true;
