"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Minus, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SERVICES, fmtCurrency } from "@/lib/risk/cyber-risk-data";
import { PageBanner } from "@/components/ui/page-banner";

function RiskBandBadge({ band }: { band: string }) {
  const colors: Record<string, string> = {
    Med: "bg-red-50 text-red-700 border-red-200",
    Low: "bg-amber-50 text-amber-700 border-amber-200",
    "Very Low": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Very Very Low": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <Badge variant="outline" className={cn("text-[10px]", colors[band] || "")}>{band}</Badge>;
}

function TrendIndicator({ trend }: { trend: string }) {
  switch (trend) {
    case "rising":
      return <span className="inline-flex items-center gap-1 text-xs text-red-600"><ArrowUpRight className="h-3.5 w-3.5" /> Rising</span>;
    case "declining":
      return <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><ArrowDownRight className="h-3.5 w-3.5" /> Declining</span>;
    default:
      return <span className="inline-flex items-center gap-1 text-xs text-stone-500"><Minus className="h-3.5 w-3.5" /> Stable</span>;
  }
}

export default function BusinessServicesPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <PageBanner
        category="Portfolio"
        title="Business Services"
        description="Critical business services with cyber risk scoring and financial exposure."
      />

      <Card className="border shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-stone-50/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Business Service</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Risk Score</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Risk Band</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Likelihood</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">ALE</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Trend</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Last Assessed</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((svc) => (
                <tr key={svc.id} className="border-b last:border-0 hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/vendor/${svc.id}`} className="font-medium text-sm hover:underline">
                      {svc.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{svc.category}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-sm font-semibold",
                      svc.riskBand === "Med" ? "text-red-600" : svc.riskBand === "Low" ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {svc.riskScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/{svc.maxScore}</span>
                  </td>
                  <td className="px-4 py-3"><RiskBandBadge band={svc.riskBand} /></td>
                  <td className="px-4 py-3"><span className="text-sm font-semibold">{svc.likelihoodPercent}%</span></td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-sm font-semibold",
                      svc.riskBand === "Med" ? "text-red-600" : svc.riskBand === "Low" ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {fmtCurrency(svc.ale)}
                    </span>
                  </td>
                  <td className="px-4 py-3"><TrendIndicator trend={svc.trend} /></td>
                  <td className="px-4 py-3">
                    {svc.status === "action_required" ? (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">Controls Required</Badge>
                    ) : svc.status === "under_review" ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Under Review</Badge>
                    ) : (
                      <span className="text-xs text-stone-600">Assessed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{svc.lastAssessed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
