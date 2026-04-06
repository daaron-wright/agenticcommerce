"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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

type ScatterPoint = {
  x: number;
  y: number;
  label?: string;
};

type ScatterChartCardProps = {
  title: string;
  subtitle?: string;
  data: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  className?: string;
};

const SCATTER_COLORS = [
  visualizationPalette.teal,
  visualizationPalette.coral,
  visualizationPalette.sky,
  visualizationPalette.sand,
  "#6366f1",
  "#ec4899",
  "#f97316",
];

export function ScatterChartCard({
  title,
  subtitle,
  data,
  xLabel,
  yLabel,
  className,
}: ScatterChartCardProps) {
  return (
    <Card className={cn(visualizationCardClass, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#3d3c3c]">{title}</CardTitle>
        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid {...visualizationGrid} />
            <XAxis
              type="number"
              dataKey="x"
              tick={visualizationSmallTick}
              label={{ value: xLabel, position: "bottom", offset: 10, style: { fontSize: 10, fill: visualizationPalette.axis } }}
            />
            <YAxis
              type="number"
              dataKey="y"
              tick={visualizationSmallTick}
              label={{ value: yLabel, angle: -90, position: "insideLeft", offset: -5, style: { fontSize: 10, fill: visualizationPalette.axis } }}
            />
            <Tooltip
              contentStyle={visualizationTooltipStyle}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Scatter
              data={data}
              fill={visualizationPalette.teal}
              fillOpacity={0.7}
              strokeWidth={0}
            >
              {data.map((_, idx) => (
                <circle
                  key={idx}
                  fill={SCATTER_COLORS[idx % SCATTER_COLORS.length]}
                  fillOpacity={0.75}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
