import { CalendarClock, Landmark, Percent } from "lucide-react";
import { GoalActions } from "@/components/goal-actions";
import { ChangeBadge, EmptyState, HeroSummary, KpiCard, MoneyValue, SectionCard } from "@/components/fintech-ui";
import { SavingsEntryActions } from "@/components/savings-entry-actions";
import { SavingsEntryDialog } from "@/components/savings-entry-dialog";
import { SavingsGoalForm } from "@/components/savings-goal-form";
import { diffDays } from "@/lib/finance";
import { getSavingsDashboard } from "@/lib/server/savings/savings-service";

export default async function SavingsTab() {
  const dashboard = await getSavingsDashboard();
  const savingsGoals = dashboard.goals;
  const savingsEntries = dashboard.entries;
  const { totalSaved, avgSavingsRate, maturingIn90Amount } = dashboard.summary;
  const now = new Date();
  const maturitySeries = [0.35, 0.48, 0.58, 0.68, 0.82, 1].map((factor) => Math.max(1, maturingIn90Amount * factor));
  const rateSeries = [0.72, 0.8, 0.86, 0.92, 0.97, 1].map((factor) => Math.max(0.1, avgSavingsRate * factor));
  const dialogGoals = savingsGoals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    currentAmount: Number(goal.currentAmount),
  }));

  return (
    <div className="grid gap-6">
      <HeroSummary
        eyebrow="Savings"
        title="Tiết kiệm & mục tiêu"
        description="Theo dõi số dư, kỳ hạn sắp đáo hạn và hiệu suất lãi suất của từng mục tiêu."
        primaryLabel="Tổng tiền gửi"
        primaryValue={<MoneyValue value={totalSaved} size="xl" className="text-white" currencyClassName="text-white/70" />}
        actions={
          dialogGoals.length > 0 ? (
            <SavingsEntryDialog
              goals={dialogGoals}
              label="Nạp/rút tiền"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 dark:bg-white dark:text-slate-950"
            />
          ) : null
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          label="Đáo hạn 90 ngày"
          value={<MoneyValue value={maturingIn90Amount} size="xl" />}
          badge={<ChangeBadge label="Sắp tới hạn" tone="warning" />}
          caption="Trong 3 tháng tới"
          icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
          tone="warning"
          sparklineValues={maturitySeries}
          delay={0.05}
        />
        <KpiCard
          label="Lãi suất bình quân"
          value={
            <span className="inline-flex items-baseline gap-1 text-4xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
              +{avgSavingsRate.toFixed(2)}
              <span className="text-base font-bold tracking-normal text-slate-400">%</span>
            </span>
          }
          badge={<ChangeBadge label="Hiệu suất" tone="positive" />}
          caption="Theo các mục tiêu đang mở"
          icon={<Percent className="h-5 w-5" aria-hidden="true" />}
          tone="positive"
          sparklineValues={rateSeries}
          delay={0.1}
        />
      </section>

      <SavingsGoalForm />

      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-12 grid gap-6">
          <SectionCard title="Mục tiêu tiết kiệm" eyebrow="Số dư, lãi dự kiến và tiến độ kỳ hạn">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {savingsGoals.length === 0 ? (
                <EmptyState
                  title="Chưa có mục tiêu tiết kiệm"
                  description="Tạo mục tiêu đầu tiên để theo dõi số dư và lãi dự kiến."
                  className="lg:col-span-2"
                />
              ) : (
                savingsGoals.map((goal) => {
                  const saved = Number(goal.currentAmount);
                  const rate = Number(goal.interestRate ?? 0);
                  const termMonths = goal.termMonths ?? null;
                  const startDate = goal.openDate ? new Date(goal.openDate) : goal.createdAt ? new Date(goal.createdAt) : null;
                  const computedEndDate = startDate && termMonths
                    ? new Date(startDate.getFullYear(), startDate.getMonth() + termMonths, startDate.getDate())
                    : null;
                  const endDate = goal.dueDate ? new Date(goal.dueDate) : computedEndDate;
                  const totalDays = startDate && endDate ? Math.max(1, diffDays(startDate, endDate)) : null;
                  const periodInterest = totalDays !== null
                    ? (saved * rate) / 100 * (totalDays / 365)
                    : termMonths
                      ? (saved * rate) / 100 * (termMonths / 12)
                      : (saved * rate) / 100 / 12;
                  const remainingDays = endDate ? diffDays(now, endDate) : null;
                  const isCompleted = remainingDays !== null && remainingDays <= 0;
                  const timeLabel = endDate ? (isCompleted ? "Đã hoàn thành" : `Còn ${remainingDays} ngày`) : "Không kỳ hạn";
                  const progressPct = isCompleted ? 100 : totalDays && remainingDays !== null
                    ? Math.min(100, Math.max(0, 100 - (Math.max(remainingDays, 0) / totalDays) * 100))
                    : 0;
                  const statusLabel = isCompleted ? "Hoàn thành" : termMonths ? `Kỳ hạn ${termMonths} tháng` : "Linh hoạt";

                  return (
                    <article key={goal.id} className="flex min-h-[300px] flex-col rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/5 dark:bg-[#0f172a]">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Landmark className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="m-0 truncate text-base font-bold tracking-tight text-slate-950 dark:text-white" title={goal.name}>{goal.name}</h3>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              <Percent className="h-3.5 w-3.5" aria-hidden="true" />
                              {rate.toFixed(1)}%/năm
                            </div>
                          </div>
                        </div>
                        <GoalActions
                          goal={{
                            id: goal.id,
                            name: goal.name,
                            interestRate: Number(goal.interestRate ?? 0),
                            termMonths: goal.termMonths ?? null,
                            openDate: goal.openDate ?? null,
                          }}
                        />
                      </div>

                      <div className="grid gap-4 border-y border-slate-200 py-4 sm:grid-cols-2 dark:border-white/5">
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-slate-500">Số dư hiện tại</span>
                          <MoneyValue value={saved} size="md" className="mt-2 text-slate-950 dark:text-white" />
                        </div>
                        <div className="min-w-0 sm:border-l sm:border-slate-200 sm:pl-4 dark:sm:border-white/5">
                          <span className="block text-xs font-bold text-emerald-700 dark:text-emerald-300">Lãi dự kiến</span>
                          <MoneyValue value={periodInterest} signed size="sm" tone="positive" className="mt-2" />
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-3 flex items-end justify-between gap-3">
                          <div>
                            <span className="block text-xs font-bold text-slate-500">{statusLabel}</span>
                            <span className="mt-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">{timeLabel}</span>
                          </div>
                          <span className="text-lg font-bold text-slate-950 dark:text-white">{progressPct.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <SavingsEntryDialog
                          goals={dialogGoals}
                          label="Nạp/rút tiền"
                          defaultGoalId={goal.id}
                          className="flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 active:scale-[0.98] dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-200"
                        />
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </SectionCard>

          <SectionCard title="Giao dịch tiết kiệm gần đây" eyebrow="Nhật ký biến động tiết kiệm">
            <div className="grid gap-3">
              {savingsEntries.length === 0 ? (
                <EmptyState title="Chưa có giao dịch tiết kiệm" description="Các khoản nạp và rút tiền sẽ xuất hiện ở đây." />
              ) : (
                savingsEntries.slice(0, 10).map((entry) => {
                  const isWithdraw = entry.action === "WITHDRAW";

                  return (
                    <article key={entry.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-white/5 dark:bg-[#0f172a]">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${isWithdraw ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {isWithdraw ? "-" : "+"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-slate-950 dark:text-white">{entry.goal?.name ?? "Mục tiêu không xác định"}</div>
                          <div className="text-sm font-medium text-slate-500">{new Date(entry.occurredAt).toLocaleDateString("vi-VN")}</div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                        <div className="text-right">
                          <MoneyValue value={isWithdraw ? -Number(entry.amount) : Number(entry.amount)} signed size="sm" tone={isWithdraw ? "negative" : "positive"} />
                          <div className="mt-1 text-xs font-bold text-slate-400">{isWithdraw ? "Rút tiền" : "Tiền gửi"}</div>
                        </div>
                        <SavingsEntryActions
                          entry={{
                            id: entry.id,
                            action: entry.action as "DEPOSIT" | "WITHDRAW",
                            amount: Number(entry.amount),
                            occurredAt: entry.occurredAt,
                          }}
                        />
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>

      </div>
    </div>
  );
}
