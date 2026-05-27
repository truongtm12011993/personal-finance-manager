import { getInvestmentDashboard } from "@/lib/server/investment/investment-service";
import { InvestmentTabUI } from "./investment-tab-ui";

function singleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getRecentMonthsFrom(endMonth: string, count: number) {
  const [year, month] = endMonth.split("-").map(Number);
  if (!year || !month) return [];
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(year, month - 1 - i, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    months.push(`${y}-${m}`);
  }
  return months;
}

export default async function InvestmentTab({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const investmentAssetFilter = singleParam(searchParams?.investmentAssetId) ?? "all";

  const currentMonth = new Date().toISOString().slice(0, 7);
  const recentMonths = getRecentMonthsFrom(currentMonth, 6);
  
  const dashboard = await getInvestmentDashboard({
    month: "all",
    assetId: investmentAssetFilter,
  });

  const returnTo = `/?tab=investment&investmentAssetId=${investmentAssetFilter}`;
  type DashboardTx = (typeof dashboard.transactions)[number];

  // Serialize and prepare data for client component
  const dashboardData = {
    assets: dashboard.assets,
    transactions: dashboard.transactions.map((tx: DashboardTx) => ({
      ...tx,
      occurredAt: tx.occurredAt.toISOString(),
    })),
    holdings: dashboard.holdings,
    usdVnd: dashboard.usdVnd,
    summary: dashboard.summary,
  };

  return (
    <InvestmentTabUI 
      dashboard={dashboardData}
      investmentAssetFilter={investmentAssetFilter}
      recentMonths={recentMonths}
      returnTo={returnTo}
    />
  );
}
