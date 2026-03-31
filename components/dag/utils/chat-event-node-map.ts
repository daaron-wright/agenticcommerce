// Maps agent step strings and chat events to node-library node IDs
// Extend as needed for new steps/events
import { getFlowStepNodeId } from "./node-library";

export const CHAT_EVENT_TO_NODE_ID: Record<string, string> = {
  // Agent steps
  "Validating budget headroom and constraints": "AGENT_STEP_VALIDATING_BUDGET",
  "Submitting +30% budget increase to Google Ads": "AGENT_STEP_SUBMIT_BUDGET_INCREASE",
  "Configuring performance monitoring rules": "AGENT_STEP_CONFIGURE_MONITORING",
  "Activating anomaly detection agent": "AGENT_STEP_ACTIVATE_ANOMALY_AGENT",
  // Warning-driven return and conversion journeys
  "Collecting category-level return signals": "WARNING_RETURN_COLLECT_SIGNALS",
  "Attributing return causes by SKU and reason code": "WARNING_RETURN_ATTRIBUTION",
  "Scoring categories by return impact": "WARNING_RETURN_SCORE_IMPACT",
  "Preparing category return mitigation plan": "WARNING_RETURN_PREPARE_PLAN",
  "Loading return-pressure recommendation model": "WARNING_RETURN_LOAD_MODEL",
  "Ranking return-reduction actions by projected impact": "WARNING_RETURN_RANK_ACTIONS",
  "Generating prioritized return action queue": "WARNING_RETURN_GENERATE_QUEUE",
  "Preparing execution guardrails for return controls": "WARNING_RETURN_GUARDRAILS",
  "Collecting demand velocity and stock coverage data": "WARNING_STOCK_COLLECT_COVERAGE",
  "Detecting stockout and overstock risk by category": "WARNING_STOCK_DETECT_RISK",
  "Projecting revenue-at-risk from stock imbalance": "WARNING_STOCK_PROJECT_RISK",
  "Preparing replenishment and transfer priorities": "WARNING_STOCK_PREPARE_PRIORITIES",
  "Analyzing checkout funnel abandonment by step": "WARNING_CHECKOUT_ANALYZE_ABANDONMENT",
  "Segmenting drop-off by device and channel": "WARNING_CHECKOUT_SEGMENT_DROPOFF",
  "Identifying highest-friction checkout interactions": "WARNING_CHECKOUT_IDENTIFY_FRICTION",
  "Preparing checkout friction remediation plan": "WARNING_CHECKOUT_PREPARE_PLAN",
  "Loading conversion uplift opportunity model": "WARNING_CONVERSION_LOAD_MODEL",
  "Scoring quick-win interventions by effort and impact": "WARNING_CONVERSION_SCORE_WINS",
  "Ranking conversion actions for immediate rollout": "WARNING_CONVERSION_RANK_ACTIONS",
  "Preparing rapid conversion optimization queue": "WARNING_CONVERSION_PREPARE_QUEUE",
  "Running conversion uplift scenario model": "WARNING_SCENARIO_RUN_MODEL",
  "Projecting revenue impact from checkout improvements": "WARNING_SCENARIO_PROJECT_REVENUE",
  "Evaluating rollout risk and control thresholds": "WARNING_SCENARIO_EVALUATE_RISK",
  "Preparing conversion scenario execution plan": "WARNING_SCENARIO_PREPARE_PLAN",
  // Follow-ups
  "Generating follow-ups": "GENERATE_FOLLOW_UPS",
  // Snapshots
  "dashboard": "SNAPSHOT_DASHBOARD",
  "reports": "SNAPSHOT_REPORTS",
  "mmm": "SNAPSHOT_MMM",
  "campaigns": "SNAPSHOT_CAMPAIGNS",
  "audiences": "SNAPSHOT_AUDIENCES",
  "customers": "SNAPSHOT_CUSTOMERS",
  "analytics": "SNAPSHOT_ANALYTICS",
  "current-state": "SNAPSHOT_CURRENT_STATE",
  "scenario-profit": "SNAPSHOT_SCENARIO_PROFIT",
  "scenario-acquisition": "SNAPSHOT_SCENARIO_ACQUISITION",
  "scenario-retention": "SNAPSHOT_SCENARIO_RETENTION",
  "nba-execution": "SNAPSHOT_NBA_EXECUTION",
  // Extend for other events as needed
};

export function getNodeIdForChatEvent(event: string): string | undefined {
  const normalizedEvent = event.startsWith("PENDING_APPROVAL_FLOW|")
    ? event.split("|").slice(2).join("|")
    : event;

  if (normalizedEvent.startsWith("REVIEW_REQUESTED:")) return "REVIEW_REQUESTED";
  if (normalizedEvent.startsWith("REVIEW_EXAMINING:")) return "REVIEW_EXAMINING";
  if (normalizedEvent.startsWith("REVIEW_APPROVED:")) return "REVIEW_APPROVED";
  if (normalizedEvent.startsWith("REVIEW_REJECTED:")) return "REVIEW_REJECTED";
  if (normalizedEvent.startsWith("REVIEW_EXECUTING:")) return "REVIEW_EXECUTING";
  if (normalizedEvent.startsWith("EXECUTION_STARTED:")) return "REVIEW_EXECUTING";
  if (normalizedEvent.startsWith("EXECUTION_COMPLETED:")) return "SNAPSHOT_NBA_EXECUTION";

  const mappedNodeId = CHAT_EVENT_TO_NODE_ID[normalizedEvent];
  if (mappedNodeId) return mappedNodeId;

  if (!normalizedEvent.trim()) return undefined;
  return getFlowStepNodeId(normalizedEvent);
}
