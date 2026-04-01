"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle, Clock, XCircle, ArrowRight, TrendingUp, FlaskConical, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import {
  INCREMENTALITY_EXPERIMENTS,
  INCREMENTALITY_STATUS_LABELS,
  INCREMENTALITY_TEMPLATE_LABELS,
  buildIncrementalityHref,
} from "@/lib/incrementality-data";

type Status = "pending" | "approved" | "rejected";

const initialActions = [
  { id: 1, title: "Reactivate At-Risk High Value Customers", segment: "At-Risk High Value", size: 512, action: "Send personalised win-back offer via email + retarget on Facebook Sale", expectedLift: "+18% retention", confidence: 94, status: "pending" as Status, agentReason: "Detected 38-day purchase gap for 512 high-LTV customers. Historical data shows email + paid retargeting recovers 18% within 14 days." },
  { id: 2, title: "Boost Google PMAX Budget – Norway", segment: "All Active Customers", size: 18400, action: "Increase Google PMAX daily budget by 30% for Norway market", expectedLift: "+£17K net profit/day", confidence: 88, status: "pending" as Status, agentReason: "MMM attribution model shows PMAX is undersaturated. Moving £3K/day from TikTok Sale to PMAX projects +£17K net profit improvement." },
  { id: 3, title: "Suppress Wasteful Facebook Awareness Spend", segment: "Awareness Audiences", size: 11899, action: "Reduce Facebook Awareness budget to zero – redirect to Facebook Sale", expectedLift: "£2K cost saving/day", confidence: 91, status: "approved" as Status, agentReason: "Facebook Awareness shows 0% attributed conversions for 6 consecutive weeks. Budget reallocation to Facebook Sale yields measurable epROAS." },
  { id: 4, title: "Loyalty Reward for Brand Advocates", segment: "High-Value Loyalists", size: 2840, action: "Trigger loyalty discount email (15% off next purchase)", expectedLift: "+12% purchase frequency", confidence: 82, status: "pending" as Status, agentReason: "Brand Advocates have 4.8 avg purchase frequency. A targeted loyalty incentive is projected to increase to 5.4x and raise LTV by £8.2K." },
  { id: 5, title: "Pause Tiktok Sale – Saturated Market", segment: "TikTok Audiences", size: 29023, action: "Reduce TikTok Sale spend by 41% – reallocate to Google PMAX", expectedLift: "+£105K net profit", confidence: 86, status: "rejected" as Status, agentReason: "TikTok Sale shows diminishing marginal returns above £17K/week. Saturation curve analysis indicates reallocation improves overall portfolio ROAS." },
];

const statusConfig: Record<Status, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "bg-stone-100 text-stone-700 border-stone-200", icon: Clock, label: "Pending Review" },
  approved: { color: "bg-stone-50 text-stone-900 border-stone-300", icon: CheckCircle, label: "Approved" },
  rejected: { color: "bg-stone-50 text-stone-500 border-stone-200 line-through", icon: XCircle, label: "Rejected" },
};

export default function NBAPage() {
  const [actions, setActions] = useState(initialActions);
  const [incExpanded, setIncExpanded] = useState(false);
  const incrementalityExperiments = INCREMENTALITY_EXPERIMENTS.filter(
    (experiment) => experiment.domainLens === "demand",
  ).slice(0, 3);

  const updateStatus = (id: number, status: Status) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const pending = actions.filter(a => a.status === "pending");
  const approved = actions.filter(a => a.status === "approved");
  const rejected = actions.filter(a => a.status === "rejected");

  return (
    <div className="space-y-6">
      <Card className="border-stone-300 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-stone-700" />
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-stone-800 text-white rounded-lg p-2 flex-shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Next Best Actions</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Agent-generated recommendations requiring marketer approval</p>
              </div>
            </div>
            <Link href="/mmm" prefetch={false}>
              <Button size="sm" variant="outline" className="gap-2">
                <TrendingUp className="h-3.5 w-3.5" /> View MMM Analysis
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Awaiting Review", value: pending.length, color: "text-stone-800" },
          { label: "Approved", value: approved.length, color: "text-stone-600" },
          { label: "Rejected", value: rejected.length, color: "text-stone-400" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incrementality — Agent-Recommended Insight Card */}
      <Card className="border-stone-300 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-stone-700" />
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-stone-800 text-white rounded-lg p-1.5 flex-shrink-0">
                <FlaskConical className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">Incrementality Experiments</CardTitle>
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-white font-medium">
                    <Sparkles className="h-2.5 w-2.5" /> Agent Highlighted
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Demand is one lens within the shared UDP experiment program
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs">
            <p className="text-[10px] font-semibold text-stone-700 uppercase tracking-wide mb-1">Agent Reasoning</p>
            <p className="text-stone-600">Demand experiments now sit inside the broader shared experiment program, so forecast lift, promo intensity, and activation changes can be reviewed alongside UDP identity, audience, and consent experiments. The strongest current demand signal is still the Manchester promo forecast lift readout.</p>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-2.5">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Active Experiments</p>
              <p className="text-lg font-bold text-stone-800">{incrementalityExperiments.length}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Best eROAS</p>
              <p className="text-lg font-bold text-stone-800">
                {incrementalityExperiments.find((exp) => exp.incrementalEROAS > 0)?.incrementalEROAS.toFixed(2) ?? "—"}%
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Incremental Sales</p>
              <p className="text-lg font-bold text-stone-800">
                £{Math.round(incrementalityExperiments.reduce((sum, exp) => sum + exp.incrementalNetSales, 0) / 1000)}K
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIncExpanded(!incExpanded)}
              className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 transition-colors"
            >
              {incExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {incExpanded ? "Hide experiments" : "View demand experiments"}
            </button>

            <Link href={buildIncrementalityHref({ entry: "demand", lens: "demand" })} prefetch={false}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                Open shared workspace
              </Button>
            </Link>
          </div>

          {incExpanded && (
            <div className="space-y-2">
              {incrementalityExperiments.map((exp) => (
                <div key={exp.name} className="border border-stone-200 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-3.5 w-3.5 text-stone-500" />
                      <span className="font-medium text-stone-800">{exp.name}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                      exp.status === "final_results" ? "bg-stone-100 text-stone-900 border-stone-300" :
                      exp.status === "running" ? "bg-stone-50 text-stone-700 border-stone-200" :
                      "bg-stone-50 text-stone-400 border-stone-100"
                    }`}>{INCREMENTALITY_STATUS_LABELS[exp.status]}</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
                    <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{INCREMENTALITY_TEMPLATE_LABELS[exp.template]}</span></div>
                    <div><span className="text-muted-foreground">Scope:</span> <span className="font-medium">{exp.scopeLabel}</span></div>
                    <div><span className="text-muted-foreground">Spend:</span> <span className="font-medium">£{exp.spendDuringExperiment.toLocaleString("en-GB")}</span></div>
                    <div><span className="text-muted-foreground">eROAS:</span> <span className="font-medium">{exp.incrementalEROAS > 0 ? `${exp.incrementalEROAS.toFixed(2)}%` : "—"}</span></div>
                  </div>
                  {exp.status === "final_results" && (
                    <div className="mt-2 grid grid-cols-3 gap-2 bg-stone-50 rounded p-2">
                      <div><span className="text-muted-foreground text-[10px]">Inc. Sales</span><p className="font-semibold text-stone-800">£{exp.incrementalNetSales.toLocaleString("en-GB")}</p></div>
                      <div><span className="text-muted-foreground text-[10px]">Lift</span><p className="font-semibold text-stone-800">{exp.liftDetected.toFixed(1)}%</p></div>
                      <div><span className="text-muted-foreground text-[10px]">P-value</span><p className="font-semibold text-stone-800">{exp.pValue != null ? `${exp.pValue.toFixed(1)}%` : "—"}</p></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action cards */}
      <div className="space-y-4">
        {actions.map((action) => {
          const cfg = statusConfig[action.status];
          const Icon = cfg.icon;
          return (
            <Card key={action.id} className={action.status === "pending" ? "border-stone-300 shadow-sm" : "opacity-75"}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-stone-100 text-stone-700 rounded-lg p-1.5 flex-shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{action.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Segment: <strong>{action.segment}</strong> · {action.size.toLocaleString("en-GB")} customers
                      </p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border font-medium flex-shrink-0 ${cfg.color}`}>
                    <Icon className="h-3 w-3" /> {cfg.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3 text-xs">
                  <p className="font-medium mb-1 text-muted-foreground uppercase tracking-wide text-[10px]">Recommended Action</p>
                  <p className="flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-stone-500 flex-shrink-0" />
                    {action.action}
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Expected Lift</p>
                    <p className="font-semibold text-stone-800">{action.expectedLift}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">Agent Confidence</p>
                    <p className="font-semibold text-stone-700">{action.confidence}%</p>
                  </div>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs">
                  <p className="text-[10px] font-semibold text-stone-700 uppercase tracking-wide mb-1">Agent Reasoning</p>
                  <p className="text-stone-600">{action.agentReason}</p>
                </div>
                {action.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="text-xs gap-1.5 bg-stone-800 hover:bg-stone-900 text-white" onClick={() => updateStatus(action.id, "approved")}>
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 text-stone-600 border-stone-200 hover:bg-stone-100" onClick={() => updateStatus(action.id, "rejected")}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
