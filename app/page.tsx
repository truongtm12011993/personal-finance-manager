import { Suspense } from "react";
import DashboardTab from "@/components/dashboard-tab";
import ExpenseTab from "@/components/expense-tab";
import InvestmentTab from "@/components/investment-tab";
import SavingsTab from "@/components/savings-tab";
import { AppShell } from "@/components/app-shell";
import { getActiveTab } from "@/components/app-navigation";
import { LoginScreen } from "@/components/login-screen";
import { auth } from "@/auth";

function TabContentFallback() {
  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-40 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="h-3 w-24 rounded-full bg-slate-100" />
            <div className="mt-6 h-8 w-36 rounded-full bg-slate-100" />
            <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/2 animate-[shimmer_1.6s_infinite] rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500" />
            </div>
          </div>
        ))}
      </section>
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 text-sm font-bold text-slate-400 shadow-sm">
        Đang tải dữ liệu...
      </div>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab = getActiveTab(params.tab);
  const session = await auth();

  if (!session?.user?.id) {
    return <LoginScreen />;
  }

  return (
    <AppShell activeTab={tab} user={session.user}>
      <Suspense fallback={<TabContentFallback />}>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "expense" && <ExpenseTab searchParams={params} />}
        {tab === "investment" && <InvestmentTab searchParams={params} />}
        {tab === "savings" && <SavingsTab />}
      </Suspense>
    </AppShell>
  );
}
