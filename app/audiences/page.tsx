"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Zap } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { PageBanner } from "@/components/ui/page-banner";
import { NewSegmentDialog } from "@/components/audiences/new-segment-dialog";

const segments = [
  { id: 1, name: "High-Value Loyalists", size: 2840, description: "LTV > £40K, purchase frequency > 4x/year", channels: ["Email", "Google PMAX"], status: "Active", lastUpdated: "Today", type: "CDP" },
  { id: 2, name: "At-Risk High Value", size: 512, description: "High LTV but 30+ days since last purchase", channels: ["Facebook Sale", "Email"], status: "Active", lastUpdated: "Yesterday", type: "Agent" },
  { id: 3, name: "Deal Hunters", size: 4210, description: "Engagement peaks during promotions, price-sensitive", channels: ["TikTok Sale", "Snapchat"], status: "Active", lastUpdated: "2 days ago", type: "CDP" },
  { id: 4, name: "Brand New Customers", size: 1890, description: "First purchase in last 30 days", channels: ["Google Generic", "Facebook Awareness"], status: "Active", lastUpdated: "Today", type: "CDP" },
  { id: 5, name: "Dormant Re-engagement", size: 3120, description: "No purchase in 90+ days, previously active", channels: ["Email", "Facebook Traffic"], status: "Paused", lastUpdated: "1 week ago", type: "Agent" },
  { id: 6, name: "Summer Collection Fans", size: 6800, description: "Engaged with summer content, warm-weather purchasers", channels: ["TikTok Awareness", "Instagram"], status: "Active", lastUpdated: "3 days ago", type: "Manual" },
];

const typeColors: Record<string, string> = {
  "CDP": "bg-blue-50 text-blue-700 border-blue-200",
  "Agent": "bg-purple-50 text-purple-700 border-purple-200",
  "Manual": "bg-gray-50 text-gray-600 border-gray-200",
};

export default function AudiencesPage() {
  const [showNew, setShowNew] = useState(false);
  const totalReach = segments.filter(s => s.status === "Active").reduce((sum, s) => sum + s.size, 0);

  return (
    <div className="space-y-6">
      <NewSegmentDialog open={showNew} onOpenChange={setShowNew} />
      {/* Recent from chat */}
      <RecentFromChat category="audiences" />

      <PageBanner
        title="Audiences"
        description="CDP-powered segments for targeted marketing activation"
        actions={
          <Button size="sm" className="gap-2" onClick={() => setShowNew(true)}>
            <Plus className="h-3.5 w-3.5" /> New Segment
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Total Segments</p>
            <p className="text-2xl font-bold">{segments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Active Reach</p>
            <p className="text-2xl font-bold">{totalReach.toLocaleString("en-GB")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Agent-built</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{segments.filter(s => s.type === "Agent").length}</p>
              <Zap className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segments grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {segments.map((seg) => (
          <Card key={seg.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                  {seg.channels.map((ch) => (
                    <span key={ch} className="text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border">{ch}</span>
                  ))}
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-base font-bold">{seg.size.toLocaleString("en-GB")}</p>
                  <p className="text-[10px] text-muted-foreground">customers</p>
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
