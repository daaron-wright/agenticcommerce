"use client";

import { IncrementalityWorkspace } from "@/components/incrementality/incrementality-workspace";
import { buildIncrementalityHref } from "@/lib/incrementality-data";

export default function UdpIncrementalityPage() {
  return (
    <IncrementalityWorkspace
      title="UDP Incrementality"
      description="Run controlled experiments across identity, consent, audiences, campaigns, customer insights, data quality, and demand from one shared UDP workspace."
      breadcrumbBaseHref={buildIncrementalityHref({ entry: "udp" })}
      defaultLens="all"
      showControlTowerEntry
    />
  );
}
