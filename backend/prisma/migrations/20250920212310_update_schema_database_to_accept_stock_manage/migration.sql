/*
  Warnings:

  - You are about to drop the column `estoque` on the `Product` table. All the data in the column will be lost.
  - Added the required column `Role` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FUNCIONARIO');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "StockMovementReason" AS ENUM ('COMPRA', 'VENDA', 'QUEBRA', 'VENCIMENTO', 'DEVOLUCAO', 'AJUSTE_INVENTARIO');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "Role" "Role" NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "estoque",
ADD COLUMN     "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unidadeMedida" TEXT NOT NULL DEFAULT 'un';

-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "exigirAprovacaoEstoque" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" "StockMovementType" NOT NULL,
    "motivo" "StockMovementReason" NOT NULL,
    "quantidade" DECIMAL(65,30) NOT NULL,
    "custoUnitario" DECIMAL(65,30),
    "observacao" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDENTE',
    "solicitadoPorId" TEXT NOT NULL,
    "aprovadoPorId" TEXT,
    "dataAprovacao" TIMESTAMP(3),
    "motivoRejeicao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_aprovadoPorId_fkey" FOREIGN KEY ("aprovadoPorId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
