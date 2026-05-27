import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BudgetInput, TransactionInput } from "./expense-inputs";
import {
  BudgetRecord,
  ExpenseFilters,
  ExpenseTransactionRecord
} from "./expense-types";

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return null;
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 1);
  return { from, to };
}

export async function fetchExpenseDashboardBase(filters: ExpenseFilters, userId: string): Promise<{
  txRangeMaxOccurredAt: Date | null;
  transactions: ExpenseTransactionRecord[];
  budgets: BudgetRecord[];
  expenseCategories: string[];
  summaryTransactions: ExpenseTransactionRecord[];
  prevSummaryTransactions: ExpenseTransactionRecord[];
}> {
  const expenseCategoryWhere = filters.category !== "all" ? { category: filters.category } : {};
  const userWhere = { userId };
  const txRange = await prisma.transaction.aggregate({
    where: { ...userWhere, ...expenseCategoryWhere },
    _min: { occurredAt: true },
    _max: { occurredAt: true }
  });

  const expenseWhere: {
    userId: string;
    occurredAt?: { gte?: Date; lt?: Date };
    category?: string;
  } = { ...userWhere, ...expenseCategoryWhere };

  if (filters.month !== "all") {
    const range = monthRange(filters.month);
    if (range) {
      expenseWhere.occurredAt = { gte: range.from, lt: range.to };
    }
  }

  const currentMonth = new Date();
  const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const maxDataMonth = txRange._max.occurredAt
    ? `${txRange._max.occurredAt.getFullYear()}-${String(txRange._max.occurredAt.getMonth() + 1).padStart(2, "0")}`
    : currentMonthKey;
  const anchorMonth = filters.month !== "all" ? filters.month : (maxDataMonth > currentMonthKey ? maxDataMonth : currentMonthKey);

  const recentMonths: string[] = [];
  const [anchorYear, anchorMonthNumber] = anchorMonth.split("-").map(Number);
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(anchorYear, anchorMonthNumber - 1 - i, 1);
    recentMonths.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }

  const expenseSummaryMonth = filters.month !== "all" ? filters.month : anchorMonth;
  const [summaryYear, summaryMonthNumber] = expenseSummaryMonth.split("-").map(Number);
  const summaryRange = summaryYear && summaryMonthNumber
    ? { from: new Date(summaryYear, summaryMonthNumber - 1, 1), lt: new Date(summaryYear, summaryMonthNumber, 1) }
    : null;
  const previousMonthDate = summaryYear && summaryMonthNumber ? new Date(summaryYear, summaryMonthNumber - 2, 1) : null;
  const prevRange = previousMonthDate
    ? { from: new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth(), 1), lt: new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth() + 1, 1) }
    : null;

  const [transactionsRaw, budgetsRaw, expenseCategoriesRaw, summaryTransactionsRaw, prevSummaryTransactionsRaw] = await Promise.all([
    prisma.transaction.findMany({ where: expenseWhere, orderBy: { occurredAt: "desc" }, take: 2000 }),
    prisma.budget.findMany({ where: { userId, month: { in: recentMonths } } }),
    prisma.transaction.findMany({
      where: userWhere,
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" }
    }),
    summaryRange
      ? prisma.transaction.findMany({ where: { userId, occurredAt: { gte: summaryRange.from, lt: summaryRange.lt } } })
      : Promise.resolve([]),
    prevRange
      ? prisma.transaction.findMany({ where: { userId, occurredAt: { gte: prevRange.from, lt: prevRange.lt } } })
      : Promise.resolve([])
  ]);

  const toTransactionRecord = (tx: {
    id: string;
    amount: Prisma.Decimal;
    type: "INCOME" | "EXPENSE";
    category: string;
    note: string | null;
    occurredAt: Date;
  }): ExpenseTransactionRecord => ({
    id: tx.id,
    amount: Number(tx.amount),
    type: tx.type,
    category: tx.category,
    note: tx.note,
    occurredAt: tx.occurredAt
  });

  return {
    txRangeMaxOccurredAt: txRange._max.occurredAt,
    transactions: transactionsRaw.map(toTransactionRecord),
    budgets: budgetsRaw.map((item) => ({ month: item.month, limit: Number(item.limit) })),
    expenseCategories: expenseCategoriesRaw.map((i) => i.category).filter(Boolean),
    summaryTransactions: summaryTransactionsRaw.map(toTransactionRecord),
    prevSummaryTransactions: prevSummaryTransactionsRaw.map(toTransactionRecord)
  };
}

export async function normalizeTransactionAmountsInDb(userId: string): Promise<void> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { id: true, amount: true }
  });

  for (const tx of transactions) {
    const raw = tx.amount.toString();
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^\d+(?:\.\d+)?$/);
    let normalized: number | null = null;
    if (match) {
      const parts = trimmed.split(".");
      if (parts.length > 1) {
        const decimal = parts[1];
        if (decimal && !/^0+$/.test(decimal)) {
          normalized = Number(parts[0] + decimal);
        }
      }
    } else {
      const digits = trimmed.replace(/\D/g, "");
      normalized = digits ? Number(digits) : null;
    }

    if (normalized === null || !Number.isFinite(normalized)) continue;

    await prisma.transaction.update({
      where: { id: tx.id, userId },
      data: { amount: new Prisma.Decimal(normalized) }
    });
  }
}

export async function createTransactionRecord(input: TransactionInput, userId: string): Promise<void> {
  await prisma.transaction.create({
    data: {
      userId,
      amount: new Prisma.Decimal(input.amount),
      type: input.type,
      category: input.category,
      note: input.note,
      occurredAt: input.occurredAt
    }
  });
}

export async function updateTransactionRecord(input: TransactionInput, userId: string): Promise<void> {
  await prisma.transaction.update({
    where: { id: input.id!, userId },
    data: {
      amount: new Prisma.Decimal(input.amount),
      type: input.type,
      category: input.category,
      note: input.note,
      occurredAt: input.occurredAt
    }
  });
}

export async function deleteTransactionRecord(id: string, userId: string): Promise<void> {
  await prisma.transaction.delete({ where: { id, userId } });
}

export async function upsertBudgetRecord(input: BudgetInput, userId: string): Promise<void> {
  await prisma.budget.upsert({
    where: { userId_month: { userId, month: input.month } },
    update: { limit: new Prisma.Decimal(input.limit) },
    create: { userId, month: input.month, limit: new Prisma.Decimal(input.limit) }
  });
}
