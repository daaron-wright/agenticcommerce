"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { PageBanner } from "@/components/ui/page-banner";
import { NewCampaignDialog } from "@/components/campaigns/new-campaign-dialog";

const campaigns = [
  { id: 1, name: "Summer Sale 2025", status: "Active", budget: 120000, spent: 68200, impressions: "2.4M", clicks: 48200, conversions: 3120, roas: 6.8, channels: ["Google PMAX", "Facebook Sale", "TikTok Sale"], agentManaged: true },
  { id: 2, name: "Brand Awareness – Norway", status: "Active", budget: 45000, spent: 32100, impressions: "1.1M", clicks: 18900, conversions: 420, roas: 3.2, channels: ["Facebook Awareness", "TikTok Awareness"], agentManaged: false },
  { id: 3, name: "Retargeting – At Risk Segment", status: "Active", budget: 28000, spent: 14800, impressions: "380K", clicks: 12400, conversions: 890, roas: 8.2, channels: ["Google Generic", "Facebook Traffic"], agentManaged: true },
  { id: 4, name: "New Customer Acquisition", status: "Scheduled", budget: 80000, spent: 0, impressions: "—", clicks: "—", conversions: 0, roas: 0, channels: ["Google PMAX", "TikTok Traffic"], agentManaged: true },
  { id: 5, name: "Loyalty Re-engagement", status: "Paused", budget: 35000, spent: 35000, impressions: "650K", clicks: 9800, conversions: 560, roas: 4.1, channels: ["Email", "Facebook Sale"], agentManaged: false },
];

const statusColors: Record<string, string> = {
  "Active": "bg-slate-100 text-slate-800",
  "Scheduled": "bg-slate-50 text-slate-600",
  "Paused": "bg-slate-50 text-slate-500",
  "Ended": "bg-slate-200 text-slate-700",
};

export default function CampaignsPage() {
  const [showNew, setShowNew] = useState(false);
  const active = campaigns.filter(c => c.status === "Active");
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-6">
      <NewCampaignDialog open={showNew} onOpenChange={setShowNew} />
      {/* Recent from chat */}
      <RecentFromChat category="campaigns" />

      <PageBanner
        title="Campaigns"
        description="Manage and monitor your marketing campaigns"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setShowNew(true)}>
            <Plus className="h-3.5 w-3.5" /> New Campaign
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Campaigns", value: String(active.length) },
          { label: "Total Budget (£)", value: totalBudget.toLocaleString("en-GB") },
          { label: "Total Spent (£)", value: totalSpent.toLocaleString("en-GB") },
          { label: "Agent-Managed", value: String(campaigns.filter(c => c.agentManaged).length) },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaigns table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Campaign</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Status</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">Budget (£)</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">Spent (£)</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Impressions</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Conversions</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">ROAS</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Channels</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const pctSpent = c.budget > 0 ? (c.spent / c.budget) * 100 : 0;
                  return (
                    <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{c.name}</span>
                          {c.agentManaged && <Zap className="h-3 w-3 text-slate-700 flex-shrink-0" title="Agent managed" />}
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColors[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="text-right py-2.5 px-2">{c.budget.toLocaleString("en-GB")}</td>
                      <td className="text-right py-2.5 px-2">
                        <div>{c.spent > 0 ? c.spent.toLocaleString("en-GB") : "—"}</div>
                        {c.spent > 0 && (
                          <div className="w-full bg-muted rounded-full h-1 mt-1">
                            <div className="bg-primary rounded-full h-1" style={{ width: `${Math.min(pctSpent, 100)}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="text-right py-2.5 px-2">{c.impressions}</td>
                      <td className="text-right py-2.5 px-2">{c.conversions > 0 ? c.conversions.toLocaleString("en-GB") : "—"}</td>
                      <td className="text-right py-2.5 px-2 font-semibold">
                        {c.roas > 0 ? (
                          <span className={c.roas >= 5 ? "text-slate-800" : c.roas >= 3 ? "text-slate-600" : "text-slate-400"}>
                            {c.roas}x
                          </span>
                        ) : "—"}
                      </td>
                      <td className="text-right py-2.5 px-2">
                        <div className="flex gap-1 justify-end flex-wrap">
                          {c.channels.slice(0, 2).map((ch) => (
                            <span key={ch} className="text-[9px] px-1 py-0.5 bg-muted rounded border border-border whitespace-nowrap">{ch}</span>
                          ))}
                          {c.channels.length > 2 && <span className="text-[9px] text-muted-foreground">+{c.channels.length - 2}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
