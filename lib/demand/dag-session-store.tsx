"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Node, Edge } from "reactflow";
import { buildFlowDAGNodes } from "@/components/dag/utils/action-dag-templates";
import type { ChatFlow } from "@/components/cdp/chat/chat-data";

interface DAGSessionState {
  nodes: Node[];
  edges: Edge[];
  flowCount: number;
  addFlowToDAG: (flow: ChatFlow, userPrompt: string) => void;
  clearDAG: () => void;
}

const DAGSessionContext = createContext<DAGSessionState>({
  nodes: [],
  edges: [],
  flowCount: 0,
  addFlowToDAG: () => {},
  clearDAG: () => {},
});

export function DAGSessionProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [flowCount, setFlowCount] = useState(0);

  const addFlowToDAG = useCallback(
    (flow: ChatFlow, userPrompt: string) => {
      const { nodes: newNodes, edges: newEdges } = buildFlowDAGNodes(
        flowCount,
        flow.agentSteps,
        userPrompt,
        flow.showNBACards ?? null,
      );
      setNodes((prev) => [...prev, ...newNodes]);
      setEdges((prev) => [...prev, ...newEdges]);
      setFlowCount((c) => c + 1);
    },
    [flowCount],
  );

  const clearDAG = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setFlowCount(0);
  }, []);

  return (
    <DAGSessionContext.Provider value={{ nodes, edges, flowCount, addFlowToDAG, clearDAG }}>
      {children}
    </DAGSessionContext.Provider>
  );
}

export function useDAGSession() {
  return useContext(DAGSessionContext);
}
