import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { EcomKpi } from "@/lib/dashboard/mock-ecommerce";
import { KpiWarningActions } from "./kpi-warning-actions";

type KpiGridProps = {
  kpis: EcomKpi[];
};

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border shadow-none overflow-hidden">
          <CardContent className="p-0">
            {kpi.warning ? <KpiWarningActions warning={kpi.warning} /> : null}
            <div className="px-6 py-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p
                className={`text-xs font-medium mt-1 flex items-center gap-1 ${
                  kpi.direction === "up" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {kpi.direction === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {kpi.delta}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">{kpi.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
