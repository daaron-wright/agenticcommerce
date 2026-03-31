"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
  { week: "W1", forecastedDemand: 6200, actualDemand: 6480, wasteUnits: 268, fillRate: 95.6 },
  { week: "W2", forecastedDemand: 6540, actualDemand: 6380, wasteUnits: 312, fillRate: 94.8 },
  { week: "W3", forecastedDemand: 6820, actualDemand: 7140, wasteUnits: 284, fillRate: 96.2 },
  { week: "W4", forecastedDemand: 6600, actualDemand: 6720, wasteUnits: 296, fillRate: 95.4 },
  { week: "W5", forecastedDemand: 7100, actualDemand: 7380, wasteUnits: 310, fillRate: 94.9 },
  { week: "W6", forecastedDemand: 7400, actualDemand: 7200, wasteUnits: 248, fillRate: 96.8 },
];

const categoryPerf = [
  { category: "Dairy", forecastAccuracy: 72, demandVolume: 18500, wasteRate: 9.2, fillRate: 89 },
  { category: "Bakery", forecastAccuracy: 68, demandVolume: 12400, wasteRate: 11.8, fillRate: 86 },
  { category: "Produce", forecastAccuracy: 78, demandVolume: 22100, wasteRate: 6.4, fillRate: 94 },
  { category: "Deli", forecastAccuracy: 82, demandVolume: 8600, wasteRate: 5.1, fillRate: 96 },
];

const kpis = [
  { label: "Forecast Accuracy", value: "76%", change: "+2.1%", dir: "up" },
  { label: "Demand Variance", value: "±12%", change: "-1.8%", dir: "down" },
  { label: "Waste Rate", value: "8.2%", change: "-0.4%", dir: "down" },
  { label: "Fill Rate", value: "91%", change: "+1.2%", dir: "up" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <RecentFromChat category="analytics" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demand Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Cross-category demand performance overview</p>
        </div>
        <Link href="/mmm" prefetch={false}>
          <Button size="sm" variant="outline" className="gap-2">
            <ExternalLink className="h-3.5 w-3.5" /> Deep dive in Demand Drivers
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={visualizationCardClass}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <span className="text-xs font-medium flex items-center gap-0.5 mt-1 text-slate-500">
                {kpi.dir === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.change} vs last period
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={visualizationCardClass}>
          <CardHeader>
            <CardTitle className="text-sm">Demand vs Forecast Trend</CardTitle>
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
                  <Area type="monotone" dataKey="forecastedDemand" stroke={visualizationPalette.mist} fill={visualizationPalette.fillMuted} strokeWidth={2} name="Forecasted Demand" />
                  <Area type="monotone" dataKey="actualDemand" stroke={visualizationPalette.ink} fill={visualizationPalette.fillStrong} strokeWidth={2} name="Actual Demand" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className={visualizationCardClass}>
          <CardHeader>
            <CardTitle className="text-sm">Forecast Accuracy by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={visualizationChartFrameClass}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryPerf}>
                  <CartesianGrid {...visualizationGrid} vertical={false} />
                  <XAxis dataKey="category" tick={visualizationTick} tickLine={false} axisLine={false} />
                  <YAxis tick={visualizationTick} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={visualizationTooltipStyle}
                    formatter={(value: unknown) => [`${typeof value === "number" ? value : value}%`, "Forecast Accuracy"]}
                  />
                  <Bar dataKey="forecastAccuracy" fill={visualizationPalette.teal} radius={[4, 4, 0, 0]} name="Forecast Accuracy" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={visualizationCardClass}>
        <CardHeader>
          <CardTitle className="text-sm">Category Breakdown</CardTitle>
          <CardDescription className="text-xs">Last 6 weeks performance summary</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold text-muted-foreground">Category</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Demand Volume</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Forecast Accuracy</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Waste Rate</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Fill Rate</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {categoryPerf.map((c) => (
                <tr key={c.category} className="border-b hover:bg-muted/30">
                  <td className="py-2.5 font-medium">{c.category}</td>
                  <td className="text-right py-2.5">{c.demandVolume.toLocaleString("en-GB")} units</td>
                  <td className="text-right py-2.5 font-semibold">
                    <span className={cn(c.forecastAccuracy >= 80 ? "text-green-600" : c.forecastAccuracy >= 70 ? "text-amber-600" : "text-red-600")}>
                      {c.forecastAccuracy}%
                    </span>
                  </td>
                  <td className="text-right py-2.5">
                    <span className={cn("font-medium", c.wasteRate <= 6 ? "text-green-600" : c.wasteRate <= 9 ? "text-amber-600" : "text-red-600")}>
                      {c.wasteRate}%
                    </span>
                  </td>
                  <td className="text-right py-2.5 font-semibold">{c.fillRate}%</td>
                  <td className="text-right py-2.5">
                    <Badge variant={c.forecastAccuracy >= 80 ? "default" : c.forecastAccuracy >= 70 ? "secondary" : "outline"} className="text-[10px]">
                      {c.forecastAccuracy >= 80 ? "Strong" : c.forecastAccuracy >= 70 ? "Moderate" : "Needs Attention"}
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
