/**
 * CDP Agent Types
 */

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  endpoint?: string;
  tools: string[];
  systemPrompt?: string;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    agentId: string;
    timestamp: number;
    duration?: number;
  };
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AgentState {
  agentId: string;
  status: "idle" | "processing" | "error";
  lastUpdate: number;
  context?: Record<string, any>;
}
