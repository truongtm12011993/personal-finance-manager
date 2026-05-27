"use client";

import { ArrowDown, ArrowUp, Download } from "lucide-react";
import { BudgetForm } from "@/components/budget-form";
import ExpenseCategoryBreakdown from "@/components/ExpenseCategoryBreakdown";
import { ChangeBadge, EmptyState, HeroSummary, KpiCard, MoneyValue, SectionCard, formatMoneyValue } from "@/components/fintech-ui";
import { TransactionActions } from "@/components/transaction-actions";
import { TransactionForm } from "@/components/transaction-form";
import { TxSearchBar } from "@/components/tx-search-bar";
import type { ExpenseTabUIProps, SerializedExpenseTransaction } from "./expense-tab-types";

function groupTransactionsByMonth(transactions: SerializedExpenseTransaction[]) {
  const groups = transactions.reduce<Record<string, SerializedExpenseTransaction[]>>((acc, tx) => {
    const date = new Date(tx.occurredAt);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    acc[key] = acc[key] ?? [];
    acc[key].push(tx);
    return acc;
  }, {});

  return Object.entries(groups).map(([month, entries]) => ({ month, entries }));
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function ExpenseFilterAction({
  expenseMonthFilter,
  recentMonths,
  expenseExportQuery,
}: Pick<ExpenseTabUIProps, "expenseMonthFilter" | "recentMonths" | "expenseExportQuery">) {
  return (
    <form method="get" className="flex w-full flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2 sm:w-auto sm:flex-row sm:items-center dark:border-white/5 dark:bg-[#0a0f1d]">
      <input type="hidden" name="tab" value="expense" />
      <label className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 dark:bg-[#111827]">
        <span className="text-xs font-bold text-slate-500">Tháng</span>
        <select
          name="expenseMonth"
          defaultValue={expenseMonthFilter}
          onChange={(event) => event.currentTarget.form?.submit()}
          className="min-w-[108px] bg-transparent text-sm font-bold text-slate-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:text-white"
        >
          <option value="all">Tất cả</option>
          {recentMonths.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </label>
      <a
        href={`/api/export/expense?${expenseExportQuery}`}
        className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-500 transition hover:bg-slate-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-white/5 dark:bg-[#111827]"
        title="Xuất dữ liệu"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </a>
    </form>
  );
}

function ExpenseTransactionRow({ tx, returnTo }: { tx: SerializedExpenseTransaction; returnTo: string }) {
  const isIncome = tx.type === "INCOME";

  return (
    <article
      data-expense-row="true"
      data-cat={tx.category}
      data-note={tx.note ?? ""}
      className="rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/5 dark:bg-[#0f172a]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {isIncome ? <ArrowUp className="h-5 w-5" aria-hidden="true" /> : <ArrowDown className="h-5 w-5" aria-hidden="true" />}
          </div>
          <div className="min-w-0">
            <h4 className="m-0 truncate text-base font-bold text-slate-950 dark:text-white">{tx.category}</h4>
            <p className="m-0 mt-1 truncate text-sm font-semibold text-slate-500">
              {formatDate(tx.occurredAt)} · {tx.note ?? "Không có ghi chú"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <div className="text-right">
            <MoneyValue value={isIncome ? tx.amount : -tx.amount} signed size="sm" tone={isIncome ? "positive" : "negative"} />
            <div className="mt-1 text-xs font-bold text-slate-400">{isIncome ? "Thu nhập" : "Chi tiêu"}</div>
          </div>
          <TransactionActions
            tx={{
              id: tx.id,
              type: tx.type,
              amount: tx.amount,
              category: tx.category,
              note: tx.note ?? null,
              occurredAt: tx.occurredAt,
            }}
            returnTo={returnTo}
          />
        </div>
      </div>
    </article>
  );
}

function ExpenseTransactionList({
  transactions,
  expenseCategories,
  expenseCategoryFilter,
  expenseReturnTo,
}: Pick<ExpenseTabUIProps, "expenseCategories" | "expenseCategoryFilter" | "expenseReturnTo"> & {
  transactions: SerializedExpenseTransaction[];
}) {
  const transactionGroups = groupTransactionsByMonth(transactions);

  return (
    <>
      <div className="sticky top-3 z-20 mb-5 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/5 dark:bg-[#151C2C]">
        <TxSearchBar categories={expenseCategories} initialCategory={expenseCategoryFilter} />
      </div>

      {transactionGroups.length === 0 ? (
        <EmptyState title="Không có giao dịch" description="Các khoản thu chi phù hợp bộ lọc sẽ xuất hiện tại đây." />
      ) : (
        transactionGroups.map(({ month, entries }) => (
          <div key={month} data-expense-group="true" className="mt-7 space-y-3 first:mt-0">
            <div className="flex items-center gap-4 px-1">
              <span className="whitespace-nowrap text-base font-bold text-slate-950 dark:text-white">Tháng {month}</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="group-count-label whitespace-nowrap text-xs font-bold text-slate-500">{entries.length} giao dịch</span>
            </div>
            <div className="grid gap-3">
              {entries.map((tx) => (
                <ExpenseTransactionRow key={tx.id} tx={tx} returnTo={expenseReturnTo} />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}

export function ExpenseTabUI({
  dashboard,
  expenseMonthFilter,
  expenseCategoryFilter,
  recentMonths,
  expenseCategories,
  expenseExportQuery,
  expenseReturnTo,
}: ExpenseTabUIProps) {
  const {
    currentIncome,
    currentExpense,
    balanceValue,
    trendPct,
    budgetLimit,
    overBudget,
    sortedCategories,
    transactions,
    expenseSummaryMonth,
    totalsByMonth,
  } = dashboard;

  const trendLabel = trendPct === null ? "Ổn định" : trendPct >= 0 ? `+${trendPct.toFixed(1)}%` : `-${Math.abs(trendPct).toFixed(1)}%`;
  const trendTone = trendPct === null ? "neutral" : trendPct >= 0 ? "negative" : "positive";
  const balanceTone = balanceValue >= 0 ? "positive" : "negative";
  const monthContext = expenseMonthFilter === "all" ? "toàn bộ lịch sử" : expenseMonthFilter;
  const incomeSeries = totalsByMonth.map((item) => item.income);
  const expenseSeries = totalsByMonth.map((item) => item.expense);

  return (
    <div className="grid gap-6">
      <HeroSummary
        eyebrow="Expense"
        title="Tổng quan dòng tiền"
        description={`Theo dõi thu, chi và số dư ròng cho ${monthContext}.`}
        primaryLabel="Số dư ròng"
        primaryValue={<MoneyValue value={balanceValue} signed size="xl" tone={balanceTone} className="text-white" currencyClassName="text-white/70" />}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Tổng thu nhập" value={<MoneyValue value={currentIncome} size="xl" tone="neutral" />} badge={<ChangeBadge label="Dòng vào" tone="positive" />} caption="Tổng tiền vào trong kỳ" icon={<ArrowUp className="h-5 w-5" aria-hidden="true" />} tone="positive" sparklineValues={incomeSeries} />
        <KpiCard label="Chi tiêu" value={<MoneyValue value={currentExpense} size="xl" tone="neutral" />} badge={<ChangeBadge label={trendLabel} tone={trendTone} />} caption={trendTone === "negative" ? "Chi cao hơn kỳ trước" : "Chi thấp hơn kỳ trước"} icon={<ArrowDown className="h-5 w-5" aria-hidden="true" />} tone="negative" sparklineValues={expenseSeries} delay={0.05} />
      </section>

      {overBudget ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
          Cảnh báo: bạn đã vượt ngân sách tháng này {formatMoneyValue(currentExpense - budgetLimit)}.
        </div>
      ) : null}

      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-12 grid gap-6 xl:col-span-8">
          <ExpenseCategoryBreakdown sortedCategories={sortedCategories} currentExpense={currentExpense} budgetLimit={budgetLimit} />

          <SectionCard
            title="Giao dịch gần đây"
            eyebrow="Dòng tiền theo thời gian"
            action={<ExpenseFilterAction expenseMonthFilter={expenseMonthFilter} recentMonths={recentMonths} expenseExportQuery={expenseExportQuery} />}
          >
            <ExpenseTransactionList transactions={transactions} expenseCategories={expenseCategories} expenseCategoryFilter={expenseCategoryFilter} expenseReturnTo={expenseReturnTo} />
          </SectionCard>
        </div>

        <aside className="col-span-12 grid gap-6 xl:sticky xl:top-4 xl:col-span-4">
          <SectionCard>
            <BudgetForm month={expenseMonthFilter === "all" ? expenseSummaryMonth : expenseMonthFilter} currentLimit={budgetLimit} embedded />
          </SectionCard>
          <SectionCard>
            <TransactionForm embedded />
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
