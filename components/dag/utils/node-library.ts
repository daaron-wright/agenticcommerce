// Placeholder node for unmapped chat events
export const PLACEHOLDER_NODE_TYPE = "placeholder";

export const DAG_NODE_COLOR_BY_TASK = {
  ORCHESTRATION: "#A3A3FF",
  GOVERNANCE: "#DC2626",
  DATA_INGESTION: "#00BFFF",
  ANALYSIS: "#FFD700",
  RECOMMENDATION: "#8A2BE2",
  EXECUTION: "#4682B4",
  MONITORING: "#FF4500",
  SNAPSHOT: "#20B2AA",
  UNKNOWN: "#64748B",
} as const;

export const DAG_COLOR_KEY = [
  { label: "Orchestration", color: DAG_NODE_COLOR_BY_TASK.ORCHESTRATION, description: "Session start and workflow initialization" },
  { label: "Governance", color: DAG_NODE_COLOR_BY_TASK.GOVERNANCE, description: "Approval and review lifecycle" },
  { label: "Data Ingestion", color: DAG_NODE_COLOR_BY_TASK.DATA_INGESTION, description: "Data fetch and stream collection tasks" },
  { label: "Analysis", color: DAG_NODE_COLOR_BY_TASK.ANALYSIS, description: "Interpretation and scenario analysis steps" },
  { label: "Recommendation", color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION, description: "Suggested actions and follow-up generation" },
  { label: "Execution", color: DAG_NODE_COLOR_BY_TASK.EXECUTION, description: "Action execution and operational steps" },
  { label: "Monitoring", color: DAG_NODE_COLOR_BY_TASK.MONITORING, description: "Anomaly and performance monitoring" },
  { label: "Snapshot", color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT, description: "Point-in-time views of system state" },
  { label: "Unmapped", color: DAG_NODE_COLOR_BY_TASK.UNKNOWN, description: "Events without a mapped node" },
] as const;

export const FLOW_STEP_NODE_PREFIX = "FLOW_STEP_";

type DagTask = keyof typeof DAG_NODE_COLOR_BY_TASK;

const TASK_DESCRIPTION: Record<DagTask, string> = {
  ORCHESTRATION: "Session start and workflow initialization",
  GOVERNANCE: "Approval and review lifecycle",
  DATA_INGESTION: "Data fetch and stream collection tasks",
  ANALYSIS: "Interpretation and scenario analysis steps",
  RECOMMENDATION: "Suggested actions and follow-up generation",
  EXECUTION: "Action execution and operational steps",
  MONITORING: "Anomaly and performance monitoring",
  SNAPSHOT: "Point-in-time views of system state",
  UNKNOWN: "Events without a mapped node",
};

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const hashEvent = (event: string) => {
  let hash = 7;
  for (let i = 0; i < event.length; i += 1) {
    hash = (hash * 31 + event.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase();
};

const sanitizeEvent = (event: string) =>
  event
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

export const getFlowStepNodeId = (event: string) => {
  const base = sanitizeEvent(event) || "UNKNOWN";
  return `${FLOW_STEP_NODE_PREFIX}${base}_${hashEvent(event)}`;
};

export const isFlowStepNodeId = (nodeId: string) => nodeId.startsWith(FLOW_STEP_NODE_PREFIX);

export const inferDagTaskFromEvent = (event: string): DagTask => {
  const normalized = event.trim().toLowerCase();

  if (!normalized) return "UNKNOWN";

  if (
    normalized.includes("monitoring") ||
    normalized.includes("tracking") ||
    normalized.includes("alert")
  ) {
    return "MONITORING";
  }

  if (normalized.startsWith("processing")) {
    return "ORCHESTRATION";
  }

  if (
    normalized.startsWith("validating") ||
    normalized.startsWith("checking") ||
    normalized.startsWith("applying") ||
    normalized.startsWith("publishing") ||
    normalized.startsWith("submitting") ||
    normalized.startsWith("deploying") ||
    normalized.startsWith("pausing") ||
    normalized.startsWith("reallocating") ||
    normalized.startsWith("configuring")
  ) {
    return "EXECUTION";
  }

  if (
    normalized.startsWith("generating") ||
    normalized.startsWith("preparing") ||
    normalized.startsWith("building") ||
    normalized.startsWith("formatting") ||
    normalized.startsWith("ranking") ||
    normalized.startsWith("prioritizing")
  ) {
    return "RECOMMENDATION";
  }

  if (
    normalized.startsWith("querying") ||
    normalized.startsWith("loading") ||
    normalized.startsWith("polling") ||
    normalized.startsWith("collecting") ||
    normalized.startsWith("compiling") ||
    normalized.startsWith("searching") ||
    normalized.startsWith("aggregating") ||
    normalized.startsWith("reviewing external market") ||
    normalized.startsWith("reviewing product and inventory")
  ) {
    return "DATA_INGESTION";
  }

  if (
    normalized.startsWith("analyzing") ||
    normalized.startsWith("computing") ||
    normalized.startsWith("calculating") ||
    normalized.startsWith("evaluating") ||
    normalized.startsWith("projecting") ||
    normalized.startsWith("modeling") ||
    normalized.startsWith("detecting") ||
    normalized.startsWith("identifying") ||
    normalized.startsWith("scoring") ||
    normalized.startsWith("mapping") ||
    normalized.startsWith("segmenting") ||
    normalized.startsWith("estimating") ||
    normalized.startsWith("reviewing") ||
    normalized.startsWith("flagging")
  ) {
    return "ANALYSIS";
  }

  return "RECOMMENDATION";
};

export const buildFlowStepNode = (event: string) => {
  const task = inferDagTaskFromEvent(event);

  return {
    type: "custom",
    data: {
      label: titleCase(event),
      color: DAG_NODE_COLOR_BY_TASK[task],
      description: TASK_DESCRIPTION[task],
      details: [
        `Event: ${event}`,
        `Task Category: ${task.toLowerCase().replace(/_/g, " ")}`,
      ],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  };
};

type DagNodeDefinition = {
  id?: string;
  type: string;
  data: {
    label: string;
    color: string;
    description: string;
    details: string[];
    metrics: Record<string, unknown>;
    processingTime: number;
    processingState: string;
    [key: string]: unknown;
  };
};

export const nodeLibrary: Record<string, DagNodeDefinition> = {
  REVIEW_REQUESTED: {
    type: "custom",
    data: {
      label: "Sent for Review",
      color: DAG_NODE_COLOR_BY_TASK.GOVERNANCE,
      description: "This AI-recommended action has been submitted for admin review before execution.",
      details: [
        "Status: Awaiting admin approval",
        "Trigger: User lacks ai_action_execute permission",
        "Next step: Admin review and confirmation",
      ],
      metrics: {
        Priority: "high",
        Status: "pending_review",
      },
      processingTime: 0,
      processingState: "idle",
    },
  },
  REVIEW_EXAMINING: {
    type: "custom",
    data: {
      label: "Review In Progress",
      color: DAG_NODE_COLOR_BY_TASK.GOVERNANCE,
      description: "A marketing admin is validating this requested action.",
      details: [
        "Status: Under admin review",
        "Checks: constraints, spend impact, and policy guardrails",
      ],
      metrics: {
        Priority: "high",
        Status: "reviewing",
      },
      processingTime: 0,
      processingState: "idle",
    },
  },
  REVIEW_APPROVED: {
    type: "custom",
    data: {
      label: "Review Approved",
      color: DAG_NODE_COLOR_BY_TASK.GOVERNANCE,
      description: "The action has been approved by an admin and is cleared for execution.",
      details: [
        "Decision: Approved",
        "Next step: Execute action",
      ],
      metrics: {
        Priority: "high",
        Status: "approved",
      },
      processingTime: 0,
      processingState: "idle",
    },
  },
  REVIEW_REJECTED: {
    type: "custom",
    data: {
      label: "Review Rejected",
      color: DAG_NODE_COLOR_BY_TASK.GOVERNANCE,
      description: "The requested action was rejected by the admin.",
      details: [
        "Decision: Rejected",
        "Outcome: Action not executed",
      ],
      metrics: {
        Priority: "medium",
        Status: "rejected",
      },
      processingTime: 0,
      processingState: "idle",
    },
  },
  REVIEW_EXECUTING: {
    type: "custom",
    data: {
      label: "Approved Action Executing",
      color: DAG_NODE_COLOR_BY_TASK.EXECUTION,
      description: "The approved action is now running through execution steps.",
      details: [
        "Source: Admin-approved review item",
        "Mode: Execution pipeline active",
      ],
      metrics: {
        Priority: "high",
        Status: "executing",
      },
      processingTime: 0,
      processingState: "idle",
    },
  },
  placeholder: {
    type: "custom",
    data: {
      label: "Unknown Event",
      color: DAG_NODE_COLOR_BY_TASK.UNKNOWN,
      description: "This node represents an unmapped chat action.",
      details: ["No mapping found for this event."],
      metrics: { Priority: "low" },
      processingTime: 0,
      processingState: "idle",
    },
  },
  AGENT_START: {
    type: "custom",
    data: {
      label: "Agent Connection & Orchestration",
      color: DAG_NODE_COLOR_BY_TASK.ORCHESTRATION,
      description: "Initialize agent, set up orchestration, and prepare workflow context.",
      details: [
        "Step: Establish agent session",
        "Action: Load orchestration config",
        "Outcome: Ready for user interaction",
      ],
      metrics: {
        Priority: "critical",
        Status: "initialized",
      },
      processingTime: 1,
      processingState: "idle",
    },
  },
  Q0: {
    type: "custom",
    data: {
      label: "Parse User Query",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description:
        "Extract intents, entities, timeframe, urgency from minister's prompt.",
      details: [
        "Tool: nlu.parse",
        "Async: false",
        "Outputs: intent_schema, key_phrases",
      ],
      metrics: {
        Priority: "high",
        Retries: "3",
      },
      processingTime: 2,
      processingState: "idle",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The user query to process",
          },
          parameters: {
            type: "object",
            properties: {
              maxResults: { type: "number", default: 10 },
              includeMetadata: { type: "boolean", default: true },
              filters: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "When the query was submitted",
          },
        },
        required: ["query"],
      },
      outputSchema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                score: { type: "number" },
                content: { type: "string" },
              },
            },
          },
          metadata: {
            type: "object",
            properties: {
              totalResults: { type: "number" },
              processingTime: { type: "number" },
              confidence: { type: "number" },
            },
          },
          status: { type: "string", enum: ["success", "partial", "failed"] },
        },
        required: ["results", "status"],
      },
      logs: [
        { timestamp: "2025-04-30T14:32:15Z", level: "INFO", message: "Starting intent parsing" },
        { timestamp: "2025-04-30T14:32:16Z", level: "INFO", message: "Tokenizing input query" },
        { timestamp: "2025-04-30T14:32:17Z", level: "INFO", message: "Applying NLU model" },
        { timestamp: "2025-04-30T14:32:18Z", level: "WARN", message: "Low confidence on entity extraction" },
        { timestamp: "2025-04-30T14:32:19Z", level: "INFO", message: "Intent identified: information_request" },
        { timestamp: "2025-04-30T14:32:20Z", level: "INFO", message: "Extracting key phrases" },
        { timestamp: "2025-04-30T14:32:21Z", level: "INFO", message: "Intent parsing completed" },
      ],
      config: {
        version: "2.1.0",
        model: "nlu-parser-v3",
        timeout: "5s",
        retries: 2,
        confidence_threshold: 0.75,
        lastModified: "2025-04-15T10:23:42Z",
      },
    },
  },
  D1: {
    id: "D1",
    type: "cloud",
    data: {
      label: "Fetch Epidemiological Data",
      color: DAG_NODE_COLOR_BY_TASK.DATA_INGESTION,
      description:
        "Pull latest measles case counts by emirate and district from cloud data warehouse.",
      details: [
        "Tool: data.fetch_api",
        "Sources: MoH, WHO, DHIS2",
        "Window: P30D",
        "Schedule: */15 * * * *",
      ],
      metrics: {
        Async: "true",
        Output: "cases_tbl",
      },
      processingTime: 5,
      processingState: "idle",
      inputSchema: {
        type: "object",
        properties: {
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          regions: { type: "array", items: { type: "string" } },
        },
        required: ["startDate", "endDate"],
      },
      outputSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            region: { type: "string" },
            date: { type: "string", format: "date" },
            cases: { type: "number" },
          },
        },
      },
      logs: [
        { timestamp: "2025-04-30T14:32:25Z", level: "INFO", message: "Fetching data from MoH" },
        { timestamp: "2025-04-30T14:32:27Z", level: "INFO", message: "Fetching data from WHO" },
        { timestamp: "2025-04-30T14:32:29Z", level: "INFO", message: "Data aggregation complete" },
      ],
      config: {
        apiEndpoint: "https://moh.gov/api/epidemiological_data",
        retries: 3,
        timeout: "10s",
      },
    },
  },
  S1: {
    id: "S1",
    type: "onprem",
    data: {
      label: "Stream Social Chatter",
      color: DAG_NODE_COLOR_BY_TASK.DATA_INGESTION,
      description:
        "Real-time scrape of keywords across social platforms from on-prem servers.",
      details: [
        "Tool: social.stream",
        "Keywords: measles, rash, vaccination, MMR",
        "Languages: ar, en, ur",
        "Schedule: realtime",
        "Concurrency group: stream",
      ],
      metrics: {
        Async: "true",
        Output: "raw_posts",
      },
      processingTime: 3,
      processingState: "idle",
      inputSchema: {
        type: "object",
        properties: {
          keywords: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
        },
        required: ["keywords", "languages"],
      },
      outputSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            platform: { type: "string" },
            text: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            location: { type: "string" },
          },
        },
      },
      logs: [
        { timestamp: "2025-04-30T14:32:35Z", level: "INFO", message: "Starting social media stream" },
        { timestamp: "2025-04-30T14:32:36Z", level: "INFO", message: "Connecting to Twitter API" },
        { timestamp: "2025-04-30T14:32:37Z", level: "INFO", message: "Filtering posts by keywords" },
      ],
      config: {
        platforms: ["Twitter", "Facebook", "Instagram"],
        rateLimit: 100,
      },
    },
  },
  // Chat Recommendation Nodes
  RECOMMENDATIONS: {
    id: "RECOMMENDATIONS",
    type: "custom",
    data: {
      label: "Business Recommendations & Suggested Questions",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Provides actionable business recommendations and suggested follow-up questions for the user, generated by the agent based on current context and data.",
      details: [
        "Content: Actionable recommendations",
        "Source: AI agent analysis",
        "Includes: Suggested next questions for user",
        "Visibility: Only appears after initial node on chat page",
      ],
      metrics: {
        Priority: "high",
        Confidence: "dynamic",
      },
      processingTime: 2,
      processingState: "idle",
      recommendations: [
        "Increase marketing spend in high-performing regions.",
        "Consider launching a new campaign for underperforming segments.",
        "Suggested question: What is the expected ROI for the next quarter?",
        "Suggested question: Which channels are most cost-effective right now?",
      ],
    },
  },
  CHAT_REC_1: {
    id: "CHAT_REC_1",
    type: "custom",
    data: {
      label: "Maximize Short-Term Profit",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Optimize channel spend to boost near-term revenue.",
      details: [
        "Focus: High-margin segments",
        "Action: Reallocate budget to top-performing channels",
        "Expected Outcome: +15% Net Profit",
      ],
      metrics: {
        Priority: "high",
        Confidence: "88%",
      },
      processingTime: 2,
      processingState: "idle",
    },
  },
  CHAT_REC_2: {
    id: "CHAT_REC_2",
    type: "custom",
    data: {
      label: "Grow New Customer Acquisition",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Expand reach in untapped regions to acquire new customers.",
      details: [
        "Focus: Underserved regions",
        "Action: Launch targeted campaigns",
        "Expected Outcome: +20% New Users",
      ],
      metrics: {
        Priority: "high",
        Confidence: "79%",
      },
      processingTime: 2,
      processingState: "idle",
    },
  },
  CHAT_REC_3: {
    id: "CHAT_REC_3",
    type: "custom",
    data: {
      label: "Defend High-Value Segment",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Prevent churn among top-value customers with retention actions.",
      details: [
        "Focus: High-LTV customers",
        "Action: Personalized win-back offers",
        "Expected Outcome: -30% Churn Rate",
      ],
      metrics: {
        Priority: "high",
        Confidence: "94%",
      },
      processingTime: 2,
      processingState: "idle",
    },
  },
  CHAT_REC_4: {
    id: "CHAT_REC_4",
    type: "custom",
    data: {
      label: "Compare Marketing Mix Performance",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Analyze and compare performance across all marketing channels.",
      details: [
        "Focus: Channel performance",
        "Action: Cross-channel analysis",
        "Expected Outcome: Optimized allocation",
      ],
      metrics: {
        Priority: "medium",
        Confidence: "86%",
      },
      processingTime: 2,
      processingState: "idle",
    },
  },
  CHAT_REC_5: {
    id: "CHAT_REC_5",
    type: "custom",
    data: {
      label: "AI Agent Recommendations",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "View current actions recommended by the AI agent.",
      details: [
        "Focus: AI-driven insights",
        "Action: Review recommended actions",
        "Expected Outcome: Actionable next steps",
      ],
      metrics: {
        Priority: "high",
        Confidence: "91%",
      },
      processingTime: 2,
      processingState: "idle",
    },
  },
  CHAT_REC_6: {
    id: "CHAT_REC_6",
    type: "custom",
    data: {
      label: "Generate Campaign Performance Summary",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Summarize performance metrics for all campaigns.",
      details: [
        "Focus: Campaign analytics",
        "Action: Generate summary report",
        "Expected Outcome: Clear performance overview",
      ],
      metrics: {
        Priority: "medium",
        Confidence: "84%",
      },
      processingTime: 2,
      processingState: "idle",
    },
  },
  AGENT_STEP_VALIDATING_BUDGET: {
    id: "AGENT_STEP_VALIDATING_BUDGET",
    type: "custom",
    data: {
      label: "Validating Budget Headroom & Constraints",
      color: DAG_NODE_COLOR_BY_TASK.EXECUTION,
      description: "Checks available budget and constraints before executing actions.",
      details: ["Step: Validate budget headroom", "Action: Check constraints", "Outcome: Budget confirmed or flagged"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  AGENT_STEP_SUBMIT_BUDGET_INCREASE: {
    id: "AGENT_STEP_SUBMIT_BUDGET_INCREASE",
    type: "custom",
    data: {
      label: "Submitting +30% Budget Increase to Google Ads",
      color: DAG_NODE_COLOR_BY_TASK.EXECUTION,
      description: "Submits a budget increase to Google Ads for campaign execution.",
      details: ["Step: Submit budget increase", "Action: Google Ads API", "Outcome: Budget updated"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  AGENT_STEP_CONFIGURE_MONITORING: {
    id: "AGENT_STEP_CONFIGURE_MONITORING",
    type: "custom",
    data: {
      label: "Configuring Performance Monitoring Rules",
      color: DAG_NODE_COLOR_BY_TASK.EXECUTION,
      description: "Sets up rules to monitor campaign performance and detect anomalies.",
      details: ["Step: Configure monitoring", "Action: Set rules", "Outcome: Monitoring active"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  AGENT_STEP_ACTIVATE_ANOMALY_AGENT: {
    id: "AGENT_STEP_ACTIVATE_ANOMALY_AGENT",
    type: "custom",
    data: {
      label: "Activating Anomaly Detection Agent",
      color: DAG_NODE_COLOR_BY_TASK.MONITORING,
      description: "Activates the anomaly detection agent to monitor for unusual performance signals.",
      details: ["Step: Activate anomaly agent", "Action: Monitor for anomalies", "Outcome: Alerts on anomalies"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_RETURN_COLLECT_SIGNALS: {
    id: "WARNING_RETURN_COLLECT_SIGNALS",
    type: "custom",
    data: {
      label: "Collecting Category Return Signals",
      color: DAG_NODE_COLOR_BY_TASK.DATA_INGESTION,
      description: "Collects return-volume and reason-code signals across product categories.",
      details: ["Step: Collect category returns", "Outcome: Return signal baseline"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_RETURN_ATTRIBUTION: {
    id: "WARNING_RETURN_ATTRIBUTION",
    type: "custom",
    data: {
      label: "Attributing Return Causes by SKU",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Attributes return causes to specific SKUs and reason codes.",
      details: ["Step: Driver attribution", "Outcome: SKU-level root causes"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_RETURN_SCORE_IMPACT: {
    id: "WARNING_RETURN_SCORE_IMPACT",
    type: "custom",
    data: {
      label: "Scoring Return Impact by Category",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Scores categories by return burden and business impact.",
      details: ["Step: Impact scoring", "Outcome: Priority categories ranked"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_RETURN_PREPARE_PLAN: {
    id: "WARNING_RETURN_PREPARE_PLAN",
    type: "custom",
    data: {
      label: "Preparing Return Mitigation Plan",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Builds an actionable mitigation plan for highest-impact return drivers.",
      details: ["Step: Plan generation", "Outcome: Prioritized mitigation actions"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_RETURN_LOAD_MODEL: {
    id: "WARNING_RETURN_LOAD_MODEL",
    type: "custom",
    data: {
      label: "Loading Return Recommendation Model",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Loads recommendation model for return-pressure intervention planning.",
      details: ["Step: Model load", "Outcome: Recommendation engine ready"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_RETURN_RANK_ACTIONS: {
    id: "WARNING_RETURN_RANK_ACTIONS",
    type: "custom",
    data: {
      label: "Ranking Return-Reduction Actions",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Ranks actions by projected return-rate reduction and confidence.",
      details: ["Step: Rank actions", "Outcome: Priority execution order"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_RETURN_GENERATE_QUEUE: {
    id: "WARNING_RETURN_GENERATE_QUEUE",
    type: "custom",
    data: {
      label: "Generating Return Action Queue",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Generates a prioritized action queue to reduce return pressure.",
      details: ["Step: Queue generation", "Outcome: Ordered action list"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_RETURN_GUARDRAILS: {
    id: "WARNING_RETURN_GUARDRAILS",
    type: "custom",
    data: {
      label: "Preparing Return Execution Guardrails",
      color: DAG_NODE_COLOR_BY_TASK.EXECUTION,
      description: "Defines guardrails and controls for return-focused action rollout.",
      details: ["Step: Guardrail setup", "Outcome: Controlled execution plan"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_STOCK_COLLECT_COVERAGE: {
    id: "WARNING_STOCK_COLLECT_COVERAGE",
    type: "custom",
    data: {
      label: "Collecting Demand and Stock Coverage",
      color: DAG_NODE_COLOR_BY_TASK.DATA_INGESTION,
      description: "Collects demand velocity and coverage signals by category.",
      details: ["Step: Data collection", "Outcome: Coverage baseline"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_STOCK_DETECT_RISK: {
    id: "WARNING_STOCK_DETECT_RISK",
    type: "custom",
    data: {
      label: "Detecting Stockout and Overstock Risk",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Detects risk zones where stock coverage diverges from demand.",
      details: ["Step: Risk detection", "Outcome: Category risk map"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_STOCK_PROJECT_RISK: {
    id: "WARNING_STOCK_PROJECT_RISK",
    type: "custom",
    data: {
      label: "Projecting Revenue-at-Risk",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Projects revenue exposure from stock imbalance conditions.",
      details: ["Step: Revenue-risk projection", "Outcome: Exposure quantified"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_STOCK_PREPARE_PRIORITIES: {
    id: "WARNING_STOCK_PREPARE_PRIORITIES",
    type: "custom",
    data: {
      label: "Preparing Replenishment Priorities",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Prepares replenishment and transfer priorities by risk and impact.",
      details: ["Step: Priority planning", "Outcome: Transfer/replenishment queue"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_CHECKOUT_ANALYZE_ABANDONMENT: {
    id: "WARNING_CHECKOUT_ANALYZE_ABANDONMENT",
    type: "custom",
    data: {
      label: "Analyzing Checkout Abandonment",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Analyzes checkout drop-off distribution across funnel steps.",
      details: ["Step: Abandonment analysis", "Outcome: Step-level leakage profile"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_CHECKOUT_SEGMENT_DROPOFF: {
    id: "WARNING_CHECKOUT_SEGMENT_DROPOFF",
    type: "custom",
    data: {
      label: "Segmenting Checkout Drop-Off",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Segments checkout drop-off by device and acquisition channel.",
      details: ["Step: Segment analysis", "Outcome: Device/channel variance"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_CHECKOUT_IDENTIFY_FRICTION: {
    id: "WARNING_CHECKOUT_IDENTIFY_FRICTION",
    type: "custom",
    data: {
      label: "Identifying Checkout Friction",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Identifies highest-friction checkout interactions to fix first.",
      details: ["Step: Friction identification", "Outcome: Top friction points"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_CHECKOUT_PREPARE_PLAN: {
    id: "WARNING_CHECKOUT_PREPARE_PLAN",
    type: "custom",
    data: {
      label: "Preparing Checkout Remediation Plan",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Prepares remediation actions to reduce checkout friction quickly.",
      details: ["Step: Remediation planning", "Outcome: Prioritized fix plan"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_CONVERSION_LOAD_MODEL: {
    id: "WARNING_CONVERSION_LOAD_MODEL",
    type: "custom",
    data: {
      label: "Loading Conversion Opportunity Model",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Loads conversion opportunity model for quick-win optimization.",
      details: ["Step: Model load", "Outcome: Opportunity scoring enabled"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_CONVERSION_SCORE_WINS: {
    id: "WARNING_CONVERSION_SCORE_WINS",
    type: "custom",
    data: {
      label: "Scoring Quick Conversion Wins",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Scores interventions by effort, impact, and execution speed.",
      details: ["Step: Opportunity scoring", "Outcome: High-leverage quick wins"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_CONVERSION_RANK_ACTIONS: {
    id: "WARNING_CONVERSION_RANK_ACTIONS",
    type: "custom",
    data: {
      label: "Ranking Conversion Actions",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Ranks conversion actions for immediate rollout impact.",
      details: ["Step: Action ranking", "Outcome: Immediate rollout order"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_CONVERSION_PREPARE_QUEUE: {
    id: "WARNING_CONVERSION_PREPARE_QUEUE",
    type: "custom",
    data: {
      label: "Preparing Conversion Optimization Queue",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Builds a rapid optimization queue for conversion recovery.",
      details: ["Step: Queue preparation", "Outcome: Ready-to-execute actions"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_SCENARIO_RUN_MODEL: {
    id: "WARNING_SCENARIO_RUN_MODEL",
    type: "custom",
    data: {
      label: "Running Conversion Scenario Model",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Runs a conversion uplift scenario model for checkout improvements.",
      details: ["Step: Scenario simulation", "Outcome: Conversion uplift projection"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_SCENARIO_PROJECT_REVENUE: {
    id: "WARNING_SCENARIO_PROJECT_REVENUE",
    type: "custom",
    data: {
      label: "Projecting Revenue Impact",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Projects revenue impact from checkout conversion improvements.",
      details: ["Step: Revenue projection", "Outcome: Business impact estimate"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_SCENARIO_EVALUATE_RISK: {
    id: "WARNING_SCENARIO_EVALUATE_RISK",
    type: "custom",
    data: {
      label: "Evaluating Rollout Risk",
      color: DAG_NODE_COLOR_BY_TASK.ANALYSIS,
      description: "Evaluates rollout risk thresholds and operational controls.",
      details: ["Step: Risk evaluation", "Outcome: Rollout guardrails validated"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  WARNING_SCENARIO_PREPARE_PLAN: {
    id: "WARNING_SCENARIO_PREPARE_PLAN",
    type: "custom",
    data: {
      label: "Preparing Conversion Scenario Plan",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Prepares scenario execution plan with staged rollout guidance.",
      details: ["Step: Scenario planning", "Outcome: Execution-ready scenario plan"],
      metrics: { Priority: "high" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  // Node for generating follow-ups
  GENERATE_FOLLOW_UPS: {
    id: "GENERATE_FOLLOW_UPS",
    type: "custom",
    data: {
      label: "Generating Follow-Ups",
      color: DAG_NODE_COLOR_BY_TASK.RECOMMENDATION,
      description: "Generates follow-up questions and actions based on scenario outcome.",
      details: ["Step: Generate follow-ups", "Action: Suggest next steps", "Outcome: User receives actionable suggestions"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  // Snapshot Nodes
  SNAPSHOT_DASHBOARD: {
    id: "SNAPSHOT_DASHBOARD",
    type: "custom",
    data: {
      label: "Dashboard Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Displays the current dashboard state for scenario analysis.",
      details: ["Snapshot: Dashboard", "Content: Current metrics and KPIs"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_REPORTS: {
    id: "SNAPSHOT_REPORTS",
    type: "custom",
    data: {
      label: "Reports Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Shows the latest reports relevant to the scenario.",
      details: ["Snapshot: Reports", "Content: Performance and spend reports"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_MMM: {
    id: "SNAPSHOT_MMM",
    type: "custom",
    data: {
      label: "MMM Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Displays the Marketing Mix Model analysis for the scenario.",
      details: ["Snapshot: MMM", "Content: Channel allocation and impact"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_CAMPAIGNS: {
    id: "SNAPSHOT_CAMPAIGNS",
    type: "custom",
    data: {
      label: "Campaigns Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Shows the current campaign status and changes for the scenario.",
      details: ["Snapshot: Campaigns", "Content: Active and updated campaigns"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_AUDIENCES: {
    id: "SNAPSHOT_AUDIENCES",
    type: "custom",
    data: {
      label: "Audiences Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Displays audience segments and targeting for the scenario.",
      details: ["Snapshot: Audiences", "Content: Segments and targeting"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_CUSTOMERS: {
    id: "SNAPSHOT_CUSTOMERS",
    type: "custom",
    data: {
      label: "Customers Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Shows customer insights and segmentation for the scenario.",
      details: ["Snapshot: Customers", "Content: Customer profiles and insights"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_ANALYTICS: {
    id: "SNAPSHOT_ANALYTICS",
    type: "custom",
    data: {
      label: "Analytics Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Displays analytics and performance trends for the scenario.",
      details: ["Snapshot: Analytics", "Content: Trends and anomalies"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_CURRENT_STATE: {
    id: "SNAPSHOT_CURRENT_STATE",
    type: "custom",
    data: {
      label: "Current State Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Shows the current business state for scenario analysis.",
      details: ["Snapshot: Current State", "Content: Business metrics and status"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_SCENARIO_PROFIT: {
    id: "SNAPSHOT_SCENARIO_PROFIT",
    type: "custom",
    data: {
      label: "Scenario Profit Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Shows the profit scenario projection and impact.",
      details: ["Snapshot: Scenario Profit", "Content: Profit projections"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_SCENARIO_ACQUISITION: {
    id: "SNAPSHOT_SCENARIO_ACQUISITION",
    type: "custom",
    data: {
      label: "Scenario Acquisition Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Shows the acquisition scenario projection and impact.",
      details: ["Snapshot: Scenario Acquisition", "Content: Acquisition projections"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_SCENARIO_RETENTION: {
    id: "SNAPSHOT_SCENARIO_RETENTION",
    type: "custom",
    data: {
      label: "Scenario Retention Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Shows the retention scenario projection and impact.",
      details: ["Snapshot: Scenario Retention", "Content: Retention projections"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  SNAPSHOT_NBA_EXECUTION: {
    id: "SNAPSHOT_NBA_EXECUTION",
    type: "custom",
    data: {
      label: "NBA Execution Snapshot",
      color: DAG_NODE_COLOR_BY_TASK.SNAPSHOT,
      description: "Shows the execution details for Next Best Actions.",
      details: ["Snapshot: NBA Execution", "Content: Action execution details"],
      metrics: { Priority: "medium" },
      processingTime: 1,
      processingState: "idle",
    },
  },
  // ...continue for all other nodes in dag-data.ts
};
