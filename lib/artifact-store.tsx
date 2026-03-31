"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type ArtifactCategory =
  // CDP/UDP module
  | "dashboard"
  | "reports"
  | "mmm"
  | "campaigns"
  | "audiences"
  | "customers"
  | "analytics"
  // Demand Planning module
  | "demand_dashboard"
  | "demand_analytics"
  | "demand_mmm"
  | "incrementality"
  | "nba"
  // Vendor Risk module
  | "risk_dashboard"
  | "vendors"
  | "risk_monitoring"
  | "risk_audit"
  // Control Tower
  | "control_tower";

export const ARTIFACT_CATEGORY_LABELS: Record<ArtifactCategory, string> = {
  dashboard: "Dashboard",
  reports: "Reports",
  mmm: "MMM",
  campaigns: "Campaigns",
  audiences: "Audiences",
  customers: "Customer Insights",
  analytics: "Analytics",
  demand_dashboard: "Demand Dashboard",
  demand_analytics: "Demand Analytics",
  demand_mmm: "Demand Drivers",
  incrementality: "Incrementality",
  nba: "Next Best Actions",
  risk_dashboard: "Risk Dashboard",
  vendors: "Business Services",
  risk_monitoring: "Threat Intelligence",
  risk_audit: "Assessment History",
  control_tower: "Control Tower",
};

export interface ChatArtifact {
  id: string;
  category: ArtifactCategory;
  title: string;
  summary: string;
  /** The chat message ID that produced this artifact */
  chatMessageId: string;
  /** The user prompt that triggered this artifact */
  chatPrompt: string;
  timestamp: Date;
  /** Whether the user has viewed this artifact on the tab page */
  seen: boolean;
  /** Optional: action that was executed */
  action?: string;
  /** Optional: key metric from the interaction */
  metric?: string;
  /** Optional: workflow event sequence used to replay DAG */
  workflowEvents?: string[];
}

// ── Context ──────────────────────────────────────────────────────────────────

interface ArtifactStore {
  artifacts: ChatArtifact[];
  addArtifact: (artifact: Omit<ChatArtifact, "id" | "timestamp" | "seen">) => void;
  addArtifacts: (artifacts: Omit<ChatArtifact, "id" | "timestamp" | "seen">[]) => void;
  getByCategory: (category: ArtifactCategory) => ChatArtifact[];
  getUnseenCount: (category: ArtifactCategory) => number;
  getTotalUnseenCount: () => number;
  markSeen: (category: ArtifactCategory) => void;
  clearArtifacts: () => void;
}

const ArtifactContext = createContext<ArtifactStore | null>(null);

let artifactCounter = 0;
function nextArtifactId() {
  return `artifact-${++artifactCounter}-${Date.now()}`;
}

export function ArtifactProvider({ children }: { children: ReactNode }) {
  const [artifacts, setArtifacts] = useState<ChatArtifact[]>([]);

  const addArtifact = useCallback(
    (artifact: Omit<ChatArtifact, "id" | "timestamp" | "seen">) => {
      setArtifacts((prev) => [
        { ...artifact, id: nextArtifactId(), timestamp: new Date(), seen: false },
        ...prev,
      ]);
    },
    [],
  );

  const addArtifacts = useCallback(
    (newArtifacts: Omit<ChatArtifact, "id" | "timestamp" | "seen">[]) => {
      setArtifacts((prev) => [
        ...newArtifacts.map((a) => ({
          ...a,
          id: nextArtifactId(),
          timestamp: new Date(),
          seen: false,
        })),
        ...prev,
      ]);
    },
    [],
  );

  const getByCategory = useCallback(
    (category: ArtifactCategory) => artifacts.filter((a) => a.category === category),
    [artifacts],
  );

  const getUnseenCount = useCallback(
    (category: ArtifactCategory) =>
      artifacts.filter((a) => a.category === category && !a.seen).length,
    [artifacts],
  );

  const getTotalUnseenCount = useCallback(
    () => artifacts.filter((a) => !a.seen).length,
    [artifacts],
  );

  const markSeen = useCallback((category: ArtifactCategory) => {
    setArtifacts((prev) =>
      prev.map((a) => (a.category === category ? { ...a, seen: true } : a)),
    );
  }, []);

  const clearArtifacts = useCallback(() => {
    setArtifacts([]);
  }, []);

  return (
    <ArtifactContext.Provider
      value={{ artifacts, addArtifact, addArtifacts, getByCategory, getUnseenCount, getTotalUnseenCount, markSeen, clearArtifacts }}
    >
      {children}
    </ArtifactContext.Provider>
  );
}

export function useArtifacts() {
  const ctx = useContext(ArtifactContext);
  if (!ctx) throw new Error("useArtifacts must be used within ArtifactProvider");
  return ctx;
}
