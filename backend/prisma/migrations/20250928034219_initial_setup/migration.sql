-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ROOT', 'ADMIN', 'GERENTE', 'SECRETARIO', 'FUNCIONARIO');

-- CreateEnum
CREATE TYPE "public"."StockMovementType" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "public"."StockMovementReason" AS ENUM ('COMPRA', 'VENDA', 'QUEBRA', 'VENCIMENTO', 'DEVOLUCAO', 'AJUSTE_INVENTARIO', 'INSUMO_PARA_USO', 'CANCELAMENTO_VENDA');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "public"."SaleStatus" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');

-- CreateTable
CREATE TABLE "public"."Setting" (
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
    "exigirAprovacaoEstoque" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Employee" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "comissao" DECIMAL(65,30) NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "cpf" TEXT,
    "aniversario" TIMESTAMP(3),
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "valorEmAberto" BOOLEAN NOT NULL DEFAULT false,
    "preco" DECIMAL(65,30),
    "duracao" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "descricao" TEXT,
    "categoriaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "preco" DECIMAL(65,30),
    "custo" DECIMAL(65,30),
    "valorEmAberto" BOOLEAN NOT NULL DEFAULT false,
    "contarEstoque" BOOLEAN NOT NULL DEFAULT true,
    "estoqueMinimo" INTEGER DEFAULT 1,
    "unidadeMedida" TEXT NOT NULL DEFAULT 'un',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "descricao" TEXT,
    "categoriaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StockMovement" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" "public"."StockMovementType" NOT NULL,
    "motivo" "public"."StockMovementReason" NOT NULL,
    "quantidade" DECIMAL(65,30) NOT NULL,
    "saleId" TEXT,
    "custoUnitario" DECIMAL(65,30),
    "observacao" TEXT,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDENTE',
    "solicitadoPorId" TEXT NOT NULL,
    "aprovadoPorId" TEXT,
    "dataAprovacao" TIMESTAMP(3),
    "motivoRejeicao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentMethod" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "chavePix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sale" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "funcionarioId" TEXT,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "troco" DECIMAL(65,30),
    "desconto" DECIMAL(65,30),
    "acrescimo" DECIMAL(65,30),
    "status" "public"."SaleStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SaleItem" (
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
CREATE TABLE "public"."SalePayment" (
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
CREATE UNIQUE INDEX "Setting_cnpj_key" ON "public"."Setting"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_email_key" ON "public"."Setting"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "public"."Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "public"."Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cpf_key" ON "public"."Customer"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Service_codigo_key" ON "public"."Service"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Product_codigo_key" ON "public"."Product"("codigo");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StockMovement" ADD CONSTRAINT "StockMovement_aprovadoPorId_fkey" FOREIGN KEY ("aprovadoPorId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SaleItem" ADD CONSTRAINT "SaleItem_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalePayment" ADD CONSTRAINT "SalePayment_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "public"."Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalePayment" ADD CONSTRAINT "SalePayment_metodoDePagamentoId_fkey" FOREIGN KEY ("metodoDePagamentoId") REFERENCES "public"."PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
