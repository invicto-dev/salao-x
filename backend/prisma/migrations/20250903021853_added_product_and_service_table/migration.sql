-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "categoria" TEXT,
    "preco" DOUBLE PRECISION NOT NULL,
    "custo" DOUBLE PRECISION NOT NULL,
    "contarEstoque" BOOLEAN NOT NULL DEFAULT true,
    "estoque" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "categoria" TEXT,
    "preco" DOUBLE PRECISION NOT NULL,
    "duracao" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_codigo_key" ON "Product"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Service_codigo_key" ON "Service"("codigo");
