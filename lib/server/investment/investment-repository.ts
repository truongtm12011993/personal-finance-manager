import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  InvestmentAssetRecord,
  InvestmentTransactionRecord
} from "./investment-types";
import {
  InvestmentPriceInput,
  InvestmentTransactionInput,
  UpsertInvestmentAssetInput
} from "./investment-inputs";

export async function fetchInvestmentDashboardBase(userId: string): Promise<{
  assets: InvestmentAssetRecord[];
  transactions: InvestmentTransactionRecord[];
  usdVnd: number;
}> {
  const [assetsRaw, transactionsRaw, usdVndSetting] = await Promise.all([
    prisma.investmentAsset.findMany({ where: { userId }, orderBy: { symbol: "asc" } }),
    prisma.investmentTransaction.findMany({
      where: { userId },
      include: { asset: true },
      orderBy: { occurredAt: "asc" },
      take: 1000
    }),
    prisma.appSetting.findUnique({ where: { key: "usdVnd" } })
  ]);

  const assets: InvestmentAssetRecord[] = assetsRaw.map((asset) => ({
    id: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    type: asset.type,
    currency: asset.currency,
    currentPrice: asset.currentPrice === null ? null : Number(asset.currentPrice)
  }));

  const transactions: InvestmentTransactionRecord[] = transactionsRaw.map((tx) => ({
    id: tx.id,
    assetId: tx.assetId,
    action: tx.action,
    quantity: Number(tx.quantity),
    price: Number(tx.price),
    fee: Number(tx.fee),
    note: tx.note ?? null,
    occurredAt: tx.occurredAt,
    asset: {
      id: tx.asset.id,
      symbol: tx.asset.symbol,
      name: tx.asset.name,
      currency: tx.asset.currency
    }
  }));

  return {
    assets,
    transactions,
    usdVnd: usdVndSetting ? Number(usdVndSetting.value) : 25_400
  };
}

export async function createInvestmentAsset(input: UpsertInvestmentAssetInput, userId: string): Promise<void> {
  await prisma.investmentAsset.upsert({
    where: { userId_symbol_currency: { userId, symbol: input.symbol, currency: input.currency } },
    update: {
      name: input.name,
      type: input.type,
      currentPrice: input.currentPrice === null ? null : new Prisma.Decimal(input.currentPrice),
      lastPriceUpdatedAt: input.currentPrice === null ? null : new Date()
    },
    create: {
      userId,
      symbol: input.symbol,
      name: input.name,
      type: input.type,
      currency: input.currency,
      currentPrice: input.currentPrice === null ? null : new Prisma.Decimal(input.currentPrice),
      lastPriceUpdatedAt: input.currentPrice === null ? null : new Date()
    }
  });
}

export async function deleteInvestmentAssetRecord(id: string, userId: string): Promise<void> {
  await prisma.investmentAsset.delete({ where: { id, userId } });
}

export async function createInvestmentTransactionRecord(input: InvestmentTransactionInput, userId: string): Promise<void> {
  await prisma.investmentTransaction.create({
    data: {
      userId,
      assetId: input.assetId,
      action: input.action,
      quantity: new Prisma.Decimal(input.quantity),
      price: new Prisma.Decimal(input.price),
      fee: new Prisma.Decimal(input.fee),
      note: input.note,
      occurredAt: input.occurredAt
    }
  });
}

export async function updateInvestmentTransactionRecord(input: InvestmentTransactionInput, userId: string): Promise<void> {
  await prisma.investmentTransaction.update({
    where: { id: input.id!, userId },
    data: {
      action: input.action,
      quantity: new Prisma.Decimal(input.quantity),
      price: new Prisma.Decimal(input.price),
      fee: new Prisma.Decimal(input.fee),
      note: input.note,
      occurredAt: input.occurredAt
    }
  });
}

export async function updateInvestmentPriceRecord(input: InvestmentPriceInput, userId: string): Promise<void> {
  await prisma.investmentAsset.update({
    where: { id: input.assetId, userId },
    data: {
      currentPrice: new Prisma.Decimal(input.currentPrice),
      lastPriceUpdatedAt: new Date()
    }
  });
}

export async function deleteInvestmentTransactionRecord(id: string, userId: string): Promise<void> {
  await prisma.investmentTransaction.delete({ where: { id, userId } });
}

export async function getAvailableQuantityByAsset(
  assetId: string,
  userId: string,
  excludeTransactionId?: string
): Promise<number> {
  const transactions = await prisma.investmentTransaction.findMany({
    where: {
      assetId,
      userId,
      ...(excludeTransactionId ? { id: { not: excludeTransactionId } } : {})
    },
    select: {
      action: true,
      quantity: true,
      occurredAt: true,
      id: true
    },
    orderBy: [{ occurredAt: "asc" }, { id: "asc" }]
  });

  let available = 0;
  for (const tx of transactions) {
    const qty = Number(tx.quantity);
    if (!Number.isFinite(qty) || qty <= 0) continue;
    if (tx.action === "BUY") {
      available += qty;
    } else {
      available = Math.max(0, available - qty);
    }
  }

  return available;
}
