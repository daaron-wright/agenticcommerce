"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  KNOWLEDGE_GRAPH_NEIGHBORHOODS,
  KNOWLEDGE_GRAPH_PRESETS,
  type KnowledgeGraphDomain,
  type KnowledgeGraphNodeType,
  type KnowledgeGraphPresetId,
} from "@/lib/knowledge-graph-data";

export type KnowledgeGraphInstanceSource = "chat" | "control_tower";

export interface KnowledgeGraphInstance {
  id: string;
  title: string;
  description: string;
  domain: KnowledgeGraphDomain;
  presetId: KnowledgeGraphPresetId;
  scopeId?: string | null;
  centerNodeId?: string | null;
  query: string;
  activeDomains: KnowledgeGraphDomain[];
  activeNodeTypes: KnowledgeGraphNodeType[];
  source: KnowledgeGraphInstanceSource;
  sourcePrompt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeGraphInstanceInput {
  title: string;
  description?: string;
  domain: KnowledgeGraphDomain;
  presetId: KnowledgeGraphPresetId;
  scopeId?: string | null;
  centerNodeId?: string | null;
  query?: string;
  activeDomains?: KnowledgeGraphDomain[];
  activeNodeTypes?: KnowledgeGraphNodeType[];
  source: KnowledgeGraphInstanceSource;
  sourcePrompt?: string;
  createdBy: string;
}

interface KnowledgeGraphInstanceStore {
  instances: KnowledgeGraphInstance[];
  isHydrated: boolean;
  createInstance: (input: CreateKnowledgeGraphInstanceInput) => KnowledgeGraphInstance;
  deleteInstance: (instanceId: string) => void;
  getInstance: (instanceId: string) => KnowledgeGraphInstance | null;
}

const STORAGE_KEY = "kyn-saved-knowledge-graph-instances";

const KnowledgeGraphInstanceContext = createContext<KnowledgeGraphInstanceStore | null>(null);

function nextInstanceId() {
  return `graph-instance-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultActiveDomains(domain: KnowledgeGraphDomain): KnowledgeGraphDomain[] {
  return domain === "cross-domain" ? ["udp", "demand", "cross-domain"] : [domain];
}

function createSeededInstances(): KnowledgeGraphInstance[] {
  const now = new Date().toISOString();
  return [
    {
      id: "graph-instance-seed-platform-story",
      title: "Cross-Domain Operator Story",
      description:
        "Shared workspace for tracing how customer readiness, campaign performance, and demand pressure converge in the control tower.",
      domain: "cross-domain",
      presetId: "story-neighborhood",
      scopeId: "control-tower-story",
      centerNodeId: "graph-control-tower",
      query: "",
      activeDomains: ["udp", "demand", "risk", "cross-domain"],
      activeNodeTypes: [],
      source: "control_tower",
      sourcePrompt: "Create a shared cross-domain investigation workspace.",
      createdBy: "Platform Ops",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "graph-instance-seed-udp-readiness",
      title: "Consent Readiness Investigation",
      description:
        "Shared workspace for tracking identity, consent, and activation blockers before customer journeys are re-enabled.",
      domain: "udp",
      presetId: "udp-neighborhood",
      scopeId: "udp-consent-readiness",
      centerNodeId: "graph-consent-record",
      query: "",
      activeDomains: ["udp"],
      activeNodeTypes: [],
      source: "control_tower",
      sourcePrompt: "Create a graph for UDP consent readiness.",
      createdBy: "Platform Ops",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function sanitizePresetId(value: string | undefined): KnowledgeGraphPresetId {
  if (KNOWLEDGE_GRAPH_PRESETS.some((preset) => preset.id === value)) {
    return value as KnowledgeGraphPresetId;
  }
  return "full-graph";
}

function sanitizeScopeId(presetId: KnowledgeGraphPresetId, scopeId?: string | null) {
  if (!scopeId) {
    return getDefaultNeighborhoodForPreset(presetId);
  }

  const neighborhood = KNOWLEDGE_GRAPH_NEIGHBORHOODS.find((candidate) => candidate.id === scopeId);
  if (neighborhood && neighborhood.preset === presetId) {
    return scopeId;
  }

  return getDefaultNeighborhoodForPreset(presetId);
}

function getDefaultNeighborhoodForPreset(presetId: KnowledgeGraphPresetId) {
  return KNOWLEDGE_GRAPH_PRESETS.find((preset) => preset.id === presetId)?.defaultNeighborhoodId ?? null;
}

function sanitizeInstance(raw: unknown): KnowledgeGraphInstance | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Partial<KnowledgeGraphInstance>;
  if (typeof candidate.id !== "string" || typeof candidate.title !== "string") {
    return null;
  }

  const domain =
    candidate.domain === "udp" ||
    candidate.domain === "demand" ||
    candidate.domain === "cross-domain"
      ? candidate.domain
      : "cross-domain";
  const presetId = sanitizePresetId(candidate.presetId);
  const scopeId = sanitizeScopeId(presetId, candidate.scopeId);

  return {
    id: candidate.id,
    title: candidate.title,
    description: typeof candidate.description === "string" ? candidate.description : "",
    domain,
    presetId,
    scopeId,
    centerNodeId: typeof candidate.centerNodeId === "string" ? candidate.centerNodeId : null,
    query: typeof candidate.query === "string" ? candidate.query : "",
    activeDomains: Array.isArray(candidate.activeDomains)
      ? candidate.activeDomains.filter(
          (value): value is KnowledgeGraphDomain =>
            value === "udp" || value === "demand" || value === "cross-domain",
        )
      : getDefaultActiveDomains(domain),
    activeNodeTypes: Array.isArray(candidate.activeNodeTypes)
      ? candidate.activeNodeTypes.filter((value): value is KnowledgeGraphNodeType => typeof value === "string")
      : [],
    source: candidate.source === "chat" ? "chat" : "control_tower",
    sourcePrompt: typeof candidate.sourcePrompt === "string" ? candidate.sourcePrompt : undefined,
    createdBy: typeof candidate.createdBy === "string" ? candidate.createdBy : "Platform Operator",
    createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : new Date().toISOString(),
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
  };
}

function loadInstancesFromStorage(): KnowledgeGraphInstance[] {
  if (typeof window === "undefined") {
    return createSeededInstances();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = createSeededInstances();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Saved graph instances are not an array");
    }

    const sanitized = parsed
      .map((item) => sanitizeInstance(item))
      .filter((item): item is KnowledgeGraphInstance => Boolean(item))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

    return sanitized.length > 0 ? sanitized : createSeededInstances();
  } catch (error) {
    console.error("Failed to load knowledge graph instances:", error);
    const seeded = createSeededInstances();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function persistInstances(instances: KnowledgeGraphInstance[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(instances));
}

export function createKnowledgeGraphInstanceHref(instanceId: string) {
  return `/dashboard/graph?instance=${encodeURIComponent(instanceId)}`;
}

export function KnowledgeGraphInstanceProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<KnowledgeGraphInstance[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadInstancesFromStorage();
    setInstances(loaded);
    setIsHydrated(true);
  }, []);

  const createInstance = useCallback((input: CreateKnowledgeGraphInstanceInput) => {
    const timestamp = new Date().toISOString();
    const presetId = sanitizePresetId(input.presetId);
    const scopeId = sanitizeScopeId(presetId, input.scopeId);
    const instance: KnowledgeGraphInstance = {
      id: nextInstanceId(),
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      domain: input.domain,
      presetId,
      scopeId,
      centerNodeId: input.centerNodeId ?? null,
      query: input.query?.trim() ?? "",
      activeDomains:
        input.activeDomains && input.activeDomains.length > 0
          ? input.activeDomains
          : getDefaultActiveDomains(input.domain),
      activeNodeTypes: input.activeNodeTypes ?? [],
      source: input.source,
      sourcePrompt: input.sourcePrompt?.trim() || undefined,
      createdBy: input.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setInstances((current) => {
      const next = [instance, ...current].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );
      persistInstances(next);
      return next;
    });

    return instance;
  }, []);

  const deleteInstance = useCallback((instanceId: string) => {
    setInstances((current) => {
      const next = current.filter((instance) => instance.id !== instanceId);
      persistInstances(next);
      return next;
    });
  }, []);

  const getInstance = useCallback(
    (instanceId: string) => instances.find((instance) => instance.id === instanceId) ?? null,
    [instances],
  );

  const value = useMemo<KnowledgeGraphInstanceStore>(
    () => ({
      instances,
      isHydrated,
      createInstance,
      deleteInstance,
      getInstance,
    }),
    [createInstance, deleteInstance, getInstance, instances, isHydrated],
  );

  return (
    <KnowledgeGraphInstanceContext.Provider value={value}>
      {children}
    </KnowledgeGraphInstanceContext.Provider>
  );
}

export function useKnowledgeGraphInstances() {
  const context = useContext(KnowledgeGraphInstanceContext);
  if (!context) {
    throw new Error("useKnowledgeGraphInstances must be used within KnowledgeGraphInstanceProvider");
  }
  return context;
}
