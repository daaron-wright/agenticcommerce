"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  CONTROL_TOWER_ACTIONS,
  CONTROL_TOWER_ALERTS,
  CONTROL_TOWER_HERO_METRICS,
  CONTROL_TOWER_JOURNEY_SIGNALS,
  CONTROL_TOWER_SUMMARY,
  CONTROL_TOWER_WIDGETS,
  type ControlTowerAction,
  type ControlTowerActionState,
  type ControlTowerAgentFlowCard,
  type ControlTowerAlert,
  type ControlTowerDecisionItem,
  type ControlTowerDomain,
  type ControlTowerSeverity,
  type ControlTowerStatus,
  type ControlTowerWidget,
  type ControlTowerJourneySignal,
} from "@/lib/control-tower-data";
import { useAuth } from "@/lib/auth-context";
import { useActionEffects } from "@/lib/action-effects-store";
import { DashboardModuleSurface } from "@/components/dashboard/module-dashboard-content";
import {
  GraphInstanceDialog,
  type GraphInstancePrefill,
} from "@/components/knowledge-graph/graph-instance-dialog";
import { buildKnowledgeGraphHref } from "@/lib/knowledge-graph-data";
import { buildIncrementalityHref } from "@/lib/incrementality-data";
import {
  buildDashboardHref,
  getAllowedDashboardModules,
  getAllowedDashboardViews,
  getDashboardModuleConfig,
  getDefaultDashboardModuleForRole,
  isCrossDomainDashboardRole,
  parseDashboardModule,
  parseDashboardView,
} from "@/lib/dashboard-ia";
import { createKnowledgeGraphInstanceHref } from "@/lib/knowledge-graph-instances";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Megaphone,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
  BarChart2,
  PieChart,
  LineChart as LineChartIcon,
  Target,
  ShoppingCart,
  Users,
  Activity,
  Globe,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  productReportTotals,
  productReportRows,
  atRiskProducts,
} from "@/lib/dashboard/mock-product-inventory";
import { missedPotentialData, channelRecommendations, marketOverview } from "@/lib/dashboard/mock-mmm-saturation";
import { experimentSummary, incrementalityComparisonBars } from "@/lib/dashboard/mock-incrementality-summary";
import { performanceHeroKpis, multiMetricTrend, productSellThrough } from "@/lib/dashboard/mock-overall-performance";
import { ecommerceDashboardData } from "@/lib/dashboard/mock-ecommerce";
import {
  Bar,
  BarChart,
  Legend,
} from "recharts";
import {
  visualizationPalette,
  visualizationGrid,
  visualizationSmallTick,
  visualizationTooltipStyle,
  visualizationCardClass,
} from "@/lib/visualization-theme";

const DOMAIN_META: Record<
  Exclude<ControlTowerDomain, "risk">,
  {
    label: string;
    icon: React.ElementType;
    accent: string;
    soft: string;
    border: string;
  }
> = {
  udp: {
    label: "UDP Application",
    icon: Database,
    accent: "text-[#3d3c3c]",
    soft: "bg-stone-100",
    border: "border-stone-200",
  },
  demand: {
    label: "Demand Signal",
    icon: BarChart3,
    accent: "text-[#29707a]",
    soft: "bg-[#29707a]/[0.25]",
    border: "border-[#8ecfd9]",
  },
  campaign: {
    label: "Commercial",
    icon: Megaphone,
    accent: "text-[#29707a]",
    soft: "bg-[#29707a]/[0.25]",
    border: "border-[#8ecfd9]",
  },
};

const STATUS_META: Record<
  ControlTowerStatus,
  { badge: string; dot: string; label: string }
> = {
  healthy: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    label: "Healthy",
  },
  attention: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    label: "Attention",
  },
  critical: {
    badge: "border-red-200 bg-red-50 text-[#cc1800]",
    dot: "bg-[#ff462d]",
    label: "Critical",
  },
};

const SEVERITY_META: Record<
  ControlTowerSeverity,
  { badge: string; label: string; icon: React.ElementType }
> = {
  critical: {
    badge: "border-red-200 bg-red-50 text-[#cc1800]",
    label: "Critical",
    icon: AlertCircle,
  },
  high: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    label: "High Priority",
    icon: AlertTriangle,
  },
  medium: {
    badge: "border-stone-200 bg-stone-100 text-stone-700",
    label: "Medium",
    icon: AlertTriangle,
  },
  info: {
    badge: "border-stone-200 bg-stone-50 text-stone-600",
    label: "Info",
    icon: AlertTriangle,
  },
};

const ACTION_STATE_META: Record<
  ControlTowerActionState,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "border-stone-200 bg-stone-100 text-stone-700",
  },
  approved: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  in_review: {
    label: "In review",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  dismissed: {
    label: "Dismissed",
    className: "border-stone-200 bg-stone-50 text-stone-500",
  },
};

const SPARKLINE_COLORS: Record<ControlTowerStatus, string> = {
  healthy: "#00af41",
  attention: "#f59e0b",
  critical: "#ff462d",
};

const PANEL_LAYOUT = {
  left: ["active-work-queue", "udp-health", "experiments-program"],
  right: ["demand-forecast", "inventory-coverage", "campaign-efficiency"],
} as const;

const SEVERITY_ORDER: Record<ControlTowerSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  info: 3,
};

type ItemDecisionState =
  | { state: "pending" }
  | { state: "approved" }
  | { state: "rejected" }
  | { state: "conditional"; condition: string };

function mapControlTowerDomainToGraphDomain(domain: ControlTowerDomain) {
  if (domain === "campaign") {
    return "cross-domain" as const;
  }

  return domain;
}

function buildAlertGraphPrefill(alert: ControlTowerAlert): GraphInstancePrefill {
  return {
    title: alert.title,
    description: alert.description,
    domain: mapControlTowerDomainToGraphDomain(alert.domain),
    presetId: alert.graphPreset as GraphInstancePrefill["presetId"],
    scopeId: alert.graphScopeId,
    centerNodeId: alert.graphCenterNodeId,
    sourcePrompt: `Create a graph from alert: ${alert.title}`,
  };
}

function buildActionGraphPrefill(action: ControlTowerAction): GraphInstancePrefill {
  return {
    title: action.title,
    description: action.summary,
    domain: mapControlTowerDomainToGraphDomain(action.domain),
    presetId: action.graphPreset as GraphInstancePrefill["presetId"],
    scopeId: action.graphScopeId,
    centerNodeId: action.graphCenterNodeId,
    sourcePrompt: `Create a graph from action: ${action.title}`,
  };
}

function Sparkline({
  data,
  color,
  id,
}: {
  data: number[];
  color: string;
  id: string;
}) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={28}>
      <AreaChart
        data={chartData}
        margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${id})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const METRIC_SHORT_LABELS: Record<string, string> = {
  "platform-health": "Profile",
  "active-alerts": "Alerts",
  "pending-actions": "Approvals",
  "udp-readiness": "Reach",
  "forecast-accuracy": "Demand",
  "activation-readiness": "Campaign",
};

const METRIC_ACTIONS: Record<string, { label: string; href: string }[]> = {
  "platform-health": [
    { label: "View merge exceptions", href: "/demand/dashboard" },
    { label: "Enrichment pipeline", href: "/reports" },
  ],
  "active-alerts": [
    { label: "Triage alerts", href: "/risk/audit" },
    { label: "Alert history", href: "/reports" },
  ],
  "pending-actions": [
    { label: "Review approvals", href: "/reports" },
    { label: "Escalation queue", href: "/risk/audit" },
  ],
  "udp-readiness": [
    { label: "Consent audit", href: "/reports" },
    { label: "Identity resolution", href: "/demand/dashboard" },
  ],
  "forecast-accuracy": [
    { label: "Regional breakdown", href: "/demand/dashboard" },
    { label: "Signal sources", href: "/demand/reports" },
  ],
  "activation-readiness": [
    { label: "Active campaigns", href: "/campaigns" },
    { label: "Audience health", href: "/reports" },
  ],
};

/* ── Next Best Actions per tab ──────────────────────────────────────────────── */

interface TabNBAAction {
  id: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  actionType: "resolve_alert" | "approve_action" | "apply_recommendation" | "activate_redirect" | "submit_reorder" | "apply_campaign";
  actionPayload: { id: string; type?: string };
}

const TAB_NBA_ACTIONS: Record<string, TabNBAAction[]> = {
  "platform-health": [
    {
      id: "nba-profile-1",
      title: "Approve demand surge forecast",
      description: "AI detected +340% demand surge for essentials. Approving updates forecast models across 14 DCs.",
      impact: "+6pp forecast accuracy",
      confidence: 94,
      actionType: "approve_action",
      actionPayload: { id: "action-demand-surge", type: "approved" },
    },
    {
      id: "nba-profile-2",
      title: "Apply smart substitution recommendation",
      description: "Substitute 23 out-of-stock SKUs with available alternatives to maintain fill rate.",
      impact: "+3pp fill rate",
      confidence: 88,
      actionType: "apply_recommendation",
      actionPayload: { id: "rec-inventory" },
    },
  ],
  "active-alerts": [
    {
      id: "nba-alerts-1",
      title: "Resolve Emergency Demand Surge alert",
      description: "Stock-out risk across 482 stores. Emergency reorder window closing at 2:00 PM EST.",
      impact: "-15 SKUs at risk, +4pp accuracy",
      confidence: 96,
      actionType: "resolve_alert",
      actionPayload: { id: "alert-demand-stockout", type: "approved" },
    },
    {
      id: "nba-alerts-2",
      title: "Resolve Cold-Chain Integrity Risk alert",
      description: "Frozen & dairy products at risk across DC-Newark, DC-Pittsburgh, DC-Cleveland corridors.",
      impact: "+2pp forecast accuracy",
      confidence: 91,
      actionType: "resolve_alert",
      actionPayload: { id: "alert-coldchain-risk", type: "approved" },
    },
    {
      id: "nba-alerts-3",
      title: "Resolve Last-Mile Delivery Constraint alert",
      description: "2,340 orders pending reroute or deferral in 6 metro zones.",
      impact: "+6pp on-time delivery",
      confidence: 89,
      actionType: "resolve_alert",
      actionPayload: { id: "alert-lastmile-constraint", type: "approved" },
    },
  ],
  "pending-actions": [
    {
      id: "nba-approvals-1",
      title: "Approve emergency reorder",
      description: "$820K emergency PO for 127 critical SKUs across Northeast DCs.",
      impact: "-12 SKUs at risk, +4pp DC in-stock",
      confidence: 95,
      actionType: "approve_action",
      actionPayload: { id: "action-emergency-reorder", type: "approved" },
    },
    {
      id: "nba-approvals-2",
      title: "Approve cold-chain transport",
      description: "$76K for refrigerated transport rerouting from compromised DC-Newark hub.",
      impact: "+2pp forecast accuracy",
      confidence: 92,
      actionType: "approve_action",
      actionPayload: { id: "action-coldchain-transport", type: "approved" },
    },
    {
      id: "nba-approvals-3",
      title: "Approve last-mile rerouting",
      description: "$145K to reroute 2,340 orders to alternate fulfillment centers.",
      impact: "+5pp on-time delivery",
      confidence: 90,
      actionType: "approve_action",
      actionPayload: { id: "action-lastmile-reroute", type: "approved" },
    },
  ],
  "udp-readiness": [
    {
      id: "nba-reach-1",
      title: "Approve emergency supplier activation",
      description: "Activate 3 backup suppliers to cover Northeast DC shortfall.",
      impact: "+3pp DC in-stock, -8 SKUs at risk",
      confidence: 93,
      actionType: "approve_action",
      actionPayload: { id: "action-emergency-supplier", type: "approved" },
    },
    {
      id: "nba-reach-2",
      title: "Apply inventory rebalance",
      description: "Redistribute 34 high-velocity SKUs from overstocked Southern DCs to Northeast.",
      impact: "+3pp DC in-stock, -7 SKUs at risk",
      confidence: 87,
      actionType: "apply_recommendation",
      actionPayload: { id: "rec-inventory" },
    },
    {
      id: "nba-reach-3",
      title: "Activate in-store pickup redirect",
      description: "Redirect 3,400 e-commerce orders to click-and-collect at nearby stores.",
      impact: "+3pp on-time delivery",
      confidence: 85,
      actionType: "activate_redirect",
      actionPayload: { id: "reach-redirect" },
    },
  ],
  "forecast-accuracy": [
    {
      id: "nba-demand-1",
      title: "Approve emergency reorder for critical SKUs",
      description: "Submit PO for 127 critical SKUs before 2:00 PM ordering cutoff.",
      impact: "-12 SKUs at risk, +6pp fill rate",
      confidence: 96,
      actionType: "approve_action",
      actionPayload: { id: "action-emergency-reorder", type: "approved" },
    },
    {
      id: "nba-demand-2",
      title: "Submit emergency reorder via demand planning",
      description: "Fast-track reorder through demand planning channel to bypass standard approval.",
      impact: "-5 SKUs at risk",
      confidence: 91,
      actionType: "submit_reorder",
      actionPayload: { id: "demand-reorder" },
    },
    {
      id: "nba-demand-3",
      title: "Apply inventory rebalance to NE DCs",
      description: "Move excess inventory from Southeast to cover Northeast DC gaps.",
      impact: "+3pp DC in-stock, -7 SKUs at risk",
      confidence: 88,
      actionType: "apply_recommendation",
      actionPayload: { id: "rec-inventory" },
    },
  ],
  "activation-readiness": [
    {
      id: "nba-campaign-1",
      title: "Approve last-mile rerouting plan",
      description: "Reroute 2,340 orders to alternate fulfillment for storm-impacted zones.",
      impact: "+5pp on-time delivery",
      confidence: 90,
      actionType: "approve_action",
      actionPayload: { id: "action-lastmile-reroute", type: "approved" },
    },
    {
      id: "nba-campaign-2",
      title: "Activate reach redirect for 3,400 orders",
      description: "Switch affected e-commerce orders to click-and-collect fulfillment.",
      impact: "+3pp on-time delivery",
      confidence: 85,
      actionType: "activate_redirect",
      actionPayload: { id: "reach-redirect" },
    },
    {
      id: "nba-campaign-3",
      title: "Apply emergency push notification",
      description: "Suppress storm-region paid ads and redirect budget to push notifications for order updates.",
      impact: "+1pp forecast accuracy",
      confidence: 82,
      actionType: "apply_recommendation",
      actionPayload: { id: "rec-suppress-fb" },
    },
  ],
};

function TabNBASection({ metricId }: { metricId: string }) {
  const effects = useActionEffects();
  const router = useRouter();
  const actions = TAB_NBA_ACTIONS[metricId] ?? [];
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});

  const isAlreadyDone = useCallback(
    (action: TabNBAAction) => {
      if (action.actionType === "resolve_alert") return !!effects.resolvedAlerts[action.actionPayload.id];
      if (action.actionType === "approve_action") return !!effects.approvedActions[action.actionPayload.id];
      if (action.actionType === "apply_recommendation") return !!effects.appliedRecommendations[action.actionPayload.id];
      if (action.actionType === "activate_redirect") return effects.reachRedirectActive;
      if (action.actionType === "submit_reorder") return effects.demandReorderSubmitted;
      if (action.actionType === "apply_campaign") return effects.campaignApplied;
      return false;
    },
    [effects]
  );

  const executeAction = useCallback(
    (action: TabNBAAction) => {
      switch (action.actionType) {
        case "resolve_alert":
          effects.resolveAlert(action.actionPayload.id, (action.actionPayload.type as "approved") ?? "approved");
          break;
        case "approve_action":
          effects.approveAction(action.actionPayload.id, (action.actionPayload.type as "approved") ?? "approved");
          break;
        case "apply_recommendation":
          effects.applyRecommendation(action.actionPayload.id);
          break;
        case "activate_redirect":
          effects.activateReachRedirect();
          break;
        case "submit_reorder":
          effects.submitDemandReorder();
          break;
        case "apply_campaign":
          effects.applyCampaign();
          break;
      }
      setExecutedActions((prev) => ({ ...prev, [action.id]: true }));
      toast.success(action.title, { description: `Impact: ${action.impact}` });
    },
    [effects]
  );

  if (actions.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">
        AI Next Best Actions
      </p>
      <div className="space-y-2">
        {actions.map((action) => {
          const done = isAlreadyDone(action) || executedActions[action.id];
          return (
            <div
              key={action.id}
              className={cn(
                "rounded-lg border p-3 transition-all",
                done
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[12px] font-semibold text-[#3d3c3c]">
                      {action.title}
                    </p>
                    <Badge variant="outline" className="text-[9px] shrink-0 border-[#29707a]/30 bg-[#29707a]/10 text-[#29707a]">
                      {action.impact}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {action.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] text-stone-400">AI Confidence</span>
                    <div className="h-1.5 w-16 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#29707a]"
                        style={{ width: `${action.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-[#29707a]">{action.confidence}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {done ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                      <Check className="h-3 w-3 mr-1" /> Done
                    </Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="h-7 text-[11px] bg-[#29707a] hover:bg-[#1e5960] text-white"
                        onClick={() => executeAction(action)}
                      >
                        {action.actionType === "resolve_alert" ? "Resolve" : action.actionType === "approve_action" ? "Approve" : "Apply"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px]"
                        onClick={() => router.push("/chat")}
                      >
                        Investigate
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricNavigator() {
  const effects = useActionEffects();
  const heroMetrics = effects.getAdjustedHeroMetrics();
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const criticalIdx = heroMetrics.findIndex(
      (m) => m.status === "critical"
    );
    return criticalIdx >= 0 ? criticalIdx : 0;
  });

  const [signalSheetOpen, setSignalSheetOpen] = useState(false);
  const metric = heroMetrics[selectedIndex];
  const status = STATUS_META[metric.status];
  const sparkColor = SPARKLINE_COLORS[metric.status];
  const actions = METRIC_ACTIONS[metric.id] ?? [];
  const signal = CONTROL_TOWER_JOURNEY_SIGNALS.find((s) => s.metricId === metric.id);

  return (
    <div className="space-y-0">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-stone-200 overflow-x-auto">
        {heroMetrics.map((m, i) => {
          const isActive = i === selectedIndex;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
                isActive
                  ? "border-[#3d3c3c] text-[#3d3c3c]"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              )}
            >
              {METRIC_SHORT_LABELS[m.id] ?? m.label}
            </button>
          );
        })}
      </div>

      {/* Selected metric panel */}
      <div className="rounded-none bg-stone-50">
        <div className="flex flex-col md:flex-row">
          {/* Left sidebar */}
          <div className="flex flex-col gap-4 border-b border-stone-100 px-5 py-5 md:w-48 md:border-b-0 md:border-r">
            <Badge
              variant="outline"
              className={cn("w-fit text-[11px]", status.badge)}
            >
              {status.label}
            </Badge>
            <div className="space-y-2">
              {actions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="block text-[12px] font-medium text-stone-500 transition-colors hover:text-[#3d3c3c]"
                >
                  {a.label} →
                </Link>
              ))}
              {signal && (
                <button
                  onClick={() => setSignalSheetOpen(true)}
                  className="mt-2 flex flex-col items-start gap-1 text-left"
                >
                  <Badge
                    variant="outline"
                    className={cn("text-[9px] shrink-0", signal.badgeColor)}
                  >
                    {signal.badgeLabel}
                  </Badge>
                  <span className="text-[11px] font-medium text-stone-500 hover:text-[#3d3c3c] transition-colors">
                    {signal.sidebarLabel} →
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right content */}
          <div className="flex flex-1 flex-col justify-center px-6 py-5">
            <p className="text-[48px] font-semibold leading-none tracking-tight text-[#3d3c3c]">
              {metric.value}
            </p>
            <p className="mt-2 text-sm font-medium text-[#3d3c3c]">
              {metric.label}
            </p>
            <div className="mt-3 max-w-md">
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart
                  data={metric.sparkline.map((value, index) => ({
                    index,
                    value,
                  }))}
                  margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id={`nav-spark-${metric.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={sparkColor}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor={sparkColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sparkColor}
                    strokeWidth={2}
                    fill={`url(#nav-spark-${metric.id})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[12px] text-stone-500">{metric.detail}</p>

            {/* Next Best Actions */}
            <TabNBASection metricId={metric.id} />

            {/* Journey signal insight card */}
            {signal && (
              <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4" style={{ borderLeft: `3px solid ${sparkColor}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge
                        variant="outline"
                        className={cn("text-[9px]", signal.badgeColor)}
                      >
                        {signal.badgeLabel}
                      </Badge>
                      <span className="text-[10px] text-stone-400">{signal.timestamp}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-[#3d3c3c]">
                      {signal.title}
                    </p>
                    <p className="mt-1 text-[11px] text-stone-500 leading-relaxed">
                      {signal.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-stone-400">
                      <span>{signal.customerName} · {signal.customerRole}</span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-500">{signal.channel}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-[11px] h-7"
                    onClick={() => setSignalSheetOpen(true)}
                  >
                    Investigate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Journey Signal Drill-down Sheet */}
      {signal && (
        <JourneySignalSheet
          signal={signal}
          open={signalSheetOpen}
          onOpenChange={setSignalSheetOpen}
        />
      )}
    </div>
  );
}

function JourneySignalSheet({
  signal,
  open,
  onOpenChange,
}: {
  signal: ControlTowerJourneySignal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const effects = useActionEffects();
  const router = useRouter();
  const [sheetExecuted, setSheetExecuted] = useState<Record<string, boolean>>({});

  // Map signal's metricId to get related NBA actions
  const relatedNBAs = (TAB_NBA_ACTIONS[signal.metricId] ?? []).slice(0, 2);

  const executeSheetAction = useCallback(
    (action: TabNBAAction) => {
      switch (action.actionType) {
        case "resolve_alert":
          effects.resolveAlert(action.actionPayload.id, (action.actionPayload.type as "approved") ?? "approved");
          break;
        case "approve_action":
          effects.approveAction(action.actionPayload.id, (action.actionPayload.type as "approved") ?? "approved");
          break;
        case "apply_recommendation":
          effects.applyRecommendation(action.actionPayload.id);
          break;
        case "activate_redirect":
          effects.activateReachRedirect();
          break;
        case "submit_reorder":
          effects.submitDemandReorder();
          break;
        case "apply_campaign":
          effects.applyCampaign();
          break;
      }
      setSheetExecuted((prev) => ({ ...prev, [action.id]: true }));
      toast.success(action.title, { description: `Impact: ${action.impact}` });
    },
    [effects]
  );

  const isSheetActionDone = useCallback(
    (action: TabNBAAction) => {
      if (sheetExecuted[action.id]) return true;
      if (action.actionType === "resolve_alert") return !!effects.resolvedAlerts[action.actionPayload.id];
      if (action.actionType === "approve_action") return !!effects.approvedActions[action.actionPayload.id];
      if (action.actionType === "apply_recommendation") return !!effects.appliedRecommendations[action.actionPayload.id];
      if (action.actionType === "activate_redirect") return effects.reachRedirectActive;
      if (action.actionType === "submit_reorder") return effects.demandReorderSubmitted;
      if (action.actionType === "apply_campaign") return effects.campaignApplied;
      return false;
    },
    [effects, sheetExecuted]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn("text-[10px]", signal.badgeColor)}
            >
              {signal.badgeLabel}
            </Badge>
            <span className="text-[11px] text-stone-400">{signal.channel}</span>
          </div>
          <DialogTitle className="text-[16px] font-semibold text-[#3d3c3c]">
            {signal.title}
          </DialogTitle>
          <p className="text-[12px] text-stone-500">
            {signal.customerName} · {signal.customerRole}
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Impact */}
          <div className="rounded-lg border border-stone-100 bg-stone-50/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">Business Impact</p>
            <p className="text-[12px] text-[#3d3c3c] leading-relaxed">{signal.impact}</p>
          </div>

          {/* Narrative */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Customer Story</p>
            <p className="text-[12px] text-stone-600 leading-relaxed">
              {signal.drilldown.narrative}
            </p>
          </div>

          {/* NDC / IVA / Omni-channel Explainer */}
          {signal.drilldown.ndcExplainer && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-1">Technology Context</p>
              <p className="text-[12px] text-stone-600 leading-relaxed">
                {signal.drilldown.ndcExplainer}
              </p>
            </div>
          )}

          {/* Journey Timeline */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Journey Steps</p>
            <div className="space-y-0">
              {signal.drilldown.journeySteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[10px] font-semibold text-stone-600">
                      {i + 1}
                    </div>
                    {i < signal.drilldown.journeySteps.length - 1 && (
                      <div className="mt-1 h-4 w-px bg-stone-200" />
                    )}
                  </div>
                  <p className="text-[12px] text-stone-600 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Recommended Actions</p>
            <div className="space-y-2">
              {signal.drilldown.nextSteps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-stone-100 bg-white p-2.5"
                >
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-stone-400" />
                  <p className="text-[12px] text-stone-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Take Action section */}
          {relatedNBAs.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#29707a] mb-2">Take Action</p>
              <div className="space-y-2">
                {relatedNBAs.map((action) => {
                  const done = isSheetActionDone(action);
                  return (
                    <div
                      key={action.id}
                      className={cn(
                        "rounded-lg border p-3 transition-all",
                        done ? "border-emerald-200 bg-emerald-50/50" : "border-[#29707a]/20 bg-[#29707a]/5"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[12px] font-semibold text-[#3d3c3c]">{action.title}</p>
                        <Badge variant="outline" className="text-[9px] shrink-0 border-[#29707a]/30 bg-[#29707a]/10 text-[#29707a]">
                          {action.impact}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-stone-500 mb-2">{action.description}</p>
                      {done ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                          <Check className="h-3 w-3 mr-1" /> Completed
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="h-7 text-[11px] bg-[#29707a] hover:bg-[#1e5960] text-white"
                            onClick={() => executeSheetAction(action)}
                          >
                            {action.actionType === "resolve_alert" ? "Resolve" : action.actionType === "approve_action" ? "Approve" : "Apply"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px]"
                            onClick={() => { onOpenChange(false); router.push("/chat"); }}
                          >
                            Investigate in Chat
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WidgetRows({ widget }: { widget: ControlTowerWidget }) {
  if (widget.kind === "table" && widget.tableColumns && widget.tableRows) {
    const tableColumns = widget.tableColumns;
    const tableRows = widget.tableRows;

    return (
      <div className="overflow-hidden rounded-xl border border-stone-100 bg-white">
        <div className="grid grid-cols-[2.1fr_0.9fr_1fr_0.75fr_0.8fr] border-b border-stone-100 bg-stone-50/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {tableColumns.map((column) => (
            <div
              key={column.key}
              className={cn(column.align === "right" && "text-right")}
            >
              {column.label}
            </div>
          ))}
        </div>
        <div className="divide-y divide-stone-100">
          {tableRows.map((row) => {
            const status = row.status ? STATUS_META[row.status] : null;
            return (
              <div
                key={row.id}
                className="grid grid-cols-[2.1fr_0.9fr_1fr_0.75fr_0.8fr] items-center gap-3 px-3 py-2.5 text-[11px] text-stone-600"
              >
                {tableColumns.map((column) => (
                  <div
                    key={`${row.id}-${column.key}`}
                    className={cn(
                      "truncate",
                      column.align === "right" && "text-right",
                      column.key === "item" && "font-semibold text-[#3d3c3c]",
                    )}
                  >
                    {column.key === "status" && status ? (
                      <Badge variant="outline" className={cn("text-[9px]", status.badge)}>
                        {row.statusLabel ?? row.values[column.key]}
                      </Badge>
                    ) : (
                      row.values[column.key]
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (widget.kind === "scorecard_list" && widget.scoreRows) {
    return (
      <div className="rounded-xl border border-stone-100 bg-white p-3">
        <div className="space-y-3">
          {widget.scoreRows.map((row) => {
            const status = STATUS_META[row.status];
            const barColor =
              row.status === "critical"
                ? "bg-rose-500"
                : row.status === "attention"
                  ? "bg-amber-500"
                  : "bg-emerald-500";
            const barTextColor =
              row.status === "critical"
                ? "text-rose-700"
                : row.status === "attention"
                  ? "text-amber-700"
                  : "text-emerald-700";
            return (
              <div
                key={`${widget.id}-${row.label}`}
                className="grid grid-cols-[1.25fr_1.75fr] items-center gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#3d3c3c]">
                    {row.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-stone-500">{row.meta}</p>
                </div>
                <div className="relative h-7 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={cn("absolute inset-y-0 left-0 rounded-full", barColor)}
                    style={{ width: `${row.score}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-2.5">
                    <span className={cn("text-[10px] font-bold", row.score > 15 ? "text-white" : barTextColor)}>
                      {row.score}
                    </span>
                    <Badge variant="outline" className={cn("h-4 text-[8px] leading-none border-0 bg-white/80 backdrop-blur-sm", status.badge)}>
                      {row.statusLabel ?? status.label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (widget.kind === "capacity_bars" && widget.capacityRows) {
    return (
      <div className="space-y-3 rounded-xl border border-stone-100 bg-white px-4 py-3">
        {widget.capacityRows.map((row) => {
          const usedColor =
            row.status === "critical"
              ? "bg-rose-400"
              : row.status === "attention"
                ? "bg-amber-400"
                : "bg-emerald-400";

          return (
            <div key={`${widget.id}-${row.label}`} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#3d3c3c]">{row.label}</p>
                  <p className="text-[10px] text-stone-500">{row.meta}</p>
                </div>
                <p className="text-[11px] font-semibold text-stone-700">{row.usedPercent}% utilised</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className={cn("h-full rounded-full", usedColor)}
                  style={{ width: `${row.usedPercent}%` }}
                />
              </div>
              {row.totalLabel ? (
                <p className="text-[10px] text-stone-400">{row.totalLabel}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  if (widget.kind === "dual_line_trend" && widget.trendPoints) {
    return (
      <div className="h-44 rounded-xl border border-stone-100 bg-stone-50/60 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={widget.trendPoints}
            margin={{ top: 6, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="secondary"
              stroke="#94a3b8"
              strokeWidth={1.75}
              dot={false}
              strokeDasharray="4 4"
              name={widget.trendLegend?.secondaryLabel ?? "Baseline"}
            />
            <Line
              type="monotone"
              dataKey="primary"
              stroke="#1f2937"
              strokeWidth={2.4}
              dot={false}
              name={widget.trendLegend?.primaryLabel ?? "Current"}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (widget.kind === "single_line_trend" && widget.trendPoints) {
    return (
      <div className="h-40 rounded-xl border border-stone-100 bg-stone-50/60 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={widget.trendPoints} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="primary" stroke="#0f766e" strokeWidth={2.2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (widget.kind === "timeline_gantt" && widget.timelineRows) {
    return (
      <div className="rounded-xl border border-stone-100 bg-white p-3">
        <div className="relative">
          <div className="mb-2 flex justify-end pr-10 text-[10px] font-medium text-stone-400">
            <span>Today</span>
          </div>
          <div className="absolute right-[22%] top-4 bottom-2 w-px bg-stone-300" />
          <div className="space-y-3">
            {widget.timelineRows.map((row) => {
              const tone =
                row.status === "critical"
                  ? "bg-rose-300"
                  : row.status === "attention"
                    ? "bg-amber-300"
                    : "bg-emerald-300";

              return (
                <div key={`${widget.id}-${row.label}`} className="grid grid-cols-[1.25fr_1.75fr] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#3d3c3c]">{row.label}</p>
                    <p className="truncate text-[10px] text-stone-500">{row.meta}</p>
                  </div>
                  <div className="relative h-7 rounded-full bg-stone-100">
                    <div
                      className={cn("absolute top-1/2 h-3 -translate-y-1/2 rounded-full", tone)}
                      style={{ left: `${row.offset}%`, width: `${row.span}%` }}
                    />
                    {row.rightLabel ? (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-stone-500">
                        {row.rightLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (
    (widget.kind === "donut_breakdown" || widget.kind === "horizontal_bar_breakdown") &&
    widget.breakdownSegments
  ) {
    return (
      <div className="rounded-xl border border-stone-100 bg-white p-3">
        <div className="hidden gap-4 md:grid md:grid-cols-[180px_1fr] md:items-center">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={widget.breakdownSegments}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={42}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {widget.breakdownSegments.map((segment) => (
                    <Cell key={segment.label} fill={segment.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {widget.breakdownSegments.map((segment) => (
              <div key={`${widget.id}-${segment.label}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-xs text-stone-700">{segment.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#3d3c3c]">{segment.meta ?? `${segment.value}%`}</p>
                  <p className="text-[10px] text-stone-400">{segment.value}% mix</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 md:hidden">
          {widget.breakdownSegments.map((segment) => (
            <div key={`${widget.id}-fallback-${segment.label}`} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[#3d3c3c]">{segment.label}</p>
                <p className="text-[11px] text-stone-500">{segment.meta ?? `${segment.value}%`}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${segment.value}%`, backgroundColor: segment.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!widget.rows) {
    return null;
  }

  return (
    <div className="space-y-2">
      {widget.rows.map((row) => {
        const status = row.status ? STATUS_META[row.status] : null;

        return (
          <div
            key={`${widget.id}-${row.label}`}
            className="rounded-xl border border-stone-100 bg-white px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#3d3c3c]">
                  {row.label}
                </p>
                {row.meta ? (
                  <p className="mt-0.5 text-[10px] text-stone-500">{row.meta}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {row.value ? (
                  <span className="text-[11px] font-semibold text-[#3d3c3c]">
                    {row.value}
                  </span>
                ) : null}
                {status ? (
                  <Badge variant="outline" className={cn("text-[9px]", status.badge)}>
                    {status.label}
                  </Badge>
                ) : null}
              </div>
            </div>
            {typeof row.progress === "number" ? (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div
                  className={cn(
                    "h-full rounded-full",
                    row.status === "critical"
                      ? "bg-rose-500"
                      : row.status === "attention"
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${row.progress}%` }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function OperationsPanel({
  widget,
  expanded,
  onToggle,
}: {
  widget: ControlTowerWidget;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta =
    DOMAIN_META[widget.domain as Exclude<ControlTowerDomain, "risk">] ??
    DOMAIN_META.udp;
  const Icon = meta.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-stone-50/70"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className={cn("rounded-xl p-2", meta.soft)}>
            <Icon className={cn("h-4 w-4", meta.accent)} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#3d3c3c]">{widget.title}</p>
            <p className="mt-0.5 text-[11px] text-stone-500">{widget.subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[11px] font-medium text-stone-500 md:inline">
            {widget.routeLabel}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-stone-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-stone-500" />
          )}
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-stone-200 bg-stone-50/50 px-4 py-4">
          {widget.summary ? (
            <div className="mb-3 rounded-xl border border-stone-100 bg-white px-3 py-2 text-[11px] text-stone-600">
              {widget.summary}
            </div>
          ) : null}
          <WidgetRows widget={widget} />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[0.16em] text-stone-400">
              Curated business view
            </span>
            <Link
              href={widget.routeHref}
              className="text-[11px] font-medium text-stone-600 hover:text-stone-700"
            >
              {widget.routeLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActionBoard({
  actions,
  onAction,
  onCreateGraph,
  highlightedIds = new Set<string>(),
}: {
  actions: ControlTowerAction[];
  onAction: (actionId: string, nextState: ControlTowerActionState) => void;
  onCreateGraph: (prefill: GraphInstancePrefill) => void;
  highlightedIds?: Set<string>;
}) {
  const visibleActions = [...actions]
    .sort((left, right) => {
      if (left.state === right.state) {
        return SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity];
      }
      if (left.state === "pending") return -1;
      if (right.state === "pending") return 1;
      return 0;
    })
    .slice(0, 5);

  const pendingCount = actions.filter((action) => action.state === "pending").length;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Open Actions & Approvals
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Review and approve the business decisions shaping customer reach, campaign performance, and demand coverage.
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-[10px]">
            {pendingCount} pending
          </Badge>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {visibleActions.map((action) => {
          const meta =
            DOMAIN_META[action.domain as Exclude<ControlTowerDomain, "risk">] ??
            DOMAIN_META.udp;
          const stateMeta = ACTION_STATE_META[action.state];
          const severity = SEVERITY_META[action.severity];

          const isHighlighted = highlightedIds.has(action.id);

          return (
            <div
              id={`action-card-${action.id}`}
              key={action.id}
              className={cn(
                "rounded-2xl border border-stone-200 bg-stone-50/40 px-4 py-3 transition-all duration-500 border-l-4",
                isHighlighted
                  ? action.severity === "critical"
                      ? "border-l-[#ff462d]"
                      : action.severity === "high"
                          ? "border-l-[#f59e0b]"
                          : "border-l-stone-400"
                  : "border-l-stone-200",
              )}
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-[0.16em]",
                        meta.accent,
                      )}
                    >
                      {meta.label}
                    </span>
                    <Badge variant="outline" className={cn("text-[9px]", severity.badge)}>
                      {severity.label}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[9px]", stateMeta.className)}>
                      {stateMeta.label}
                    </Badge>
                    <span className="text-[10px] text-stone-400">{action.dueLabel}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#3d3c3c]">{action.title}</p>
                  <p className="mt-1 text-[11px] leading-snug text-stone-600">
                    {action.summary}
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-stone-700">
                    {action.impact}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 rounded-full bg-teal-700 px-3 text-[11px] hover:bg-teal-800"
                    onClick={() =>
                      onAction(
                        action.id,
                        action.primaryAction.type === "dismiss"
                          ? "dismissed"
                          : action.primaryAction.type === "review"
                            ? "in_review"
                            : "approved",
                      )
                    }
                  >
                    {action.primaryAction.label}
                  </Button>
                  {action.secondaryAction ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full px-3 text-[11px]"
                      onClick={() => {
                        const nextState =
                          action.secondaryAction?.type === "dismiss"
                            ? "dismissed"
                            : "in_review";
                        onAction(action.id, nextState);
                      }}
                    >
                      {action.secondaryAction.label}
                    </Button>
                  ) : null}
                  <Link
                    href={action.routeHref}
                    className="inline-flex h-8 items-center rounded-full border border-stone-200 px-3 text-[11px] font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-700"
                  >
                    {action.routeLabel}
                  </Link>
                  {action.experimentHref ? (
                    <Link
                      href={action.experimentHref}
                      className="inline-flex h-8 items-center rounded-full border border-violet-200 bg-violet-50 px-3 text-[11px] font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-100"
                    >
                      Open experiment
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onCreateGraph(buildActionGraphPrefill(action))}
                    className="inline-flex h-8 items-center rounded-full border border-stone-200 px-3 text-[11px] font-medium text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
                  >
                    Save graph
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function DecisionItemCard({
  item,
  decision,
  expanded,
  suggestedSelection,
  customCondition,
  onApprove,
  onReject,
  onExpand,
  onSuggestedSelection,
  onCustomChange,
  onApplyCondition,
}: {
  item: ControlTowerDecisionItem;
  decision: ItemDecisionState;
  expanded: boolean;
  suggestedSelection: string;
  customCondition: string;
  onApprove: () => void;
  onReject: () => void;
  onExpand: () => void;
  onSuggestedSelection: (value: string) => void;
  onCustomChange: (value: string) => void;
  onApplyCondition: () => void;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {item.supportingLabel ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-700">
              {item.supportingLabel}
            </p>
          ) : null}
          <p className="mt-1 text-sm font-semibold text-[#3d3c3c]">{item.title}</p>
          <p className="mt-0.5 text-[11px] text-stone-500">{item.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {decision.state === "approved" ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[9px] text-emerald-700">
              Approved
            </Badge>
          ) : null}
          {decision.state === "rejected" ? (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-[9px] text-rose-700">
              Rejected
            </Badge>
          ) : null}
          {decision.state === "conditional" ? (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[9px] text-amber-700">
              Conditional
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-[11px] text-stone-600 sm:grid-cols-4">
        {item.stock ? <p><span className="font-medium text-stone-500">Stock:</span> {item.stock}</p> : null}
        {item.actionAmount ? <p><span className="font-medium text-stone-500">Action:</span> {item.actionAmount}</p> : null}
        {item.unitCost ? <p><span className="font-medium text-stone-500">Unit cost:</span> {item.unitCost}</p> : null}
        {item.totalCost ? <p><span className="font-medium text-stone-500">Total:</span> {item.totalCost}</p> : null}
      </div>

      <p className="mt-3 text-sm text-stone-600">{item.detail}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          className="h-8 rounded-full bg-teal-700 px-3 text-[11px] hover:bg-teal-800"
          onClick={onApprove}
        >
          <Check className="mr-1 h-3 w-3" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-full px-3 text-[11px]"
          onClick={onExpand}
        >
          Set conditions
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 rounded-full px-3 text-[11px] text-stone-600 hover:text-stone-700"
          onClick={onReject}
        >
          Reject
        </Button>
      </div>

      {expanded ? (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Suggested conditions
          </p>
          <div className="mt-2 space-y-2">
            {(item.suggestedConditions ?? []).map((condition) => (
              <button
                key={condition}
                type="button"
                onClick={() => onSuggestedSelection(condition)}
                className={cn(
                  "block w-full rounded-xl border px-3 py-2 text-left text-[11px] transition",
                  suggestedSelection === condition
                    ? "border-teal-300 bg-teal-50 text-teal-800"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300",
                )}
              >
                {condition}
              </button>
            ))}
          </div>
          <input
            value={customCondition}
            onChange={(event) => onCustomChange(event.target.value)}
            placeholder="Or type a custom condition..."
            className="mt-3 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none ring-0 placeholder:text-stone-400 focus:border-teal-300"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="rounded-full bg-teal-700 px-3 text-[11px] hover:bg-teal-800"
              onClick={onApplyCondition}
            >
              Apply condition
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full px-3 text-[11px]"
              onClick={() => {
                onSuggestedSelection("");
                onCustomChange("");
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AgentFlowCards({ cards }: { cards: ControlTowerAgentFlowCard[] }) {
  const toneStyles = {
    amber: "border-amber-200 bg-amber-50/70",
    blue: "border-sky-200 bg-sky-50/70",
    violet: "border-violet-200 bg-violet-50/70",
    emerald: "border-emerald-200 bg-emerald-50/70",
    stone: "border-stone-200 bg-stone-50/70",
  } as const;

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.id}
          className={cn("rounded-2xl border p-3", toneStyles[card.tone])}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#3d3c3c]">{card.title}</p>
              <p className="mt-0.5 text-[10px] text-stone-500">{card.subtitle}</p>
            </div>
            <Badge variant="outline" className="text-[9px]">
              {card.priority}
            </Badge>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-stone-600">{card.summary}</p>
          <div className="mt-3 grid gap-2 text-[10px] text-stone-500">
            <p><span className="font-medium text-stone-600">Output:</span> {card.output}</p>
            <p><span className="font-medium text-stone-600">Processing:</span> {card.processingTime}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertDecisionDialog({
  alert,
  open,
  onOpenChange,
  onCreateGraph,
  onSubmitted,
}: {
  alert: ControlTowerAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGraph: (prefill: GraphInstancePrefill) => void;
  onSubmitted: (state: ControlTowerActionState) => void;
}) {
  const [mode, setMode] = useState<"review" | "submitted">("review");
  const [submittedTab, setSubmittedTab] = useState<"summary" | "audit">("summary");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [suggestedSelections, setSuggestedSelections] = useState<Record<string, string>>({});
  const [customConditions, setCustomConditions] = useState<Record<string, string>>({});
  const [itemDecisions, setItemDecisions] = useState<Record<string, ItemDecisionState>>({});

  useEffect(() => {
    if (!open || !alert) {
      setMode("review");
      setSubmittedTab("summary");
      setExpandedItemId(null);
      setSuggestedSelections({});
      setCustomConditions({});
      setItemDecisions({});
      return;
    }

    setItemDecisions(
      Object.fromEntries(
        alert.drilldown.items.map((item) => [item.id, { state: "pending" } as ItemDecisionState]),
      ),
    );
  }, [alert, open]);

  if (!alert) {
    return null;
  }

  const actedCount = Object.values(itemDecisions).filter(
    (decision) => decision.state !== "pending",
  ).length;

  const computedSubmissionState: ControlTowerActionState =
    Object.values(itemDecisions).some(
      (decision) => decision.state === "approved" || decision.state === "conditional",
    )
      ? "approved"
      : Object.values(itemDecisions).some((decision) => decision.state === "rejected")
        ? "dismissed"
        : "in_review";

  const handleApplyCondition = (itemId: string) => {
    const condition =
      customConditions[itemId]?.trim() || suggestedSelections[itemId]?.trim();

    if (!condition) {
      return;
    }

    setItemDecisions((current) => ({
      ...current,
      [itemId]: { state: "conditional", condition },
    }));
    setExpandedItemId(null);
  };

  const summaryItems =
    alert.drilldown.decisionSummary?.items.map((item) => ({
      id: item.id,
      title: item.title,
      outcome: item.outcome,
      detail: item.detail,
      metric: item.metric,
    })) ??
    alert.drilldown.items.map((item) => ({
      id: item.id,
      title: item.title,
      outcome: item.metric,
      detail: item.detail,
      metric: item.metric,
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-stone-200 p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-stone-200 bg-teal-700 px-6 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                {alert.drilldown.title}
              </DialogTitle>
              <p className="mt-1 text-sm text-white/80">{alert.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {mode === "review" ? (
            <>
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Overview
                  </p>
                  <Badge
                    variant="outline"
                    className={cn("text-[9px]", SEVERITY_META[alert.severity].badge)}
                  >
                    {SEVERITY_META[alert.severity].label}
                  </Badge>
                </div>
                <ul className="mt-3 space-y-2">
                  {alert.drilldown.summary.map((line) => (
                    <li key={line} className="flex gap-2 text-sm text-stone-700">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-stone-400" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Items requiring attention
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Approve, set conditions, or reject each item below.
                </p>
              </div>

              <div className="space-y-3">
                {alert.drilldown.items.map((item) => (
                  <DecisionItemCard
                    key={item.id}
                    item={item}
                    decision={itemDecisions[item.id] ?? { state: "pending" }}
                    expanded={expandedItemId === item.id}
                    suggestedSelection={suggestedSelections[item.id] ?? ""}
                    customCondition={customConditions[item.id] ?? ""}
                    onApprove={() =>
                      setItemDecisions((current) => ({
                        ...current,
                        [item.id]: { state: "approved" },
                      }))
                    }
                    onReject={() =>
                      setItemDecisions((current) => ({
                        ...current,
                        [item.id]: { state: "rejected" },
                      }))
                    }
                    onExpand={() =>
                      setExpandedItemId((current) => (current === item.id ? null : item.id))
                    }
                    onSuggestedSelection={(value) =>
                      setSuggestedSelections((current) => ({
                        ...current,
                        [item.id]: value,
                      }))
                    }
                    onCustomChange={(value) =>
                      setCustomConditions((current) => ({
                        ...current,
                        [item.id]: value,
                      }))
                    }
                    onApplyCondition={() => handleApplyCondition(item.id)}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-stone-500">
                  {actedCount} of {alert.drilldown.items.length} items actioned
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {alert.graphPreset || alert.graphScopeId || alert.graphCenterNodeId ? (
                    <Link
                      href={buildKnowledgeGraphHref({
                        graphPreset: alert.graphPreset,
                        graphScopeId: alert.graphScopeId,
                        graphCenterNodeId: alert.graphCenterNodeId,
                      })}
                      className="inline-flex h-9 items-center rounded-full border border-stone-200 px-3 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-700"
                    >
                      Explore graph
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onCreateGraph(buildAlertGraphPrefill(alert))}
                    className="inline-flex h-9 items-center rounded-full border border-stone-200 px-3 text-sm font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-700"
                  >
                    Save graph
                  </button>
                  <Button
                    className="rounded-full bg-teal-700 hover:bg-teal-800"
                    disabled={actedCount === 0}
                    onClick={() => {
                      onSubmitted(computedSubmissionState);
                      setMode("submitted");
                      setSubmittedTab("summary");
                    }}
                  >
                    Confirm & submit
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-[#3d3c3c]">
                      {alert.drilldown.decisionSummary?.headline ?? "Decisions submitted"}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      Logged at{" "}
                      {alert.drilldown.decisionSummary?.loggedAt ?? alert.timestamp} · Ref:{" "}
                      {alert.drilldown.decisionSummary?.reference ?? alert.id.toUpperCase()}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Submitted
                  </Badge>
                </div>

                <div className="mt-4 flex gap-3 border-b border-stone-200">
                  {[
                    { id: "summary" as const, label: "Decision Summary" },
                    { id: "audit" as const, label: "Audit Trail & Agent Flow" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSubmittedTab(tab.id)}
                      className={cn(
                        "border-b-2 pb-2 text-sm font-medium transition",
                        submittedTab === tab.id
                          ? "border-stone-700 text-[#3d3c3c]"
                          : "border-transparent text-stone-500 hover:text-stone-700",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {submittedTab === "summary" ? (
                  <div className="space-y-3 pt-4">
                    {summaryItems.map((item) => {
                      const currentDecision = itemDecisions[item.id.replace("summary-", "")];
                      const resolvedOutcome =
                        currentDecision?.state === "approved"
                          ? "Approved"
                          : currentDecision?.state === "rejected"
                            ? "Rejected"
                            : currentDecision?.state === "conditional"
                              ? "Conditional approval"
                              : item.outcome;
                      const resolvedDetail =
                        currentDecision?.state === "conditional"
                          ? currentDecision.condition
                          : currentDecision?.state === "approved"
                            ? "Approved in the control tower."
                            : currentDecision?.state === "rejected"
                              ? "Rejected in the control tower."
                              : item.detail;

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-stone-200 bg-white px-4 py-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-[#3d3c3c]">
                                {item.title}
                              </p>
                              <p className="mt-1 text-[11px] text-stone-500">
                                {resolvedOutcome}
                              </p>
                            </div>
                            {item.metric ? (
                              <span className="text-[11px] font-medium text-stone-600">
                                {item.metric}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-stone-600">{resolvedDetail}</p>
                        </div>
                      );
                    })}

                    {alert.drilldown.nextSteps?.length ? (
                      <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                          What happens next
                        </p>
                        <ul className="mt-3 space-y-2">
                          {alert.drilldown.nextSteps.map((step) => (
                            <li key={step} className="flex gap-2 text-sm text-stone-600">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
                      {alert.drilldown.auditTrail.map((event) => (
                        <div key={`${event.time}-${event.actor}`} className="flex gap-3">
                          <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-stone-400" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] text-stone-400">{event.time}</span>
                              {event.badge ? (
                                <Badge variant="outline" className="text-[9px]">
                                  {event.badge}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-stone-700">{event.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {alert.drilldown.agentFlow?.length ? (
                      <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                            Agent flow
                          </p>
                          <Badge variant="outline" className="text-[9px]">
                            Demonstrative
                          </Badge>
                        </div>
                        <AgentFlowCards cards={alert.drilldown.agentFlow} />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  className="rounded-full bg-stone-700 hover:bg-stone-950"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Custom Widget System ─────────────────────────────────────────────────── */

type CustomWidgetId =
  | "revenue-trend"
  | "channel-mix"
  | "conversion-funnel"
  | "top-products"
  | "market-overview"
  | "sell-through"
  | "channel-roas"
  | "at-risk-skus";

type WidgetCatalogEntry = {
  id: CustomWidgetId;
  label: string;
  description: string;
  icon: React.ElementType;
  category: "Performance" | "Commercial" | "Inventory";
};

const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  { id: "revenue-trend", label: "Revenue Trend", description: "Daily revenue and orders over the past 14 days", icon: LineChartIcon, category: "Performance" },
  { id: "channel-mix", label: "Channel Mix", description: "Revenue breakdown by acquisition channel", icon: PieChart, category: "Performance" },
  { id: "conversion-funnel", label: "Conversion Funnel", description: "Sessions → Add to Cart → Checkout → Purchase", icon: Target, category: "Performance" },
  { id: "top-products", label: "Top Products", description: "Best-selling products by revenue", icon: ShoppingCart, category: "Inventory" },
  { id: "market-overview", label: "Market Overview", description: "Spend changes and potential by market", icon: Globe, category: "Commercial" },
  { id: "sell-through", label: "Product Sell-Through", description: "Predicted sell-through rates with risk flags", icon: Activity, category: "Inventory" },
  { id: "channel-roas", label: "Channel ROAS", description: "Incrementality ROAS comparison across models", icon: BarChart2, category: "Commercial" },
  { id: "at-risk-skus", label: "At-Risk SKUs", description: "Products with low stock days remaining", icon: AlertTriangle, category: "Inventory" },
];

function CustomWidgetRenderer({ widgetId, onRemove }: { widgetId: CustomWidgetId; onRemove: () => void }) {
  const entry = WIDGET_CATALOG.find((w) => w.id === widgetId);
  if (!entry) return null;

  return (
    <Card className="border border-stone-200 bg-white shadow-none rounded-2xl relative group">
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-1 hover:bg-stone-100"
        title="Remove widget"
      >
        <X className="h-3.5 w-3.5 text-stone-400" />
      </button>
      <CardContent className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-3">{entry.label}</p>
        <CustomWidgetContent widgetId={widgetId} />
      </CardContent>
    </Card>
  );
}

function CustomWidgetContent({ widgetId }: { widgetId: CustomWidgetId }) {
  switch (widgetId) {
    case "revenue-trend":
      return (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={ecommerceDashboardData.dailyPerformance} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cw-rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={visualizationPalette.teal} stopOpacity={0.2} />
                <stop offset="100%" stopColor={visualizationPalette.teal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...visualizationGrid} vertical={false} />
            <XAxis dataKey="day" tick={visualizationSmallTick} tickLine={false} axisLine={false} />
            <YAxis tick={visualizationSmallTick} tickLine={false} axisLine={false} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={visualizationTooltipStyle} formatter={(v: number) => [`£${v.toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke={visualizationPalette.teal} strokeWidth={2} fill="url(#cw-rev)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      );

    case "channel-mix": {
      const COLORS = [visualizationPalette.teal, visualizationPalette.sky, visualizationPalette.coral, visualizationPalette.sand, visualizationPalette.mint, visualizationPalette.steel];
      const channels = ecommerceDashboardData.channels.filter((c) => c.revenue > 0);
      return (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <RechartsPieChart>
              <Pie data={channels} dataKey="revenue" nameKey="channel" cx="50%" cy="50%" innerRadius={30} outerRadius={55} strokeWidth={1} isAnimationActive={false}>
                {channels.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={visualizationTooltipStyle} formatter={(v: number) => `£${v.toLocaleString()}`} />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 text-[10px]">
            {channels.map((c, i) => (
              <div key={c.channel} className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-stone-600">{c.channel}</span>
                <span className="ml-auto font-medium text-[#3d3c3c]">£{(c.revenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "conversion-funnel":
      return (
        <div className="space-y-2">
          {ecommerceDashboardData.funnel.map((stage, i) => {
            const maxUsers = ecommerceDashboardData.funnel[0].users;
            const pct = (stage.users / maxUsers) * 100;
            return (
              <div key={stage.stage} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-600">{stage.stage}</span>
                  <span className="font-medium text-[#3d3c3c]">{stage.users.toLocaleString()}</span>
                </div>
                <div className="h-4 w-full rounded bg-stone-100">
                  <div className="h-full rounded transition-all" style={{ width: `${pct}%`, backgroundColor: visualizationPalette.teal, opacity: 1 - i * 0.15 }} />
                </div>
              </div>
            );
          })}
        </div>
      );

    case "top-products":
      return (
        <div className="space-y-2">
          {ecommerceDashboardData.topProducts.slice(0, 4).map((p) => (
            <div key={p.sku} className="flex items-center justify-between text-[11px]">
              <div className="min-w-0">
                <p className="font-medium text-[#3d3c3c] truncate">{p.name}</p>
                <p className="text-[10px] text-stone-400">{p.sku} · {p.unitsSold.toLocaleString()} sold</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="font-semibold text-[#3d3c3c]">£{(p.revenue / 1000).toFixed(1)}K</p>
                <Badge variant="outline" className={cn("text-[9px]", p.stockStatus === "Healthy" ? "border-emerald-200 text-emerald-700" : p.stockStatus === "Low" ? "border-amber-200 text-amber-700" : "border-red-200 text-red-700")}>
                  {p.stockStatus}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      );

    case "market-overview":
      return (
        <div className="space-y-2">
          {marketOverview.map((row) => (
            <div key={row.market} className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-[#3d3c3c]">{row.market}</span>
              <div className="flex items-center gap-3">
                <span className={cn("font-medium", row.positive ? "text-emerald-600" : "text-rose-500")}>{row.spendChange}</span>
                <span className="text-stone-500">{row.potential}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case "sell-through":
      return (
        <div className="space-y-2">
          {productSellThrough.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-[11px]">
              <div className="min-w-0">
                <p className="font-medium text-[#3d3c3c] truncate">{p.name}</p>
                <p className="text-[10px] text-stone-400">{p.orderCount} orders</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className={cn("font-semibold", p.risk ? "text-rose-500" : "text-[#3d3c3c]")}>{p.predictedSellThrough}</span>
                {p.risk && <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />}
              </div>
            </div>
          ))}
        </div>
      );

    case "channel-roas":
      return (
        <div className="flex items-end gap-3 h-32">
          {incrementalityComparisonBars.map((item) => {
            const max = Math.max(...incrementalityComparisonBars.map((b) => b.roas));
            const pct = (item.roas / max) * 100;
            return (
              <div key={item.model} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className="text-[10px] font-semibold text-[#3d3c3c] mb-1">{item.roas}x</span>
                <div className="w-full rounded-t" style={{ height: `${pct}%`, backgroundColor: item.highlight ? "#d4f542" : visualizationPalette.ink }} />
                <span className="mt-1.5 text-[9px] text-stone-500 text-center leading-tight">{item.model}</span>
              </div>
            );
          })}
        </div>
      );

    case "at-risk-skus":
      return (
        <div className="space-y-2">
          {atRiskProducts.map((p) => (
            <div key={p.sku} className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2">
              <div>
                <p className="text-[11px] font-medium text-[#3d3c3c]">{p.name}</p>
                <p className="text-[10px] text-stone-400">{p.sku}</p>
              </div>
              <div className="text-right">
                <p className={cn("text-[11px] font-semibold", p.risk === "high" ? "text-red-600" : "text-amber-600")}>{p.daysOfStock} days</p>
                <p className="text-[10px] text-stone-400">{p.sellThroughRate}% sell-through</p>
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

function AddWidgetDialog({
  open,
  onOpenChange,
  activeWidgets,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeWidgets: CustomWidgetId[];
  onAdd: (id: CustomWidgetId) => void;
}) {
  const categories = ["Performance", "Commercial", "Inventory"] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <p className="text-sm text-stone-500">Choose a widget to add to your Control Tower dashboard.</p>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {categories.map((cat) => {
            const items = WIDGET_CATALOG.filter((w) => w.category === cat);
            return (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400 mb-2">{cat}</p>
                <div className="space-y-2">
                  {items.map((widget) => {
                    const isActive = activeWidgets.includes(widget.id);
                    const Icon = widget.icon;
                    return (
                      <button
                        key={widget.id}
                        disabled={isActive}
                        onClick={() => { onAdd(widget.id); onOpenChange(false); }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          isActive
                            ? "border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed"
                            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 cursor-pointer"
                        )}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100">
                          <Icon className="h-4 w-4 text-stone-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#3d3c3c]">{widget.label}</p>
                          <p className="text-[11px] text-stone-500">{widget.description}</p>
                        </div>
                        {isActive ? (
                          <Badge variant="outline" className="text-[10px] border-stone-200 text-stone-400 shrink-0">Added</Badge>
                        ) : (
                          <Plus className="h-4 w-4 text-stone-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── End Custom Widget System ──────────────────────────────────────────── */

function ControlTowerOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const effects = useActionEffects();
  const adjustedSummary = effects.getAdjustedSummary();
  const adjustedHeroMetrics = effects.getAdjustedHeroMetrics();

  const [expandedWidgets, setExpandedWidgets] = useState<Record<string, boolean>>(
    Object.fromEntries(
      CONTROL_TOWER_WIDGETS.map((widget) => [widget.id, widget.defaultExpanded]),
    ),
  );
  const [actions, setActions] = useState(CONTROL_TOWER_ACTIONS);
  const [isGraphDialogOpen, setIsGraphDialogOpen] = useState(false);
  const [highlightedActionIds, setHighlightedActionIds] = useState<Set<string>>(new Set());
  const [customWidgets, setCustomWidgets] = useState<CustomWidgetId[]>([]);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);

  const pendingActions = useMemo(
    () => actions.filter((a) => a.state === "pending"),
    [actions],
  );
  const criticalAlert = adjustedSummary.criticalAlerts > 0 ? CONTROL_TOWER_ALERTS.find((a) => a.severity === "critical" && !effects.resolvedAlerts[a.id]) : undefined;
  const decliningMetric = adjustedHeroMetrics.find(
    (m) =>
      (m.status === "attention" || m.status === "critical") &&
      m.sparkline.length >= 2 &&
      m.sparkline[m.sparkline.length - 1] < m.sparkline[0],
  );
  const [graphPrefill, setGraphPrefill] = useState<GraphInstancePrefill | undefined>(
    undefined,
  );

  const panelWidgets = useMemo(() => {
    const widgetMap = new Map(CONTROL_TOWER_WIDGETS.map((widget) => [widget.id, widget]));
    return {
      left: PANEL_LAYOUT.left
        .map((id) => widgetMap.get(id))
        .filter((widget): widget is ControlTowerWidget => Boolean(widget)),
      right: PANEL_LAYOUT.right
        .map((id) => widgetMap.get(id))
        .filter((widget): widget is ControlTowerWidget => Boolean(widget)),
    };
  }, []);

  const visibleActions = useMemo(
    () => actions.filter((action) => action.state !== "dismissed"),
    [actions],
  );

  if (!user) {
    return null;
  }

  const handleCreateGraph = (prefill?: GraphInstancePrefill) => {
    setGraphPrefill(prefill);
    setIsGraphDialogOpen(true);
  };

  const scrollToActions = (ids: string[]) => {
    const idSet = new Set(ids);
    setHighlightedActionIds(idSet);
    document.getElementById("action-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Scroll the first matching card into view after the board is visible
    setTimeout(() => {
      const first = document.getElementById(`action-card-${ids[0]}`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    // Clear highlight after 3s
    setTimeout(() => setHighlightedActionIds(new Set()), 3000);
  };

  const updateActionState = (
    actionId: string,
    nextState: ControlTowerActionState,
  ) => {
    setActions((current) =>
      current.map((action) =>
        action.id === actionId ? { ...action, state: nextState } : action,
      ),
    );
  };

  return (
    <>
      <div className="space-y-5 pb-44">
        <div className="px-1 py-2">
          {/* Row 1 — Header */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">
              Business Dashboard
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#3d3c3c]">
              UDP Control Tower
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-stone-500">
              A single business-facing dashboard for customer data readiness, campaign activation, demand-informed decisions, and the approvals that connect them.
            </p>
          </div>

          {/* Actions bar */}
          <div className="mt-4 flex items-center border-t border-stone-100 pt-4">
            <Button
              className="rounded-full bg-stone-700 text-white hover:bg-stone-800"
              onClick={() => {
                document.getElementById("action-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Check className="mr-1 h-4 w-4" />
              Review open approvals
              <Badge className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px] text-white">
                {pendingActions.length}
              </Badge>
            </Button>
          </div>

          {/* Needs Attention action strip */}
          <div className="mt-4 flex flex-wrap items-stretch gap-3">
            {criticalAlert && (
              <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-xl border border-[#cc1800]/20 bg-[#cc1800]/5 px-3.5 py-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#cc1800]/10">
                  <AlertCircle className="h-4 w-4 text-[#cc1800]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-[#cc1800]">
                    {adjustedSummary.criticalAlerts} critical alert{adjustedSummary.criticalAlerts !== 1 ? "s" : ""}
                  </p>
                  <p className="truncate text-[11px] text-stone-600">
                    {criticalAlert.title} — {criticalAlert.drilldown?.title ?? "Needs review"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 rounded-full bg-stone-700 text-[11px] text-white hover:bg-stone-800"
                  onClick={() => {
                    const criticalActions = actions.filter((a) => a.severity === "critical" && a.state === "pending");
                    scrollToActions(criticalActions.map((a) => a.id));
                  }}
                >
                  Review now
                </Button>
              </div>
            )}

            {pendingActions.length > 0 && (
              <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-4 w-4 text-amber-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-amber-800">
                    {pendingActions.length} approvals pending
                  </p>
                  <p className="truncate text-[11px] text-stone-600">
                    {pendingActions.filter((a) => a.dueLabel?.includes("4h") || a.dueLabel?.includes("today")).length} due today
                  </p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 rounded-full bg-stone-700 text-[11px] text-white hover:bg-stone-800"
                  onClick={() => {
                    scrollToActions(pendingActions.map((a) => a.id));
                  }}
                >
                  Review approvals
                </Button>
              </div>
            )}

            {decliningMetric && (
              <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100">
                  <TrendingDown className="h-4 w-4 text-stone-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-stone-700">
                    {decliningMetric.label} declining
                  </p>
                  <p className="truncate text-[11px] text-stone-500">
                    {decliningMetric.value} — {decliningMetric.detail}
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="shrink-0 rounded-full text-[11px]"
                >
                  <Link href="/demand/dashboard">Investigate</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <MetricNavigator />

        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              {panelWidgets.left.map((widget) => (
                <OperationsPanel
                  key={widget.id}
                  widget={widget}
                  expanded={expandedWidgets[widget.id]}
                  onToggle={() =>
                    setExpandedWidgets((current) => ({
                      ...current,
                      [widget.id]: !current[widget.id],
                    }))
                  }
                />
              ))}
            </div>
            <div className="space-y-3">
              {panelWidgets.right.map((widget) => (
                <OperationsPanel
                  key={widget.id}
                  widget={widget}
                  expanded={expandedWidgets[widget.id]}
                  onToggle={() =>
                    setExpandedWidgets((current) => ({
                      ...current,
                      [widget.id]: !current[widget.id],
                    }))
                  }
                />
              ))}
            </div>
          </div>

          {/* DEMA-style insight summary widgets */}
          <div className="grid gap-4 xl:grid-cols-2">
            {/* Product & Inventory Pulse */}
            <Link href="/udp/dashboard" className="group">
              <Card className="border border-stone-200 bg-white shadow-none rounded-2xl h-full transition-colors group-hover:border-stone-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">Product &amp; Inventory</p>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-lg font-bold text-[#3d3c3c]">{productReportTotals.currentInventory.toLocaleString()}</p>
                      <p className="text-[10px] text-stone-500">Current inventory (units)</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#3d3c3c]">${(productReportTotals.grossSales / 1000000).toFixed(1)}M</p>
                      <p className="text-[10px] text-stone-500">Gross sales (USD)</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#cc1800]">{atRiskProducts.length}</p>
                      <p className="text-[10px] text-stone-500">At-risk SKUs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* MMM Highlights */}
            <Link href="/mmm" className="group">
              <Card className="border border-stone-200 bg-white shadow-none rounded-2xl h-full transition-colors group-hover:border-stone-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">MMM Highlights</p>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                  </div>
                  <p className="text-lg font-bold text-[#3d3c3c]">+${(missedPotentialData.missedPotential / 1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-stone-500 mb-2">Missed profit potential</p>
                  <p className="text-xs text-stone-600">
                    Top rec: <span className="font-medium">{channelRecommendations[1]?.channel}</span> — {channelRecommendations[1]?.recommendation}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Incrementality Snapshot */}
            <Link href="/udp/incrementality" className="group">
              <Card className="border border-stone-200 bg-white shadow-none rounded-2xl h-full transition-colors group-hover:border-stone-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">Incrementality</p>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-[#3d3c3c] mb-1">{experimentSummary.name}</p>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <p className="text-lg font-bold text-[#3d3c3c]">{experimentSummary.incrementalEpRoas}</p>
                      <p className="text-[10px] text-stone-500">Incremental epROAS</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{experimentSummary.incrementalProfit}</p>
                      <p className="text-[10px] text-stone-500">Incremental profit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Overall Performance Strip */}
            <div className="xl:col-span-1">
              <Card className="border border-stone-200 bg-white shadow-none rounded-2xl h-full">
                <CardContent className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 mb-3">Overall Performance</p>
                  <div className="grid grid-cols-2 gap-3">
                    {performanceHeroKpis.map((kpi) => (
                      <div key={kpi.label}>
                        <p className="text-lg font-bold text-[#3d3c3c]">{kpi.value}</p>
                        <div className="flex items-center gap-1">
                          <span className={cn("text-[10px] font-medium", kpi.positive ? "text-emerald-600" : "text-rose-500")}>
                            {kpi.positive ? "+" : ""}{kpi.delta}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500">{kpi.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Custom widgets added by user */}
          {customWidgets.length > 0 && (
            <div className="grid gap-4 xl:grid-cols-2">
              {customWidgets.map((widgetId) => (
                <CustomWidgetRenderer
                  key={widgetId}
                  widgetId={widgetId}
                  onRemove={() => setCustomWidgets((prev) => prev.filter((id) => id !== widgetId))}
                />
              ))}
            </div>
          )}

          {/* Add widget button */}
          <button
            onClick={() => setAddWidgetOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/40 py-4 text-xs font-medium text-stone-400 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-600"
          >
            <Plus className="h-4 w-4" />
            Add widget
          </button>

          <div id="action-board">
            <ActionBoard
              actions={visibleActions}
              onAction={updateActionState}
              onCreateGraph={handleCreateGraph}
              highlightedIds={highlightedActionIds}
            />
          </div>

        </div>
      </div>

      <GraphInstanceDialog
        open={isGraphDialogOpen}
        onOpenChange={setIsGraphDialogOpen}
        source="control_tower"
        prefill={graphPrefill}
        onCreated={(instance) => {
          setGraphPrefill(undefined);
          router.push(createKnowledgeGraphInstanceHref(instance.id));
        }}
      />

      <AddWidgetDialog
        open={addWidgetOpen}
        onOpenChange={setAddWidgetOpen}
        activeWidgets={customWidgets}
        onAdd={(id) => setCustomWidgets((prev) => [...prev, id])}
      />
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedModule = parseDashboardModule(searchParams.get("module"));
  const requestedView = parseDashboardView(searchParams.get("view"));

  const allowedModules = useMemo(
    () => (user ? getAllowedDashboardModules(user.role) : []),
    [user],
  );

  const activeModule =
    requestedModule && allowedModules.some((module) => module.id === requestedModule)
      ? requestedModule
      : null;
  const allowedViews = useMemo(
    () => (user && activeModule ? getAllowedDashboardViews(user.role, activeModule) : []),
    [user, activeModule],
  );
  const activeView =
    requestedView && allowedViews.some((view) => view.id === requestedView)
      ? requestedView
      : allowedViews[0]?.id ?? null;

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!requestedModule) {
      const defaultModule = getDefaultDashboardModuleForRole(user.role);
      if (defaultModule) {
        const defaultView = getDashboardModuleConfig(defaultModule).defaultView;
        router.replace(buildDashboardHref(defaultModule, defaultView));
      }
      return;
    }

    if (!activeModule) {
      const fallbackModule = allowedModules[0];
      if (fallbackModule) {
        router.replace(buildDashboardHref(fallbackModule.id, fallbackModule.defaultView));
      }
      return;
    }

    if (!activeView) {
      const fallbackView = allowedViews[0];
      if (fallbackView) {
        router.replace(buildDashboardHref(activeModule, fallbackView.id));
      }
    }
  }, [
    activeModule,
    activeView,
    allowedModules,
    allowedViews,
    requestedModule,
    router,
    user,
  ]);

  if (!user) {
    return null;
  }

  if (!requestedModule && isCrossDomainDashboardRole(user.role)) {
    return <ControlTowerOverview />;
  }

  if (!activeModule || !activeView) {
    return null;
  }

  const moduleConfig = getDashboardModuleConfig(activeModule);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-28">
      <Card className="border border-stone-200 bg-white/90 shadow-none">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Unified Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#3d3c3c]">
                {moduleConfig.label}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-stone-500">
                {moduleConfig.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link href={buildDashboardHref()}>Control tower</Link>
              </Button>
              <Button asChild className="rounded-full bg-stone-700 hover:bg-stone-950">
                <Link
                  href={buildKnowledgeGraphHref({
                    graphPreset: "full-graph",
                    graphCenterNodeId: "graph-control-tower",
                  })}
                >
                  Explore Knowledge Graph
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {allowedViews.map((view) => (
              <Link
                key={view.id}
                href={buildDashboardHref(activeModule, view.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  activeView === view.id
                    ? "border-stone-700 bg-stone-700 text-white"
                    : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700",
                )}
              >
                {view.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <DashboardModuleSurface module={activeModule} view={activeView} />
    </div>
  );
}
