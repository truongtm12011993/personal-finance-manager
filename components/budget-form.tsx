"use client";

import { setBudget } from "@/app/actions";
import { MoneyInput } from "@/components/money-input";

type BudgetFormProps = {
  month: string;
  currentLimit: number;
  embedded?: boolean;
};

const FIELD =
  "rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-500/10 dark:border-white/5 dark:bg-[#0a0f1d]";

function formatMonth(month: string) {
  if (!month || !month.includes("-")) return "Toàn bộ lịch sử";
  const [year, value] = month.split("-");
  return `Tháng ${value}/${year}`;
}

function formatMoney(value: number) {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export function BudgetForm({ month, currentLimit, embedded = false }: BudgetFormProps) {
  const dailyLimit = Math.round(currentLimit / 30);
  const weeklyLimit = Math.round(currentLimit / 4);

  return (
    <form
      action={setBudget}
      className={embedded ? "grid gap-4 text-left" : "grid gap-5 rounded-[28px] border border-white/70 bg-white/88 p-5 text-left shadow-sm shadow-slate-200/60 backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-[#111827]/80 dark:shadow-none"}
    >
      <div>
        <p className="m-0 text-xs font-bold text-rose-700 dark:text-rose-300">Ngân sách</p>
        <h2 className="m-0 mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Hạn mức tháng</h2>
        <p className="m-0 mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{formatMonth(month)}</p>
      </div>

      {currentLimit > 0 ? (
        <div className="border-y border-slate-200 py-4 dark:border-white/5">
          <span className="block text-xs font-bold text-rose-700 dark:text-rose-300">Hạn mức hiện tại</span>
          <p className="m-0 mt-2 text-xl font-bold text-slate-950 dark:text-white">{formatMoney(currentLimit)}</p>
          <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
              <span>Theo ngày</span>
              <span className="min-w-0 break-words text-right">{formatMoney(dailyLimit)}</span>
            </div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
              <span>Theo tuần</span>
              <span className="min-w-0 break-words text-right">{formatMoney(weeklyLimit)}</span>
            </div>
          </div>
        </div>
      ) : null}

      <input type="hidden" name="month" value={month} />

      <label className={FIELD}>
        <span className="block text-xs font-bold text-slate-500">Giới hạn chi tiêu</span>
        <div className="mt-2 flex items-center gap-2">
          <MoneyInput
            name="limit"
            defaultValue={currentLimit ? currentLimit.toLocaleString("vi-VN") : ""}
            required
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-300 focus-visible:!outline-none focus-visible:!ring-0 dark:text-white"
            placeholder="0"
          />
          <span className="text-xs font-bold text-slate-400">VND</span>
        </div>
      </label>

      <button
        type="submit"
        className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 dark:bg-white dark:text-slate-950"
      >
        Cập nhật ngân sách
      </button>
    </form>
  );
}
