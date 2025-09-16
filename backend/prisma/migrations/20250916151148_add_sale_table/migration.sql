/*
  Warnings:

  - The `aniversario` column on the `Customer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `preco` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `custo` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `preco` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `Configuracoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Funcionarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "aniversario",
ADD COLUMN     "aniversario" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "preco" DROP NOT NULL,
ALTER COLUMN "preco" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "custo" DROP NOT NULL,
ALTER COLUMN "custo" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "preco" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "Configuracoes";

-- DropTable
DROP TABLE "Funcionarios";

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "nomeEmpresa" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "site" TEXT,
    "horarioFuncionamento" JSONB NOT NULL,
    "intervaloPadrao" INTEGER NOT NULL,
    "antecedenciaMinima" INTEGER NOT NULL,
    "notificarAgendamentos" BOOLEAN NOT NULL,
    "notificarEstoqueBaixo" BOOLEAN NOT NULL,
    "notificarAniversarios" BOOLEAN NOT NULL,
    "whatsappAtivo" BOOLEAN NOT NULL,
    "emailAtivo" BOOLEAN NOT NULL,
    "backupAutomatico" BOOLEAN NOT NULL,
    "manterHistorico" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "comissao" DECIMAL(65,30) NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "funcionarioId" TEXT,
    "total" DECIMAL(65,30) NOT NULL,
    "desconto" DECIMAL(65,30),
    "acrescimo" DECIMAL(65,30),
    "status" "SaleStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "produtoId" TEXT,
    "servicoId" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalePayment" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "metodoDePagamentoId" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_cnpj_key" ON "Setting"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_email_key" ON "Setting"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePayment" ADD CONSTRAINT "SalePayment_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePayment" ADD CONSTRAINT "SalePayment_metodoDePagamentoId_fkey" FOREIGN KEY ("metodoDePagamentoId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
