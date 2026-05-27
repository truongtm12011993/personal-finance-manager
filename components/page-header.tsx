import { getTabMeta, type TabKey } from "@/components/app-navigation";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageHeaderProps {
  activeTab: TabKey;
}

const contextCopy: Record<TabKey, string> = {
  dashboard: "Tổng hợp sức khỏe tài chính cá nhân",
  expense: "Luồng tiền, ngân sách và giao dịch gần đây",
  investment: "Danh mục, hiệu suất và rủi ro tập trung",
  savings: "Mục tiêu, kỳ hạn và nhật ký tiết kiệm",
};

export function PageHeader({ activeTab }: PageHeaderProps) {
  const activeMeta = getTabMeta(activeTab);
  const ActiveIcon = activeMeta.icon;

  return (
    <header className="rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-sm shadow-slate-200/70 backdrop-blur-xl sm:p-5 dark:border-white/5 dark:bg-[#111827]/80 dark:shadow-none">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
            <ActiveIcon className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{activeMeta.eyebrow}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="m-0 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl dark:text-slate-100">
                {activeMeta.label}
              </h1>
              <p className="m-0 text-sm font-semibold text-slate-500 dark:text-slate-400">{contextCopy[activeTab]}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
