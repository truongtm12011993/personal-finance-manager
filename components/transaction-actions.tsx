"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteTransaction, updateTransaction } from "@/app/actions";
import { ConfirmForm } from "@/components/confirm-form";
import { ActionMenu } from "@/components/fintech-ui";
import { MoneyInput } from "@/components/money-input";
import { Modal, useModal } from "@/components/modal-root";

type TxActionsProps = {
  tx: {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    category: string;
    note: string | null;
    occurredAt: Date | string;
  };
  returnTo: string;
};

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

export function TransactionActions({ tx, returnTo }: TxActionsProps) {
  const { open: modalOpen, setOpen: setModalOpen, ready } = useModal();
  const [type, setType] = useState(tx.type);
  const [category, setCategory] = useState(tx.category);
  const [note, setNote] = useState(tx.note ?? "");
  const [occurredAt, setOccurredAt] = useState(new Date(tx.occurredAt).toISOString().slice(0, 10));
  const [amountTouched, setAmountTouched] = useState(false);

  const initialRef = useRef({
    type: tx.type,
    category: tx.category,
    note: tx.note ?? "",
    occurredAt: new Date(tx.occurredAt).toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!modalOpen) return;
    const initial = {
      type: tx.type,
      category: tx.category,
      note: tx.note ?? "",
      occurredAt: new Date(tx.occurredAt).toISOString().slice(0, 10),
    };

    initialRef.current = initial;
    setType(initial.type);
    setCategory(initial.category);
    setNote(initial.note);
    setOccurredAt(initial.occurredAt);
    setAmountTouched(false);
  }, [modalOpen, tx]);

  const hasChanges =
    type !== initialRef.current.type ||
    category !== initialRef.current.category ||
    note !== initialRef.current.note ||
    occurredAt !== initialRef.current.occurredAt ||
    amountTouched;

  const titleAmount = useMemo(() => `${tx.type === "INCOME" ? "+" : "-"}${formatVnd(tx.amount)} ₫`, [tx]);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="relative inline-block">
      <ActionMenu
        triggerClassName="border-0 bg-transparent text-slate-500 shadow-none hover:bg-slate-50 hover:text-slate-900"
        items={[
          {
            label: "Sửa",
            icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
            onSelect: () => setModalOpen(true),
          },
          {
            label: "Xóa",
            tone: "danger",
            render: (className) => (
              <ConfirmForm action={deleteTransaction} confirmMessage="Bạn có chắc chắn muốn xóa giao dịch này không?">
                <input type="hidden" name="id" value={tx.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button type="submit" className={className}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Xóa
                </button>
              </ConfirmForm>
            ),
          },
        ]}
      />

      {modalOpen && ready && (
        <Modal onClose={closeModal} maxWidth={520} closeOnOverlayClick={false} closeOnEscape={false}>
          <div className="mx-auto flex max-h-[calc(100dvh-48px)] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-2xl shadow-slate-950/15 dark:border-white/5 dark:bg-[#111827]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">
              <div className="min-w-0">
                <h3 className="m-0 text-lg font-bold tracking-tight text-slate-950 dark:text-white">Chi tiết giao dịch</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Giá trị gốc: <span className={tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}>{titleAmount}</span>
                </p>
              </div>
              <button
                type="button"
                data-modal-close="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-400 dark:hover:text-white"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form action={updateTransaction} className="flex min-h-0 flex-1 flex-col">
              <input type="hidden" name="id" value={tx.id} />
              <input type="hidden" name="returnTo" value={returnTo} />

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-3">
                  <label className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
                    <span className="block text-xs font-bold text-slate-500">Loại giao dịch</span>
                    <select
                      name="type"
                      value={type}
                      onChange={(event) => setType(event.target.value as "INCOME" | "EXPENSE")}
                      className={`mt-2 w-full bg-transparent text-sm font-bold outline-none ${type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      <option value="EXPENSE">Chi tiêu</option>
                      <option value="INCOME">Thu nhập</option>
                    </select>
                  </label>
                  <label className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
                    <span className="block text-xs font-bold text-slate-500">Ngày</span>
                    <input
                      type="date"
                      name="occurredAt"
                      value={occurredAt}
                      onChange={(event) => setOccurredAt(event.target.value)}
                      required
                      className="mt-2 w-full bg-transparent text-sm font-bold text-slate-950 outline-none dark:text-white"
                    />
                  </label>
                </div>

                <label className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
                  <span className="block text-xs font-bold text-slate-500">Danh mục</span>
                  <input
                    name="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Ăn uống, Đi lại..."
                    required
                    className="mt-2 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                  />
                </label>

                <label className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
                  <span className="block text-xs font-bold text-slate-500">Số tiền giao dịch</span>
                  <div className="mt-2 flex items-center gap-3">
                    <MoneyInput
                      name="amount"
                      defaultValue={formatVnd(tx.amount)}
                      placeholder="0"
                      required
                      className="min-w-0 flex-1 bg-transparent text-xl font-bold tracking-tight text-slate-950 outline-none placeholder:text-slate-300 dark:text-white"
                      onValueChange={() => setAmountTouched(true)}
                    />
                    <span className="text-sm font-bold text-slate-400">VND</span>
                  </div>
                </label>

                <label className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10 dark:border-white/5 dark:bg-[#0a0f1d]">
                  <span className="block text-xs font-bold text-slate-500">Ghi chú</span>
                  <input
                    name="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Ghi chú chi tiết..."
                    className="mt-2 w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                  />
                </label>
              </div>

              <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-white/5 dark:bg-[#111827]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-300"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!hasChanges}
                  className="h-12 flex-[1.4] rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-45 dark:bg-white dark:text-slate-950"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
