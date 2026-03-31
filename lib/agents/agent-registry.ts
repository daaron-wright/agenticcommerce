/**
 * CDP Agent Registry
 * Central registry for all CDP agents
 */

export const AGENT_REGISTRY = {
  identity_resolution: {
    id: "identity_resolution",
    name: "Identity Resolution",
    description: "Resolves customer identities across channels",
  },
  consent_gate: {
    id: "consent_gate",
    name: "Consent Gate",
    description: "Manages customer consent and privacy preferences",
  },
  context_summarization: {
    id: "context_summarization",
    name: "Context Summarization",
    description: "Summarizes customer context and history",
  },
  next_best_action: {
    id: "next_best_action",
    name: "Next Best Action",
    description: "Recommends optimal customer actions",
  },
  casework: {
    id: "casework",
    name: "Casework",
    description: "Manages customer service cases",
  },
  audit: {
    id: "audit",
    name: "Audit",
    description: "Audits agent actions and decisions",
  },
  aixla_monitor: {
    id: "aixla_monitor",
    name: "AIXLA Monitor",
    description: "Monitors AI explainability and compliance",
  },
  orchestrator: {
    id: "orchestrator",
    name: "Orchestrator",
    description: "Orchestrates multi-agent workflows",
  },
} as const;

export type AgentId = keyof typeof AGENT_REGISTRY;
