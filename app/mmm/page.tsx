"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart2, Info, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { SaturationCurveCard } from "@/components/dashboard/charts/saturation-curve-card";
import {
  missedPotentialData,
  marketOverview,
  channelRecommendations,
  saturationChannels,
} from "@/lib/dashboard/mock-mmm-saturation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  WEEKLY_COMMERCIAL_REVIEW,
  formatCommercialCurrency,
} from "@/lib/commercial-review";
import { cn } from "@/lib/utils";
import {
  visualizationCardClass,
  visualizationGrid,
  visualizationLegendStyle,
  visualizationPalette,
  visualizationTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";

import { ScenarioBuilderTab } from "./components/scenario-builder";

const budgetAllocationData = [
  { channel: "Google\nPMAX", actualSpend: 156000, proposedSpend: 182000, estimatedProfit: 258000 },
  { channel: "Google\nSearch", actualSpend: 102000, proposedSpend: 98000, estimatedProfit: 134000 },
  { channel: "Meta\nProspecting", actualSpend: 118000, proposedSpend: 92000, estimatedProfit: 69000 },
  { channel: "TikTok\nProspecting", actualSpend: 74000, proposedSpend: 48000, estimatedProfit: 24000 },
  { channel: "Affiliate", actualSpend: 28000, proposedSpend: 31000, estimatedProfit: 36000 },
];

function ChangeIndicator({ value }: { value: string }) {
  const positive = value.startsWith("+");

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
        positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}
    >
      {value}
    </span>
  );
}

function RecommendationBadge({ action }: { action: string }) {
  const supportive = action.toLowerCase().includes("scale") || action.toLowerCase().includes("keep");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        supportive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {supportive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {supportive ? "Support" : "Watch"}
    </span>
  );
}

function AgentBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-500" />
      <p className="flex-1 text-xs leading-relaxed text-stone-700">
        Monday trading uses the previous Monday-Sunday window and benchmarks against the prior week and the equivalent week last year.
      </p>
      <button onClick={onClose} className="text-xs text-stone-500 hover:text-stone-700">
        Dismiss
      </button>
    </div>
  );
}

function WeeklyCommercialPanel() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card className={visualizationCardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance trend (sales, ROAS, CAC)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={WEEKLY_COMMERCIAL_REVIEW.performanceTrend} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <CartesianGrid {...visualizationGrid} vertical={false} />
              <XAxis dataKey="day" tick={visualizationTick} tickLine={false} axisLine={false} />
              <YAxis yAxisId="sales" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={visualizationTick} tickLine={false} axisLine={false} />
              <YAxis yAxisId="roas" orientation="right" hide domain={[2.5, 4]} />
              <YAxis yAxisId="cac" orientation="right" hide domain={[22, 34]} />
              <Tooltip
                formatter={(value, name) => {
                  const metricName = typeof name === "string" ? name : String(name ?? "");
                  const numericValue = Number(value ?? 0);

                  return [
                    metricName === "roas"
                      ? `${numericValue.toFixed(1)}x`
                      : metricName === "cac"
                        ? `£${numericValue.toFixed(2)}`
                        : `£${numericValue.toLocaleString("en-GB")}`,
                    metricName === "grossSalesCurrent"
                      ? "Last week"
                      : metricName === "grossSalesPrevious"
                        ? "Previous week"
                        : metricName === "grossSalesLastYear"
                          ? "Last year"
                          : metricName === "roas"
                            ? "ROAS"
                            : "CAC",
                  ];
                }}
                contentStyle={visualizationTooltipStyle}
              />
              <Legend
                formatter={(value) =>
                  value === "grossSalesCurrent"
                    ? "Last week"
                    : value === "grossSalesPrevious"
                      ? "Previous week"
                      : value === "grossSalesLastYear"
                        ? "Last year"
                        : value === "roas"
                          ? "ROAS"
                          : "CAC"
                }
                wrapperStyle={visualizationLegendStyle}
              />
              <Line yAxisId="sales" type="monotone" dataKey="grossSalesCurrent" stroke={visualizationPalette.ink} strokeWidth={2.5} dot={false} />
              <Line yAxisId="sales" type="monotone" dataKey="grossSalesPrevious" stroke={visualizationPalette.steel} strokeWidth={2} strokeDasharray="4 2" dot={false} />
              <Line yAxisId="sales" type="monotone" dataKey="grossSalesLastYear" stroke={visualizationPalette.cloud} strokeWidth={2} dot={false} />
              <Line yAxisId="roas" type="monotone" dataKey="roas" stroke={visualizationPalette.success} strokeWidth={1.8} dot={false} />
              <Line yAxisId="cac" type="monotone" dataKey="cac" stroke={visualizationPalette.danger} strokeWidth={1.8} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">KPI performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">KPI</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Value</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">WoW</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">YoY</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKLY_COMMERCIAL_REVIEW.kpis.map((row) => (
                    <tr key={row.label} className="border-b hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium">{row.label}</td>
                      <td className="px-3 py-2 text-right">{row.value}</td>
                      <td className="px-3 py-2 text-right">{row.wow}</td>
                      <td className="px-3 py-2 text-right">{row.yoy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Market breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Market</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Gross sales</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">WoW</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">YoY</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">New customers</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">CAC</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKLY_COMMERCIAL_REVIEW.marketBreakdown.map((row) => (
                    <tr key={row.market} className="border-b hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <div className="font-medium">{row.market}</div>
                        <div className="text-[10px] text-muted-foreground">{row.note}</div>
                      </td>
                      <td className="px-3 py-2 text-right">{formatCommercialCurrency(row.grossSales)}</td>
                      <td className="px-3 py-2 text-right">{row.wow}</td>
                      <td className="px-3 py-2 text-right">{row.yoy}</td>
                      <td className="px-3 py-2 text-right">{row.newCustomers}</td>
                      <td className="px-3 py-2 text-right">{row.cac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Paid channel performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Channel</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Spend</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Gross sales</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">WoW sales</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">ROAS</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">CAC</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKLY_COMMERCIAL_REVIEW.paidChannelPerformance.map((row) => (
                    <tr key={row.channel} className="border-b hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium">{row.channel}</td>
                      <td className="px-3 py-2 text-right">{formatCommercialCurrency(row.spend)}</td>
                      <td className="px-3 py-2 text-right">{formatCommercialCurrency(row.grossSales)}</td>
                      <td className="px-3 py-2 text-right"><ChangeIndicator value={row.wowSales} /></td>
                      <td className="px-3 py-2 text-right">{row.roas}</td>
                      <td className="px-3 py-2 text-right">{row.cac}</td>
                      <td className="px-3 py-2 text-right"><RecommendationBadge action={row.action} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Flags for discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {WEEKLY_COMMERCIAL_REVIEW.discussionFlags.map((flag) => (
              <div
                key={flag}
                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-700"
              >
                {flag}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function MarketOverviewPanel({ selectedMarket }: { selectedMarket: string }) {
  const visibleMarkets = useMemo(() => {
    if (selectedMarket === "Select market") {
      return WEEKLY_COMMERCIAL_REVIEW.marketBreakdown;
    }

    return WEEKLY_COMMERCIAL_REVIEW.marketBreakdown.filter((row) => row.market === selectedMarket);
  }, [selectedMarket]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {WEEKLY_COMMERCIAL_REVIEW.kpis.slice(0, 6).map((kpi) => {
          const positive = kpi.wow.startsWith("+");

          return (
            <Card key={kpi.label} className="p-3">
              <p className="mb-1 text-[10px] leading-tight text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
              <span
                className={cn(
                  "mt-0.5 flex items-center gap-0.5 text-xs font-medium",
                  positive ? "text-stone-600" : "text-stone-400"
                )}
              >
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.wow} WoW · {kpi.yoy} YoY
              </span>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selected market view</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-semibold text-muted-foreground">Market</th>
                  <th className="py-2 text-right font-semibold text-muted-foreground">Gross sales</th>
                  <th className="py-2 text-right font-semibold text-muted-foreground">WoW</th>
                  <th className="py-2 text-right font-semibold text-muted-foreground">CAC</th>
                </tr>
              </thead>
              <tbody>
                {visibleMarkets.map((market) => (
                  <tr key={market.market} className="border-b hover:bg-muted/20">
                    <td className="py-2.5">
                      <div className="font-medium">{market.market}</div>
                      <div className="text-[10px] text-muted-foreground">{market.note}</div>
                    </td>
                    <td className="py-2.5 text-right">{formatCommercialCurrency(market.grossSales)}</td>
                    <td className="py-2.5 text-right">{market.wow}</td>
                    <td className="py-2.5 text-right">{market.cac}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gross sales by day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={WEEKLY_COMMERCIAL_REVIEW.grossSalesTrend} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <CartesianGrid {...visualizationGrid} vertical={false} />
              <XAxis dataKey="day" tick={visualizationTick} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={visualizationTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={visualizationTooltipStyle} />
              <Line type="monotone" dataKey="currentWeek" stroke={visualizationPalette.ink} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="lastYear" stroke={visualizationPalette.cloud} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FutureScenarioTab() {
  const [showPerDay, setShowPerDay] = useState(true);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scenario brief</p>
          <p className="mt-2 text-xs leading-relaxed text-stone-700">
            Reallocate spend toward the most efficient paid channels while protecting acquisition volume in the strongest market clusters.
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border px-3 py-2">
          <div>
            <p className="text-xs font-medium">Show values per day</p>
            <p className="text-[10px] text-muted-foreground">Toggle the scenario chart scale.</p>
          </div>
          <Switch checked={showPerDay} onCheckedChange={setShowPerDay} />
        </div>
        <Button size="sm" className="w-full text-xs">
          Run scenario
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Optimised budget allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budgetAllocationData} margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
              <CartesianGrid {...visualizationGrid} vertical={false} />
              <XAxis dataKey="channel" interval={0} tick={visualizationTick} height={44} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={visualizationTick} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={visualizationTooltipStyle} />
              <Legend wrapperStyle={visualizationLegendStyle} />
              <ReferenceLine y={0} stroke={visualizationPalette.steel} />
              <Bar dataKey="actualSpend" fill={visualizationPalette.ink} name="Actual spend" />
              <Bar dataKey="proposedSpend" fill={visualizationPalette.teal} name="Proposed spend" />
              <Bar dataKey="estimatedProfit" fill={visualizationPalette.cloud} name="Estimated profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm">Channel analysis</CardTitle>
              <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <BarChart2 className="h-3 w-3" /> Comparison
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-semibold text-muted-foreground">Channel</th>
                  <th className="py-2 text-right font-semibold text-muted-foreground">Actual spend</th>
                  <th className="py-2 text-right font-semibold text-muted-foreground">Proposed spend</th>
                  <th className="py-2 text-right font-semibold text-muted-foreground">Estimated profit</th>
                </tr>
              </thead>
              <tbody>
                {budgetAllocationData.map((row) => (
                  <tr key={row.channel} className="border-b hover:bg-muted/20">
                    <td className="py-2.5 font-medium whitespace-pre-line">{row.channel}</td>
                    <td className="py-2.5 text-right">{formatCommercialCurrency(row.actualSpend)}</td>
                    <td className="py-2.5 text-right">{formatCommercialCurrency(row.proposedSpend)}</td>
                    <td className="py-2.5 text-right">{formatCommercialCurrency(row.estimatedProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SaturationCurvesTab() {
  return (
    <div className="space-y-6">
      {/* Missed Potential */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className={visualizationCardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Missed Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-6 h-40">
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-bold text-[#3d3c3c]">${missedPotentialData.actualProfit.toLocaleString()}</p>
                <div className="w-full h-24 rounded bg-[#6366f1]/20 mt-2" />
                <p className="text-[10px] text-stone-500 mt-1">Actual profit</p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-xs font-semibold text-emerald-600">+ ${missedPotentialData.missedPotential.toLocaleString()}</p>
                <div className="w-full rounded mt-2 flex flex-col">
                  <div className="h-6 rounded-t border-2 border-dashed border-[#6366f1]/40 bg-[#6366f1]/10" />
                  <div className="h-24 rounded-b bg-[#6366f1]/20" />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">Missed potential</p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-bold text-[#3d3c3c]">${missedPotentialData.predictedProfit.toLocaleString()}</p>
                <div className="w-full h-28 rounded bg-[#6366f1]/30 mt-2" />
                <p className="text-[10px] text-stone-500 mt-1">Predicted profit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={visualizationCardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-wide text-stone-500">
                  <th className="pb-2 font-medium">Market</th>
                  <th className="pb-2 font-medium text-right">Spend</th>
                  <th className="pb-2 font-medium text-right">Potential</th>
                </tr>
              </thead>
              <tbody>
                {marketOverview.map((row) => (
                  <tr key={row.market} className="border-b border-stone-50">
                    <td className="py-2 font-medium text-[#3d3c3c]">{row.market}</td>
                    <td className={cn("py-2 text-right font-medium", row.positive ? "text-emerald-600" : "text-rose-500")}>{row.spendChange}</td>
                    <td className="py-2 text-right text-stone-600">{row.potential}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Saturation Curves */}
      <h3 className="text-sm font-semibold text-[#3d3c3c]">Channel Saturation Curves</h3>
      <div className="grid gap-4 xl:grid-cols-2">
        {saturationChannels.map((ch) => (
          <SaturationCurveCard key={ch.channel} channel={ch} />
        ))}
      </div>

      {/* Channel Recommendations */}
      <Card className={visualizationCardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Channel Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2 font-medium">Channel</th>
                  <th className="px-4 py-2 font-medium text-right">Last week</th>
                  <th className="px-4 py-2 font-medium text-right">Proposed</th>
                  <th className="px-4 py-2 font-medium text-right">Change</th>
                  <th className="px-4 py-2 font-medium text-right">Gross sales</th>
                  <th className="px-4 py-2 font-medium text-right">Profit</th>
                  <th className="px-4 py-2 font-medium text-right">ROAS</th>
                  <th className="px-4 py-2 font-medium text-right">epROAS</th>
                  <th className="px-4 py-2 font-medium">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {channelRecommendations.map((row) => (
                  <tr key={row.channel} className="border-b border-stone-50 hover:bg-stone-50/40">
                    <td className="px-4 py-2 font-medium text-[#3d3c3c]">{row.channel}</td>
                    <td className="px-4 py-2 text-right">{row.lastWeekSpend.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{row.proposedSpend.toLocaleString()}</td>
                    <td className={cn("px-4 py-2 text-right font-medium", row.positive ? "text-emerald-600" : "text-rose-500")}>{row.changePercent}</td>
                    <td className="px-4 py-2 text-right">{row.grossSalesPredicted.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{row.profitPredicted.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{row.roas}</td>
                    <td className="px-4 py-2 text-right">{row.epRoas}</td>
                    <td className="px-4 py-2">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        row.recommendation.includes("Increase") ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                        row.recommendation === "Pause" ? "border-red-200 bg-red-50 text-red-700" :
                        row.recommendation === "Efficient spend" ? "border-stone-200 bg-stone-50 text-stone-600" :
                        "border-amber-200 bg-amber-50 text-amber-700"
                      )}>
                        {row.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ViewTab = "weekly" | "overview" | "scenario" | "saturation";

function ScenarioPlannerTab() {
  const [showResults, setShowResults] = useState(false);

  if (showResults) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Scenario Results</h2>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowResults(false)}>
            Build New Scenario
          </Button>
        </div>
        <FutureScenarioTab />
      </div>
    );
  }

  return <ScenarioBuilderTab onModelApplied={() => setShowResults(true)} />;
}

export default function MMMPage() {
  const [viewTab, setViewTab] = useState<ViewTab>("weekly");
  const [market, setMarket] = useState("Select market");
  const [period, setPeriod] = useState("last-week");
  const [showBanner, setShowBanner] = useState(true);

  const periodLabel: Record<string, string> = {
    "last-week": "Last Week  09 Mar – 15 Mar, 2026",
    "this-week": "This Week  16 Mar – 22 Mar, 2026",
    "last-month": "Last Month  Feb 2026",
  };

  return (
      <div className="min-w-0 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <span className="text-xl text-muted-foreground">/</span>
          <Select value={market} onValueChange={setMarket}>
            <SelectTrigger className="h-8 w-auto border-0 pl-0 text-base font-semibold shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Select market">Select market</SelectItem>
              {WEEKLY_COMMERCIAL_REVIEW.marketBreakdown.map((row) => (
                <SelectItem key={row.market} value={row.market}>
                  {row.market}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            {periodLabel[period]}
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-auto text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex overflow-hidden rounded-lg border text-xs">
            {([
              ["weekly", "Weekly review"],
              ["overview", "Market overview"],
              ["saturation", "Saturation & Recs"],
              ["scenario", "Scenario Planner"],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  viewTab === tab ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <RecentFromChat category="mmm" />

      {showBanner && <AgentBanner onClose={() => setShowBanner(false)} />}

      <Card>
        <CardContent className="pt-6">
          {viewTab === "weekly" && <WeeklyCommercialPanel />}
          {viewTab === "overview" && <MarketOverviewPanel selectedMarket={market} />}
          {viewTab === "saturation" && <SaturationCurvesTab />}
          {viewTab === "scenario" && <ScenarioPlannerTab />}
        </CardContent>
      </Card>
      </div>
  );
}
