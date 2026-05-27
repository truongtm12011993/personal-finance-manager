import { AssetType, InvestmentAction } from "@prisma/client";

export type InvestmentFilters = {
  month: string;
  assetId: string;
};

export type InvestmentAssetRecord = {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  currentPrice: number | null;
};

export type InvestmentTransactionRecord = {
  id: string;
  assetId: string;
  action: InvestmentAction;
  quantity: number;
  price: number;
  fee: number;
  note: string | null;
  occurredAt: Date;
  asset: {
    id: string;
    symbol: string;
    name: string;
    currency: string;
  };
};

export type Holding = {
  assetId: string;
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  quantity: number;
  cost: number;
  buyValue: number;
  sellValue: number;
  averageCost: number | null;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPct: number | null;
  weightPct: number;
};

export type PortfolioSummary = {
  portfolioCost: number;
  portfolioMarketValue: number;
  totalBuyValue: number;
  totalSellValue: number;
  netInvested: number;
  totalUnrealizedPnl: number;
  topHolding: Holding | null;
  concentrationAlert: boolean;
  rebalanceRecommendation: {
    assetId: string;
    symbol: string;
    currentWeight: number;
    targetWeight: number;
    reductionAmount: number;
  } | null;
};

export type InvestmentDashboardData = {
  assets: InvestmentAssetRecord[];
  transactions: InvestmentTransactionRecord[];
  usdVnd: number;
  holdings: Holding[];
  summary: PortfolioSummary;
};
