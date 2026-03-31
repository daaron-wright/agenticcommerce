/**
 * CDP Workflow Types
 */

export interface WorkflowNode {
  id: string;
  title: string;
  purpose: string;
  agent: string;
  tool: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  dependencies?: string[];
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

export interface WorkflowDefinition {
  workflow_name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: {
    author?: string;
    created?: string;
    updated?: string;
  };
}

export interface WorkflowExecutionContext {
  workflowId: string;
  userId?: string;
  sessionId?: string;
  inputs: Record<string, any>;
  state: Record<string, any>;
}

export type WorkflowStatus = "pending" | "running" | "completed" | "failed" | "paused";

export interface WorkflowExecution {
  id: string;
  workflowName: string;
  status: WorkflowStatus;
  startTime: number;
  endTime?: number;
  context: WorkflowExecutionContext;
  currentNode?: string;
  error?: string;
}
