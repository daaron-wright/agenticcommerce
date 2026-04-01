"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  KNOWLEDGE_GRAPH_DOMAIN_LABELS,
  KNOWLEDGE_GRAPH_NEIGHBORHOODS,
  KNOWLEDGE_GRAPH_NODES,
  KNOWLEDGE_GRAPH_PRESETS,
  VISIBLE_KNOWLEDGE_GRAPH_DOMAINS,
  type KnowledgeGraphDomain,
  type KnowledgeGraphPresetId,
} from "@/lib/knowledge-graph-data";
import {
  useKnowledgeGraphInstances,
  type CreateKnowledgeGraphInstanceInput,
  type KnowledgeGraphInstance,
  type KnowledgeGraphInstanceSource,
} from "@/lib/knowledge-graph-instances";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface GraphInstancePrefill {
  title?: string;
  description?: string;
  domain?: KnowledgeGraphDomain;
  presetId?: KnowledgeGraphPresetId;
  scopeId?: string | null;
  centerNodeId?: string | null;
  query?: string;
  sourcePrompt?: string;
}

function getPresetDomains(presetId: KnowledgeGraphPresetId): KnowledgeGraphDomain[] {
  if (presetId === "udp-neighborhood") return ["udp"];
  if (presetId === "demand-chain") return ["demand"];
  return ["cross-domain"];
}

function getDefaultPresetForDomain(domain: KnowledgeGraphDomain): KnowledgeGraphPresetId {
  if (domain === "udp") return "udp-neighborhood";
  if (domain === "demand") return "demand-chain";
  return "story-neighborhood";
}

function getDefaultScopeForPreset(presetId: KnowledgeGraphPresetId) {
  return KNOWLEDGE_GRAPH_PRESETS.find((preset) => preset.id === presetId)?.defaultNeighborhoodId ?? null;
}

function getCenterNode(scopeId: string | null | undefined, explicitCenterNodeId?: string | null) {
  if (explicitCenterNodeId) {
    return KNOWLEDGE_GRAPH_NODES.find((node) => node.id === explicitCenterNodeId) ?? null;
  }

  const neighborhood = KNOWLEDGE_GRAPH_NEIGHBORHOODS.find((candidate) => candidate.id === scopeId);
  return neighborhood
    ? KNOWLEDGE_GRAPH_NODES.find((node) => node.id === neighborhood.centerNodeId) ?? null
    : null;
}

function getInitialState(prefill?: GraphInstancePrefill) {
  const domain = prefill?.domain ?? "cross-domain";
  const presetId = prefill?.presetId ?? getDefaultPresetForDomain(domain);
  const scopeId = prefill?.scopeId ?? getDefaultScopeForPreset(presetId);

  return {
    title: prefill?.title ?? "",
    description: prefill?.description ?? "",
    domain,
    presetId,
    scopeId,
    centerNodeId: prefill?.centerNodeId ?? getCenterNode(scopeId)?.id ?? null,
    query: prefill?.query ?? "",
    sourcePrompt: prefill?.sourcePrompt ?? "",
  };
}

export function GraphInstanceDialog({
  open,
  onOpenChange,
  source,
  prefill,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: KnowledgeGraphInstanceSource;
  prefill?: GraphInstancePrefill;
  onCreated?: (instance: KnowledgeGraphInstance) => void;
}) {
  const { user } = useAuth();
  const { createInstance } = useKnowledgeGraphInstances();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<KnowledgeGraphDomain>("cross-domain");
  const [presetId, setPresetId] = useState<KnowledgeGraphPresetId>("story-neighborhood");
  const [scopeId, setScopeId] = useState<string | null>(null);
  const [centerNodeId, setCenterNodeId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sourcePrompt, setSourcePrompt] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const next = getInitialState(prefill);
    setTitle(next.title);
    setDescription(next.description);
    setDomain(next.domain);
    setPresetId(next.presetId);
    setScopeId(next.scopeId);
    setCenterNodeId(next.centerNodeId);
    setQuery(next.query);
    setSourcePrompt(next.sourcePrompt);
  }, [open, prefill]);

  const availablePresets = useMemo(
    () =>
      KNOWLEDGE_GRAPH_PRESETS.filter((preset) => {
        const presetDomains = getPresetDomains(preset.id);
        return domain === "cross-domain"
          ? true
          : presetDomains.includes(domain) || preset.id === "full-graph";
      }),
    [domain],
  );

  const availableScopes = useMemo(
    () =>
      KNOWLEDGE_GRAPH_NEIGHBORHOODS.filter((neighborhood) => neighborhood.preset === presetId),
    [presetId],
  );

  const centerNode = useMemo(
    () => getCenterNode(scopeId, centerNodeId),
    [centerNodeId, scopeId],
  );

  const handleDomainChange = (nextDomain: KnowledgeGraphDomain) => {
    const nextPreset = getDefaultPresetForDomain(nextDomain);
    const nextScope = getDefaultScopeForPreset(nextPreset);
    const nextCenterNode = getCenterNode(nextScope)?.id ?? null;

    setDomain(nextDomain);
    setPresetId(nextPreset);
    setScopeId(nextScope);
    setCenterNodeId(nextCenterNode);
  };

  const handlePresetChange = (nextPresetId: KnowledgeGraphPresetId) => {
    const nextScope = getDefaultScopeForPreset(nextPresetId);
    setPresetId(nextPresetId);
    setScopeId(nextScope);
    setCenterNodeId(getCenterNode(nextScope)?.id ?? null);
  };

  const handleScopeChange = (nextScopeId: string | null) => {
    setScopeId(nextScopeId);
    setCenterNodeId(getCenterNode(nextScopeId)?.id ?? null);
  };

  const handleCreate = () => {
    if (!user || !title.trim()) {
      return;
    }

    const input: CreateKnowledgeGraphInstanceInput = {
      title: title.trim(),
      description,
      domain,
      presetId,
      scopeId,
      centerNodeId,
      query,
      source,
      sourcePrompt,
      createdBy: user.displayName || user.username,
    };

    if (domain === "cross-domain") {
      input.activeDomains = VISIBLE_KNOWLEDGE_GRAPH_DOMAINS;
    } else {
      input.activeDomains = [domain];
    }

    const instance = createInstance(input);
    onCreated?.(instance);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border border-stone-200 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-stone-800">
            Create knowledge graph workspace
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="graph-title">Title</Label>
              <Input
                id="graph-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Name this investigation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graph-domain">Domain</Label>
              <Select value={domain} onValueChange={(value) => handleDomainChange(value as KnowledgeGraphDomain)}>
                <SelectTrigger id="graph-domain">
                  <SelectValue placeholder="Choose a domain" />
                </SelectTrigger>
                <SelectContent>
                  {VISIBLE_KNOWLEDGE_GRAPH_DOMAINS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {KNOWLEDGE_GRAPH_DOMAIN_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="graph-description">Description</Label>
            <Textarea
              id="graph-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what this saved graph is for"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="graph-preset">Preset</Label>
              <Select value={presetId} onValueChange={(value) => handlePresetChange(value as KnowledgeGraphPresetId)}>
                <SelectTrigger id="graph-preset">
                  <SelectValue placeholder="Choose a preset" />
                </SelectTrigger>
                <SelectContent>
                  {availablePresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="graph-scope">Neighborhood</Label>
              <Select
                value={scopeId ?? "__none__"}
                onValueChange={(value) => handleScopeChange(value === "__none__" ? null : value)}
              >
                <SelectTrigger id="graph-scope">
                  <SelectValue placeholder="Choose a neighborhood" />
                </SelectTrigger>
                <SelectContent>
                  {availableScopes.length === 0 ? (
                    <SelectItem value="__none__">No scoped neighborhood</SelectItem>
                  ) : (
                    availableScopes.map((scope) => (
                      <SelectItem key={scope.id} value={scope.id}>
                        {scope.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="graph-query">Default search query</Label>
              <Input
                id="graph-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Optional search term"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graph-source-prompt">Prompt or notes</Label>
              <Input
                id="graph-source-prompt"
                value={sourcePrompt}
                onChange={(event) => setSourcePrompt(event.target.value)}
                placeholder="Why are we saving this graph?"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Workspace preview
            </p>
            <div className="mt-2 space-y-1 text-sm text-stone-600">
              <p>
                <span className="font-semibold text-stone-800">Domain:</span>{" "}
                {KNOWLEDGE_GRAPH_DOMAIN_LABELS[domain]}
              </p>
              <p>
                <span className="font-semibold text-stone-800">Preset:</span>{" "}
                {KNOWLEDGE_GRAPH_PRESETS.find((preset) => preset.id === presetId)?.label}
              </p>
              <p>
                <span className="font-semibold text-stone-800">Center node:</span>{" "}
                {centerNode?.label ?? "No explicit center node"}
              </p>
              <p>
                <span className="font-semibold text-stone-800">Will open in:</span>{" "}
                `/dashboard/graph?instance=...`
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-stone-800 hover:bg-stone-950"
              disabled={!title.trim() || !user}
              onClick={handleCreate}
            >
              Save graph workspace
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
