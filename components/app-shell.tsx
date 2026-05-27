import { DesktopTabs } from "@/components/desktop-tabs";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PageHeader } from "@/components/page-header";
import { UserMenu } from "@/components/user-menu";
import type { TabKey } from "@/components/app-navigation";
import { Suspense, type ReactNode } from "react";

interface AppShellProps {
  activeTab: TabKey;
  children: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AppShell({ activeTab, children, user }: AppShellProps) {
  return (
    <main className="app-typo-scope min-h-screen overflow-x-hidden bg-[#f4f7fb] text-slate-950 transition-colors duration-200 dark:bg-[#0a0f1d] dark:text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen border-r border-white/10 bg-[#111827] p-5 lg:block dark:bg-[#050816]">
          <Suspense fallback={null}>
            <DesktopTabs activeTab={activeTab} />
          </Suspense>
        </aside>

        <section className="min-w-0 pb-28 lg:pb-0">
          <div className="mx-auto grid w-full max-w-[1480px] gap-5 px-3 py-3 sm:gap-6 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
            <Suspense fallback={null}>
              <PageHeader activeTab={activeTab} />
            </Suspense>
            {user ? <UserMenu name={user.name} email={user.email} image={user.image} /> : null}
            <div className="animate-slide-up">{children}</div>
          </div>
        </section>
      </div>

      <Suspense fallback={null}>
        <MobileBottomNav activeTab={activeTab} />
      </Suspense>
    </main>
  );
}
