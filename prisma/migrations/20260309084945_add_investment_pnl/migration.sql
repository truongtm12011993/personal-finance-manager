-- AlterTable
ALTER TABLE "InvestmentAsset" ADD COLUMN     "currentPrice" DECIMAL(14,2),
ADD COLUMN     "lastPriceUpdatedAt" TIMESTAMP(3);
