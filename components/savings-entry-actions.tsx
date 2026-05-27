"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { updateSavingsEntry, deleteSavingsEntry } from "@/app/actions";
import { ActionMenu } from "@/components/fintech-ui";
import { ConfirmForm } from "@/components/confirm-form";
import { MoneyInput } from "@/components/money-input";
import { Modal, useModal } from "@/components/modal-root";
import { Pencil, Trash2 } from "lucide-react";

type EntryActionsProps = {
  entry: {
    id: string;
    action: "DEPOSIT" | "WITHDRAW";
    amount: number;
    note?: string | null;
    occurredAt: Date;
  };
};

function formatVnd(value: number) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

export function SavingsEntryActions({ entry }: EntryActionsProps) {
  const { open: modalOpen, setOpen: setModalOpen, ready } = useModal();
  const [action, setAction] = useState(entry.action);
  const [amount, setAmount] = useState<number | null>(entry.amount ?? null);
  const [note, setNote] = useState(entry.note ?? "");
  const [occurredAt, setOccurredAt] = useState(
    entry.occurredAt ? new Date(entry.occurredAt).toISOString().slice(0, 10) : ""
  );
  const [amountTouched, setAmountTouched] = useState(false);
  const initialRef = useRef({
    action: entry.action, amount: entry.amount ?? 0,
    note: entry.note ?? "",
    occurredAt: entry.occurredAt ? new Date(entry.occurredAt).toISOString().slice(0, 10) : "",
  });

  useEffect(() => {
    if (!modalOpen) return;
    const initial = {
      action: entry.action, amount: entry.amount ?? 0,
      note: entry.note ?? "",
      occurredAt: entry.occurredAt ? new Date(entry.occurredAt).toISOString().slice(0, 10) : "",
    };
    initialRef.current = initial;
    setAction(initial.action); setAmount(initial.amount || null);
    setNote(initial.note); setOccurredAt(initial.occurredAt); setAmountTouched(false);
  }, [modalOpen, entry]);

  const amountValid = amount !== null && amount > 0;
  const hasChanges =
    action !== initialRef.current.action || (amount ?? 0) !== initialRef.current.amount ||
    note !== initialRef.current.note || occurredAt !== initialRef.current.occurredAt;

  const titleAmount = useMemo(() => amount === null ? "-" : `${formatVnd(amount)} ₫`, [amount]);
  const closeModal = () => setModalOpen(false);

  const LBL = "text-[13px] font-medium text-slate-700 block mb-1";
  const INP = "w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[13.5px] font-medium focus:!bg-white focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-500/20 focus:!shadow-none outline-none transition-all";

  return (
    <div className="relative inline-block">
      <ActionMenu
        triggerClassName="border-0 bg-transparent text-cyan-500 shadow-none hover:bg-cyan-50 hover:text-cyan-600"
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
              <ConfirmForm action={deleteSavingsEntry} confirmMessage="Bạn có chắc muốn xóa giao dịch này không?">
                <input type="hidden" name="id" value={entry.id} />
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
        <Modal onClose={closeModal} closeOnOverlayClick={false} closeOnEscape={false}>
          <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Chỉnh sửa giao dịch
                </h3>
                <p className="text-[12px] font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                  Giá trị: <strong className="text-slate-900 font-bold">{titleAmount}</strong>
                </p>
              </div>
              <button
                type="button"
                data-modal-close="true"
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 bg-slate-50 hover:text-slate-600 hover:bg-slate-100 transition-all border-none outline-none flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form action={updateSavingsEntry} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <input type="hidden" name="id" value={entry.id} />
              <input type="hidden" name="returnTo" value="/?tab=savings" />

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LBL}>Hành động</label>
                    <div className="relative">
                      <select
                        name="action"
                        value={action}
                        className={`${INP} appearance-none pr-10 cursor-pointer ${action === "WITHDRAW" ? "!text-rose-600" : "!text-emerald-600"}`}
                        onChange={(e) => setAction(e.target.value as "DEPOSIT" | "WITHDRAW")}
                      >
                        <option value="DEPOSIT">Nạp thêm</option>
                        <option value="WITHDRAW">Rút ra</option>
                      </select>
                      <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>

                  <div>
                    <label className={LBL}>Số tiền</label>
                    <div className="relative flex items-center">
                      <MoneyInput
                        name="amount"
                        defaultValue={amount ?? undefined}
                        inputMode="numeric"
                        className={`${INP} pr-16 text-lg tracking-tight font-bold placeholder:text-slate-300 placeholder:font-medium`}
                        onValueChange={(v) => { setAmount(v); setAmountTouched(true); }}
                      />
                      <span className="absolute right-4 text-slate-400 font-semibold text-[10px] pointer-events-none">VND</span>
                    </div>
                    {amountTouched && !amountValid && <p className="text-rose-500 text-[12px] font-medium mt-1 ml-1">⚠ Số tiền không hợp lệ</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LBL}>Ngày giao dịch</label>
                    <input
                      type="date"
                      name="occurredAt"
                      className={INP}
                      value={occurredAt}
                      onChange={(e) => setOccurredAt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LBL}>Ghi chú</label>
                    <input
                      name="note"
                      className={INP}
                      value={note}
                      maxLength={100}
                      placeholder="Ghi chú (tùy chọn)..."
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 pt-3.5 pb-6 sm:pb-5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-[13px] font-semibold text-slate-600 !bg-white !border !border-solid !border-slate-200 shadow-sm hover:!bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
                  onClick={closeModal}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="w-full flex-shrink-0 whitespace-nowrap rounded-xl bg-slate-950 px-6 py-2 font-semibold text-white shadow-sm shadow-slate-950/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  disabled={!hasChanges || !amountValid}
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
