"use client";

import { useEffect, useState } from "react";
import { deleteInvestmentTransaction, updateInvestmentTransaction } from "@/app/actions/investment";
import { ActionMenu } from "@/components/fintech-ui";
import { ConfirmForm } from "@/components/confirm-form";
import { MoneyInput } from "@/components/money-input";
import { Modal, useModal } from "@/components/modal-root";
import { Pencil, Trash2 } from "lucide-react";

type TxActionsProps = {
  tx: {
    id: string;
    assetId: string;
    action: "BUY" | "SELL";
    quantity: number;
    price: number;
    fee: number;
    note?: string | null;
    occurredAt: Date;
    asset: { symbol: string; currency: string };
  };
  returnTo: string;
};

function formatVnd(value: number) {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

export function InvestmentTransactionActions({ tx, returnTo }: TxActionsProps) {
  const modal = useModal();

  const [action, setAction] = useState<"BUY" | "SELL">(tx.action);
  const [occurredAt, setOccurredAt] = useState(new Date(tx.occurredAt).toISOString().slice(0, 10));

  useEffect(() => {
    if (!modal.open) return;
    setAction(tx.action);
    setOccurredAt(new Date(tx.occurredAt).toISOString().slice(0, 10));
  }, [modal.open, tx]);


  return (
    <div className="relative inline-block">
      <ActionMenu
        triggerClassName="h-9 w-9 rounded-lg"
        items={[
          {
            label: "Chỉnh sửa",
            icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
            onSelect: () => modal.setOpen(true),
          },
          {
            label: "Xóa",
            tone: "danger",
            render: (className) => (
              <ConfirmForm action={deleteInvestmentTransaction} confirmMessage="Bạn có chắc chắn muốn xóa giao dịch này không?">
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

      {modal.open && modal.ready ? (
        <Modal onClose={() => modal.setOpen(false)} maxWidth={560} closeOnOverlayClick={false} closeOnEscape={false}>
          <div className="mx-auto flex h-[min(90dvh,720px)] w-full flex-col overflow-hidden rounded-3xl bg-white font-sans text-left">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div className="space-y-1">
                <h3 className="m-0 text-xl font-bold tracking-tight text-slate-900">Hiệu chỉnh giao dịch</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Sửa đổi lệnh {tx.asset.symbol}</span>
              </div>
              <button
                type="button"
                data-modal-close="true"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-600 active:scale-90"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form action={updateInvestmentTransaction} className="flex min-h-0 flex-1 flex-col">
              <input type="hidden" name="id" value={tx.id} />
              <input type="hidden" name="assetId" value={tx.assetId} />
              <input type="hidden" name="returnTo" value={returnTo} />

              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                {/* BUY / SELL Premium Toggle */}
                <div className="flex justify-center">
                  <input type="hidden" name="action" value={action} />
                  <div className="relative flex w-full max-w-xs rounded-full border border-slate-200 bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setAction("BUY")}
                      className={`relative z-10 flex-1 flex items-center justify-center h-10 text-[11px] font-bold uppercase tracking-widest transition-all duration-400 outline-none ${
                        action === "BUY" ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {action === "BUY" && (
                        <div
                          className="absolute inset-0 bg-white rounded-full shadow-lg shadow-slate-200/50 border border-white"
                        />
                      )}
                      <span className="relative z-20">Mua vào</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAction("SELL")}
                      className={`relative z-10 flex-1 flex items-center justify-center h-10 text-[11px] font-bold uppercase tracking-widest transition-all duration-400 outline-none ${
                        action === "SELL" ? "text-rose-600" : "text-slate-400"
                      }`}
                    >
                      {action === "SELL" && (
                        <div
                          className="absolute inset-0 bg-white rounded-full shadow-lg shadow-slate-200/50 border border-white"
                        />
                      )}
                      <span className="relative z-20">Bán ra</span>
                    </button>
                  </div>
                </div>

                {/* 2-Column Grid Sections */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block space-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ngày</span>
                    <input
                      type="date"
                      name="occurredAt"
                      value={occurredAt}
                      onChange={(e) => setOccurredAt(e.target.value)}
                      required
                      className="w-full text-lg font-bold text-slate-900 bg-transparent focus:outline-none tracking-tighter"
                    />
                  </label>
                  <label className="block space-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Số lượng</span>
                    <input
                      name="quantity"
                      defaultValue={tx.quantity.toLocaleString("vi-VN", { maximumFractionDigits: 8 })}
                      required
                      className="w-full text-lg font-bold text-slate-900 bg-transparent focus:outline-none tracking-tighter"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block space-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đơn giá</span>
                    <MoneyInput 
                      name="price" 
                      defaultValue={formatVnd(tx.price)} 
                      required 
                      className="w-full text-lg font-bold text-slate-900 bg-transparent focus:outline-none tracking-tighter" 
                    />
                  </label>
                  <label className="block space-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phí</span>
                    <MoneyInput 
                      name="fee" 
                      defaultValue={formatVnd(tx.fee)} 
                      required 
                      className="w-full text-lg font-bold text-slate-900 bg-transparent focus:outline-none tracking-tighter" 
                    />
                  </label>
                </div>

                <label className="block space-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all focus-within:border-cyan-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ghi chú</span>
                  <textarea
                    name="note"
                    defaultValue={tx.note || ""}
                    placeholder="Ghi lại chi tiết..."
                    className="w-full text-sm font-medium text-slate-600 bg-transparent focus:outline-none placeholder:text-slate-300 leading-relaxed resize-none"
                    rows={3}
                  />
                </label>
              </div>

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50/80 p-6 pt-4">
                <button
                  type="button"
                  onClick={() => modal.setOpen(false)}
                  className="flex-1 h-12 rounded-2xl border border-slate-200/60 bg-white text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-12 flex-[1.5] rounded-2xl bg-slate-950 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-950/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  <span className="flex items-center justify-center gap-2">
                    Lưu thay đổi
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
