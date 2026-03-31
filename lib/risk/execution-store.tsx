"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ExecutionStep {
  label: string;
  status: "done" | "running" | "pending";
  duration: string;
}

export interface ReasoningFactor {
  factor: string;
  weight: number;
  insight: string;
}

export interface AgentExecution {
  id: string;
  title: string;
  status: "running" | "done";
  startedAt: string;
  steps: ExecutionStep[];
  reasoning: ReasoningFactor[];
  confidence: number;
  model: string;
}

// ── Context ──────────────────────────────────────────────────────────────────

interface ExecutionStore {
  executions: AgentExecution[];
  startExecution: (exec: Omit<AgentExecution, "id">) => string;
  updateExecution: (id: string, updates: Partial<AgentExecution>) => void;
  updateStep: (execId: string, stepIndex: number, updates: Partial<ExecutionStep>) => void;
  completeExecution: (id: string, reasoning: ReasoningFactor[], confidence: number, model: string) => void;
  clearExecutions: () => void;
}

const ExecutionContext = createContext<ExecutionStore | null>(null);

let execCounter = 0;
function nextExecId() {
  return `exec-${++execCounter}-${Date.now()}`;
}

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const [executions, setExecutions] = useState<AgentExecution[]>([]);

  const startExecution = useCallback(
    (exec: Omit<AgentExecution, "id">) => {
      const id = nextExecId();
      setExecutions((prev) => [{ ...exec, id }, ...prev]);
      return id;
    },
    [],
  );

  const updateExecution = useCallback(
    (id: string, updates: Partial<AgentExecution>) => {
      setExecutions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );
    },
    [],
  );

  const updateStep = useCallback(
    (execId: string, stepIndex: number, updates: Partial<ExecutionStep>) => {
      setExecutions((prev) =>
        prev.map((e) => {
          if (e.id !== execId) return e;
          const newSteps = [...e.steps];
          if (newSteps[stepIndex]) {
            newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates };
          }
          return { ...e, steps: newSteps };
        }),
      );
    },
    [],
  );

  const completeExecution = useCallback(
    (id: string, reasoning: ReasoningFactor[], confidence: number, model: string) => {
      setExecutions((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const doneSteps = e.steps.map((s) => ({ ...s, status: "done" as const, duration: s.duration === "—" ? `${(Math.random() * 2 + 0.5).toFixed(1)}s` : s.duration }));
          return { ...e, status: "done", steps: doneSteps, reasoning, confidence, model };
        }),
      );
    },
    [],
  );

  const clearExecutions = useCallback(() => {
    setExecutions([]);
  }, []);

  return (
    <ExecutionContext.Provider
      value={{ executions, startExecution, updateExecution, updateStep, completeExecution, clearExecutions }}
    >
      {children}
    </ExecutionContext.Provider>
  );
}

export function useExecutions() {
  const ctx = useContext(ExecutionContext);
  if (!ctx) throw new Error("useExecutions must be used within ExecutionProvider");
  return ctx;
}
