/*
  Warnings:

  - You are about to drop the column `cpf` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpfCnpj]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."FiscalNoteStatus" AS ENUM ('PENDENTE', 'PROCESSANDO', 'AUTORIZADA', 'ERRO', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."FiscalNoteType" AS ENUM ('NFE', 'NFCE');

-- DropIndex
DROP INDEX "public"."Customer_cpf_key";

-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "cpf",
ADD COLUMN     "cpfCnpj" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "cfop" TEXT,
ADD COLUMN     "ncm" TEXT,
ADD COLUMN     "origem" INTEGER,
ADD COLUMN     "quantidadeTributavel" DECIMAL(65,30) DEFAULT 1,
ADD COLUMN     "unidadeTributavel" TEXT DEFAULT 'un';

-- AlterTable
ALTER TABLE "public"."Setting" ADD COLUMN     "certificadoDigital" BYTEA,
ADD COLUMN     "inscricaoEstadual" TEXT,
ADD COLUMN     "inscricaoMunicipal" TEXT,
ADD COLUMN     "regimeTributario" TEXT,
ADD COLUMN     "senhaCertificado" TEXT;

-- CreateTable
CREATE TABLE "public"."FiscalNote" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "status" "public"."FiscalNoteStatus" NOT NULL DEFAULT 'PENDENTE',
    "tipo" "public"."FiscalNoteType" NOT NULL,
    "providerId" TEXT,
    "chaveAcesso" TEXT,
    "numero" TEXT,
    "serie" TEXT,
    "xmlUrl" TEXT,
    "danfeUrl" TEXT,
    "mensagemErro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FiscalNote_saleId_key" ON "public"."FiscalNote"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalNote_providerId_key" ON "public"."FiscalNote"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalNote_chaveAcesso_key" ON "public"."FiscalNote"("chaveAcesso");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cpfCnpj_key" ON "public"."Customer"("cpfCnpj");

-- AddForeignKey
ALTER TABLE "public"."FiscalNote" ADD CONSTRAINT "FiscalNote_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
