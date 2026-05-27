import { AssetType, InvestmentAction } from "@prisma/client";

export type UpsertInvestmentAssetInput = {
  id?: string;
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  currentPrice: number | null;
};

export type InvestmentTransactionInput = {
  id?: string;
  assetId: string;
  action: InvestmentAction;
  quantity: number;
  price: number;
  fee: number;
  note: string | null;
  occurredAt: Date;
};

export type InvestmentPriceInput = {
  assetId: string;
  currentPrice: number;
};