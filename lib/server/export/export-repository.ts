import { prisma } from "@/lib/prisma";
import { ExpenseExportFilters, InvestmentExportFilters } from "./export-inputs";

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return null;
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 1);
  return { from, to };
}

export async function fetchExpenseExportRows(filters: ExpenseExportFilters) {
  const where: {
    occurredAt?: { gte?: Date; lt?: Date };
    category?: string;
  } = {};

  if (filters.month !== "all") {
    const range = monthRange(filters.month);
    if (range) {
      where.occurredAt = { gte: range.from, lt: range.to };
    }
  }

  if (filters.category !== "all") {
    where.category = filters.category;
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { occurredAt: "desc" }
  });
}

export async function fetchInvestmentExportRows(filters: InvestmentExportFilters) {
  const where: {
    occurredAt?: { gte?: Date; lt?: Date };
    assetId?: string;
  } = {};

  if (filters.month !== "all") {
    const range = monthRange(filters.month);
    if (range) {
      where.occurredAt = { gte: range.from, lt: range.to };
    }
  }

  if (filters.assetId !== "all") {
    where.assetId = filters.assetId;
  }

  return prisma.investmentTransaction.findMany({
    where,
    include: { asset: true },
    orderBy: { occurredAt: "desc" }
  });
}
