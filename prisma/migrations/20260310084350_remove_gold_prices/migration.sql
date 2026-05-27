/*
  Warnings:

  - You are about to drop the column `goldBuyPrice` on the `InvestmentAsset` table. All the data in the column will be lost.
  - You are about to drop the column `goldSellPrice` on the `InvestmentAsset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "InvestmentAsset" DROP COLUMN "goldBuyPrice",
DROP COLUMN "goldSellPrice";
