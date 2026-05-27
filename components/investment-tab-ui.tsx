"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, Plus, RotateCcw, WalletCards } from "lucide-react";
import { updateUsdVndRate } from "@/app/actions/settings";
import { ChangeBadge, EmptyState, HeroSummary, KpiCard, MoneyValue, SectionCard, formatMoneyValue } from "@/components/fintech-ui";
import { InvestmentAssetForm } from "@/components/investment-asset-form";
import { InvestmentTransactionForm } from "@/components/investment-transaction-form";
import { InvestmentAssetActions } from "@/components/investment-asset-actions";
import { InvestmentTransactionActions } from "@/components/investment-transaction-actions";
import { MoneyInput } from "@/components/money-input";
import { Modal } from "@/components/modal-root";

type InvestmentAsset = {
  id: string;
  symbol: string;
  name: string;
  type: string;
  currency: string;
  currentPrice: number | null;
};

type HoldingItem = {
  assetId: string;
  symbol: string;
  name: string;
  type: string;
  currency: string;
  quantity: number;
  averageCost: number | null;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedPnl: number | null;
};

type InvestmentTx = {
  id: string;
  assetId: string;
  action: "BUY" | "SELL";
  quantity: number;
  price: number;
  fee: number;
  note?: string | null;
  occurredAt: string;
  asset?: {
    symbol: string;
    currency: string;
  };
};

type DashboardSummary = {
  netInvested: number;
  portfolioMarketValue: number;
  totalUnrealizedPnl: number;
  concentrationAlert?: boolean;
  topHolding?: {
    symbol: string;
    weightPct: number;
  } | null;
  rebalanceRecommendation?: {
    reductionAmount: number;
  } | null;
};

type DashboardData = {
  assets: InvestmentAsset[];
  transactions: InvestmentTx[];
  holdings: HoldingItem[];
  usdVnd: number;
  summary: DashboardSummary;
};

interface Props {
  dashboard: DashboardData;
  investmentAssetFilter: string;
  recentMonths: string[];
  returnTo: string;
}

function typeBadgeClass(type: string) {
  switch (type) {
    case "GOLD":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CRYPTO":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "STOCK":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function holdingIcon(type: string) {
  switch (type) {
    case "GOLD":
      return "Au";
    case "CRYPTO":
      return "CR";
    case "STOCK":
      return "CP";
    case "FUND":
      return "Q";
    default:
      return "TS";
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isUsdLikeCurrency(currency: string) {
  return ["USD", "USDT", "USDC"].includes(currency);
}

export function InvestmentTabUI({
  dashboard,
  investmentAssetFilter,
  recentMonths,
  returnTo,
}: Props) {
  const { assets = [], transactions = [], holdings = [], usdVnd = 0, summary } = dashboard;
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeAssetId, setTradeAssetId] = useState("");
  const [fxRateModalOpen, setFxRateModalOpen] = useState(false);
  const [fxRateValue, setFxRateValue] = useState<number | null>(usdVnd);
  const { netInvested = 0, portfolioMarketValue = 0, totalUnrealizedPnl = 0 } = summary;
  const transactionGroups = Object.entries(
    transactions.reduce<Record<string, InvestmentTx[]>>((groups, tx) => {
      const key = formatDate(tx.occurredAt);
      groups[key] = groups[key] ?? [];
      groups[key].push(tx);
      return groups;
    }, {})
  ).map(([date, items]) => ({
    date,
    items,
    buyCount: items.filter((item) => item.action === "BUY").length,
    sellCount: items.filter((item) => item.action === "SELL").length,
  }));

  const pnlPct = netInvested > 0 ? (totalUnrealizedPnl / netInvested) * 100 : 0;
  const isProfit = totalUnrealizedPnl >= 0;
  const totalPortfolioValue = holdings.reduce((sum, item) => sum + Number(item.marketValue || 0), 0);

  const investedSeries = recentMonths.map((_, index) => Math.max(1, netInvested * (0.7 + index * 0.06)));
  const pnlSeries = recentMonths.map((_, index) => Math.max(0, Math.abs(totalUnrealizedPnl) * (0.5 + index * 0.08)));

  return (
    <div className="grid gap-6">
      <HeroSummary
        eyebrow="Investment"
        title="Danh mục đầu tư"
        description="Theo dõi vốn đã triển khai, giá trị thị trường, hiệu suất và rủi ro tập trung."
        primaryLabel="Giá trị thị trường"
        primaryValue={<MoneyValue value={portfolioMarketValue} size="xl" className="text-white" currencyClassName="text-white/70" />}
        actions={
          assets.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setTradeAssetId("");
                setTradeModalOpen(true);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 dark:bg-white dark:text-slate-950 dark:focus-visible:outline-white"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Giao dịch nhanh
            </button>
          ) : null
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          label="Vốn ròng đầu tư"
          value={<MoneyValue value={netInvested} size="xl" />}
          badge={<ChangeBadge label="Đang nắm" tone="info" />}
          caption="Tổng vốn đã triển khai"
          icon={<WalletCards className="h-5 w-5" aria-hidden="true" />}
          tone="info"
          sparklineValues={investedSeries}
        />
        <KpiCard
          label="Lãi/lỗ ròng"
          value={<MoneyValue value={totalUnrealizedPnl} signed size="xl" tone={isProfit ? "positive" : "negative"} />}
          badge={<ChangeBadge value={pnlPct} tone={isProfit ? "positive" : "negative"} />}
          caption={isProfit ? "Hiệu suất tích cực" : "Hiệu suất âm"}
          icon={<ArrowUpRight className="h-5 w-5" aria-hidden="true" />}
          tone={isProfit ? "positive" : "negative"}
          sparklineValues={pnlSeries}
          delay={0.06}
        />
      </section>

      {summary.concentrationAlert && summary.topHolding ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800">
          {summary.topHolding.symbol} đang chiếm {summary.topHolding.weightPct.toFixed(1)}% danh mục.
          {summary.rebalanceRecommendation?.reductionAmount ? (
            <span> Có thể cân nhắc giảm khoảng {formatMoneyValue(summary.rebalanceRecommendation.reductionAmount)}.</span>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-12 grid gap-6 xl:col-span-8">
          <SectionCard
            title={<>Danh mục <span className="text-cyan-700 dark:text-cyan-300">nắm giữ</span></>}
            eyebrow="Phân bổ tỷ trọng danh mục đầu tư"
            action={
              <form method="get" className="flex w-full flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2 sm:w-auto sm:flex-row sm:items-center dark:border-white/5 dark:bg-[#0a0f1d]">
                <input type="hidden" name="tab" value="investment" />
                <label className="flex min-w-0 items-center gap-2 rounded-2xl bg-white px-3 py-2 dark:bg-[#111827]">
                  <span className="text-xs font-bold text-slate-500">Tài sản</span>
                  <select
                    name="investmentAssetId"
                    defaultValue={investmentAssetFilter}
                    onChange={(event) => event.currentTarget.form?.submit()}
                    className="min-w-[132px] bg-transparent text-sm font-bold text-slate-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:text-white"
                  >
                    <option value="all">Tất cả</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>{asset.symbol}</option>
                    ))}
                  </select>
                </label>
                <Link
                  href="/?tab=investment"
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-slate-500 transition hover:bg-slate-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-white/5 dark:bg-[#111827]"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </Link>
              </form>
            }
          >
            {holdings.length === 0 ? (
              <EmptyState
                title="Chưa có tài sản trong danh mục"
                description="Thêm tài sản ở khung bên phải, sau đó ghi nhận giao dịch mua bán."
                icon={<BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />}
                action={
                  assets.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTradeAssetId("");
                        setTradeModalOpen(true);
                      }}
                      className="h-10 rounded-2xl bg-slate-950 px-4 text-xs font-bold text-white dark:bg-white dark:text-slate-950"
                    >
                      Ghi giao dịch đầu tiên
                    </button>
                  ) : null
                }
                className="min-h-[220px]"
              />
            ) : (
              <div className="grid gap-3">
                {holdings.map((item) => {
                  const marketValue = Number(item.marketValue || 0);
                  const pnl = Number(item.unrealizedPnl || 0);
                  const weightPct = totalPortfolioValue > 0 ? (marketValue / totalPortfolioValue) * 100 : 0;
                  const isItemProfit = pnl >= 0;
                  const currency = item.currency || "VND";
                  const displayCurrency = isUsdLikeCurrency(currency) ? "VND" : currency;
                  const currentPrice = item.currentPrice === null ? null : Number(item.currentPrice);
                  const averageCost = item.averageCost === null ? null : Number(item.averageCost);
                  const convertedCurrentPrice = currentPrice !== null && isUsdLikeCurrency(currency) ? currentPrice * usdVnd : null;

                  return (
                    <article key={item.assetId} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#0f172a]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                            {holdingIcon(item.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="m-0 truncate text-lg font-bold text-slate-950 dark:text-white">{item.symbol}</h3>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${typeBadgeClass(item.type)}`}>{item.type}</span>
                            </div>
                            <p className="m-0 mt-1 truncate text-sm font-semibold text-slate-500">{item.name}</p>
                            <p className="m-0 mt-1 text-xs font-bold text-slate-400">SL: {Number(item.quantity || 0).toLocaleString("vi-VN")}</p>
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-col gap-3 sm:items-end sm:text-right">
                          <MoneyValue value={marketValue} currency={displayCurrency} size="md" />
                          <ChangeBadge label={`${isItemProfit ? "+" : ""}${formatMoneyValue(pnl, displayCurrency)}`} tone={isItemProfit ? "positive" : "negative"} />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setTradeAssetId(item.assetId);
                                setTradeModalOpen(true);
                              }}
                              className="h-9 rounded-2xl bg-slate-950 px-3 text-xs font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
                            >
                              Giao dịch
                            </button>
                            <InvestmentAssetActions
                              asset={{
                                id: item.assetId,
                                symbol: item.symbol,
                                name: item.name,
                                type: item.type,
                                currency: item.currency,
                                currentPrice: item.currentPrice,
                              }}
                              returnTo={returnTo}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-white/5">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-[#0a0f1d]">
                          <span className="block text-xs font-bold text-slate-500">Giá theo dõi</span>
                          <span className="mt-1 block truncate text-base font-bold text-slate-950 dark:text-white">
                            {currentPrice === null ? "Chưa có" : formatMoneyValue(currentPrice, currency)}
                          </span>
                          {convertedCurrentPrice !== null ? (
                            <span className="mt-1 block truncate text-xs font-semibold text-slate-400">
                              Quy đổi: {formatMoneyValue(convertedCurrentPrice, "VND")}
                            </span>
                          ) : null}
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-[#0a0f1d]">
                          <span className="block text-xs font-bold text-slate-500">Giá mua TB {isUsdLikeCurrency(currency) ? "(quy đổi)" : ""}</span>
                          <span className="mt-1 block truncate text-base font-bold text-slate-950 dark:text-white">
                            {averageCost === null ? "Chưa có" : formatMoneyValue(averageCost, displayCurrency)}
                          </span>
                          {isUsdLikeCurrency(currency) ? (
                            <button
                              type="button"
                              onClick={() => {
                                setFxRateValue(usdVnd);
                                setFxRateModalOpen(true);
                              }}
                              className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-xs font-bold text-cyan-700 transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                            >
                              Cập nhật tỷ giá USD/VND {usdVnd.toLocaleString("vi-VN")}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <span className="w-20 shrink-0 text-xs font-bold text-slate-500">{weightPct.toFixed(1)}%</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-cyan-600" style={{ width: `${Math.min(100, Math.max(0, weightPct))}%` }} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title={<>Lịch sử <span className="text-cyan-700 dark:text-cyan-300">giao dịch</span></>}
            eyebrow="Nhật ký biến động đầu tư"
            action={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{transactions.length} giao dịch</span>}
          >
            {transactions.length === 0 ? (
              <EmptyState title="Chưa có giao dịch đầu tư" description="Các lệnh mua bán sẽ được ghi lại tại đây." />
            ) : (
              <div className="grid gap-5">
                {transactionGroups.map((group) => (
                  <section key={group.date} className="grid gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                      <div className="flex items-center gap-3">
                        <h3 className="m-0 text-sm font-bold text-slate-950 dark:text-white">{group.date}</h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">{group.items.length} lệnh</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold">
                        {group.buyCount > 0 ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">Mua {group.buyCount}</span> : null}
                        {group.sellCount > 0 ? <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-700">Bán {group.sellCount}</span> : null}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/5 dark:bg-[#0f172a]">
                      {group.items.map((tx) => {
                        const isBuy = tx.action === "BUY";
                        const currency = tx.asset?.currency ?? "VND";
                        const quantity = Number(tx.quantity || 0);
                        const price = Number(tx.price || 0);
                        const fee = Number(tx.fee || 0);
                        const txValue = price * quantity;

                        return (
                          <article key={tx.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.9fr)_minmax(170px,auto)] lg:items-center dark:border-white/5">
                            <div className="min-w-0">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${isBuy ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                                  {isBuy ? "Mua" : "Bán"}
                                </span>
                                <h4 className="m-0 truncate text-sm font-bold text-slate-950 dark:text-white">{tx.asset?.symbol ?? "N/A"}</h4>
                                {tx.note ? <span className="min-w-0 truncate text-xs font-semibold text-slate-400">· {tx.note}</span> : null}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                                <span>SL {quantity.toLocaleString("vi-VN")}</span>
                                <span>Giá {formatMoneyValue(price, currency)}</span>
                                {fee > 0 ? <span>Phí {formatMoneyValue(fee, currency)}</span> : null}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-3 lg:grid-cols-2">
                              <div className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-[#0a0f1d]">
                                <span className="block text-[10px] uppercase tracking-wider text-slate-400">Giá trị</span>
                                <span className="mt-1 block truncate text-slate-800 dark:text-slate-100">{formatMoneyValue(txValue, currency)}</span>
                              </div>
                              <div className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-[#0a0f1d]">
                                <span className="block text-[10px] uppercase tracking-wider text-slate-400">Sau phí</span>
                                <span className="mt-1 block truncate text-slate-800 dark:text-slate-100">{formatMoneyValue(isBuy ? txValue + fee : Math.max(0, txValue - fee), currency)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 lg:justify-end">
                              <MoneyValue value={isBuy ? txValue : -txValue} signed currency={currency} size="sm" tone={isBuy ? "positive" : "negative"} />
                              <InvestmentTransactionActions
                                tx={{
                                  id: tx.id,
                                  assetId: tx.assetId,
                                  action: tx.action,
                                  quantity: tx.quantity,
                                  price: tx.price,
                                  fee: tx.fee,
                                  note: tx.note,
                                  occurredAt: new Date(tx.occurredAt),
                                  asset: {
                                    symbol: tx.asset?.symbol ?? "N/A",
                                    currency,
                                  },
                                }}
                                returnTo={returnTo}
                              />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="col-span-12 grid gap-6 xl:sticky xl:top-4 xl:col-span-4">
          <SectionCard>
            <InvestmentAssetForm />
          </SectionCard>
        </aside>
      </div>

      {fxRateModalOpen ? (
        <Modal onClose={() => setFxRateModalOpen(false)} maxWidth={420} closeOnOverlayClick={false} closeOnEscape={false}>
          <form
            action={async (formData) => {
              await updateUsdVndRate(formData);
              setFxRateModalOpen(false);
            }}
            className="grid gap-5 bg-white p-5 text-left"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">Cập nhật tỷ giá</p>
                <h3 className="m-0 mt-1 text-xl font-bold tracking-tight text-slate-950">USD/VND</h3>
                <p className="m-0 mt-2 text-sm font-medium text-slate-500">
                  Dùng để quy đổi giá trị danh mục và giá mua trung bình của tài sản USD.
                </p>
              </div>
              <button
                type="button"
                data-modal-close="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <label className="block rounded-2xl border border-cyan-200 bg-cyan-50/60 px-4 py-3 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-500/10">
              <span className="block text-xs font-bold uppercase tracking-wider text-cyan-700">1 USD bằng</span>
              <div className="mt-2 flex items-center gap-2">
                <MoneyInput
                  name="rate"
                  value={fxRateValue}
                  onValueChange={setFxRateValue}
                  required
                  className="min-w-0 flex-1 bg-transparent text-2xl font-bold tracking-tight text-slate-950 outline-none placeholder:text-slate-300"
                  placeholder="0"
                />
                <span className="text-sm font-bold text-slate-400">VND</span>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setFxRateModalOpen(false)}
                className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!fxRateValue || fxRateValue <= 0}
                className="h-11 rounded-2xl bg-slate-950 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-40"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {tradeModalOpen ? (
        <Modal
          onClose={() => setTradeModalOpen(false)}
          maxWidth={920}
          closeOnOverlayClick={false}
          closeOnEscape={false}
          shakeOnOverlayClick={true}
        >
          <div className="relative mx-auto flex h-[min(92dvh,760px)] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.20)] sm:rounded-3xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-cyan-600" />
            <button
              type="button"
              data-modal-close="true"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              title="Đóng form"
            >
              ×
            </button>

            <InvestmentTransactionForm
              assets={assets.map((item) => {
                const holding = holdings.find((holdingItem) => holdingItem.assetId === item.id);
                const marketValue = Number(holding?.marketValue || 0);
                const weightPct = totalPortfolioValue > 0 ? (marketValue / totalPortfolioValue) * 100 : 0;

                return {
                  id: item.id,
                  symbol: item.symbol,
                  name: item.name,
                  currency: item.currency,
                  currentPrice: item.currentPrice,
                  ownedQuantity: holding?.quantity || 0,
                  marketValue,
                  unrealizedPnl: Number(holding?.unrealizedPnl || 0),
                  weightPct,
                };
              })}
              defaultAssetId={tradeAssetId}
              lockAssetSelection={Boolean(tradeAssetId)}
            />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
