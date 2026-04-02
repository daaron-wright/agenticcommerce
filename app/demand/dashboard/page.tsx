"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database, TrendingDown, Headphones, Activity, Users, FileText, ShieldCheck, Tag,
  ArrowRight, CheckCircle2, Clock, AlertCircle, Zap, Sparkles, X, CheckCircle, XCircle,
  FlaskConical, MessageSquare, BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { PageBanner } from "@/components/ui/page-banner";
import {
  visualizationCardClass,
  visualizationGrid,
  visualizationPalette,
  visualizationTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

// ── Chart Data ───────────────────────────────────────────────────────────────

const forecastAccuracyTrend = [
  { week: "W1", accuracy: 82 },
  { week: "W2", accuracy: 81 },
  { week: "W3", accuracy: 80 },
  { week: "W4", accuracy: 79 },
  { week: "W5", accuracy: 77 },
  { week: "W6", accuracy: 75 },
  { week: "W7", accuracy: 74 },
  { week: "W8", accuracy: 72 },
];

const wasteByCategory = [
  { category: "Chilled Meals", waste: 14.2 },
  { category: "Frozen Foods", waste: 11.8 },
  { category: "Fresh Produce", waste: 9.6 },
  { category: "Dairy", waste: 7.1 },
];

const fillRateByRegion = [
  { region: "Northeast", rate: 68 },
  { region: "Southeast", rate: 86 },
  { region: "Midwest", rate: 82 },
  { region: "West", rate: 94 },
];

const promoLiftData = [
  { promo: "Water & Emergency", forecast: 1.4, actual: 3.2 },
  { promo: "Batteries", forecast: 1.2, actual: 2.8 },
  { promo: "First Aid", forecast: 1.3, actual: 2.4 },
  { promo: "Ready Meals", forecast: 1.5, actual: 2.1 },
];

const wasteTrend = [
  { week: "W1", rate: 6.2 },
  { week: "W2", rate: 6.4 },
  { week: "W3", rate: 6.8 },
  { week: "W4", rate: 7.5 },
  { week: "W5", rate: 8.9 },
  { week: "W6", rate: 10.4 },
  { week: "W7", rate: 12.1 },
  { week: "W8", rate: 14.2 },
];

const revenueImpact = [
  { label: "Captured", value: 320 },
  { label: "At Risk", value: 820 },
];

// ── NBA data ─────────────────────────────────────────────────────────────────

type NBAContext = "waste" | "stockout" | "promo" | "planning" | "general";
type NBAReviewStatus = "pending" | "approved" | "rejected";

interface DashboardNBAAction {
  id: string;
  title: string;
  action: string;
  lift: string;
  confidence: number;
  reason: string;
}

const nbaStatusConfig: Record<
  NBAReviewStatus,
  { color: string; icon: React.ElementType; label: string }
> = {
  pending: { color: "bg-stone-100 text-stone-700 border-stone-200", icon: Clock, label: "Pending Review" },
  approved: { color: "bg-stone-50 text-stone-900 border-stone-300", icon: CheckCircle, label: "Approved" },
  rejected: { color: "bg-stone-50 text-stone-500 border-stone-200", icon: XCircle, label: "Rejected" },
};

const nbaByContext: Record<NBAContext, { title: string; actions: DashboardNBAAction[] }> = {
  waste: {
    title: "Cold-Chain Protection",
    actions: [
      { id: "approve-coldchain", title: "Approve Cold-Chain Conditional Transport", action: "Approve sub-4°C transport for chilled ready meals and frozen desserts to Northeast DC", lift: "-60% spoilage risk", confidence: 91, reason: "Storm conditions threatening cold-chain integrity. 3 trucks en route require temperature verification. Power outage risk at Northeast DC adds urgency." },
      { id: "emergency-reorder", title: "Emergency Reorder — Storm-Critical SKUs", action: "Approve emergency reorder for water, batteries, first aid at Northeast DC", lift: "Protects $820K revenue", confidence: 94, reason: "47 SKUs below minimum cover. Panic buying driving 200-320% demand surge. Pre-storm delivery window closes at 2:00 PM today." },
    ],
  },
  stockout: {
    title: "Emergency Stockout Prevention",
    actions: [
      { id: "emergency-reorder", title: "Emergency Reorder — Storm-Critical SKUs", action: "Approve emergency reorder for water, batteries, first aid, ready meals, pet food at Northeast DC", lift: "Protects $820K revenue", confidence: 94, reason: "Severe blizzard driving panic buying. 47 SKUs below minimum cover across storm-impacted categories. Pre-storm delivery window closes at 2:00 PM." },
      { id: "activate-suppliers", title: "Activate Emergency Suppliers", action: "Activate 4 backup suppliers for water, batteries, first aid, and pet food", lift: "-35% stockout risk", confidence: 88, reason: "Primary supply chain disrupted by storm. Backup suppliers have confirmed capacity and can deliver within 24 hours via cleared routes." },
    ],
  },
  promo: {
    title: "Storm Recovery Planning",
    actions: [
      { id: "recovery-restock", title: "Post-Storm Restock Planning", action: "Pre-position recovery inventory at Northeast DC for post-lockdown reopening", lift: "+$340K recovery revenue", confidence: 86, reason: "72-hour lockdown ends Friday. Stores will reopen with depleted shelves. Pre-positioning recovery stock now ensures availability on reopening day." },
      { id: "demand-reforecast", title: "Storm Recovery Demand Reforecast", action: "Adjust demand forecast for post-storm recovery period (+25% across all categories)", lift: "+25% fill rate recovery", confidence: 82, reason: "Historical storm events show 20-30% demand surge in first 48 hours after lockdown lifts. Current forecast does not reflect recovery pattern." },
    ],
  },
  planning: {
    title: "Storm Response Actions",
    actions: [
      { id: "emergency-reorder", title: "Emergency Reorder — Storm-Critical SKUs", action: "Approve emergency reorder for storm-critical SKUs at Northeast DC", lift: "Protects $820K revenue", confidence: 94, reason: "Severe blizzard driving panic buying. 47 SKUs below minimum cover. Pre-storm delivery window closes at 2:00 PM today." },
      { id: "approve-coldchain", title: "Approve Cold-Chain Conditional Transport", action: "Approve sub-4°C transport for frozen and chilled goods", lift: "-60% spoilage risk", confidence: 91, reason: "Temperature-controlled products at risk from power outages and transport delays. Conditional approval required before delivery window closes." },
    ],
  },
  general: {
    title: "Top Storm Response Recommendations",
    actions: [
      { id: "emergency-reorder", title: "Emergency Reorder — Storm-Critical SKUs", action: "Approve emergency reorder for water, batteries, first aid, ready meals at Northeast DC", lift: "Protects $820K revenue", confidence: 94, reason: "Severe blizzard with 72-hour lockdown. 47 SKUs below minimum cover. Panic buying driving 200-320% demand surge across emergency categories." },
      { id: "approve-coldchain", title: "Approve Cold-Chain Conditional Transport", action: "Approve sub-4°C transport for chilled ready meals and frozen desserts", lift: "-60% spoilage risk", confidence: 91, reason: "Cold-chain integrity at risk from power outages. 3 trucks en route need temperature verification. Northeast DC generator has 18 hours fuel." },
      { id: "activate-suppliers", title: "Activate Emergency Suppliers", action: "Activate 4 backup suppliers for water, batteries, first aid, and pet food", lift: "-35% stockout risk", confidence: 88, reason: "Primary supply chain disrupted. Backup suppliers confirmed — delivery via cleared routes within 24 hours." },
    ],
  },
};

function buildInitialNBAReviewState(): Record<string, NBAReviewStatus> {
  const entries = Object.values(nbaByContext).flatMap(({ actions }) =>
    actions.map((action) => [action.id, "pending" as NBAReviewStatus]),
  );

  return Object.fromEntries(entries);
}

// ── Scenarios ─────────────────────────────────────────────────────────────────

interface Scenario {
  title: string;
  description: string;
  expectedOutcome: string;
  budgetChange: string;
  risk: string;
  riskColor: string;
  icon: React.ElementType;
  accentColor: string;
  iconColor: string;
  nbaContext: NBAContext;
  chatPrompt: string;
}

const dataAdminScenarios: Scenario[] = [
  {
    title: "Emergency Stockout Prevention",
    description: "Approve emergency reorders for storm-critical SKUs before the pre-storm delivery window closes.",
    expectedOutcome: "Protect $820K",
    budgetChange: "+Emergency Budget",
    risk: "High",
    riskColor: "bg-stone-200 text-stone-800",
    icon: Activity,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-700",
    nbaContext: "stockout",
    chatPrompt: "What SKUs are at critical stockout risk from the storm and what emergency reorders should I approve?",
  },
  {
    title: "Cold-Chain Protection",
    description: "Verify cold-chain integrity for frozen and chilled goods across storm-impacted DCs and in-transit shipments.",
    expectedOutcome: "-60% Spoilage",
    budgetChange: "No Change",
    risk: "Medium",
    riskColor: "bg-stone-100 text-stone-700",
    icon: TrendingDown,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-700",
    nbaContext: "waste",
    chatPrompt: "What is the cold-chain status across our DCs and what actions are needed to protect frozen and chilled goods?",
  },
  {
    title: "Storm Recovery Planning",
    description: "Pre-position recovery inventory and adjust demand forecasts for post-lockdown reopening.",
    expectedOutcome: "+$340K Recovery",
    budgetChange: "+12% Inventory",
    risk: "Medium",
    riskColor: "bg-stone-100 text-stone-700",
    icon: Zap,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-800",
    nbaContext: "promo",
    chatPrompt: "How should we plan for post-storm recovery? What inventory should be pre-positioned for store reopening?",
  },
];

const marketingScenarios: Scenario[] = [
  {
    title: "Storm-Prep Digital Campaign",
    description: "Push storm-prep notifications and smart substitutions via app and web to capture pre-storm demand.",
    expectedOutcome: "+38% Conversion",
    budgetChange: "+Emergency Budget",
    risk: "Low",
    riskColor: "bg-stone-50 text-stone-600 border border-stone-200",
    icon: TrendingDown,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-700",
    nbaContext: "stockout",
    chatPrompt: "What digital channels should we activate to capture storm-prep demand and communicate delivery changes?",
  },
  {
    title: "In-Store Pickup Redirect",
    description: "Redirect delivery orders to in-store pickup at open locations in storm periphery.",
    expectedOutcome: "3,400 Orders Saved",
    budgetChange: "No Change",
    risk: "Medium",
    riskColor: "bg-stone-100 text-stone-700",
    icon: ShieldCheck,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-800",
    nbaContext: "planning",
    chatPrompt: "Which stores are still open and how many delivery orders can we redirect to in-store pickup?",
  },
  {
    title: "Subscription Expedite Campaign",
    description: "Proactively contact subscription customers to expedite critical deliveries before storm lockdown.",
    expectedOutcome: "+22% Retention",
    budgetChange: "+5% Logistics",
    risk: "Medium",
    riskColor: "bg-stone-200 text-stone-800",
    icon: Tag,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-600",
    nbaContext: "promo",
    chatPrompt: "How many subscription customers have deliveries scheduled during the storm window and how should we manage them?",
  },
];

const activityIcons: Record<number, React.ElementType> = {
  0: CheckCircle2,
  1: CheckCircle2,
  2: Clock,
  3: AlertCircle,
};

// ── NBA Panel Component ──────────────────────────────────────────────────────

function NBAPanel({
  context,
  onClose,
  reviewState,
  onReview,
}: {
  context: NBAContext;
  onClose: () => void;
  reviewState: Record<string, NBAReviewStatus>;
  onReview: (action: DashboardNBAAction, status: NBAReviewStatus) => void;
}) {
  const data = nbaByContext[context];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 mb-4 sm:mb-0 bg-background border border-stone-200 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="h-0.5 bg-stone-700" />
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-stone-800 text-white rounded-lg p-2">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                Next Best Actions
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-white font-medium">
                  <Sparkles className="h-2.5 w-2.5" /> Agent Recommended
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.title} — {data.actions.length} recommendations
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-stone-100 transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {data.actions.map((action) => {
            const status = reviewState[action.id] ?? "pending";
            const statusMeta = nbaStatusConfig[status];
            const StatusIcon = statusMeta.icon;
            const isApproved = status === "approved";
            const isRejected = status === "rejected";

            return (
              <div
                key={action.id}
                className={cn(
                  "rounded-lg p-4 space-y-3 transition-colors",
                  status === "pending" && "border border-stone-200 hover:border-stone-300",
                  status === "approved" && "border border-stone-300 bg-stone-50/70",
                  status === "rejected" && "border border-stone-200 bg-stone-50/40 opacity-85",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-stone-100 text-stone-700 rounded-lg p-1.5 flex-shrink-0">
                      <Zap className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-medium">{action.title}</h3>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border font-medium flex-shrink-0 ${statusMeta.color}`}>
                    <StatusIcon className="h-3 w-3" /> {statusMeta.label}
                  </span>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-xs">
                  <p className="font-medium mb-1 text-muted-foreground uppercase tracking-wide text-[10px]">Recommended Action</p>
                  <p className="flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-stone-500 flex-shrink-0" />
                    {action.action}
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Expected Impact</p>
                    <p className="font-semibold text-stone-800">{action.lift}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Agent Confidence</p>
                    <p className="font-semibold text-stone-700">{action.confidence}%</p>
                  </div>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs">
                  <p className="text-[10px] font-semibold text-stone-700 uppercase tracking-wide mb-1">Agent Reasoning</p>
                  <p className="text-stone-600">{action.reason}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant={isApproved ? "default" : "outline"}
                    className={cn(
                      "text-xs gap-1.5",
                      isApproved
                        ? "bg-stone-800 hover:bg-stone-900 text-white"
                        : "border-stone-200 text-stone-700 hover:bg-stone-100",
                    )}
                    onClick={() => onReview(action, "approved")}
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> {isApproved ? "Approved" : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "text-xs gap-1.5 border-stone-200 hover:bg-stone-100",
                      isRejected ? "text-stone-900 border-stone-300 bg-stone-100" : "text-stone-600",
                    )}
                    onClick={() => onReview(action, "rejected")}
                  >
                    <XCircle className="h-3.5 w-3.5" /> {isRejected ? "Rejected" : "Reject"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t bg-stone-50/50 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">Powered by agentic demand planning pipeline</p>
          <Link href="/nba" prefetch={false}>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-7">
              View All Actions <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Small Chart Components ───────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className={visualizationCardClass}>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-semibold text-stone-700">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {children}
      </CardContent>
    </Card>
  );
}

function ForecastAccuracyChart() {
  return (
    <ChartCard title="Forecast Accuracy Trend (8 weeks)">
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastAccuracyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={visualizationPalette.ink} stopOpacity={0.15} />
                <stop offset="95%" stopColor={visualizationPalette.ink} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...visualizationGrid} vertical={false} />
            <XAxis dataKey="week" tick={visualizationTick} tickLine={false} axisLine={false} />
            <YAxis domain={[65, 80]} tick={visualizationTick} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={visualizationTooltipStyle} />
            <Area type="monotone" dataKey="accuracy" stroke={visualizationPalette.ink} strokeWidth={2} fill="url(#accGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function WasteByCategoryChart() {
  return (
    <ChartCard title="Waste % by Category">
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={wasteByCategory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid {...visualizationGrid} vertical={false} />
            <XAxis dataKey="category" tick={visualizationTick} tickLine={false} axisLine={false} />
            <YAxis tick={visualizationTick} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={visualizationTooltipStyle} />
            <Bar dataKey="waste" fill={visualizationPalette.teal} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function FillRateByRegionChart() {
  return (
    <ChartCard title="Fill Rate by Region">
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fillRateByRegion} layout="vertical" margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
            <CartesianGrid {...visualizationGrid} vertical={false} />
            <XAxis type="number" domain={[80, 100]} tick={visualizationTick} tickLine={false} axisLine={false} />
            <YAxis dataKey="region" type="category" tick={visualizationTick} tickLine={false} axisLine={false} width={70} />
            <Tooltip contentStyle={visualizationTooltipStyle} />
            <Bar dataKey="rate" fill={visualizationPalette.steel} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function PromoLiftChart() {
  return (
    <ChartCard title="Storm Demand: Forecast vs Actual">
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={promoLiftData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid {...visualizationGrid} vertical={false} />
            <XAxis dataKey="promo" tick={visualizationTick} tickLine={false} axisLine={false} />
            <YAxis tick={visualizationTick} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={visualizationTooltipStyle} />
            <Bar dataKey="forecast" fill={visualizationPalette.mist} radius={[4, 4, 0, 0]} name="Forecast" />
            <Bar dataKey="actual" fill={visualizationPalette.ink} radius={[4, 4, 0, 0]} name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function WasteTrendChart() {
  return (
    <ChartCard title="Waste Rate Trend — Cold-Chain Disruption">
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={wasteTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={visualizationPalette.teal} stopOpacity={0.15} />
                <stop offset="95%" stopColor={visualizationPalette.teal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...visualizationGrid} vertical={false} />
            <XAxis dataKey="week" tick={visualizationTick} tickLine={false} axisLine={false} />
            <YAxis domain={[7, 10.5]} tick={visualizationTick} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={visualizationTooltipStyle} />
            <Area type="monotone" dataKey="rate" stroke={visualizationPalette.teal} strokeWidth={2} fill="url(#wasteGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function RevenueImpactChart() {
  return (
    <ChartCard title="Storm Revenue Impact ($K)">
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueImpact} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid {...visualizationGrid} vertical={false} />
            <XAxis dataKey="label" tick={visualizationTick} tickLine={false} axisLine={false} />
            <YAxis tick={visualizationTick} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={visualizationTooltipStyle} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              <Cell fill={visualizationPalette.ink} />
              <Cell fill={visualizationPalette.cloud} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [nbaContext, setNbaContext] = useState<NBAContext | null>(null);
  const [nbaReviewState, setNbaReviewState] = useState<Record<string, NBAReviewStatus>>(
    buildInitialNBAReviewState,
  );

  if (!user) return null;

  const openNBA = (context: NBAContext) => setNbaContext(context);
  const closeNBA = () => setNbaContext(null);

  const askInChat = (prompt: string) => {
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const reviewCounts = useMemo(() => {
    const values = Object.values(nbaReviewState);
    return {
      pending: values.filter((status) => status === "pending").length,
      approved: values.filter((status) => status === "approved").length,
      rejected: values.filter((status) => status === "rejected").length,
    };
  }, [nbaReviewState]);

  const handleNBAReview = (action: DashboardNBAAction, status: NBAReviewStatus) => {
    setNbaReviewState((prev) => ({ ...prev, [action.id]: status }));
    toast.success(
      status === "approved" ? `${action.title} approved` : `${action.title} rejected`,
      {
        description:
          status === "approved"
            ? "The recommendation has been marked approved."
            : "The recommendation has been marked rejected.",
      },
    );
  };

  // ── Shared KPI stats (used by data_admin and marketing_admin) ──────────

  const sharedStats = [
    { label: "Forecast Accuracy", value: "72%", icon: Activity, colorClass: "text-stone-700", bgClass: "bg-stone-100", nbaContext: "planning" as NBAContext, chatPrompt: "What is driving the drop in forecast accuracy during the storm?" },
    { label: "Waste Rate", value: "14.2%", icon: TrendingDown, colorClass: "text-stone-700", bgClass: "bg-stone-100", nbaContext: "waste" as NBAContext, chatPrompt: "What is the cold-chain spoilage risk from the storm and how can we protect inventory?" },
    { label: "Fill Rate", value: "78%", icon: ShieldCheck, colorClass: "text-stone-700", bgClass: "bg-stone-100", nbaContext: "stockout" as NBAContext, chatPrompt: "Which regions have the lowest fill rates due to the storm and what emergency actions can we take?" },
    { label: "Pending Actions", value: String(reviewCounts.pending), icon: FileText, colorClass: "text-stone-700", bgClass: "bg-stone-100", nbaContext: "general" as NBAContext, chatPrompt: "Show me all pending storm response actions and their expected impact." },
  ];

  const getDashboardContent = () => {
    switch (user.role) {
      case "data_admin":
        return {
          title: "Storm Response Dashboard",
          description: "Emergency demand management and supply chain coordination for winter weather hazard",
          stats: sharedStats,
          scenarios: dataAdminScenarios,
          charts: "data_admin" as const,
          recentActivity: [
            { text: "Emergency reorder submitted — 6 storm-critical SKUs at Northeast DC", time: "12m ago" },
            { text: "Cold-chain alert: Generator fuel at 18 hours — resupply dispatched", time: "45m ago" },
            { text: "Weather intelligence: Blizzard peak expected in 8 hours", time: "2h ago" },
            { text: "Delivery route replanning: 142 routes blocked by road closures", time: "4h ago" },
          ],
        };

      case "marketing_admin":
        return {
          title: "Storm Response — E-commerce & Demand",
          description: "Storm-driven demand surge, digital channel activation, and delivery adaptation",
          stats: sharedStats,
          scenarios: marketingScenarios,
          charts: "marketing_admin" as const,
          recentActivity: [
            { text: "Storm-prep push notifications sent — 4,200 sessions in last hour", time: "5m ago" },
            { text: "Smart substitution activated — 68% acceptance on out-of-stock items", time: "32m ago" },
            { text: "In-store pickup redirect offered to 3,400 delivery orders", time: "2h ago" },
            { text: "Subscription expedite campaign launched — 1,200 customers contacted", time: "4h ago" },
          ],
        };

      case "service_agent":
        return {
          title: "Service Agent Dashboard",
          description: "Active cases and customer service overview",
          stats: [
            { label: "My Open Cases", value: "15", icon: FileText, colorClass: "text-stone-700", bgClass: "bg-stone-100" },
            { label: "Resolved Today", value: "8", icon: Activity, colorClass: "text-stone-700", bgClass: "bg-stone-100" },
            { label: "High Priority", value: "3", icon: Headphones, colorClass: "text-stone-700", bgClass: "bg-stone-100" },
            { label: "Avg. Resolution Time", value: "2.4h", icon: Database, colorClass: "text-stone-700", bgClass: "bg-stone-100" },
          ],
          recentActivity: [
            { text: "Case #4521 resolved: Billing inquiry", time: "10m ago" },
            { text: "Case #4523 assigned to you: Product return request", time: "1h ago" },
            { text: "NBA suggested: Offer shipping compensation", time: "2h ago" },
            { text: "Customer context updated: Recent purchase history", time: "3h ago" },
          ],
        };

      default:
        return {
          title: "Dashboard",
          description: "Welcome to CDP Workflow Platform",
          stats: [],
          recentActivity: [],
        };
    }
  };

  const dashboard = getDashboardContent();
  const hasScenarios = "scenarios" in dashboard && Array.isArray((dashboard as any).scenarios);
  const chartRole = "charts" in dashboard ? (dashboard as any).charts : null;

  return (
    <div className="space-y-6">
      {/* NBA Popup Panel */}
      {nbaContext && (
        <NBAPanel
          context={nbaContext}
          onClose={closeNBA}
          reviewState={nbaReviewState}
          onReview={handleNBAReview}
        />
      )}

      {/* Recent from chat */}
      <RecentFromChat category="dashboard" />

      {/* Page Header */}
      <PageBanner category="Overview" title={dashboard.title} description={dashboard.description} />

      {/* KPI Stat Cards */}
      <div data-tour="kpi-cards" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {dashboard.stats.map((stat) => {
          const Icon = stat.icon;
          const clickable = "nbaContext" in stat && (stat as any).nbaContext;
          const hasChatPrompt = "chatPrompt" in stat && (stat as any).chatPrompt;
          return (
            <Card
              key={stat.label}
              className={cn("border shadow-none transition-colors", clickable && "cursor-pointer hover:border-stone-400")}
              onClick={() => clickable && openNBA((stat as any).nbaContext)}
            >
              <CardContent className="pt-5 pb-4">
                <div className={`inline-flex items-center justify-center rounded-lg p-2 mb-3 ${stat.bgClass}`}>
                  <Icon className={`h-4 w-4 ${stat.colorClass}`} />
                </div>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{stat.label}</p>
                <div className="flex items-center gap-2 mt-2">
                  {clickable && (
                    <span className="text-[10px] text-stone-500 flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> Recommendations
                    </span>
                  )}
                  {hasChatPrompt && (
                    <button
                      onClick={(e) => { e.stopPropagation(); askInChat((stat as any).chatPrompt); }}
                      className="text-[10px] text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="h-2.5 w-2.5" /> Ask about this
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      {chartRole === "data_admin" && (
        <div data-tour="charts-section">
          <h2 className="text-base font-semibold mb-3">Performance Insights</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ForecastAccuracyChart />
            <WasteByCategoryChart />
            <FillRateByRegionChart />
          </div>
        </div>
      )}
      {chartRole === "marketing_admin" && (
        <div data-tour="charts-section">
          <h2 className="text-base font-semibold mb-3">Promotion & Demand Insights</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <PromoLiftChart />
            <WasteTrendChart />
            <RevenueImpactChart />
          </div>
        </div>
      )}

      {/* Main Content: Scenarios + Activity */}
      {hasScenarios ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Scenarios */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Proposed Business Scenarios</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Actionable recommendations — click a card or ask in chat</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 xl:grid-cols-3">
              {(dashboard as any).scenarios.map((scenario: Scenario, index: number) => {
                const Icon = scenario.icon;
                const isWasteScenario = scenario.nbaContext === "waste";
                return (
                  <Card
                    key={index}
                    {...(isWasteScenario ? { "data-tour": "scenario-waste" } : {})}
                    className={cn(
                      "flex flex-col border shadow-none transition-colors hover:border-stone-400",
                      scenario.accentColor
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-1.5 rounded-md bg-white/80 border border-white shadow-sm">
                          <Icon className={`h-4 w-4 ${scenario.iconColor}`} />
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${scenario.riskColor}`}>
                          {scenario.risk} risk
                        </span>
                      </div>
                      <CardTitle className="text-sm leading-snug">{scenario.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 flex-grow">
                      <div className="rounded-md bg-white/60 border border-white p-2.5 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Outcome</span>
                          <span className="font-semibold text-stone-900">{scenario.expectedOutcome}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Budget</span>
                          <span className="font-semibold">{scenario.budgetChange}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="w-full flex items-center justify-between">
                        <button
                          onClick={() => {
                            toast.success(`Action Executed: ${scenario.title}`, {
                              description: "Agent workflow initiated. Check the sidebar for DAG visualization.",
                            });
                          }}
                          className="text-[10px] text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="h-2.5 w-2.5" /> Execute Action
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-3 gap-1"
                          onClick={() => askInChat(scenario.chatPrompt)}
                        >
                          <MessageSquare className="h-3 w-3" /> Ask in Chat
                        </Button>
                        {isWasteScenario && <span data-tour="ask-in-chat" className="hidden" />}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity sidebar */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">Recent Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest updates in your workflow</p>
            </div>
            <Card className="border shadow-none">
              <CardContent className="pt-4 pb-2">
                <ul className="space-y-0">
                  {dashboard.recentActivity.map((activity, index) => {
                    const IconComp = activityIcons[index] ?? Clock;
                    return (
                      <li key={index} className="flex gap-3 py-3 border-b last:border-0">
                        <div className="mt-0.5 shrink-0">
                          <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-foreground leading-snug">{(activity as any).text}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{(activity as any).time}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription className="text-xs">Latest updates in your workflow</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-0">
              {dashboard.recentActivity.map((activity, index) => {
                const IconComp = activityIcons[index] ?? Clock;
                return (
                  <li key={index} className="flex gap-3 py-3 border-b last:border-0">
                    <div className="mt-0.5 shrink-0">
                      <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground leading-snug">{(activity as any).text}</p>
                      <p className="text-xs text-muted-foreground shrink-0">{(activity as any).time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
