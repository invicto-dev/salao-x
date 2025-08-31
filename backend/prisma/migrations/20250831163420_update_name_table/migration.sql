/*
  Warnings:

  - You are about to drop the `Funcionario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Funcionario";

-- CreateTable
CREATE TABLE "Funcionarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "comissao" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Funcionarios_email_key" ON "Funcionarios"("email");
