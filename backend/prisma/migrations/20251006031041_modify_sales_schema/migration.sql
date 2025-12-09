/*
  Warnings:

  - You are about to drop the column `acrescimo` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `desconto` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `nome` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DescontoOuAcrescimoTipo" AS ENUM ('PORCENTAGEM', 'VALOR');

-- AlterTable
ALTER TABLE "public"."Sale" DROP COLUMN "acrescimo",
DROP COLUMN "desconto";

-- AlterTable
ALTER TABLE "public"."SaleItem" ADD COLUMN     "acrescimo" DECIMAL(65,30),
ADD COLUMN     "acrescimoTipo" "public"."DescontoOuAcrescimoTipo" DEFAULT 'PORCENTAGEM',
ADD COLUMN     "desconto" DECIMAL(65,30),
ADD COLUMN     "descontoTipo" "public"."DescontoOuAcrescimoTipo" DEFAULT 'PORCENTAGEM',
ADD COLUMN     "nome" TEXT NOT NULL;
