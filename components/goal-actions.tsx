"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateSavingsGoal, deleteSavingsGoal } from "@/app/actions";
import { ActionMenu } from "@/components/fintech-ui";
import { ConfirmForm } from "@/components/confirm-form";
import { Modal, useModal } from "@/components/modal-root";
import { Pencil, Trash2 } from "lucide-react";

type GoalActionsProps = {
  goal: {
    id: string;
    name: string;
    interestRate: number | string;
    termMonths?: number | null;
    openDate?: Date | string | null;
  };
};

export function GoalActions({ goal }: GoalActionsProps) {
  const { open: modalOpen, setOpen: setModalOpen, ready } = useModal();
  const [name, setName] = useState(goal.name ?? "");
  const [rate, setRate] = useState(String(goal.interestRate ?? ""));
  const [termMonths, setTermMonths] = useState(String(goal.termMonths ?? ""));
  const [openDate, setOpenDate] = useState(
    goal.openDate ? new Date(goal.openDate).toISOString().slice(0, 10) : ""
  );
  const initialRef = useRef({
    name: goal.name ?? "",
    rate: String(goal.interestRate ?? ""),
    termMonths: String(goal.termMonths ?? ""),
    openDate: goal.openDate ? new Date(goal.openDate).toISOString().slice(0, 10) : "",
  });

  useEffect(() => {
    if (!modalOpen) return;
    const initial = {
      name: goal.name ?? "",
      rate: String(goal.interestRate ?? ""),
      termMonths: String(goal.termMonths ?? ""),
      openDate: goal.openDate ? new Date(goal.openDate).toISOString().slice(0, 10) : "",
    };
    initialRef.current = initial;
    setName(initial.name);
    setRate(initial.rate);
    setTermMonths(initial.termMonths);
    setOpenDate(initial.openDate);
  }, [modalOpen, goal]);

  const hasChanges =
    name !== initialRef.current.name ||
    rate !== initialRef.current.rate ||
    termMonths !== initialRef.current.termMonths ||
    openDate !== initialRef.current.openDate;

  const closeModal = () => setModalOpen(false);

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
              <ConfirmForm action={deleteSavingsGoal} confirmMessage="Bạn có chắc muốn xóa mục tiêu này không?">
                <input type="hidden" name="id" value={goal.id} />
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
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Chỉnh sửa mục tiêu</h3>
                <p className="text-[12px] font-medium text-slate-500 mt-0.5">Mã mục tiêu: <span className="font-bold text-slate-700">{goal.name}</span></p>
              </div>
              <button
                type="button"
                data-modal-close="true"
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 bg-slate-50 hover:text-slate-600 hover:bg-slate-100 transition-all border-none outline-none shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form action={updateSavingsGoal} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <input type="hidden" name="id" value={goal.id} />
              <input type="hidden" name="returnTo" value="/?tab=savings" />

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                <label className="flex flex-col gap-1">
                  <span className="text-[13px] font-medium text-slate-700">Tên mục tiêu / Mã</span>
                  <input
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[13.5px] font-medium focus:!bg-white focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-500/20 focus:!shadow-none outline-none transition-all"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[13px] font-medium text-slate-700">Lãi suất (%/năm)</span>
                    <div className="relative flex items-center">
                      <input
                        className="w-full pl-4 pr-12 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[13.5px] font-medium focus:!bg-white focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-500/20 focus:!shadow-none outline-none transition-all"
                        name="interestRate"
                        type="text"
                        inputMode="decimal"
                        value={rate}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d.,]/g, "");
                          setRate(raw);
                        }}
                      />
                      <span className="absolute right-4 text-[12px] font-medium text-slate-400 pointer-events-none">%</span>
                    </div>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[13px] font-medium text-slate-700">Kỳ hạn</span>
                    <div className="relative flex items-center">
                      <select
                        name="termMonths"
                        value={termMonths}
                        onChange={(e) => setTermMonths(e.target.value)}
                        className="w-full pl-4 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[13.5px] font-medium focus:!bg-white focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-500/20 focus:!shadow-none outline-none transition-all appearance-none"
                      >
                        <option value="">Không kỳ hạn</option>
                        <option value="1">1 tháng</option>
                        <option value="3">3 tháng</option>
                        <option value="6">6 tháng</option>
                        <option value="12">12 tháng</option>
                      </select>
                      <svg className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-[13px] font-medium text-slate-700">Ngày bắt đầu</span>
                  <input
                    type="date"
                    name="openDate"
                    value={openDate}
                    onChange={(e) => setOpenDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[13.5px] font-medium focus:!bg-white focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-500/20 focus:!shadow-none outline-none transition-all"
                  />
                </label>
              </div>

              <div className="px-5 pt-3.5 pb-6 sm:pb-5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-[13px] font-semibold text-slate-600 !bg-white !border !border-solid !border-slate-200 shadow-sm hover:!bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
                  onClick={closeModal}
                >
                  Hủy bỏ
                </button>
                <SaveGoalButton disabled={!hasChanges} />
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SaveGoalButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="w-full sm:w-auto px-6 py-2 rounded-xl bg-slate-950 text-[13px] font-semibold text-white shadow-md shadow-slate-950/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50" disabled={disabled || pending}>
      {pending ? "Đang lưu..." : "Lưu thay đổi"}
    </button>
  );
}
