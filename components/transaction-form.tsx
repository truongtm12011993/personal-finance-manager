"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { addTransaction } from "@/app/actions";
import { MoneyInput } from "@/components/money-input";
import { guessExpenseCategory, guessIncomeCategory, numberToVietnameseWords } from "@/lib/finance";

function suggestCategory(note: string, type: string) {
  if (!note.trim()) return type === "INCOME" ? "Thu nhập khác" : "Khác";
  return type === "INCOME" ? guessIncomeCategory(note) : guessExpenseCategory(note);
}

function FieldMsg({ error }: { error: string | null }) {
  return error ? <span className="mt-2 block text-sm font-semibold text-rose-600">{error}</span> : null;
}

type TransactionFormProps = {
  embedded?: boolean;
};

export function TransactionForm({ embedded = false }: TransactionFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [autoCategory, setAutoCategory] = useState(true);
  const [note, setNote] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState<number | null>(null);
  const [categoryVal, setCategoryVal] = useState("");
  const [dateVal, setDateVal] = useState(today);
  const [touched, setTouched] = useState({ amount: false, category: false, date: false });

  const suggestedCategory = useMemo(() => suggestCategory(note, type), [note, type]);
  const errors = {
    amount: touched.amount && (!amount || amount < 1000) ? "Nhập số tiền từ 1.000 VND" : null,
    category: touched.category && !autoCategory && !categoryVal.trim() ? "Nhập danh mục" : null,
    date: touched.date && !dateVal ? "Chọn ngày giao dịch" : null,
  };
  const isValid = amount !== null && amount >= 1000 && dateVal && (autoCategory || categoryVal.trim());
  const fieldFocusClass =
    type === "INCOME"
      ? "focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10"
      : "focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-500/10";

  function touch(field: keyof typeof touched) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleAction(formData: FormData) {
    await addTransaction(formData);
    setAmount(null);
    setNote("");
    setCategoryVal("");
    setDateVal(today);
    setTouched({ amount: false, category: false, date: false });
  }

  return (
    <form
      action={handleAction}
      className={embedded ? "grid min-w-0 gap-5 text-left" : "grid min-w-0 gap-5 rounded-[28px] border border-white/70 bg-white/88 p-5 text-left shadow-sm shadow-slate-200/60 backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-[#111827]/80 dark:shadow-none"}
    >
      <div className="min-w-0">
        <p className="m-0 text-xs font-bold text-rose-700 dark:text-rose-300">Giao dịch</p>
        <h2 className="m-0 mt-1 break-words text-xl font-bold tracking-tight text-slate-950 dark:text-white">Thêm thu chi</h2>
        <p className="m-0 mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">Ghi nhanh số tiền, ngày và nội dung dòng tiền.</p>
      </div>

      <label className={`block min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition ${fieldFocusClass} dark:border-white/5 dark:bg-[#0a0f1d]`}>
        <span className="block text-xs font-bold text-slate-500">Số tiền giao dịch</span>
        <div className="mt-3 flex min-w-0 items-center gap-3">
          <MoneyInput
            name="amount"
            value={amount}
            placeholder="0"
            required
            className="min-w-0 flex-1 bg-transparent text-xl font-bold tracking-tight text-slate-950 outline-none placeholder:text-slate-300 focus-visible:!outline-none focus-visible:!ring-0 dark:text-white"
            onValueChange={(value) => setAmount(value)}
            onBlur={() => touch("amount")}
          />
          <span className="text-xs font-bold text-slate-400">VND</span>
        </div>
        {amount !== null && !errors.amount ? <p className="m-0 mt-3 text-sm font-semibold text-slate-500">{numberToVietnameseWords(amount)}</p> : null}
        <FieldMsg error={errors.amount} />
      </label>

      <input type="hidden" name="type" value={type} />

      <div className="grid min-w-0 grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 dark:border-white/5 dark:bg-[#0a0f1d]">
        <button
          type="button"
          className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 ${type === "EXPENSE" ? "bg-white text-rose-600 shadow-sm dark:bg-[#111827]" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
          onClick={() => setType("EXPENSE")}
        >
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
          Chi tiêu
        </button>
        <button
          type="button"
          className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${type === "INCOME" ? "bg-white text-emerald-600 shadow-sm dark:bg-[#111827]" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
          onClick={() => setType("INCOME")}
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          Thu nhập
        </button>
      </div>

      <div className="grid min-w-0 gap-3">
        <label className={`block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition ${fieldFocusClass} dark:border-white/5 dark:bg-[#0a0f1d]`}>
          <span className="block text-xs font-bold text-slate-500">Thời điểm</span>
          <input
            type="date"
            name="occurredAt"
            value={dateVal}
            required
            className="mt-2 w-full bg-transparent text-sm font-bold text-slate-950 outline-none focus-visible:!outline-none focus-visible:!ring-0 dark:text-white"
            onChange={(event) => setDateVal(event.target.value)}
            onBlur={() => touch("date")}
          />
          <FieldMsg error={errors.date} />
        </label>

        <label className={`block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition ${fieldFocusClass} dark:border-white/5 dark:bg-[#0a0f1d]`}>
          <span className="block text-xs font-bold text-slate-500">Mô tả giao dịch</span>
          <input
            type="text"
            name="note"
            placeholder="VD: Ăn trưa, lương tháng..."
            value={note}
            className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus-visible:!outline-none focus-visible:!ring-0 dark:text-slate-200"
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-white/5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Phân loại tự động</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" checked={autoCategory} onChange={(event) => setAutoCategory(event.target.checked)} />
            <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-cyan-600 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
          </label>
        </div>

        {autoCategory ? (
          <div>
            <span className="block text-xs font-bold text-cyan-600 dark:text-cyan-300">Gợi ý</span>
            <div className="mt-1 text-lg font-bold text-cyan-900 dark:text-cyan-100">{suggestedCategory}</div>
          </div>
        ) : (
          <label className="block">
            <span className="block text-xs font-bold text-cyan-700 dark:text-cyan-300">Danh mục</span>
            <input
              type="text"
              name="category"
              placeholder="VD: Ăn uống, Giải trí..."
              required
              value={categoryVal}
              className="mt-2 w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/10 dark:border-cyan-500/10 dark:bg-[#0a0f1d] dark:text-white"
              onChange={(event) => setCategoryVal(event.target.value)}
              onBlur={() => touch("category")}
            />
            <FieldMsg error={errors.category} />
          </label>
        )}
      </div>

      <input type="hidden" name="category" value={autoCategory ? "AUTO" : categoryVal} />

      <button
        type="submit"
        disabled={!isValid}
        className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:pointer-events-none disabled:opacity-45 dark:bg-white dark:text-slate-950 dark:focus-visible:outline-white"
      >
        Lưu giao dịch
      </button>
    </form>
  );
}
