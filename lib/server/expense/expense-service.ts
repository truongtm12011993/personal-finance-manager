import { monthKey } from "@/lib/finance";
import { requireUserId } from "@/lib/server/auth";
import { BudgetInput, TransactionInput } from "./expense-inputs";
import {
  createTransactionRecord,
  deleteTransactionRecord as deleteTransactionRecordInRepo,
  fetchExpenseDashboardBase,
  normalizeTransactionAmountsInDb,
  updateTransactionRecord as updateTransactionRecordInRepo,
  upsertBudgetRecord
} from "./expense-repository";
import {
  ExpenseDashboardData,
  ExpenseFilters,
  ExpenseSummary,
  MonthlyExpenseTotal
} from "./expense-types";

function getRecentMonthsFrom(endMonth: string, count: number) {
  const [year, month] = endMonth.split("-").map(Number);
  if (!year || !month) return [];

  const months: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - 1 - i, 1);
    months.push(monthKey(date));
  }
  return months;
}

export async function getExpenseDashboard(filters: ExpenseFilters): Promise<ExpenseDashboardData> {
  const userId = await requireUserId();
  const base = await fetchExpenseDashboardBase(filters, userId);

  const currentMonth = monthKey(new Date());
  const maxDataMonth = base.txRangeMaxOccurredAt ? monthKey(base.txRangeMaxOccurredAt) : currentMonth;
  const anchorMonth = filters.month !== "all" ? filters.month : (maxDataMonth > currentMonth ? maxDataMonth : currentMonth);
  const recentMonths = getRecentMonthsFrom(anchorMonth, 6);
  const expenseSummaryMonth = filters.month !== "all" ? filters.month : anchorMonth;

  const totalsByMonthMap = new Map(recentMonths.map((month) => [month, { month, income: 0, expense: 0, balance: 0 }]));
  for (const tx of base.transactions) {
    const txMonth = monthKey(tx.occurredAt);
    if (!totalsByMonthMap.has(txMonth)) continue;
    const monthly = totalsByMonthMap.get(txMonth)!;
    if (tx.type === "INCOME") monthly.income += tx.amount;
    else monthly.expense += tx.amount;
    monthly.balance = monthly.income - monthly.expense;
  }

  let currentIncome = 0;
  let currentExpense = 0;
  const summaryCategoryTotals = new Map<string, number>();
  for (const tx of base.summaryTransactions) {
    if (tx.type === "INCOME") {
      currentIncome += tx.amount;
    } else {
      currentExpense += tx.amount;
      summaryCategoryTotals.set(tx.category, (summaryCategoryTotals.get(tx.category) ?? 0) + tx.amount);
    }
  }

  const prevExpenseTotal = base.prevSummaryTransactions.reduce((sum, tx) => {
    if (tx.type !== "EXPENSE") return sum;
    return sum + tx.amount;
  }, 0);

  const budget = base.budgets.find((item) => item.month === expenseSummaryMonth);
  const budgetLimit = budget ? budget.limit : 0;
  const overBudget = budgetLimit > 0 && currentExpense > budgetLimit;

  let forecastOverBudget = false;
  let forecastExpense = 0;
  if (expenseSummaryMonth === currentMonth) {
    const today = new Date();
    const day = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (day > 0) {
      forecastExpense = Math.round((currentExpense / day) * daysInMonth);
      forecastOverBudget = budgetLimit > 0 && forecastExpense > budgetLimit;
    }
  }

  const summary: ExpenseSummary = {
    currentIncome,
    currentExpense,
    balanceValue: currentIncome - currentExpense,
    trendPct: prevExpenseTotal > 0 ? ((currentExpense - prevExpenseTotal) / prevExpenseTotal) * 100 : null,
    budgetLimit,
    overBudget,
    forecastExpense,
    forecastOverBudget,
    sortedCategories: [...summaryCategoryTotals.entries()].sort((a, b) => b[1] - a[1])
  };

  return {
    transactions: base.transactions,
    expenseCategories: base.expenseCategories,
    recentMonths,
    expenseSummaryMonth,
    totalsByMonth: [...totalsByMonthMap.values()] as MonthlyExpenseTotal[],
    summary
  };
}

export async function normalizeTransactionAmounts(): Promise<void> {
  const userId = await requireUserId();
  await normalizeTransactionAmountsInDb(userId);
}

export async function addTransaction(input: TransactionInput): Promise<void> {
  const userId = await requireUserId();
  await createTransactionRecord(input, userId);
}

export async function updateTransaction(input: TransactionInput): Promise<void> {
  const userId = await requireUserId();
  await updateTransactionRecordInRepo(input, userId);
}

export async function deleteTransaction(id: string): Promise<void> {
  const userId = await requireUserId();
  await deleteTransactionRecordInRepo(id, userId);
}

export async function setBudget(input: BudgetInput): Promise<void> {
  const userId = await requireUserId();
  await upsertBudgetRecord(input, userId);
}
