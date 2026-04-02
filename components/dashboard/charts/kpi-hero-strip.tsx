"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type HeroKpi = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

type KpiHeroStripProps = {
  kpis: HeroKpi[];
  className?: string;
};

export function KpiHeroStrip({ kpis, className }: KpiHeroStripProps) {
  return (
    <div className={cn("grid gap-4 grid-cols-2 xl:grid-cols-4", className)}>
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border border-stone-200 bg-white shadow-none rounded-2xl">
          <CardContent className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-[#3d3c3c]">
              {kpi.value}
            </p>
            <p
              className={cn(
                "text-xs font-medium mt-1.5 flex items-center gap-1",
                kpi.positive ? "text-emerald-600" : "text-rose-500"
              )}
            >
              {kpi.positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {kpi.delta}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
