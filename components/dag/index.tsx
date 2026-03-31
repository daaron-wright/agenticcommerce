"use client";

// Main export file for the DAG component
import { DAGVisualization } from "./visualization";

export { DAGVisualization };

// Also export sub-components for flexibility
export { CustomNode } from "./nodes/custom-node";
export { CloudNode } from "./nodes/cloud-node";
export { OnPremNode } from "./nodes/on-prem-node";
export { CustomEdge } from "./edges/custom-edge";
export { BackgroundLayer } from "./background/background-layer";

// Re-export the props interface for better typing support
export type { DAGVisualizationProps } from "./visualization";
