"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Edge, Node } from "reactflow";
import { Position } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/components/ui/use-mobile";
import { KnowledgeGraphCanvas } from "@/components/knowledge-graph/graph-canvas";
import {
  KnowledgeGraphToolbar,
  type KnowledgeGraphSearchResult,
} from "@/components/knowledge-graph/graph-toolbar";
import { KnowledgeGraphNodeInspector } from "@/components/knowledge-graph/node-inspector";
import { KnowledgeGraphLegend } from "@/components/knowledge-graph/graph-legend";
import {
  KNOWLEDGE_GRAPH_DOMAIN_LABELS,
  KNOWLEDGE_GRAPH_EDGES,
  KNOWLEDGE_GRAPH_NODES,
  KNOWLEDGE_GRAPH_NODE_TYPE_LABELS,
  VISIBLE_KNOWLEDGE_GRAPH_DOMAINS,
  buildKnowledgeGraphHref,
  getKnowledgeGraphNeighborhood,
  getKnowledgeGraphPreset,
  type KnowledgeGraphDomain,
  type KnowledgeGraphNode,
  type KnowledgeGraphNodeType,
  type KnowledgeGraphPresetId,
} from "@/lib/knowledge-graph-data";
import { useKnowledgeGraphInstances } from "@/lib/knowledge-graph-instances";
import { cn } from "@/lib/utils";
import { ArrowLeft, Library, Network, Sparkles } from "lucide-react";

const DOMAIN_STYLES: Record<
  KnowledgeGraphDomain,
  {
    accent: string;
    border: string;
    background: string;
    badge: string;
  }
> = {
  udp: {
    accent: "#334155",
    border: "#cbd5e1",
    background: "#f8fafc",
    badge: "border-stone-200 bg-stone-50 text-stone-700",
  },
  demand: {
    accent: "#0f766e",
    border: "#99f6e4",
    background: "#f0fdfa",
    badge: "border-teal-200 bg-teal-50 text-teal-700",
  },
  risk: {
    accent: "#be123c",
    border: "#fecdd3",
    background: "#fff1f2",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
  "cross-domain": {
    accent: "#7c3aed",
    border: "#ddd6fe",
    background: "#f5f3ff",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
};

const ALL_DOMAINS = VISIBLE_KNOWLEDGE_GRAPH_DOMAINS;
const BUSINESS_NODE_TYPES = new Set<KnowledgeGraphNodeType>([
  "customer",
  "segment",
  "product",
  "vendor",
  "location",
  "campaign",
  "service",
]);
function nodeMatchesQuery(node: KnowledgeGraphNode, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const attributeText = node.attributes
    .map((attribute) => `${attribute.label} ${attribute.value}`)
    .join(" ")
    .toLowerCase();
  const tagText = node.tags?.join(" ").toLowerCase() ?? "";

  return [node.label, node.summary, attributeText, tagText]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function createGraphNode(node: KnowledgeGraphNode, opacity: number): Node {
  const style = DOMAIN_STYLES[node.domain];
  const leadingAttribute = node.attributes[0];
  const typeLabel = KNOWLEDGE_GRAPH_NODE_TYPE_LABELS[node.type];
  const showLabelCard = opacity > 0.45;

  return {
    id: node.id,
    position: node.position,
    data: {
      label: (
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: style.accent, opacity }}
          />
          <div
            className={cn(
              "rounded-md border border-stone-200 bg-white/96 px-2.5 py-1 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition",
              showLabelCard ? "opacity-100" : "opacity-40",
            )}
          >
            <div className="max-w-[250px] truncate text-[10px] font-semibold text-stone-700">
              {node.label}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[9px] text-stone-400">
              <span>{typeLabel}</span>
              {leadingAttribute ? <span className="truncate">{leadingAttribute.value}</span> : null}
            </div>
          </div>
        </div>
      ),
    },
    draggable: false,
    selectable: true,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      width: showLabelCard ? 290 : 30,
      padding: 0,
      borderRadius: 0,
      border: "none",
      background: "transparent",
      boxShadow: "none",
      opacity,
    },
  };
}

function createGraphEdge(edge: (typeof KNOWLEDGE_GRAPH_EDGES)[number], opacity: number): Edge {
  const style = DOMAIN_STYLES[edge.domain];

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "bezier",
    animated: false,
    style: {
      stroke: style.accent,
      strokeOpacity: opacity,
      strokeWidth: opacity > 0.45 ? 1.5 : 0.8,
    },
  };
}

export function KnowledgeGraphView({
  initialInstanceId,
  initialPreset,
  initialScopeId,
  initialCenterNodeId,
}: {
  initialInstanceId?: string | null;
  initialPreset?: string | null;
  initialScopeId?: string | null;
  initialCenterNodeId?: string | null;
}) {
  const isMobile = useIsMobile();
  const { getInstance, isHydrated } = useKnowledgeGraphInstances();
  const [query, setQuery] = useState("");
  const [activeDomains, setActiveDomains] = useState<KnowledgeGraphDomain[]>(ALL_DOMAINS);
  const [activeNodeTypes, setActiveNodeTypes] = useState<KnowledgeGraphNodeType[]>([]);
  const [activePreset, setActivePreset] = useState<KnowledgeGraphPresetId>(
    (getKnowledgeGraphPreset(initialPreset)?.id as KnowledgeGraphPresetId | undefined) ??
      "full-graph",
  );
  const [activeScopeId, setActiveScopeId] = useState<string | null>(initialScopeId ?? null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialCenterNodeId ?? null);
  const activeInstance =
    initialInstanceId && isHydrated ? getInstance(initialInstanceId) : null;

  useEffect(() => {
    if (initialInstanceId) {
      if (!isHydrated) {
        return;
      }

      if (activeInstance) {
        setQuery(activeInstance.query);
        setActiveDomains(
          activeInstance.activeDomains.length > 0 ? activeInstance.activeDomains : ALL_DOMAINS,
        );
        setActiveNodeTypes(activeInstance.activeNodeTypes);
        setActivePreset(activeInstance.presetId);
        setActiveScopeId(activeInstance.scopeId ?? null);
        setSelectedNodeId(
          activeInstance.centerNodeId ??
            getKnowledgeGraphNeighborhood(activeInstance.scopeId ?? null)?.centerNodeId ??
            KNOWLEDGE_GRAPH_NODES[0]?.id ??
            null,
        );
        return;
      }
    }

    const preset = getKnowledgeGraphPreset(initialPreset);
    const nextPreset = (preset?.id as KnowledgeGraphPresetId | undefined) ?? "full-graph";
    const nextScopeId = initialScopeId ?? preset?.defaultNeighborhoodId ?? null;
    const nextCenterNodeId =
      initialCenterNodeId ??
      getKnowledgeGraphNeighborhood(nextScopeId)?.centerNodeId ??
      KNOWLEDGE_GRAPH_NODES[0]?.id ??
      null;

    setActivePreset(nextPreset);
    setQuery("");
    setActiveDomains(ALL_DOMAINS);
    setActiveNodeTypes([]);
    setActiveScopeId(nextScopeId);
    setSelectedNodeId(nextCenterNodeId);
  }, [
    activeInstance,
    initialCenterNodeId,
    initialInstanceId,
    initialPreset,
    initialScopeId,
    isHydrated,
  ]);

  const activePresetMeta = getKnowledgeGraphPreset(activePreset);
  const activeNeighborhood = getKnowledgeGraphNeighborhood(
    activeScopeId ?? activePresetMeta?.defaultNeighborhoodId,
  );

  const nodesInScope = useMemo(() => {
    const scopedNodeIds = activeNeighborhood?.nodeIds
      ? new Set(activeNeighborhood.nodeIds)
      : null;

    return KNOWLEDGE_GRAPH_NODES.filter((node) =>
      scopedNodeIds ? scopedNodeIds.has(node.id) : true,
    );
  }, [activeNeighborhood]);

  const filteredNodes = useMemo(
    () =>
      nodesInScope.filter((node) => {
        const matchesDomain = activeDomains.includes(node.domain);
        const matchesType =
          activeNodeTypes.length === 0 || activeNodeTypes.includes(node.type);

        return matchesDomain && matchesType;
      }),
    [activeDomains, activeNodeTypes, nodesInScope],
  );

  const filteredNodeIdSet = useMemo(
    () => new Set(filteredNodes.map((node) => node.id)),
    [filteredNodes],
  );

  const scopedEdges = useMemo(
    () =>
      KNOWLEDGE_GRAPH_EDGES.filter(
        (edge) =>
          filteredNodeIdSet.has(edge.source) && filteredNodeIdSet.has(edge.target),
      ),
    [filteredNodeIdSet],
  );

  const searchResults = useMemo<KnowledgeGraphSearchResult[]>(
    () =>
      query.trim()
        ? filteredNodes
            .filter((node) => nodeMatchesQuery(node, query))
            .map((node) => ({
              id: node.id,
              label: node.label,
              type: node.type,
              domain: node.domain,
            }))
        : [],
    [filteredNodes, query],
  );

  const visibleNodeIdSet = useMemo(() => {
    if (!query.trim() || searchResults.length === 0) {
      return new Set(filteredNodes.map((node) => node.id));
    }

    const ids = new Set(searchResults.map((node) => node.id));
    scopedEdges.forEach((edge) => {
      if (ids.has(edge.source) || ids.has(edge.target)) {
        ids.add(edge.source);
        ids.add(edge.target);
      }
    });

    return ids;
  }, [filteredNodes, query, scopedEdges, searchResults]);

  const visibleNodes = useMemo(
    () => filteredNodes.filter((node) => visibleNodeIdSet.has(node.id)),
    [filteredNodes, visibleNodeIdSet],
  );

  const visibleEdges = useMemo(
    () =>
      scopedEdges.filter(
        (edge) => visibleNodeIdSet.has(edge.source) && visibleNodeIdSet.has(edge.target),
      ),
    [scopedEdges, visibleNodeIdSet],
  );

  useEffect(() => {
    if (visibleNodes.length === 0) {
      setSelectedNodeId(null);
      return;
    }

    if (selectedNodeId && visibleNodes.some((node) => node.id === selectedNodeId)) {
      return;
    }

    setSelectedNodeId(
      activeNeighborhood?.centerNodeId && visibleNodes.some((node) => node.id === activeNeighborhood.centerNodeId)
        ? activeNeighborhood.centerNodeId
        : visibleNodes[0].id,
    );
  }, [activeNeighborhood, selectedNodeId, visibleNodes]);

  const selectedNode =
    visibleNodes.find((node) => node.id === selectedNodeId) ??
    KNOWLEDGE_GRAPH_NODES.find((node) => node.id === selectedNodeId) ??
    null;

  const highlightNodeIds = useMemo(() => {
    if (!selectedNodeId || !visibleNodeIdSet.has(selectedNodeId)) {
      return new Set(visibleNodes.map((node) => node.id));
    }

    const ids = new Set<string>([selectedNodeId]);
    visibleEdges.forEach((edge) => {
      if (edge.source === selectedNodeId) {
        ids.add(edge.target);
      }
      if (edge.target === selectedNodeId) {
        ids.add(edge.source);
      }
    });
    return ids;
  }, [selectedNodeId, visibleEdges, visibleNodeIdSet, visibleNodes]);

  const reactFlowNodes = useMemo<Node[]>(
    () =>
      visibleNodes.map((node) =>
        createGraphNode(node, highlightNodeIds.has(node.id) ? 1 : 0.18),
      ),
    [highlightNodeIds, visibleNodes],
  );

  const reactFlowEdges = useMemo<Edge[]>(
    () =>
      visibleEdges.map((edge) => {
        const isHighlighted =
          !selectedNodeId ||
          ((edge.source === selectedNodeId || edge.target === selectedNodeId) &&
            highlightNodeIds.has(edge.source) &&
            highlightNodeIds.has(edge.target));

        return createGraphEdge(edge, isHighlighted ? 0.72 : 0.08);
      }),
    [highlightNodeIds, selectedNodeId, visibleEdges],
  );

  const relatedNodes = useMemo(() => {
    if (!selectedNodeId) {
      return [];
    }

    const relatedIds = new Set<string>();
    visibleEdges.forEach((edge) => {
      if (edge.source === selectedNodeId) {
        relatedIds.add(edge.target);
      }
      if (edge.target === selectedNodeId) {
        relatedIds.add(edge.source);
      }
    });

    return visibleNodes.filter((node) => relatedIds.has(node.id));
  }, [selectedNodeId, visibleEdges, visibleNodes]);

  const metricCards = useMemo(
    () => [
      {
        label: "Entities",
        value: String(visibleNodes.filter((node) => BUSINESS_NODE_TYPES.has(node.type)).length),
      },
      {
        label: "Signals",
        value: String(
          visibleNodes.filter((node) =>
            ["alert", "issue", "inventory_signal"].includes(node.type),
          ).length,
        ),
      },
      {
        label: "Actions",
        value: String(
          visibleNodes.filter((node) =>
            ["action", "approval", "recommendation"].includes(node.type),
          ).length,
        ),
      },
      {
        label: "Audit objects",
        value: String(
          visibleNodes.filter((node) => ["audit_event", "consent_record", "identity_profile"].includes(node.type)).length,
        ),
      },
    ],
    [visibleNodes],
  );

  const railNodes = useMemo(
    () =>
      (activeNeighborhood?.nodeIds
        ? activeNeighborhood.nodeIds
            .map((nodeId) => KNOWLEDGE_GRAPH_NODES.find((node) => node.id === nodeId))
            .filter((node): node is KnowledgeGraphNode => Boolean(node))
        : visibleNodes
      ).filter((node) =>
        ["alert", "issue", "approval", "action", "recommendation"].includes(node.type),
      ),
    [activeNeighborhood?.nodeIds, visibleNodes],
  );

  const toggleDomain = (domain: KnowledgeGraphDomain) => {
    setActiveDomains((current) => {
      if (current.includes(domain)) {
        return current.length === 1 ? current : current.filter((value) => value !== domain);
      }

      return [...current, domain];
    });
  };

  const toggleNodeType = (type: KnowledgeGraphNodeType) => {
    setActiveNodeTypes((current) =>
      current.includes(type)
        ? current.filter((value) => value !== type)
        : [...current, type],
    );
  };

  const handlePresetChange = (preset: KnowledgeGraphPresetId) => {
    const presetMeta = getKnowledgeGraphPreset(preset);
    setActivePreset(preset);
    setActiveScopeId(presetMeta?.defaultNeighborhoodId ?? null);
    setQuery("");
    setSelectedNodeId(
      getKnowledgeGraphNeighborhood(presetMeta?.defaultNeighborhoodId)?.centerNodeId ??
        KNOWLEDGE_GRAPH_NODES[0]?.id ??
        null,
    );
  };

  return (
    <div className="mx-auto max-w-[1860px] space-y-6 pb-12">
      <KnowledgeGraphToolbar
        query={query}
        onQueryChange={setQuery}
        searchResults={searchResults}
        onSelectSearchResult={setSelectedNodeId}
        activePreset={activePreset}
        onPresetChange={handlePresetChange}
        activeDomains={activeDomains}
        onToggleDomain={toggleDomain}
        activeNodeTypes={activeNodeTypes}
        onToggleNodeType={toggleNodeType}
        activeScopeTitle={activeNeighborhood?.title}
        activeScopeDescription={activeNeighborhood?.description}
        nodeCount={visibleNodes.length}
        edgeCount={visibleEdges.length}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="h-9 rounded-full border-stone-200 px-4 text-xs shadow-none">
            <Link href="/dashboard">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Control Tower
            </Link>
          </Button>
          <Button asChild className="h-9 rounded-full bg-stone-800 px-4 text-xs hover:bg-stone-950">
            <Link href={buildKnowledgeGraphHref({ graphPreset: "full-graph", graphCenterNodeId: "graph-control-tower" })}>
              <Network className="mr-1.5 h-3.5 w-3.5" />
              Reset to Full Graph
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9 rounded-full border-stone-200 px-4 text-xs shadow-none">
            <Link href="/dashboard/graphs">
              <Library className="mr-1.5 h-3.5 w-3.5" />
              Saved Graphs
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ALL_DOMAINS.filter((domain) =>
            visibleNodes.some((node) => node.domain === domain),
          ).map((domain) => (
            <Badge
              key={domain}
              variant="outline"
              className={cn("text-[10px]", DOMAIN_STYLES[domain].badge)}
            >
              {KNOWLEDGE_GRAPH_DOMAIN_LABELS[domain]}
            </Badge>
          ))}
        </div>
      </div>

      {initialInstanceId && isHydrated ? (
        activeInstance ? (
          <div className="rounded-[26px] border border-stone-200 bg-white/95 px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px]", DOMAIN_STYLES[activeInstance.domain].badge)}>
                    {KNOWLEDGE_GRAPH_DOMAIN_LABELS[activeInstance.domain]}
                  </Badge>
                  <Badge variant="outline" className="border-stone-200 bg-stone-50 text-[10px] text-stone-600">
                    {activeInstance.source === "chat" ? "Created from chat" : "Created from control tower"}
                  </Badge>
                  <span className="text-[11px] text-stone-400">Updated {new Date(activeInstance.updatedAt).toLocaleString()}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-stone-800">{activeInstance.title}</h2>
                <p className="mt-1 text-sm text-stone-500">
                  {activeInstance.description || "Saved workspace for graph-based investigation."}
                </p>
                <p className="mt-2 text-[11px] text-stone-400">
                  Created by {activeInstance.createdBy}
                  {activeInstance.sourcePrompt ? ` · Prompt: ${activeInstance.sourcePrompt}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" className="rounded-full border-stone-200 text-xs shadow-none">
                  <Link href="/dashboard/graphs">Open library</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Card className="border border-amber-200 bg-amber-50/80 shadow-none">
            <CardContent className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900">Saved graph not found</p>
                <p className="mt-1 text-sm text-amber-800/80">
                  This graph instance may have been deleted from the shared library. You can still explore the live graph using presets and scopes.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-full border-amber-300 bg-white text-xs text-amber-900 hover:bg-amber-100">
                <Link href="/dashboard/graphs">Open library</Link>
              </Button>
            </CardContent>
          </Card>
        )
      ) : null}

      <div className="rounded-[26px] border border-stone-200 bg-white/95 px-4 py-4 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          Story Neighborhood Rail
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Click a node path to re-scope the graph to that relationship neighborhood.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {railNodes.slice(0, 6).map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-left text-xs transition",
                selectedNodeId === node.id
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300",
              )}
            >
              <span className="font-semibold">{node.label}</span>
              <span className="ml-2 text-stone-400">{KNOWLEDGE_GRAPH_NODE_TYPE_LABELS[node.type]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <Card key={metric.label} className="rounded-2xl border border-stone-200 bg-white/95 shadow-none">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {metric.label}
              </p>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-stone-800">
                {metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {visibleNodes.length > 0 ? (
          <KnowledgeGraphCanvas
            nodes={reactFlowNodes}
            edges={reactFlowEdges}
            focusedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        ) : (
          <Card className="border border-stone-200 bg-white/95 shadow-none">
            <CardContent className="flex min-h-[520px] items-center justify-center p-8 text-center">
              <div className="max-w-md space-y-3">
                <Sparkles className="mx-auto h-8 w-8 text-stone-400" />
                <p className="text-lg font-semibold text-stone-800">No nodes match the current filters</p>
                <p className="text-sm text-stone-500">
                  Clear some entity filters or reset to the full graph to widen the visible neighborhood.
                </p>
                <Button
                  type="button"
                  className="rounded-full bg-stone-800 px-4 text-xs hover:bg-stone-950"
                  onClick={() => {
                    setActiveDomains(ALL_DOMAINS);
                    setActiveNodeTypes([]);
                    handlePresetChange("full-graph");
                  }}
                >
                  Reset filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1.4fr)_360px]")}>
          <KnowledgeGraphNodeInspector
            node={selectedNode}
            relatedNodes={relatedNodes}
            onSelectNode={setSelectedNodeId}
          />
          <KnowledgeGraphLegend />
        </div>
      </div>
    </div>
  );
}
