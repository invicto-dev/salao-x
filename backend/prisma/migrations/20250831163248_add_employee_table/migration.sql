-- CreateTable
CREATE TABLE "Configuracoes" (
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

    CONSTRAINT "Configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "comissao" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuracoes_cnpj_key" ON "Configuracoes"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracoes_email_key" ON "Configuracoes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_email_key" ON "Funcionario"("email");
