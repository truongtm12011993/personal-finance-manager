"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { TabKey } from "@/components/app-navigation";

export function useTabNavigation(activeTab: TabKey) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function switchTab(nextTab: TabKey) {
    if (nextTab === activeTab) return;

    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", nextTab);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return { isPending, switchTab };
}
