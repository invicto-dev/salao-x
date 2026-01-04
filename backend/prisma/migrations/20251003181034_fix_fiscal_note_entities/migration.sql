/*
  Warnings:

  - You are about to drop the column `certificadoDigital` on the `Setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "cofinsAliquota" DECIMAL(65,30),
ADD COLUMN     "cofinsCst" TEXT,
ADD COLUMN     "icmsAliquota" DECIMAL(65,30),
ADD COLUMN     "icmsCst" TEXT,
ADD COLUMN     "pisAliquota" DECIMAL(65,30),
ADD COLUMN     "pisCst" TEXT;

-- AlterTable
ALTER TABLE "public"."Setting" DROP COLUMN "certificadoDigital",
ADD COLUMN     "certificadoA1" BYTEA,
ADD COLUMN     "codigoIbge" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "uf" TEXT;
