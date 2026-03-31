import type { Node, Edge } from "reactflow";

export type NBAContext = "waste" | "stockout" | "promo" | "planning" | "general";

const categories = {
  reasoning: "domainWorkflow",
  signal: "dataRetrieval",
  action: "workflowControl",
  prompt: "workflow",
} as const;

const legacyColors = {
  reasoning: "#334155",
  signal: "#6366f1",
  action: "#059669",
  prompt: "#1e40af",
};

function pos(x: number, y: number) {
  return { x, y };
}

interface DAGTemplate {
  nodes: Node[];
  edges: Edge[];
}

const wasteTemplate: DAGTemplate = {
  nodes: [
    { id: "w1", type: "custom", position: pos(0, 0), data: { label: "Analyze Waste Data", category: categories.reasoning, color: legacyColors.reasoning, description: "Pull SKU-store-day spoilage from POS and inventory systems", processingTime: 2, details: ["Source: POS + Inventory", "Scope: Dairy, Bakery, Produce"] } },
    { id: "w2", type: "custom", position: pos(350, 0), data: { label: "Identify Patterns", category: categories.reasoning, color: legacyColors.reasoning, description: "Detect recurring over-order patterns by day-of-week and category", processingTime: 2, details: ["Method: Time-series decomposition", "Window: 8 weeks"] } },
    { id: "w3", type: "custom", position: pos(700, 0), data: { label: "Weather Signal Check", category: categories.signal, color: legacyColors.signal, description: "Integrate 7-day weather forecast to adjust demand uplift", processingTime: 1.5, details: ["API: Weather service", "Signal: Heatwave >30°C"] } },
    { id: "w4", type: "custom", position: pos(1050, 0), data: { label: "Generate Adjustments", category: categories.reasoning, color: legacyColors.reasoning, description: "Calculate optimal forecast adjustments per category", processingTime: 2, details: ["Model: Gradient-boosted ensemble", "Confidence: 92%"] } },
    { id: "w5", type: "custom", position: pos(1400, -100), data: { label: "Adjust Dairy Forecast +15%", category: categories.action, color: legacyColors.action, description: "Increase dairy forecast to account for heatwave demand", processingTime: 1, metrics: { Impact: "-40% waste risk", Confidence: "92%" } } },
    { id: "w6", type: "custom", position: pos(1400, 100), data: { label: "Reduce Bakery Orders -20%", category: categories.action, color: legacyColors.action, description: "Cut mid-week bakery replenishment to match structural trough", processingTime: 1, metrics: { Impact: "-22% waste", Confidence: "88%" } } },
  ],
  edges: [
    { id: "we1", source: "w1", target: "w2", type: "default" },
    { id: "we2", source: "w2", target: "w3", type: "default" },
    { id: "we3", source: "w3", target: "w4", type: "default" },
    { id: "we4", source: "w4", target: "w5", type: "default" },
    { id: "we5", source: "w4", target: "w6", type: "default" },
  ],
};

const stockoutTemplate: DAGTemplate = {
  nodes: [
    { id: "s1", type: "custom", position: pos(0, 0), data: { label: "Analyze Fill Rates", category: categories.reasoning, color: legacyColors.reasoning, description: "Assess current fill rates across regions and categories", processingTime: 2, details: ["Source: DC + Store inventory", "Baseline: 91% avg"] } },
    { id: "s2", type: "custom", position: pos(350, 0), data: { label: "Demand Sensing", category: categories.signal, color: legacyColors.signal, description: "Integrate real-time signals: weather, events, promo calendar", processingTime: 2, details: ["Signals: Weather, Events, Promos", "Horizon: 7 days"] } },
    { id: "s3", type: "custom", position: pos(700, 0), data: { label: "Safety Stock Optimization", category: categories.reasoning, color: legacyColors.reasoning, description: "Recalculate safety stock levels using probabilistic demand model", processingTime: 2, details: ["Method: Service-level optimization", "Target: 97.5% fill rate"] } },
    { id: "s4", type: "custom", position: pos(1050, -100), data: { label: "Pre-Position Inventory", category: categories.action, color: legacyColors.action, description: "Move stock to high-risk stores before demand spike", processingTime: 1, metrics: { Impact: "+$180K revenue", Confidence: "95%" } } },
    { id: "s5", type: "custom", position: pos(1050, 100), data: { label: "Adjust Forecast +15%", category: categories.action, color: legacyColors.action, description: "Uplift dairy forecast to prevent weather-driven stock-outs", processingTime: 1, metrics: { Impact: "97.5% fill rate", Confidence: "92%" } } },
  ],
  edges: [
    { id: "se1", source: "s1", target: "s2", type: "default" },
    { id: "se2", source: "s2", target: "s3", type: "default" },
    { id: "se3", source: "s3", target: "s4", type: "default" },
    { id: "se4", source: "s3", target: "s5", type: "default" },
  ],
};

const promoTemplate: DAGTemplate = {
  nodes: [
    { id: "p1", type: "custom", position: pos(0, 0), data: { label: "Analyze Promo History", category: categories.reasoning, color: legacyColors.reasoning, description: "Review historical promotional lifts and accuracy vs forecast", processingTime: 2, details: ["Scope: Last 12 promos", "Source: POS + Promo calendar"] } },
    { id: "p2", type: "custom", position: pos(350, 0), data: { label: "Model Demand Lift", category: categories.reasoning, color: legacyColors.reasoning, description: "Predict demand multiplier for upcoming BOGO and discount promos", processingTime: 2, details: ["Method: Bayesian lift model", "Predicted lift: 2.1x"] } },
    { id: "p3", type: "custom", position: pos(700, 0), data: { label: "Inventory Planning", category: categories.reasoning, color: legacyColors.reasoning, description: "Calculate required stock levels to capture full promo revenue", processingTime: 2, details: ["Gap: Current 1.3x vs needed 2.1x", "Lead time: 3 days"] } },
    { id: "p4", type: "custom", position: pos(1050, -100), data: { label: "Pre-Position Promo Stock", category: categories.action, color: legacyColors.action, description: "Ship additional promo inventory to stores by Friday", processingTime: 1, metrics: { Impact: "+$180K revenue", Confidence: "95%" } } },
    { id: "p5", type: "custom", position: pos(1050, 100), data: { label: "Optimize Allocation", category: categories.action, color: legacyColors.action, description: "Right-size store-level allocation based on local demand patterns", processingTime: 1, metrics: { Impact: "+18% promo ROI", Confidence: "90%" } } },
  ],
  edges: [
    { id: "pe1", source: "p1", target: "p2", type: "default" },
    { id: "pe2", source: "p2", target: "p3", type: "default" },
    { id: "pe3", source: "p3", target: "p4", type: "default" },
    { id: "pe4", source: "p3", target: "p5", type: "default" },
  ],
};

const planningTemplate: DAGTemplate = {
  nodes: [
    { id: "pl1", type: "custom", position: pos(0, 0), data: { label: "Collect POS Data", category: categories.reasoning, color: legacyColors.reasoning, description: "Aggregate latest point-of-sale data across all stores", processingTime: 2, details: ["Source: POS feeds", "Frequency: Daily refresh"] } },
    { id: "pl2", type: "custom", position: pos(350, 0), data: { label: "Retrain Models", category: categories.reasoning, color: legacyColors.reasoning, description: "Update demand forecasting models with latest actuals", processingTime: 3, details: ["Method: Incremental retraining", "Models: 3 ensemble"] } },
    { id: "pl3", type: "custom", position: pos(700, 0), data: { label: "Validate Accuracy", category: categories.reasoning, color: legacyColors.reasoning, description: "Compare model predictions against holdout data", processingTime: 2, details: ["Metric: WMAPE", "Current: 76% accuracy"] } },
    { id: "pl4", type: "custom", position: pos(1050, -100), data: { label: "Adjust Forecast", category: categories.action, color: legacyColors.action, description: "Apply validated model outputs to update forecasts", processingTime: 1, metrics: { Impact: "+5pp accuracy", Confidence: "92%" } } },
    { id: "pl5", type: "custom", position: pos(1050, 100), data: { label: "Configure Alerts", category: categories.action, color: legacyColors.action, description: "Set up demand sensing alerts for anomaly detection", processingTime: 1, metrics: { Impact: "+3pp accuracy", Confidence: "85%" } } },
  ],
  edges: [
    { id: "ple1", source: "pl1", target: "pl2", type: "default" },
    { id: "ple2", source: "pl2", target: "pl3", type: "default" },
    { id: "ple3", source: "pl3", target: "pl4", type: "default" },
    { id: "ple4", source: "pl3", target: "pl5", type: "default" },
  ],
};

const templates: Record<NBAContext, DAGTemplate> = {
  waste: wasteTemplate,
  stockout: stockoutTemplate,
  promo: promoTemplate,
  planning: planningTemplate,
  general: wasteTemplate, // default to waste for general context
};

export function getActionDAGTemplate(context: NBAContext): DAGTemplate {
  return templates[context] ?? templates.general;
}

/**
 * Create a new DAG lane from a chat flow's agent steps + optional NBA actions.
 * Each lane is offset horizontally so multiple flows appear side by side.
 */
export function buildFlowDAGNodes(
  flowIndex: number,
  agentSteps: string[],
  userPrompt: string,
  showNBACards?: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const xOffset = flowIndex * 450;
  const prefix = `flow${flowIndex}`;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Prompt node
  const promptId = `${prefix}-prompt`;
  nodes.push({
    id: promptId,
    type: "custom",
    position: pos(xOffset, 0),
    data: {
      label: userPrompt.length > 40 ? userPrompt.slice(0, 37) + "..." : userPrompt,
      category: categories.prompt,
      color: legacyColors.prompt,
      description: userPrompt,
      processingTime: 0.5,
    },
  });

  // Agent step nodes
  let prevId = promptId;
  agentSteps.forEach((step, i) => {
    const nodeId = `${prefix}-step${i}`;
    nodes.push({
      id: nodeId,
      type: "custom",
      position: pos(xOffset, (i + 1) * 200),
      data: {
        label: step,
        category: categories.reasoning,
        color: legacyColors.reasoning,
        description: `Agent reasoning step: ${step}`,
        processingTime: 1.5,
      },
    });
    edges.push({ id: `${prefix}-e${i}`, source: prevId, target: nodeId, type: "default" });
    prevId = nodeId;
  });

  // If NBA cards are shown, add action terminal nodes
  if (showNBACards) {
    const actionId = `${prefix}-action`;
    nodes.push({
      id: actionId,
      type: "custom",
      position: pos(xOffset, (agentSteps.length + 1) * 200),
      data: {
        label: "Execute Recommendations",
        category: categories.action,
        color: legacyColors.action,
        description: "Agent-recommended business actions ready for approval",
        processingTime: 1,
      },
    });
    edges.push({ id: `${prefix}-eAction`, source: prevId, target: actionId, type: "default" });
  }

  return { nodes, edges };
}
