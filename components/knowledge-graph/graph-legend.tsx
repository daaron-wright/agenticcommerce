"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DOMAIN_COLORS = [
  { label: "UDP / CDP", color: "bg-stone-500" },
  { label: "Demand Planning", color: "bg-teal-500" },
  { label: "Cross-domain", color: "bg-violet-500" },
];

const RELATION_HINTS = [
  "Solid links show semantic relationships such as affects, belongs to, or derived from.",
  "Selecting a node highlights its one-hop neighborhood and dims unrelated context.",
  "Route-outs in the inspector take you back into the correct module to act.",
];

export function KnowledgeGraphLegend() {
  return (
    <Card className="rounded-[24px] border border-stone-200 bg-white/95 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-stone-800">Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Domain colors
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DOMAIN_COLORS.map((domain) => (
              <div
                key={domain.label}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-700"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${domain.color}`} />
                {domain.label}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Interaction cues
          </p>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-stone-600">
            {RELATION_HINTS.map((hint) => (
              <p key={hint}>{hint}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
