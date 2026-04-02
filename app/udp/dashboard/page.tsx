"use client";

import { useAuth } from "@/lib/auth-context";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { PageBanner } from "@/components/ui/page-banner";
import { KpiGrid } from "@/components/cdp/dashboard/kpi-grid";
import { OverviewCharts } from "@/components/cdp/dashboard/overview-charts";
import { CommerceTables } from "@/components/cdp/dashboard/commerce-tables";
import { OperationsActivity } from "@/components/cdp/dashboard/operations-activity";
import { ecommerceDashboardData } from "@/lib/dashboard/mock-ecommerce";

import { KpiHeroStrip } from "@/components/dashboard/charts/kpi-hero-strip";
import { ScatterChartCard } from "@/components/dashboard/charts/scatter-chart-card";
import { ForecastLineCard } from "@/components/dashboard/charts/forecast-line-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { productReportRows, productReportTotals, inventoryForecastData, atRiskProducts } from "@/lib/dashboard/mock-product-inventory";
import { performanceHeroKpis } from "@/lib/dashboard/mock-overall-performance";

export default function UdpDashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const dashboard = {
    ...ecommerceDashboardData,
    title: "UDP Dashboard",
    description: "Customer data, commerce, and operations performance overview",
  };

  const scatterData = productReportRows.map((row) => ({
    x: row.marketingSpend,
    y: row.currentInventory,
    label: row.name,
  }));

  const forecastData = inventoryForecastData.map((d) => ({
    label: d.week,
    actual: d.actual,
    forecast: d.forecast,
  }));

  return (
    <div className="space-y-6">
      <RecentFromChat category="dashboard" />

      <PageBanner category="UDP / CDP" title={dashboard.title} description={dashboard.description} />

      {/* Overall Performance KPIs */}
      <KpiHeroStrip kpis={performanceHeroKpis} />

      <KpiGrid kpis={dashboard.kpis} />

      <OverviewCharts
        dailyPerformance={dashboard.dailyPerformance}
        funnel={dashboard.funnel}
        regions={dashboard.regions}
      />

      {/* Product Report — Scatter + Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#3d3c3c]">Product Report</h2>

        <ScatterChartCard
          title="Marketing Spend vs Inventory Value"
          subtitle="Each dot represents a product"
          data={scatterData}
          xLabel="Marketing spend"
          yLabel="Inventory value"
        />

        <Card className="rounded-2xl border-stone-200 bg-white shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-[10px] uppercase tracking-wide text-stone-500">
                    <th className="px-4 py-3 font-medium">Product ID</th>
                    <th className="px-4 py-3 font-medium">Product name</th>
                    <th className="px-4 py-3 font-medium text-right">End of season inventory</th>
                    <th className="px-4 py-3 font-medium text-right">Current inventory</th>
                    <th className="px-4 py-3 font-medium text-right">Product views</th>
                    <th className="px-4 py-3 font-medium text-right">Order count</th>
                    <th className="px-4 py-3 font-medium text-right">Gross sales</th>
                    <th className="px-4 py-3 font-medium text-right">Marketing spend</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Totals row */}
                  <tr className="border-b border-stone-200 bg-stone-50/60 font-semibold text-[#3d3c3c]">
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right">{productReportTotals.endOfSeasonInventory.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{productReportTotals.currentInventory.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{productReportTotals.productViews.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{productReportTotals.orderCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{productReportTotals.grossSales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{productReportTotals.marketingSpend.toLocaleString()}</td>
                  </tr>
                  {productReportRows.map((row) => (
                    <tr key={row.productId} className="border-b border-stone-50 text-stone-700 hover:bg-stone-50/40">
                      <td className="px-4 py-2.5 text-stone-400">{row.productId}</td>
                      <td className="px-4 py-2.5 font-medium text-[#3d3c3c]">{row.name}</td>
                      <td className="px-4 py-2.5 text-right">{row.endOfSeasonInventory.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">{row.currentInventory.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">{row.productViews.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">{row.orderCount.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">{row.grossSales.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">{row.marketingSpend.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Forecast */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#3d3c3c]">Inventory Forecast</h2>

        <ForecastLineCard
          title="Inventory Levels — Actual vs Forecast"
          subtitle="Dashed line shows predicted inventory depletion"
          data={forecastData}
          yLabel="Inventory units"
        />

        {atRiskProducts.length > 0 && (
          <Card className="rounded-2xl border-amber-200 bg-amber-50/40 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-800">At-Risk Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {atRiskProducts.map((p) => (
                <div key={p.sku} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={p.risk === "high" ? "border-red-200 bg-red-50 text-red-700 text-[10px]" : "border-amber-200 bg-amber-50 text-amber-700 text-[10px]"}>
                      {p.risk}
                    </Badge>
                    <span className="font-medium text-[#3d3c3c]">{p.name}</span>
                    <span className="text-stone-400">{p.sku}</span>
                  </div>
                  <div className="flex items-center gap-4 text-stone-500">
                    <span>{p.daysOfStock} days of stock</span>
                    <span>{p.sellThroughRate}% sell-through</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <CommerceTables channels={dashboard.channels} topProducts={dashboard.topProducts} />

      <OperationsActivity operations={dashboard.operations} recentActivity={dashboard.recentActivity} />
    </div>
  );
}
