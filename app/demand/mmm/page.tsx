"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  ComposedChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  X,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart2,
  Target,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { ScenarioBuilderTab } from "./components/scenario-builder";
import {
  visualizationCardClass,
  visualizationGrid,
  visualizationLegendStyle,
  visualizationPalette,
  visualizationSmallTick,
  visualizationTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";
import { SaturationCurveCard } from "@/components/dashboard/charts/saturation-curve-card";
import { ForecastLineCard } from "@/components/dashboard/charts/forecast-line-card";
import {
  saturationChannels,
  profitAnalysisWeeks,
} from "@/lib/dashboard/mock-mmm-saturation";

// ── Mock Data ────────────────────────────────────────────────────────────────

const drivers = [
  "Weather (Temp)",
  "Promotions",
  "Day-of-Week",
  "Seasonality",
  "Local Events",
  "Social Trends",
  "Price Sensitivity",
  "Competitor Activity",
  "Holiday Calendar",
  "School Schedule",
  "Baseline",
];

const driverColors: Record<string, string> = {
  "Weather (Temp)": "#1e293b",
  "Promotions": "#334155",
  "Day-of-Week": "#475569",
  "Seasonality": "#64748b",
  "Local Events": "#94a3b8",
  "Social Trends": "#cbd5e1",
  "Price Sensitivity": "#e2e8f0",
  "Competitor Activity": "#0f172a",
  "Holiday Calendar": "#1e293b",
  "School Schedule": "#334155",
  "Baseline": "#475569",
};

const driverData = [
  { name: "Weather (Temp)", currentImpact: "15.2%", mlImpact: "18.4%", demandVariance: "±2,400", predictedDemand: 12800, featureImportance: "94.2%", forecastLift: "+16%", status: "captured" },
  { name: "Promotions", currentImpact: "22.8%", mlImpact: "28.1%", demandVariance: "±4,200", predictedDemand: 18500, featureImportance: "91.8%", forecastLift: "+22%", status: "partial" },
  { name: "Day-of-Week", currentImpact: "12.4%", mlImpact: "14.6%", demandVariance: "±1,800", predictedDemand: 10200, featureImportance: "88.5%", forecastLift: "+12%", status: "captured" },
  { name: "Seasonality", currentImpact: "8.6%", mlImpact: "9.2%", demandVariance: "±1,200", predictedDemand: 8400, featureImportance: "82.1%", forecastLift: "+8%", status: "captured" },
  { name: "Local Events", currentImpact: "0%", mlImpact: "11.4%", demandVariance: "±2,100", predictedDemand: 7600, featureImportance: "78.6%", forecastLift: "+14%", status: "not captured" },
  { name: "Social Trends", currentImpact: "0%", mlImpact: "8.2%", demandVariance: "±1,500", predictedDemand: 5200, featureImportance: "72.4%", forecastLift: "+10%", status: "not captured" },
  { name: "Price Sensitivity", currentImpact: "4.8%", mlImpact: "7.6%", demandVariance: "±900", predictedDemand: 6100, featureImportance: "68.9%", forecastLift: "+6%", status: "partial" },
  { name: "Competitor Activity", currentImpact: "0%", mlImpact: "5.1%", demandVariance: "±600", predictedDemand: 4800, featureImportance: "62.3%", forecastLift: "+4%", status: "not captured" },
  { name: "Holiday Calendar", currentImpact: "3.2%", mlImpact: "4.8%", demandVariance: "±800", predictedDemand: 4200, featureImportance: "58.7%", forecastLift: "+5%", status: "partial" },
  { name: "School Schedule", currentImpact: "0%", mlImpact: "3.2%", demandVariance: "±400", predictedDemand: 3600, featureImportance: "52.1%", forecastLift: "+3%", status: "not captured" },
  { name: "Baseline", currentImpact: "26.8%", mlImpact: "26.8%", demandVariance: "—", predictedDemand: 42000, featureImportance: "—", forecastLift: "—", status: "captured" },
];

const demandResponseData = Array.from({ length: 51 }, (_, i) => {
  const depth = i;
  return {
    depth,
    currentModel: Math.max(0, 800 * Math.log(depth + 1) * Math.exp(-depth / 40)),
    mlEnhanced: Math.max(0, 1200 * Math.log(depth + 1) * Math.exp(-depth / 45)),
    saturation: Math.max(0, 1400 * Math.log(depth + 1) * Math.exp(-depth / 50)),
  };
});

const weeklyForecastData = [
  { month: "June", actual: 42000, forecast: 38500 },
  { month: "July", actual: 48000, forecast: 46200 },
  { month: "August", actual: 52000, forecast: 49800 },
  { month: "September", actual: 44000, forecast: 43100 },
  { month: "October", actual: 38000, forecast: 37200 },
  { month: "November", actual: 35000, forecast: 36800 },
  { month: "December", actual: 58000, forecast: 54200 },
  { month: "January", actual: 32000, forecast: 33400 },
  { month: "February", actual: 34000, forecast: 33800 },
  { month: "March", actual: 36000, forecast: 35600 },
  { month: "April", actual: 40000, forecast: 39200 },
  { month: "May", actual: 44000, forecast: 42800 },
  { month: "Jun '25", actual: 46000, forecast: 44600 },
];

const driverImpactData = [
  { driver: "Weather", currentImpact: 15.2, mlImpact: 18.4 },
  { driver: "Promos", currentImpact: 22.8, mlImpact: 28.1 },
  { driver: "Day-of-Wk", currentImpact: 12.4, mlImpact: 14.6 },
  { driver: "Season", currentImpact: 8.6, mlImpact: 9.2 },
  { driver: "Events", currentImpact: 0, mlImpact: 11.4 },
  { driver: "Social", currentImpact: 0, mlImpact: 8.2 },
  { driver: "Price", currentImpact: 4.8, mlImpact: 7.6 },
  { driver: "Competitor", currentImpact: 0, mlImpact: 5.1 },
  { driver: "Holiday", currentImpact: 3.2, mlImpact: 4.8 },
  { driver: "School", currentImpact: 0, mlImpact: 3.2 },
  { driver: "Baseline", currentImpact: 26.8, mlImpact: 26.8 },
];

const weeklyDemandTable = [
  { week: "09 Jun – 15 Jun, 2025", forecast: 6820, actuals: 7140, variance: "+4.7%", waste: 284, wasteRate: "4.0%", fillRate: "96.2%" },
  { week: "02 Jun – 08 Jun, 2025", forecast: 6540, actuals: 6380, variance: "-2.4%", waste: 312, wasteRate: "4.9%", fillRate: "94.8%" },
  { week: "26 May – 01 Jun, 2025", forecast: 6200, actuals: 6480, variance: "+4.5%", waste: 268, wasteRate: "4.1%", fillRate: "95.6%" },
];

const regionData = [
  { region: "Urban High-Traffic", accuracy: "71%", accuracyDir: "down", volatility: "High", volatilityDir: "up" },
  { region: "Suburban Standard", accuracy: "79%", accuracyDir: "up", volatility: "Medium", volatilityDir: "down" },
  { region: "Rural Low-Volume", accuracy: "84%", accuracyDir: "up", volatility: "Low", volatilityDir: "down" },
  { region: "University Towns", accuracy: "69%", accuracyDir: "down", volatility: "High", volatilityDir: "up" },
];

// ── Waterfall chart data ─────────────────────────────────────────────────────
const waterfallData = [
  { name: "Outlook LY", value: 1420000, total: 1420000, type: "base" },
  { name: "Planned Growth", value: 180000, total: 1600000, type: "positive" },
  { name: "Target", value: -24000, total: 1756471, type: "target" },
  { name: "LE Growth", value: -72000, total: 1528000, type: "negative" },
  { name: "Demand Outlook", value: 156000, total: 1684062, type: "result" },
  { name: "Total Opportunity", value: 92000, total: 1776062, type: "positive" },
  { name: "Total Risk", value: -48000, total: 1728062, type: "negative" },
  { name: "Outlook w/ R&O", value: 44000, total: 1772062, type: "positive" },
];

// ── Breakdown table data ─────────────────────────────────────────────────────
const breakdownData = [
  { category: "Dairy & Chilled", forecast2025: 803559, target2025: 808011, gap: -4452, gapPct: "-1%", forecast2023: 803559, target2023: 880503, gapPrior: -8.85, included: true },
  { category: "Fresh Produce", forecast2025: 612340, target2025: 645200, gap: -32860, gapPct: "-5%", forecast2023: 598200, target2023: 632100, gapPrior: -5.36, included: true },
  { category: "Bakery & Pastries", forecast2025: 384200, target2025: 392800, gap: -8600, gapPct: "-2%", forecast2023: 372100, target2023: 388400, gapPrior: -4.20, included: true },
  { category: "Deli & Prepared", forecast2025: 246800, target2025: 258400, gap: -11600, gapPct: "-4%", forecast2023: 238900, target2023: 252300, gapPrior: -5.31, included: false },
  { category: "Beverages", forecast2025: 198400, target2025: 204600, gap: -6200, gapPct: "-3%", forecast2023: 192400, target2023: 198800, gapPrior: -3.22, included: false },
];

// ── Scenario projection data ─────────────────────────────────────────────────
const scenarioChartData = [
  { week: "W24", baseline: 62000, optimistic: 62000, conservative: 62000 },
  { week: "W25", baseline: 58000, optimistic: 60000, conservative: 57000 },
  { week: "W26", baseline: 64000, optimistic: 68000, conservative: 62000 },
  { week: "W27", baseline: 66000, optimistic: 72000, conservative: 63000 },
  { week: "W28", baseline: 68000, optimistic: 78000, conservative: 65000 },
  { week: "W29", baseline: 65000, optimistic: 74000, conservative: 63000 },
  { week: "W30", baseline: 67000, optimistic: 76000, conservative: 64000 },
  { week: "W31", baseline: 70000, optimistic: 82000, conservative: 66000 },
  { week: "W32", baseline: 72000, optimistic: 86000, conservative: 68000 },
  { week: "W33", baseline: 74000, optimistic: 88000, conservative: 70000 },
];

// ── Helper Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "captured") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
        Captured <TrendingUp className="h-2.5 w-2.5" />
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
        Partial <Info className="h-2.5 w-2.5" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
      Not Captured <TrendingDown className="h-2.5 w-2.5" />
    </span>
  );
}

// ── o9-Style KPI Header ──────────────────────────────────────────────────────

function KPIHeader() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Demand Outlook */}
      <Card className="p-4 border-l-4 border-l-stone-800">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Demand Outlook</p>
        <p className="text-2xl font-bold tracking-tight">1,684,062</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">vs LY Gap %</span>
          <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
            170% <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </Card>

      {/* Target */}
      <Card className="p-4 border-l-4 border-l-amber-500">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Target</p>
        <p className="text-2xl font-bold tracking-tight">1,756,471</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">vs Target Gap %</span>
          <span className="text-xs font-bold text-red-600 flex items-center gap-0.5">
            -4.1% <ArrowDownRight className="h-3 w-3" />
          </span>
        </div>
      </Card>

      {/* Forecast Accuracy */}
      <Card className="p-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Forecast Accuracy</p>
        <p className="text-2xl font-bold tracking-tight">76%</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">vs prior</span>
          <span className="text-xs font-medium text-red-600 flex items-center gap-0.5">
            -2.1% <ArrowDownRight className="h-3 w-3" />
          </span>
        </div>
      </Card>

      {/* Waste / Fill */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Waste Rate</p>
            <p className="text-lg font-bold">8.2%</p>
            <span className="text-[10px] text-amber-600 font-medium">+0.4%</span>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">Fill Rate</p>
            <p className="text-lg font-bold">91%</p>
            <span className="text-[10px] text-red-600 font-medium">-1.2%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Time Period Toggles ──────────────────────────────────────────────────────

function TimePeriodToggles({ selected, onChange }: { selected: string; onChange: (v: string) => void }) {
  return (
    <div className="flex border rounded overflow-hidden text-[10px]">
      {["Y", "YTD", "Q", "M"].map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "px-2.5 py-1 font-semibold transition-colors",
            selected === p ? "bg-stone-800 text-white" : "text-muted-foreground hover:bg-muted"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ── Waterfall Chart ──────────────────────────────────────────────────────────

function WaterfallChart() {
  const chartData = waterfallData.map((item) => ({
    name: item.name,
    value: Math.abs(item.value),
    fill: item.type === "negative" ? "#ef4444" : item.type === "target" ? "#f59e0b" : item.type === "result" ? "#0f172a" : "#64748b",
    total: item.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 35, left: 10 }}>
        <CartesianGrid {...visualizationGrid} vertical={false} />
        <XAxis dataKey="name" tick={visualizationSmallTick} interval={0} angle={-20} textAnchor="end" height={50} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={visualizationSmallTick} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value: unknown) => [`${typeof value === "number" ? (value / 1000).toFixed(0) : value}K units`, ""]}
          contentStyle={visualizationTooltipStyle}
        />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={40}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Bridge Chart ─────────────────────────────────────────────────────────────

function BridgeChart() {
  const data = [
    { name: "Outlook LY", value: 1420, cumulative: 1420 },
    { name: "+Planned Growth", value: 180, cumulative: 1600 },
    { name: "+LE Growth", value: 84, cumulative: 1684 },
    { name: "Demand Outlook", value: 1684, cumulative: 1684 },
    { name: "-Gap to Target", value: -72, cumulative: 1756 },
    { name: "Target", value: 1756, cumulative: 1756 },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 35, left: 10 }}>
        <CartesianGrid {...visualizationGrid} vertical={false} />
        <XAxis dataKey="name" tick={visualizationSmallTick} interval={0} angle={-20} textAnchor="end" height={50} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `${v}K`} tick={visualizationSmallTick} domain={[1200, 1900]} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v: unknown) => [`${v}K units`, ""]} contentStyle={visualizationTooltipStyle} />
        <Bar dataKey="cumulative" radius={[3, 3, 0, 0]} maxBarSize={40}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.value < 0 ? "#ef4444" : i === 3 ? "#0f172a" : i === 5 ? "#f59e0b" : "#64748b"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Outlook Chart ────────────────────────────────────────────────────────────

function OutlookChart() {
  const data = weeklyForecastData.map((d) => ({ ...d, gap: d.actual - d.forecast }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 40 }}>
        <CartesianGrid {...visualizationGrid} vertical={false} />
        <XAxis dataKey="month" tick={visualizationTick} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={visualizationTick} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value, name) => {
            const metricName = typeof name === "string" ? name : String(name ?? "");
            return [
              `${Number(value ?? 0).toLocaleString("en-GB")} units`,
              metricName === "actual" ? "Actual Demand" : metricName === "forecast" ? "Forecast" : "Gap",
            ];
          }}
          contentStyle={visualizationTooltipStyle}
        />
        <Legend formatter={(v) => v === "actual" ? "Actual Demand" : v === "forecast" ? "Forecast" : "Gap"} wrapperStyle={visualizationLegendStyle} />
        <Bar dataKey="actual" fill={visualizationPalette.mist} maxBarSize={16} radius={[2, 2, 0, 0]} name="actual" />
        <Line type="monotone" dataKey="forecast" stroke={visualizationPalette.teal} strokeWidth={2} dot={false} name="forecast" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ── Gap Chart ────────────────────────────────────────────────────────────────

function GapChart() {
  const data = weeklyForecastData.map((d) => ({
    month: d.month,
    gap: d.actual - d.forecast,
    gapPct: ((d.actual - d.forecast) / d.forecast * 100).toFixed(1),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 40 }}>
        <CartesianGrid {...visualizationGrid} vertical={false} />
        <XAxis dataKey="month" tick={visualizationTick} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={visualizationTick} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value: unknown) => [`${typeof value === "number" ? value.toLocaleString("en-GB") : value} units`, "Gap"]}
          contentStyle={visualizationTooltipStyle}
        />
        <ReferenceLine y={0} stroke={visualizationPalette.mist} />
        <Bar dataKey="gap" maxBarSize={16} radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.gap >= 0 ? "#22c55e" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Breakdown Table ──────────────────────────────────────────────────────────

function BreakdownTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ fontSize: 11 }}>
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left py-2 px-2 font-semibold text-muted-foreground" rowSpan={2}>Category</th>
            <th className="text-center py-1 px-2 font-semibold text-muted-foreground border-b" colSpan={4}>YTD-25</th>
            <th className="text-center py-1 px-2 font-semibold text-muted-foreground border-b" colSpan={3}>YTD-23</th>
          </tr>
          <tr className="border-b bg-muted/20">
            <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Sales/Forecast</th>
            <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Target</th>
            <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Outlook vs Target</th>
            <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Gap %</th>
            <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Sales/Forecast</th>
            <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Target</th>
            <th className="text-right py-1.5 px-2 font-semibold text-muted-foreground">Gap %</th>
          </tr>
        </thead>
        <tbody>
          {breakdownData.map((row) => (
            <tr key={row.category} className="border-b hover:bg-muted/30 transition-colors">
              <td className="py-2 px-2 font-medium">{row.category}</td>
              <td className="text-right py-2 px-2">{row.forecast2025.toLocaleString()}</td>
              <td className="text-right py-2 px-2">{row.target2025.toLocaleString()}</td>
              <td className="text-right py-2 px-2">
                <span className={cn("font-medium", row.gap >= 0 ? "text-green-600" : "text-red-600")}>
                  {row.gap.toLocaleString()}
                </span>
              </td>
              <td className="text-right py-2 px-2">
                <span className={cn("font-semibold px-1.5 py-0.5 rounded", row.gapPct.startsWith("-") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700")}>
                  {row.gapPct}
                </span>
              </td>
              <td className="text-right py-2 px-2">{row.forecast2023.toLocaleString()}</td>
              <td className="text-right py-2 px-2">{row.target2023.toLocaleString()}</td>
              <td className="text-right py-2 px-2">
                <span className="font-medium text-red-600">{row.gapPrior.toFixed(2)}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Demand Response Panel ────────────────────────────────────────────────────

function DemandResponsePanel({ isOverview, selectedDriver, onDriverChange }: {
  isOverview: boolean;
  selectedDriver: string;
  onDriverChange: (d: string) => void;
}) {
  const [showPerDay, setShowPerDay] = useState(true);

  const insightText = isOverview
    ? { accuracy: "76%", improvement: "+16%" }
    : { accuracy: "82%", improvement: "+22%" };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onDriverChange("__all__")}
          className={cn("px-3 py-1.5 text-xs rounded-md border transition-colors", isOverview ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted")}
        >
          Overview
        </button>
        <button
          onClick={() => onDriverChange(selectedDriver === "__all__" ? "Weather (Temp)" : selectedDriver)}
          className={cn("px-3 py-1.5 text-xs rounded-md border transition-colors", !isOverview ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted")}
        >
          Driver Breakdown
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_160px] gap-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Improve your forecast</h4>
          {isOverview ? (
            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                Current forecast accuracy across <strong>all perishable categories</strong> is{" "}
                <span className="text-stone-800 font-bold">{insightText.accuracy}</span>.
              </p>
              <p>
                By integrating uncaptured demand drivers (local events, social trends, competitor activity), accuracy is projected to improve by{" "}
                <span className="text-stone-800 font-bold">{insightText.improvement}</span>.
              </p>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
              <p>
                The demand driver <strong>{selectedDriver}</strong> currently contributes{" "}
                <span className="text-stone-800 font-bold">{insightText.accuracy}</span> to forecast accuracy.
              </p>
              <p>
                ML modeling shows this driver can improve forecast lift by{" "}
                <span className="text-stone-800 font-bold">{insightText.improvement}</span> when fully captured.
              </p>
              <p>
                Adding real-time signal ingestion for this driver would reduce demand variance by an estimated 18%.
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            {!isOverview && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Driver:</span>
                <Select value={selectedDriver} onValueChange={onDriverChange}>
                  <SelectTrigger className="h-7 text-xs w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.filter(d => d !== "Baseline").map((d) => (
                      <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">Show per-store values</span>
              <Switch checked={showPerDay} onCheckedChange={setShowPerDay} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={demandResponseData} margin={{ top: 5, right: 10, bottom: 25, left: 30 }}>
              <CartesianGrid {...visualizationGrid} vertical={false} />
              <XAxis dataKey="depth" tickFormatter={(v) => `${v}%`} label={{ value: "Promotional Depth (%)", position: "insideBottom", offset: -12, fontSize: 9 }} tick={visualizationSmallTick} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => v === 0 ? "0" : `${(v / 1).toFixed(0)}`} label={{ value: "Demand Lift (units)", angle: -90, position: "insideLeft", offset: 15, fontSize: 9 }} tick={visualizationSmallTick} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value, name) => {
                  const metricName = typeof name === "string" ? name : String(name ?? "");
                  return [
                    `${Number(value ?? 0).toFixed(0)} units`,
                    metricName === "mlEnhanced" ? "ML-Enhanced" : metricName === "saturation" ? "Saturation Point" : "Current Model",
                  ];
                }}
                labelFormatter={(label) => `Promotional Depth: ${Number(label)}%`}
                contentStyle={visualizationTooltipStyle}
              />
              <Line type="monotone" dataKey="currentModel" stroke={visualizationPalette.cloud} strokeWidth={2} dot={false} name="currentModel" />
              <Line type="monotone" dataKey="mlEnhanced" stroke={visualizationPalette.ink} strokeWidth={2} dot={false} name="mlEnhanced" />
              <Line type="monotone" dataKey="saturation" stroke={visualizationPalette.steel} strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="saturation" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-1.5 justify-center">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Demand Drivers</p>
          {drivers.map((d) => (
            <div key={d} className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded flex-shrink-0" style={{ backgroundColor: driverColors[d], display: "inline-block" }} />
              <span className="text-[10px] text-muted-foreground truncate">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Driver Table ──────────────────────────────────────────────────────────────

function DriverTable() {
  const [selectedDriver, setSelectedDriver] = useState("__all__");
  const isOverview = selectedDriver === "__all__";

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontSize: 11 }}>
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-2 px-2 font-semibold text-muted-foreground w-36 sticky left-0 bg-background">Driver</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">Current Impact (%)</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">ML-Modeled Impact (%)</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">Demand Variance</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">Predicted Demand</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Feature Importance</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Forecast Lift</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {driverData.map((row) => (
              <tr key={row.name} className="border-b hover:bg-muted/30 transition-colors">
                <td className="py-2 px-2 font-medium sticky left-0 bg-background">{row.name}</td>
                <td className="text-right py-2 px-2">{row.currentImpact}</td>
                <td className="text-right py-2 px-2 font-semibold">{row.mlImpact}</td>
                <td className="text-right py-2 px-2">{row.demandVariance}</td>
                <td className="text-right py-2 px-2">{row.predictedDemand.toLocaleString("en-GB")} units</td>
                <td className="text-right py-2 px-2">{row.featureImportance}</td>
                <td className="text-right py-2 px-2">
                  <span className={cn("font-medium", row.forecastLift.startsWith("+") ? "text-green-600" : "text-muted-foreground")}>{row.forecastLift}</span>
                </td>
                <td className="text-right py-2 px-2">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="py-2 px-2 sticky left-0 bg-background">Total</td>
              <td className="text-right py-2 px-2">93.8%</td>
              <td className="text-right py-2 px-2">137.4%</td>
              <td className="text-right py-2 px-2">—</td>
              <td className="text-right py-2 px-2">123,400 units</td>
              <td className="text-right py-2 px-2">—</td>
              <td className="text-right py-2 px-2">—</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <DemandResponsePanel
        isOverview={isOverview}
        selectedDriver={selectedDriver === "__all__" ? "Weather (Temp)" : selectedDriver}
        onDriverChange={setSelectedDriver}
      />
    </div>
  );
}

// ── Demand Overview Tab (o9-style with sub-tabs) ─────────────────────────────

type ChartSubTab = "waterfall" | "bridge" | "outlook" | "gap";

function DemandOverviewTab() {
  const [chartSubTab, setChartSubTab] = useState<ChartSubTab>("waterfall");
  const [timePeriod, setTimePeriod] = useState("YTD");
  const [breakdownTab, setBreakdownTab] = useState<"breakdown" | "bucketized" | "assumptions">("breakdown");

  return (
    <div className="space-y-4">
      {/* Chart area with sub-tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex border rounded-lg overflow-hidden text-xs">
            {(["waterfall", "bridge", "outlook", "gap"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setChartSubTab(tab)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors capitalize",
                  chartSubTab === tab ? "bg-stone-800 text-white" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab === "gap" ? "Gap%" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <TimePeriodToggles selected={timePeriod} onChange={setTimePeriod} />
        </div>

        <Card>
          <CardContent className="pt-4">
            {chartSubTab === "waterfall" && <WaterfallChart />}
            {chartSubTab === "bridge" && <BridgeChart />}
            {chartSubTab === "outlook" && <OutlookChart />}
            {chartSubTab === "gap" && <GapChart />}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-stone-600" /> Outlook
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" /> Target
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> Negative
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-stone-900" /> Result
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown table area */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex border-b">
              {(["breakdown", "bucketized", "assumptions"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBreakdownTab(tab)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors capitalize border-b-2",
                    breakdownTab === tab
                      ? "border-stone-800 text-stone-800"
                      : "border-transparent text-muted-foreground hover:text-stone-600"
                  )}
                >
                  {tab === "bucketized" ? "Bucketized Breakdown" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-muted-foreground">Measures:</span>
              <div className="flex border rounded overflow-hidden">
                {["TG", "LY", "LC"].map((m) => (
                  <button key={m} className={cn("px-2 py-0.5 font-semibold transition-colors", m === "TG" ? "bg-stone-800 text-white" : "text-muted-foreground hover:bg-muted")}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <BreakdownTable />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Scenario Planning Tab (unified) ──────────────────────────────────────────

function ScenarioPlanningTab() {
  const [targetMode, setTargetMode] = useState<"accuracy" | "fill-rate" | "waste-rate">("accuracy");
  const [targetValue, setTargetValue] = useState("85");
  const [activeScenario, setActiveScenario] = useState<"baseline" | "optimistic" | "conservative">("optimistic");
  const [scenarioSubTab, setScenarioSubTab] = useState<"projection" | "waterfall" | "breakdown">("projection");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
      {/* Left panel — scenario controls */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Target Metric</p>
          <div className="flex flex-col border rounded-lg overflow-hidden text-xs">
            {(["accuracy", "fill-rate", "waste-rate"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTargetMode(mode)}
                className={cn("py-2 px-3 font-medium transition-colors capitalize text-left", targetMode === mode ? "bg-stone-800 text-white" : "hover:bg-muted")}
              >
                {mode.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Target value</p>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Scenario</p>
          <div className="space-y-1.5">
            {(["baseline", "optimistic", "conservative"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveScenario(s)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors capitalize border",
                  activeScenario === s
                    ? "bg-stone-800 text-white border-stone-800"
                    : "border-border hover:bg-muted"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button size="sm" className="w-full text-xs bg-stone-800 hover:bg-stone-700">
          <Zap className="h-3.5 w-3.5 mr-1.5" /> Run Scenario
        </Button>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="bg-stone-800 text-white rounded p-1">
              <Zap className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold text-stone-800">Agent Insight</span>
          </div>
          <p className="text-[10px] text-stone-700 leading-relaxed">
            Integrating weather signals + local events for dairy is projected to yield <strong>+22% forecast accuracy</strong> over 4 weeks, reducing waste by an estimated 320 units/day.
          </p>
        </div>
      </div>

      {/* Right panel — charts and data */}
      <div className="space-y-4 min-w-0">
        {/* Sub-tabs for scenario views */}
        <div className="flex items-center justify-between">
          <div className="flex border rounded-lg overflow-hidden text-xs">
            {(["projection", "waterfall", "breakdown"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setScenarioSubTab(tab)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors capitalize",
                  scenarioSubTab === tab ? "bg-stone-800 text-white" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <TimePeriodToggles selected="Q" onChange={() => {}} />
        </div>

        <Card>
          <CardContent className="pt-4">
            {scenarioSubTab === "projection" && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Scenario Projection — {activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1)}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={scenarioChartData} margin={{ top: 10, right: 20, bottom: 10, left: 40 }}>
                    <CartesianGrid {...visualizationGrid} vertical={false} />
                    <XAxis dataKey="week" tick={visualizationTick} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={visualizationTick} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value, name) => {
                        const metricName = typeof name === "string" ? name : String(name ?? "");
                        return [`${(Number(value ?? 0) / 1000).toFixed(0)}K units`, metricName.charAt(0).toUpperCase() + metricName.slice(1)];
                      }}
                      contentStyle={visualizationTooltipStyle}
                    />
                    <Legend wrapperStyle={visualizationLegendStyle} />
                    <Area type="monotone" dataKey="optimistic" fill="rgba(15, 23, 42, 0.08)" stroke="none" name="optimistic" />
                    <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4" dot={false} name="baseline" />
                    <Line type="monotone" dataKey="optimistic" stroke="#0f172a" strokeWidth={2.5} dot={false} name="optimistic" />
                    <Line type="monotone" dataKey="conservative" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="conservative" />
                    <ReferenceLine x="W28" stroke="#64748b" strokeDasharray="4 4" label={{ value: "Now", position: "top", fill: "#64748b", fontSize: 10 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
            {scenarioSubTab === "waterfall" && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Scenario Waterfall — Driver Contributions</h3>
                <WaterfallChart />
              </div>
            )}
            {scenarioSubTab === "breakdown" && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Scenario Breakdown — Category-Level</h3>
                <BreakdownTable />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Impact comparison */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-3">Driver Impact: Current vs ML-Modeled</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={driverImpactData} margin={{ top: 5, right: 10, bottom: 35, left: 10 }}>
                <CartesianGrid {...visualizationGrid} vertical={false} />
                <XAxis dataKey="driver" tick={visualizationSmallTick} interval={0} height={50} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={visualizationSmallTick} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={visualizationTooltipStyle}
                  formatter={(value, name) => {
                    const metricName = typeof name === "string" ? name : String(name ?? "");
                    return [
                      `${Number(value ?? 0).toFixed(1)}%`,
                      metricName === "currentImpact" ? "Current Impact" : "ML-Modeled Impact",
                    ];
                  }}
                />
                <Legend formatter={(v) => v === "currentImpact" ? "Current Impact" : "ML-Modeled Impact"} wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={0} stroke="#666" />
                <Bar dataKey="currentImpact" fill="#0f172a" name="currentImpact" maxBarSize={14} />
                <Bar dataKey="mlImpact" fill="#94a3b8" name="mlImpact" maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Market Overview Panel ─────────────────────────────────────────────────────

function MarketOverviewPanel() {
  return (
    <div className="space-y-6">
      <KPIHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Forecast Accuracy Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { label: "Current Accuracy", value: 76 },
                  { label: "Improvement Potential", value: 16 },
                  { label: "Target Accuracy", value: 92 },
                ]}
                margin={{ top: 10, right: 20, bottom: 10, left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: unknown) => [`${typeof value === "number" ? value : value}%`, ""]}
                  contentStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="value" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">+16% accuracy achievable</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Store Cluster Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold text-muted-foreground">Cluster</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Forecast Accuracy</th>
                  <th className="text-right py-2 font-semibold text-muted-foreground">Demand Volatility</th>
                </tr>
              </thead>
              <tbody>
                {regionData.map((r) => (
                  <tr key={r.region} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium">{r.region}</td>
                    <td className="text-right py-2.5">
                      <span className={cn("font-medium", r.accuracyDir === "up" ? "text-green-600" : "text-amber-600")}>
                        {r.accuracy} {r.accuracyDir === "up" ? "↑" : "↓"}
                      </span>
                    </td>
                    <td className="text-right py-2.5">
                      <span className={cn("font-medium", r.volatilityDir === "down" ? "text-green-600" : "text-amber-600")}>
                        {r.volatility} {r.volatilityDir === "up" ? "↑" : "↓"}
                      </span>
                    </td>
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

// ── Main Page ────────────────────────────────────────────────────────────────

function ProfitAnalysisTab() {
  const profitTrendData = [
    { label: "June", actual: 320000, forecast: 340000 },
    { label: "July", actual: 350000, forecast: 360000 },
    { label: "August", actual: 380000, forecast: 395000 },
    { label: "September", actual: 400000, forecast: 410000 },
    { label: "October", actual: 420000, forecast: 440000 },
    { label: "November", actual: 480000, forecast: 460000 },
    { label: "December", actual: 520000, forecast: 500000 },
    { label: "January", actual: 380000, forecast: 390000 },
    { label: "February", actual: 360000, forecast: 370000 },
    { label: "March", actual: 350000, forecast: 360000 },
    { label: "April", actual: 340000, forecast: 355000 },
    { label: "May", actual: 330000, forecast: null },
    { label: "June", actual: null, forecast: 345000 },
  ];

  return (
    <div className="space-y-6">
      <ForecastLineCard
        title="Profit Analysis — Actual vs Potential"
        subtitle="Missed potential shown as gap between actual and forecast"
        data={profitTrendData}
        yLabel="Net gross profit (USD)"
      />

      <Card className={visualizationCardClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Profit Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2 font-medium">Week</th>
                  <th className="px-4 py-2 font-medium text-right">Spend (USD)</th>
                  <th className="px-4 py-2 font-medium text-right">Proposed spend</th>
                  <th className="px-4 py-2 font-medium text-right">Sales (USD)</th>
                  <th className="px-4 py-2 font-medium text-right">Missed sales</th>
                  <th className="px-4 py-2 font-medium text-right">Profit (USD)</th>
                  <th className="px-4 py-2 font-medium text-right">Missed profit</th>
                </tr>
              </thead>
              <tbody>
                {profitAnalysisWeeks.map((row) => (
                  <tr key={row.week} className="border-b border-stone-50 hover:bg-stone-50/40">
                    <td className="px-4 py-2.5 font-medium text-[#3d3c3c]">{row.week}</td>
                    <td className="px-4 py-2.5 text-right">{row.spend.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      {row.proposedSpend.toLocaleString()}
                      <span className={cn(
                        "ml-1 text-[10px] font-medium",
                        row.proposedChange.startsWith("+") ? "text-emerald-600" : "text-rose-500"
                      )}>({row.proposedChange})</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">{row.sales.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">{row.missedSales.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">{row.profit.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-flex rounded-full bg-rose-50 text-rose-600 px-2 py-0.5 text-[10px] font-medium">
                        {row.missedProfit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-sm font-semibold text-[#3d3c3c]">Channel Saturation Curves</h3>
      <div className="grid gap-4 xl:grid-cols-2">
        {saturationChannels.map((ch) => (
          <SaturationCurveCard key={ch.channel} channel={ch} />
        ))}
      </div>
    </div>
  );
}

type PrimaryTab = "overview" | "drivers" | "scenarios" | "profit";

export default function MMMPage() {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("overview");
  const [cluster, setCluster] = useState("Urban High-Traffic");
  const [period, setPeriod] = useState("last-week");
  const [showBanner, setShowBanner] = useState(true);

  const isClusterOverview = cluster === "Select cluster";

  const periodLabel: Record<string, string> = {
    "last-week": "Last Week  02 Jun – 08 Jun, 2025",
    "this-week": "This Week  09 Jun – 15 Jun, 2025",
    "last-month": "Last Month  May 2025",
  };

  return (
    <div className="space-y-4 min-w-0">
      {/* Page header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">Demand Planning</h1>
          <span className="text-muted-foreground text-xl">/</span>
          <Select value={cluster} onValueChange={setCluster}>
            <SelectTrigger className="h-8 text-base font-semibold border-0 shadow-none pl-0 w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Select cluster">All Clusters</SelectItem>
              <SelectItem value="Urban High-Traffic">Urban High-Traffic</SelectItem>
              <SelectItem value="Suburban Standard">Suburban Standard</SelectItem>
              <SelectItem value="Rural Low-Volume">Rural Low-Volume</SelectItem>
              <SelectItem value="University Towns">University Towns</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-stone-800 text-white text-xs rounded px-3 py-1.5 font-medium">
            <Calendar className="h-3 w-3" />
            {periodLabel[period]}
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 text-xs w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="text-xs h-8 gap-1.5 bg-stone-800 hover:bg-stone-700">
            <Zap className="h-3.5 w-3.5" /> New Forecast Report
          </Button>
        </div>
      </div>

      {/* Primary tabs — o9-style planning navigation */}
      <div className="border-b">
        <div className="flex gap-0">
          {([
            { id: "overview" as const, label: "Demand Overview" },
            { id: "drivers" as const, label: "Driver Analysis" },
            { id: "profit" as const, label: "Profit & Saturation" },
            { id: "scenarios" as const, label: "Scenario Planning" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPrimaryTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                primaryTab === tab.id
                  ? "border-stone-800 text-stone-800"
                  : "border-transparent text-muted-foreground hover:text-stone-600 hover:border-stone-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <RecentFromChat category="mmm" />

      {/* Agent banner */}
      {showBanner && (
        <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
          <Info className="h-4 w-4 text-stone-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-stone-700 flex-1">
            The ML-modeled impact reflects demand driver weights learned from 18 months of historical POS, weather, promotional calendar, and external signal data across all perishable categories.
          </p>
          <button onClick={() => setShowBanner(false)} className="text-stone-400 hover:text-stone-600 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI header — shown on all cluster views */}
      {!isClusterOverview && <KPIHeader />}

      {/* Tab content */}
      {isClusterOverview ? (
        <MarketOverviewPanel />
      ) : (
        <>
          {primaryTab === "overview" && (
            <Card>
              <CardContent className="pt-6">
                <DemandOverviewTab />
              </CardContent>
            </Card>
          )}
          {primaryTab === "drivers" && (
            <Card>
              <CardContent className="pt-6">
                <DriverTable />
              </CardContent>
            </Card>
          )}
          {primaryTab === "profit" && (
            <Card>
              <CardContent className="pt-6">
                <ProfitAnalysisTab />
              </CardContent>
            </Card>
          )}
          {primaryTab === "scenarios" && (
            <Card>
              <CardContent className="pt-6">
                <ScenarioPlanningTab />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
