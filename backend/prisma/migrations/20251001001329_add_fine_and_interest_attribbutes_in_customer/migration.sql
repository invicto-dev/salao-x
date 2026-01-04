-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "fine" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "interest" DECIMAL(65,30) DEFAULT 0;
