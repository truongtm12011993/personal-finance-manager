"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { APP_TABS, type TabKey } from "@/components/app-navigation";
import { useTabNavigation } from "@/components/use-tab-navigation";
import { cn } from "@/lib/utils";

interface DesktopTabsProps {
  activeTab: TabKey;
}

export function DesktopTabs({ activeTab }: DesktopTabsProps) {
  const { hrefForTab, isPending, prefetchTab } = useTabNavigation(activeTab);

  return (
    <nav className="hidden h-full flex-col lg:flex" aria-label="Điều hướng chính">
      <div className="mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-950 shadow-sm">
          F
        </div>
        <div className="mt-5">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Workspace</p>
          <h2 className="m-0 mt-2 text-2xl font-bold leading-tight tracking-tight text-white">Finance OS</h2>
        </div>
      </div>

      <div className="grid gap-2" role="tablist" aria-label="Điều hướng bảng tài chính">
        {APP_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.key}
              href={hrefForTab(tab.key)}
              prefetch={false}
              replace
              scroll={false}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isPending}
              className={cn(
                "group relative flex min-h-[68px] w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 text-left transition duration-200 ease-out",
                isActive
                  ? "border-white/15 bg-white text-slate-950 shadow-xl shadow-black/20"
                  : "border-white/5 bg-white/[0.04] text-slate-300 hover:border-white/10 hover:bg-white/[0.08] hover:text-white",
                isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              )}
              onMouseEnter={() => prefetchTab(tab.key)}
              onClick={(event) => {
                if (isPending || isActive) {
                  event.preventDefault();
                }
              }}
            >
              {isActive ? (
                <motion.span
                  layoutId="desktop-active-tab"
                  className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-gradient-to-b from-purple-500 via-indigo-500 to-cyan-400"
                  transition={{ type: "spring", bounce: 0.14, duration: 0.45 }}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200",
                  isActive ? "bg-slate-950 text-white" : "bg-white/10 text-slate-300 group-hover:bg-white/15 group-hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span className="relative z-10 min-w-0">
                <span className="block truncate text-sm font-bold tracking-tight">{tab.label}</span>
                <span className={cn("mt-0.5 block truncate text-xs font-semibold", isActive ? "text-slate-500" : "text-slate-500")}>
                  {tab.eyebrow}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
