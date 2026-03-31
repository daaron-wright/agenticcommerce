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
  Store,
  ClipboardList,
  Radio,
  Settings,
  CheckCircle2,
  Activity,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Shield,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Cell,
} from "recharts";
import type { SnapshotType } from "./chat-data";
import { SERVICES, getPortfolioKPIs, fmtCurrency, fmtCurrencyShort, computeReducedExposure } from "./chat-data";
import { CONTROLS, MAX_SCORE, RISK_BAND_COLORS } from "@/lib/risk/cyber-risk-config";
import { getBenchmarkComparison, BENCHMARK_CITATIONS, DEFAULT_BENCHMARK } from "@/lib/risk/industry-benchmarks";
import { CurrentStateCard, ScenarioProjectionCard } from "./scenario-projection";

const SNAPSHOT_CONFIG: Partial<Record<
  SnapshotType,
  { title: string; icon: React.ElementType; href: string }
>> = {
  dashboard: { title: "Cyber Risk Dashboard", icon: Home, href: "/risk/dashboard" },
  vendors: { title: "Business Services", icon: Store, href: "/risk/vendors" },
  audit: { title: "Assessment History", icon: ClipboardList, href: "/risk/audit" },
  monitoring: { title: "Threat Intelligence", icon: Radio, href: "/risk/monitoring" },
  settings: { title: "System Settings", icon: Settings, href: "/risk/settings" },
};

// ── Computed data from shared data layer ─────────────────────────────────────

const kpis = getPortfolioKPIs();
const primaryService = SERVICES[0]; // Point of Sales — highest risk

const dashboardKPIs = [
  { label: "Total ALE", value: fmtCurrencyShort(kpis.totalALE), change: `Across ${SERVICES.length} services` },
  { label: "Services at Risk", value: String(kpis.servicesAtRisk), change: "Above tolerance" },
  { label: "Controls Coverage", value: `${kpis.controlsCoverage}%`, change: "Gap identified" },
  { label: "Open Vulnerabilities", value: String(kpis.openVulns), change: "Categories" },
];

const serviceRiskData = SERVICES.map((s) => ({
  name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
  score: s.riskScore,
  color: s.riskBand === "Med" ? "#dc2626" : s.riskBand === "Low" ? "#d97706" : "#059669",
}));

const auditEvents = [
  { event: "Risk assessment completed", vendor: primaryService.name, time: "2h ago" },
  { event: "Financial model updated", vendor: "Combined ALE", time: "2h ago" },
  { event: "Control gap identified", vendor: "Micro-segmentation", time: "1d ago" },
  { event: "Benchmark comparison", vendor: "Industry median", time: "3d ago" },
];

const monitoringSignals = [
  { w: "W1", signals: 3 },
  { w: "W2", signals: 5 },
  { w: "W3", signals: 4 },
  { w: "W4", signals: 8 },
  { w: "W5", signals: 6 },
  { w: "W6", signals: 12 },
];

// ── Snapshot Content renderers ───────────────────────────────────────────────

function DashboardSnapshot() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {dashboardKPIs.map((kpi) => (
        <div key={kpi.label} className="text-center p-2 bg-slate-50 rounded-md">
          <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          <p className="text-sm font-bold mt-0.5">{kpi.value}</p>
          <p className="text-[10px] text-amber-600 font-medium">{kpi.change}</p>
        </div>
      ))}
    </div>
  );
}

function VendorsSnapshot() {
  return (
    <div className="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={serviceRiskData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 8 }} />
          <YAxis tick={{ fontSize: 9 }} domain={[0, MAX_SCORE]} />
          <Bar dataKey="score" maxBarSize={16} radius={[2, 2, 0, 0]}>
            {serviceRiskData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AuditSnapshot() {
  return (
    <div className="space-y-1.5">
      {auditEvents.map((evt, i) => (
        <div
          key={i}
          className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 rounded"
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="h-3 w-3 text-slate-400" />
            <span className="font-medium truncate max-w-[160px]">{evt.event}</span>
          </div>
          <div className="flex gap-2 text-muted-foreground text-[10px]">
            <span>{evt.vendor}</span>
            <span>{evt.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MonitoringSnapshot() {
  return (
    <div className="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={monitoringSignals} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="w" tick={{ fontSize: 9 }} />
          <Line
            type="monotone"
            dataKey="signals"
            stroke="#0f172a"
            strokeWidth={2}
            dot={{ r: 2, fill: "#0f172a" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SettingsSnapshot() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 rounded">
        <span className="font-medium">Risk Tolerance Threshold</span>
        <span className="text-muted-foreground">$2M ALE</span>
      </div>
      <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 rounded">
        <span className="font-medium">Assessment Frequency</span>
        <span className="text-muted-foreground">Quarterly</span>
      </div>
      <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50 rounded">
        <span className="font-medium">Active Agents</span>
        <span className="text-muted-foreground">4 running</span>
      </div>
    </div>
  );
}

// ── Financial Summary Snapshot (dynamic from primary service) ─────────────────

function FinancialSummarySnapshot() {
  const svc = primaryService;
  const mtcrDays = Math.round(svc.controlInputs.mtcrHours / 7);

  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-red-50/50">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-red-600" />
            <span className="text-xs font-semibold text-red-800">Financial Risk Summary</span>
          </div>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-red-200 text-red-700 bg-red-50">
            Executive View
          </Badge>
        </div>

        {/* Headline numbers */}
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="text-center p-3 bg-red-50/30 rounded-lg border border-red-100">
            <p className="text-[10px] text-slate-500 font-medium">Single Loss Expectancy</p>
            <p className="text-xl font-bold text-red-700 mt-1">{fmtCurrency(svc.sle)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Cost of one major cyber event</p>
          </div>
          <div className="text-center p-3 bg-amber-50/30 rounded-lg border border-amber-100">
            <p className="text-[10px] text-slate-500 font-medium">Annualised Loss Expectancy</p>
            <p className="text-xl font-bold text-amber-700 mt-1">{fmtCurrency(svc.ale)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Expected annual cyber loss</p>
          </div>
        </div>

        {/* Calculation breakdown */}
        <div className="px-4 pb-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Calculation</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-slate-50 rounded-md">
              <p className="text-[10px] text-muted-foreground">Risk Band</p>
              <p className="text-xs font-bold mt-0.5">{svc.riskBand === "Med" ? "Medium" : svc.riskBand}</p>
              <p className="text-[10px] text-red-600 font-medium">Score: {svc.riskScore}/{svc.maxScore}</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-md">
              <p className="text-[10px] text-muted-foreground">Likelihood</p>
              <p className="text-xs font-bold mt-0.5">{svc.likelihoodPercent}%</p>
              <p className="text-[10px] text-slate-500 font-medium">Annual probability</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-md">
              <p className="text-[10px] text-muted-foreground">Impact/Hour</p>
              <p className="text-xs font-bold mt-0.5">{fmtCurrencyShort(svc.controlInputs.businessImpactPerHour)}</p>
              <p className="text-[10px] text-slate-500 font-medium">Business loss</p>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded-md">
              <p className="text-[10px] text-muted-foreground">MTCR</p>
              <p className="text-xs font-bold mt-0.5">{svc.controlInputs.mtcrHours}h</p>
              <p className="text-[10px] text-slate-500 font-medium">{mtcrDays} days recovery</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t bg-slate-50/50">
          <span className="text-[10px] text-slate-500">
            SLE = Impact/hr × MTCR | ALE = SLE × Likelihood % · <span className="italic">{BENCHMARK_CITATIONS.fair}</span>
          </span>
          <Link
            href="/risk/dashboard"
            prefetch={false}
            className="text-[10px] font-medium text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors shrink-0"
          >
            View dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Risk Benchmark Snapshot (dynamic from industry benchmarks) ────────────────

function RiskBenchmarkSnapshot() {
  const benchmarkData = getBenchmarkComparison(primaryService.riskScore);
  const orgAboveMedian = primaryService.riskScore > DEFAULT_BENCHMARK.avgMaturityScore;

  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">Industry Benchmark Comparison</span>
          </div>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
            IBM / Gartner
          </Badge>
        </div>
        <div className="p-3">
          <div className="space-y-2">
            {benchmarkData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-[10px] text-slate-600 font-medium w-20 shrink-0">{item.name}</span>
                <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.score / MAX_SCORE) * 100}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 w-8 text-right">{item.score}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Risk score (higher = more exposed). Your organisation is{" "}
            <span className={cn("font-semibold", orgAboveMedian ? "text-red-600" : "text-emerald-600")}>
              {orgAboveMedian ? "above" : "below"} the industry median
            </span>.
          </p>
          <p className="text-[9px] text-slate-400 mt-1 italic">
            {BENCHMARK_CITATIONS.breach_cost}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Attack Anatomy Snapshot (dynamic from primary service + controls) ─────────

function AttackAnatomySnapshot() {
  const svc = primaryService;
  const allControlIds = CONTROLS.map((c) => c.id);
  const reduced = computeReducedExposure(
    svc.sle, svc.controlInputs.mtcrHours, svc.controlInputs.businessImpactPerHour,
    svc.likelihoodPercent, allControlIds
  );
  const savingsPct = Math.round((1 - reduced.reducedSLE / svc.sle) * 100);
  const savingsAmount = svc.sle - reduced.reducedSLE;

  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">Attack Anatomy — Before vs After</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-0 divide-x">
          {/* Before */}
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-[10px] font-semibold text-red-700">Without Controls</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">Blast Radius</span>
                <span className="font-semibold text-red-600">12 systems</span>
              </div>
              <div className="h-1.5 bg-red-100 rounded-full">
                <div className="h-full bg-red-500 rounded-full w-full" />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">Detection Time</span>
                <span className="font-semibold text-red-600">{DEFAULT_BENCHMARK.avgMTTI}h</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">Recovery Time</span>
                <span className="font-semibold text-red-600">{svc.controlInputs.mtcrHours}h</span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-red-100">
                <span className="text-slate-600 font-medium">Total Impact</span>
                <span className="font-bold text-red-700">{fmtCurrencyShort(svc.sle)}</span>
              </div>
            </div>
          </div>
          {/* After */}
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-700">With Controls</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">Blast Radius</span>
                <span className="font-semibold text-emerald-600">1 segment</span>
              </div>
              <div className="h-1.5 bg-emerald-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full w-[8%]" />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">Detection Time</span>
                <span className="font-semibold text-emerald-600">4 hours</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">Recovery Time</span>
                <span className="font-semibold text-emerald-600">{Math.round(reduced.reducedMTCR)}h</span>
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-emerald-100">
                <span className="text-slate-600 font-medium">Total Impact</span>
                <span className="font-bold text-emerald-700">{fmtCurrencyShort(reduced.reducedSLE)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 border-t bg-emerald-50/30 text-center">
          <span className="text-[10px] font-semibold text-emerald-700">
            Financial risk reduced by {fmtCurrencyShort(savingsAmount)} ({savingsPct}%) with all three controls applied
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

const SNAPSHOT_RENDERERS: Partial<Record<SnapshotType, React.FC>> = {
  dashboard: DashboardSnapshot,
  vendors: VendorsSnapshot,
  audit: AuditSnapshot,
  monitoring: MonitoringSnapshot,
  settings: SettingsSnapshot,
};

// ── Main SnapshotCard ────────────────────────────────────────────────────────

export function SnapshotCard({ type }: { type: SnapshotType }) {
  const { hoveredBoldIdx, hoveredSnapshot, boldToSnapshot, snapshotToBolds, setHoveredSnapshot } =
    useContext(HighlightContext);

  const hasLinkedBolds = (snapshotToBolds.get(type)?.length ?? 0) > 0;

  const isLinkedFromBold =
    hoveredBoldIdx !== null && boldToSnapshot.get(hoveredBoldIdx) === type;
  const isDirectHover = hoveredSnapshot === type;
  const isHighlighted = isLinkedFromBold || isDirectHover;

  const onEnter = useCallback(() => {
    if (hasLinkedBolds) setHoveredSnapshot(type);
  }, [hasLinkedBolds, setHoveredSnapshot, type]);

  const onLeave = useCallback(() => {
    setHoveredSnapshot(null);
  }, [setHoveredSnapshot]);

  // Dedicated snapshot renderers
  if (type === "financial-summary") return <FinancialSummarySnapshot />;
  if (type === "risk-benchmark") return <RiskBenchmarkSnapshot />;
  if (type === "attack-anatomy") return <AttackAnatomySnapshot />;
  if (type === "nba-execution") return <ExecutionConfirmationCard />;
  if (type === "current-state") return <CurrentStateCard />;
  if (type === "scenario-micro-seg") return <ScenarioProjectionCard scenarioId="micro-seg" />;
  if (type === "scenario-edr") return <ScenarioProjectionCard scenarioId="edr" />;
  if (type === "scenario-recovery") return <ScenarioProjectionCard scenarioId="recovery" />;

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
        <div className="p-3">
          <Renderer />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Execution Confirmation Card ──────────────────────────────────────────────

const executionSteps = [
  { label: "Workstream validated and approved", time: "0s" },
  { label: "Configuration submitted to risk engine", time: "2s" },
  { label: "Control implementation plan generated", time: "4s" },
  { label: "Monitoring agents notified", time: "6s" },
  { label: "Execution confirmed — tracking active", time: "8s" },
];

function ExecutionConfirmationCard() {
  return (
    <Card className="border border-slate-200 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-emerald-50/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800">Workstream Initiated</span>
          </div>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-300 text-emerald-700 bg-emerald-50">
            Active
          </Badge>
        </div>
        <div className="p-3 space-y-1.5">
          {executionSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="flex-1 text-slate-700">{step.label}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{step.time}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-3 py-2 border-t bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] text-slate-600 font-medium">
              Agent is tracking implementation progress — will re-assess risk on completion
            </span>
          </div>
          <Link
            href="/risk/dashboard"
            prefetch={false}
            className="text-[10px] font-medium text-teal-600 hover:text-teal-800 flex items-center gap-1 transition-colors shrink-0"
          >
            View dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
