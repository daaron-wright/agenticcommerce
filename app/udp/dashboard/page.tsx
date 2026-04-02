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

import { productReportRows, productReportTotals, inventoryForecastData, atRiskProducts, sellThroughProducts, productProfitabilityCards, type ProductProfitabilityCard } from "@/lib/dashboard/mock-product-inventory";
import { performanceHeroKpis } from "@/lib/dashboard/mock-overall-performance";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  visualizationCardClass,
  visualizationGrid,
  visualizationPalette,
  visualizationSmallTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";
import { Check, TrendingUp, TrendingDown, FlaskConical, Megaphone, X, AlertTriangle, Shirt, Gem, ShoppingBag, Wind, Scissors } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ── Category → Icon mapping ───────────────────────────────────────────── */

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Knitwear: Shirt,
  Dresses: Gem,
  Outerwear: Wind,
  Trousers: Scissors,
  Tops: ShoppingBag,
};

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = categoryIcons[category] ?? ShoppingBag;
  return <Icon className={className} />;
}
import Link from "next/link";
import { buildIncrementalityHref } from "@/lib/incrementality-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NewCampaignDialog } from "@/components/campaigns/new-campaign-dialog";

/* ── Sell-Through Optimization Section ────────────────────────────────── */

const conditionTabs = ["Slow moving stock", "Slow movers", "Expiry date"] as const;


function getSellThroughTabData(tab: (typeof conditionTabs)[number]) {
  const regularProducts = sellThroughProducts.filter((p) => !p.excludedFromMarketing);
  const excludedProducts = sellThroughProducts.filter((p) => p.excludedFromMarketing);

  switch (tab) {
    case "Slow moving stock":
      // Products with low sell-through (<15)
      return {
        primary: regularProducts
          .filter((p) => p.forecastSellThrough < 15)
          .map((p) => ({ x: p.forecastSellThrough, y: p.marketingSpend, label: p.name })),
        secondary: excludedProducts
          .filter((p) => p.forecastSellThrough < 15)
          .map((p) => ({ x: p.forecastSellThrough, y: p.marketingSpend, label: p.name })),
        primaryLabel: "Active products",
        secondaryLabel: "Excluded products",
      };
    case "Slow movers":
      // All products — highlight those with both low sell-through AND low spend
      return {
        primary: regularProducts
          .filter((p) => p.forecastSellThrough < 20 && p.marketingSpend < 8000)
          .map((p) => ({ x: p.forecastSellThrough, y: p.marketingSpend, label: p.name })),
        secondary: regularProducts
          .filter((p) => !(p.forecastSellThrough < 20 && p.marketingSpend < 8000))
          .concat(excludedProducts)
          .map((p) => ({ x: p.forecastSellThrough, y: p.marketingSpend, label: p.name })),
        primaryLabel: "Slow movers",
        secondaryLabel: "Other products",
      };
    case "Expiry date":
      // Simulate days-until-expiry as a derived dimension
      return {
        primary: sellThroughProducts
          .filter((p) => p.forecastSellThrough < 10)
          .map((p) => ({ x: p.forecastSellThrough, y: p.marketingSpend, label: p.name })),
        secondary: sellThroughProducts
          .filter((p) => p.forecastSellThrough >= 10)
          .map((p) => ({ x: p.forecastSellThrough, y: p.marketingSpend, label: p.name })),
        primaryLabel: "Approaching expiry",
        secondaryLabel: "Healthy stock",
      };
  }
}

function SellThroughOptimization() {
  const [activeTab, setActiveTab] = useState<(typeof conditionTabs)[number]>("Slow moving stock");

  const tabData = getSellThroughTabData(activeTab);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#3d3c3c]">Sell-Through Analysis</h2>
        <p className="text-sm text-stone-500">Product sell-through rates and spend distribution</p>
      </div>

      <Card className={cn(visualizationCardClass)}>
        <CardContent className="pt-4 space-y-4">
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-stone-100">
            {conditionTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-t transition-colors",
                  activeTab === tab
                    ? "bg-stone-100 text-[#3d3c3c] border-b-2 border-[#3d3c3c]"
                    : "text-stone-400 hover:text-stone-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Scatter chart */}
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
              <CartesianGrid {...visualizationGrid} />
              <XAxis
                type="number"
                dataKey="x"
                tick={visualizationSmallTick}
                tickLine={false}
                axisLine={false}
                label={{ value: "Forecast sell-through", position: "bottom", offset: 10, style: { fontSize: 10, fill: visualizationPalette.axis } }}
              />
              <YAxis
                type="number"
                dataKey="y"
                tick={visualizationSmallTick}
                tickLine={false}
                axisLine={false}
                label={{ value: "Marketing spend", angle: -90, position: "insideLeft", offset: -5, style: { fontSize: 10, fill: visualizationPalette.axis } }}
              />
              <Tooltip
                contentStyle={visualizationTooltipStyle}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Scatter
                name={tabData.primaryLabel}
                data={tabData.primary}
                fill={visualizationPalette.teal}
                fillOpacity={0.75}
                strokeWidth={0}
              />
              <Scatter
                name={tabData.secondaryLabel}
                data={tabData.secondary}
                fill={visualizationPalette.mist}
                fillOpacity={0.6}
                strokeWidth={0}
              />
            </ScatterChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: visualizationPalette.teal }} />
              {tabData.primaryLabel}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: visualizationPalette.mist }} />
              {tabData.secondaryLabel}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Change indicator helper ───────────────────────────────────────────── */

function ChangeIndicator({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-medium", positive ? "text-emerald-600" : "text-red-500")}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{value}{suffix}
    </span>
  );
}

/* ── Product Profitability Card ───────────────────────────────────────── */

function ProductCard({ product, onClick }: { product: ProductProfitabilityCard; onClick: () => void }) {
  const isAtRisk = atRiskProducts.some((r) => r.name === product.name);

  return (
    <Card
      className={cn("rounded-none border-stone-200 bg-stone-50 shadow-none cursor-pointer hover:bg-stone-100 transition-colors group", isAtRisk && "border-amber-200")}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header with icon */}
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 rounded-lg bg-stone-200/60 flex items-center justify-center flex-shrink-0">
            <CategoryIcon category={product.category} className="h-4 w-4 text-stone-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-xs font-semibold text-[#3d3c3c] truncate">{product.name}</h3>
              {isAtRisk && (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-[9px] flex-shrink-0">
                  <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                  At risk
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-stone-400">{product.category}</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-stone-200 text-stone-500">{product.market}</Badge>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Products sold</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#3d3c3c]">{product.productsSold.toLocaleString()}</span>
              <ChangeIndicator value={product.productsSoldChange} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Forecast sell-through</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#3d3c3c]">{product.forecastSellThrough}%</span>
              <ChangeIndicator value={product.sellThroughChange} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Marketing spend</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#3d3c3c]">£{product.marketingSpend.toLocaleString()}</span>
              <ChangeIndicator value={product.marketingSpendChange} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Margin after marketing</span>
            <div className="flex items-center gap-2">
              <span className={cn("font-medium", product.marginAfterMarketing >= 0 ? "text-[#3d3c3c]" : "text-red-600")}>{product.marginAfterMarketing}%</span>
              <ChangeIndicator value={product.marginChange} />
            </div>
          </div>
        </div>

        <button className="text-[10px] text-stone-400 hover:text-stone-600 font-medium">▸ Details</button>
      </CardContent>
    </Card>
  );
}

/* ── Product Detail Side Panel ────────────────────────────────────────── */

function ProductDetailPanel({
  product,
  open,
  onOpenChange,
  onLaunchCampaign,
}: {
  product: ProductProfitabilityCard | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLaunchCampaign: (product: ProductProfitabilityCard) => void;
}) {
  if (!product) return null;

  const matchingRow = productReportRows.find((r) => r.productId === product.id);
  const isAtRisk = atRiskProducts.some((r) => r.name === product.name);
  const riskInfo = atRiskProducts.find((r) => r.name === product.name);

  const weekLabels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  const salesChartData = product.weeklySales.map((v, i) => ({ week: weekLabels[i], sales: v }));

  const grossSales = matchingRow?.grossSales ?? product.productsSold * 50;
  const cogs = Math.round(grossSales * 0.42);
  const grossMarginPct = (((grossSales - cogs) / grossSales) * 100).toFixed(1);
  const revenue = grossSales;

  const experimentHref = buildIncrementalityHref({
    entry: "udp",
    lens: "udp",
    application: "campaigns",
    create: true,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="sr-only">{product.name}</SheetTitle>
          <SheetDescription className="sr-only">Product profitability details for {product.name}</SheetDescription>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
              <CategoryIcon category={product.category} className="h-5 w-5 text-stone-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#3d3c3c]">{product.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-stone-400">{product.category}</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-stone-200 text-stone-500">{product.market}</Badge>
              </div>
              {isAtRisk && riskInfo && (
                <div className="mt-1.5">
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-[10px]">
                    <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                    {riskInfo.daysOfStock} days of stock · {riskInfo.sellThroughRate}% sell-through
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Gross sales", value: `£${grossSales.toLocaleString()}` },
            { label: "Order count", value: matchingRow?.orderCount.toLocaleString() ?? "—" },
            { label: "Current inventory", value: matchingRow?.currentInventory.toLocaleString() ?? "—" },
            { label: "Sell-through", value: `${product.forecastSellThrough}%` },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl bg-stone-50 p-3">
              <div className="text-[10px] text-stone-400 uppercase tracking-wide">{kpi.label}</div>
              <div className="text-sm font-semibold text-[#3d3c3c] mt-0.5">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Mini Sales Trend Chart */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-stone-500 mb-2">Sales trend (last 8 weeks)</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={salesChartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid {...visualizationGrid} />
              <XAxis dataKey="week" tick={visualizationSmallTick} tickLine={false} axisLine={false} />
              <YAxis tick={visualizationSmallTick} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={visualizationTooltipStyle} />
              <Line type="monotone" dataKey="sales" stroke={visualizationPalette.teal} strokeWidth={2} dot={{ fill: visualizationPalette.teal, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Profitability Breakdown */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-stone-500 mb-2">Profitability breakdown</h4>
          <div className="space-y-2 text-xs">
            {[
              { label: "Revenue", value: `£${revenue.toLocaleString()}` },
              { label: "COGS", value: `£${cogs.toLocaleString()}` },
              { label: "Gross margin", value: `${grossMarginPct}%` },
              { label: "Marketing spend", value: `£${product.marketingSpend.toLocaleString()}`, change: product.marketingSpendChange },
              { label: "Margin after marketing", value: `${product.marginAfterMarketing}%`, change: product.marginChange },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1 border-b border-stone-50 last:border-0">
                <span className="text-stone-500">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#3d3c3c]">{row.value}</span>
                  {row.change !== undefined && <ChangeIndicator value={row.change} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 gap-1.5 text-xs">
            <Link href={experimentHref}>
              <FlaskConical className="h-3.5 w-3.5" />
              Launch Experiment
            </Link>
          </Button>
          <Button className="flex-1 gap-1.5 text-xs" onClick={() => onLaunchCampaign(product)}>
            <Megaphone className="h-3.5 w-3.5" />
            Create Campaign
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function UdpDashboardPage() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<ProductProfitabilityCard | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campaignDefaultName, setCampaignDefaultName] = useState("");

  if (!user) return null;

  const handleProductClick = (product: ProductProfitabilityCard) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  const handleLaunchCampaign = (product: ProductProfitabilityCard) => {
    setCampaignDefaultName(`Push ${product.name} — Sell-Through Boost`);
    setDetailOpen(false);
    setCampaignOpen(true);
  };

  const handleTableRowClick = (row: typeof productReportRows[0]) => {
    const matching = productProfitabilityCards.find((p) => p.id === row.productId);
    if (matching) handleProductClick(matching);
  };

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

      {/* Sell-Through Optimization */}
      <SellThroughOptimization />

      {/* Product Profitability */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#3d3c3c]">Product Profitability</h2>
          <p className="text-sm text-stone-500">Click a product to drill down into profitability and launch experiments</p>
        </div>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {productProfitabilityCards.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
          ))}
        </div>
      </div>

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
                    <tr key={row.productId} className="border-b border-stone-50 text-stone-700 hover:bg-stone-50/40 cursor-pointer" onClick={() => handleTableRowClick(row)}>
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

      {/* Product Detail Side Panel */}
      <ProductDetailPanel
        product={selectedProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onLaunchCampaign={handleLaunchCampaign}
      />

      {/* Campaign Dialog */}
      <NewCampaignDialog
        open={campaignOpen}
        onOpenChange={setCampaignOpen}
        defaultName={campaignDefaultName}
      />
    </div>
  );
}
