"use client";

import { MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Dropdown, useDropdown } from "@/components/modal-root";

type SemanticTone = "positive" | "negative" | "neutral" | "info" | "warning" | "primary";
type MoneySize = "sm" | "md" | "lg" | "xl";

const toneText: Record<SemanticTone, string> = {
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-rose-600 dark:text-rose-400",
  neutral: "text-slate-900 dark:text-slate-100",
  info: "text-cyan-600 dark:text-cyan-400",
  warning: "text-amber-600 dark:text-amber-400",
  primary: "text-purple-600 dark:text-purple-400",
};

const badgeTone: Record<SemanticTone, string> = {
  positive: "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/10 dark:bg-emerald-500/5 dark:text-emerald-400",
  negative: "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-500/10 dark:bg-rose-500/5 dark:text-rose-400",
  neutral: "border-slate-100 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-[#1e293b]/50 dark:text-slate-400",
  info: "border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-500/10 dark:bg-cyan-500/5 dark:text-cyan-400",
  warning: "border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-500/10 dark:bg-amber-500/5 dark:text-amber-400",
  primary: "border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-500/10 dark:bg-purple-500/5 dark:text-purple-400",
};

const accentTone: Record<SemanticTone, string> = {
  positive: "from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-500",
  negative: "from-rose-500 to-rose-400 dark:from-rose-600 dark:to-rose-500",
  neutral: "from-slate-500 to-slate-300 dark:from-slate-600 dark:to-slate-500",
  info: "from-cyan-500 to-cyan-400 dark:from-cyan-600 dark:to-cyan-500",
  warning: "from-amber-500 to-amber-400 dark:from-amber-600 dark:to-amber-500",
  primary: "from-purple-600 via-indigo-500 to-cyan-500 dark:from-purple-700/80 dark:via-indigo-600/80 dark:to-cyan-600/80",
};

const heroTheme: Record<string, { accent: string; soft: string; panel: string; ring: string }> = {
  expense: {
    accent: "from-rose-500 via-fuchsia-500 to-indigo-500",
    soft: "bg-rose-50/70 dark:bg-rose-500/5",
    panel: "from-slate-950 via-rose-950 to-rose-800",
    ring: "border-rose-100 dark:border-rose-500/10",
  },
  investment: {
    accent: "from-indigo-500 via-cyan-500 to-teal-400",
    soft: "bg-cyan-50/70 dark:bg-cyan-500/5",
    panel: "from-slate-950 via-indigo-950 to-cyan-900",
    ring: "border-cyan-100 dark:border-cyan-500/10",
  },
  savings: {
    accent: "from-emerald-500 via-lime-400 to-cyan-400",
    soft: "bg-emerald-50/70 dark:bg-emerald-500/5",
    panel: "from-slate-950 via-emerald-950 to-teal-900",
    ring: "border-emerald-100 dark:border-emerald-500/10",
  },
  default: {
    accent: "from-purple-600 via-indigo-500 to-cyan-500",
    soft: "bg-slate-50/80 dark:bg-white/5",
    panel: "from-slate-950 via-indigo-950 to-cyan-900",
    ring: "border-slate-100 dark:border-white/5",
  },
};

const moneySize: Record<MoneySize, { value: string; currency: string }> = {
  sm: { value: "text-base sm:text-[1.2rem]", currency: "text-xs" },
  md: { value: "text-xl sm:text-2xl", currency: "text-xs" },
  lg: { value: "text-2xl sm:text-3xl", currency: "text-xs sm:text-sm" },
  xl: { value: "text-3xl sm:text-4xl", currency: "text-sm" },
};

function toFiniteNumber(value: number | string | { toString(): string }): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatMoneyValue(value: number | string | { toString(): string }, currency = "VND"): string {
  const numeric = toFiniteNumber(value);
  const maximumFractionDigits = currency === "VND" ? 0 : 2;
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(currency === "VND" ? Math.round(numeric) : numeric);

  return `${amount} ${currency}`;
}

export interface MoneyValueProps {
  value: number | string | { toString(): string };
  currency?: string;
  tone?: SemanticTone;
  size?: MoneySize;
  signed?: boolean;
  absolute?: boolean;
  showCurrency?: boolean;
  className?: string;
  currencyClassName?: string;
}

export function MoneyValue({
  value,
  currency = "VND",
  tone = "neutral",
  size = "md",
  signed = false,
  absolute = false,
  showCurrency = true,
  className,
  currencyClassName,
}: MoneyValueProps) {
  const numeric = toFiniteNumber(value);
  const displayNumber = absolute || signed ? Math.abs(numeric) : numeric;
  const sign = signed && numeric > 0 ? "+" : signed && numeric < 0 ? "-" : "";
  const maximumFractionDigits = currency === "VND" ? 0 : 2;
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(currency === "VND" ? Math.round(displayNumber) : displayNumber);

  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 flex-wrap items-baseline gap-x-1 gap-y-1 whitespace-normal font-bold tracking-tight leading-tight",
        moneySize[size].value,
        toneText[tone],
        className
      )}
    >
      <span className="max-w-full shrink-0 whitespace-nowrap">{sign}{amount}</span>
      {showCurrency ? (
        <span className={cn("shrink-0 font-bold tracking-normal text-slate-400 dark:text-slate-500", moneySize[size].currency, currencyClassName)}>
          {currency}
        </span>
      ) : null}
    </span>
  );
}

export interface ChangeBadgeProps {
  value?: number | null;
  label?: ReactNode;
  tone?: SemanticTone;
  suffix?: string;
  showSign?: boolean;
  className?: string;
}

export function ChangeBadge({
  value,
  label,
  tone,
  suffix = "%",
  showSign = true,
  className,
}: ChangeBadgeProps) {
  const resolvedTone = tone ?? (value == null ? "neutral" : value > 0 ? "positive" : value < 0 ? "negative" : "neutral");
  const formatted =
    label ??
    (value == null
      ? "Ổn định"
      : `${showSign && value > 0 ? "+" : ""}${value.toFixed(Math.abs(value) >= 10 ? 0 : 1)}${suffix}`);

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none", badgeTone[resolvedTone], className)}>
      {formatted}
    </span>
  );
}

function buildSparklinePoints(values: number[]): string {
  if (values.length <= 1) return "0,16 100,16";
  const max = Math.max(...values.map((value) => Math.abs(value)), 1);
  const step = 100 / (values.length - 1);

  return values
    .map((value, index) => {
      const x = index * step;
      const y = 16 - (Math.abs(value) / max) * 14;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export interface SparklineProps {
  values: number[];
  tone?: SemanticTone;
  className?: string;
}

export function Sparkline({ values, tone = "primary", className }: SparklineProps) {
  const gradientId = useId().replace(/:/g, "");
  const points = buildSparklinePoints(values);
  const firstPoint = points.split(" ")[0] ?? "0,16";
  const firstX = firstPoint.split(",")[0] ?? "0";
  const stroke: Record<SemanticTone, string> = {
    positive: "#10b981",
    negative: "#f43f5e",
    neutral: "#64748b",
    info: "#06b6d4",
    warning: "#f59e0b",
    primary: "#7c3aed",
  };

  return (
    <svg viewBox="0 0 100 18" className={cn("pointer-events-none h-7 w-full", className)} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`fintech-spark-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke[tone]} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke[tone]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${firstPoint} L ${points} V 18 H ${firstX} Z`} fill={`url(#fintech-spark-${gradientId})`} />
      <polyline points={points} fill="none" stroke={stroke[tone]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  caption?: ReactNode;
  icon?: ReactNode;
  tone?: SemanticTone;
  sparklineValues?: number[];
  delay?: number;
  className?: string;
}

export function KpiCard({
  label,
  value,
  badge,
  caption,
  icon,
  tone = "primary",
  sparklineValues,
  delay = 0,
  className,
}: KpiCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut", delay }}
      className={cn(
        "group relative overflow-hidden rounded-[22px] border border-white/70 bg-white/88 p-4 text-left shadow-sm shadow-slate-200/60 backdrop-blur-xl transition duration-200 ease-out sm:p-5 lg:hover:-translate-y-0.5 lg:hover:shadow-lg dark:border-white/5 dark:bg-[#111827]/80 dark:shadow-none",
        className
      )}
    >
      <div className={cn("absolute inset-x-4 top-0 h-1 rounded-b-full bg-gradient-to-r", accentTone[tone])} />
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">{label}</p>
          <div className="mt-4">{value}</div>
        </div>
        {icon ? (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-slate-50 text-sm font-bold transition duration-200 ease-out dark:bg-[#1e293b]/50 dark:border-white/5", badgeTone[tone])}>
            {icon}
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex min-h-6 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0 text-xs text-slate-400 dark:text-slate-500">{caption}</div>
        {badge}
      </div>
      {sparklineValues?.length ? <Sparkline values={sparklineValues} tone={tone} className="mt-4" /> : null}
    </motion.article>
  );
}

export interface HeroSummaryMetric {
  label: string;
  value: ReactNode;
}

export interface HeroSummaryProps {
  eyebrow: string;
  title: string;
  description?: string;
  primaryLabel: string;
  primaryValue: ReactNode;
  metrics?: HeroSummaryMetric[];
  actions?: ReactNode;
  className?: string;
}

export function HeroSummary({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryValue,
  metrics = [],
  actions,
  className,
}: HeroSummaryProps) {
  const theme = heroTheme[eyebrow.toLowerCase()] ?? heroTheme.default;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={cn("relative overflow-hidden rounded-[30px] border bg-white/88 p-4 text-slate-900 shadow-sm shadow-slate-200/70 backdrop-blur-xl sm:p-6 dark:bg-[#111827]/80 dark:text-slate-100 dark:shadow-none", theme.ring, className)}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", theme.accent)} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-stretch">
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">{eyebrow}</p>
          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl dark:text-slate-100">{title}</h1>
          {description ? <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
        </div>
        <div className={cn("min-w-0 rounded-[24px] bg-gradient-to-br p-5 text-white shadow-xl shadow-slate-950/10", theme.panel)}>
          <p className="m-0 text-sm font-semibold leading-5 text-white/65">{primaryLabel}</p>
          <div className="mt-3">{primaryValue}</div>
        </div>
      </div>
      {(metrics.length > 0 || actions) ? (
        <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between dark:border-white/5">
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[18px] border border-slate-900/10 bg-slate-950 px-4 py-3 text-white shadow-sm dark:border-white/5 dark:bg-[#0a0f1d]">
                <p className="m-0 text-xs font-semibold leading-5 text-white/55">{metric.label}</p>
                <div className="mt-1 text-sm font-bold text-white">{metric.value}</div>
              </div>
            ))}
          </div>
          {actions}
        </div>
      ) : null}
    </motion.section>
  );
}

export interface SectionCardProps {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, eyebrow, action, children, className, bodyClassName }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={cn("rounded-[28px] border border-white/70 bg-white/88 p-4 text-left shadow-sm shadow-slate-200/60 backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-[#111827]/80 dark:shadow-none", className)}
    >
      {(title || eyebrow || action) ? (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? <p className="m-0 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">{eyebrow}</p> : null}
            {title ? <h2 className="m-0 mt-1.5 text-lg font-bold leading-tight tracking-tight text-slate-950 sm:text-xl dark:text-slate-100">{title}</h2> : null}
          </div>
          {action ? <div className="w-full sm:w-auto">{action}</div> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </motion.section>
  );
}

export interface FilterCardProps {
  children: ReactNode;
  helper?: ReactNode;
  className?: string;
}

export function FilterCard({ children, helper, className }: FilterCardProps) {
  return (
    <div className={cn("w-full rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4 dark:border-white/5 dark:bg-[#111827]", className)}>
      <div className="rounded-[18px] border border-slate-100 bg-slate-50/80 p-3 backdrop-blur-md dark:border-white/5 dark:bg-[#0a0f1d]/80">{children}</div>
      {helper ? <p className="m-0 mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">{helper}</p> : null}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center dark:border-slate-800 dark:bg-[#111827]/50", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white dark:border-white/5 dark:bg-[#1e293b] text-lg font-bold text-slate-300 dark:text-slate-600 shadow-sm">
        {icon ?? "0"}
      </div>
      <p className="m-0 text-sm font-bold text-slate-700 dark:text-slate-300">{title}</p>
      {description ? <p className="m-0 mt-2 max-w-sm text-sm font-medium text-slate-400 dark:text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  tone?: "default" | "danger" | "success";
  href?: string;
  onSelect?: () => void;
  render?: (className: string, close: () => void) => ReactNode;
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
  className?: string;
  triggerClassName?: string;
}

export function ActionMenu({ items, label = "Thao tác", className, triggerClassName }: ActionMenuProps) {
  const dropdown = useDropdown();
  const close = () => dropdown.setOpen(false);

  const itemClass = (tone: ActionMenuItem["tone"] = "default") =>
    cn(
      "flex w-full items-center gap-2.5 rounded-lg border border-transparent bg-white px-3 py-2.5 text-left text-sm font-semibold transition duration-200 ease-out dark:bg-transparent",
      tone === "danger" ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" : tone === "success" ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
    );

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        ref={dropdown.triggerRef}
        type="button"
        onClick={dropdown.toggle}
        title={label}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={dropdown.open}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 ease-out hover:bg-slate-50 hover:text-slate-900 active:scale-95 dark:border-white/5 dark:bg-[#151C2C] dark:text-slate-400 dark:hover:bg-[#1f293d] dark:hover:text-slate-100",
          triggerClassName
        )}
      >
        <MoreVertical className="h-5 w-5" aria-hidden="true" />
      </button>

      {dropdown.open && dropdown.ready ? (
        <Dropdown pos={dropdown.pos} onClose={close}>
          <div className="grid min-w-[160px] gap-1 rounded-xl border border-slate-100 bg-white p-1 shadow-lg dark:border-white/5 dark:bg-[#151C2C]" role="menu">
            {items.map((item) => {
              const classNameForItem = itemClass(item.tone);
              if (item.render) {
                return <div key={item.label}>{item.render(classNameForItem, close)}</div>;
              }
              if (item.href) {
                return (
                  <a key={item.label} href={item.href} className={classNameForItem} role="menuitem" onClick={close}>
                    {item.icon}
                    {item.label}
                  </a>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  disabled={item.disabled}
                  role="menuitem"
                  className={cn(classNameForItem, "disabled:pointer-events-none disabled:opacity-50")}
                  onClick={() => {
                    item.onSelect?.();
                    close();
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </Dropdown>
      ) : null}
    </div>
  );
}
