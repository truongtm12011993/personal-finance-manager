"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { addInvestmentTransaction } from "@/app/actions/investment";
import { MoneyInput } from "@/components/money-input";

type AssetOption = {
  id: string;
  symbol: string;
  name: string;
  currency: string;
  currentPrice?: number | null;
  ownedQuantity?: number;
  unrealizedPnl?: number;
  marketValue?: number;
  weightPct?: number;
};

type InvestmentTransactionFormProps = {
  assets: AssetOption[];
  defaultAssetId?: string;
  lockAssetSelection?: boolean;
};

function formatQty(value: number) {
  return value.toLocaleString("vi-VN", { maximumFractionDigits: 8 });
}

export function InvestmentTransactionForm({
  assets,
  defaultAssetId = "",
  lockAssetSelection = false,
}: InvestmentTransactionFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [assetId, setAssetId] = useState(defaultAssetId);
  const [assetQuery, setAssetQuery] = useState("");
  const [assetMenuOpen, setAssetMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(0);

  const comboRef = useRef<HTMLDivElement | null>(null);

  const selectedAsset = assets.find((item) => item.id === assetId);
  const allowDecimal = selectedAsset ? selectedAsset.currency !== "VND" : true;

  useEffect(() => {
    if (defaultAssetId) {
      setAssetId(defaultAssetId);
    }
  }, [defaultAssetId]);

  useEffect(() => {
    if (!selectedAsset) return;
    setAssetQuery(`${selectedAsset.symbol} - ${selectedAsset.name}`);
  }, [selectedAsset, selectedAsset?.id, selectedAsset?.name, selectedAsset?.symbol]);

  useEffect(() => {
    if (!selectedAsset) return;
    setPrice(
      selectedAsset.currentPrice !== null && selectedAsset.currentPrice !== undefined
        ? Number(selectedAsset.currentPrice)
        : null
    );
  }, [selectedAsset, selectedAsset?.id, selectedAsset?.currentPrice]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!comboRef.current) return;
      if (comboRef.current.contains(event.target as Node)) return;
      setAssetMenuOpen(false);
      if (selectedAsset) {
        setAssetQuery(`${selectedAsset.symbol} - ${selectedAsset.name}`);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [selectedAsset]);

  const filteredAssets = useMemo(() => {
    const query = assetQuery.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((item) =>
      `${item.symbol} ${item.name}`.toLowerCase().includes(query)
    );
  }, [assets, assetQuery]);

  const quantityValue = Number(quantity || 0);
  const priceValue = Number(price || 0);
  const feeValue = Number(fee || 0);
  const baseValue = quantityValue * priceValue;
  const totalValue = action === "BUY" ? baseValue + feeValue : Math.max(0, baseValue - feeValue);

  const availableQuantity = Number(selectedAsset?.ownedQuantity || 0);
  const projectedQuantity = action === "BUY" ? availableQuantity + quantityValue : availableQuantity - quantityValue;
  const isSellOverflow = action === "SELL" && quantityValue > availableQuantity;
  const hasNoQuantityToSell = action === "SELL" && availableQuantity <= 0;
  const canSubmit = assets.length > 0 && !!assetId && quantityValue > 0 && priceValue > 0;

  const currencyLabel = selectedAsset?.currency || "VND";
  const toneChipClass =
    action === "BUY"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";
  const inputBaseClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 transition duration-200 ease-out focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative flex h-full min-h-0 flex-col overflow-hidden text-left [font-family:var(--font-app)]"
    >
      <form action={addInvestmentTransaction} className="relative flex h-full min-h-0 flex-col overflow-hidden">
        <input type="hidden" name="action" value={action} />
        <input type="hidden" name="assetId" value={assetId} />
        <input type="hidden" name="returnTo" value="/?tab=investment" />

        <div className="shrink-0 border-b border-slate-100 bg-white px-6 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3 pr-12">
            <div className="min-w-0">
              <p className="m-0 truncate text-2xl font-bold tracking-tight text-slate-900">
                {selectedAsset ? `${selectedAsset.symbol} - ${selectedAsset.name}` : "Giao dịch đầu tư"}
              </p>
              <p className="m-0 mt-1 text-sm font-medium text-slate-500">
                {selectedAsset ? "Giá theo dõi được dùng làm giá mặc định, có thể chỉnh trước khi xác nhận." : "Chọn tài sản và hoàn tất thông tin giao dịch."}
              </p>
            </div>
            <span className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${toneChipClass}`}>
              {action === "BUY" ? "Mua" : "Bán"}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:px-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4">
            <aside className="grid content-start gap-3">
              {selectedAsset ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Vị thế hiện tại</p>
                  <div className="mt-4 grid gap-3">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                      <span className="text-sm font-medium text-slate-500">Giá trị</span>
                      <span className="truncate text-right text-base font-bold text-slate-950">{Number(selectedAsset.marketValue || 0).toLocaleString("vi-VN")}₫</span>
                    </div>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                      <span className="text-sm font-medium text-slate-500">SL hiện có</span>
                      <span className="truncate text-right text-base font-bold text-slate-950">{formatQty(availableQuantity)}</span>
                    </div>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                      <span className="text-sm font-medium text-slate-500">Lãi/Lỗ</span>
                      <span className={`truncate text-right text-base font-bold ${Number(selectedAsset.unrealizedPnl || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {Number(selectedAsset.unrealizedPnl || 0) >= 0 ? "+" : ""}
                        {Number(selectedAsset.unrealizedPnl || 0).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                      <span className="text-sm font-medium text-slate-500">Tỷ trọng</span>
                      <span className="truncate text-right text-base font-bold text-slate-950">{Number(selectedAsset.weightPct || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">Giá trị trước phí</span>
                    <span className="font-bold tracking-tighter text-slate-900">{baseValue.toLocaleString("vi-VN")} {currencyLabel}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">Phí giao dịch</span>
                    <span className="font-bold tracking-tighter text-slate-900">{feeValue.toLocaleString("vi-VN")} {currencyLabel}</span>
                  </div>
                  <div className="h-px w-full bg-slate-200" />
                  <div className="grid gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {action === "BUY" ? "Tổng thanh toán" : "Tiền thu về ước tính"}
                    </span>
                    <span className={`text-2xl font-bold tracking-tighter ${action === "BUY" ? "text-slate-900" : "text-emerald-600"}`}>
                      {totalValue.toLocaleString("vi-VN")} {currencyLabel}
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            <section className="grid content-start gap-3">
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chọn tài sản</span>
                {lockAssetSelection ? (
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-500">
                    {selectedAsset ? `${selectedAsset.symbol} - ${selectedAsset.name}` : "Tài sản được khóa"}
                  </div>
                ) : (
                  <div ref={comboRef} className="relative">
                    <input
                      value={assetQuery}
                      onChange={(event) => {
                        setAssetQuery(event.target.value);
                        setAssetMenuOpen(true);
                      }}
                      onFocus={() => setAssetMenuOpen(true)}
                      placeholder="Tìm mã hoặc tên tài sản..."
                      className={`${inputBaseClass} pr-10`}
                    />
                    {assetMenuOpen ? (
                      <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50">
                        {filteredAssets.length === 0 ? (
                          <div className="px-3 py-2 text-sm font-medium text-slate-500">Không tìm thấy tài sản phù hợp.</div>
                        ) : (
                          filteredAssets.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setAssetId(item.id);
                                setAssetQuery(`${item.symbol} - ${item.name}`);
                                setAssetMenuOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition duration-200 ease-out hover:bg-slate-50 ${
                                item.id === assetId ? "bg-cyan-50 text-cyan-700" : "text-slate-700"
                              }`}
                            >
                              <span className="truncate text-sm font-semibold">{item.symbol} - {item.name}</span>
                              <span className="ml-2 text-[11px] font-bold text-slate-400">{item.currency}</span>
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
                {lockAssetSelection ? <span className="text-xs font-medium text-slate-500">Tài sản được khóa theo giao dịch đã chọn.</span> : null}
              </label>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3">
                <div className="grid gap-1.5">
                  <span className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Hành động
                    {action === "SELL" ? (
                      <span className={hasNoQuantityToSell ? "normal-case tracking-normal text-rose-600" : "normal-case tracking-normal text-slate-400"}>
                        Khả dụng: {formatQty(availableQuantity)}
                      </span>
                    ) : null}
                  </span>
                  <div className="grid h-11 grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button type="button" onClick={() => setAction("BUY")} className={`rounded-lg text-sm font-semibold transition duration-200 ease-out ${action === "BUY" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-white"}`}>
                      Mua
                    </button>
                    <button type="button" onClick={() => setAction("SELL")} className={`rounded-lg text-sm font-semibold transition duration-200 ease-out ${action === "SELL" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-500 hover:bg-white"}`}>
                      Bán
                    </button>
                  </div>
                </div>

                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày giao dịch</span>
                  <input name="occurredAt" type="date" defaultValue={today} required className={inputBaseClass} />
                </label>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3">
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số lượng</span>
                  <MoneyInput
                    name="quantity"
                    value={quantity}
                    required
                    placeholder="0"
                    allowDecimal
                    maxDecimals={8}
                    onValueChange={(value) => setQuantity(value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-lg font-bold tracking-tighter text-slate-900 transition duration-200 ease-out placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  {isSellOverflow ? <span className="text-xs font-semibold text-rose-600">Số lượng bán vượt quá số đang nắm giữ.</span> : null}
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Giá theo dõi ({currencyLabel})</span>
                  <MoneyInput
                    name="price"
                    value={price}
                    required
                    placeholder="0"
                    allowDecimal={allowDecimal}
                    onValueChange={(value) => setPrice(value)}
                    className="h-12 w-full rounded-xl border border-cyan-200 bg-white px-3 text-lg font-bold tracking-tighter text-slate-950 shadow-sm transition duration-200 ease-out placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
                  />
                </label>
              </div>

              {action === "SELL" && selectedAsset && availableQuantity > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((pct) => (
                    <button key={pct} type="button" onClick={() => setQuantity(availableQuantity * (pct / 100))} className="h-9 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm">
                      {pct === 100 ? "Tất cả" : `${pct}%`}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3">
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phí ({currencyLabel})</span>
                  <MoneyInput name="fee" value={fee} required placeholder="0" allowDecimal={allowDecimal} onValueChange={(value) => setFee(value)} className={inputBaseClass} />
                </label>

                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">SL sau giao dịch</span>
                  <div className="flex h-11 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3">
                    <span className="text-sm font-semibold text-slate-500">{action === "BUY" ? "Sau mua" : "Sau bán"}</span>
                    <span className={`text-lg font-bold tracking-tighter ${projectedQuantity < 0 ? "text-rose-600" : action === "BUY" ? "text-emerald-600" : "text-slate-900"}`}>
                      {formatQty(Math.max(projectedQuantity, 0))}
                    </span>
                  </div>
                </div>
              </div>

              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ghi chú (tùy chọn)</span>
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Ví dụ: chốt lời một phần, mua tích lũy..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition duration-200 ease-out placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </label>
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="submit"
            disabled={!canSubmit || isSellOverflow || hasNoQuantityToSell}
            className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-slate-950/15 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
          >
            Xác nhận giao dịch
          </button>
        </div>
      </form>
    </motion.div>
  );
}
