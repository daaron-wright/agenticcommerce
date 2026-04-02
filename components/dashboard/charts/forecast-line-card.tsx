"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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

type ForecastPoint = {
  label: string;
  actual: number | null;
  forecast: number | null;
};

type ForecastLineCardProps = {
  title: string;
  subtitle?: string;
  data: ForecastPoint[];
  yLabel?: string;
  className?: string;
};

export function ForecastLineCard({
  title,
  subtitle,
  data,
  yLabel = "Value",
  className,
}: ForecastLineCardProps) {
  return (
    <Card className={cn(visualizationCardClass, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#3d3c3c]">{title}</CardTitle>
        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-3 text-[10px] text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-[#6366f1]" /> Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#6366f1]" /> Forecast
          </span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid {...visualizationGrid} />
            <XAxis dataKey="label" tick={visualizationSmallTick} />
            <YAxis
              tick={visualizationSmallTick}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              label={{ value: yLabel, angle: -90, position: "insideLeft", offset: -5, style: { fontSize: 10, fill: visualizationPalette.axis } }}
            />
            <Tooltip
              contentStyle={visualizationTooltipStyle}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Line
              dataKey="actual"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: "#6366f1" }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="forecast"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: "#6366f1", strokeDasharray: "0" }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
