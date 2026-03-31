"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus, Zap } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { NewSegmentDialog } from "@/components/audiences/new-segment-dialog";

const segments = [
  { id: 1, name: "High-Forecastability Staples", size: 12400, description: "Stable-demand items: milk, eggs, bread, butter. 95%+ forecast accuracy achievable", models: ["Baseline", "Seasonality"], status: "Active", lastUpdated: "Today", type: "Touchless" },
  { id: 2, name: "Weather-Sensitive Perishables", size: 3200, description: "Items with >15% demand variance from temperature: dairy, beverages, salads", models: ["Weather", "Baseline"], status: "Active", lastUpdated: "Today", type: "Driver-Based" },
  { id: 3, name: "Promo-Driven Items", size: 2800, description: "Items with >1.5x demand lift during promotions: fresh produce, snacks", models: ["Promotions", "Baseline"], status: "Active", lastUpdated: "Yesterday", type: "Driver-Based" },
  { id: 4, name: "Day-of-Week Cyclic", size: 1600, description: "Items with >20% intra-week variance: bakery, prepared meals, deli", models: ["Day-of-Week", "Baseline"], status: "Active", lastUpdated: "Today", type: "Driver-Based" },
  { id: 5, name: "New/Trend Products", size: 1200, description: "Items <90 days in assortment or trending on social: seasonal fruit, viral items", models: ["Social", "Baseline"], status: "Active", lastUpdated: "2 days ago", type: "Planner-Assisted" },
  { id: 6, name: "Low-Forecastability Items", size: 800, description: "Highly volatile items requiring planner judgment: event-driven, hyper-local", models: ["Manual Override"], status: "Paused", lastUpdated: "1 week ago", type: "Planner-Assisted" },
];

const typeColors: Record<string, string> = {
  "Touchless": "bg-green-50 text-green-700 border-green-200",
  "Driver-Based": "bg-blue-50 text-blue-700 border-blue-200",
  "Planner-Assisted": "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AudiencesPage() {
  const [showNew, setShowNew] = useState(false);
  const touchlessCoverage = segments
    .filter(s => s.status === "Active" && (s.type === "Touchless" || s.type === "Driver-Based"))
    .reduce((sum, s) => sum + s.size, 0);

  return (
    <div className="space-y-6">
      <NewSegmentDialog open={showNew} onOpenChange={setShowNew} />
      <RecentFromChat category="audiences" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SKU Segments</h1>
          <p className="text-muted-foreground text-sm mt-1">Forecastability-based segmentation for touchless demand planning</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowNew(true)}>
          <Plus className="h-3.5 w-3.5" /> New Segment
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Total SKU Segments</p>
            <p className="text-2xl font-bold">{segments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Touchless Coverage</p>
            <p className="text-2xl font-bold">{touchlessCoverage.toLocaleString("en-GB")} SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Planner-Assisted</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{segments.filter(s => s.type === "Planner-Assisted").length}</p>
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {segments.map((seg) => (
          <Card key={seg.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <CardTitle className="text-sm">{seg.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${typeColors[seg.type]}`}>{seg.type}</span>
                  <Badge variant={seg.status === "Active" ? "default" : "secondary"} className="text-[10px]">{seg.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{seg.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {seg.models.map((m) => (
                    <span key={m} className="text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border">{m}</span>
                  ))}
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-base font-bold">{seg.size.toLocaleString("en-GB")}</p>
                  <p className="text-[10px] text-muted-foreground">SKUs</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Updated {seg.lastUpdated}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
