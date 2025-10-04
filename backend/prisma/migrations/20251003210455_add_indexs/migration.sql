-- CreateIndex
CREATE INDEX "Product_nome_idx" ON "public"."Product"("nome");

-- CreateIndex
CREATE INDEX "Product_codigo_idx" ON "public"."Product"("codigo");

-- CreateIndex
CREATE INDEX "Product_categoriaId_idx" ON "public"."Product"("categoriaId");

-- CreateIndex
CREATE INDEX "Product_ativo_idx" ON "public"."Product"("ativo");

-- CreateIndex
CREATE INDEX "StockMovement_produtoId_status_idx" ON "public"."StockMovement"("produtoId", "status");
