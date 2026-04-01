"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity, AlertTriangle, Clock, Settings,
  X, Shield, Eye, FileCheck, Target,
} from "lucide-react";
import { PageBanner } from "@/components/ui/page-banner";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { MONITORING_AGENTS, MONITORING_SIGNALS, SIGNAL_VOLUME } from "@/lib/risk/cyber-risk-data";

// ── Agent Icon Map ───────────────────────────────────────────────────────────

function AgentIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "target": return <Target className={className} />;
    case "shield": return <Shield className={className} />;
    case "eye": return <Eye className={className} />;
    case "filecheck": return <FileCheck className={className} />;
    default: return <Activity className={className} />;
  }
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ThreatIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"signals" | "agents" | "metrics">("signals");
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const tabs = [
    { id: "signals" as const, label: "Threat Indicators" },
    { id: "agents" as const, label: "Security Agents" },
    { id: "metrics" as const, label: "Signal Metrics" },
  ];

  const criticalGaps = MONITORING_SIGNALS.filter((s) => s.severity === "critical" || s.severity === "high").length;
  const totalSignals = SIGNAL_VOLUME.reduce((sum, s) => sum + s.count, 0);

  const kpis = [
    { label: "Active Agents", value: `${MONITORING_AGENTS.length}/${MONITORING_AGENTS.length}`, sub: "All security agents operational", color: "text-emerald-600", bg: "bg-emerald-50", dot: true },
    { label: "Indicators (24h)", value: String(totalSignals), sub: `Across ${MONITORING_AGENTS.length} business services`, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Critical Gaps", value: String(criticalGaps), sub: "Segmentation & recovery", color: "text-red-600", bg: "bg-red-50" },
    { label: "Scan Latency", value: "~45ms", sub: "Optimal performance", color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto relative">
      {/* Header */}
      <PageBanner
        title="Threat Intelligence"
        description="Real-time threat indicators and security agent health across business services."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setShowConfigPanel(true)}
          >
            <Settings className="h-3.5 w-3.5" /> Configure Agents
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border shadow-none">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                {kpi.dot && <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                {kpi.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-2 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-stone-800 text-stone-800"
                  : "border-transparent text-muted-foreground hover:text-stone-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "signals" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Incoming Threat Indicators</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Live security signals from attack surface monitoring agents.</p>
          </div>
          <div className="space-y-3">
            {MONITORING_SIGNALS.map((signal) => (
              <Card key={signal.id} className="border shadow-none">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{signal.title}</span>
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
                      </div>
                      <p className="text-xs text-stone-600">{signal.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400">
                        <span>Source: {signal.sourceAgent}</span>
                        <span>|</span>
                        <span>{signal.timestamp}</span>
                        <span>|</span>
                        <span>{signal.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "agents" && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {MONITORING_AGENTS.map((agent) => (
            <Card key={agent.id} className="border shadow-none">
              <CardContent className="py-4 px-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center">
                      <AgentIcon icon={agent.icon} className="h-5 w-5 text-stone-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{agent.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{agent.type}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] uppercase font-bold border-0",
                      agent.status === "healthy" && "bg-emerald-100 text-emerald-700",
                      agent.status === "degraded" && "bg-amber-100 text-amber-700",
                    )}
                  >
                    {agent.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Coverage</p>
                    <p className="text-lg font-bold">{agent.coverage}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Signals (24h)</p>
                    <p className="text-lg font-bold">{agent.signalsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "metrics" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Signal Volume</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Threat indicator frequency over the last 24 hours.</p>
          </div>
          <Card className="border shadow-none">
            <CardContent className="py-6 px-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SIGNAL_VOLUME}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configure Agents Panel */}
      {showConfigPanel && (
        <div className="fixed inset-0 z-[70]" onClick={() => setShowConfigPanel(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div
            className="absolute right-0 top-0 bottom-0 w-[400px] bg-white border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h2 className="text-sm font-semibold">Security Agent Configuration</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Manage active security agents, sensitivity thresholds, and scan scopes.
                </p>
              </div>
              <button onClick={() => setShowConfigPanel(false)} className="p-1 rounded hover:bg-stone-100">
                <X className="h-4 w-4 text-stone-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {MONITORING_AGENTS.map((agent) => (
                <div key={agent.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AgentIcon icon={agent.icon} className="h-4 w-4 text-stone-600" />
                      <div>
                        <p className="text-sm font-semibold">{agent.name}</p>
                        <p className="text-[10px] text-muted-foreground">{agent.type}</p>
                      </div>
                    </div>
                    <div className="h-5 w-9 rounded-full bg-teal-600 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Sensitivity</p>
                    <select className="w-full text-xs border rounded-md px-2 py-1.5 bg-white">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowConfigPanel(false)}>
                Cancel
              </Button>
              <Button size="sm" className="text-xs bg-teal-700 hover:bg-teal-800 text-white" onClick={() => setShowConfigPanel(false)}>
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
