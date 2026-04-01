"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  KNOWLEDGE_GRAPH_DOMAIN_LABELS,
  KNOWLEDGE_GRAPH_NODE_TYPE_LABELS,
  KNOWLEDGE_GRAPH_PRESETS,
  VISIBLE_KNOWLEDGE_GRAPH_DOMAINS,
  type KnowledgeGraphDomain,
  type KnowledgeGraphNodeType,
  type KnowledgeGraphPresetId,
} from "@/lib/knowledge-graph-data";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export interface KnowledgeGraphSearchResult {
  id: string;
  label: string;
  type: KnowledgeGraphNodeType;
  domain: KnowledgeGraphDomain;
}

const FILTER_NODE_TYPES: KnowledgeGraphNodeType[] = [
  "customer",
  "segment",
  "product",
  "vendor",
  "forecast",
  "alert",
  "action",
  "approval",
];

export function KnowledgeGraphToolbar({
  query,
  onQueryChange,
  searchResults,
  onSelectSearchResult,
  activePreset,
  onPresetChange,
  activeDomains,
  onToggleDomain,
  activeNodeTypes,
  onToggleNodeType,
  activeScopeTitle,
  activeScopeDescription,
  nodeCount,
  edgeCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  searchResults: KnowledgeGraphSearchResult[];
  onSelectSearchResult: (nodeId: string) => void;
  activePreset: KnowledgeGraphPresetId;
  onPresetChange: (preset: KnowledgeGraphPresetId) => void;
  activeDomains: KnowledgeGraphDomain[];
  onToggleDomain: (domain: KnowledgeGraphDomain) => void;
  activeNodeTypes: KnowledgeGraphNodeType[];
  onToggleNodeType: (type: KnowledgeGraphNodeType) => void;
  activeScopeTitle?: string;
  activeScopeDescription?: string;
  nodeCount: number;
  edgeCount: number;
}) {
  return (
    <div className="space-y-5 rounded-[30px] border border-stone-200 bg-white/95 p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-800">
            Knowledge Graph
          </h1>
          <p className="mt-1 max-w-4xl text-sm text-stone-500">
            Workbook-style object graph for customer readiness, commercial activation,
            demand signals, approvals, and audit paths across the control tower.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <div className="flex flex-wrap items-center gap-2">
            {VISIBLE_KNOWLEDGE_GRAPH_DOMAINS.map((domain) => {
              const isActive = activeDomains.includes(domain);

              return (
                <button
                  key={domain}
                  onClick={() => onToggleDomain(domain)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-medium transition",
                    isActive
                      ? "border-stone-300 bg-stone-800 text-white"
                      : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700",
                  )}
                >
                  {KNOWLEDGE_GRAPH_DOMAIN_LABELS[domain]}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] text-stone-600">
              {nodeCount} nodes
            </div>
            <div className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] text-stone-600">
              {edgeCount} relations
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -transtone-y-1/2 text-stone-400" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search nodes in page..."
            className="h-11 rounded-2xl border-stone-200 bg-white pl-10 shadow-none"
          />
        </div>
        {query.trim() ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {searchResults.length > 0 ? (
              searchResults.slice(0, 6).map((result) => (
                <button
                  key={result.id}
                  onClick={() => onSelectSearchResult(result.id)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 transition hover:border-stone-300 hover:bg-white"
                >
                  {result.label}
                  <span className="ml-2 text-stone-400">
                    {KNOWLEDGE_GRAPH_NODE_TYPE_LABELS[result.type]}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                No matching nodes in the current scope.
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {KNOWLEDGE_GRAPH_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              className={cn(
                "h-9 rounded-full px-4 text-xs shadow-none",
                activePreset === preset.id
                  ? "border-stone-800 bg-stone-800 text-white hover:bg-stone-800 hover:text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50",
              )}
              onClick={() => onPresetChange(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {activeScopeTitle ? (
          <div className="rounded-[24px] border border-stone-200 bg-white px-4 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Story Rail
            </div>
            <p className="mt-1 text-sm font-semibold text-stone-800">{activeScopeTitle}</p>
            {activeScopeDescription ? (
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{activeScopeDescription}</p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-[24px] border border-stone-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Entity filters
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FILTER_NODE_TYPES.map((type) => {
              const isActive = activeNodeTypes.includes(type);

              return (
                <button
                  key={type}
                  onClick={() => onToggleNodeType(type)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] transition",
                    isActive
                      ? "border-stone-800 bg-stone-800 text-white"
                      : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700",
                  )}
                >
                  {KNOWLEDGE_GRAPH_NODE_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
