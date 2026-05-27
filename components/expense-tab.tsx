import { getExpenseDashboard } from "@/lib/server/expense/expense-service";
import { ExpenseTabUI } from "./expense-tab-ui";
import type { ExpenseTabDashboard } from "./expense-tab-types";

function singleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ExpenseTab({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const expenseMonthFilter = singleParam(searchParams?.expenseMonth) ?? currentMonthKey;
  const expenseCategoryFilter = singleParam(searchParams?.expenseCategory) ?? "all";

  const expenseExportQuery = new URLSearchParams({ 
    expenseMonth: expenseMonthFilter, 
    expenseCategory: expenseCategoryFilter 
  }).toString();
  
  const expenseReturnTo = `/?tab=expense&expenseMonth=${expenseMonthFilter}&expenseCategory=${expenseCategoryFilter}`;

  const dashboard = await getExpenseDashboard({ 
    month: expenseMonthFilter, 
    category: expenseCategoryFilter 
  });
  
  // Serialize transactions (Date -> ISO String) for Client Component compatibility
  const serializedTransactions = dashboard.transactions.map((tx) => ({
    ...tx,
    occurredAt: tx.occurredAt instanceof Date ? tx.occurredAt.toISOString() : tx.occurredAt,
  }));

  // Prepare all necessary data for the UI component
  const dashboardData: ExpenseTabDashboard = {
    ...dashboard.summary,
    transactions: serializedTransactions,
    expenseSummaryMonth: dashboard.expenseSummaryMonth,
    totalsByMonth: dashboard.totalsByMonth,
  };

  return (
    <ExpenseTabUI 
      dashboard={dashboardData}
      expenseMonthFilter={expenseMonthFilter}
      expenseCategoryFilter={expenseCategoryFilter}
      recentMonths={dashboard.recentMonths}
      expenseCategories={dashboard.expenseCategories}
      expenseExportQuery={expenseExportQuery}
      expenseReturnTo={expenseReturnTo}
    />
  );
}
