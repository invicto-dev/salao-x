-- CreateEnum
CREATE TYPE "public"."CaixaStatus" AS ENUM ('ABERTO', 'FECHADO');

-- CreateEnum
CREATE TYPE "public"."CaixaMovimentacaoTipo" AS ENUM ('ENTRADA', 'SAIDA');

-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "caixaId" TEXT;

-- CreateTable
CREATE TABLE "public"."Caixa" (
    "id" TEXT NOT NULL,
    "dataAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFechamento" TIMESTAMP(3),
    "valorAbertura" DECIMAL(65,30) NOT NULL,
    "valorFechamentoInformado" DECIMAL(65,30),
    "valorFechamentoCalculado" DECIMAL(65,30),
    "diferenca" DECIMAL(65,30),
    "status" "public"."CaixaStatus" NOT NULL DEFAULT 'ABERTO',
    "observacoes" TEXT,
    "funcionarioAberturaId" TEXT NOT NULL,
    "funcionarioFechamentoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" TEXT,

    CONSTRAINT "Caixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaixaMovimentacao" (
    "id" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "tipo" "public"."CaixaMovimentacaoTipo" NOT NULL,
    "motivo" TEXT NOT NULL,
    "caixaId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaixaMovimentacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "public"."Caixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Caixa" ADD CONSTRAINT "Caixa_funcionarioAberturaId_fkey" FOREIGN KEY ("funcionarioAberturaId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Caixa" ADD CONSTRAINT "Caixa_funcionarioFechamentoId_fkey" FOREIGN KEY ("funcionarioFechamentoId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Caixa" ADD CONSTRAINT "Caixa_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaixaMovimentacao" ADD CONSTRAINT "CaixaMovimentacao_caixaId_fkey" FOREIGN KEY ("caixaId") REFERENCES "public"."Caixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaixaMovimentacao" ADD CONSTRAINT "CaixaMovimentacao_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
