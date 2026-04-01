"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CONTROL_TOWER_ACTIONS,
  CONTROL_TOWER_ALERTS,
  CONTROL_TOWER_HERO_METRICS,
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
} from "@/lib/control-tower-data";
import { useAuth } from "@/lib/auth-context";
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
  Network,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
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
    soft: "bg-[#e8f8fa]",
    border: "border-[#8ecfd9]",
  },
  campaign: {
    label: "Commercial",
    icon: Megaphone,
    accent: "text-[#29707a]",
    soft: "bg-[#ddf0f3]",
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
    { label: "View merge exceptions", href: "#" },
    { label: "Enrichment pipeline", href: "#" },
  ],
  "active-alerts": [
    { label: "Triage alerts", href: "#" },
    { label: "Alert history", href: "#" },
  ],
  "pending-actions": [
    { label: "Review approvals", href: "#" },
    { label: "Escalation queue", href: "#" },
  ],
  "udp-readiness": [
    { label: "Consent audit", href: "#" },
    { label: "Identity resolution", href: "#" },
  ],
  "forecast-accuracy": [
    { label: "Regional breakdown", href: "#" },
    { label: "Signal sources", href: "#" },
  ],
  "activation-readiness": [
    { label: "Active campaigns", href: "#" },
    { label: "Audience health", href: "#" },
  ],
};

function MetricNavigator() {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const criticalIdx = CONTROL_TOWER_HERO_METRICS.findIndex(
      (m) => m.status === "critical"
    );
    return criticalIdx >= 0 ? criticalIdx : 0;
  });

  const metric = CONTROL_TOWER_HERO_METRICS[selectedIndex];
  const status = STATUS_META[metric.status];
  const sparkColor = SPARKLINE_COLORS[metric.status];
  const actions = METRIC_ACTIONS[metric.id] ?? [];

  return (
    <div className="space-y-0">
      {/* Pill tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3">
        {CONTROL_TOWER_HERO_METRICS.map((m, i) => {
          const s = STATUS_META[m.status];
          const isActive = i === selectedIndex;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-stone-700 bg-stone-700 text-white"
                  : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", s.dot)} />
              {METRIC_SHORT_LABELS[m.id] ?? m.label}
            </button>
          );
        })}
      </div>

      {/* Selected metric panel */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]">
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
                <a
                  key={a.label}
                  href={a.href}
                  className="block text-[12px] font-medium text-stone-500 transition-colors hover:text-[#3d3c3c]"
                >
                  {a.label} →
                </a>
              ))}
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
          </div>
        </div>
      </div>
    </div>
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

function ControlTowerOverview() {
  const { user } = useAuth();
  const router = useRouter();

  const [expandedWidgets, setExpandedWidgets] = useState<Record<string, boolean>>(
    Object.fromEntries(
      CONTROL_TOWER_WIDGETS.map((widget) => [widget.id, widget.defaultExpanded]),
    ),
  );
  const [actions, setActions] = useState(CONTROL_TOWER_ACTIONS);
  const [isGraphDialogOpen, setIsGraphDialogOpen] = useState(false);
  const [highlightedActionIds, setHighlightedActionIds] = useState<Set<string>>(new Set());

  const pendingActions = useMemo(
    () => actions.filter((a) => a.state === "pending"),
    [actions],
  );
  const criticalAlert = CONTROL_TOWER_ALERTS.find((a) => a.severity === "critical");
  const decliningMetric = CONTROL_TOWER_HERO_METRICS.find(
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
      <div className="mx-auto max-w-[1560px] space-y-5 pb-44">
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-5">
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

          {/* Row 2 — Status + Actions bar */}
          <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#cc1800]/10 px-2 py-0.5 text-[11px] font-medium text-[#cc1800]">
                {CONTROL_TOWER_SUMMARY.criticalAlerts} critical
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {CONTROL_TOWER_SUMMARY.highAlerts} high priority
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                {pendingActions.length} open approvals
              </span>
              <span className="text-stone-300">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {CONTROL_TOWER_SUMMARY.dataFreshness}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
              <Button asChild variant="outline" className="rounded-full">
                <Link href={buildIncrementalityHref({ entry: "udp", create: true })}>
                  <Sparkles className="mr-1 h-4 w-4" />
                  Launch experiment
                </Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => handleCreateGraph()}
              >
                <Network className="mr-1 h-4 w-4" />
                Create graph
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link
                  href={buildKnowledgeGraphHref({
                    graphPreset: "full-graph",
                    graphCenterNodeId: "graph-control-tower",
                  })}
                >
                  Explore live graph
                </Link>
              </Button>
            </div>
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
                    {CONTROL_TOWER_SUMMARY.criticalAlerts} critical alert
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

        {/* Alert summary strip */}
        <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-[#ff462d4d] bg-[#ff462d14] px-2.5 py-1 text-[11px] font-semibold text-[#ff462d]">
            <AlertCircle className="h-3 w-3" />
            {CONTROL_TOWER_SUMMARY.criticalAlerts} critical
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#f59e0b33] bg-[#f59e0b14] px-2.5 py-1 text-[11px] font-semibold text-[#f59e0b]">
            <AlertTriangle className="h-3 w-3" />
            {CONTROL_TOWER_SUMMARY.highAlerts} high
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-500">
            {CONTROL_TOWER_SUMMARY.totalAlerts} alerts
          </div>
          <span className="ml-1 text-[11px] text-stone-400">·</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
            <Clock className="h-3 w-3" />
            {CONTROL_TOWER_SUMMARY.dataFreshness}
          </span>
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
