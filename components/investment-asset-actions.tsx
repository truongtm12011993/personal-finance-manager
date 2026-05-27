"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteInvestmentAsset, updateInvestmentPrice } from "@/app/actions/investment";
import { ConfirmForm } from "@/components/confirm-form";
import { MoneyInput } from "@/components/money-input";
import { Modal, useModal } from "@/components/modal-root";

type AssetActionsProps = {
  asset: {
    id: string;
    symbol: string;
    name: string;
    type: string;
    currency: string;
    currentPrice: number | null;
  };
  returnTo: string;
};

function normalizeType(type: string) {
  const labels: Record<string, string> = {
    STOCK: "Cổ phiếu",
    FUND: "Quỹ đầu tư",
    CRYPTO: "Crypto",
    BOND: "Trái phiếu",
    GOLD: "Vàng",
    OTHER: "Khác",
  };

  return labels[type.toUpperCase()] ?? type;
}

function canUseDecimal(currency: string) {
  return ["USD", "USDT", "USDC", "BTC", "ETH"].includes(currency.toUpperCase());
}

export function InvestmentAssetActions({ asset, returnTo }: AssetActionsProps) {
  const modal = useModal();
  const [price, setPrice] = useState<number | null>(asset.currentPrice);

  useEffect(() => {
    if (!modal.open) return;
    setPrice(asset.currentPrice);
  }, [asset.currentPrice, modal.open]);

  const initialPrice = asset.currentPrice ?? 0;
  const priceValue = price ?? 0;
  const priceChanged = price !== null && Number.isFinite(priceValue) && priceValue >= 0 && priceValue !== initialPrice;
  const assetMeta = useMemo(
    () => [asset.symbol, normalizeType(asset.type), asset.currency].filter(Boolean).join(" · "),
    [asset.currency, asset.symbol, asset.type],
  );

  return (
    <div className="relative flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => modal.setOpen(true)}
        className="h-9 rounded-2xl border border-cyan-200 bg-cyan-50 px-3 text-xs font-bold text-cyan-700 transition hover:-translate-y-0.5 hover:bg-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-200"
      >
        Cập nhật giá
      </button>

      <ConfirmForm action={deleteInvestmentAsset} confirmMessage="Bạn có chắc chắn muốn xóa tài sản này không?">
        <input type="hidden" name="id" value={asset.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className="h-9 rounded-2xl border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:border-rose-500/20 dark:bg-transparent dark:text-rose-300"
        >
          Xóa
        </button>
      </ConfirmForm>

      {modal.open && modal.ready ? (
        <Modal onClose={() => modal.setOpen(false)} maxWidth={440} closeOnOverlayClick={false} closeOnEscape={false}>
          <div className="investment-price-modal mx-auto w-full overflow-hidden rounded-3xl bg-white font-sans text-left shadow-2xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0 space-y-1">
                <h3 className="m-0 text-xl font-bold tracking-tight text-slate-900">Cập nhật giá theo dõi</h3>
                <p className="m-0 truncate text-sm font-semibold text-slate-500">{assetMeta}</p>
              </div>
              <button
                type="button"
                data-modal-close="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-600 active:scale-95"
                aria-label="Đóng"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateInvestmentPrice(formData);
                modal.setOpen(false);
              }}
            >
              <input type="hidden" name="assetId" value={asset.id} />
              <input type="hidden" name="returnTo" value={returnTo} />

              <div className="space-y-4 px-5 py-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Tài sản</div>
                  <div className="mt-2 min-w-0">
                    <div className="truncate text-base font-bold text-slate-950">{asset.name}</div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-500">{asset.symbol}</div>
                  </div>
                </div>

                <label className="block rounded-2xl border border-cyan-200 bg-cyan-50/60 px-4 py-3 transition-all focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
                  <span className="block text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
                    Giá theo dõi ({asset.currency})
                  </span>
                  <div className="mt-2 flex min-w-0 items-center gap-3">
                    <MoneyInput
                      name="currentPrice"
                      value={price}
                      allowDecimal={canUseDecimal(asset.currency)}
                      maxDecimals={8}
                      className="min-w-0 flex-1 bg-transparent text-2xl font-bold tracking-tight text-slate-950 outline-none placeholder:text-slate-300 focus:outline-none focus:ring-0 focus-visible:!outline-none focus-visible:!ring-0"
                      placeholder="0"
                      required
                      autoFocus
                      onValueChange={setPrice}
                    />
                    <span className="shrink-0 text-sm font-bold text-slate-400">{asset.currency}</span>
                  </div>
                </label>

                <p className="m-0 text-sm font-semibold leading-6 text-slate-500">
                  Giá này dùng để tính giá trị danh mục và lãi/lỗ hiện tại. Các thông tin mã, loại và tiền tệ giữ nguyên.
                </p>
              </div>

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50/80 p-5">
                <button
                  type="button"
                  onClick={() => modal.setOpen(false)}
                  className="h-12 flex-1 rounded-2xl border border-slate-200/70 bg-white text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!priceChanged}
                  className="h-12 flex-[1.35] rounded-2xl bg-slate-950 px-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-950/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-30"
                >
                  Xác nhận cập nhật
                </button>
              </div>
            </form>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
