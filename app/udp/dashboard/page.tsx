"use client";

import { useAuth } from "@/lib/auth-context";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { PageBanner } from "@/components/ui/page-banner";
import { KpiGrid } from "@/components/cdp/dashboard/kpi-grid";
import { OverviewCharts } from "@/components/cdp/dashboard/overview-charts";
import { CommerceTables } from "@/components/cdp/dashboard/commerce-tables";
import { OperationsActivity } from "@/components/cdp/dashboard/operations-activity";
import { ecommerceDashboardData } from "@/lib/dashboard/mock-ecommerce";

export default function UdpDashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const dashboard = {
    ...ecommerceDashboardData,
    title: "UDP Dashboard",
    description: "Customer data, commerce, and operations performance overview",
  };

  return (
    <div className="space-y-6">
      <RecentFromChat category="dashboard" />

      <PageBanner category="UDP / CDP" title={dashboard.title} description={dashboard.description} />

      <KpiGrid kpis={dashboard.kpis} />

      <OverviewCharts
        dailyPerformance={dashboard.dailyPerformance}
        funnel={dashboard.funnel}
        regions={dashboard.regions}
      />

      <CommerceTables channels={dashboard.channels} topProducts={dashboard.topProducts} />

      <OperationsActivity operations={dashboard.operations} recentActivity={dashboard.recentActivity} />
    </div>
  );
}
