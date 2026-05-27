import { TransactionType } from "@prisma/client";

export type ExpenseFilters = {
  month: string;
  category: string;
};

export type ExpenseTransactionRecord = {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string | null;
  occurredAt: Date;
};

export type BudgetRecord = {
  month: string;
  limit: number;
};

export type MonthlyExpenseTotal = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

export type ExpenseSummary = {
  currentIncome: number;
  currentExpense: number;
  balanceValue: number;
  trendPct: number | null;
  budgetLimit: number;
  overBudget: boolean;
  forecastExpense: number;
  forecastOverBudget: boolean;
  sortedCategories: Array<[string, number]>;
};

export type ExpenseDashboardData = {
  transactions: ExpenseTransactionRecord[];
  expenseCategories: string[];
  recentMonths: string[];
  expenseSummaryMonth: string;
  totalsByMonth: MonthlyExpenseTotal[];
  summary: ExpenseSummary;
};