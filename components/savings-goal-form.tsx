"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { addSavingsGoal } from "@/app/actions";
import { MoneyInput } from "@/components/money-input";
import { formatVnd } from "@/lib/finance";

const TERM_OPTIONS = [1, 3, 6, 12, 24, 36] as const;
const AMOUNT_PRESETS = [
  { label: "100 triệu", value: 100_000_000 },
  { label: "300 triệu", value: 300_000_000 },
  { label: "500 triệu", value: 500_000_000 },
] as const;

const FIELD =
  "rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-white/5 dark:bg-[#0a0f1d]";
const LABEL = "block text-xs font-bold text-slate-500";
const INPUT =
  "mt-2 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-300 focus-visible:!outline-none focus-visible:!ring-0 dark:text-white";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="h-12 rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-slate-950"
    >
      {pending ? "Đang tạo..." : "Tạo mục tiêu"}
    </button>
  );
}

function CompactMoney({ value, signed = false }: { value: number; signed?: boolean }) {
  return (
    <span className="inline-flex max-w-full flex-wrap items-baseline gap-x-1 gap-y-0.5 leading-tight">
      <span className="shrink-0 whitespace-nowrap">{signed && value > 0 ? "+" : ""}{formatVnd(value)}</span>
      <span className="shrink-0 text-xs font-bold opacity-65">VND</span>
    </span>
  );
}

export function SavingsGoalForm() {
  const [name, setName] = useState("");
  const [initialAmount, setInitialAmount] = useState<number | null>(null);
  const [interestRate, setInterestRate] = useState("7.00");
  const [termMonths, setTermMonths] = useState<number | "">(12);
  const [openDate, setOpenDate] = useState(() => new Date().toISOString().slice(0, 10));

  const rate = Number(interestRate.replace(",", "."));
  const amount = initialAmount ?? 0;
  const term = typeof termMonths === "number" ? termMonths : 12;
  const projectedInterest = useMemo(() => {
    if (!amount || !Number.isFinite(rate)) return 0;
    return termMonths === "" ? amount * (rate / 100) * (30 / 365) : amount * (rate / 100) * (term / 12);
  }, [amount, rate, term, termMonths]);
  const projectedTotal = amount + projectedInterest;
  const displayName = name.trim() || "Chưa đặt tên";
  const termLabel = termMonths === "" ? "Không kỳ hạn" : `${term} tháng`;
  const maturityLabel = useMemo(() => {
    if (!openDate) return "Chưa chọn ngày";
    if (termMonths === "") return "Linh hoạt";

    const date = new Date(openDate);
    date.setMonth(date.getMonth() + term);
    return date.toLocaleDateString("vi-VN");
  }, [openDate, term, termMonths]);
  const isReady = name.trim().length >= 2 && amount >= 1_000_000 && rate > 0 && rate <= 20 && Boolean(openDate);

  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-5 rounded-[28px] border border-white/70 bg-white/88 p-5 text-left shadow-sm shadow-slate-200/60 backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-[#111827]/80 dark:shadow-none">
      <div className="grid min-w-0 content-start gap-5">
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold text-emerald-700 dark:text-emerald-300">Tạo mục tiêu</p>
          <h2 className="m-0 mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Sổ tiết kiệm mới</h2>
          <p className="m-0 mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
            Nhập số tiền, lãi suất và kỳ hạn để theo dõi mục tiêu.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-500/10 dark:bg-emerald-500/5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
              <span className="block text-xs font-bold text-emerald-700">Cuối kỳ dự kiến</span>
              <p className="m-0 mt-2 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                <CompactMoney value={projectedTotal} />
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-2 text-left sm:text-right dark:bg-[#0a0f1d]">
              <span className="block text-[11px] font-bold text-slate-500">Lãi</span>
              <span className="mt-1 block text-sm font-bold text-emerald-700"><CompactMoney value={projectedInterest} signed /></span>
            </div>
          </div>
          <div className="mt-5 grid gap-3 border-t border-emerald-100 pt-4 text-sm font-bold dark:border-emerald-500/10">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <span className="text-slate-500">Mục tiêu</span>
              <span className="min-w-0 truncate text-right text-slate-950 dark:text-white" title={displayName}>{displayName}</span>
            </div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <span className="text-slate-500">Gốc</span>
              <span className="min-w-0 text-right text-slate-950 dark:text-white"><CompactMoney value={amount} /></span>
            </div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <span className="text-slate-500">Lãi suất</span>
              <span className="min-w-0 text-right text-slate-950 dark:text-white">{Number.isFinite(rate) ? rate.toFixed(2) : "0.00"}%/năm</span>
            </div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <span className="text-slate-500">Kỳ hạn</span>
              <span className="min-w-0 text-right text-slate-950 dark:text-white">{termLabel}</span>
            </div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <span className="text-slate-500">Ngày tất toán</span>
              <span className="min-w-0 text-right text-slate-950 dark:text-white">{maturityLabel}</span>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-slate-600 dark:bg-[#0a0f1d] dark:text-slate-300">
            {isReady ? "Sẵn sàng tạo mục tiêu" : "Cần tên mục tiêu và số tiền từ 1.000.000 VND"}
          </div>
        </div>
      </div>

      <form action={addSavingsGoal} className="grid min-w-0 content-start gap-4">
        <label className={FIELD}>
          <span className={LABEL}>Tên mục tiêu</span>
          <input
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="VD: Quỹ học vấn"
            className={INPUT}
          />
        </label>

        <label className={FIELD}>
          <span className={LABEL}>Số tiền khởi điểm</span>
          <div className="mt-2 flex items-center gap-2">
            <MoneyInput
              name="initialAmount"
              value={initialAmount}
              onValueChange={setInitialAmount}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none focus-visible:!outline-none focus-visible:!ring-0 dark:text-white"
            />
            <span className="text-xs font-bold text-slate-400">VND</span>
          </div>
        </label>

        <div className="flex flex-wrap gap-2">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setInitialAmount(preset.value)}
              className={`h-9 rounded-2xl border px-3 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                initialAmount === preset.value
                  ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-300"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
          <label className={FIELD}>
            <span className={LABEL}>Lãi suất/năm</span>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={interestRate}
                onChange={(event) => setInterestRate(event.target.value.replace(/[^\d.,]/g, ""))}
                onBlur={() => {
                  const parsed = Number(interestRate.replace(",", "."));
                  setInterestRate(Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0.1), 20).toFixed(2) : "7.00");
                }}
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none focus-visible:!outline-none focus-visible:!ring-0 dark:text-white"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
            <input type="hidden" name="interestRate" value={Number.isFinite(rate) ? rate.toFixed(2) : "7.00"} />
          </label>

          <label className={FIELD}>
            <span className={LABEL}>Kỳ hạn</span>
            <select name="termMonths" value={termMonths} onChange={(event) => setTermMonths(event.target.value ? Number(event.target.value) : "")} className={INPUT}>
              <option value="">Không kỳ hạn</option>
              {TERM_OPTIONS.map((item) => (
                <option key={item} value={item}>{item} tháng</option>
              ))}
            </select>
          </label>
        </div>

        <label className={FIELD}>
          <span className={LABEL}>Ngày mở sổ</span>
          <input type="date" name="openDate" value={openDate} onChange={(event) => setOpenDate(event.target.value)} className={INPUT} />
        </label>

        <SubmitButton disabled={!isReady} />
      </form>
    </section>
  );
}
