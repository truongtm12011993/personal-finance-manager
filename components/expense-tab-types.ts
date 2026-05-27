import type {
  ExpenseDashboardData,
  ExpenseTransactionRecord,
} from "@/lib/server/expense/expense-types";

export type SerializedExpenseTransaction = Omit<ExpenseTransactionRecord, "occurredAt"> & {
  occurredAt: string;
};

export type ExpenseTabDashboard = ExpenseDashboardData["summary"] &
  Pick<ExpenseDashboardData, "expenseSummaryMonth" | "totalsByMonth"> & {
    transactions: SerializedExpenseTransaction[];
  };

export interface ExpenseTabUIProps {
  dashboard: ExpenseTabDashboard;
  expenseMonthFilter: string;
  expenseCategoryFilter: string;
  recentMonths: string[];
  expenseCategories: string[];
  expenseExportQuery: string;
  expenseReturnTo: string;
}
