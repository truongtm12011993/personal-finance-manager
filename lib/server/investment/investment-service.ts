import {
  Holding,
  InvestmentAssetRecord,
  InvestmentDashboardData,
  InvestmentFilters,
  InvestmentTransactionRecord,
  PortfolioSummary
} from "./investment-types";
import {
  createInvestmentAsset,
  createInvestmentTransactionRecord,
  deleteInvestmentAssetRecord,
  deleteInvestmentTransactionRecord,
  fetchInvestmentDashboardBase,
  getAvailableQuantityByAsset,
  updateInvestmentPriceRecord,
  updateInvestmentTransactionRecord
} from "./investment-repository";
import {
  InvestmentPriceInput,
  InvestmentTransactionInput,
  UpsertInvestmentAssetInput
} from "./investment-inputs";
import { requireUserId } from "@/lib/server/auth";

export async function getInvestmentDashboard(
  filters: InvestmentFilters
): Promise<InvestmentDashboardData> {
  const userId = await requireUserId();
  const base = await fetchInvestmentDashboardBase(userId);
  
  // 1. Build GLOBAL holdings (all assets) for accurate summary/alerts
  const allHoldings = buildHoldings(base.assets, base.transactions, base.usdVnd, "all");
  const globalSummary = computePortfolioSummary(allHoldings);
  
  // 2. Build FILTERED holdings for display in the grid
  const holdings = filters.assetId === "all" 
    ? allHoldings 
    : buildHoldings(base.assets, base.transactions, base.usdVnd, filters.assetId);
  
  // 3. Compute DISPLAY summary for filtered view KPIs
  // But we preserve the global concentration alerts
  const displaySummary = computePortfolioSummary(holdings);
  
  const finalSummary = {
    ...displaySummary,
    concentrationAlert: globalSummary.concentrationAlert,
    rebalanceRecommendation: globalSummary.rebalanceRecommendation,
    // Note: topHolding in a filtered view should technically be the top of the global portfolio 
    // to maintain context, or the top of the filtered view. Let's keep global for alert context.
    topHolding: globalSummary.topHolding,
  };

  // 4. Filter transactions for DISPLAY list
  const filteredTransactions = base.transactions.filter((tx) => {
    // Month filter
    if (filters.month !== "all") {
      const txMonth = `${tx.occurredAt.getFullYear()}-${String(tx.occurredAt.getMonth() + 1).padStart(2, "0")}`;
      if (txMonth !== filters.month) return false;
    }
    // Asset filter
    if (filters.assetId !== "all") {
      if (tx.assetId !== filters.assetId) return false;
    }
    return true;
  });

  return {
    assets: base.assets,
    transactions: filteredTransactions,
    usdVnd: base.usdVnd,
    holdings,
    summary: finalSummary
  };
}

export async function addInvestmentAsset(input: UpsertInvestmentAssetInput): Promise<void> {
  const userId = await requireUserId();
  await createInvestmentAsset(input, userId);
}

export async function deleteInvestmentAsset(id: string): Promise<void> {
  const userId = await requireUserId();
  await deleteInvestmentAssetRecord(id, userId);
}

export async function addInvestmentTransaction(input: InvestmentTransactionInput): Promise<void> {
  const userId = await requireUserId();
  if (input.action === "SELL") {
    const availableQty = await getAvailableQuantityByAsset(input.assetId, userId);
    if (input.quantity > availableQty) {
      throw new Error(
        `Số lượng bán vượt quá số hiện có (${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 8 }).format(availableQty)}).`
      );
    }
  }
  await createInvestmentTransactionRecord(input, userId);
}

export async function updateInvestmentTransaction(input: InvestmentTransactionInput): Promise<void> {
  const userId = await requireUserId();
  if (input.action === "SELL") {
    const availableQty = await getAvailableQuantityByAsset(input.assetId, userId, input.id);
    if (input.quantity > availableQty) {
      throw new Error(
        `Số lượng bán vượt quá số hiện có (${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 8 }).format(availableQty)}).`
      );
    }
  }
  await updateInvestmentTransactionRecord(input, userId);
}

export async function updateInvestmentPrice(input: InvestmentPriceInput): Promise<void> {
  const userId = await requireUserId();
  await updateInvestmentPriceRecord(input, userId);
}

export async function deleteInvestmentTransaction(id: string): Promise<void> {
  const userId = await requireUserId();
  await deleteInvestmentTransactionRecord(id, userId);
}

export function buildHoldings(
  assets: InvestmentAssetRecord[],
  transactions: InvestmentTransactionRecord[],
  usdVnd: number,
  assetFilter: string
): Holding[] {
  const holdingsMap = new Map<string, Holding>();

  for (const asset of assets) {
    if (assetFilter !== "all" && asset.id !== assetFilter) continue;

    holdingsMap.set(asset.id, {
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      currency: asset.currency,
      quantity: 0,
      cost: 0,
      buyValue: 0,
      sellValue: 0,
      averageCost: null,
      currentPrice: asset.currentPrice,
      marketValue: null,
      unrealizedPnl: null,
      unrealizedPnlPct: null,
      weightPct: 0
    });
  }

  for (const tx of transactions) {
    const item = holdingsMap.get(tx.assetId);
    if (!item) continue;

    const isUsd = item.currency === "USD" || item.currency === "USDT" || item.currency === "USDC";
    const priceVnd = isUsd ? tx.price * usdVnd : tx.price;
    const feeVnd = isUsd ? tx.fee * usdVnd : tx.fee;

    if (tx.action === "BUY") {
      item.quantity += tx.quantity;
      item.cost += tx.quantity * priceVnd + feeVnd;
      item.buyValue += tx.quantity * priceVnd + feeVnd;
      continue;
    }

    const avgCost = item.quantity > 0 ? item.cost / item.quantity : 0;
    const sellQty = Math.min(tx.quantity, item.quantity);
    item.quantity -= sellQty;
    item.cost -= avgCost * sellQty;
    item.sellValue += tx.quantity * priceVnd - feeVnd;

    if (item.quantity <= 0.00000001) item.quantity = 0;
    if (item.cost <= 0) item.cost = 0;
  }

  const holdings = [...holdingsMap.values()].sort((a, b) => b.cost - a.cost);

  for (const item of holdings) {
    item.averageCost = item.quantity > 0 ? item.cost / item.quantity : null;

    if (item.currentPrice !== null && item.quantity > 0) {
      const isUsd = item.currency === "USD" || item.currency === "USDT" || item.currency === "USDC";
      const priceInVnd = isUsd ? item.currentPrice * usdVnd : item.currentPrice;
      item.marketValue = item.quantity * priceInVnd;
      item.unrealizedPnl = item.marketValue - item.cost;
      item.unrealizedPnlPct = item.cost > 0 ? (item.unrealizedPnl / item.cost) * 100 : null;
    }
  }

  const portfolioCost = holdings.reduce((sum, item) => sum + item.cost, 0);
  const portfolioMarketValue = holdings.reduce((sum, item) => sum + (item.marketValue ?? 0), 0);
  const weightBase = portfolioMarketValue > 0 ? portfolioMarketValue : portfolioCost;

  for (const item of holdings) {
    const valueForWeight = item.marketValue ?? item.cost;
    item.weightPct = weightBase > 0 ? (valueForWeight / weightBase) * 100 : 0;
  }

  return holdings;
}

export function computePortfolioSummary(holdings: Holding[]): PortfolioSummary {
  const portfolioCost = holdings.reduce((sum, item) => sum + item.cost, 0);
  const portfolioMarketValue = holdings.reduce((sum, item) => sum + (item.marketValue ?? 0), 0);
  const totalBuyValue = holdings.reduce((sum, item) => sum + item.buyValue, 0);
  const totalSellValue = holdings.reduce((sum, item) => sum + item.sellValue, 0);
  const netInvested = totalBuyValue - totalSellValue;
  const totalUnrealizedPnl = holdings.reduce((sum, item) => sum + (item.unrealizedPnl ?? 0), 0);
  const topHolding = holdings.length > 0 ? [...holdings].sort((a, b) => b.weightPct - a.weightPct)[0] : null;
  const concentrationAlert = topHolding !== null && topHolding.weightPct > 40;
  
  let rebalanceRecommendation = null;
  if (concentrationAlert && topHolding) {
    const weightBase = portfolioMarketValue > 0 ? portfolioMarketValue : portfolioCost;
    const targetWeight = 40;
    const targetValue = (weightBase * targetWeight) / 100;
    const currentValue = topHolding.marketValue ?? topHolding.cost;
    const reductionAmount = Math.max(0, currentValue - targetValue);
    
    rebalanceRecommendation = {
      assetId: topHolding.assetId,
      symbol: topHolding.symbol,
      currentWeight: topHolding.weightPct,
      targetWeight,
      reductionAmount
    };
  }

  return {
    portfolioCost,
    portfolioMarketValue,
    totalBuyValue,
    totalSellValue,
    netInvested,
    totalUnrealizedPnl,
    topHolding,
    concentrationAlert,
    rebalanceRecommendation
  };
}
