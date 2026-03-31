import type { Node, Edge } from "reactflow";
import { nodeLibrary } from "./node-library";

export type DAGState = {
  nodes: Node[];
  edges: Edge[];
  sequence: string[]; // node IDs in order
};

// Example allowed transitions (expand as needed)
export const allowedTransitions: Record<string, string[]> = {
  Q0: ["D1", "S1"],
  D1: ["C1", "V1"],
  S1: ["G1", "L0"],
  G1: ["C1"],
  C1: ["V1", "CM1"],
  V1: ["BR1"],
  L0: ["TEMPLATE", "BR1"],
  TEMPLATE: [],
  VHX: ["CM1"],
  NLP1: ["CM1", "FAQ0", "BR1"],
  CM1: ["BR1"],
  FAQ0: ["COMPLETE"],
  BR1: ["COMPLETE"],
  COMPLETE: [],
};

export function getNextNodes(currentNodeId: string): string[] {
  return allowedTransitions[currentNodeId] || [];
}

export function addNodeToDAG(dag: DAGState, nextNodeId: string, position: { x: number; y: number }): DAGState {
  if (!dag.sequence.includes(nextNodeId) && nodeLibrary[nextNodeId]) {
    dag.nodes.push({ ...nodeLibrary[nextNodeId], id: nextNodeId, position });
    dag.edges.push({
      id: `e-${dag.sequence[dag.sequence.length - 1]}-${nextNodeId}`,
      source: dag.sequence[dag.sequence.length - 1],
      target: nextNodeId,
      animated: false,
      style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
    });
    dag.sequence.push(nextNodeId);
  }
  return dag;
}

export function createInitialDAG(position: { x: number; y: number }): DAGState {
  const DEFAULT_NODE_DISTANCE = 250 + 300; // Increase by 300 from previous default
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isChatPage = pathname.includes("/chat");
  const isDashboardPage = pathname.includes("/dashboard");
  const nodes = [{ ...nodeLibrary["AGENT_START"], id: "AGENT_START", position }];
  const edges: Edge[] = [];
  const sequence = ["AGENT_START"];

  const appendNode = (nodeId: string, sourceId: string, nextPosition: { x: number; y: number }) => {
    if (!nodeLibrary[nodeId]) return sourceId;

    nodes.push({ ...nodeLibrary[nodeId], id: nodeId, position: nextPosition });
    edges.push({
      id: `e-${sourceId}-${nodeId}`,
      source: sourceId,
      target: nodeId,
      animated: false,
      style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
    });
    sequence.push(nodeId);
    return nodeId;
  };

  if (isChatPage && nodeLibrary["RECOMMENDATIONS"]) {
    appendNode("RECOMMENDATIONS", "AGENT_START", {
      x: position.x + DEFAULT_NODE_DISTANCE,
      y: position.y,
    });
  }

  if (isDashboardPage) {
    const warningNodeId = nodeLibrary["WARNING_STOCK_DETECT_RISK"]
      ? "WARNING_STOCK_DETECT_RISK"
      : "AGENT_STEP_ACTIVATE_ANOMALY_AGENT";

    const recommendationsNode = appendNode("RECOMMENDATIONS", "AGENT_START", {
      x: position.x + DEFAULT_NODE_DISTANCE,
      y: position.y,
    });

    appendNode(warningNodeId, recommendationsNode, {
      x: position.x + DEFAULT_NODE_DISTANCE * 2,
      y: position.y,
    });
  }

  return { nodes, edges, sequence };
}
