"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { TabKey } from "@/components/app-navigation";

export function useTabNavigation(activeTab: TabKey) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const hrefForTab = useCallback((nextTab: TabKey) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", nextTab);
    return `${pathname}?${params.toString()}`;
  }, [pathname, searchParams]);

  function prefetchTab(nextTab: TabKey) {
    if (nextTab === activeTab) return;
    router.prefetch(hrefForTab(nextTab));
  }

  function switchTab(nextTab: TabKey) {
    if (nextTab === activeTab) return;
    startTransition(() => {
      router.replace(hrefForTab(nextTab), { scroll: false });
    });
  }

  return { hrefForTab, isPending, prefetchTab, switchTab };
}
