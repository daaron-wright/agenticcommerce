"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Filter,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  visualizationCardClass,
  visualizationGrid,
  visualizationLegendStyle,
  visualizationPalette,
  visualizationSmallTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";

// ── Mock Data ────────────────────────────────────────────────────────────────

const dateLabels = [
  "15 May", "16 May", "17 May", "18 May", "19 May", "20 May", "21 May",
  "22 May", "23 May", "24 May", "25 May", "26 May", "27 May", "28 May",
  "29 May", "30 May", "31 May", "01 Jun", "02 Jun", "03 Jun", "04 Jun",
  "05 Jun", "06 Jun", "07 Jun", "08 Jun", "09 Jun",
];

const demandOffset = [0, 180, -120, 240, -60, 210, -180, 90, -240, 150, -90, 270, -150, 60, -210, 180, -60, 120, -270, 30, 210, -90, 150, -180, 60, -120];
const accuracyOffset = [0, 2, -1, 3, -1, 2, -2, 1, -3, 2, -1, 3, -2, 1, -3, 2, -1, 1, -3, 1, 2, -2, 2, -2, 1, -1];

const chartData = dateLabels.map((date, i) => ({
  date,
  forecastedDemand: 6800 + Math.sin(i * 0.4) * 1200 + (demandOffset[i] ?? 0),
  forecastAccuracy: 76 + Math.cos(i * 0.3) * 8 + (accuracyOffset[i] ?? 0),
}));

const tableRows = [
  { category: "Dairy", skuGroup: "Milk & Cream", forecastModel: "ML Ensemble", forecast: 4820, actuals: 5040, mape: "4.4%", bias: "+2.1%", accuracy: "95.6%", wasteImpact: "182 units", status: "Strong" },
  { category: "Dairy", skuGroup: "Yogurt & Chilled", forecastModel: "Driver-Based", forecast: 3680, actuals: 3520, mape: "4.5%", bias: "-1.8%", accuracy: "95.5%", wasteImpact: "94 units", status: "Strong" },
  { category: "Bakery", skuGroup: "Bread & Rolls", forecastModel: "ML Ensemble", forecast: 5200, actuals: 4680, mape: "11.1%", bias: "-8.2%", accuracy: "88.9%", wasteImpact: "412 units", status: "Needs Attention" },
  { category: "Bakery", skuGroup: "Pastries & Cakes", forecastModel: "Statistical", forecast: 2100, actuals: 2380, mape: "11.8%", bias: "+6.4%", accuracy: "88.2%", wasteImpact: "186 units", status: "Needs Attention" },
  { category: "Produce", skuGroup: "Salads & Leafy", forecastModel: "Driver-Based", forecast: 6400, actuals: 6280, mape: "1.9%", bias: "-0.8%", accuracy: "98.1%", wasteImpact: "68 units", status: "Strong" },
  { category: "Produce", skuGroup: "Berries & Soft Fruit", forecastModel: "ML Ensemble", forecast: 3800, actuals: 4120, mape: "7.8%", bias: "+4.2%", accuracy: "92.2%", wasteImpact: "148 units", status: "Moderate" },
  { category: "Deli", skuGroup: "Prepared Meals", forecastModel: "Baseline", forecast: 2200, actuals: 2140, mape: "2.8%", bias: "-1.4%", accuracy: "97.2%", wasteImpact: "42 units", status: "Strong" },
  { category: "Deli", skuGroup: "Sandwiches & Wraps", forecastModel: "Driver-Based", forecast: 1800, actuals: 1920, mape: "6.3%", bias: "+3.1%", accuracy: "93.7%", wasteImpact: "86 units", status: "Moderate" },
];

type MetricKey = "forecastedDemand" | "forecastAccuracy";

interface ChartMetric {
  key: MetricKey;
  label: string;
  type: "bar" | "line";
  color: string;
  axis: "left" | "right";
}

const defaultMetrics: ChartMetric[] = [
  { key: "forecastedDemand", label: "Forecasted Demand", type: "bar", color: "#4338ca", axis: "left" },
  { key: "forecastAccuracy", label: "Forecast Accuracy", type: "line", color: "#22d3ee", axis: "right" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "Strong": "text-green-600 bg-green-50",
    "Moderate": "text-amber-600 bg-amber-50",
    "Needs Attention": "text-red-600 bg-red-50",
  };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", colors[status] ?? "text-muted-foreground bg-muted")}>
      {status}
    </span>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-2 text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name === "forecastedDemand" ? "Forecasted Demand" : "Forecast Accuracy"}:</span>
          <span className="font-medium">
            {p.name === "forecastAccuracy"
              ? `${typeof p.value === "number" ? p.value.toFixed(1) : p.value}%`
              : `${typeof p.value === "number" ? p.value.toLocaleString("en", { maximumFractionDigits: 0 }) : p.value} units`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [view, setView] = useState("Starting view");
  const [dateRange, setDateRange] = useState("last-28");
  const [showComparison, setShowComparison] = useState(true);
  const [xAxis, setXAxis] = useState("days");
  const [showChartSettings, setShowChartSettings] = useState(true);
  const [sortCol, setSortCol] = useState<"forecast" | null>("forecast");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const dateRangeLabels: Record<string, string> = {
    "last-28": "Last 28 Days: 14 May – 10 Jun, 2025",
    "last-7": "Last 7 Days: 04 Jun – 10 Jun, 2025",
    "last-90": "Last 90 Days: 11 Mar – 10 Jun, 2025",
  };

  const sorted = [...tableRows].sort((a, b) => {
    if (!sortCol) return 0;
    return sortDir === "desc" ? b.forecast - a.forecast : a.forecast - b.forecast;
  });

  return (
    <div className="space-y-4 min-w-0">
      <RecentFromChat category="reports" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="h-8 text-sm font-semibold border-0 shadow-none pl-0 w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Starting view">Starting view</SelectItem>
            <SelectItem value="Custom view 1">Custom view 1</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 bg-blue-600 text-white text-xs rounded px-3 py-1.5 font-medium">
            {dateRangeLabels[dateRange]}
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="h-8 text-xs w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7">Last 7 Days</SelectItem>
              <SelectItem value="last-28">Last 28 Days</SelectItem>
              <SelectItem value="last-90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
            <span className="text-xs">Show comparison</span>
            <Switch checked={showComparison} onCheckedChange={setShowComparison} />
          </div>

          <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => toast.success("Export started", { description: "CSV will download shortly." })}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="text-xs gap-1.5" onClick={() => toast.success("Report saved", { description: "Added to your workspace." })}>
            <Copy className="h-3.5 w-3.5" /> Save copy
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="text-xs gap-1.5 h-7" onClick={() => setShowFilters(true)}>
          <Filter className="h-3 w-3" /> Filters
        </Button>
      </div>

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Report Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="deli">Deli</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  <SelectItem value="northeast">Northeast</SelectItem>
                  <SelectItem value="southeast">Southeast</SelectItem>
                  <SelectItem value="midwest">Midwest</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select defaultValue="forecast-accuracy">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="forecast-accuracy">Forecast Accuracy</SelectItem>
                  <SelectItem value="waste">Waste %</SelectItem>
                  <SelectItem value="fill-rate">Fill Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => { toast.success("Filters applied"); setShowFilters(false); }}>
              Apply filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Chart + Settings panel */}
      <div className={cn("grid gap-4", showChartSettings ? "grid-cols-1 lg:grid-cols-[1fr_220px]" : "grid-cols-1")}>
        <Card data-tour="reports-chart" className={visualizationCardClass}>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid {...visualizationGrid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={visualizationSmallTick}
                  interval={1}
                  angle={-45}
                  textAnchor="end"
                  height={45}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}K`}
                  tick={visualizationSmallTick}
                  label={{ value: "Forecasted Demand (units)", angle: -90, position: "insideLeft", offset: 15, fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                  tick={visualizationSmallTick}
                  label={{ value: "Forecast Accuracy (%)", angle: 90, position: "insideRight", offset: 10, fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} contentStyle={visualizationTooltipStyle} />
                <Legend
                  wrapperStyle={visualizationLegendStyle}
                  formatter={(value) => value === "forecastedDemand" ? "Forecasted Demand (units)" : "Forecast Accuracy (%)"}
                />
                <Bar yAxisId="left" dataKey="forecastedDemand" fill={visualizationPalette.teal} name="forecastedDemand" maxBarSize={14} opacity={0.85} />
                <Line yAxisId="right" type="monotone" dataKey="forecastAccuracy" stroke={visualizationPalette.ink} strokeWidth={2} dot={false} name="forecastAccuracy" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {showChartSettings && (
          <div className="bg-card border rounded-xl p-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Chart settings</h3>
              <button onClick={() => setShowChartSettings(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px] mb-2">Metrics</p>
              <div className="space-y-2">
                {defaultMetrics.map((m, i) => (
                  <div key={m.key} className="border rounded-lg p-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: m.color }}>{i + 1}</span>
                        <span className="font-medium">{m.label}</span>
                      </div>
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500 cursor-pointer" />
                    </div>
                    <div className="flex gap-1">
                      {["bar", "line", "area", "dot", "num", "delta"].map((t) => (
                        <button key={t} className={cn("w-5 h-5 border rounded flex items-center justify-center text-[8px]", m.type === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>
                          {t === "bar" ? <BarChart2 className="h-2.5 w-2.5" /> : t === "line" ? <TrendingUp className="h-2.5 w-2.5" /> : t.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Grouped by</p>
                      <Select defaultValue="none">
                        <SelectTrigger className="h-6 text-[10px]"><SelectValue placeholder="Select value" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select value</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="skuGroup">SKU Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-2 text-blue-600 text-[10px] hover:underline">+ Add metric</button>
            </div>

            <div>
              <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px] mb-2">X-axis</p>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-muted-foreground uppercase tracking-wide text-[10px]">Y-axes</p>
                <div className="flex items-center gap-1 text-[10px]">
                  <span>Show Y-axes</span>
                  <Switch defaultChecked className="scale-75" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="border rounded p-1.5">
                  <p className="text-[10px] text-muted-foreground">Left Y axis</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-3 h-3 rounded text-[8px] font-bold flex items-center justify-center text-white bg-indigo-700">1</span>
                    <span className="text-[10px] font-medium">Forecasted Demand</span>
                  </div>
                </div>
                <div className="border rounded p-1.5">
                  <p className="text-[10px] text-muted-foreground">Right Y axis</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-3 h-3 rounded text-[8px] font-bold flex items-center justify-center text-white bg-cyan-500">2</span>
                    <span className="text-[10px] font-medium">Forecast Accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data table */}
      <div className="border rounded-xl overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontSize: 11, minWidth: 900 }}>
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Category</th>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">SKU Group</th>
              <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Forecast Model</th>
              <th
                className="text-right py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                onClick={() => { setSortCol("forecast"); setSortDir(sortDir === "desc" ? "asc" : "desc"); }}
              >
                <span className="flex items-center justify-end gap-1">
                  Forecast (units)
                  {sortDir === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </span>
              </th>
              <th className="text-right py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Actuals (units)</th>
              <th className="text-right py-2 px-3 font-semibold text-muted-foreground">MAPE</th>
              <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Bias</th>
              <th className="text-right py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Forecast Accuracy</th>
              <th className="text-right py-2 px-3 font-semibold text-muted-foreground whitespace-nowrap">Waste Impact</th>
              <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-muted/20 transition-colors">
                <td className="py-2 px-3 text-muted-foreground">{row.category}</td>
                <td className="py-2 px-3 font-medium">{row.skuGroup}</td>
                <td className="py-2 px-3">
                  <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border">{row.forecastModel}</span>
                </td>
                <td className="text-right py-2 px-3 font-semibold">{row.forecast.toLocaleString("en-GB")}</td>
                <td className="text-right py-2 px-3">{row.actuals.toLocaleString("en-GB")}</td>
                <td className="text-right py-2 px-3">{row.mape}</td>
                <td className="text-right py-2 px-3">
                  <span className={cn("font-medium", row.bias.startsWith("+") ? "text-amber-600" : "text-green-600")}>{row.bias}</span>
                </td>
                <td className="text-right py-2 px-3 font-semibold">{row.accuracy}</td>
                <td className="text-right py-2 px-3 text-muted-foreground">{row.wasteImpact}</td>
                <td className="text-right py-2 px-3">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
            <tr className="bg-muted/30 font-semibold">
              <td className="py-2 px-3" colSpan={3}>Total</td>
              <td className="text-right py-2 px-3">{sorted.reduce((s, r) => s + r.forecast, 0).toLocaleString("en-GB")}</td>
              <td className="text-right py-2 px-3">{sorted.reduce((s, r) => s + r.actuals, 0).toLocaleString("en-GB")}</td>
              <td className="text-right py-2 px-3">{(sorted.reduce((s, r) => s + parseFloat(r.mape), 0) / sorted.length).toFixed(1)}%</td>
              <td className="text-right py-2 px-3">—</td>
              <td className="text-right py-2 px-3">{(sorted.reduce((s, r) => s + parseFloat(r.accuracy), 0) / sorted.length).toFixed(1)}%</td>
              <td className="text-right py-2 px-3">{sorted.reduce((s, r) => s + parseInt(r.wasteImpact), 0).toLocaleString("en-GB")} units</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
