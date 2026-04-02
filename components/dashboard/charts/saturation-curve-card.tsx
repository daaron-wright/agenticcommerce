"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  visualizationCardClass,
  visualizationGrid,
  visualizationPalette,
  visualizationSmallTick,
  visualizationTooltipStyle,
} from "@/lib/visualization-theme";
import { cn } from "@/lib/utils";
import type { SaturationChannelData } from "@/lib/dashboard/mock-mmm-saturation";

type SaturationCurveCardProps = {
  channel: SaturationChannelData;
  className?: string;
};

export function SaturationCurveCard({ channel, className }: SaturationCurveCardProps) {
  return (
    <Card className={cn(visualizationCardClass, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#3d3c3c]">
          {channel.channel}
        </CardTitle>
        <p className="text-xs text-stone-500">Saturation curve — spend vs profit</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-3 text-[10px] text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#6366f1]" /> Proposed spend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full border-2 border-stone-400 bg-white" /> Actual spend
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-stone-300" /> Saturation
          </span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={channel.curveData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid {...visualizationGrid} />
            <XAxis
              dataKey="spend"
              type="number"
              tick={visualizationSmallTick}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              label={{ value: "Marketing spend (USD)", position: "bottom", offset: 6, style: { fontSize: 10, fill: visualizationPalette.axis } }}
            />
            <YAxis
              dataKey="profit"
              type="number"
              tick={visualizationSmallTick}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              label={{ value: "Net gross profit (USD)", angle: -90, position: "insideLeft", offset: -5, style: { fontSize: 10, fill: visualizationPalette.axis } }}
            />
            <Tooltip
              contentStyle={visualizationTooltipStyle}
              formatter={(value: number) => `$${value.toLocaleString()}`}
              labelFormatter={(v) => `Spend: $${Number(v).toLocaleString()}`}
            />
            <Line
              dataKey="profit"
              stroke={visualizationPalette.ink}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceDot
              x={channel.actualSpend}
              y={channel.actualProfit}
              r={6}
              fill="white"
              stroke={visualizationPalette.ink}
              strokeWidth={2}
            />
            <ReferenceDot
              x={channel.proposedSpend}
              y={channel.proposedProfit}
              r={6}
              fill="#6366f1"
              stroke="#6366f1"
              strokeWidth={2}
            />
            <ReferenceDot
              x={channel.saturationSpend}
              y={channel.saturationProfit}
              r={5}
              fill={visualizationPalette.cloud}
              stroke={visualizationPalette.steel}
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
