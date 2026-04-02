export type SnapshotType =
  | "dashboard"
  | "reports"
  | "mmm"
  | "campaigns"
  | "audiences"
  | "customers"
  | "analytics"
  | "current-state"
  | "scenario-waste-reduction"
  | "scenario-stockout-prevention"
  | "scenario-promotion-planning"
  | "nba-execution";

export type ScenarioId = "waste-reduction" | "stockout-prevention" | "promotion-planning";

export type NBAActionId = "adjust-forecast-dairy" | "reduce-bakery-order" | "trigger-promo-restock";

export interface NBAAction {
  id: NBAActionId;
  title: string;
  segment: string;
  action: string;
  expectedLift: string;
  confidence: number;
  agentReason: string;
}

export interface ExplainabilityMeta {
  title: string;
  reasoning: { factor: string; weight: number; insight: string }[];
  confidence: number;
  model: string;
}

export interface ChatFlow {
  triggers: string[];
  agentSteps: string[];
  response: string;
  snapshots: SnapshotType[];
  followUps: string[];
  /** If set, the response includes scenario selection buttons */
  offerScenarios?: boolean;
  /** If set, show NBA action cards after the response. "all" shows all, or a ScenarioId to show scenario-specific ones. */
  showNBACards?: "all" | ScenarioId;
  /** Explainability metadata for the agent reasoning panel */
  explainability?: ExplainabilityMeta;
}

export const SCENARIO_META: Record<
  ScenarioId,
  { label: string; description: string; risk: string; outcome: string; budget: string }
> = {
  "waste-reduction": {
    label: "Cold-Chain Protection",
    description: "Verify cold-chain integrity for frozen and chilled goods across storm-impacted DCs and in-transit shipments.",
    risk: "Medium",
    outcome: "-60% Spoilage",
    budget: "No Change",
  },
  "stockout-prevention": {
    label: "Emergency Stockout Prevention",
    description: "Approve emergency reorders for storm-critical SKUs before the pre-storm delivery window closes.",
    risk: "High",
    outcome: "Protect $820K",
    budget: "+Emergency Budget",
  },
  "promotion-planning": {
    label: "Storm Recovery Planning",
    description: "Pre-position recovery inventory and adjust demand forecasts for post-lockdown store reopening.",
    risk: "Medium",
    outcome: "+$340K Recovery",
    budget: "+12% Inventory",
  },
};

// ── Welcome prompt cards (icon-based, scenario-focused) ─────────────────────

export interface SuggestedPromptCard {
  icon: string; // lucide icon name key
  label: string;
  boldWords?: string[]; // words to bold in the label
  prompt: string; // the actual text sent to the chat
}

export const WELCOME_PROMPT_CARDS: SuggestedPromptCard[] = [
  {
    icon: "TrendingUp",
    label: "What is the storm impact on my supply chain?",
    boldWords: ["storm impact", "supply chain"],
    prompt: "What is the storm impact on my supply chain?",
  },
  {
    icon: "CloudSun",
    label: "Which SKUs are at critical stockout risk from the blizzard?",
    boldWords: ["critical stockout", "blizzard"],
    prompt: "Which SKUs are at critical stockout risk from the blizzard?",
  },
  {
    icon: "Zap",
    label: "Show me the emergency reorder plan status.",
    boldWords: ["emergency reorder"],
    prompt: "Show me the emergency reorder plan status",
  },
  {
    icon: "BarChart3",
    label: "What is the cold-chain status across our DCs?",
    boldWords: ["cold-chain", "DCs"],
    prompt: "What is the cold-chain status across our DCs?",
  },
  {
    icon: "AiRecommend",
    label: "How should we plan for post-storm recovery?",
    boldWords: ["post-storm", "recovery"],
    prompt: "How should we plan for post-storm recovery?",
  },
  {
    icon: "Workflow",
    label: "Which delivery routes are blocked by road closures?",
    boldWords: ["delivery routes", "road closures"],
    prompt: "Which delivery routes are blocked by road closures?",
  },
];

export const WELCOME_HEADING = "Storm Response — What do you need?";

// ── Next Best Actions ───────────────────────────────────────────────────────

export const ALL_NBA_ACTIONS: NBAAction[] = [
  {
    id: "adjust-forecast-dairy",
    title: "Emergency Reorder — Storm-Critical SKUs",
    segment: "Water, Batteries, First Aid, Ready Meals, Pet Food",
    action: "Approve emergency reorder for 6 storm-critical SKUs at Northeast DC",
    expectedLift: "Protects $820K revenue",
    confidence: 94,
    agentReason: "Severe blizzard with 72-hour lockdown driving panic buying. 47 SKUs below minimum cover. Demand surge 200-320% above baseline. Pre-storm delivery window closes at 2:00 PM today.",
  },
  {
    id: "reduce-bakery-order",
    title: "Approve Cold-Chain Transport",
    segment: "Chilled Ready Meals, Frozen Desserts",
    action: "Approve sub-4°C conditional transport for frozen and chilled goods to Northeast DC",
    expectedLift: "-60% spoilage risk",
    confidence: 91,
    agentReason: "Power outage risk at Northeast DC threatening cold-chain integrity. 3 trucks en route require temperature verification. Generator has 18 hours fuel — resupply dispatched.",
  },
  {
    id: "trigger-promo-restock",
    title: "Activate Emergency Suppliers",
    segment: "Water, Batteries, First Aid, Pet Food",
    action: "Activate 4 backup suppliers for storm-critical categories",
    expectedLift: "-35% stockout risk",
    confidence: 88,
    agentReason: "Primary supply chain disrupted by storm. Backup suppliers have confirmed capacity and can deliver via cleared highway corridors within 24 hours.",
  },
];

export const SCENARIO_NBAS: Record<ScenarioId, NBAActionId[]> = {
  "waste-reduction": ["reduce-bakery-order", "adjust-forecast-dairy"],
  "stockout-prevention": ["adjust-forecast-dairy", "trigger-promo-restock"],
  "promotion-planning": ["trigger-promo-restock", "adjust-forecast-dairy"],
};

export const EXECUTION_FLOWS: Record<NBAActionId, ChatFlow> = {
  "adjust-forecast-dairy": {
    triggers: [],
    agentSteps: [
      "Validating forecast adjustment against supply constraints",
      "Submitting revised dairy forecast to replenishment system",
      "Configuring weather-driven demand monitoring",
      "Activating anomaly detection agent for dairy category",
    ],
    explainability: {
      title: "Dairy Forecast Adjustment Execution",
      reasoning: [
        { factor: "Weather-demand correlation", weight: 35, insight: "34\u00b0C heatwave arriving Thursday. Historical data: +15% dairy demand during heatwaves >30\u00b0C." },
        { factor: "Supply constraint validation", weight: 25, insight: "DC capacity confirmed for +15% uplift. Additional stock arriving Wednesday ahead of heatwave." },
        { factor: "Auto-rollback safeguard", weight: 20, insight: "If demand falls below +8% threshold for 48 hours, forecast automatically reverts to baseline." },
        { factor: "Monitoring activation", weight: 20, insight: "Real-time dairy sales velocity tracking active. Anomaly alerts configured for \u00b110% deviation." },
      ],
      confidence: 92,
      model: "Forecast Execution Engine v1.4",
    },
    response:
      "The dairy forecast adjustment has been **executed successfully**. Here's what was activated:\n\n• **Forecast change**: +15% uplift applied across yoghurt, milk, and ice cream SKUs for 7 days\n• **Replenishment**: Revised orders submitted to DC — additional stock arriving Wednesday\n• **Monitoring rules**: Weather-demand correlation tracking active, auto-adjusts if heatwave intensity changes\n• **Auto-rollback**: If actual demand falls below +8% uplift threshold for 48 hours, forecast reverts automatically\n\nThe agent is now monitoring dairy sales velocity against the revised forecast. I'll alert you if any anomalies are detected.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Show me projected waste impact",
      "Show the full dashboard",
    ],
  },
  "reduce-bakery-order": {
    triggers: [],
    agentSteps: [
      "Validating order reduction against minimum shelf requirements",
      "Adjusting bakery replenishment schedule for Tue/Wed",
      "Updating waste tracking rules",
      "Activating bakery demand monitoring agent",
    ],
    explainability: {
      title: "Bakery Order Reduction Execution",
      reasoning: [
        { factor: "Waste pattern confirmation", weight: 35, insight: "8 consecutive weeks of 18-22% waste on Tue/Wed for artisan bread and pastries. Pattern is structural." },
        { factor: "Shelf requirement validation", weight: 25, insight: "Minimum shelf stock maintained after -20% reduction. No customer availability impact projected." },
        { factor: "Savings projection", weight: 25, insight: "Expected savings: 120-150 units/week in bakery waste, equating to -22% category waste." },
        { factor: "Demand monitoring", weight: 15, insight: "Agent tracking Tue/Wed demand. If demand exceeds forecast by >10%, original levels recommended." },
      ],
      confidence: 88,
      model: "Order Optimization Engine v1.3",
    },
    response:
      "Bakery order reduction has been **executed successfully**. Here's what was activated:\n\n• **Order adjustment**: -20% replenishment for artisan bread and pastries on Tuesday and Wednesday\n• **Waste projection**: Expected to save 120-150 units/week in bakery waste\n• **Monitoring**: Agent tracking actual vs forecast demand to validate mid-week trough pattern\n• **Reactivation trigger**: If Tuesday demand exceeds forecast by >10%, agent will recommend restoring original order levels\n\nThe agent is now monitoring bakery sales patterns to confirm the structural mid-week trough.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Show me bakery waste trends",
      "Show the full dashboard",
    ],
  },
  "trigger-promo-restock": {
    triggers: [],
    agentSteps: [
      "Calculating promotional lift allocation by store cluster",
      "Submitting pre-positioning orders to distribution center",
      "Configuring promotional demand monitoring",
      "Deploying promo execution tracking agent",
    ],
    explainability: {
      title: "Promo Inventory Pre-Positioning Execution",
      reasoning: [
        { factor: "Promotional lift model", weight: 30, insight: "BOGO on strawberries/salad kits projects 2.1x demand lift based on similar promotions." },
        { factor: "Store cluster allocation", weight: 25, insight: "Additional inventory allocated across 42 stores based on historical promotional performance." },
        { factor: "DC fulfillment planning", weight: 25, insight: "Pre-positioning orders submitted. Stock arriving Friday EOD \u2014 ahead of Monday promo launch." },
        { factor: "Revenue capture projection", weight: 20, insight: "+$180K additional promo revenue projected by closing the 1.3x to 2.1x allocation gap." },
      ],
      confidence: 95,
      model: "Promo Execution Engine v1.2",
    },
    response:
      "The promotional pre-positioning has been **executed successfully**. Here's what was activated:\n\n• **Stock allocation**: Additional inventory for strawberries and salad kits allocated across 42 stores\n• **DC orders**: Pre-positioning orders submitted — stock arriving by Friday EOD\n• **Demand lift model**: 2.1x lift projection active, auto-adjusts based on early promo signals\n• **Success metric**: Tracking fill rate and sell-through during Monday-Sunday promo window\n\nThe agent is monitoring DC fulfillment status and will alert if any delivery delays risk promo availability.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Show me the store-level allocation",
      "Show the full dashboard",
    ],
  },
};

export function getNBAsByScenario(scenarioId: ScenarioId): NBAAction[] {
  const ids = SCENARIO_NBAS[scenarioId];
  return ALL_NBA_ACTIONS.filter((a) => ids.includes(a.id));
}

export function getNBAById(id: NBAActionId): NBAAction | undefined {
  return ALL_NBA_ACTIONS.find((a) => a.id === id);
}

// ── Scenario response flows (triggered when user selects a scenario) ────────

export const SCENARIO_FLOWS: Record<ScenarioId, ChatFlow> = {
  "waste-reduction": {
    triggers: [],
    agentSteps: [
      "Running forecast accuracy analysis by category",
      "Computing waste-to-accuracy correlation",
      "Projecting waste reduction over 12 weeks",
      "Generating forecast improvement plan",
    ],
    explainability: {
      title: "Waste Reduction Scenario Modeling",
      reasoning: [
        { factor: "Forecast accuracy improvement path", weight: 35, insight: "ML driver-based models project accuracy from 76% to 92% at SKU-store-day level." },
        { factor: "Waste-accuracy correlation", weight: 30, insight: "Every 1% accuracy gain reduces waste by 1.5%. At 92% accuracy, waste drops from 8.2% to 6.1%." },
        { factor: "Category prioritization", weight: 20, insight: "Dairy and bakery targeted first — they account for 60% of waste with lowest current accuracy." },
        { factor: "12-week projection model", weight: 15, insight: "Gradual improvement curve modeled: 80% accuracy by week 4, 87% by week 8, 92% by week 12." },
      ],
      confidence: 89,
      model: "Scenario Engine v2.0 — Waste",
    },
    response:
      "Here's the projected impact of the **Reduce Perishable Waste** scenario. The model recommends tightening forecasts at the SKU-store-day level using ML driver-based models and forecastability segmentation. This projects a **-25% reduction in waste** with forecast accuracy improving from **76% to 92%** over the next quarter. The chart below shows your current waste trajectory versus the projected outcome with these changes applied.",
    snapshots: ["current-state", "scenario-waste-reduction"],
    followUps: [],
    showNBACards: "waste-reduction" as ScenarioId,
  },
  "stockout-prevention": {
    triggers: [],
    agentSteps: [
      "Running demand sensing accuracy model",
      "Analyzing stock-out patterns by store cluster",
      "Projecting fill rate improvement over 12 weeks",
      "Generating safety stock optimization plan",
    ],
    explainability: {
      title: "Stock-Out Prevention Scenario Modeling",
      reasoning: [
        { factor: "Demand sensing deployment", weight: 30, insight: "Short-horizon sensing with weather and promo signals improves near-term forecast by 18%." },
        { factor: "Fill rate projection", weight: 30, insight: "Fill rate improvement from 91% to 97.5% — recovering $420K in annual lost sales." },
        { factor: "Safety stock optimization", weight: 25, insight: "+8% safety stock investment for weather-sensitive and promo-driven items only." },
        { factor: "Store cluster targeting", weight: 15, insight: "23% of stores with chronic stock-outs targeted for priority demand sensing rollout." },
      ],
      confidence: 87,
      model: "Scenario Engine v2.0 — Service Level",
    },
    response:
      "Here's the projected impact of the **Prevent Stock-Outs** scenario. The model recommends deploying short-horizon demand sensing with weather and promotional signals, plus optimizing safety stock levels by forecastability tier. This projects a fill rate improvement from **91% to 97.5%** with an estimated **$420K in recovered lost sales**. The chart below compares your current service level against the projected improvement.",
    snapshots: ["current-state", "scenario-stockout-prevention"],
    followUps: [],
    showNBACards: "stockout-prevention" as ScenarioId,
  },
  "promotion-planning": {
    triggers: [],
    agentSteps: [
      "Running promotional lift model",
      "Analyzing historical promo performance by category",
      "Projecting promotional revenue uplift over 12 weeks",
      "Generating promo inventory pre-positioning plan",
    ],
    explainability: {
      title: "Promotion Planning Scenario Modeling",
      reasoning: [
        { factor: "Promotional lift modeling", weight: 35, insight: "Current forecasts capture only 58% of actual lift. ML-based models project improvement to 85%." },
        { factor: "Revenue uplift projection", weight: 30, insight: "+18% promotional revenue captured through better pre-positioning and lift forecasting." },
        { factor: "Inventory pre-positioning", weight: 20, insight: "+12% inventory investment for promo periods — ROI positive within first promo cycle." },
        { factor: "Historical promo analysis", weight: 15, insight: "BOGO events show 2-3x lift; markdown events 1.5x. Both systematically under-forecasted today." },
      ],
      confidence: 84,
      model: "Scenario Engine v2.0 — Promo",
    },
    response:
      "Here's the projected impact of the **Optimize Promotion Planning** scenario. The model identifies that current promo forecasts capture only **58% of actual lift**, leading to stock-outs during high-demand promos. With ML-based promotional lift modeling and automated pre-positioning, promo forecast accuracy improves to **85%** and captures an additional **+18% promotional revenue**. The chart below shows your current promo performance versus the projected outcome.",
    snapshots: ["current-state", "scenario-promotion-planning"],
    followUps: [],
    showNBACards: "promotion-planning" as ScenarioId,
  },
};

// ── Standard conversation flows ─────────────────────────────────────────────

export const CHAT_FLOWS: ChatFlow[] = [
  // ── Waste root cause flow ───────────────────────────────────────────────
  {
    triggers: ["waste", "spoilage", "shrink", "expiry", "perishable waste", "why is our perishable"],
    agentSteps: [
      "Scanning waste data across all stores and categories",
      "Identifying where forecasts are driving excess inventory",
      "Pinpointing which products are consistently over-ordered",
      "Calculating how much waste is caused by forecast errors",
    ],
    explainability: {
      title: "Perishable Waste Root Cause Analysis",
      reasoning: [
        { factor: "Forecast accuracy correlation", weight: 35, insight: "68% of waste traces directly to forecast error at SKU-store-day level. Accuracy is 76% vs. 92% target." },
        { factor: "Category concentration", weight: 28, insight: "Dairy (32%) and bakery (28%) account for 60% of total waste due to systematic over-forecasting." },
        { factor: "Missing demand drivers", weight: 22, insight: "Weather, promotions, and day-of-week effects are unmodeled — accounting for ±15-22% demand variance." },
        { factor: "Financial impact assessment", weight: 15, insight: "$2.3M annual spoilage loss identified. Improving accuracy to 92% projects -25% waste reduction." },
      ],
      confidence: 91,
      model: "Waste Attribution Model v2.1",
    },
    response:
      "Here's what's driving your **perishable waste**. This is a **forecasting problem** \u2014 your current models are over-predicting demand on low-traffic days, which leads to excess inventory that expires. \n\nThe analysis shows that **68% of waste** traces directly back to forecast error at the granular SKU-store-day level. Your current state: **forecast accuracy 76%**, **waste rate 8.2%**, **fill rate 91%**.\n\nThe worst categories are **dairy** (32% of total waste) and **bakery** (28%), both showing systematic over-forecasting on low-demand days. The root cause is that current forecasts rely only on historical sales averages and basic seasonality — they don't account for **weather**, **promotions**, **local events**, or **day-of-week demand patterns**.\n\nAt today's accuracy, you're losing approximately **$2.3M annually** in perishable spoilage. Improving forecast accuracy to 92% would cut waste by 25%.",
    snapshots: ["current-state", "dashboard"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Run the forecasting workflow to reduce waste",
      "Model the business impact of fixing this",
      "What would forecast accuracy of 92% save us?",
    ],
  },
  // ── Demand drivers flow ─────────────────────────────────────────────────
  {
    triggers: ["demand driver", "weather", "missing", "drivers", "seasonality", "promotions impact", "what demand drivers", "over-ordering", "don't know why"],
    agentSteps: [
      "Scanning for signals your forecasts are missing",
      "Breaking down what actually drives perishable demand",
      "Ranking which missing signals cause the most error",
      "Identifying quick wins to improve forecast accuracy",
    ],
    explainability: {
      title: "Demand Driver Decomposition",
      reasoning: [
        { factor: "Weather signal analysis", weight: 30, insight: "Temperature and precipitation drive ±15% swings on perishables. Currently unmodeled in forecast." },
        { factor: "Promotional lift detection", weight: 25, insight: "BOGO and markdown events create 1.5-3x demand spikes that current forecasts don't anticipate." },
        { factor: "Day-of-week patterns", weight: 20, insight: "Bakery shows structural mid-week trough of 18-22% vs weekends — confirmed over 8 weeks." },
        { factor: "External signal correlation", weight: 25, insight: "Local events, social media trends, and holidays correlate with +8-12% lifts in affected categories." },
      ],
      confidence: 87,
      model: "Feature Engineering v3.0",
    },
    response:
      "Your current forecasts use only **historical sales** and basic **seasonality** \u2014 which means you're missing the signals that actually drive perishable demand. Without these signals, your forecasts systematically miss demand shifts \u2014 leading to waste when you over-order and stock-outs when you under-order.\n\nThe ML model identifies **5 unmodeled demand drivers** that would significantly improve accuracy:\n\n• **Weather patterns** — temperature and precipitation drive ±15% swings on perishables (e.g., dairy +15% during heatwaves, soup +22% during cold snaps)\n• **Promotional lift** — BOGO and markdown events create 1.5-3x demand spikes that current forecasts don't anticipate\n• **Local events** — festivals, sports events, and school holidays shift demand at the store level\n• **Day-of-week effects** — bakery shows a structural mid-week trough of 18-22% vs weekends\n• **Social media trends** — viral food trends correlate with +8-12% lifts in affected categories within 48 hours\n\nThe **demand driver decomposition** below shows how these signals break down across a typical week.",
    snapshots: ["mmm", "analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Run the forecasting workflow to fix this",
      "Model the business impact of adding these signals",
    ],
  },
  // ── Touchless forecasting flow ──────────────────────────────────────────
  {
    triggers: ["fix", "without adding", "touchless", "automate", "planners", "manual", "how do we fix", "overwhelmed", "every sku"],
    agentSteps: [
      "Classifying which SKUs can be forecasted automatically",
      "Calculating how many items planners can stop reviewing",
      "Identifying which exceptions still need human judgment",
      "Projecting how much planner time this frees up",
    ],
    explainability: {
      title: "Touchless Forecasting Assessment",
      reasoning: [
        { factor: "Forecastability segmentation", weight: 35, insight: "62% of SKUs are high-forecastability (stable demand) — suitable for fully autonomous ML forecasting." },
        { factor: "Touchless coverage analysis", weight: 30, insight: "85% of SKU-store intersections can be handled without planner intervention at 95%+ accuracy." },
        { factor: "Exception reduction model", weight: 20, insight: "Planners shift from reviewing thousands of items to ~150 weekly exceptions that need human judgment." },
        { factor: "Productivity projection", weight: 15, insight: "Driver-based models for medium-forecastability items reduce planner review time by 70%." },
      ],
      confidence: 89,
      model: "Forecastability Segmentation v1.8",
    },
    response:
      "Instead of adding headcount, the AI handles **85% of forecasts autonomously** — your planners only review the exceptions that need human judgment. This is called **touchless forecasting**.\n\nHere's how **forecastability segmentation** works for your perishable portfolio:\n\n• **High-forecastability (62%)** — Stable-demand items like milk, eggs, staple produce. The AI agent handles these autonomously with 95%+ accuracy. Zero planner touch needed.\n• **Medium-forecastability (28%)** — Items driven by weather, promotions, or seasonality (seasonal fruit, BBQ items, holiday baking). Driver-based models capture these, with planner review only on outliers.\n• **Low-forecastability (10%)** — New products, trend-driven items, and local specialties. These need planner judgment, but the AI pre-populates initial forecasts and flags exceptions.\n\nThe result: your planners shift from reviewing thousands of line items to focusing on the **~150 exceptions** that actually need human judgment each week \u2014 freeing up **70% of their time** for higher-value decisions.",
    snapshots: ["audiences", "reports"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Run the forecasting workflow now",
      "Model the business impact of going touchless",
    ],
  },
  // ── Scenario overview flow ──────────────────────────────────────────────
  {
    triggers: [
      "model the impact", "scenario", "scenarios",
      "what can we do", "what should we do", "options",
      "strategies", "strategic", "propose",
      "recommendations", "improve forecast",
      "losing", "spoilage", "save us",
      "business impact",
    ],
    agentSteps: [
      "Assessing your current forecast performance and financial impact",
      "Modeling what improved forecasting would save in waste",
      "Projecting fill rate and revenue recovery opportunities",
      "Preparing scenario options for your review",
    ],
    explainability: {
      title: "Strategic Scenario Modeling",
      reasoning: [
        { factor: "Current state assessment", weight: 30, insight: "Forecast accuracy 76%, waste rate 8.2%, fill rate 91% — $2.3M annual spoilage + $1.1M lost sales." },
        { factor: "Scenario projection engine", weight: 30, insight: "Three scenarios modeled: waste reduction (-25%), stockout prevention (97.5% fill), promo optimization (+18%)." },
        { factor: "ROI comparison model", weight: 25, insight: "Each scenario ranked by net impact, implementation risk, and time-to-value for decision support." },
        { factor: "Constraint validation", weight: 15, insight: "All projections validated against budget caps, supply capacity, and operational feasibility." },
      ],
      confidence: 85,
      model: "Scenario Planning Engine v2.0",
    },
    response:
      "Here's where your demand planning stands today. **Forecast accuracy** is at **76%** with a **waste rate of 8.2%** and **fill rate of 91%**. You're currently losing **$2.3M annually** in perishable spoilage while simultaneously missing **$1.1M** in sales from stock-outs.\n\nEach scenario below shows a **different business outcome** you can achieve by improving how your forecasts work. The AI agent has modeled three paths \u2014 select one to see projected impact, recommended actions, and the specific workflow the agent would execute to get there.",
    snapshots: ["current-state"],
    followUps: [],
    offerScenarios: true,
  },
  // ── Agent recommendations trigger (shows NBA cards) ─────────────────────
  {
    triggers: ["agent recommend", "ai agent", "recommending", "what actions", "next best", "another recommended action", "execute another", "agent's recommended"],
    agentSteps: [
      "The AI agent is scanning active demand signals",
      "The AI agent is evaluating pending forecast adjustments",
      "The AI agent is ranking actions by business impact",
      "The AI agent is preparing executable action cards",
    ],
    explainability: {
      title: "Agent Recommendation Ranking",
      reasoning: [
        { factor: "Waste impact scoring", weight: 35, insight: "Actions ranked by projected waste reduction — dairy adjustment has highest impact at -40% waste risk." },
        { factor: "Revenue recovery potential", weight: 30, insight: "Promo pre-positioning action captures +$180K in revenue that would otherwise be lost to stock-outs." },
        { factor: "Confidence calibration", weight: 20, insight: "All recommendations exceed 85% confidence threshold based on backtested model accuracy." },
        { factor: "Execution feasibility", weight: 15, insight: "All actions validated against supply constraints, DC capacity, and lead time requirements." },
      ],
      confidence: 90,
      model: "NBA Ranking Engine v1.5",
    },
    response:
      "The AI agent has analyzed your current demand signals and identified **3 actions it can execute right now** to reduce waste and recover revenue. Each action is ranked by projected business impact and has been validated against your supply constraints.\n\nYou can **approve and execute any action** directly from the cards below \u2014 the agent will handle the end-to-end execution, from adjusting forecasts to submitting revised orders and activating monitoring.",
    snapshots: [],
    followUps: [],
    showNBACards: "all",
  },
  // ── Forecast accuracy flow ──────────────────────────────────────────────
  {
    triggers: ["forecast accuracy", "accuracy", "how accurate"],
    agentSteps: [
      "Measuring forecast accuracy across every category",
      "Tracking how accuracy has trended over 12 weeks",
      "Identifying which products have the worst forecast errors",
    ],
    explainability: {
      title: "Forecast Accuracy Analysis",
      reasoning: [
        { factor: "Category-level accuracy breakdown", weight: 35, insight: "Dairy 72%, Bakery 68%, Produce 78%, Deli 82%, Prepared Foods 80% — bakery is the weakest." },
        { factor: "Error pattern classification", weight: 30, insight: "Over-forecasting dominates on weekdays; under-forecasting during weather events and promotions." },
        { factor: "Improvement potential", weight: 20, insight: "Driver-based ML forecasting could lift overall accuracy from 76% to 92% within one quarter." },
        { factor: "Trend analysis", weight: 15, insight: "12-week trend shows accuracy stagnating at 76% — manual adjustments are not improving results." },
      ],
      confidence: 93,
      model: "Accuracy Analytics v2.2",
    },
    response:
      "Here's your **forecast accuracy** breakdown. Overall accuracy sits at **76%**, but this varies significantly by category:\n\n• **Dairy**: 72% accuracy — over-forecasting on weekdays, under-forecasting during heatwaves\n• **Bakery**: 68% accuracy — systematic over-forecasting on Tuesday/Wednesday\n• **Produce**: 78% accuracy — missed promotional lifts are the main driver\n• **Deli**: 82% accuracy — relatively stable demand patterns\n• **Prepared Foods**: 80% accuracy — event-driven volatility not captured\n\nEvery **1% improvement in accuracy** reduces waste by **1.5%** and recovers lost sales \u2014 so closing the gap from 76% to 92% has a direct financial impact. The AI agent can model this for you and recommend specific actions.",
    snapshots: ["dashboard", "reports"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Model the business impact of reaching 92% accuracy",
      "Run the forecasting workflow to improve this",
    ],
  },
  // ── Stock-out flow ──────────────────────────────────────────────────────
  {
    triggers: ["stock-out", "out of stock", "availability", "fill rate", "service level", "can't keep up", "sales targets"],
    agentSteps: [
      "Identifying where and when stock-outs are hitting hardest",
      "Calculating how much revenue you're losing from empty shelves",
      "Finding the forecast gaps that cause stock-outs",
    ],
    explainability: {
      title: "Stock-Out Pattern Analysis",
      reasoning: [
        { factor: "Promotional stock-out correlation", weight: 35, insight: "Fill rate drops to 78% during BOGO events — forecast doesn't capture 2-3x demand lift." },
        { factor: "Weather-driven demand gaps", weight: 25, insight: "Heatwaves cause dairy/beverage stock-outs at 23% of stores due to unmodeled temperature signal." },
        { factor: "Weekend peak analysis", weight: 25, insight: "Saturday/Sunday stock-outs 40% higher than weekday averages — safety stock miscalibrated." },
        { factor: "Lost revenue quantification", weight: 15, insight: "$1.1M in annual lost sales from stock-outs. Demand sensing would improve fill rate to 97.5%." },
      ],
      confidence: 88,
      model: "Service Level Analytics v1.9",
    },
    response:
      "Your current **fill rate** is **91%**, meaning roughly 1 in 11 perishable items is unavailable when customers want them. This is a **forecasting problem** \u2014 your models aren't anticipating demand spikes, so inventory runs out during the moments that matter most.\n\nHere's where stock-outs are concentrated:\n\n• **Promotional periods**: Fill rate drops to **78%** during BOGO events — the forecast doesn't anticipate the 2-3x demand lift\n• **Weather-driven spikes**: Summer heatwaves cause **dairy and beverage stock-outs** at 23% of stores\n• **Weekend peaks**: Saturday/Sunday stock-outs are **40% higher** than weekday averages\n\nTotal estimated **lost sales from stock-outs**: **$1.1M annually**. The AI agent can deploy **demand sensing** \u2014 short-horizon forecasting with weather and promotional signals \u2014 to improve fill rate to **97.5%** and recover that revenue.",
    snapshots: ["current-state", "analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Run the demand sensing workflow to fix this",
      "Model the business impact of reaching 97.5% fill rate",
    ],
  },
  // ── Workflow flow ───────────────────────────────────────────────────────
  {
    triggers: ["end-to-end", "demand planning workflow", "run workflow", "workflow", "forecasting workflow"],
    agentSteps: [
      "The AI agent is initializing the demand planning pipeline",
      "The AI agent is ingesting weather, promo, and POS signals",
      "The AI agent is running ML forecast models across all SKUs",
      "The AI agent is triaging exceptions and routing approvals",
    ],
    explainability: {
      title: "End-to-End Pipeline Orchestration",
      reasoning: [
        { factor: "Signal ingestion coverage", weight: 25, insight: "Weather, POS, promotional calendars, and social signals ingested — 90%+ coverage across drivers." },
        { factor: "Model ensemble performance", weight: 30, insight: "Hierarchical ensemble forecast across all SKU-store-day intersections with P10/P50/P90 bands." },
        { factor: "Exception triage efficiency", weight: 25, insight: "Auto-triage filters top exceptions by forecast variance — only high-impact items routed to planners." },
        { factor: "Pipeline orchestration", weight: 20, insight: "Full pipeline: signals → forecast → risk → orders → policy → approvals → evidence pack." },
      ],
      confidence: 86,
      model: "Pipeline Orchestrator v3.2",
    },
    response:
      "The AI agent is now **executing the end-to-end demand planning workflow**. You can watch each step progress in real time in the **workflow DAG** on the right panel. Here's what the agent is doing:\n\n• **Signal ingestion** — The agent is pulling in weather forecasts, promotional calendars, POS data, and social signals\n• **Forecast generation** — ML models are running across all SKU-store-day intersections with driver-based features\n• **Exception triage** — The agent is flagging the top exceptions by forecast variance for planner review\n• **Consensus approval** — Revised forecasts are being routed through the approval workflow\n• **Order recommendation** — The agent is generating optimized replenishment orders for the DC\n\nThe DAG visualization shows the agent working through each stage \u2014 green nodes are complete, blue nodes are in progress.",
    snapshots: ["dashboard"],
    followUps: [
      "What actions is the AI agent recommending?",
      "Show me what the agent is monitoring",
      "Model the business impact of this workflow",
    ],
  },
  // ── Monitoring / agent status ───────────────────────────────────────────
  {
    triggers: ["monitoring", "what is the ai monitoring", "agent status", "pipeline status"],
    agentSteps: [
      "The AI agent is checking all active monitoring feeds",
      "The AI agent is reviewing demand planning pipeline status",
      "The AI agent is summarizing current activity and alerts",
    ],
    explainability: {
      title: "Agent Monitoring Status",
      reasoning: [
        { factor: "Forecast performance tracking", weight: 30, insight: "Continuous accuracy monitoring across all perishable categories — flagging >15% variance SKUs." },
        { factor: "Weather signal monitoring", weight: 25, insight: "7-day weather model updates every 6 hours, auto-adjusting forecasts for temperature-sensitive items." },
        { factor: "Promotional demand tracking", weight: 25, insight: "Sell-through rates on active promotions tracked against forecast lift in real time." },
        { factor: "Waste alert system", weight: 20, insight: "Real-time waste tracking by category — alerts triggered when daily waste exceeds 5% threshold." },
      ],
      confidence: 92,
      model: "Monitoring Agent v2.0",
    },
    response:
      "Here's what the AI agent is actively monitoring and acting on right now:\n\n• **Forecast performance** — the agent is tracking accuracy across all perishable categories, and will auto-flag any SKU-store combos with >15% variance\n• **Weather signals** — the agent updates its 7-day weather model every 6 hours and auto-adjusts forecasts for temperature-sensitive items\n• **Promotional demand** — the agent is monitoring sell-through rates on active promotions vs forecast lift, and will alert if inventory is at risk\n• **Waste alerts** — real-time waste tracking by category, with the agent triggering alerts when waste exceeds 5% daily threshold\n• **Replenishment pacing** — the agent is ensuring DC orders align with revised forecasts and store capacity\n\nNo anomalies detected in the last 24 hours. The agent's next forecast model refresh is scheduled in 2 hours.",
    snapshots: ["analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Run the forecasting workflow now",
      "Model the business impact of these improvements",
    ],
  },
  // ── Planning actions ────────────────────────────────────────────────────
  {
    triggers: ["planning action", "planning actions", "order", "adjustment", "restock", "replenish"],
    agentSteps: [
      "The AI agent is reviewing all active planning actions",
      "The AI agent is analyzing pending order adjustments",
      "The AI agent is ranking actions by business impact",
    ],
    explainability: {
      title: "Planning Actions Pipeline",
      reasoning: [
        { factor: "Action prioritization", weight: 35, insight: "4 active planning items ranked by waste reduction potential and revenue impact." },
        { factor: "Dairy heatwave response", weight: 30, insight: "Highest-impact action: +15% dairy forecast uplift projects -40% dairy waste risk." },
        { factor: "Order constraint validation", weight: 20, insight: "All adjustments validated against MOQ, case packs, DC capacity, and lead times." },
        { factor: "Execution readiness", weight: 15, insight: "Actions pre-validated and ready for one-click execution or batch approval." },
      ],
      confidence: 88,
      model: "Action Planner v1.6",
    },
    response:
      "The AI agent has identified **4 active planning actions** across dairy, bakery, and produce categories. The dairy heatwave adjustment is the highest-impact action with a projected **-40% dairy waste risk**. Each action below has been validated by the agent against supply constraints and is ready for execution.",
    snapshots: ["campaigns", "analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Run the forecasting workflow now",
      "Model the business impact of these actions",
    ],
  },
  // ── Demand drivers / MMM ────────────────────────────────────────────────
  {
    triggers: ["demand driver analysis", "driver analysis", "driver decomposition", "demand decomposition"],
    agentSteps: [
      "The AI agent is loading demand driver attribution model",
      "The AI agent is computing driver importance by category",
      "The AI agent is generating decomposition recommendations",
    ],
    explainability: {
      title: "Demand Driver Attribution",
      reasoning: [
        { factor: "Weather signal decomposition", weight: 30, insight: "Temperature contributes ±15% variance on dairy; precipitation affects produce by ±8%." },
        { factor: "Promotional lift attribution", weight: 25, insight: "Promotions create 1.5-3x spikes — current models capture only 58% of actual lift." },
        { factor: "Day-of-week decomposition", weight: 25, insight: "Bakery 12-22% variance by day; produce relatively stable; deli peaks on weekends." },
        { factor: "Baseline trend extraction", weight: 20, insight: "After removing drivers, baseline trend shows 2% organic growth with seasonal patterns." },
      ],
      confidence: 86,
      model: "Driver Attribution v2.4",
    },
    response:
      "Here's your **demand driver analysis**. The ML model decomposes perishable demand into **baseline + drivers**: weather contributes **±15%** variance on temperature-sensitive items, promotions create **1.5-3x spikes**, and day-of-week effects account for **12-22%** variance in bakery. I've included the full driver breakdown and category-level analysis below.",
    snapshots: ["mmm", "reports"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Run the forecasting workflow to fix this",
      "Model the business impact of adding these drivers",
    ],
  },
  // ── Dashboard / overview ────────────────────────────────────────────────
  {
    triggers: ["performance summary", "summary", "overview", "how are we doing", "dashboard", "overall", "status"],
    agentSteps: [
      "Pulling together your key demand planning metrics",
      "Comparing this period's performance to prior periods",
      "Building your executive summary with action items",
    ],
    explainability: {
      title: "Executive Dashboard Summary",
      reasoning: [
        { factor: "KPI aggregation", weight: 30, insight: "Forecast accuracy 76%, waste rate 8.2%, fill rate 91% — all metrics below target thresholds." },
        { factor: "Trend computation", weight: 25, insight: "Accuracy flat over 12 weeks; waste trending up 0.3% month-over-month; fill rate declining." },
        { factor: "Agent activity summary", weight: 25, insight: "4 active planning items, 3 pending recommendations, dairy adjustment highest priority." },
        { factor: "Financial impact rollup", weight: 20, insight: "$2.3M annual waste + $1.1M lost sales identified as addressable through AI-driven forecasting." },
      ],
      confidence: 94,
      model: "Dashboard Analytics v2.0",
    },
    response:
      "Here's your demand planning overview. **Forecast accuracy** is at **76%** with a **waste rate of 8.2%** and **fill rate of 91%**. You have **4 active planning items** with the dairy heatwave adjustment showing the highest projected impact. The AI agent has identified **$2.3M** in annual waste that can be reduced through improved forecasting.",
    snapshots: ["dashboard", "analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Model the business impact of improving forecasts",
      "Run the forecasting workflow now",
    ],
  },
  // ── SKU segments ────────────────────────────────────────────────────────
  {
    triggers: ["segment", "segments", "forecastability", "sku segment", "sku segments", "segmentation"],
    agentSteps: [
      "Classifying your SKU portfolio by forecastability",
      "Analyzing demand patterns to determine automation potential",
      "Mapping which items the AI agent can handle autonomously",
    ],
    explainability: {
      title: "SKU Forecastability Segmentation",
      reasoning: [
        { factor: "Demand pattern classification", weight: 35, insight: "62% high-forecastability (stable), 28% medium (driver-sensitive), 10% low (new/trend items)." },
        { factor: "Touchless coverage mapping", weight: 30, insight: "85% of intersections handled autonomously — remaining 15% routed to planners as exceptions." },
        { factor: "Model assignment logic", weight: 20, insight: "High: ensemble ML; Medium: driver-based with weather/promo; Low: hierarchy shifting + planner input." },
        { factor: "Override dependency analysis", weight: 15, insight: "High-forecastability items: zero overrides needed. Low items: 40% override rate, reducing over time." },
      ],
      confidence: 90,
      model: "Segmentation Engine v1.8",
    },
    response:
      "Here's your **forecastability segmentation** view. Your perishable portfolio breaks into three tiers: **High-forecastability (62%)** covering stable-demand staples, **Medium (28%)** for weather and promo-driven items, and **Low-forecastability (10%)** for new products and trend items. The touchless model handles 85% of intersections automatically.",
    snapshots: ["audiences", "customers"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Model the business impact of going touchless",
      "Run the forecasting workflow now",
    ],
  },
  // ── Reports ─────────────────────────────────────────────────────────────
  {
    triggers: ["report", "reports", "forecast report", "weekly report"],
    agentSteps: [
      "Compiling your forecast performance report",
      "Calculating how forecast errors translate to waste and lost sales",
      "Formatting report with recommended actions",
    ],
    explainability: {
      title: "Forecast Performance Report",
      reasoning: [
        { factor: "Accuracy computation", weight: 30, insight: "Overall 76% accuracy this period. Dairy 72%, Bakery 68% — both below 80% minimum target." },
        { factor: "Waste correlation analysis", weight: 30, insight: "8.2% waste rate = $44K/week spoilage. Direct correlation: every 1% accuracy gain = 1.5% waste reduction." },
        { factor: "Improvement projection", weight: 25, insight: "ML driver-based models project dairy to 92% and bakery to 88% accuracy within one quarter." },
        { factor: "Report formatting", weight: 15, insight: "Before/after comparison formatted with category breakdown, trend charts, and action recommendations." },
      ],
      confidence: 91,
      model: "Report Generator v2.1",
    },
    response:
      "Here's your latest **forecast performance report**. Overall forecast accuracy this period was **76%** with a waste rate of **8.2%** equating to **$44K in weekly spoilage**. Dairy and bakery remain the worst performers at 72% and 68% accuracy respectively. The ML model projects these can be improved to 92% and 88% with driver-based forecasting.",
    snapshots: ["reports"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Model the business impact of improving accuracy",
      "Run the forecasting workflow now",
    ],
  },
  // ── Store insights ──────────────────────────────────────────────────────
  {
    triggers: ["store", "store insight", "store insights", "store level", "store performance"],
    agentSteps: [
      "Analyzing forecast accuracy across all 142 stores",
      "Identifying which stores are driving the most waste",
      "Flagging priority stores for AI-driven demand sensing",
    ],
    explainability: {
      title: "Store-Level Demand Analysis",
      reasoning: [
        { factor: "Store accuracy distribution", weight: 30, insight: "142 stores range from 68-89% accuracy. Urban stores have higher volatility from event-driven demand." },
        { factor: "Waste concentration analysis", weight: 30, insight: "Top 20 stores by waste rate account for 45% of total spoilage — priority targets for improvement." },
        { factor: "Cluster segmentation", weight: 25, insight: "Suburban stores have predictable patterns; urban stores need demand sensing with local signals." },
        { factor: "Pilot recommendation", weight: 15, insight: "Top-20 waste stores recommended as demand sensing pilot — projected -30% waste in 8 weeks." },
      ],
      confidence: 87,
      model: "Store Analytics v1.7",
    },
    response:
      "Here's your **store-level insights**. Across **142 stores**, forecast accuracy ranges from **68% to 89%**. Urban stores show higher volatility due to event-driven demand, while suburban stores have more predictable patterns. The top 20 stores by waste rate account for **45% of total perishable spoilage** — these are prime candidates for demand sensing pilots.",
    snapshots: ["customers"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Run a demand sensing pilot on the top 20 stores",
      "Model the business impact of fixing these stores",
    ],
  },
  // ── Analytics / trends ──────────────────────────────────────────────────
  {
    triggers: ["analytics", "trends", "weekly trends", "demand trends", "demand analytics"],
    agentSteps: [
      "Scanning demand trends across all categories",
      "Identifying patterns the AI agent can act on",
      "Checking for upcoming demand anomalies",
    ],
    explainability: {
      title: "Demand Analytics & Trends",
      reasoning: [
        { factor: "Variance trend analysis", weight: 30, insight: "Weekly demand variance ±12% with accuracy stabilizing at 76% — no improvement from manual adjustments." },
        { factor: "Temperature-demand correlation", weight: 25, insight: "Dairy demand +0.82 correlation with temperature — strongest unmodeled signal identified." },
        { factor: "Pattern confirmation", weight: 25, insight: "Bakery mid-week trough pattern confirmed over 8 consecutive weeks — structural, not seasonal." },
        { factor: "Anomaly detection", weight: 20, insight: "No demand anomalies in current period. Next expected anomaly: heatwave-driven dairy spike Thursday." },
      ],
      confidence: 89,
      model: "Demand Analytics v2.3",
    },
    response:
      "Here are your **demand analytics**. Weekly demand variance is trending at **±12%** with forecast accuracy stabilizing around **76%**. I've detected notable patterns: dairy demand correlates strongly with temperature (+0.82 correlation), and bakery shows a consistent mid-week trough pattern confirmed over 8 consecutive weeks.",
    snapshots: ["analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Model the business impact of capturing these patterns",
      "Run the forecasting workflow now",
    ],
  },
];

export const DEFAULT_FLOW: ChatFlow = {
  triggers: [],
  agentSteps: [
    "Processing your request",
    "Searching demand planning knowledge base",
    "Preparing response",
  ],
  response:
    "I can help you with that! Here's a quick overview of your current demand planning performance. You can ask me about **forecast accuracy**, **perishable waste**, **demand drivers**, or explore a **business scenario** to see how AI-driven forecasting can improve your operations.",
  snapshots: ["dashboard"],
  followUps: [
    "Show me the AI agent's recommended actions",
    "Model the business impact of improving forecasts",
    "Why is our perishable waste so high?",
    "Run the forecasting workflow now",
  ],
};

// ── Scenario-specific artifact mappings ──────────────────────────────────────

import type { ArtifactCategory } from "@/lib/artifact-store";

export interface ScenarioArtifactDef {
  category: ArtifactCategory;
  title: string;
  summary: string;
  metric?: string;
}

export const SCENARIO_ARTIFACTS: Record<ScenarioId, ScenarioArtifactDef[]> = {
  "waste-reduction": [
    { category: "dashboard", title: "Waste reduction scenario modelled", summary: "Projected -25% waste with forecast accuracy improving from 76% to 92%.", metric: "-25% Waste" },
    { category: "mmm", title: "Demand driver analysis updated", summary: "ML model identifies 5 unmodeled demand drivers contributing to 68% of waste.", metric: "+16% Accuracy" },
    { category: "reports", title: "Forecast report generated", summary: "Before/after comparison showing projected waste reduction over 12 weeks." },
    { category: "campaigns", title: "Planning actions recommended", summary: "Dairy forecast adjustment and bakery order reduction recommended by agent." },
    { category: "analytics", title: "Waste trend projections updated", summary: "12-week projection shows waste rate declining from 8.2% to 6.1%." },
  ],
  "stockout-prevention": [
    { category: "dashboard", title: "Stock-out prevention scenario modelled", summary: "Projected fill rate improvement from 91% to 97.5% with demand sensing." },
    { category: "campaigns", title: "Replenishment actions proposed", summary: "Pre-positioning orders for promotional periods and weather-driven demand spikes." },
    { category: "audiences", title: "SKU segments analyzed", summary: "High-forecastability items targeted for touchless forecasting coverage." },
    { category: "customers", title: "Store-level stock-out analysis logged", summary: "Top 20 stores by stock-out frequency identified for demand sensing pilot." },
    { category: "analytics", title: "Fill rate projections updated", summary: "Fill rate projected to improve from 91% to 97.5% over 12 weeks." },
  ],
  "promotion-planning": [
    { category: "dashboard", title: "Promotion planning scenario modelled", summary: "Projected +18% promotional revenue with ML-based lift modeling." },
    { category: "campaigns", title: "Promo inventory actions proposed", summary: "Pre-positioning recommendations for upcoming BOGO and markdown events." },
    { category: "audiences", title: "Promo-sensitive SKUs flagged", summary: "Fresh produce and dairy categories identified as highest promo-lift potential." },
    { category: "customers", title: "Store promo performance analyzed", summary: "Store clusters ranked by promotional demand lift vs forecast accuracy." },
    { category: "analytics", title: "Promo forecast accuracy updated", summary: "Promotional forecast accuracy projected to improve from 58% to 85%." },
  ],
};

export const EXECUTION_ARTIFACTS: Record<NBAActionId, ScenarioArtifactDef[]> = {
  "adjust-forecast-dairy": [
    { category: "campaigns", title: "Dairy forecast adjusted", summary: "+15% uplift applied across yoghurt, milk, and ice cream SKUs for 7 days.", metric: "-40% dairy waste risk" },
    { category: "mmm", title: "Weather-driven adjustment executed", summary: "Heatwave-driven dairy demand uplift now reflected in forecasts — monitoring active." },
  ],
  "reduce-bakery-order": [
    { category: "campaigns", title: "Bakery orders reduced", summary: "-20% replenishment for artisan bread and pastries on Tue/Wed.", metric: "-22% bakery waste" },
    { category: "analytics", title: "Bakery waste tracking active", summary: "Agent monitoring actual vs forecast demand to validate mid-week trough pattern." },
  ],
  "trigger-promo-restock": [
    { category: "campaigns", title: "Promo inventory pre-positioned", summary: "Additional stock for strawberries and salad kits allocated across 42 stores.", metric: "+$180K promo revenue" },
    { category: "audiences", title: "Promo store allocation completed", summary: "Store clusters allocated based on historical promotional lift patterns." },
    { category: "customers", title: "DC fulfillment tracking active", summary: "Pre-positioning orders submitted — stock arriving by Friday EOD." },
  ],
};

// ── Helpers to identify scenario flows ───────────────────────────────────────

/** Returns the ScenarioId if a flow is a scenario flow, or null */
export function getScenarioIdFromFlow(flow: ChatFlow): ScenarioId | null {
  for (const [id, scenarioFlow] of Object.entries(SCENARIO_FLOWS)) {
    if (flow.response === scenarioFlow.response) return id as ScenarioId;
  }
  return null;
}

/** Returns the NBAActionId if a flow is an execution flow, or null */
export function getNBAIdFromFlow(flow: ChatFlow): NBAActionId | null {
  for (const [id, execFlow] of Object.entries(EXECUTION_FLOWS)) {
    if (flow.response === execFlow.response) return id as NBAActionId;
  }
  return null;
}

export function matchFlow(input: string): ChatFlow {
  const lower = input.toLowerCase().trim();
  for (const flow of CHAT_FLOWS) {
    if (flow.triggers.some((t) => lower.includes(t))) {
      return flow;
    }
  }
  return DEFAULT_FLOW;
}
