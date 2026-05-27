"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { addSavingsEntry } from "@/app/actions";
import { MoneyInput } from "@/components/money-input";

type SavingsEntryFormProps = {
  goals: { id: string; name: string; currentAmount?: number }[];
  initialAction?: "DEPOSIT" | "WITHDRAW";
  defaultGoalId?: string;
  onCancel?: () => void;
};

function formatVnd(value: number) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

function SubmitButton({ disabled, disabledReason }: { disabled: boolean; disabledReason: string | null }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="h-12 flex-1 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:pointer-events-none disabled:opacity-45 dark:bg-white dark:text-slate-950"
      disabled={disabled || pending}
      title={disabledReason ?? undefined}
    >
      {pending ? "Đang xử lý..." : "Lưu giao dịch"}
    </button>
  );
}

export function SavingsEntryForm({ goals, initialAction = "DEPOSIT", defaultGoalId, onCancel }: SavingsEntryFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedGoal, setSelectedGoal] = useState("");
  const [action, setAction] = useState<"DEPOSIT" | "WITHDRAW">(initialAction);
  const [amount, setAmount] = useState<number | null>(null);
  const [amountTouched, setAmountTouched] = useState(false);
  const [occurredAt, setOccurredAt] = useState(today);

  useEffect(() => setAction(initialAction), [initialAction]);

  useEffect(() => {
    if (goals.length === 0) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem("lastSavingsGoal") : null;
    const match = defaultGoalId || (stored && goals.some((goal) => goal.id === stored) ? stored : goals[0].id);
    setSelectedGoal(match);
  }, [goals, defaultGoalId]);

  const amountValue = amount ?? 0;
  const amountValid = amount !== null && amount > 0;
  const missingGoal = !selectedGoal;

  const balanceAfter = useMemo(() => {
    const goal = goals.find((item) => item.id === selectedGoal);
    if (!goal || !Number.isFinite(goal.currentAmount)) return null;
    const delta = action === "WITHDRAW" ? -amountValue : amountValue;
    return Number(goal.currentAmount) + delta;
  }, [goals, selectedGoal, action, amountValue]);

  const disabledReason = missingGoal ? "Vui lòng chọn mục tiêu" : !amountValid ? "Nhập số tiền hợp lệ" : null;

  return (
    <form action={addSavingsEntry} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
            <span className="block text-xs font-bold text-slate-500">Mục tiêu</span>
            <select
              name="goalId"
              required
              className="mt-2 w-full bg-transparent text-sm font-bold text-slate-950 outline-none focus-visible:!outline-none focus-visible:!ring-0 dark:text-white"
              value={selectedGoal}
              onChange={(event) => {
                const next = event.target.value;
                setSelectedGoal(next);
                if (typeof window !== "undefined") localStorage.setItem("lastSavingsGoal", next);
              }}
            >
              <option value="" disabled>Chọn mục tiêu</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>{goal.name}</option>
              ))}
            </select>
          </label>

          <label className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
            <span className="block text-xs font-bold text-slate-500">Hành động</span>
            <select
              name="action"
              className="mt-2 w-full bg-transparent text-sm font-bold text-slate-950 outline-none focus-visible:!outline-none focus-visible:!ring-0 dark:text-white"
              value={action}
              onChange={(event) => setAction(event.target.value === "WITHDRAW" ? "WITHDRAW" : "DEPOSIT")}
            >
              <option value="DEPOSIT">Nạp thêm</option>
              <option value="WITHDRAW">Rút ra</option>
            </select>
          </label>
        </div>

        <label className="block rounded-[24px] bg-slate-950 px-5 py-4 text-white dark:bg-[#0a0f1d]">
          <span className="block text-xs font-bold text-slate-400">Số tiền giao dịch</span>
          <div className="mt-3 flex items-center gap-3">
            <MoneyInput
              name="amount"
              placeholder="0"
              required
              className="min-w-0 flex-1 bg-transparent text-3xl font-bold tracking-tight text-white outline-none placeholder:text-slate-600 focus-visible:!outline-none focus-visible:!ring-0"
              onValueChange={(value) => {
                setAmount(value);
                setAmountTouched(true);
              }}
            />
            <span className="text-xs font-bold text-slate-500">VND</span>
          </div>
        </label>
        {amountTouched && !amountValid ? <p className="px-1 text-sm font-semibold text-rose-600">Vui lòng nhập số tiền hợp lệ.</p> : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
            <span className="block text-xs font-bold text-slate-500">Ngày</span>
            <input
              type="date"
              name="occurredAt"
              className="mt-2 w-full bg-transparent text-sm font-bold text-slate-950 outline-none focus-visible:!outline-none focus-visible:!ring-0 dark:text-white"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              required
            />
          </label>
          <label className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
            <span className="block text-xs font-bold text-slate-500">Ghi chú</span>
            <input
              name="note"
              placeholder="Tùy chọn..."
              className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus-visible:!outline-none focus-visible:!ring-0 dark:text-slate-200"
            />
          </label>
        </div>

        <div className={`rounded-[22px] border p-4 ${action === "WITHDRAW" ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
          <div className="mb-3 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${action === "WITHDRAW" ? "bg-rose-500" : "bg-emerald-500"}`} />
            <h4 className="m-0 text-sm font-bold text-slate-800">Dự kiến thay đổi</h4>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-slate-600">Số tiền {action === "WITHDRAW" ? "rút" : "nạp"}</span>
              <span className={`font-bold ${action === "WITHDRAW" ? "text-rose-700" : "text-emerald-700"}`}>
                {amountValid ? `${action === "WITHDRAW" ? "-" : "+"}${formatVnd(amountValue)} VND` : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/70 pt-3">
              <span className="font-medium text-slate-600">Số dư sau giao dịch</span>
              <span className="font-bold text-slate-950">{balanceAfter !== null && amountValid ? `${formatVnd(balanceAfter)} VND` : "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-white/5 dark:bg-[#111827]">
        {onCancel ? (
          <button
            type="button"
            className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-300"
            onClick={onCancel}
          >
            Hủy bỏ
          </button>
        ) : null}
        <SubmitButton disabled={goals.length === 0 || missingGoal || !amountValid} disabledReason={disabledReason} />
      </div>
    </form>
  );
}
