import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyPerformancePoint, FunnelStage, RegionSplit } from "@/lib/dashboard/mock-ecommerce";
import {
  visualizationCardClass,
  visualizationChartFrameClass,
  visualizationGrid,
  visualizationPalette,
  visualizationTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

type OverviewChartsProps = {
  dailyPerformance: DailyPerformancePoint[];
  funnel: FunnelStage[];
  regions: RegionSplit[];
};

export function OverviewCharts({ dailyPerformance, funnel, regions }: OverviewChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className={`${visualizationCardClass} xl:col-span-2`}>
        <CardHeader>
          <CardTitle className="text-sm">Revenue & Orders Trend</CardTitle>
          <CardDescription className="text-xs">Last 14 days performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Revenue</p>
            <div className={visualizationChartFrameClass}>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={dailyPerformance}>
                  <CartesianGrid {...visualizationGrid} vertical={false} />
                  <XAxis dataKey="day" tick={visualizationTick} tickLine={false} axisLine={false} />
                  <YAxis tick={visualizationTick} tickFormatter={(value) => formatCompactCurrency(Number(value))} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={visualizationTooltipStyle}
                    formatter={(value) => [
                      formatCompactCurrency(Number(value ?? 0)),
                      "Revenue",
                    ]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke={visualizationPalette.ink} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Orders</p>
            <div className={visualizationChartFrameClass}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={dailyPerformance}>
                  <CartesianGrid {...visualizationGrid} vertical={false} />
                  <XAxis dataKey="day" tick={visualizationTick} tickLine={false} axisLine={false} />
                  <YAxis tick={visualizationTick} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={visualizationTooltipStyle}
                    formatter={(value) => [
                      Number(value ?? 0).toLocaleString("en-GB"),
                      "Orders",
                    ]}
                  />
                  <Bar dataKey="orders" fill={visualizationPalette.teal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className={visualizationCardClass}>
          <CardHeader>
            <CardTitle className="text-sm">Funnel Health</CardTitle>
            <CardDescription className="text-xs">Session to purchase conversion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((stage, index) => {
              const next = funnel[index + 1];
              const dropOff = next ? (((stage.users - next.users) / stage.users) * 100).toFixed(1) : null;
              return (
                <div key={stage.stage} className="rounded-md border p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">{stage.users.toLocaleString("en-GB")}</span>
                  </div>
                  {dropOff && <p className="text-[10px] text-muted-foreground mt-1">Drop-off to next stage: {dropOff}%</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className={visualizationCardClass}>
          <CardHeader>
            <CardTitle className="text-sm">Revenue by Region</CardTitle>
            <CardDescription className="text-xs">Top geographies by sales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {regions.map((region) => (
              <div key={region.region} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span>{region.region}</span>
                  <span className="font-medium">{formatCompactCurrency(region.revenue)}</span>
                </div>
                <div className="h-2 rounded bg-stone-200 overflow-hidden">
                  <div
                    className="h-2"
                    style={{
                      width: `${Math.min(100, (region.revenue / regions[0].revenue) * 100)}%`,
                      backgroundColor: visualizationPalette.teal,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
