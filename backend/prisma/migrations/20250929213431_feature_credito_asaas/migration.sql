/*
  Warnings:

  - A unique constraint covering the columns `[assasCustomerId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalChargeId]` on the table `SalePayment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "assasCustomerId" TEXT,
ADD COLUMN     "creditLimit" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "paymentDueDay" INTEGER;

-- AlterTable
ALTER TABLE "public"."SalePayment" ADD COLUMN     "externalChargeId" TEXT,
ADD COLUMN     "externalChargeUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_assasCustomerId_key" ON "public"."Customer"("assasCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "SalePayment_externalChargeId_key" ON "public"."SalePayment"("externalChargeId");
