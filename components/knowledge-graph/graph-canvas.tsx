"use client";

import {
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect } from "react";

function ViewportController({
  nodes,
  focusedNodeId,
}: {
  nodes: Node[];
  focusedNodeId: string | null;
}) {
  const { fitView, setCenter } = useReactFlow();

  useEffect(() => {
    if (nodes.length === 0) {
      return;
    }

    if (!focusedNodeId) {
      fitView({ padding: 0.16, duration: 350 });
      return;
    }

    const focusedNode = nodes.find((node) => node.id === focusedNodeId);
    if (!focusedNode) {
      fitView({ padding: 0.16, duration: 350 });
      return;
    }

    setCenter(
      focusedNode.position.x + 110,
      focusedNode.position.y + 42,
      { zoom: 0.92, duration: 450 },
    );
  }, [fitView, focusedNodeId, nodes, setCenter]);

  return null;
}

function FlowCanvas({
  nodes,
  edges,
  focusedNodeId,
  onSelectNode,
}: {
  nodes: Node[];
  edges: Edge[];
  focusedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}) {
  return (
    <div className="h-[620px] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top,#ffffff_0%,#fcfcfd_60%,#fafafa_100%)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        panOnScroll
        zoomOnScroll
        minZoom={0.4}
        maxZoom={1.6}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.78 }}
        attributionPosition="bottom-left"
      >
        <ViewportController nodes={nodes} focusedNodeId={focusedNodeId} />
        <Controls
          showInteractive={false}
          className="!bottom-4 !left-4 !top-auto !rounded-xl !border !border-slate-200 !bg-white !shadow-none"
        />
      </ReactFlow>
    </div>
  );
}

export function KnowledgeGraphCanvas({
  nodes,
  edges,
  focusedNodeId,
  onSelectNode,
}: {
  nodes: Node[];
  edges: Edge[];
  focusedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white/95 p-3 shadow-sm">
      <ReactFlowProvider>
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          focusedNodeId={focusedNodeId}
          onSelectNode={onSelectNode}
        />
      </ReactFlowProvider>
    </div>
  );
}
