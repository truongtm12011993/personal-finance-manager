import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, PiggyBank, ReceiptText, TrendingUp } from "lucide-react";

export const APP_BREAKPOINTS = {
  mobile: { maxWidth: 639 },
  tablet: { minWidth: 640, maxWidth: 1023 },
  desktop: { minWidth: 1024 },
} as const;

export const APP_TABS = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Tổng quan",
    eyebrow: "Toàn cảnh",
    icon: LayoutDashboard,
  },
  {
    key: "expense",
    label: "Chi tiêu",
    shortLabel: "Chi tiêu",
    eyebrow: "Dòng tiền",
    icon: ReceiptText,
  },
  {
    key: "investment",
    label: "Đầu tư",
    shortLabel: "Đầu tư",
    eyebrow: "Danh mục",
    icon: TrendingUp,
  },
  {
    key: "savings",
    label: "Tiết kiệm",
    shortLabel: "Tiết kiệm",
    eyebrow: "Mục tiêu",
    icon: PiggyBank,
  },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  shortLabel: string;
  eyebrow: string;
  icon: LucideIcon;
}>;

export type TabKey = (typeof APP_TABS)[number]["key"];

const TAB_KEY_SET = new Set<string>(APP_TABS.map((tab) => tab.key));

export function getActiveTab(value: string | string[] | undefined): TabKey {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && TAB_KEY_SET.has(candidate) ? (candidate as TabKey) : "dashboard";
}

export function getTabMeta(activeTab: TabKey) {
  return APP_TABS.find((tab) => tab.key === activeTab) ?? APP_TABS[0];
}
