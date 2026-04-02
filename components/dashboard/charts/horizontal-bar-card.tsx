"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  visualizationCardClass,
  visualizationPalette,
} from "@/lib/visualization-theme";
import { cn } from "@/lib/utils";

type BarItem = {
  label: string;
  value: string;
  barWidth: number; // 0-100
  highlight?: boolean;
};

type HorizontalBarCardProps = {
  title: string;
  subtitle?: string;
  items: BarItem[];
  className?: string;
};

export function HorizontalBarCard({ title, subtitle, items, className }: HorizontalBarCardProps) {
  return (
    <Card className={cn(visualizationCardClass, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#3d3c3c]">{title}</CardTitle>
        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600">{item.label}</span>
              <span className="font-semibold text-[#3d3c3c]">{item.value}</span>
            </div>
            <div className="h-6 w-full rounded bg-stone-100">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${item.barWidth}%`,
                  backgroundColor: item.highlight ? "#d4f542" : visualizationPalette.ink,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* Grouped comparison bars (MTA vs Ad Platform vs MMM vs Incrementality) */
type ComparisonBarItem = {
  model: string;
  roas: number;
  highlight?: boolean;
};

type ComparisonBarCardProps = {
  title: string;
  subtitle?: string;
  items: ComparisonBarItem[];
  className?: string;
};

export function ComparisonBarCard({ title, subtitle, items, className }: ComparisonBarCardProps) {
  const max = Math.max(...items.map((i) => i.roas));

  return (
    <Card className={cn(visualizationCardClass, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#3d3c3c]">{title}</CardTitle>
        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4 h-48">
          {items.map((item) => {
            const pct = (item.roas / max) * 100;
            return (
              <div key={item.model} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className="text-xs font-semibold text-[#3d3c3c] mb-1">{item.roas}x</span>
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: item.highlight ? "#d4f542" : visualizationPalette.ink,
                  }}
                />
                <span className="mt-2 text-[10px] text-stone-500 text-center leading-tight">{item.model}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
