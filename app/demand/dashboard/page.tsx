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
  { week: "W1", accuracy: 71 },
  { week: "W2", accuracy: 69 },
  { week: "W3", accuracy: 73 },
  { week: "W4", accuracy: 72 },
  { week: "W5", accuracy: 74 },
  { week: "W6", accuracy: 75 },
  { week: "W7", accuracy: 74 },
  { week: "W8", accuracy: 76 },
];

const wasteByCategory = [
  { category: "Dairy", waste: 12.1 },
  { category: "Bakery", waste: 9.8 },
  { category: "Produce", waste: 7.4 },
  { category: "Deli", waste: 5.2 },
];

const fillRateByRegion = [
  { region: "Northeast", rate: 93 },
  { region: "Southeast", rate: 89 },
  { region: "Midwest", rate: 91 },
  { region: "West", rate: 92 },
];

const promoLiftData = [
  { promo: "BOGO Berries", forecast: 1.8, actual: 2.1 },
  { promo: "Salad Kit 20%", forecast: 1.4, actual: 1.2 },
  { promo: "Dairy Bundle", forecast: 1.6, actual: 1.7 },
  { promo: "Bakery BOGO", forecast: 1.3, actual: 1.5 },
];

const wasteTrend = [
  { week: "W1", rate: 9.8 },
  { week: "W2", rate: 9.5 },
  { week: "W3", rate: 9.1 },
  { week: "W4", rate: 8.9 },
  { week: "W5", rate: 8.7 },
  { week: "W6", rate: 8.5 },
  { week: "W7", rate: 8.4 },
  { week: "W8", rate: 8.2 },
];

const revenueImpact = [
  { label: "Captured", value: 420 },
  { label: "Missed", value: 85 },
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
    title: "Waste Reduction",
    actions: [
      { id: "adjust-dairy-forecast", title: "Adjust Dairy Forecast +15%", action: "Increase dairy forecast by 15% for the next 7 days to account for heatwave-driven demand", lift: "-40% dairy waste risk", confidence: 92, reason: "7-day weather model shows 34°C heatwave arriving Thursday. Historical pattern shows +15% dairy demand (yoghurt, milk, ice cream) during heatwaves >30°C. Current forecast does not reflect this signal." },
      { id: "reduce-bakery-orders", title: "Reduce Bakery Tue/Wed Orders -20%", action: "Reduce bakery replenishment orders by 20% on Tuesday and Wednesday", lift: "-22% bakery waste", confidence: 88, reason: "Last 8 weeks show consistent 18-22% waste on Tue/Wed for artisan bread and pastries. Demand sensing model confirms mid-week trough is structural, not seasonal." },
    ],
  },
  stockout: {
    title: "Stock-Out Prevention",
    actions: [
      { id: "adjust-dairy-forecast", title: "Adjust Dairy Forecast +15%", action: "Increase dairy forecast by 15% for the next 7 days to prevent heatwave stock-outs", lift: "97.5% fill rate", confidence: 92, reason: "7-day weather model shows 34°C heatwave arriving Thursday. Without adjustment, dairy fill rate projected to drop to 82% across 23% of stores." },
      { id: "preposition-promo-inventory", title: "Pre-Position Promo Inventory", action: "Pre-position additional stock for strawberries and salad kits by Friday for Monday BOGO launch", lift: "+$180K promo revenue", confidence: 95, reason: "Upcoming BOGO projects 2.1x demand lift. Current DC allocation covers only 1.3x. Pre-positioning prevents stock-outs during peak promo demand." },
    ],
  },
  promo: {
    title: "Promotion Planning",
    actions: [
      { id: "preposition-promo-inventory", title: "Pre-Position Promo Inventory", action: "Pre-position additional stock for strawberries and salad kits by Friday for Monday BOGO launch", lift: "+$180K promo revenue", confidence: 95, reason: "Upcoming BOGO on strawberries and salad kits projects 2.1x demand lift based on similar promotions. Current DC allocation covers only 1.3x." },
      { id: "reduce-bakery-orders", title: "Reduce Bakery Tue/Wed Orders -20%", action: "Reduce bakery orders mid-week to free up DC capacity for promo pre-positioning", lift: "-22% bakery waste", confidence: 88, reason: "Mid-week bakery demand trough is structural. Reducing orders frees DC capacity for higher-priority promotional stock movements." },
    ],
  },
  planning: {
    title: "Demand Planning Actions",
    actions: [
      { id: "adjust-dairy-forecast", title: "Adjust Dairy Forecast +15%", action: "Increase dairy forecast by 15% for the next 7 days", lift: "-40% dairy waste risk", confidence: 92, reason: "Weather-driven demand uplift detected. Current forecast does not reflect heatwave signal." },
      { id: "reduce-bakery-orders", title: "Reduce Bakery Tue/Wed Orders -20%", action: "Reduce bakery replenishment orders by 20% on Tuesday and Wednesday", lift: "-22% bakery waste", confidence: 88, reason: "Consistent over-ordering pattern detected on mid-week for artisan bread and pastries." },
    ],
  },
  general: {
    title: "Top Recommendations",
    actions: [
      { id: "adjust-dairy-forecast", title: "Adjust Dairy Forecast +15%", action: "Increase dairy forecast by 15% for the next 7 days", lift: "-40% dairy waste risk", confidence: 92, reason: "7-day weather model shows 34°C heatwave arriving Thursday. Historical pattern shows +15% dairy demand during heatwaves >30°C." },
      { id: "reduce-bakery-orders", title: "Reduce Bakery Tue/Wed Orders -20%", action: "Reduce bakery replenishment orders by 20% on Tuesday and Wednesday", lift: "-22% bakery waste", confidence: 88, reason: "Last 8 weeks show consistent 18-22% waste on Tue/Wed for artisan bread and pastries." },
      { id: "preposition-promo-inventory", title: "Pre-Position Promo Inventory", action: "Pre-position additional stock for strawberries and salad kits by Friday", lift: "+$180K promo revenue", confidence: 95, reason: "Upcoming BOGO projects 2.1x demand lift. Current DC allocation covers only 1.3x." },
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
    title: "Improve Forecast Model",
    description: "Retrain demand models with latest POS data to boost forecast accuracy by +5 percentage points.",
    expectedOutcome: "+5pp Accuracy",
    budgetChange: "No Change",
    risk: "Low",
    riskColor: "bg-stone-50 text-stone-600 border border-stone-200",
    icon: Activity,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-700",
    nbaContext: "planning",
    chatPrompt: "How can I improve our forecast model accuracy? What data sources should I incorporate?",
  },
  {
    title: "Reduce Perishable Waste",
    description: "Tighten SKU-store-day forecasts to cut spoilage on dairy, bakery, and produce.",
    expectedOutcome: "-25% Waste",
    budgetChange: "No Change",
    risk: "Low",
    riskColor: "bg-stone-50 text-stone-600 border border-stone-200",
    icon: TrendingDown,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-700",
    nbaContext: "waste",
    chatPrompt: "Analyze our perishable waste by category and recommend specific forecast adjustments to reduce spoilage.",
  },
  {
    title: "Demand Sensing Alerts",
    description: "Configure real-time signals (weather, events) for proactive forecast adjustments.",
    expectedOutcome: "+3pp Accuracy",
    budgetChange: "No Change",
    risk: "Medium",
    riskColor: "bg-stone-100 text-stone-700",
    icon: Zap,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-800",
    nbaContext: "planning",
    chatPrompt: "What demand sensing signals are available and how can I configure real-time alerts for forecast adjustments?",
  },
];

const marketingScenarios: Scenario[] = [
  {
    title: "Reduce Perishable Waste",
    description: "Tighten forecasts at the SKU-store-day level to cut spoilage on dairy, bakery, and produce.",
    expectedOutcome: "-25% Waste",
    budgetChange: "No Change",
    risk: "Low",
    riskColor: "bg-stone-50 text-stone-600 border border-stone-200",
    icon: TrendingDown,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-700",
    nbaContext: "waste",
    chatPrompt: "Analyze perishable waste trends and recommend promotional strategies to reduce spoilage.",
  },
  {
    title: "Prevent Stock-Outs",
    description: "Improve fill rates during high-demand periods with better demand sensing and safety stock optimization.",
    expectedOutcome: "97.5% Fill Rate",
    budgetChange: "+8% Safety Stock",
    risk: "Medium",
    riskColor: "bg-stone-100 text-stone-700",
    icon: ShieldCheck,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-800",
    nbaContext: "stockout",
    chatPrompt: "What are the current stock-out risks and how can we pre-position inventory to maintain 97.5% fill rate?",
  },
  {
    title: "Optimize Promotion Planning",
    description: "Model promotional lift to right-size inventory and capture full revenue upside on promotions.",
    expectedOutcome: "+18% Promo Revenue",
    budgetChange: "+12% Inventory",
    risk: "Medium",
    riskColor: "bg-stone-200 text-stone-800",
    icon: Tag,
    accentColor: "bg-stone-50/50 border-stone-200",
    iconColor: "text-stone-600",
    nbaContext: "promo",
    chatPrompt: "Analyze our recent promotional lifts vs forecasts and recommend how to optimize upcoming promotion inventory.",
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
    <ChartCard title="Promo Lift: Forecast vs Actual">
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
    <ChartCard title="Waste Rate Trend (8 weeks)">
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
    <ChartCard title="Promo Revenue Impact ($K)">
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
    { label: "Forecast Accuracy", value: "76%", icon: Activity, colorClass: "text-stone-700", bgClass: "bg-stone-100", nbaContext: "planning" as NBAContext, chatPrompt: "What is driving our current 76% forecast accuracy and how can we improve it?" },
    { label: "Waste Rate", value: "8.2%", icon: TrendingDown, colorClass: "text-stone-700", bgClass: "bg-stone-100", nbaContext: "waste" as NBAContext, chatPrompt: "Break down our 8.2% waste rate by category and recommend reduction strategies." },
    { label: "Fill Rate", value: "91%", icon: ShieldCheck, colorClass: "text-stone-700", bgClass: "bg-stone-100", nbaContext: "stockout" as NBAContext, chatPrompt: "What regions have the lowest fill rates and what actions can we take to reach 97.5%?" },
    { label: "Pending Actions", value: String(reviewCounts.pending), icon: FileText, colorClass: "text-stone-700", bgClass: "bg-stone-100", nbaContext: "general" as NBAContext, chatPrompt: "Show me all pending demand planning actions and their expected impact." },
  ];

  const getDashboardContent = () => {
    switch (user.role) {
      case "data_admin":
        return {
          title: "Demand Planning Dashboard",
          description: "Forecasting, demand sensing, and model performance",
          stats: sharedStats,
          scenarios: dataAdminScenarios,
          charts: "data_admin" as const,
          recentActivity: [
            { text: "Forecast model retrained — accuracy improved from 74% to 76%", time: "12m ago" },
            { text: "Data quality alert: 3 SKUs missing POS data in Northeast", time: "45m ago" },
            { text: "Demand sensing signal: Heatwave detected for Thursday", time: "2h ago" },
            { text: "Weekly forecast review completed — 62% touchless coverage", time: "4h ago" },
          ],
        };

      case "marketing_admin":
        return {
          title: "Demand Planning & Promotions",
          description: "Promotional demand lifts, campaign inventory, and ROI optimization",
          stats: sharedStats,
          scenarios: marketingScenarios,
          charts: "marketing_admin" as const,
          recentActivity: [
            { text: "Promo pre-positioning submitted for BOGO strawberries", time: "5m ago" },
            { text: "NBA approved: Bakery order reduction for mid-week", time: "32m ago" },
            { text: "Campaign ROI updated: Salad Kit 20% promo underperformed by 14%", time: "2h ago" },
            { text: "Demand lift model refreshed with latest promotion results", time: "4h ago" },
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
