"use client";

import { useState } from "react";
import { addInvestmentAsset } from "@/app/actions/investment";
import { MoneyInput } from "@/components/money-input";

const CURRENCIES = ["VND", "USD", "EUR", "BTC", "ETH", "USDT"];
const FIELD_CLASS =
  "rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-cyan-300 focus-within:ring-4 focus-within:ring-cyan-500/10 dark:border-white/5 dark:bg-[#0a0f1d]";
const LABEL_CLASS = "mb-1 block text-xs font-bold text-slate-500";
const INPUT_CLASS =
  "w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-300 focus-visible:!outline-none focus-visible:!ring-0 dark:text-slate-100";

export function InvestmentAssetForm() {
  const [currency, setCurrency] = useState("VND");
  const [useCustomCurrency, setUseCustomCurrency] = useState(false);
  const [customCurrency, setCustomCurrency] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");

  const resolvedCurrency = useCustomCurrency ? customCurrency.trim().toUpperCase() : currency;
  const isFormReady = symbol.trim().length > 0 && name.trim().length > 0 && resolvedCurrency.length > 0;
  const canDecimal = resolvedCurrency !== "VND";

  return (
    <form action={addInvestmentAsset} className="grid gap-4 text-left">
      <div>
        <p className="m-0 text-xs font-bold text-cyan-700 dark:text-cyan-300">Tài sản mới</p>
        <h2 className="m-0 mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
          Thêm mã đầu tư
        </h2>
        <p className="m-0 mt-2 text-sm font-medium leading-6 text-slate-500">
          Tạo tài sản trước, sau đó ghi nhận lệnh mua bán.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <label className={FIELD_CLASS}>
          <span className={LABEL_CLASS}>Mã tài sản</span>
          <input
            name="symbol"
            required
            value={symbol}
            onChange={(event) => setSymbol(event.target.value.toUpperCase())}
            placeholder="VD: FPT, BTC, VANG"
            className={INPUT_CLASS}
          />
        </label>

        <label className={FIELD_CLASS}>
          <span className={LABEL_CLASS}>Tên tài sản</span>
          <input
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="VD: Cổ phiếu FPT"
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <label className={FIELD_CLASS}>
          <span className={LABEL_CLASS}>Loại tài sản</span>
          <select name="type" defaultValue="STOCK" className={`${INPUT_CLASS} cursor-pointer appearance-none`}>
            <option value="STOCK">Cổ phiếu</option>
            <option value="FUND">Chứng chỉ quỹ</option>
            <option value="CRYPTO">Tiền điện tử</option>
            <option value="BOND">Trái phiếu</option>
            <option value="GOLD">Vàng</option>
            <option value="OTHER">Khác</option>
          </select>
        </label>

        <label className={FIELD_CLASS}>
          <span className={LABEL_CLASS}>Tiền tệ</span>
          {useCustomCurrency ? (
            <input
              name="currency"
              required
              value={customCurrency}
              onChange={(event) => setCustomCurrency(event.target.value.toUpperCase())}
              placeholder="VD: JPY"
              className={INPUT_CLASS}
            />
          ) : (
            <select
              name="currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className={`${INPUT_CLASS} cursor-pointer appearance-none`}
            >
              {CURRENCIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          )}
        </label>
      </div>

      <button
        type="button"
        onClick={() => {
          setCustomCurrency("");
          setUseCustomCurrency((value) => !value);
        }}
        className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-300"
      >
        {useCustomCurrency ? "Chọn từ danh sách tiền tệ" : "Nhập mã tiền tệ khác"}
      </button>

      <label className={FIELD_CLASS}>
        <span className={LABEL_CLASS}>Giá hiện tại ({resolvedCurrency || "CUR"})</span>
        <div className="flex items-center gap-2">
          <MoneyInput
            name="currentPrice"
            placeholder="0"
            allowDecimal={canDecimal}
            className="w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-300 focus-visible:!outline-none focus-visible:!ring-0 dark:text-slate-100"
          />
          <span className="text-xs font-bold text-slate-400">{resolvedCurrency || "VND"}</span>
        </div>
      </label>

      <button
        type="submit"
        disabled={!isFormReady}
        className="h-12 rounded-[22px] bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:pointer-events-none disabled:opacity-35 dark:bg-white dark:text-slate-950 dark:focus-visible:outline-white"
      >
        Lưu tài sản
      </button>
    </form>
  );
}
