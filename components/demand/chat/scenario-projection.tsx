"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Tag,
  Activity,
} from "lucide-react";
import { AiRecommend } from "@carbon/icons-react";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ScenarioId } from "./chat-data";
import { SCENARIO_META } from "./chat-data";

// ── Chart data ───────────────────────────────────────────────────────────────

const historicalWeeks = [
  "W1 Mar", "W2 Mar", "W3 Mar", "W4 Mar",
  "W1 Apr", "W2 Apr", "W3 Apr", "W4 Apr",
  "W1 May", "W2 May", "W3 May", "W4 May",
];

const projectedWeeks = [
  "W1 Jun", "W2 Jun", "W3 Jun", "W4 Jun",
  "W1 Jul", "W2 Jul", "W3 Jul", "W4 Jul",
  "W1 Aug", "W2 Aug", "W3 Aug", "W4 Aug",
];

const baseAccuracy = [72, 73, 71, 74, 75, 73, 74, 76, 74, 75, 76, 76];

const projectedAccuracy: Record<ScenarioId, number[]> = {
  "waste-reduction": [78, 80, 82, 84, 86, 87, 88, 89, 90, 91, 91, 92],
  "stockout-prevention": [78, 80, 82, 84, 86, 88, 90, 92, 93, 94, 95, 95],
  "promotion-planning": [78, 79, 80, 81, 82, 83, 83, 84, 84, 85, 85, 85],
};

const baselineProjected = [77, 77, 77, 78, 78, 78, 78, 78, 78, 78, 78, 78];

const SCENARIO_SECONDARY: Record<ScenarioId, { label: string; current: string; projected: string }> = {
  "waste-reduction": { label: "Waste Rate", current: "8.2%", projected: "6.1%" },
  "stockout-prevention": { label: "Fill Rate", current: "91%", projected: "97.5%" },
  "promotion-planning": { label: "Promo Accuracy", current: "58%", projected: "85%" },
};

function buildChartData(scenarioId: ScenarioId) {
  const data: any[] = [];
  for (let i = 0; i < 12; i++) {
    data.push({ week: historicalWeeks[i], accuracy: baseAccuracy[i], isProjected: false });
  }
  for (let i = 0; i < 12; i++) {
    data.push({ week: projectedWeeks[i], baseline: baselineProjected[i], projected: projectedAccuracy[scenarioId][i], isProjected: true });
  }
  return data;
}

// ── Scenario icon/color maps ─────────────────────────────────────────────────

const SCENARIO_ICONS: Record<ScenarioId, React.ElementType> = {
  "waste-reduction": TrendingDown,
  "stockout-prevention": ShieldCheck,
  "promotion-planning": Tag,
};

const SCENARIO_COLORS: Record<ScenarioId, { primary: string; fill: string }> = {
  "waste-reduction": { primary: "#0f172a", fill: "rgba(15, 23, 42, 0.08)" },
  "stockout-prevention": { primary: "#4f46e5", fill: "rgba(79, 70, 229, 0.08)" },
  "promotion-planning": { primary: "#0d9488", fill: "rgba(13, 148, 136, 0.08)" },
};

// ── Mini waterfall data per scenario ─────────────────────────────────────────

const scenarioWaterfallData: Record<ScenarioId, { name: string; value: number; type: string }[]> = {
  "waste-reduction": [
    { name: "Baseline", value: 76, type: "base" },
    { name: "Weather", value: 4, type: "positive" },
    { name: "Promos", value: 3, type: "positive" },
    { name: "Events", value: 5, type: "positive" },
    { name: "Seasonality", value: 2, type: "positive" },
    { name: "Noise", value: -2, type: "negative" },
    { name: "Projected", value: 92, type: "result" },
  ],
  "stockout-prevention": [
    { name: "Baseline", value: 76, type: "base" },
    { name: "Sensing", value: 6, type: "positive" },
    { name: "ML Blend", value: 5, type: "positive" },
    { name: "Safety Stock", value: 4, type: "positive" },
    { name: "Variability", value: -1, type: "negative" },
    { name: "Projected", value: 95, type: "result" },
  ],
  "promotion-planning": [
    { name: "Baseline", value: 58, type: "base" },
    { name: "Promo Lift", value: 10, type: "positive" },
    { name: "Cannibalize", value: -3, type: "negative" },
    { name: "Halo Effect", value: 8, type: "positive" },
    { name: "Timing", value: 6, type: "positive" },
    { name: "Projected", value: 85, type: "result" },
  ],
};

// ── Mini breakdown data per scenario ─────────────────────────────────────────

const scenarioBreakdownData: Record<ScenarioId, { category: string; forecast: string; target: string; gap: string }[]> = {
  "waste-reduction": [
    { category: "Dairy", forecast: "803K", target: "808K", gap: "-1%" },
    { category: "Bakery", forecast: "384K", target: "393K", gap: "-2%" },
    { category: "Produce", forecast: "612K", target: "645K", gap: "-5%" },
    { category: "Deli", forecast: "247K", target: "258K", gap: "-4%" },
  ],
  "stockout-prevention": [
    { category: "Dairy", forecast: "820K", target: "808K", gap: "+1%" },
    { category: "Bakery", forecast: "398K", target: "393K", gap: "+1%" },
    { category: "Produce", forecast: "648K", target: "645K", gap: "0%" },
    { category: "Deli", forecast: "260K", target: "258K", gap: "+1%" },
  ],
  "promotion-planning": [
    { category: "Dairy", forecast: "845K", target: "808K", gap: "+5%" },
    { category: "Bakery", forecast: "412K", target: "393K", gap: "+5%" },
    { category: "Produce", forecast: "665K", target: "645K", gap: "+3%" },
    { category: "Deli", forecast: "268K", target: "258K", gap: "+4%" },
  ],
};

// ── Custom tooltip ───────────────────────────────────────────────────────────

function ProjectionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">{Number(entry.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

// ── Mini Tab Bar (reusable) ──────────────────────────────────────────────────

function MiniTabBar<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string }[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="flex border-b mx-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-2.5 py-1 text-[10px] font-semibold transition-colors border-b-2",
            active === tab.id
              ? "border-slate-800 text-slate-800"
              : "border-transparent text-muted-foreground hover:text-slate-600"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Current State Card ───────────────────────────────────────────────────────

type CurrentStateTab = "kpis" | "trend" | "breakdown";

const currentBreakdownData = [
  { category: "Dairy", accuracy: "74%", variance: "±12%", waste: "9.1%" },
  { category: "Bakery", accuracy: "71%", variance: "±15%", waste: "11.2%" },
  { category: "Produce", accuracy: "78%", variance: "±10%", waste: "7.4%" },
  { category: "Deli", accuracy: "73%", variance: "±14%", waste: "8.8%" },
  { category: "Beverages", accuracy: "82%", variance: "±8%", waste: "3.2%" },
];

export function CurrentStateCard() {
  const [activeTab, setActiveTab] = useState<CurrentStateTab>("kpis");

  const kpis = [
    { label: "Forecast Accuracy", value: "76%", change: "-2.1% vs prior", positive: false },
    { label: "Fill Rate", value: "91%", change: "-1.2% vs prior", positive: false },
    { label: "Waste Rate", value: "8.2%", change: "+0.4% vs prior", positive: false },
    { label: "Annual Waste Cost", value: "$2.3M", change: "+$180K vs prior", positive: false },
  ];

  const histData = historicalWeeks.map((w, i) => ({
    week: w,
    accuracy: baseAccuracy[i],
  }));

  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">
              Current Demand Planning Performance
            </span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">Today</Badge>
          </div>
          <Link href="/demand/dashboard" prefetch={false} className="text-[10px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
            Open dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Mini tab bar */}
        <MiniTabBar
          tabs={[
            { id: "kpis" as const, label: "KPIs" },
            { id: "trend" as const, label: "Trend" },
            { id: "breakdown" as const, label: "Breakdown" },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* KPIs tab */}
        {activeTab === "kpis" && (
          <div className="grid grid-cols-4 gap-2 p-3">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="text-center p-2 bg-slate-50 rounded-md">
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                <p className="text-sm font-bold mt-0.5">{kpi.value}</p>
                <p className="text-[10px] text-red-600 font-medium">{kpi.change}</p>
              </div>
            ))}
          </div>
        )}

        {/* Trend tab */}
        {activeTab === "trend" && (
          <div className="px-3 py-3">
            <p className="text-[10px] text-muted-foreground mb-1 font-medium">Forecast Accuracy Trend (Last 12 Weeks)</p>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={histData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 8 }} interval={2} />
                  <YAxis tick={{ fontSize: 8 }} domain={[65, 80]} tickFormatter={(v) => `${v}%`} width={30} />
                  <Line type="monotone" dataKey="accuracy" stroke="#0f172a" strokeWidth={2} dot={false} name="Accuracy (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Breakdown tab */}
        {activeTab === "breakdown" && (
          <div className="p-3">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-semibold text-muted-foreground">Category</th>
                  <th className="text-right py-1 font-semibold text-muted-foreground">Accuracy</th>
                  <th className="text-right py-1 font-semibold text-muted-foreground">Variance</th>
                  <th className="text-right py-1 font-semibold text-muted-foreground">Waste</th>
                </tr>
              </thead>
              <tbody>
                {currentBreakdownData.map((row) => (
                  <tr key={row.category} className="border-b hover:bg-muted/30">
                    <td className="py-1.5 font-medium">{row.category}</td>
                    <td className="text-right py-1.5">{row.accuracy}</td>
                    <td className="text-right py-1.5">{row.variance}</td>
                    <td className="text-right py-1.5">
                      <span className={cn("font-medium", parseFloat(row.waste) > 8 ? "text-red-600" : "text-slate-700")}>{row.waste}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Scenario Projection Card ─────────────────────────────────────────────────

type ScenarioCardTab = "projection" | "waterfall" | "breakdown";

export function ScenarioProjectionCard({ scenarioId }: { scenarioId: ScenarioId }) {
  const [activeTab, setActiveTab] = useState<ScenarioCardTab>("projection");
  const meta = SCENARIO_META[scenarioId];
  const Icon = SCENARIO_ICONS[scenarioId];
  const colors = SCENARIO_COLORS[scenarioId];
  const chartData = buildChartData(scenarioId);
  const secondary = SCENARIO_SECONDARY[scenarioId];
  const waterfallItems = scenarioWaterfallData[scenarioId];
  const breakdownItems = scenarioBreakdownData[scenarioId];

  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-slate-100">
              <Icon className="h-3.5 w-3.5 text-slate-700" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{meta.label}</span>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-slate-300">
              <AiRecommend size={12} className="mr-0.5" /> Projected
            </Badge>
          </div>
          <Link href="/mmm" prefetch={false} className="text-[10px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
            Analyze drivers <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-2 p-3">
          <div className="text-center p-2 bg-slate-50 rounded-md">
            <p className="text-[10px] text-muted-foreground">Expected Outcome</p>
            <p className="text-sm font-bold mt-0.5">{meta.outcome}</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-md">
            <p className="text-[10px] text-muted-foreground">Budget Impact</p>
            <p className="text-sm font-bold mt-0.5">{meta.budget}</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-md">
            <p className="text-[10px] text-muted-foreground">{secondary.label}</p>
            <p className="text-sm font-bold mt-0.5 text-emerald-700">
              {secondary.current} → {secondary.projected}
            </p>
          </div>
        </div>

        {/* Mini tab bar */}
        <MiniTabBar
          tabs={[
            { id: "projection" as const, label: "Projection" },
            { id: "waterfall" as const, label: "Waterfall" },
            { id: "breakdown" as const, label: "Breakdown" },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        {/* Projection tab */}
        {activeTab === "projection" && (
          <>
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] text-muted-foreground font-medium">Forecast Accuracy & Projected Improvement</p>
            </div>
            <div className="px-3 pb-3 h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 8 }} interval={3} angle={-30} textAnchor="end" height={35} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} domain={[65, 100]} width={35} />
                  <Tooltip content={<ProjectionTooltip />} />
                  <ReferenceLine x="W1 Jun" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "Today", position: "top", fill: "#64748b", fontSize: 9, fontWeight: 600 }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#0f172a" strokeWidth={2} dot={false} name="Accuracy (%)" connectNulls={false} />
                  <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4" dot={false} name="Baseline (%)" connectNulls={false} />
                  <Area type="monotone" dataKey="projected" stroke={colors.primary} strokeWidth={2.5} strokeDasharray="8 4" fill={colors.fill} dot={false} name={`${meta.label} (%)`} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 px-3 pb-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-[2px] bg-slate-900" /> Historical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-[2px] bg-slate-400" style={{ borderTop: "2px dashed #94a3b8", height: 0 }} /> Baseline
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-[2px]" style={{ borderTop: `2.5px dashed ${colors.primary}`, height: 0 }} /> {meta.label}
              </span>
            </div>
          </>
        )}

        {/* Waterfall tab */}
        {activeTab === "waterfall" && (
          <div className="px-3 py-3">
            <p className="text-[10px] text-muted-foreground font-medium mb-2">Driver Contribution Waterfall</p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterfallItems.map((d) => ({ name: d.name, value: Math.abs(d.value), type: d.type }))} margin={{ top: 5, right: 5, bottom: 25, left: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-25} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 8 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: unknown) => [`${v}%`, ""]} contentStyle={{ fontSize: 10 }} />
                  <Bar dataKey="value" maxBarSize={20} radius={[2, 2, 0, 0]}>
                    {waterfallItems.map((entry, i) => (
                      <Cell key={i} fill={entry.type === "negative" ? "#ef4444" : entry.type === "result" ? colors.primary : "#64748b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Breakdown tab */}
        {activeTab === "breakdown" && (
          <div className="p-3">
            <p className="text-[10px] text-muted-foreground font-medium mb-2">Category-Level Forecast vs Target</p>
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-semibold text-muted-foreground">Category</th>
                  <th className="text-right py-1 font-semibold text-muted-foreground">Forecast</th>
                  <th className="text-right py-1 font-semibold text-muted-foreground">Target</th>
                  <th className="text-right py-1 font-semibold text-muted-foreground">Gap</th>
                </tr>
              </thead>
              <tbody>
                {breakdownItems.map((row) => (
                  <tr key={row.category} className="border-b hover:bg-muted/30">
                    <td className="py-1.5 font-medium">{row.category}</td>
                    <td className="text-right py-1.5">{row.forecast}</td>
                    <td className="text-right py-1.5">{row.target}</td>
                    <td className="text-right py-1.5">
                      <span className={cn(
                        "font-semibold px-1 py-0.5 rounded text-[9px]",
                        row.gap.startsWith("-") ? "bg-red-50 text-red-700" : row.gap === "0%" ? "bg-slate-50 text-slate-600" : "bg-green-50 text-green-700"
                      )}>
                        {row.gap}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Risk badge */}
        <div className="px-3 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <AiRecommend size={12} /> Powered by AI/ML demand forecasting
          </span>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{meta.risk} risk</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Scenario Comparison Card ─────────────────────────────────────────────────

const ALL_SCENARIOS: ScenarioId[] = ["waste-reduction", "stockout-prevention", "promotion-planning"];

export function ScenarioComparisonCard() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>("waste-reduction");

  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">Scenario Comparison</span>
          </div>
          <Link href="/mmm" prefetch={false} className="text-[10px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
            Full analysis <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Scenario toggle */}
        <div className="flex border-b mx-3">
          {ALL_SCENARIOS.map((id) => {
            const Icon = SCENARIO_ICONS[id];
            const meta = SCENARIO_META[id];
            return (
              <button
                key={id}
                onClick={() => setActiveScenario(id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold transition-colors border-b-2",
                  activeScenario === id
                    ? "border-slate-800 text-slate-800"
                    : "border-transparent text-muted-foreground hover:text-slate-600"
                )}
              >
                <Icon className="h-3 w-3" />
                {meta.label.split(" ").slice(0, 2).join(" ")}
              </button>
            );
          })}
        </div>

        {/* Active scenario detail */}
        <ScenarioComparisonDetail scenarioId={activeScenario} />
      </CardContent>
    </Card>
  );
}

function ScenarioComparisonDetail({ scenarioId }: { scenarioId: ScenarioId }) {
  const meta = SCENARIO_META[scenarioId];
  const secondary = SCENARIO_SECONDARY[scenarioId];
  const colors = SCENARIO_COLORS[scenarioId];
  const chartData = buildChartData(scenarioId);

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="text-center p-1.5 bg-slate-50 rounded-md">
          <p className="text-[9px] text-muted-foreground">Outcome</p>
          <p className="text-xs font-bold mt-0.5">{meta.outcome}</p>
        </div>
        <div className="text-center p-1.5 bg-slate-50 rounded-md">
          <p className="text-[9px] text-muted-foreground">Budget</p>
          <p className="text-xs font-bold mt-0.5">{meta.budget}</p>
        </div>
        <div className="text-center p-1.5 bg-slate-50 rounded-md">
          <p className="text-[9px] text-muted-foreground">{secondary.label}</p>
          <p className="text-xs font-bold mt-0.5 text-emerald-700">{secondary.current} → {secondary.projected}</p>
        </div>
      </div>

      {/* Mini chart */}
      <div className="px-3 pb-3 h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis dataKey="week" tick={{ fontSize: 7 }} interval={5} />
            <YAxis tick={{ fontSize: 7 }} tickFormatter={(v) => `${v}%`} domain={[65, 100]} width={25} />
            <ReferenceLine x="W1 Jun" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} />
            <Line type="monotone" dataKey="accuracy" stroke="#0f172a" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3" dot={false} />
            <Area type="monotone" dataKey="projected" stroke={colors.primary} strokeWidth={2} strokeDasharray="6 3" fill={colors.fill} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <AiRecommend size={12} /> AI/ML projected
        </span>
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{meta.risk} risk</Badge>
      </div>
    </div>
  );
}
