"use client";

import { useContext, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HighlightContext } from "./chat-message";
import {
  ArrowRight,
  Home,
  FileText,
  BarChart3,
  ClipboardList,
  Layers,
  Store,
  PieChart,
  CheckCircle2,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  Cell,
  ComposedChart,
} from "recharts";
import type { SnapshotType } from "./chat-data";
import { CurrentStateCard, ScenarioProjectionCard } from "./scenario-projection";

const SNAPSHOT_CONFIG: Partial<Record<
  SnapshotType,
  { title: string; icon: React.ElementType; href: string }
>> = {
  dashboard: { title: "Demand Planning Overview", icon: Home, href: "/demand/dashboard" },
  reports: { title: "Forecast Performance Reports", icon: FileText, href: "/demand/reports" },
  mmm: { title: "Demand Driver Analysis", icon: BarChart3, href: "/demand/mmm" },
  campaigns: { title: "Planning Actions", icon: ClipboardList, href: "/demand/campaigns" },
  audiences: { title: "SKU Forecastability Segments", icon: Layers, href: "/demand/audiences" },
  customers: {
    title: "Store-Level Insights",
    icon: Store,
    href: "/demand/customers",
  },
  analytics: {
    title: "Demand Analytics",
    icon: PieChart,
    href: "/demand/analytics",
  },
};

// ── Mini data for each snapshot ──────────────────────────────────────────────

const dashboardKPIs = [
  { label: "Forecast Accuracy", value: "76%", change: "-2.1%" },
  { label: "Waste Rate", value: "8.2%", change: "+0.4%" },
  { label: "Fill Rate", value: "91%", change: "-1.2%" },
  { label: "Demand Variance", value: "±12%", change: "+1.8%" },
];

// Forecast vs Actuals — bars for actuals, line for forecast (inspired by Sales/Forecast chart)
const forecastVsActualsData = [
  { d: "W24", actuals: 62, forecast: 58 },
  { d: "W25", actuals: 55, forecast: 60 },
  { d: "W26", actuals: 68, forecast: 65 },
  { d: "W27", actuals: 72, forecast: 70 },
  { d: "W28", actuals: 85, forecast: 68 },
  { d: "W29", actuals: 78, forecast: 75 },
  { d: "W30", actuals: 70, forecast: 72 },
];

// Category Waste Breakdown (inspired by waterfall/bar chart)
const categoryWasteData = [
  { ch: "Dairy", value: 32, color: "#0f172a" },
  { ch: "Bakery", value: 28, color: "#334155" },
  { ch: "Produce", value: 22, color: "#64748b" },
  { ch: "Deli", value: 12, color: "#94a3b8" },
  { ch: "Prepared", value: 6, color: "#cbd5e1" },
];

// Active Planning Items
const planningItems = [
  { name: "Dairy Heatwave Adjustment", status: "Active", impact: "-40% waste" },
  { name: "Bakery Mid-Week Reduction", status: "Pending", impact: "-22% waste" },
  { name: "BOGO Strawberry Prep", status: "Active", impact: "+$180K rev" },
  { name: "Easter Seasonal Uplift", status: "Scheduled", impact: "+15% lift" },
];

// Forecastability Segments (horizontal bars)
const forecastabilitySegments = [
  { name: "High-Forecastability", size: "12,400 SKUs", pct: 62 },
  { name: "Medium-Forecastability", size: "5,600 SKUs", pct: 28 },
  { name: "Low-Forecastability", size: "2,000 SKUs", pct: 10 },
];

// Demand trend with forecast overlay
const weeklyDemandData = [
  { w: "Mon", demand: 8400, forecast: 7800 },
  { w: "Tue", demand: 7200, forecast: 7600 },
  { w: "Wed", demand: 7000, forecast: 7500 },
  { w: "Thu", demand: 8800, forecast: 8200 },
  { w: "Fri", demand: 10200, forecast: 9500 },
  { w: "Sat", demand: 12400, forecast: 11000 },
  { w: "Sun", demand: 11800, forecast: 10800 },
];

// Store-level insights
const storeSegments = [
  { name: "Urban High-Traffic", count: "38 stores", accuracy: "71%" },
  { name: "Suburban Standard", count: "64 stores", accuracy: "79%" },
  { name: "Rural Low-Volume", count: "40 stores", accuracy: "82%" },
];

// ── Snapshot Content renderers ───────────────────────────────────────────────

// Mini waterfall data for dashboard snapshot
const dashboardWaterfallData = [
  { name: "Outlook LY", value: 1420, type: "base" },
  { name: "+Growth", value: 180, type: "positive" },
  { name: "Outlook", value: 1684, type: "result" },
  { name: "Target", value: 1756, type: "target" },
  { name: "Gap", value: -72, type: "negative" },
];

function DashboardSnapshot() {
  return (
    <div className="space-y-2">
      {/* o9-style Outlook vs Target */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-slate-50 rounded-md border-l-2 border-l-slate-800">
          <p className="text-[9px] text-muted-foreground uppercase font-semibold">Demand Outlook</p>
          <p className="text-base font-bold">1,684,062</p>
          <p className="text-[10px] text-green-600 font-medium">vs LY: +170%</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-md border-l-2 border-l-amber-500">
          <p className="text-[9px] text-muted-foreground uppercase font-semibold">Target</p>
          <p className="text-base font-bold">1,756,471</p>
          <p className="text-[10px] text-red-600 font-medium">Gap: -4.1%</p>
        </div>
      </div>
      {/* Mini waterfall */}
      <div className="h-[60px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dashboardWaterfallData.map(d => ({ name: d.name, value: Math.abs(d.value), type: d.type }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 7 }} />
            <Bar dataKey="value" maxBarSize={16} radius={[2, 2, 0, 0]}>
              {dashboardWaterfallData.map((entry, i) => (
                <Cell key={i} fill={entry.type === "negative" ? "#ef4444" : entry.type === "target" ? "#f59e0b" : entry.type === "result" ? "#0f172a" : "#64748b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ReportsSnapshot() {
  return (
    <div className="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={forecastVsActualsData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="d" tick={{ fontSize: 9 }} />
          <Bar dataKey="actuals" fill="#94a3b8" maxBarSize={14} radius={[2, 2, 0, 0]} name="Actuals" />
          <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} dot={false} name="Forecast" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Driver contribution waterfall for MMM snapshot
const driverWaterfallData = [
  { name: "Baseline", value: 27, color: "#475569" },
  { name: "Promos", value: 28, color: "#0f172a" },
  { name: "Weather", value: 18, color: "#334155" },
  { name: "Events", value: 11, color: "#64748b" },
  { name: "Season", value: 9, color: "#94a3b8" },
  { name: "Other", value: 7, color: "#cbd5e1" },
];

function MMMSnapshot() {
  return (
    <div className="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={driverWaterfallData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 8 }} />
          <YAxis tick={{ fontSize: 8 }} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v: unknown) => [`${v}%`, ""]} contentStyle={{ fontSize: 10 }} />
          <Bar dataKey="value" maxBarSize={16} radius={[2, 2, 0, 0]}>
            {driverWaterfallData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CampaignsSnapshot() {
  return (
    <div className="space-y-1.5">
      {planningItems.map((c) => (
        <div
          key={c.name}
          className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 rounded"
        >
          <div className="flex items-center gap-2">
            <Badge
              variant={c.status === "Active" ? "default" : "secondary"}
              className="text-[9px] px-1.5 py-0 h-4"
            >
              {c.status}
            </Badge>
            <span className="font-medium truncate max-w-[140px]">{c.name}</span>
          </div>
          <span className="font-semibold text-foreground text-xs">{c.impact}</span>
        </div>
      ))}
    </div>
  );
}

function AudiencesSnapshot() {
  return (
    <div className="space-y-1.5">
      {forecastabilitySegments.map((seg) => (
        <div key={seg.name} className="flex items-center gap-2 text-xs">
          <div className="flex-1">
            <div className="flex justify-between mb-0.5">
              <span className="font-medium">{seg.name}</span>
              <span className="text-muted-foreground">{seg.size}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-700 rounded-full"
                style={{ width: `${seg.pct}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomersSnapshot() {
  return (
    <div className="space-y-1.5">
      {storeSegments.map((seg) => (
        <div
          key={seg.name}
          className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 rounded"
        >
          <span className="font-medium">{seg.name}</span>
          <div className="flex gap-3 text-muted-foreground">
            <span>{seg.count}</span>
            <span className="font-semibold text-foreground">Acc. {seg.accuracy}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsSnapshot() {
  return (
    <div className="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={weeklyDemandData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="w" tick={{ fontSize: 9 }} />
          <Area
            type="monotone"
            dataKey="demand"
            fill="#e2e8f0"
            stroke="#475569"
            strokeWidth={1.5}
            name="Actual Demand"
          />
          <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Forecast" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

const SNAPSHOT_RENDERERS: Partial<Record<SnapshotType, React.FC>> = {
  dashboard: DashboardSnapshot,
  reports: ReportsSnapshot,
  mmm: MMMSnapshot,
  campaigns: CampaignsSnapshot,
  audiences: AudiencesSnapshot,
  customers: CustomersSnapshot,
  analytics: AnalyticsSnapshot,
};

// ── Main SnapshotCard ────────────────────────────────────────────────────────

export function SnapshotCard({ type }: { type: SnapshotType }) {
  const { hoveredBoldIdx, hoveredSnapshot, boldToSnapshot, snapshotToBolds, setHoveredSnapshot } =
    useContext(HighlightContext);

  const hasLinkedBolds = (snapshotToBolds.get(type)?.length ?? 0) > 0;

  // Is this card highlighted because a linked bold phrase is hovered?
  const isLinkedFromBold =
    hoveredBoldIdx !== null && boldToSnapshot.get(hoveredBoldIdx) === type;
  // Is this card directly hovered?
  const isDirectHover = hoveredSnapshot === type;
  const isHighlighted = isLinkedFromBold || isDirectHover;

  const onEnter = useCallback(() => {
    if (hasLinkedBolds) setHoveredSnapshot(type);
  }, [hasLinkedBolds, setHoveredSnapshot, type]);

  const onLeave = useCallback(() => {
    setHoveredSnapshot(null);
  }, [setHoveredSnapshot]);

  // Scenario-specific cards delegate to dedicated components
  if (type === "nba-execution") return <ExecutionConfirmationCard />;
  if (type === "current-state") return <CurrentStateCard />;
  if (type === "scenario-waste-reduction") return <ScenarioProjectionCard scenarioId="waste-reduction" />;
  if (type === "scenario-stockout-prevention") return <ScenarioProjectionCard scenarioId="stockout-prevention" />;
  if (type === "scenario-promotion-planning") return <ScenarioProjectionCard scenarioId="promotion-planning" />;

  const config = SNAPSHOT_CONFIG[type];
  const Renderer = SNAPSHOT_RENDERERS[type];
  if (!config || !Renderer) return null;
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "border shadow-none overflow-hidden transition-all duration-200",
        isHighlighted
          ? "border-slate-400 shadow-md ring-1 ring-slate-300/50"
          : "border-slate-200",
        hasLinkedBolds && "cursor-pointer"
      )}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2 border-b transition-colors duration-200",
            isHighlighted ? "bg-slate-100" : "bg-slate-50/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-200",
                isHighlighted ? "text-slate-900" : "text-slate-600"
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold transition-colors duration-200",
                isHighlighted ? "text-slate-900" : "text-slate-700"
              )}
            >
              {config.title}
            </span>
          </div>
          <Link
            href={config.href}
            prefetch={false}
            className="text-[10px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            Open full view <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {/* Content */}
        <div className="p-3">
          <Renderer />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Execution Confirmation Card ──────────────────────────────────────────────

const executionSteps = [
  { label: "Action validated against supply constraints", time: "0s" },
  { label: "Forecast adjustment submitted to planning system", time: "2s" },
  { label: "Replenishment orders updated", time: "4s" },
  { label: "Demand monitoring agent activated", time: "6s" },
  { label: "Execution confirmed — changes live", time: "8s" },
];

function ExecutionConfirmationCard() {
  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        {/* Header with green accent */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-emerald-50/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800">Execution Confirmed</span>
          </div>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-300 text-emerald-700 bg-emerald-50">
            Live
          </Badge>
        </div>
        {/* Execution timeline */}
        <div className="p-3 space-y-1.5">
          {executionSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="flex-1 text-slate-700">{step.label}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{step.time}</span>
            </div>
          ))}
        </div>
        {/* Monitoring footer */}
        <div className="flex items-center gap-2 px-3 py-2 border-t bg-slate-50/50">
          <Activity className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] text-slate-600 font-medium">
            Agent is now monitoring demand vs forecast — will alert on anomalies
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
