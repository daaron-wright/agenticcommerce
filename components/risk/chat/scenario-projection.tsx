"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  RefreshCw,
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
} from "recharts";
import type { ScenarioId } from "./chat-data";
import { SCENARIO_META, SERVICES, getPortfolioKPIs, fmtCurrencyShort, computeReducedExposure } from "./chat-data";
import { CONTROLS } from "@/lib/risk/cyber-risk-config";
import { BENCHMARK_CITATIONS } from "@/lib/risk/industry-benchmarks";

// ── Compute ALE projections from the model ──────────────────────────────────

const primaryService = SERVICES[0];
const portfolioKPIs = getPortfolioKPIs();
const currentALE = portfolioKPIs.totalALE / 1_000_000; // in $M

const historicalQuarters = ["Q1", "Q2", "Q3", "Q4"];
const projectedQuarters = ["Q1+1", "Q2+1", "Q3+1", "Q4+1"];

// Historical ALE trend — derived from primary service score history
const historicalALE = (() => {
  // Scale from earliest score to current ALE proportionally
  const hist = primaryService.scoreHistory;
  if (hist.length < 4) return [currentALE * 0.7, currentALE * 0.8, currentALE * 0.9, currentALE];
  const latest4 = hist.slice(-4);
  const maxScore = latest4[latest4.length - 1].score;
  return latest4.map((h) => Number(((h.score / maxScore) * currentALE).toFixed(2)));
})();

// Projected ALE by scenario — computed from control impact multipliers
function computeProjectedALE(scenarioId: ScenarioId): number[] {
  const control = CONTROLS.find((c) => c.id === scenarioId);
  if (!control) return [currentALE, currentALE, currentALE, currentALE];

  const reduced = computeReducedExposure(
    primaryService.sle,
    primaryService.controlInputs.mtcrHours,
    primaryService.controlInputs.businessImpactPerHour,
    primaryService.likelihoodPercent,
    [scenarioId]
  );
  const targetALE = reduced.reducedALE / 1_000_000;

  // Linear ramp from current to target over 4 quarters
  return [
    currentALE,
    Number((currentALE - (currentALE - targetALE) * 0.4).toFixed(2)),
    Number((currentALE - (currentALE - targetALE) * 0.75).toFixed(2)),
    Number(targetALE.toFixed(2)),
  ];
}

const projectedALE: Record<ScenarioId, number[]> = {
  "micro-seg": computeProjectedALE("micro-seg"),
  edr: computeProjectedALE("edr"),
  recovery: computeProjectedALE("recovery"),
};

// Baseline — no action (5% annual growth in risk)
const baselineALE = [
  currentALE,
  Number((currentALE * 1.07).toFixed(2)),
  Number((currentALE * 1.16).toFixed(2)),
  Number((currentALE * 1.25).toFixed(2)),
];

function buildChartData(scenarioId: ScenarioId) {
  const data: any[] = [];

  for (let i = 0; i < 4; i++) {
    data.push({
      quarter: historicalQuarters[i],
      ale: historicalALE[i],
      isProjected: false,
    });
  }

  for (let i = 0; i < 4; i++) {
    data.push({
      quarter: projectedQuarters[i],
      baseline: baselineALE[i],
      projected: projectedALE[scenarioId][i],
      isProjected: true,
    });
  }

  return data;
}

// ── Scenario icon & color maps ───────────────────────────────────────────────

const SCENARIO_ICONS: Record<ScenarioId, React.ElementType> = {
  "micro-seg": Shield,
  edr: Zap,
  recovery: RefreshCw,
};

const SCENARIO_COLORS: Record<ScenarioId, { primary: string; fill: string }> = {
  "micro-seg": { primary: "#2563eb", fill: "rgba(37, 99, 235, 0.08)" },
  edr: { primary: "#7c3aed", fill: "rgba(124, 58, 237, 0.08)" },
  recovery: { primary: "#059669", fill: "rgba(5, 150, 105, 0.08)" },
};

// ── Custom tooltip ───────────────────────────────────────────────────────────

function ProjectionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-stone-700 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.stroke }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">${entry.value}M</span>
        </div>
      ))}
    </div>
  );
}

// ── Current State Card ───────────────────────────────────────────────────────

export function CurrentStateCard() {
  const kpis = [
    { label: "Total ALE", value: fmtCurrencyShort(portfolioKPIs.totalALE), change: `${SERVICES.length} services`, positive: false },
    { label: "Highest Risk", value: primaryService.riskBand === "Med" ? "Medium" : primaryService.riskBand, change: primaryService.name, positive: false },
    { label: "Controls Coverage", value: `${portfolioKPIs.controlsCoverage}%`, change: "Gaps found", positive: false },
    { label: "Recovery Tested", value: primaryService.controlInputs.cyberRecoveryTested ? "Yes" : "No", change: primaryService.controlInputs.cyberRecoveryTested ? "Validated" : "Critical gap", positive: primaryService.controlInputs.cyberRecoveryTested },
  ];

  const histData = historicalQuarters.map((q, i) => ({
    quarter: q,
    ale: historicalALE[i],
  }));

  return (
    <Card className="border border-stone-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-stone-600" />
            <span className="text-xs font-semibold text-stone-700">
              Current Cyber Risk Posture
            </span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              Today
            </Badge>
          </div>
          <Link
            href="/risk/dashboard"
            prefetch={false}
            className="text-[10px] font-medium text-stone-500 hover:text-stone-700 flex items-center gap-1 transition-colors"
          >
            Open dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2 p-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="text-center p-2 bg-stone-50 rounded-md">
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              <p className="text-sm font-bold mt-0.5">{kpi.value}</p>
              <p className={`text-[10px] font-medium ${kpi.positive ? "text-emerald-600" : "text-amber-600"}`}>{kpi.change}</p>
            </div>
          ))}
        </div>

        <div className="px-3 pb-3">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">ALE Trend (Last 4 Quarters, $M)</p>
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={histData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="quarter" tick={{ fontSize: 9 }} />
                <Line
                  type="monotone"
                  dataKey="ale"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                  name="ALE ($M)"
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

  const finalProjected = projectedALE[scenarioId][3];
  const finalBaseline = baselineALE[3];
  const aleReduction = ((finalBaseline - finalProjected) / finalBaseline * 100).toFixed(0);

  const maxY = Math.ceil(Math.max(...baselineALE, ...historicalALE) * 1.2 * 10) / 10;

  const riskColors: Record<string, string> = {
    Low: "border-emerald-300 text-emerald-700 bg-emerald-50",
    Medium: "border-amber-300 text-amber-700 bg-amber-50",
    High: "border-red-300 text-red-700 bg-red-50",
  };

  return (
    <Card className="border border-stone-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-stone-100">
              <Icon className="h-3.5 w-3.5 text-stone-700" />
            </div>
            <span className="text-xs font-semibold text-stone-700">
              {meta.label}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 border-stone-300"
            >
              <AiRecommend size={12} className="mr-0.5" /> Projected
            </Badge>
          </div>
          <Link
            href="/risk/dashboard"
            prefetch={false}
            className="text-[10px] font-medium text-stone-500 hover:text-stone-700 flex items-center gap-1 transition-colors"
          >
            View dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3">
          <div className="text-center p-2 bg-stone-50 rounded-md">
            <p className="text-[10px] text-muted-foreground">Expected Outcome</p>
            <p className="text-sm font-bold mt-0.5">{meta.outcome}</p>
          </div>
          <div className="text-center p-2 bg-stone-50 rounded-md">
            <p className="text-[10px] text-muted-foreground">Investment</p>
            <p className="text-sm font-bold mt-0.5">{meta.budget}</p>
          </div>
          <div className="text-center p-2 bg-stone-50 rounded-md">
            <p className="text-[10px] text-muted-foreground">ALE Reduction</p>
            <p className="text-sm font-bold mt-0.5 text-emerald-700">
              -{aleReduction}%
            </p>
          </div>
        </div>

        <div className="px-3 pb-1">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">
            ALE Projection ($M) — {meta.label}
          </p>
        </div>
        <div className="px-3 pb-3 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 9 }}
              />
              <YAxis
                tick={{ fontSize: 9 }}
                domain={[0, maxY]}
                width={30}
                tickFormatter={(v) => `$${v}M`}
              />
              <Tooltip content={<ProjectionTooltip />} />

              <ReferenceLine
                x="Q4"
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

              <Line
                type="monotone"
                dataKey="ale"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                name="Actual ALE"
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                name="No Action"
                connectNulls={false}
              />

              <Area
                type="monotone"
                dataKey="projected"
                stroke={colors.primary}
                strokeWidth={2.5}
                strokeDasharray="8 4"
                fill={colors.fill}
                dot={false}
                name={meta.label}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 px-3 pb-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-[2px] bg-red-500" /> Historical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-[2px] bg-stone-400" style={{ borderTop: "2px dashed #94a3b8", height: 0 }} />
            No Action
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-[2px]" style={{ borderTop: `2.5px dashed ${colors.primary}`, height: 0 }} />
            {meta.label}
          </span>
        </div>

        <div className="px-3 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <AiRecommend size={12} /> {BENCHMARK_CITATIONS.fair}
          </span>
          <Badge
            variant="outline"
            className={`text-[9px] px-1.5 py-0 h-4 ${riskColors[meta.risk] || ""}`}
          >
            {meta.risk} risk
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
