import { KnowledgeGraphView } from "@/components/knowledge-graph/knowledge-graph-view";

export default function DashboardGraphPage({
  searchParams,
}: {
  searchParams?: {
    instance?: string | string[];
    preset?: string | string[];
    scope?: string | string[];
    center?: string | string[];
  };
}) {
  const instance =
    typeof searchParams?.instance === "string" ? searchParams.instance : null;
  const preset =
    typeof searchParams?.preset === "string" ? searchParams.preset : null;
  const scope =
    typeof searchParams?.scope === "string" ? searchParams.scope : null;
  const center =
    typeof searchParams?.center === "string" ? searchParams.center : null;

  return (
    <KnowledgeGraphView
      initialInstanceId={instance}
      initialPreset={preset}
      initialScopeId={scope}
      initialCenterNodeId={center}
    />
  );
}
