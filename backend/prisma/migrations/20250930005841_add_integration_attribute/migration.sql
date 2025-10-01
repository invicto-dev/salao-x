/*
  Warnings:

  - You are about to drop the column `assasCustomerId` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[asaasCustomerId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[integration]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Customer_assasCustomerId_key";

-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "assasCustomerId",
ADD COLUMN     "asaasCustomerId" TEXT;

-- AlterTable
ALTER TABLE "public"."PaymentMethod" ADD COLUMN     "integration" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_asaasCustomerId_key" ON "public"."Customer"("asaasCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_integration_key" ON "public"."PaymentMethod"("integration");
