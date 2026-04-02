"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Copy, Download, Filter, ChevronDown, ChevronUp, X, Trash2, TrendingUp, BarChart2, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { PageBanner } from "@/components/ui/page-banner";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import {
  WEEKLY_COMMERCIAL_REVIEW,
  formatCommercialCurrency,
} from "@/lib/commercial-review";
import {
  visualizationCardClass,
  visualizationChartFrameClass,
  visualizationGrid,
  visualizationLegendStyle,
  visualizationPalette,
  visualizationTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";
import { attributionModelRows } from "@/lib/dashboard/mock-incrementality-summary";

function ChangeBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
        value.startsWith("+")
          ? "bg-emerald-50 text-emerald-700"
          : value.startsWith("-")
            ? "bg-rose-50 text-rose-700"
            : "bg-stone-100 text-stone-600"
      )}
    >
      {value}
    </span>
  );
}

type ViewTab = "Data" | "Table" | "Chart" | "General";

const kpiSummaryRow = [
  { label: "Visits", value: "609,413", model: "Dema MTA", change: "+10%" },
  { label: "Conversion rate", value: "1.78%", model: "Dema MTA", change: "+15%" },
  { label: "Order count", value: "8,408", model: "Dema MTA", change: "+8%" },
  { label: "Profit", value: "4,375,526", model: null, change: "+99%", forecast: true },
  { label: "Net Sales", value: "722,677", model: "Dema MTA", change: "+49%", forecast: true },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-7");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>("Chart");
  const [showChartSettings, setShowChartSettings] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [cumulative, setCumulative] = useState(false);
  const [xAxisScale, setXAxisScale] = useState("days");
  const [showYAxes, setShowYAxes] = useState(true);
  const [showYAxisLabels, setShowYAxisLabels] = useState(true);
  const { user } = useAuth();
  const canExecuteAI = user ? hasPermissionForUser(user, "ai_action_execute") : false;

  const dateRangeLabels: Record<string, string> = {
    "last-7": "Last Week: 09 Mar – 15 Mar, 2026",
    "last-28": "Last 4 Weeks ending 15 Mar, 2026",
    "last-90": "Last 13 Weeks ending 15 Mar, 2026",
  };

  const sortedChannels = useMemo(() => {
    return [...WEEKLY_COMMERCIAL_REVIEW.paidChannelPerformance].sort((a, b) =>
      sortDir === "desc" ? b.grossSales - a.grossSales : a.grossSales - b.grossSales
    );
  }, [sortDir]);

  return (
      <div className="space-y-4 min-w-0">
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Report Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="google">Google PMAX</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="snapchat">Snapchat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select defaultValue="gross-sales">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gross-sales">Gross Sales</SelectItem>
                  <SelectItem value="roas">ROAS</SelectItem>
                  <SelectItem value="cac">CAC</SelectItem>
                  <SelectItem value="new-customers">New Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comparison</Label>
              <Select defaultValue="wow">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wow">Week on Week</SelectItem>
                  <SelectItem value="yoy">Year on Year</SelectItem>
                  <SelectItem value="none">No comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => { toast.success("Filters applied"); setShowFilters(false); }}>
              Apply filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <RecentFromChat category="reports" />

      <PageBanner
        title="Weekly commercial review"
        description="Paid channel, KPI, and gross sales reporting aligned to the Monday trading summary."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-stone-700 text-white text-xs rounded px-3 py-1.5 font-medium">
              {dateRangeLabels[dateRange]}
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-8 text-xs w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7">Last Week</SelectItem>
                <SelectItem value="last-28">Last 4 Weeks</SelectItem>
                <SelectItem value="last-90">Last 13 Weeks</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" onClick={() => setShowFilters(true)}>
              <Filter className="h-3 w-3" /> Filters
            </Button>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={() => toast.success("Export started", { description: "CSV will download shortly." })}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" className="text-xs gap-1.5 h-8" onClick={() => toast.success("Report saved", { description: "Added to your workspace." })}>
              <Copy className="h-3.5 w-3.5" /> Save copy
            </Button>
          </div>
        }
      />

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiSummaryRow.map((kpi) => (
          <Card key={kpi.label} className={cn(visualizationCardClass, "p-3")}>
            <div className="text-[10px] text-stone-500 uppercase tracking-wide">{kpi.label}</div>
            {kpi.model && <div className="text-[10px] text-stone-400 mt-0.5">{kpi.model}</div>}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-semibold text-[#3d3c3c]">{kpi.value}</span>
              {kpi.forecast && (
                <span className="rounded bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 font-medium">Forecast</span>
              )}
            </div>
            <ChangeBadge value={kpi.change} />
          </Card>
        ))}
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 border-b border-stone-200">
        {(["Data", "Table", "Chart", "General"] as ViewTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveViewTab(tab)}
            className={cn(
              "px-4 py-2 text-xs font-medium transition-colors border-b-2",
              activeViewTab === tab
                ? "border-[#3d3c3c] text-[#3d3c3c]"
                : "border-transparent text-stone-400 hover:text-stone-600"
            )}
          >
            {tab}
          </button>
        ))}
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-7"
            onClick={() => setShowChartSettings(!showChartSettings)}
          >
            <Settings2 className="h-3 w-3" /> Chart settings
          </Button>
        </div>
      </div>

      {/* Chart + Chart Settings Panel */}
      <div className={cn("grid gap-4", showChartSettings ? "grid-cols-1 lg:grid-cols-[1fr_240px]" : "grid-cols-1")}>
        {showChart && (
          <Card className={visualizationCardClass}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Performance trend (sales, ROAS, CAC)</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className={visualizationChartFrameClass}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={WEEKLY_COMMERCIAL_REVIEW.performanceTrend}
                    margin={{ top: 10, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid {...visualizationGrid} vertical={false} />
                    <XAxis dataKey="day" tick={visualizationTick} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="sales" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} tick={visualizationTick} tickLine={false} axisLine={false} hide={!showYAxes} />
                    <YAxis yAxisId="roas" orientation="right" hide domain={[2.5, 4]} />
                    <YAxis yAxisId="cac" orientation="right" hide domain={[22, 34]} />
                    <Tooltip
                      contentStyle={visualizationTooltipStyle}
                      formatter={(value, name) => {
                        const metricName = typeof name === "string" ? name : String(name ?? "");
                        const numericValue = Number(value ?? 0);
                        if (metricName === "roas") return [`${numericValue.toFixed(1)}x`, "ROAS"];
                        if (metricName === "cac") return [`\u00A3${numericValue.toFixed(2)}`, "CAC"];
                        return [
                          formatCommercialCurrency(numericValue),
                          metricName === "grossSalesCurrent" ? "Last week" : metricName === "grossSalesPrevious" ? "Previous week" : "Last year",
                        ];
                      }}
                    />
                    {showLegend && (
                      <Legend
                        wrapperStyle={visualizationLegendStyle}
                        formatter={(value) =>
                          value === "grossSalesCurrent" ? "Last week" : value === "grossSalesPrevious" ? "Previous week" : value === "grossSalesLastYear" ? "Last year" : value === "roas" ? "ROAS" : "CAC"
                        }
                      />
                    )}
                    <Line yAxisId="sales" type="monotone" dataKey="grossSalesCurrent" stroke={visualizationPalette.ink} strokeWidth={2.5} dot={false} />
                    <Line yAxisId="sales" type="monotone" dataKey="grossSalesPrevious" stroke={visualizationPalette.steel} strokeWidth={2} strokeDasharray="4 2" dot={false} />
                    <Line yAxisId="sales" type="monotone" dataKey="grossSalesLastYear" stroke={visualizationPalette.cloud} strokeWidth={2} dot={false} />
                    <Line yAxisId="roas" type="monotone" dataKey="roas" stroke={visualizationPalette.success} strokeWidth={1.8} dot={false} />
                    <Line yAxisId="cac" type="monotone" dataKey="cac" stroke={visualizationPalette.danger} strokeWidth={1.8} strokeDasharray="3 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {showChartSettings && (
          <div className="bg-card border rounded-xl p-4 space-y-4 text-xs h-fit">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Chart settings</h3>
              <button onClick={() => setShowChartSettings(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span>Show chart</span>
                <Switch checked={showChart} onCheckedChange={setShowChart} className="scale-75" />
              </div>
              <div className="flex items-center justify-between">
                <span>Show legend</span>
                <Switch checked={showLegend} onCheckedChange={setShowLegend} className="scale-75" />
              </div>
              <div className="flex items-center justify-between">
                <span>Cumulative</span>
                <Switch checked={cumulative} onCheckedChange={setCumulative} className="scale-75" />
              </div>
            </div>

            <div>
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px] mb-2">Comparison</p>
              <div className="flex gap-1">
                {["line-dash", "bar", "calendar"].map((mode) => (
                  <button key={mode} className="w-7 h-7 border rounded flex items-center justify-center hover:bg-muted">
                    {mode === "bar" ? <BarChart2 className="h-3 w-3" /> : mode === "line-dash" ? <TrendingUp className="h-3 w-3" /> : <span className="text-[9px]">Cal</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px] mb-2">Metrics</p>
              <div className="space-y-2">
                <div className="border rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: visualizationPalette.teal }} />
                      <span className="font-medium text-[11px]">Gross sales - Forecast</span>
                    </div>
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500 cursor-pointer" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <TrendingUp className="h-2.5 w-2.5" /> Group by
                  </div>
                </div>
              </div>
              <button className="mt-2 text-blue-600 text-[10px] hover:underline">+ Add metric</button>
            </div>

            <div>
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px] mb-2">X-axis</p>
              <Select value={xAxisScale} onValueChange={setXAxisScale}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px] mb-2">Y-axis</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px]">Show Y-axes</span>
                  <Switch checked={showYAxes} onCheckedChange={setShowYAxes} className="scale-75" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]">Show Y-axis labels</span>
                  <Switch checked={showYAxisLabels} onCheckedChange={setShowYAxisLabels} className="scale-75" />
                </div>
                <div className="border rounded p-1.5">
                  <p className="text-[10px] text-muted-foreground">Left Y-axis</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: visualizationPalette.teal }} />
                    <span className="text-[10px] font-medium">Gross sales - Forecast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Card className={visualizationCardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">KPI performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[720px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">KPI</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Value</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">WoW</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">YoY</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {WEEKLY_COMMERCIAL_REVIEW.kpis.map((row) => (
                  <tr key={row.label} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{row.label}</td>
                    <td className="text-right py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5">
                        {row.value}
                        {(row.label === "Gross Sales" || row.label === "Profit") && (
                          <span className="rounded bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 font-medium">Forecast</span>
                        )}
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-3">{row.wow}</td>
                    <td className="text-right py-2.5 px-3">{row.yoy}</td>
                    <td className="text-right py-2.5 px-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                          row.status === "strong"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : row.status === "watch"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className={visualizationCardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Flags for discussion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {WEEKLY_COMMERCIAL_REVIEW.discussionFlags.map((flag) => (
            <div
              key={flag}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-700 leading-relaxed"
            >
              {flag}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className={visualizationCardClass}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">Paid channel performance</CardTitle>
            <button
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setSortDir((current) => (current === "desc" ? "asc" : "desc"))}
            >
              Sort by gross sales {sortDir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[860px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Channel</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Spend</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Gross sales</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">WoW sales</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">ROAS</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">CAC</th>
                  <th className="text-right py-2 px-3 font-semibold text-muted-foreground">New customers</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Recommended action</th>
                </tr>
              </thead>
              <tbody>
                {sortedChannels.map((row) => (
                  <tr key={row.channel} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{row.channel}</td>
                    <td className="text-right py-2.5 px-3">{formatCommercialCurrency(row.spend)}</td>
                    <td className="text-right py-2.5 px-3">{formatCommercialCurrency(row.grossSales)}</td>
                    <td className="text-right py-2.5 px-3">
                      <ChangeBadge value={row.wowSales} />
                    </td>
                    <td className="text-right py-2.5 px-3">{row.roas}</td>
                    <td className="text-right py-2.5 px-3">{row.cac}</td>
                    <td className="text-right py-2.5 px-3">{row.newCustomers}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Attribution Model Comparison */}
      <Card className={visualizationCardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Attribution Model Comparison</CardTitle>
          <p className="text-xs text-stone-500">ROAS by channel across Dema MTA, Linear, Last Click, Ad Platform, and MMM models</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2 font-medium">Channel Group</th>
                  <th className="px-4 py-2 font-medium">Channel</th>
                  <th className="px-4 py-2 font-medium">Campaign</th>
                  <th className="px-4 py-2 font-medium text-right">Marketing Spend</th>
                  <th className="px-4 py-2 font-medium text-right">ROAS (Dema MTA)</th>
                  <th className="px-4 py-2 font-medium text-right">ROAS (Linear)</th>
                  <th className="px-4 py-2 font-medium text-right">ROAS (Last Click)</th>
                  <th className="px-4 py-2 font-medium text-right">ROAS (Ad Platform)</th>
                  <th className="px-4 py-2 font-medium text-right">ROAS (MMM)</th>
                </tr>
              </thead>
              <tbody>
                {attributionModelRows.map((row) => (
                  <tr key={row.campaign} className="border-b border-stone-50 hover:bg-stone-50/40">
                    <td className="px-4 py-2.5 text-stone-500">{row.channelGroup}</td>
                    <td className="px-4 py-2.5 font-medium text-[#3d3c3c]">{row.channel}</td>
                    <td className="px-4 py-2.5 text-stone-600">{row.campaign}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{row.marketingSpend.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">{row.roasDemaMTA}</td>
                    <td className="px-4 py-2.5 text-right">{row.roasLinear}</td>
                    <td className="px-4 py-2.5 text-right">{row.roasLastClick}</td>
                    <td className="px-4 py-2.5 text-right">{row.roasAdPlatform}</td>
                    <td className="px-4 py-2.5 text-right">{row.roasMMM}</td>
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
