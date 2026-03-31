"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Target,
  Activity,
} from "lucide-react";
import { AiRecommend } from "@carbon/icons-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import type { ScenarioId } from "./chat-data";
import { SCENARIO_META } from "./chat-data";

// ── Chart data ───────────────────────────────────────────────────────────────

// Historical data points (12 weeks of actual data)
const historicalWeeks = [
  "W1 Mar", "W2 Mar", "W3 Mar", "W4 Mar",
  "W1 Apr", "W2 Apr", "W3 Apr", "W4 Apr",
  "W1 May", "W2 May", "W3 May", "W4 May",
];

// Projected data points (12 weeks forward)
const projectedWeeks = [
  "W1 Jun", "W2 Jun", "W3 Jun", "W4 Jun",
  "W1 Jul", "W2 Jul", "W3 Jul", "W4 Jul",
  "W1 Aug", "W2 Aug", "W3 Aug", "W4 Aug",
];

// Base revenue trend (historical)
const baseRevenue = [
  310, 318, 312, 325, 330, 328, 340, 345, 342, 355, 360, 368,
];

// Base ROAS trend (historical)
const baseRoas = [
  2.4, 2.45, 2.42, 2.5, 2.55, 2.52, 2.6, 2.65, 2.62, 2.7, 2.75, 2.8,
];

// Projected revenue by scenario (12 weeks)
const projectedRevenue: Record<ScenarioId, number[]> = {
  profit: [375, 385, 398, 410, 425, 438, 448, 460, 472, 482, 490, 498],
  acquisition: [370, 378, 388, 400, 415, 432, 450, 468, 488, 508, 528, 548],
  retention: [372, 380, 390, 398, 405, 412, 418, 425, 430, 435, 440, 445],
};

// Projected ROAS by scenario
const projectedRoas: Record<ScenarioId, number[]> = {
  profit: [2.85, 2.92, 3.0, 3.1, 3.18, 3.25, 3.3, 3.35, 3.4, 3.42, 3.45, 3.48],
  acquisition: [2.75, 2.7, 2.68, 2.72, 2.78, 2.85, 2.92, 3.0, 3.08, 3.15, 3.22, 3.3],
  retention: [2.82, 2.88, 2.95, 3.02, 3.08, 3.12, 3.15, 3.18, 3.2, 3.22, 3.24, 3.25],
};

// Baseline projection (no change)
const baselineProjected = [370, 374, 378, 382, 385, 388, 390, 392, 394, 396, 398, 400];
const baselineRoasProjected = [2.82, 2.84, 2.85, 2.86, 2.87, 2.88, 2.88, 2.89, 2.89, 2.9, 2.9, 2.9];

function buildChartData(scenarioId: ScenarioId) {
  const data: any[] = [];

  // Historical portion
  for (let i = 0; i < 12; i++) {
    data.push({
      week: historicalWeeks[i],
      revenue: baseRevenue[i],
      roas: baseRoas[i],
      isProjected: false,
    });
  }

  // Projected portion
  for (let i = 0; i < 12; i++) {
    data.push({
      week: projectedWeeks[i],
      baseline: baselineProjected[i],
      baselineRoas: baselineRoasProjected[i],
      projected: projectedRevenue[scenarioId][i],
      projectedRoas: projectedRoas[scenarioId][i],
      isProjected: true,
    });
  }

  return data;
}

// ── Scenario icon map ────────────────────────────────────────────────────────

const SCENARIO_ICONS: Record<ScenarioId, React.ElementType> = {
  profit: TrendingUp,
  acquisition: Target,
  retention: Activity,
};

const SCENARIO_COLORS: Record<ScenarioId, { primary: string; fill: string }> = {
  profit: { primary: "#0f172a", fill: "rgba(15, 23, 42, 0.08)" },
  acquisition: { primary: "#4f46e5", fill: "rgba(79, 70, 229, 0.08)" },
  retention: { primary: "#0d9488", fill: "rgba(13, 148, 136, 0.08)" },
};

// ── Custom tooltip ───────────────────────────────────────────────────────────

function ProjectionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.stroke }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">
            {entry.name.includes("ROAS")
              ? `${Number(entry.value).toFixed(2)}x`
              : `£${entry.value}K`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Current State Card ───────────────────────────────────────────────────────

export function CurrentStateCard() {
  const kpis = [
    { label: "Total Revenue", value: "£398K", change: "+12% MoM", positive: true },
    { label: "Blended ROAS", value: "2.8x", change: "+0.3 vs prior", positive: true },
    { label: "Active Campaigns", value: "8", change: "+2 this month", positive: true },
    { label: "Conversion Rate", value: "3.8%", change: "+0.4% MoM", positive: true },
  ];

  // Build a simple historical-only chart
  const histData = historicalWeeks.map((w, i) => ({
    week: w,
    revenue: baseRevenue[i],
    roas: baseRoas[i],
  }));

  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">
              Current Business Performance
            </span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              Today
            </Badge>
          </div>
          <Link
            href="/udp/dashboard"
            prefetch={false}
            className="text-[10px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            Open dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2 p-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="text-center p-2 bg-slate-50 rounded-md">
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              <p className="text-sm font-bold mt-0.5">{kpi.value}</p>
              <p className="text-[10px] text-emerald-600 font-medium">{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Historical trend */}
        <div className="px-3 pb-3">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">Revenue Trend (Last 12 Weeks)</p>
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={histData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="week" tick={{ fontSize: 8 }} interval={2} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue (£K)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Scenario Projection Card ─────────────────────────────────────────────────

export function ScenarioProjectionCard({ scenarioId }: { scenarioId: ScenarioId }) {
  const meta = SCENARIO_META[scenarioId];
  const Icon = SCENARIO_ICONS[scenarioId];
  const colors = SCENARIO_COLORS[scenarioId];
  const chartData = buildChartData(scenarioId);

  // Compute the delta vs baseline at week 12
  const finalProjected = projectedRevenue[scenarioId][11];
  const finalBaseline = baselineProjected[11];
  const revenueDelta = finalProjected - finalBaseline;
  const revenueDeltaPct = ((revenueDelta / finalBaseline) * 100).toFixed(1);

  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-slate-100">
              <Icon className="h-3.5 w-3.5 text-slate-700" />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {meta.label}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 border-slate-300"
            >
              <AiRecommend size={12} className="mr-0.5" /> Projected
            </Badge>
          </div>
          <Link
            href="/mmm"
            prefetch={false}
            className="text-[10px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            Analyze in MMM <ArrowRight className="h-3 w-3" />
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
            <p className="text-[10px] text-muted-foreground">Revenue Uplift</p>
            <p className="text-sm font-bold mt-0.5 text-emerald-700">
              +£{revenueDelta}K ({revenueDeltaPct}%)
            </p>
          </div>
        </div>

        {/* Projection chart */}
        <div className="px-3 pb-1">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">
            Business Activity & Projected Impact
          </p>
        </div>
        <div className="px-3 pb-3 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 8 }}
                interval={3}
                angle={-30}
                textAnchor="end"
                height={35}
              />
              <YAxis
                tick={{ fontSize: 9 }}
                tickFormatter={(v) => `£${v}K`}
                domain={["auto", "auto"]}
                width={45}
              />
              <Tooltip content={<ProjectionTooltip />} />

              {/* Today divider */}
              <ReferenceLine
                x="W1 Jun"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "Today",
                  position: "top",
                  fill: "#64748b",
                  fontSize: 9,
                  fontWeight: 600,
                }}
              />

              {/* Historical revenue (solid) */}
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0f172a"
                strokeWidth={2}
                dot={false}
                name="Revenue (£K)"
                connectNulls={false}
              />

              {/* Baseline projection (dashed gray) */}
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                name="Baseline (£K)"
                connectNulls={false}
              />

              {/* Scenario projection (dashed colored + fill) */}
              <Area
                type="monotone"
                dataKey="projected"
                stroke={colors.primary}
                strokeWidth={2.5}
                strokeDasharray="8 4"
                fill={colors.fill}
                dot={false}
                name={`${meta.label} (£K)`}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 px-3 pb-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-[2px] bg-slate-900" /> Historical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-[2px] bg-slate-400" style={{ borderTop: "2px dashed #94a3b8", height: 0 }} />
            Baseline
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-[2px]" style={{ borderTop: `2.5px dashed ${colors.primary}`, height: 0 }} />
            {meta.label}
          </span>
        </div>

        {/* Risk badge */}
        <div className="px-3 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <AiRecommend size={12} /> Powered by agentic AI optimization
          </span>
          <Badge
            variant="secondary"
            className="text-[9px] px-1.5 py-0 h-4"
          >
            {meta.risk} risk
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
