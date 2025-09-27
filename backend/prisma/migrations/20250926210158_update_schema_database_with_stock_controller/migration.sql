-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StockMovementReason" ADD VALUE 'INSUMO_PARA_USO';
ALTER TYPE "StockMovementReason" ADD VALUE 'CANCELAMENTO_VENDA';

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "telefone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "valorEmAberto" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "estoqueMinimo" DROP NOT NULL,
ALTER COLUMN "estoqueMinimo" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "saleId" TEXT;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
