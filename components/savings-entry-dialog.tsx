"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { Modal, useModal } from "@/components/modal-root";
import { SavingsEntryForm } from "@/components/savings-entry-form";

type SavingsEntryDialogProps = {
  goals: { id: string; name: string; currentAmount: number }[];
  label?: string;
  initialAction?: "DEPOSIT" | "WITHDRAW";
  defaultGoalId?: string;
  className?: string;
};

export function SavingsEntryDialog({
  goals,
  label = "Thêm giao dịch",
  initialAction = "DEPOSIT",
  defaultGoalId,
  className = "inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-950 hover:text-white active:scale-[0.98]",
}: SavingsEntryDialogProps) {
  const { open, setOpen, ready } = useModal();

  const normalizedGoals = useMemo(
    () => goals.map((goal) => ({ id: goal.id, name: goal.name, currentAmount: Number(goal.currentAmount) })),
    [goals],
  );

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>

      {open && ready ? (
        <Modal onClose={() => setOpen(false)}>
          <div className="mx-auto flex h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-2xl shadow-slate-950/15 dark:border-white/5 dark:bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">
              <div className="min-w-0">
                <h3 className="m-0 text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                  {initialAction === "WITHDRAW" ? "Rút tiền tiết kiệm" : "Nạp tiền tiết kiệm"}
                </h3>
                <p className="m-0 mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Ghi nhận biến động cho từng mục tiêu.
                </p>
              </div>
              <button
                type="button"
                data-modal-close="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-400"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {normalizedGoals.length > 0 ? (
                <SavingsEntryForm goals={normalizedGoals} initialAction={initialAction} defaultGoalId={defaultGoalId} onCancel={() => setOpen(false)} />
              ) : (
                <div className="p-5">
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
                    Bạn cần tạo ít nhất một mục tiêu trước khi thêm giao dịch.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
