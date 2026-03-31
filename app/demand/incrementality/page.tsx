"use client";

import { IncrementalityWorkspace } from "@/components/incrementality/incrementality-workspace";
import { buildIncrementalityHref } from "@/lib/incrementality-data";

export default function DemandIncrementalityPage() {
  return (
    <IncrementalityWorkspace
      title="Demand Incrementality"
      description="Demand is one lens within the broader experiment program, letting planners validate forecast, promo, and inventory interventions with the same shared readout model used across UDP."
      breadcrumbBaseHref={buildIncrementalityHref({ entry: "demand" })}
      defaultLens="demand"
    />
  );
}
