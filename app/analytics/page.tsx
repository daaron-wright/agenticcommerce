"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import Link from "next/link";
import {
  visualizationCardClass,
  visualizationChartFrameClass,
  visualizationGrid,
  visualizationLegendStyle,
  visualizationPalette,
  visualizationTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";

const weeklyData = [
  { week: "W1", impressions: 420000, clicks: 12400, conversions: 820, spend: 18200 },
  { week: "W2", impressions: 480000, clicks: 14100, conversions: 950, spend: 20100 },
  { week: "W3", impressions: 510000, clicks: 15800, conversions: 1020, spend: 22400 },
  { week: "W4", impressions: 490000, clicks: 14600, conversions: 980, spend: 21300 },
  { week: "W5", impressions: 540000, clicks: 16900, conversions: 1140, spend: 23800 },
  { week: "W6", impressions: 580000, clicks: 18200, conversions: 1280, spend: 25100 },
];

const channelPerf = [
  { channel: "Google", roas: 6.2, spend: 45000, revenue: 279000 },
  { channel: "Facebook", roas: 4.8, spend: 62000, revenue: 297600 },
  { channel: "TikTok", roas: 3.1, spend: 29000, revenue: 89900 },
  { channel: "Snapchat", roas: 2.9, spend: 8000, revenue: 23200 },
];

const kpis = [
  { label: "Total Spend", value: "£164K", change: "-10%", dir: "down" },
  { label: "Total Revenue", value: "£1.05M", change: "+44%", dir: "up" },
  { label: "Blended ROAS", value: "6.4x", change: "+8%", dir: "up" },
  { label: "Conversion Rate", value: "4.2%", change: "+0.3pp", dir: "up" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Recent from chat */}
      <RecentFromChat category="analytics" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#3d3c3c]">Performance Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Cross-channel marketing performance overview</p>
        </div>
        <Link href="/mmm" prefetch={false}>
          <Button size="sm" variant="outline" className="gap-2">
            <ExternalLink className="h-3.5 w-3.5" /> Deep dive in MMM
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={visualizationCardClass}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <span className={`text-xs font-medium flex items-center gap-0.5 mt-1 text-stone-500`}>
                {kpi.dir === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.change} vs last period
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend & conversions trend */}
        <Card className={visualizationCardClass}>
          <CardHeader>
            <CardTitle className="text-sm">Weekly Spend vs Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={visualizationChartFrameClass}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid {...visualizationGrid} vertical={false} />
                  <XAxis dataKey="week" tick={visualizationTick} tickLine={false} axisLine={false} />
                  <YAxis tick={visualizationTick} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={visualizationTooltipStyle} />
                  <Legend wrapperStyle={visualizationLegendStyle} />
                  <Area type="monotone" dataKey="conversions" stroke={visualizationPalette.ink} fill={visualizationPalette.fillStrong} strokeWidth={2} name="Conversions" />
                  <Area type="monotone" dataKey="clicks" stroke={visualizationPalette.mist} fill={visualizationPalette.fillMuted} strokeWidth={2} name="Clicks" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel ROAS */}
        <Card className={visualizationCardClass}>
          <CardHeader>
            <CardTitle className="text-sm">ROAS by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={visualizationChartFrameClass}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={channelPerf}>
                  <CartesianGrid {...visualizationGrid} vertical={false} />
                  <XAxis dataKey="channel" tick={visualizationTick} tickLine={false} axisLine={false} />
                  <YAxis tick={visualizationTick} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={visualizationTooltipStyle}
                    formatter={(value: unknown) => [`${typeof value === "number" ? value.toFixed(1) : value}x`, "ROAS"]}
                  />
                  <Bar dataKey="roas" fill={visualizationPalette.teal} radius={[4, 4, 0, 0]} name="ROAS" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel breakdown table */}
      <Card className={visualizationCardClass}>
        <CardHeader>
          <CardTitle className="text-sm">Channel Breakdown</CardTitle>
          <CardDescription className="text-xs">Last 6 weeks performance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold text-muted-foreground">Channel</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Spend (£)</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Revenue (£)</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">ROAS</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {channelPerf.map((ch) => (
                <tr key={ch.channel} className="border-b hover:bg-muted/30">
                  <td className="py-2.5 font-medium">{ch.channel}</td>
                  <td className="text-right py-2.5">{ch.spend.toLocaleString("en-GB")}</td>
                  <td className="text-right py-2.5">{ch.revenue.toLocaleString("en-GB")}</td>
                  <td className="text-right py-2.5 font-semibold">{ch.roas}x</td>
                  <td className="text-right py-2.5">
                    <Badge variant={ch.roas >= 5 ? "default" : ch.roas >= 3 ? "secondary" : "outline"} className="text-[10px]">
                      {ch.roas >= 5 ? "Strong" : ch.roas >= 3 ? "Moderate" : "Weak"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
