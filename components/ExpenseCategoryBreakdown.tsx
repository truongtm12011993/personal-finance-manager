"use client";

import { motion } from "framer-motion";
import { BookOpen, Car, Clapperboard, Home, Receipt, ShoppingBag, Stethoscope, Utensils, Zap } from "lucide-react";
import { EmptyState, MoneyValue, SectionCard, formatMoneyValue } from "@/components/fintech-ui";

function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("ăn") || normalized.includes("thức") || normalized.includes("cơm") || normalized.includes("cafe") || normalized.includes("quán")) return Utensils;
  if (normalized.includes("di chuyển") || normalized.includes("grab") || normalized.includes("xe") || normalized.includes("xăng") || normalized.includes("taxi")) return Car;
  if (normalized.includes("mua sắm") || normalized.includes("quần") || normalized.includes("áo") || normalized.includes("shop")) return ShoppingBag;
  if (normalized.includes("điện") || normalized.includes("nước") || normalized.includes("internet") || normalized.includes("phone")) return Zap;
  if (normalized.includes("y tế") || normalized.includes("thuốc") || normalized.includes("bệnh") || normalized.includes("sức khỏe")) return Stethoscope;
  if (normalized.includes("giáo dục") || normalized.includes("học") || normalized.includes("sách") || normalized.includes("khóa")) return BookOpen;
  if (normalized.includes("giải trí") || normalized.includes("game") || normalized.includes("phim") || normalized.includes("nhạc")) return Clapperboard;
  if (normalized.includes("nhà") || normalized.includes("thuê") || normalized.includes("phòng")) return Home;

  return Receipt;
}

export interface ExpenseCategoryBreakdownProps {
  sortedCategories: [string, number][];
  currentExpense: number;
  budgetLimit: number;
}

export function ExpenseCategoryBreakdown({
  sortedCategories,
  currentExpense,
  budgetLimit,
}: ExpenseCategoryBreakdownProps) {
  const topCategories = sortedCategories.slice(0, 4);
  const largestCategory = topCategories[0] ?? null;

  return (
    <SectionCard
      title="Cơ cấu chi tiêu"
      eyebrow="Phân tích tỷ trọng chi phí"
      action={largestCategory ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-right text-rose-700">
          <span className="block text-xs font-bold">Chi nhiều nhất</span>
          <span className="mt-1 block max-w-[180px] truncate text-sm font-bold">{largestCategory[0]}</span>
        </div>
      ) : null}
    >
      {topCategories.length === 0 ? (
        <EmptyState title="Chưa ghi nhận dữ liệu chi tiêu" description="Các danh mục chi sẽ xuất hiện khi có giao dịch mới." />
      ) : (
        <div className="grid gap-3">
          {topCategories.map(([category, value]) => {
            const pct = currentExpense > 0 ? (value / currentExpense) * 100 : 0;
            const remainingBudget = budgetLimit > 0 ? Math.max(0, budgetLimit - value) : null;
            const Icon = getCategoryIcon(category);

            return (
              <article key={category} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/5 dark:bg-[#0f172a]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="m-0 truncate text-base font-bold text-slate-950 dark:text-white">{category}</p>
                      <p className="m-0 mt-1 text-sm font-semibold text-slate-500">
                        {remainingBudget !== null ? `Còn ${formatMoneyValue(remainingBudget)} ngân sách` : "Theo dõi chi tiết"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <MoneyValue value={value} size="sm" />
                    <span className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-rose-500"
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

export default ExpenseCategoryBreakdown;
