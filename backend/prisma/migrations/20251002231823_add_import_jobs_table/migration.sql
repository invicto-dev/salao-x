-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'FALHOU');

-- CreateTable
CREATE TABLE "public"."ImportJob" (
    "id" TEXT NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'PENDENTE',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "processedRows" INTEGER NOT NULL DEFAULT 0,
    "successfulRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "results" JSONB,
    "originalFilename" TEXT NOT NULL,
    "storedFilename" TEXT NOT NULL,
    "created_by_user_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportJob_storedFilename_key" ON "public"."ImportJob"("storedFilename");

-- AddForeignKey
ALTER TABLE "public"."ImportJob" ADD CONSTRAINT "ImportJob_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
