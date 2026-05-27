import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUp,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { MoneyValue, SectionCard } from "@/components/fintech-ui";
import { monthKey } from "@/lib/finance";
import { requireUserId } from "@/lib/server/auth";
import { getExpenseDashboardForUser } from "@/lib/server/expense/expense-service";
import { getInvestmentDashboardForUser } from "@/lib/server/investment/investment-service";
import { getSavingsDashboardForUser } from "@/lib/server/savings/savings-service";

type MetricTone = "neutral" | "positive" | "negative" | "info";

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.round(value))} VND`;
}

function pct(value: number | null | undefined) {
  return value == null ? "0.0%" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  caption,
  href,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  caption: string;
  href: string;
  icon: React.ReactNode;
  tone?: MetricTone;
}) {
  const toneClass: Record<MetricTone, string> = {
    neutral: "bg-slate-950 text-white",
    positive: "bg-emerald-600 text-white",
    negative: "bg-rose-600 text-white",
    info: "bg-cyan-600 text-white",
  };

  return (
    <Link
      href={href}
      className="group rounded-[22px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/5 dark:bg-[#111827]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
          <div className="mt-4">{value}</div>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClass[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="m-0 mt-4 text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">{caption}</p>
    </Link>
  );
}

export default async function DashboardTab() {
  const userId = await requireUserId();
  const currentMonth = monthKey(new Date());
  const [currentExpense, expenseHistory, investment, savings] = await Promise.all([
    getExpenseDashboardForUser({ month: currentMonth, category: "all" }, userId),
    getExpenseDashboardForUser({ month: "all", category: "all" }, userId),
    getInvestmentDashboardForUser({ month: "all", assetId: "all" }, userId),
    getSavingsDashboardForUser(userId),
  ]);

  const cashBalance = currentExpense.summary.balanceValue;
  const portfolioValue = investment.summary.portfolioMarketValue || investment.summary.portfolioCost;
  const totalSavings = savings.summary.totalSaved;
  const trackedValue = cashBalance + portfolioValue + totalSavings;
  const liquidity = cashBalance + totalSavings;
  const monthlyNet = currentExpense.summary.currentIncome - currentExpense.summary.currentExpense;
  const allocation = [
    { label: "Tiền khả dụng", value: Math.max(0, cashBalance), color: "#334155", href: "/?tab=expense" },
    { label: "Đầu tư", value: Math.max(0, portfolioValue), color: "#0f766e", href: "/?tab=investment" },
    { label: "Tiết kiệm", value: Math.max(0, totalSavings), color: "#4f46e5", href: "/?tab=savings" },
  ];
  const cashflow = expenseHistory.totalsByMonth.map((item) => ({
    month: item.month,
    label: `T${Number(item.month.slice(5))}`,
    income: item.income,
    expense: item.expense,
    net: item.income - item.expense,
    href: `/?tab=expense&expenseMonth=${item.month}&expenseCategory=all`,
  }));
  const riskAlerts = [
    currentExpense.summary.overBudget
      ? { text: "Chi tiêu đã vượt ngân sách tháng này.", href: "/?tab=expense", label: "Xem chi tiêu" }
      : null,
    currentExpense.summary.forecastOverBudget
      ? { text: "Dự báo cuối tháng có thể vượt ngân sách.", href: "/?tab=expense", label: "Xem ngân sách" }
      : null,
    investment.summary.concentrationAlert && investment.summary.topHolding
      ? { text: `Danh mục đầu tư đang tập trung vào ${investment.summary.topHolding.symbol}.`, href: "/?tab=investment", label: "Xem danh mục" }
      : null,
    savings.summary.maturingIn90Amount > 0
      ? { text: `${formatMoney(savings.summary.maturingIn90Amount)} tiết kiệm sắp đáo hạn trong 90 ngày.`, href: "/?tab=savings", label: "Xem tiết kiệm" }
      : null,
  ].filter(Boolean) as Array<{ text: string; href: string; label: string }>;

  return (
    <div className="grid gap-6 sm:gap-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-white/5 dark:bg-[#111827]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="p-5 sm:p-6 lg:p-7">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Dashboard</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
              Tổng quan tài chính
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              Trang này chỉ giữ các tín hiệu quan trọng nhất: giá trị đang theo dõi, dòng tiền tháng, phân bổ tài sản và cảnh báo cần xử lý.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-[#0a0f1d]">
                <span className="text-xs font-bold text-slate-500">Thanh khoản</span>
                <div className="mt-2">
                  <MoneyValue value={liquidity} size="sm" />
                </div>
              </div>
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-[#0a0f1d]">
                <span className="text-xs font-bold text-slate-500">Dòng tiền tháng</span>
                <div className="mt-2">
                  <MoneyValue value={monthlyNet} signed size="sm" tone={monthlyNet >= 0 ? "positive" : "negative"} />
                </div>
              </div>
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 dark:border-white/5 dark:bg-[#0a0f1d]">
                <span className="text-xs font-bold text-slate-500">Lãi/lỗ đầu tư</span>
                <div className="mt-2">
                  <MoneyValue value={investment.summary.totalUnrealizedPnl} signed size="sm" tone={investment.summary.totalUnrealizedPnl >= 0 ? "positive" : "negative"} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-slate-950 p-5 text-white sm:p-6 lg:p-7">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <WalletCards className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                Tổng giá trị hiện có trong app
              </p>
              <div className="mt-3">
                <MoneyValue value={trackedValue} size="xl" tone={trackedValue >= 0 ? "positive" : "negative"} className="text-white" currencyClassName="text-white/55" />
              </div>
            </div>
            <p className="mt-8 text-sm font-medium leading-6 text-white/60">
              Chỉ số này dựa trên dữ liệu thu chi, đầu tư và tiết kiệm đang được quản lý trong app.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
        <MetricCard
          label="Thu nhập tháng"
          value={<MoneyValue value={currentExpense.summary.currentIncome} size="lg" />}
          caption="Dòng tiền vào đã ghi nhận trong tháng hiện tại."
          href="/?tab=expense"
          icon={<ArrowUp className="h-5 w-5" aria-hidden="true" />}
          tone="positive"
        />
        <MetricCard
          label="Chi tiêu tháng"
          value={<MoneyValue value={currentExpense.summary.currentExpense} size="lg" />}
          caption={currentExpense.summary.budgetLimit > 0 ? `Ngân sách: ${formatMoney(currentExpense.summary.budgetLimit)}` : "Chưa đặt ngân sách tháng."}
          href="/?tab=expense"
          icon={<ReceiptText className="h-5 w-5" aria-hidden="true" />}
          tone="negative"
        />
        <MetricCard
          label="Đầu tư"
          value={<MoneyValue value={portfolioValue} size="lg" />}
          caption={investment.summary.topHolding ? `Tỷ trọng lớn nhất: ${investment.summary.topHolding.symbol} ${pct(investment.summary.topHolding.weightPct)}` : "Chưa có tài sản đầu tư."}
          href="/?tab=investment"
          icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
          tone="info"
        />
        <MetricCard
          label="Tiết kiệm"
          value={<MoneyValue value={totalSavings} size="lg" />}
          caption={savings.summary.maturingIn90Amount > 0 ? "Có khoản sắp đáo hạn cần theo dõi." : `${savings.goals.length} mục tiêu đang theo dõi.`}
          href="/?tab=savings"
          icon={<PiggyBank className="h-5 w-5" aria-hidden="true" />}
          tone="neutral"
        />
      </section>

      <DashboardCharts cashflow={cashflow} allocation={allocation} />

      <SectionCard title="Cảnh báo quan trọng" eyebrow="Chỉ hiển thị điều cần xử lý">
        {riskAlerts.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {riskAlerts.map((alert) => (
              <div key={alert.text} className="flex flex-col gap-4 rounded-[22px] border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:border-amber-500/10 dark:bg-amber-500/10 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{alert.text}</span>
                </span>
                <Link href={alert.href} className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-amber-900 px-3 text-xs font-bold text-white transition hover:bg-amber-800 dark:bg-amber-300 dark:text-amber-950">
                  {alert.label}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-[22px] border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-200">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Không có cảnh báo lớn trong dữ liệu hiện tại.
          </div>
        )}
      </SectionCard>
    </div>
  );
}
