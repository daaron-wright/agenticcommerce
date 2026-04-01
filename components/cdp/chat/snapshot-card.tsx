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
  Megaphone,
  Users,
  UserSearch,
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
} from "recharts";
import type { SnapshotType } from "./chat-data";
import { CurrentStateCard, ScenarioProjectionCard } from "./scenario-projection";
import {
  WEEKLY_COMMERCIAL_REVIEW,
  formatCommercialCurrency,
} from "@/lib/commercial-review";

const SNAPSHOT_CONFIG: Partial<Record<
  SnapshotType,
  { title: string; icon: React.ElementType; href: string }
>> = {
  dashboard: { title: "UDP Dashboard", icon: Home, href: "/udp/dashboard" },
  reports: { title: "Performance Reports", icon: FileText, href: "/reports" },
  mmm: { title: "Marketing Mix Model", icon: BarChart3, href: "/mmm" },
  campaigns: { title: "Campaigns", icon: Megaphone, href: "/campaigns" },
  audiences: { title: "Audience Segments", icon: Users, href: "/audiences" },
  customers: {
    title: "Customer Insights",
    icon: UserSearch,
    href: "/customers",
  },
  analytics: {
    title: "Performance Analytics",
    icon: PieChart,
    href: "/analytics",
  },
};

// ── Mini data for each snapshot ──────────────────────────────────────────────

const dashboardKPIs = [
  { label: "Revenue", value: "£398K", change: "+12%" },
  { label: "ROAS", value: "2.8x", change: "+0.3" },
  { label: "Active Campaigns", value: "8", change: "+2" },
  { label: "Conversion", value: "3.8%", change: "+0.4%" },
];

const spendVsRoasData = WEEKLY_COMMERCIAL_REVIEW.grossSalesTrend.map((point) => ({
  d: point.day,
  currentWeek: point.currentWeek,
  previousWeek: point.previousWeek,
}));

const channelData = WEEKLY_COMMERCIAL_REVIEW.marketBreakdown.map((market) => ({
  ch: market.market.replace(" & ", " / "),
  value: Math.round(market.grossSales / 1000),
  color:
    market.market === "North of England"
      ? "#0f172a"
      : market.market === "London & South East"
        ? "#475569"
        : market.market === "Midlands & East"
          ? "#64748b"
          : market.market === "Scotland & Wales"
            ? "#94a3b8"
            : "#cbd5e1",
}));

const campaignList = [
  { name: "Summer Sale 2024", status: "Active", budget: "£45K", roas: "3.2x" },
  { name: "Brand Awareness UK", status: "Active", budget: "£28K", roas: "1.8x" },
  { name: "Loyalty Win-Back", status: "Active", budget: "£12K", roas: "4.1x" },
  { name: "TikTok Prospecting", status: "Paused", budget: "£17K", roas: "2.4x" },
];

const audienceSegments = [
  { name: "High-Value Loyalists", size: "2,340", pct: 42 },
  { name: "At-Risk Customers", size: "512", pct: 18 },
  { name: "New Prospects", size: "4,820", pct: 28 },
  { name: "Brand Advocates", size: "1,180", pct: 12 },
];

const weeklyTrendData = [
  { w: "W1", sessions: 12400, conv: 3.2 },
  { w: "W2", sessions: 13100, conv: 3.4 },
  { w: "W3", sessions: 11800, conv: 3.1 },
  { w: "W4", sessions: 14200, conv: 3.6 },
  { w: "W5", sessions: 15100, conv: 3.8 },
  { w: "W6", sessions: 16300, conv: 3.9 },
];

const customerSegments = [
  { name: "Brand Advocates", count: "1,180", ltv: "£482" },
  { name: "Regular Buyers", count: "3,450", ltv: "£284" },
  { name: "Occasional", count: "5,620", ltv: "£96" },
];

// ── Snapshot Content renderers ───────────────────────────────────────────────

function DashboardSnapshot() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {dashboardKPIs.map((kpi) => (
        <div key={kpi.label} className="text-center p-2 bg-stone-50 rounded-md">
          <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          <p className="text-sm font-bold mt-0.5">{kpi.value}</p>
          <p className="text-[10px] text-emerald-600 font-medium">{kpi.change}</p>
        </div>
      ))}
    </div>
  );
}

function ReportsSnapshot() {
  return (
    <div className="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={spendVsRoasData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="d" tick={{ fontSize: 9 }} />
          <Bar dataKey="currentWeek" fill="#0f172a" maxBarSize={12} radius={[2, 2, 0, 0]} />
          <Line type="monotone" dataKey="previousWeek" stroke="#64748b" strokeWidth={1.5} dot={false} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[10px] text-muted-foreground">
        Last week gross sales peaked at {formatCommercialCurrency(301000)} on Friday.
      </p>
    </div>
  );
}

function MMMSnapshot() {
  return (
    <div className="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
          <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}K`} />
          <YAxis type="category" dataKey="ch" tick={{ fontSize: 9 }} width={55} />
          <Bar dataKey="value" maxBarSize={14} radius={[0, 3, 3, 0]}>
            {channelData.map((entry, i) => (
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
      {campaignList.map((c) => (
        <div
          key={c.name}
          className="flex items-center justify-between text-xs px-2 py-1.5 bg-stone-50 rounded"
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
          <div className="flex gap-3 text-muted-foreground">
            <span>{c.budget}</span>
            <span className="font-semibold text-foreground">{c.roas}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AudiencesSnapshot() {
  return (
    <div className="space-y-1.5">
      {audienceSegments.map((seg) => (
        <div key={seg.name} className="flex items-center gap-2 text-xs">
          <div className="flex-1">
            <div className="flex justify-between mb-0.5">
              <span className="font-medium">{seg.name}</span>
              <span className="text-muted-foreground">{seg.size}</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-700 rounded-full"
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
      {customerSegments.map((seg) => (
        <div
          key={seg.name}
          className="flex items-center justify-between text-xs px-2 py-1.5 bg-stone-50 rounded"
        >
          <span className="font-medium">{seg.name}</span>
          <div className="flex gap-3 text-muted-foreground">
            <span>{seg.count} users</span>
            <span className="font-semibold text-foreground">LTV {seg.ltv}</span>
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
        <AreaChart data={weeklyTrendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="w" tick={{ fontSize: 9 }} />
          <Area
            type="monotone"
            dataKey="sessions"
            fill="#e2e8f0"
            stroke="#475569"
            strokeWidth={1.5}
          />
        </AreaChart>
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
  if (type === "scenario-profit") return <ScenarioProjectionCard scenarioId="profit" />;
  if (type === "scenario-acquisition") return <ScenarioProjectionCard scenarioId="acquisition" />;
  if (type === "scenario-retention") return <ScenarioProjectionCard scenarioId="retention" />;

  const config = SNAPSHOT_CONFIG[type];
  const Renderer = SNAPSHOT_RENDERERS[type];
  if (!config || !Renderer) return null;
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "border shadow-none overflow-hidden transition-all duration-200",
        isHighlighted
          ? "border-stone-400 shadow-md ring-1 ring-stone-300/50"
          : "border-stone-200",
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
            isHighlighted ? "bg-stone-100" : "bg-stone-50/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                "h-3.5 w-3.5 transition-colors duration-200",
                isHighlighted ? "text-stone-900" : "text-stone-600"
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold transition-colors duration-200",
                isHighlighted ? "text-stone-900" : "text-stone-700"
              )}
            >
              {config.title}
            </span>
          </div>
          <Link
            href={config.href}
            prefetch={false}
            className="text-[10px] font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
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
  { label: "Action validated and approved", time: "0s" },
  { label: "Configuration submitted to platform API", time: "2s" },
  { label: "Performance monitoring rules applied", time: "4s" },
  { label: "Anomaly detection agent activated", time: "6s" },
  { label: "Execution confirmed — changes live", time: "8s" },
];

function ExecutionConfirmationCard() {
  return (
    <Card className="border border-stone-200 shadow-none overflow-hidden">
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
              <span className="flex-1 text-stone-700">{step.label}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{step.time}</span>
            </div>
          ))}
        </div>
        {/* Monitoring footer */}
        <div className="flex items-center gap-2 px-3 py-2 border-t bg-stone-50/50">
          <Activity className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] text-stone-600 font-medium">
            Agent is now monitoring performance — will alert on anomalies
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
