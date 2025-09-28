/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_nome_key" ON "public"."PaymentMethod"("nome");
