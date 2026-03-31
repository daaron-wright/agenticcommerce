"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ExplainabilityStep {
  label: string;
  status: "done" | "running" | "pending";
  duration: string;
}

export interface ExplainabilityReasoning {
  factor: string;
  weight: number;
  insight: string;
}

export interface ExplainabilityExecution {
  id: string;
  chatMessageId: string;
  chatPrompt: string;
  title: string;
  status: "running" | "done";
  startedAt: Date;
  steps: ExplainabilityStep[];
  reasoning: ExplainabilityReasoning[];
  confidence: number;
  model: string;
}

// ── Context ──────────────────────────────────────────────────────────────────

interface ExplainabilityStore {
  executions: ExplainabilityExecution[];
  addExecution: (exec: ExplainabilityExecution) => void;
  updateExecution: (id: string, updates: Partial<ExplainabilityExecution>) => void;
  updateStep: (execId: string, stepIndex: number, updates: Partial<ExplainabilityStep>) => void;
}

const ExplainabilityContext = createContext<ExplainabilityStore | null>(null);

export function ExplainabilityProvider({ children }: { children: ReactNode }) {
  const [executions, setExecutions] = useState<ExplainabilityExecution[]>([]);

  const addExecution = useCallback((exec: ExplainabilityExecution) => {
    setExecutions((prev) => [exec, ...prev]);
  }, []);

  const updateExecution = useCallback(
    (id: string, updates: Partial<ExplainabilityExecution>) => {
      setExecutions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );
    },
    [],
  );

  const updateStep = useCallback(
    (execId: string, stepIndex: number, updates: Partial<ExplainabilityStep>) => {
      setExecutions((prev) =>
        prev.map((e) => {
          if (e.id !== execId) return e;
          const newSteps = [...e.steps];
          newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates };
          return { ...e, steps: newSteps };
        }),
      );
    },
    [],
  );

  return (
    <ExplainabilityContext.Provider value={{ executions, addExecution, updateExecution, updateStep }}>
      {children}
    </ExplainabilityContext.Provider>
  );
}

export function useExplainability() {
  const ctx = useContext(ExplainabilityContext);
  if (!ctx) throw new Error("useExplainability must be used within ExplainabilityProvider");
  return ctx;
}
