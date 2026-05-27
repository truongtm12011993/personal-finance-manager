"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionCard } from "@/components/fintech-ui";

type CashflowPoint = {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  href: string;
};

type AllocationPoint = {
  label: string;
  value: number;
  color: string;
  href: string;
};

type DashboardChartsProps = {
  cashflow: CashflowPoint[];
  allocation: AllocationPoint[];
};

function ChartFrame({ className, children }: { className: string; children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`${className} min-w-0`}>
      {ready ? children : <div className="h-full w-full rounded-2xl bg-slate-50 dark:bg-[#0a0f1d]" />}
    </div>
  );
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.round(value))} VND`;
}

function allocationStatus(label: string, value: number) {
  if (value > 0) return `${label} ${formatMoney(value)}`;
  if (label === "Tiền khả dụng") return "Chưa có tiền khả dụng";
  return `Chưa có ${label.toLowerCase()}`;
}

export function DashboardCharts({ cashflow, allocation }: DashboardChartsProps) {
  const allocationTotal = allocation.reduce((sum, item) => sum + item.value, 0);
  const latestCashflow = cashflow[cashflow.length - 1] ?? null;
  const largestAllocation = [...allocation].sort((a, b) => b.value - a.value)[0] ?? null;
  const largestPct = largestAllocation && allocationTotal > 0 ? (largestAllocation.value / allocationTotal) * 100 : 0;
  const allocationInsight = largestAllocation
    ? largestPct >= 70
      ? `Tỷ trọng đang tập trung cao ở ${largestAllocation.label}.`
      : largestAllocation.label === "Đầu tư"
        ? "Danh mục đang thiên về tăng trưởng."
        : largestAllocation.label === "Tiết kiệm"
          ? "Danh mục đang thiên về an toàn."
          : "Tài sản đang giữ nhiều ở phần thanh khoản."
    : "Chưa có dữ liệu phân bổ.";

  return (
    <div className="grid min-w-0 grid-cols-12 items-start gap-6 lg:gap-8">
      <SectionCard
        title="Dòng tiền 6 tháng"
        eyebrow="Thu nhập, chi tiêu và phần còn lại"
        className="col-span-12 min-w-0 xl:col-span-8"
        action={
          <Link
            href="/?tab=expense"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-950 hover:text-white dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-200"
          >
            Xem giao dịch
          </Link>
        }
      >
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-[#0f172a]">
            <span className="block text-xs font-bold text-slate-500">Thu nhập gần nhất</span>
            <strong className="mt-2 block text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              {formatMoney(latestCashflow?.income ?? 0)}
            </strong>
            <span className="mt-2 block h-1.5 w-12 rounded-full bg-emerald-600" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-[#0f172a]">
            <span className="block text-xs font-bold text-slate-500">Chi tiêu gần nhất</span>
            <strong className="mt-2 block text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              {formatMoney(latestCashflow?.expense ?? 0)}
            </strong>
            <span className="mt-2 block h-1.5 w-12 rounded-full bg-rose-600" />
          </div>
          <Link
            href={latestCashflow?.href ?? "/?tab=expense"}
            className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-sm transition hover:-translate-y-0.5 dark:border-white/5 dark:bg-white dark:text-slate-950"
          >
            <span className="flex items-center justify-between gap-3 text-xs font-bold text-white/65 dark:text-slate-500">
              Dòng tiền ròng
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
            <strong className={`mt-2 block text-xl font-bold tracking-tight ${latestCashflow && latestCashflow.net < 0 ? "text-rose-200 dark:text-rose-600" : ""}`}>
              {formatMoney(latestCashflow?.net ?? 0)}
            </strong>
          </Link>
        </div>

        <div className="mb-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-emerald-600" />Thu nhập</span>
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-rose-600" />Chi tiêu</span>
          <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-slate-950" />Dòng tiền ròng</span>
        </div>

        <ChartFrame className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height={340} minWidth={1} minHeight={1}>
            <ComposedChart data={cashflow} margin={{ top: 8, right: 12, left: -8, bottom: 0 }} barGap={8}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 6" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                tickFormatter={formatCompact}
              />
              <Tooltip
                cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                formatter={(value) => formatMoney(Number(value))}
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
                  fontWeight: 700,
                }}
              />
              <Bar dataKey="income" name="Thu nhập" fill="#059669" radius={[10, 10, 0, 0]} maxBarSize={38} />
              <Bar dataKey="expense" name="Chi tiêu" fill="#e11d48" radius={[10, 10, 0, 0]} maxBarSize={38} />
              <Line
                type="monotone"
                dataKey="net"
                name="Dòng tiền ròng"
                stroke="#111827"
                strokeWidth={3}
                dot={{ r: 4, fill: "#111827", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#111827", strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartFrame>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {cashflow.slice(-3).map((item) => (
            <Link
              key={item.month}
              href={item.href}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/5 dark:bg-[#0f172a] dark:text-slate-200"
            >
              <span className="block text-xs font-bold text-slate-500">{item.label}</span>
              <span className="mt-1 flex items-center justify-between gap-3">
                <span className="text-emerald-700">+{formatCompact(item.income)}</span>
                <span className="text-rose-700">-{formatCompact(item.expense)}</span>
              </span>
              <span className={`mt-1 block text-xs ${item.net < 0 ? "text-rose-600" : "text-slate-500"}`}>
                Ròng {formatCompact(item.net)}
              </span>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Tỷ trọng hiện tại"
        eyebrow="Phân bổ tài sản"
        className="col-span-12 min-w-0 xl:col-span-4"
        bodyClassName="grid gap-5"
      >
        <div className="rounded-[24px] border border-slate-200 bg-[#f8fafc] p-4 dark:border-white/5 dark:bg-[#0a0f1d]">
          <ChartFrame className="relative h-[250px] w-full">
            <ResponsiveContainer width="100%" height={250} minWidth={1} minHeight={1}>
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={66}
                  outerRadius={94}
                  paddingAngle={3}
                  stroke="#f8fafc"
                  strokeWidth={4}
                >
                  {allocation.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatMoney(Number(value))}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
                    fontWeight: 700,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="max-w-[120px] text-xs font-semibold leading-4 text-slate-500">Tổng phân bổ</span>
              <strong className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                {formatCompact(allocationTotal)}
              </strong>
              <span className="mt-1 max-w-[150px] text-xs font-semibold leading-4 text-slate-500">
                {largestAllocation ? `${largestAllocation.label} ${largestPct.toFixed(1)}%` : "Chưa có dữ liệu"}
              </span>
            </div>
          </ChartFrame>
        </div>

        <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold leading-5 ${
          largestPct >= 70
            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/10 dark:bg-amber-500/10 dark:text-amber-200"
            : "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/5 dark:bg-[#0a0f1d] dark:text-slate-200"
        }`}>
          {allocationInsight}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/5 dark:bg-[#0f172a]">
          <span className="block text-xs font-bold text-slate-500">Tổng phân bổ</span>
          <strong className="mt-1 block text-lg font-bold tracking-tight text-slate-950 dark:text-white">{formatMoney(allocationTotal)}</strong>
        </div>

        <div className="grid gap-3">
          {allocation.map((item) => {
            const pct = allocationTotal > 0 ? (item.value / allocationTotal) * 100 : 0;
            return (
              <Link key={item.label} href={item.href} className="grid gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/5 dark:bg-[#0f172a]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-800 dark:text-slate-200">{item.label}</span>
                  <span className="shrink-0 text-sm font-bold text-slate-950 dark:text-white">{pct.toFixed(1)}% danh mục</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-xs font-semibold leading-4 text-slate-500">{allocationStatus(item.label, item.value)}</span>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
