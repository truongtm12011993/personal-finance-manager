-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'CRYPTO', 'FUND', 'BOND', 'OTHER');

-- CreateEnum
CREATE TYPE "InvestmentAction" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "InvestmentAsset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentTransaction" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "action" "InvestmentAction" NOT NULL,
    "quantity" DECIMAL(20,8) NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "fee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentAsset_symbol_currency_key" ON "InvestmentAsset"("symbol", "currency");

-- AddForeignKey
ALTER TABLE "InvestmentTransaction" ADD CONSTRAINT "InvestmentTransaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "InvestmentAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
