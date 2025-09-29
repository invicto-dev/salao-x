-- DropForeignKey
ALTER TABLE "public"."StockMovement" DROP CONSTRAINT "StockMovement_produtoId_fkey";

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
