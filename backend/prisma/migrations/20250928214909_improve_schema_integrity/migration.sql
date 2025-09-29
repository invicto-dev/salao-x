/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Caixa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nome]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Made the column `isCash` on table `PaymentMethod` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Caixa" DROP CONSTRAINT "Caixa_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CaixaMovimentacao" DROP CONSTRAINT "CaixaMovimentacao_caixaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SaleItem" DROP CONSTRAINT "SaleItem_vendaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalePayment" DROP CONSTRAINT "SalePayment_vendaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StockMovement" DROP CONSTRAINT "StockMovement_produtoId_fkey";

-- AlterTable
ALTER TABLE "public"."Caixa" DROP COLUMN "employeeId";

-- AlterTable
ALTER TABLE "public"."PaymentMethod" ALTER COLUMN "isCash" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_nome_key" ON "public"."Category"("nome");

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "public"."Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalePayment" ADD CONSTRAINT "SalePayment_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "public"."Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaixaMovimentacao" ADD CONSTRAINT "CaixaMovimentacao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "public"."Caixa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
