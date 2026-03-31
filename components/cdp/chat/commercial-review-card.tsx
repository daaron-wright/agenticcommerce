"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import {
  WEEKLY_COMMERCIAL_REVIEW,
  formatCommercialCurrency,
} from "@/lib/commercial-review";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  visualizationChartFrameClass,
  visualizationGrid,
  visualizationLegendStyle,
  visualizationPalette,
  visualizationTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";

function statusPill(status: "strong" | "watch" | "risk") {
  return {
    strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
    watch: "bg-amber-50 text-amber-700 border-amber-200",
    risk: "bg-rose-50 text-rose-700 border-rose-200",
  }[status];
}

function takeawayTone(tone: "positive" | "warning") {
  return tone === "positive"
    ? "border-emerald-200 bg-emerald-50/50"
    : "border-amber-200 bg-amber-50/50";
}

export function CommercialReviewCard() {
  const { user } = useAuth();
  const canExecuteAI = user ? hasPermissionForUser(user, "ai_action_execute") : false;

  return (
    <Card className="border-slate-200 shadow-none overflow-hidden">
      <CardHeader className="border-b bg-slate-50/70 pb-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm">{WEEKLY_COMMERCIAL_REVIEW.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {WEEKLY_COMMERCIAL_REVIEW.periodLabel} · {WEEKLY_COMMERCIAL_REVIEW.comparisonLabel}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Key takeaways
          </h4>
          <div className="grid gap-2 lg:grid-cols-2">
            {WEEKLY_COMMERCIAL_REVIEW.keyTakeaways.map((item) => (
              <div
                key={item.title}
                className={cn("rounded-lg border p-3 space-y-1.5", takeawayTone(item.tone))}
              >
                <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-700 leading-relaxed">{item.narrative}</p>
                <p className="text-[11px] font-medium text-slate-900">{item.metric}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              KPI performance
            </h4>
            <span className="text-[10px] text-muted-foreground">
              {WEEKLY_COMMERCIAL_REVIEW.yoyComparisonLabel}
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs min-w-[560px]">
              <thead>
                <tr className="bg-slate-50 text-muted-foreground">
                  <th className="text-left px-3 py-2 font-semibold">KPI</th>
                  <th className="text-right px-3 py-2 font-semibold">Value</th>
                  <th className="text-right px-3 py-2 font-semibold">WoW</th>
                  <th className="text-right px-3 py-2 font-semibold">YoY</th>
                  <th className="text-right px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {WEEKLY_COMMERCIAL_REVIEW.kpis.map((row) => (
                  <tr key={row.label} className="border-t border-slate-200">
                    <td className="px-3 py-2 font-medium text-slate-900">{row.label}</td>
                    <td className="px-3 py-2 text-right">{row.value}</td>
                    <td className="px-3 py-2 text-right">{row.wow}</td>
                    <td className="px-3 py-2 text-right">{row.yoy}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", statusPill(row.status))}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Market breakdown
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs min-w-[520px]">
                <thead>
                  <tr className="bg-slate-50 text-muted-foreground">
                    <th className="text-left px-3 py-2 font-semibold">Market</th>
                    <th className="text-right px-3 py-2 font-semibold">Gross sales</th>
                    <th className="text-right px-3 py-2 font-semibold">WoW</th>
                    <th className="text-right px-3 py-2 font-semibold">YoY</th>
                    <th className="text-right px-3 py-2 font-semibold">CAC</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKLY_COMMERCIAL_REVIEW.marketBreakdown.map((row) => (
                    <tr key={row.market} className="border-t border-slate-200">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{row.market}</div>
                        <div className="text-[10px] text-muted-foreground">{row.note}</div>
                      </td>
                      <td className="px-3 py-2 text-right">{formatCommercialCurrency(row.grossSales)}</td>
                      <td className="px-3 py-2 text-right">{row.wow}</td>
                      <td className="px-3 py-2 text-right">{row.yoy}</td>
                      <td className="px-3 py-2 text-right">{row.cac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 min-w-0">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Paid channel performance
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs min-w-[560px]">
                <thead>
                  <tr className="bg-slate-50 text-muted-foreground">
                    <th className="text-left px-3 py-2 font-semibold">Channel</th>
                    <th className="text-right px-3 py-2 font-semibold">Spend</th>
                    <th className="text-right px-3 py-2 font-semibold">Gross sales</th>
                    <th className="text-right px-3 py-2 font-semibold">WoW sales</th>
                    <th className="text-right px-3 py-2 font-semibold">ROAS</th>
                    <th className="text-right px-3 py-2 font-semibold">CAC</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKLY_COMMERCIAL_REVIEW.paidChannelPerformance.map((row) => (
                    <tr key={row.channel} className="border-t border-slate-200">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{row.channel}</div>
                        <div className="text-[10px] text-muted-foreground">{row.action}</div>
                      </td>
                      <td className="px-3 py-2 text-right">{formatCommercialCurrency(row.spend)}</td>
                      <td className="px-3 py-2 text-right">{formatCommercialCurrency(row.grossSales)}</td>
                      <td className="px-3 py-2 text-right">{row.wowSales}</td>
                      <td className="px-3 py-2 text-right">{row.roas}</td>
                      <td className="px-3 py-2 text-right">{row.cac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Flags for discussion
          </h4>
          <ul className="space-y-2">
            {WEEKLY_COMMERCIAL_REVIEW.discussionFlags.map((flag) => (
              <li key={flag} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 leading-relaxed">
                {flag}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Performance trend (sales, ROAS, CAC)
          </h4>
          <div className={visualizationChartFrameClass}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={WEEKLY_COMMERCIAL_REVIEW.performanceTrend}
                margin={{ top: 10, right: 10, bottom: 10, left: 6 }}
              >
                <CartesianGrid {...visualizationGrid} vertical={false} />
                <XAxis dataKey="day" tick={visualizationTick} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="sales"
                  tickFormatter={(value: number) => `${Math.round(value / 1000)}K`}
                  tick={visualizationTick}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis yAxisId="roas" orientation="right" hide domain={[2.5, 4]} />
                <YAxis yAxisId="cac" orientation="right" hide domain={[22, 34]} />
                <Tooltip
                  contentStyle={visualizationTooltipStyle}
                  formatter={(value, name) => {
                    const metricName = typeof name === "string" ? name : String(name ?? "");
                    const numericValue = Number(value ?? 0);
                    if (metricName === "roas") return [`${numericValue.toFixed(1)}x`, "ROAS"];
                    if (metricName === "cac") return [`£${numericValue.toFixed(2)}`, "CAC"];

                    return [
                      formatCommercialCurrency(numericValue),
                      metricName === "grossSalesCurrent"
                        ? "Last week"
                        : metricName === "grossSalesPrevious"
                          ? "Previous week"
                          : "Last year",
                    ];
                  }}
                />
                <Legend
                  wrapperStyle={visualizationLegendStyle}
                  formatter={(value) =>
                    value === "grossSalesCurrent"
                      ? "Last week"
                      : value === "grossSalesPrevious"
                        ? "Previous week"
                        : value === "grossSalesLastYear"
                          ? "Last year"
                          : value === "roas"
                            ? "ROAS"
                            : "CAC"
                  }
                />
                <Line yAxisId="sales" type="monotone" dataKey="grossSalesCurrent" stroke={visualizationPalette.ink} strokeWidth={2.5} dot={false} />
                <Line yAxisId="sales" type="monotone" dataKey="grossSalesPrevious" stroke={visualizationPalette.steel} strokeWidth={2} strokeDasharray="5 3" dot={false} />
                <Line yAxisId="sales" type="monotone" dataKey="grossSalesLastYear" stroke={visualizationPalette.cloud} strokeWidth={2} dot={false} />
                <Line yAxisId="roas" type="monotone" dataKey="roas" stroke={visualizationPalette.success} strokeWidth={1.8} dot={false} />
                <Line yAxisId="cac" type="monotone" dataKey="cac" stroke={visualizationPalette.danger} strokeWidth={1.8} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            AI recommendations
          </h4>
          <div className="space-y-2">
            {WEEKLY_COMMERCIAL_REVIEW.recommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900">{recommendation.title}</p>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                      recommendation.priority === "high"
                        ? "bg-rose-100 text-rose-700"
                        : recommendation.priority === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {recommendation.priority}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-700">{recommendation.action}</p>
                <p className="mt-1 text-[11px] font-medium text-emerald-700">{recommendation.impact}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href={`/chat?actionId=${recommendation.nbaActionId}&intent=${canExecuteAI ? "execute" : "review"}&prompt=${encodeURIComponent(
                      canExecuteAI ? recommendation.executePrompt : recommendation.reviewPrompt
                    )}`}
                    className="inline-flex items-center rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-slate-900"
                  >
                    {canExecuteAI ? "Execute in chat" : "Send for review"}
                  </Link>
                  <Link
                    href={`/chat?prompt=${encodeURIComponent(recommendation.reviewPrompt)}`}
                    className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-white"
                  >
                    Send for review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
