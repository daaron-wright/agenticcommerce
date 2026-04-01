"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Clock, AlertTriangle, Activity,
  TrendingUp, ArrowUpRight, ArrowDownRight, X,
  ChevronRight, CheckCircle2, Info, BarChart3, DollarSign, Target, Briefcase
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell,
} from "recharts";
import { SERVICES, getAllSignals, getPortfolioKPIs, fmtCurrency, fmtCurrencyShort } from "@/lib/risk/cyber-risk-data";
import { BENCHMARK_CITATIONS } from "@/lib/risk/industry-benchmarks";
import { useArtifacts } from "@/lib/artifact-store";
import { MessageSquare } from "lucide-react";
import { PageBanner } from "@/components/ui/page-banner";

// ── Computed from shared data layer ──────────────────────────────────────────

const kpis = getPortfolioKPIs();
const recentSignals = getAllSignals();

const recentActivity = [
  { text: `Cyber risk assessment completed for ${SERVICES[0].name} — ${SERVICES[0].riskBand === "Med" ? "Medium" : SERVICES[0].riskBand} risk band, ALE ${fmtCurrencyShort(SERVICES[0].ale)}`, time: "2h ago", icon: AlertTriangle },
  { text: `Financial model updated: Combined ALE across ${SERVICES.length} services recalculated to ${fmtCurrencyShort(kpis.totalALE)}`, time: "2h ago", icon: TrendingUp },
  { text: "Control gap identified: Micro-segmentation absent in critical segments", time: "1d ago", icon: Info },
  { text: "Benchmark comparison: Organisation positioned above industry median", time: "3d ago", icon: CheckCircle2 },
];

// ── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-16 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function RiskBandBadge({ band }: { band: string }) {
  const colors: Record<string, string> = {
    Med: "bg-red-50 text-red-700 border-red-200",
    Low: "bg-amber-50 text-amber-700 border-amber-200",
    "Very Low": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Very Very Low": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <Badge variant="outline" className={cn("text-[10px]", colors[band] || "")}>{band}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "action_required":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">Controls Required</Badge>;
    case "under_review":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Under Review</Badge>;
    default:
      return <span className="text-xs text-stone-600">Assessed</span>;
  }
}

// ── Signal Detail Panel ──────────────────────────────────────────────────────

function SignalPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed right-0 top-16 bottom-0 w-[380px] bg-white border-l shadow-xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div>
          <h3 className="text-sm font-semibold">Threat Indicators</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Security gaps detected across critical business services
          </p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-stone-100">
          <X className="h-4 w-4 text-stone-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {recentSignals.map((signal) => (
          <div key={signal.id} className="border rounded-lg p-3 space-y-2 hover:border-stone-300 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] uppercase font-bold border-0",
                    signal.severity === "critical" && "bg-red-100 text-red-700",
                    signal.severity === "high" && "bg-amber-100 text-amber-700",
                    signal.severity === "medium" && "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {signal.severity}
                </Badge>
                <span className="text-xs font-semibold">{signal.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{signal.date}</span>
            </div>
            <p className="text-[11px] text-stone-600">{signal.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                <span>{signal.sourceAgent}</span>
              </div>
              <Link
                href={`/vendor/${signal.serviceId}`}
                className="text-[10px] text-primary hover:underline font-medium"
              >
                {signal.serviceName}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chat Insights Panel ──────────────────────────────────────────────────────

function ChatInsightsPanel() {
  const { getByCategory, markSeen } = useArtifacts();
  const dashboardArtifacts = getByCategory("dashboard");

  useEffect(() => {
    if (dashboardArtifacts.length > 0) {
      markSeen("dashboard");
    }
  }, [dashboardArtifacts.length, markSeen]);

  if (dashboardArtifacts.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-stone-600" />
        <h2 className="text-base font-semibold">Chat Insights</h2>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
          {dashboardArtifacts.length} insight{dashboardArtifacts.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardArtifacts.map((artifact) => (
          <Card key={artifact.id} className="border shadow-none hover:border-stone-300 transition-colors">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-stone-800 leading-snug">{artifact.title}</p>
                {artifact.metric && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                    {artifact.metric}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug mb-2">{artifact.summary}</p>
              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                <MessageSquare className="h-3 w-3" />
                <span className="truncate">From: {artifact.chatPrompt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [showSignals, setShowSignals] = useState(false);

  if (!user) return null;

  const medCount = SERVICES.filter((s) => s.riskBand === "Med").length;
  const lowCount = SERVICES.filter((s) => s.riskBand === "Low").length;
  const veryLowCount = SERVICES.filter((s) => s.riskBand === "Very Low" || s.riskBand === "Very Very Low").length;

  const riskData = [
    { name: "Med", value: medCount, color: "#ef4444" },
    { name: "Low", value: lowCount, color: "#f59e0b" },
    { name: "Very Low", value: veryLowCount, color: "#10b981" },
  ].filter(d => d.value > 0);

  const serviceRiskChartData = SERVICES.map(s => ({
    name: s.name.length > 15 ? s.name.slice(0, 15) + "..." : s.name,
    score: s.riskScore,
    color: s.riskBand === "Med" ? "#ef4444" : s.riskBand === "Low" ? "#f59e0b" : "#10b981"
  }));

  const stats = [
    {
      label: "Total ALE",
      value: fmtCurrencyShort(kpis.totalALE),
      change: `Annualised loss expectancy across ${SERVICES.length} services`,
      icon: DollarSign,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Services at Risk",
      value: String(kpis.servicesAtRisk),
      change: "Above risk tolerance threshold",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Controls Coverage",
      value: `${kpis.controlsCoverage}%`,
      change: "Gaps in segmentation and recovery",
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Open Vulnerabilities",
      value: String(kpis.openVulns),
      change: "Categories requiring remediation",
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {showSignals && <SignalPanel onClose={() => setShowSignals(false)} />}

      <PageBanner category="Overview" title="Cyber Risk Dashboard" description="Financial exposure from cyber risk across critical business services." />

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border shadow-none">
              <CardContent className="pt-5 pb-4">
                <div className={cn("inline-flex items-center justify-center rounded-lg p-2 mb-3", stat.bg)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat Insights */}
      <ChatInsightsPanel />

      {/* Main Content: Table + Activity Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Critical Business Services</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Cyber risk scoring and financial exposure per service.</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowSignals(!showSignals)}>
              <Activity className="h-3.5 w-3.5" />
              {recentSignals.length} Indicators
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border shadow-none">
              <CardContent className="pt-4 pb-4">
                <h3 className="text-sm font-semibold mb-4">Risk Exposure By Service</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceRiskChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: '12px' }}
                        formatter={(value: number) => [value, "Risk Score"]}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {serviceRiskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <div className="overflow-x-auto h-[260px] overflow-y-auto">
                <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-stone-50/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Business Service</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Risk Score</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Risk Band</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Likelihood</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">ALE</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICES.map((svc) => {
                    const sparkColor = svc.riskBand === "Med" ? "#dc2626" : svc.riskBand === "Low" ? "#d97706" : "#059669";
                    return (
                      <tr key={svc.id} className="border-b last:border-0 hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/vendor/${svc.id}`} className="font-medium text-sm hover:underline">
                            {svc.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{svc.category}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-semibold",
                              svc.riskBand === "Med" ? "text-red-600" : svc.riskBand === "Low" ? "text-amber-600" : "text-emerald-600"
                            )}>
                              {svc.riskScore}
                            </span>
                            <span className="text-xs text-muted-foreground">/{svc.maxScore}</span>
                            <Sparkline data={svc.sparkline} color={sparkColor} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <RiskBandBadge band={svc.riskBand} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold">{svc.likelihoodPercent}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-sm font-semibold",
                            svc.riskBand === "Med" ? "text-red-600" : svc.riskBand === "Low" ? "text-amber-600" : "text-emerald-600"
                          )}>
                            {fmtCurrency(svc.ale)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={svc.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest updates in your cyber risk workflow</p>
          </div>
          <Card className="border shadow-none">
            <CardContent className="pt-4 pb-2">
              <ul className="space-y-0">
                {recentActivity.map((item, index) => {
                  const IconComp = item.icon;
                  return (
                    <li key={index} className="flex gap-3 py-3 border-b last:border-0">
                      <div className="mt-0.5 shrink-0">
                        <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground leading-snug">{item.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Risk Distribution Chart */}
          <Card className="border shadow-none">
            <CardContent className="pt-4 pb-4">
              <h3 className="text-xs font-semibold mb-3">Risk Distribution</h3>
              <div className="h-[120px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} service${value !== 1 ? 's' : ''}`, `${name} Risk`]}
                      contentStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Medium (88-110)
                  </span>
                  <span className="font-semibold">{medCount} service{medCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Low (55-87)
                  </span>
                  <span className="font-semibold">{lowCount} service{lowCount !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Very Low / Very Very Low
                  </span>
                  <span className="font-semibold">{veryLowCount} service{veryLowCount !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <p className="text-[9px] text-stone-400 mt-4 italic">{BENCHMARK_CITATIONS.fair}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
