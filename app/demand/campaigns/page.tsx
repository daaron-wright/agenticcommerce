"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Zap } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { cn } from "@/lib/utils";
import { NewActionDialog } from "@/components/campaigns/new-action-dialog";

const planningActions = [
  { id: 1, name: "Dairy Heatwave Adjustment", status: "Active", category: "Dairy", forecastChange: "+15%", wasteImpact: "120 units/day", fillRateImpact: "+3.2%", drivers: ["Weather", "Demand Sensing"], agentManaged: true },
  { id: 2, name: "Bakery Mid-Week Reduction", status: "Active", category: "Bakery", forecastChange: "-20% Tue/Wed", wasteImpact: "85 units/day", fillRateImpact: "—", drivers: ["Day-of-Week", "Historical"], agentManaged: true },
  { id: 3, name: "BOGO Strawberry Pre-Position", status: "Active", category: "Produce", forecastChange: "+110% lift", wasteImpact: "—", fillRateImpact: "+8.5%", drivers: ["Promotions", "Historical"], agentManaged: true },
  { id: 4, name: "Easter Seasonal Uplift", status: "Scheduled", category: "All Categories", forecastChange: "+15% seasonal", wasteImpact: "—", fillRateImpact: "+2.1%", drivers: ["Seasonality", "Calendar"], agentManaged: true },
  { id: 5, name: "Summer BBQ Range Launch", status: "Paused", category: "Produce, Deli", forecastChange: "New product", wasteImpact: "—", fillRateImpact: "—", drivers: ["Social Trends"], agentManaged: false },
];

const statusColors: Record<string, string> = {
  "Active": "bg-emerald-50 text-emerald-700",
  "Scheduled": "bg-stone-100 text-stone-700",
  "Paused": "bg-stone-50 text-stone-500",
};

export default function CampaignsPage() {
  const [showNew, setShowNew] = useState(false);
  const active = planningActions.filter(c => c.status === "Active");
  const categories = new Set(planningActions.flatMap(a => a.category.split(", ")));
  const totalWasteReduction = "205 units/day";

  return (
    <div className="space-y-6">
      <NewActionDialog open={showNew} onOpenChange={setShowNew} />
      <RecentFromChat category="campaigns" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planning Actions</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and monitor your demand planning actions</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowNew(true)}>
          <Plus className="h-3.5 w-3.5" /> New Action
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Actions", value: String(active.length) },
          { label: "Categories Covered", value: String(categories.size) },
          { label: "Total Waste Reduction", value: totalWasteReduction },
          { label: "Agent-Managed", value: String(planningActions.filter(c => c.agentManaged).length) },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">All Planning Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Planning Action</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Category</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">Forecast Change</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">Waste Impact</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground whitespace-nowrap">Fill Rate Impact</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Drivers</th>
                </tr>
              </thead>
              <tbody>
                {planningActions.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{a.name}</span>
                        {a.agentManaged && <Zap className="h-3 w-3 text-stone-500 flex-shrink-0" title="Agent managed" />}
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColors[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="py-2.5 px-2 text-muted-foreground">{a.category}</td>
                    <td className="text-right py-2.5 px-2 font-semibold">{a.forecastChange}</td>
                    <td className="text-right py-2.5 px-2">
                      <span className={cn("font-medium", a.wasteImpact !== "—" ? "text-green-600" : "text-muted-foreground")}>{a.wasteImpact}</span>
                    </td>
                    <td className="text-right py-2.5 px-2">
                      <span className={cn("font-medium", a.fillRateImpact !== "—" ? "text-[#29707a]" : "text-muted-foreground")}>{a.fillRateImpact}</span>
                    </td>
                    <td className="text-right py-2.5 px-2">
                      <div className="flex gap-1 justify-end flex-wrap">
                        {a.drivers.map((d) => (
                          <span key={d} className="text-[9px] px-1 py-0.5 bg-muted rounded border border-border whitespace-nowrap">{d}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
