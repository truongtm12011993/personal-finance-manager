"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { APP_TABS, type TabKey } from "@/components/app-navigation";
import { useTabNavigation } from "@/components/use-tab-navigation";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: TabKey;
}

export function MobileBottomNav({ activeTab }: MobileBottomNavProps) {
  const { hrefForTab, isPending, prefetchTab } = useTabNavigation(activeTab);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-[0_-18px_45px_-28px_rgba(15,23,42,0.75)] backdrop-blur-xl sm:px-3 lg:hidden dark:border-white/5 dark:bg-[#111827]/95"
      aria-label="Điều hướng chính"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {APP_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.key}
              href={hrefForTab(tab.key)}
              prefetch={true}
              replace
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={isPending}
              className={cn(
                "relative flex min-h-[56px] flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border px-1.5 text-[10px] font-bold tracking-tight transition duration-200 ease-out",
                isActive
                  ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/20 dark:border-white dark:bg-white dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-500 active:scale-[0.98] dark:border-white/5 dark:bg-white/5 dark:text-slate-400",
                isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              )}
              onTouchStart={() => prefetchTab(tab.key)}
              onMouseEnter={() => prefetchTab(tab.key)}
              onFocus={() => prefetchTab(tab.key)}
              onClick={(event) => {
                if (isPending || isActive) {
                  event.preventDefault();
                }
              }}
            >
              {isActive ? (
                <motion.span
                  layoutId="mobile-active-tab-line"
                  className="absolute inset-x-5 top-0 h-1 rounded-b-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400"
                  transition={{ type: "spring", bounce: 0.12, duration: 0.4 }}
                />
              ) : null}
              <Icon className="relative z-10 h-5 w-5" strokeWidth={2.4} aria-hidden="true" />
              <span className="relative z-10 max-w-full truncate whitespace-nowrap">{tab.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
