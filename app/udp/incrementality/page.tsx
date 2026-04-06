"use client";

import { IncrementalityWorkspace } from "@/components/incrementality/incrementality-workspace";
import { buildIncrementalityHref } from "@/lib/incrementality-data";

export default function UdpIncrementalityPage() {
  return (
    <IncrementalityWorkspace
      title="Experiments"
      description="Run and review controlled experiments across demand, commercial, identity, consent, audiences, campaigns, and more — all in one workspace."
      breadcrumbBaseHref={buildIncrementalityHref({ entry: "udp" })}
      defaultLens="all"
      showControlTowerEntry
    />
  );
}
