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
      "Validating emergency reorder against DC capacity and delivery windows",
      "Submitting priority purchase orders for storm-critical SKUs",
      "Routing shipments via cleared highway corridors to Northeast DC",
      "Activating real-time inventory tracking for inbound emergency stock",
    ],
    explainability: {
      title: "Emergency Reorder Execution — Storm-Critical SKUs",
      reasoning: [
        { factor: "Demand surge validation", weight: 35, insight: "Panic buying confirmed: water +320%, batteries +280%, first aid +200% above baseline in last 12 hours." },
        { factor: "DC capacity confirmation", weight: 25, insight: "Northeast DC has receiving capacity for emergency shipment. Dock 7 reserved for priority unload." },
        { factor: "Delivery window constraint", weight: 25, insight: "Pre-storm delivery window closes at 2:00 PM today. Orders routed via I-95 corridor (confirmed clear)." },
        { factor: "Inventory cover projection", weight: 15, insight: "Without reorder, 47 SKUs hit zero stock within 18 hours. Reorder extends cover to 96 hours through lockdown." },
      ],
      confidence: 94,
      model: "Storm Response Engine v2.1",
    },
    response:
      "The emergency reorder has been **executed successfully**. Here's what was activated:\n\n• **Purchase orders**: Priority orders submitted for water, batteries, first aid kits, ready meals, and pet food to Northeast DC\n• **Delivery routing**: Shipments routed via cleared I-95 corridor — ETA 4 hours before storm window closes\n• **Inventory cover**: Extends stock cover from 18 hours to 96 hours through the 72-hour lockdown period\n• **Real-time tracking**: Inbound shipment GPS tracking active — alerts configured for any route delays\n\nThe agent is now monitoring delivery progress and will escalate immediately if any shipment is at risk of missing the pre-storm cutoff.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Show me cold-chain status",
      "Show the full dashboard",
    ],
  },
  "reduce-bakery-order": {
    triggers: [],
    agentSteps: [
      "Verifying cold-chain temperature readings across 3 in-transit trucks",
      "Confirming backup generator status at Northeast DC",
      "Approving conditional sub-4°C transport protocol",
      "Activating continuous temperature monitoring for chilled/frozen goods",
    ],
    explainability: {
      title: "Cold-Chain Transport Approval Execution",
      reasoning: [
        { factor: "Temperature integrity verification", weight: 35, insight: "3 trucks en route carrying $420K frozen/chilled inventory. All currently at 2.1°C — within safe range." },
        { factor: "Generator fuel assessment", weight: 25, insight: "Northeast DC backup generator has 18 hours fuel. Resupply truck dispatched — ETA 6 hours." },
        { factor: "Spoilage risk modeling", weight: 25, insight: "Without cold-chain approval, 60% spoilage risk on $420K chilled inventory if power outage exceeds 4 hours." },
        { factor: "Transport protocol activation", weight: 15, insight: "Sub-4°C conditional transport approved. Continuous monitoring with 15-minute interval alerts active." },
      ],
      confidence: 91,
      model: "Cold-Chain Protection Engine v1.4",
    },
    response:
      "Cold-chain transport approval has been **executed successfully**. Here's what was activated:\n\n• **Temperature verification**: All 3 in-transit trucks confirmed at 2.1°C — within safe sub-4°C range\n• **Conditional transport**: Sub-4°C protocol approved for frozen desserts and chilled ready meals\n• **Generator backup**: Northeast DC generator confirmed operational with 18 hours fuel — resupply dispatched\n• **Continuous monitoring**: Temperature alerts active at 15-minute intervals — auto-escalation if any truck exceeds 4°C\n\nThe agent is now monitoring cold-chain integrity across all in-transit shipments and DC storage. If any temperature breach is detected, the agent will immediately trigger diversion protocols.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Show me the DC power status",
      "Show the full dashboard",
    ],
  },
  "trigger-promo-restock": {
    triggers: [],
    agentSteps: [
      "Contacting 4 backup suppliers for storm-critical categories",
      "Confirming supplier capacity and delivery route availability",
      "Submitting emergency purchase orders across water, batteries, first aid, and pet food",
      "Deploying supplier delivery tracking and ETA monitoring",
    ],
    explainability: {
      title: "Emergency Supplier Activation Execution",
      reasoning: [
        { factor: "Primary supply disruption", weight: 30, insight: "Primary suppliers for water and batteries offline due to storm. 2 distribution routes closed by road conditions." },
        { factor: "Backup supplier capacity", weight: 25, insight: "4 backup suppliers confirmed: 2 for water/batteries, 1 for first aid, 1 for pet food. Combined capacity covers 72-hour demand." },
        { factor: "Route clearance verification", weight: 25, insight: "Highway corridors I-95 and Route 9 confirmed clear. Delivery ETAs: 12-24 hours depending on supplier." },
        { factor: "Stockout risk reduction", weight: 20, insight: "Activating backups reduces stockout risk from 78% to 43% across storm-critical categories." },
      ],
      confidence: 88,
      model: "Supplier Activation Engine v1.3",
    },
    response:
      "Emergency supplier activation has been **executed successfully**. Here's what was activated:\n\n• **Backup suppliers**: 4 suppliers activated — 2 for water/batteries, 1 for first aid, 1 for pet food\n• **Confirmed capacity**: Combined supplier capacity covers projected 72-hour lockdown demand\n• **Delivery routing**: Orders routed via cleared I-95 and Route 9 corridors — ETAs 12-24 hours\n• **Stockout risk**: Reduced from 78% to 43% across storm-critical categories\n\nThe agent is monitoring supplier fulfillment status and delivery ETAs. If any supplier reports delays, the agent will automatically redistribute orders across remaining suppliers.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Show me delivery route status",
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
      "Scanning cold-chain telemetry across all storm-impacted DCs",
      "Verifying temperature integrity for frozen and chilled inventory",
      "Projecting spoilage risk from power outage scenarios",
      "Generating cold-chain protection action plan",
    ],
    explainability: {
      title: "Cold-Chain Protection Scenario Modeling",
      reasoning: [
        { factor: "Power outage risk assessment", weight: 35, insight: "Northeast DC on backup generator — 18 hours fuel remaining. 3 other DCs on grid but at risk if storm intensifies." },
        { factor: "Temperature breach projection", weight: 30, insight: "If power lost for >4 hours, 60% of frozen inventory ($420K) at spoilage risk. Chilled goods threshold is 6 hours." },
        { factor: "In-transit cold-chain status", weight: 20, insight: "3 trucks carrying chilled/frozen goods currently at 2.1°C. All within safe range but storm delays could extend transit." },
        { factor: "Spoilage cost modeling", weight: 15, insight: "Worst-case spoilage: $640K across frozen and chilled categories. Cold-chain protocol reduces risk by 60%." },
      ],
      confidence: 89,
      model: "Cold-Chain Scenario Engine v2.0",
    },
    response:
      "Here's the projected impact of the **Cold-Chain Protection** scenario. The model identifies **$640K in chilled and frozen inventory** at risk across storm-impacted DCs if power outages exceed 4 hours. By activating cold-chain transport protocols, verifying generator status, and rerouting at-risk shipments, we project a **-60% reduction in spoilage risk**. The chart below shows current cold-chain status versus projected outcomes with protection protocols activated.",
    snapshots: ["current-state", "scenario-waste-reduction"],
    followUps: [],
    showNBACards: "waste-reduction" as ScenarioId,
  },
  "stockout-prevention": {
    triggers: [],
    agentSteps: [
      "Identifying 47 SKUs at critical stockout risk from panic buying",
      "Calculating remaining stock cover against 72-hour lockdown demand",
      "Validating emergency reorder feasibility before delivery window closes",
      "Generating emergency stockout prevention plan",
    ],
    explainability: {
      title: "Emergency Stockout Prevention Scenario Modeling",
      reasoning: [
        { factor: "Panic buying demand surge", weight: 30, insight: "Water +320%, batteries +280%, first aid +200% above baseline. 47 SKUs will hit zero stock within 18 hours." },
        { factor: "Delivery window constraint", weight: 30, insight: "Pre-storm delivery window closes at 2:00 PM today. After that, no inbound deliveries for 72+ hours." },
        { factor: "Revenue protection modeling", weight: 25, insight: "Emergency reorders protect $820K in revenue that would be lost to stockouts during lockdown period." },
        { factor: "Supplier capacity validation", weight: 15, insight: "Primary + backup suppliers can fulfill 85% of emergency demand. Highway corridors I-95 and Route 9 confirmed clear." },
      ],
      confidence: 92,
      model: "Stockout Prevention Engine v2.0",
    },
    response:
      "Here's the projected impact of the **Emergency Stockout Prevention** scenario. The model identifies **47 SKUs at critical risk** with demand surges of 200-320% above baseline from panic buying. Without action, these SKUs hit zero stock within **18 hours** — and the pre-storm delivery window closes at **2:00 PM today**. Emergency reorders protect an estimated **$820K in revenue** through the 72-hour lockdown. The chart below compares current stock cover against projected lockdown demand.",
    snapshots: ["current-state", "scenario-stockout-prevention"],
    followUps: [],
    showNBACards: "stockout-prevention" as ScenarioId,
  },
  "promotion-planning": {
    triggers: [],
    agentSteps: [
      "Modeling post-lockdown demand rebound patterns",
      "Identifying recovery inventory requirements by category",
      "Planning pre-positioning of recovery stock at reopening stores",
      "Generating storm recovery timeline and action plan",
    ],
    explainability: {
      title: "Storm Recovery Planning Scenario Modeling",
      reasoning: [
        { factor: "Post-lockdown demand modeling", weight: 35, insight: "Historical storm data shows 40-60% demand surge in first 48 hours after lockdown lifts. Fresh produce and essentials lead." },
        { factor: "Store reopening sequencing", weight: 25, insight: "23 stores in storm zone — reopening sequenced by road clearance. First wave (8 stores) projected Day 4 post-storm." },
        { factor: "Recovery inventory pre-positioning", weight: 25, insight: "+12% inventory pre-positioned at Southern DC (outside storm zone) for rapid redistribution on reopening." },
        { factor: "Revenue recovery projection", weight: 15, insight: "Pre-positioned recovery stock captures +$340K in revenue vs. reactive restocking (3-5 day lag)." },
      ],
      confidence: 84,
      model: "Recovery Scenario Engine v2.0",
    },
    response:
      "Here's the projected impact of the **Storm Recovery Planning** scenario. Historical storm data shows a **40-60% demand surge** in the first 48 hours after lockdown lifts, led by fresh produce and daily essentials. By pre-positioning **+12% recovery inventory** at Southern DC (outside the storm zone) and sequencing store reopenings by road clearance, we capture an estimated **+$340K in recovery revenue** versus reactive restocking. The chart below shows projected reopening demand versus current inventory positioning.",
    snapshots: ["current-state", "scenario-promotion-planning"],
    followUps: [],
    showNBACards: "promotion-planning" as ScenarioId,
  },
};

// ── Standard conversation flows ─────────────────────────────────────────────

export const CHAT_FLOWS: ChatFlow[] = [
  // ── Cold-chain / spoilage flow ──────────────────────────────────────────
  {
    triggers: ["waste", "spoilage", "shrink", "expiry", "perishable waste", "cold-chain", "cold chain", "power outage", "temperature"],
    agentSteps: [
      "Scanning cold-chain telemetry across all storm-impacted DCs",
      "Identifying inventory at spoilage risk from power disruptions",
      "Calculating spoilage exposure by category and DC",
      "Assessing generator backup status and fuel reserves",
    ],
    explainability: {
      title: "Cold-Chain Disruption & Spoilage Risk Analysis",
      reasoning: [
        { factor: "Power outage risk", weight: 35, insight: "Northeast DC on backup generator — 18 hours fuel. Storm forecast to intensify, increasing grid failure risk at 3 additional DCs." },
        { factor: "Temperature breach exposure", weight: 28, insight: "$640K in frozen/chilled inventory at risk. Frozen threshold: 4 hours without power. Chilled threshold: 6 hours." },
        { factor: "In-transit cold-chain status", weight: 22, insight: "3 trucks carrying chilled goods at 2.1°C. Storm delays could extend transit by 4-8 hours, risking temperature breach." },
        { factor: "Spoilage cost projection", weight: 15, insight: "Current waste rate 14.2% (storm-elevated). Without cold-chain intervention, projected to reach 22% over next 72 hours." },
      ],
      confidence: 91,
      model: "Cold-Chain Risk Model v2.1",
    },
    response:
      "Here's your **cold-chain and spoilage risk status**. The storm is creating a **power disruption threat** across 4 DCs — Northeast DC is already on backup generator with 18 hours of fuel remaining.\n\nThe analysis shows **$640K in frozen and chilled inventory at risk** if power outages exceed safe thresholds. Your current state: **waste rate 14.2%** (storm-elevated), **cold-chain integrity 82%**, **fill rate 78.4%**.\n\nThe highest-risk categories are **frozen desserts** ($180K exposure) and **chilled ready meals** ($140K exposure) — both breach safe temperature within 4-6 hours of power loss. Additionally, **3 trucks en route** are carrying chilled goods at 2.1°C, but storm-related transit delays could push them past the safe window.\n\nWithout cold-chain intervention, waste rate is projected to reach **22%** over the next 72 hours. Activating cold-chain protection protocols would reduce spoilage risk by **60%**.",
    snapshots: ["current-state", "dashboard"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve cold-chain transport protocols",
      "What is the generator backup status?",
      "Model the spoilage cost if power fails",
    ],
  },
  // ── Storm demand drivers flow ───────────────────────────────────────────
  {
    triggers: ["demand driver", "weather", "missing", "drivers", "panic buying", "what demand drivers", "storm impact", "supply chain", "road closure", "route"],
    agentSteps: [
      "Analyzing storm weather signals and severity projections",
      "Decomposing panic buying patterns by category and region",
      "Mapping delivery route closures and corridor availability",
      "Ranking demand drivers by impact on supply chain",
    ],
    explainability: {
      title: "Storm Demand Driver Decomposition",
      reasoning: [
        { factor: "Weather severity signal", weight: 35, insight: "Category 3 blizzard arriving in 14 hours. 72-hour lockdown projected. Wind speeds 45-60 mph with heavy snowfall." },
        { factor: "Panic buying acceleration", weight: 25, insight: "Water +320%, batteries +280%, first aid +200%, pet food +150% above baseline — accelerating hourly." },
        { factor: "Delivery route disruption", weight: 25, insight: "12 of 18 delivery routes closed or restricted. Only I-95 and Route 9 corridors confirmed clear." },
        { factor: "Store closure impact", weight: 15, insight: "23 stores in storm zone — 8 expected to close within 12 hours. Remaining 15 on reduced hours." },
      ],
      confidence: 92,
      model: "Storm Signal Engine v3.0",
    },
    response:
      "The storm is driving **unprecedented demand shifts** across your supply chain. Here are the critical demand drivers the AI agent is tracking:\n\n• **Blizzard severity** — Category 3 blizzard arriving in 14 hours. 72-hour lockdown projected with wind speeds 45-60 mph\n• **Panic buying surge** — Water +320%, batteries +280%, first aid +200%, pet food +150% above baseline — and accelerating\n• **Delivery route closures** — 12 of 18 routes closed or restricted. Only I-95 and Route 9 corridors remain clear\n• **Store closures** — 23 stores in the storm zone, 8 expected to close within 12 hours\n• **Power grid risk** — 4 DCs at risk of power disruption, Northeast DC already on backup generator\n\nThe **demand driver decomposition** below shows how these storm signals are impacting each category and region.",
    snapshots: ["mmm", "analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Which SKUs are at critical stockout risk?",
      "What delivery routes are still open?",
      "Model the business impact of the storm",
    ],
  },
  // ── Autonomous storm response flow ──────────────────────────────────────
  {
    triggers: ["fix", "without adding", "touchless", "automate", "planners", "manual", "how do we fix", "overwhelmed", "every sku", "autonomous"],
    agentSteps: [
      "Classifying SKUs by storm-response urgency tier",
      "Calculating which decisions the AI agent can handle autonomously",
      "Identifying critical decisions that require human approval",
      "Projecting autonomous coverage for storm response pipeline",
    ],
    explainability: {
      title: "Autonomous Storm Response Assessment",
      reasoning: [
        { factor: "Storm urgency segmentation", weight: 35, insight: "Tier 1 (emergency essentials): 47 SKUs need immediate action. Tier 2 (cold-chain): 85 SKUs need monitoring. Tier 3 (recovery): 120 SKUs for post-storm." },
        { factor: "Autonomous coverage", weight: 30, insight: "Agent can handle 78% of storm decisions autonomously — reorder triggers, route optimization, supplier switching." },
        { factor: "Human approval gates", weight: 20, insight: "3 critical decisions need human sign-off: emergency budget release ($1.2M), generator fuel resupply, store closure sequence." },
        { factor: "Response time improvement", weight: 15, insight: "Autonomous response cuts decision-to-action time from 4 hours (manual) to 12 minutes (AI-assisted)." },
      ],
      confidence: 89,
      model: "Autonomous Response Engine v1.8",
    },
    response:
      "The AI agent can handle **78% of storm response decisions autonomously** — your team only needs to approve the 3 critical decisions that require human judgment. Here's how the **storm response segmentation** works:\n\n• **Tier 1 — Emergency Essentials (47 SKUs)**: Water, batteries, first aid, ready meals, pet food. The agent auto-triggers reorders when stock cover drops below 24 hours and routes via cleared corridors.\n• **Tier 2 — Cold-Chain Protection (85 SKUs)**: Frozen and chilled goods. The agent monitors temperature telemetry and auto-diverts shipments if cold-chain breach detected.\n• **Tier 3 — Recovery Pre-Positioning (120 SKUs)**: Post-storm demand items. The agent pre-positions inventory at Southern DC for rapid redistribution when stores reopen.\n\nThe result: decision-to-action time drops from **4 hours** (manual triage) to **12 minutes** (AI-assisted), and your team focuses only on the **3 critical approvals** — emergency budget release, generator fuel resupply, and store closure sequencing.",
    snapshots: ["audiences", "reports"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve emergency budget release",
      "What are the 3 critical decisions?",
    ],
  },
  // ── Scenario overview flow ──────────────────────────────────────────────
  {
    triggers: [
      "model the impact", "scenario", "scenarios",
      "what can we do", "what should we do", "options",
      "strategies", "strategic", "propose",
      "recommendations", "improve forecast",
      "losing", "save us",
      "business impact",
    ],
    agentSteps: [
      "Assessing current storm impact across all supply chain nodes",
      "Modeling protection, prevention, and recovery scenarios",
      "Projecting financial exposure under each response strategy",
      "Preparing scenario options for your review",
    ],
    explainability: {
      title: "Storm Response Scenario Modeling",
      reasoning: [
        { factor: "Current state assessment", weight: 30, insight: "Forecast accuracy 72.3% (declining), waste rate 14.2% (storm-elevated), fill rate 78.4% — $820K revenue at risk." },
        { factor: "Scenario projection engine", weight: 30, insight: "Three scenarios modeled: cold-chain protection (-60% spoilage), stockout prevention ($820K protected), recovery (+$340K)." },
        { factor: "Urgency ranking", weight: 25, insight: "Stockout prevention most urgent — delivery window closes at 2:00 PM. Cold-chain second. Recovery can be staged." },
        { factor: "Constraint validation", weight: 15, insight: "All scenarios validated against remaining delivery windows, DC capacity, supplier availability, and route clearance." },
      ],
      confidence: 88,
      model: "Storm Scenario Engine v2.0",
    },
    response:
      "Here's where your storm response stands. **Forecast accuracy** has declined to **72.3%** as the storm disrupts normal demand patterns. **Waste rate** is at **14.2%** (storm-elevated from cold-chain risk), and **fill rate** has dropped to **78.4%** with 47 SKUs at critical stockout risk.\n\nYou're looking at **$820K in revenue at risk** from stockouts and **$640K in spoilage exposure** from cold-chain disruptions. Each scenario below shows a **different response strategy** — select one to see projected impact, recommended actions, and the specific workflow the agent will execute.",
    snapshots: ["current-state"],
    followUps: [],
    offerScenarios: true,
  },
  // ── Agent recommendations trigger (shows NBA cards) ─────────────────────
  {
    triggers: ["agent recommend", "ai agent", "recommending", "what actions", "next best", "another recommended action", "execute another", "agent's recommended"],
    agentSteps: [
      "The AI agent is scanning active storm signals and supply chain status",
      "The AI agent is evaluating pending emergency actions",
      "The AI agent is ranking actions by urgency and delivery window constraints",
      "The AI agent is preparing executable action cards",
    ],
    explainability: {
      title: "Storm Action Ranking",
      reasoning: [
        { factor: "Delivery window urgency", weight: 35, insight: "Pre-storm window closes at 2:00 PM — emergency reorder is highest priority with 94% confidence." },
        { factor: "Cold-chain risk exposure", weight: 25, insight: "Cold-chain transport approval protects $420K frozen/chilled inventory at 91% confidence." },
        { factor: "Supply chain resilience", weight: 25, insight: "Backup supplier activation reduces stockout risk from 78% to 43% across storm-critical categories." },
        { factor: "Execution feasibility", weight: 15, insight: "All actions validated against remaining delivery windows, route clearance, and supplier capacity." },
      ],
      confidence: 92,
      model: "Storm NBA Engine v1.5",
    },
    response:
      "The AI agent has analyzed the storm situation and identified **3 actions it can execute right now** to protect revenue and prevent spoilage. Each action is ranked by **urgency** — the emergency reorder is time-critical because the pre-storm delivery window closes at **2:00 PM today**.\n\nYou can **approve and execute any action** directly from the cards below — the agent will handle end-to-end execution, from submitting orders to routing shipments and activating monitoring.",
    snapshots: [],
    followUps: [],
    showNBACards: "all",
  },
  // ── Forecast accuracy flow ──────────────────────────────────────────────
  {
    triggers: ["forecast accuracy", "accuracy", "how accurate"],
    agentSteps: [
      "Measuring forecast accuracy degradation as storm approaches",
      "Tracking weather-adjusted accuracy across storm-impacted categories",
      "Identifying which SKUs have the largest forecast gaps from demand surges",
    ],
    explainability: {
      title: "Storm-Adjusted Forecast Accuracy Analysis",
      reasoning: [
        { factor: "Storm-driven accuracy decline", weight: 35, insight: "Overall accuracy declined from 82% to 72.3% over 48 hours as panic buying outpaced demand models." },
        { factor: "Category-level breakdown", weight: 30, insight: "Emergency essentials 58% accuracy (demand surges unmodeled), cold-chain 71%, general grocery 79%." },
        { factor: "Weather model integration gap", weight: 20, insight: "Current models lack storm severity input — adding weather signals would recover 8-10% accuracy." },
        { factor: "Trend analysis", weight: 15, insight: "Accuracy declining hourly as storm approaches. Without weather-adjusted models, gap will widen further." },
      ],
      confidence: 88,
      model: "Storm Accuracy Analytics v2.2",
    },
    response:
      "Here's your **forecast accuracy** breakdown during the storm. Overall accuracy has **declined from 82% to 72.3%** over the last 48 hours as panic buying outpaces demand models:\n\n• **Emergency essentials** (water, batteries, first aid): **58% accuracy** — demand surges of 200-320% are completely unmodeled\n• **Cold-chain goods** (frozen, chilled): **71% accuracy** — spoilage uncertainty adding forecast noise\n• **Warm clothing & blankets**: **65% accuracy** — seasonal models don't capture storm-driven spikes\n• **Pet supplies**: **68% accuracy** — panic buying pattern not in historical baseline\n• **General grocery**: **79% accuracy** — relatively stable but declining\n\nAccuracy is **declining hourly** as the storm approaches. The AI agent's weather-adjusted demand sensing would recover **8-10% accuracy** by incorporating storm severity signals — but the immediate priority is executing emergency reorders before the delivery window closes.",
    snapshots: ["dashboard", "reports"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Which SKUs are at critical stockout risk?",
      "Approve the emergency reorder now",
    ],
  },
  // ── Stock-out flow ──────────────────────────────────────────────────────
  {
    triggers: ["stock-out", "out of stock", "availability", "fill rate", "service level", "stockout", "critical risk", "blizzard"],
    agentSteps: [
      "Identifying 47 SKUs at critical stockout risk from panic buying",
      "Calculating hours until zero stock for each storm-critical category",
      "Mapping delivery constraints from route closures",
      "Projecting revenue loss from lockdown-period stockouts",
    ],
    explainability: {
      title: "Storm Stockout Risk Analysis",
      reasoning: [
        { factor: "Panic buying demand surge", weight: 35, insight: "47 SKUs below minimum cover. Water hits zero in 8 hours, batteries in 12, first aid in 14." },
        { factor: "Delivery window constraint", weight: 25, insight: "Pre-storm delivery window closes at 2:00 PM. 72-hour lockdown means no resupply after that." },
        { factor: "Route closure impact", weight: 25, insight: "12 of 18 delivery routes closed. Only I-95 and Route 9 available — limiting resupply capacity." },
        { factor: "Revenue exposure", weight: 15, insight: "$820K in revenue at risk from stockouts during lockdown. Fill rate dropped from 91% to 78.4%." },
      ],
      confidence: 93,
      model: "Stockout Risk Model v2.1",
    },
    response:
      "Your **fill rate** has dropped to **78.4%** with **47 SKUs at critical stockout risk** from panic buying. This is a **storm-driven supply crisis** — demand surges are overwhelming current inventory and the delivery window is closing.\n\nHere's the critical stockout timeline:\n\n• **Water**: Hits zero stock in **8 hours** — demand +320% above baseline\n• **Batteries**: Zero stock in **12 hours** — demand +280% above baseline\n• **First aid kits**: Zero stock in **14 hours** — demand +200% above baseline\n• **Ready meals**: Zero stock in **18 hours** — demand +180% above baseline\n• **Pet food**: Zero stock in **22 hours** — demand +150% above baseline\n\nThe pre-storm delivery window closes at **2:00 PM today** — after that, no inbound deliveries for **72+ hours** during lockdown. Total estimated **revenue at risk: $820K**. The AI agent has an emergency reorder ready to execute that would extend stock cover through the full lockdown period.",
    snapshots: ["current-state", "analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve the emergency reorder now",
      "Activate backup suppliers",
      "Which delivery routes are still open?",
    ],
  },
  // ── Storm response pipeline flow ────────────────────────────────────────
  {
    triggers: ["end-to-end", "demand planning workflow", "run workflow", "workflow", "forecasting workflow", "pipeline", "emergency reorder plan"],
    agentSteps: [
      "The AI agent is ingesting live storm weather signals and severity updates",
      "The AI agent is running demand surge detection across all storm-critical SKUs",
      "The AI agent is validating emergency reorders against delivery windows and routes",
      "The AI agent is activating cold-chain verification protocols across impacted DCs",
    ],
    explainability: {
      title: "Storm Response Pipeline Orchestration",
      reasoning: [
        { factor: "Weather signal ingestion", weight: 25, insight: "Live NOAA weather feed, storm track updates every 30 minutes. Current: Category 3, ETA 14 hours." },
        { factor: "Demand surge detection", weight: 30, insight: "Real-time POS data shows accelerating panic buying. Agent auto-flags SKUs crossing 2x baseline threshold." },
        { factor: "Reorder validation", weight: 25, insight: "Emergency orders validated against DC capacity, route clearance, and pre-storm delivery window (2:00 PM cutoff)." },
        { factor: "Cold-chain orchestration", weight: 20, insight: "Temperature telemetry from all trucks and DCs fed into pipeline. Auto-diversion if breach detected." },
      ],
      confidence: 90,
      model: "Storm Pipeline Orchestrator v3.2",
    },
    response:
      "The AI agent is now **executing the storm response pipeline**. You can watch each step progress in real time in the **workflow DAG** on the right panel. Here's what the agent is doing:\n\n• **Weather signal ingestion** — Live NOAA feed tracking storm severity, wind speeds, and snowfall projections updated every 30 minutes\n• **Demand surge detection** — Real-time POS scanning across all storm-critical SKUs, auto-flagging when demand crosses 2x baseline\n• **Emergency reorder validation** — Checking DC capacity, route clearance, and delivery window constraints for each pending order\n• **Cold-chain verification** — Temperature telemetry from all trucks and DCs monitored, with auto-diversion on breach\n• **Store closure monitoring** — Tracking which stores are closing and adjusting demand allocation in real time\n\nThe DAG visualization shows the agent working through each stage — green nodes are complete, blue nodes are in progress.",
    snapshots: ["dashboard"],
    followUps: [
      "What actions is the AI agent recommending?",
      "Show me delivery route status",
      "What is the cold-chain status?",
    ],
  },
  // ── Storm monitoring / agent status ─────────────────────────────────────
  {
    triggers: ["monitoring", "what is the ai monitoring", "agent status", "pipeline status", "agent monitoring"],
    agentSteps: [
      "The AI agent is checking all active storm monitoring feeds",
      "The AI agent is reviewing delivery route and DC power status",
      "The AI agent is summarizing current alerts and escalations",
    ],
    explainability: {
      title: "Storm Monitoring Status",
      reasoning: [
        { factor: "Weather model tracking", weight: 30, insight: "NOAA feed active — storm track updated every 30 minutes. Category 3 blizzard, ETA 14 hours, 72-hour duration." },
        { factor: "Delivery route monitoring", weight: 25, insight: "12 of 18 routes closed. I-95 and Route 9 confirmed clear. Real-time DOT feed active for route changes." },
        { factor: "DC power monitoring", weight: 25, insight: "Northeast DC on generator (18hr fuel). 3 DCs on grid with storm-risk flagged. Power alerts every 15 minutes." },
        { factor: "Cold-chain telemetry", weight: 20, insight: "Continuous temperature monitoring across 3 in-transit trucks and 4 DCs. Alert threshold: 4°C for frozen, 8°C for chilled." },
      ],
      confidence: 94,
      model: "Storm Monitoring Agent v2.0",
    },
    response:
      "Here's what the AI agent is actively monitoring across the storm response:\n\n• **Weather models** — NOAA storm track feed updating every 30 minutes. Current: Category 3 blizzard, ETA 14 hours, projected 72-hour duration\n• **Delivery routes** — Real-time DOT feed monitoring all 18 routes. Currently 12 closed, 2 confirmed clear (I-95, Route 9), 4 restricted\n• **DC power status** — Northeast DC on backup generator (18 hours fuel, resupply dispatched). 3 additional DCs on grid with storm-risk alerts active\n• **Cold-chain telemetry** — Continuous temperature monitoring across 3 in-transit trucks and 4 DCs with 15-minute alert intervals\n• **Panic buying velocity** — Real-time POS monitoring for demand surge acceleration across storm-critical SKUs\n\n**Active alert**: Pre-storm delivery window closes at 2:00 PM today. Emergency reorder pending your approval.",
    snapshots: ["analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve the emergency reorder now",
      "What is the DC power status?",
    ],
  },
  // ── Storm planning actions ──────────────────────────────────────────────
  {
    triggers: ["planning action", "planning actions", "order", "adjustment", "restock", "replenish", "reorder"],
    agentSteps: [
      "The AI agent is reviewing all active storm response actions",
      "The AI agent is analyzing pending emergency orders and approvals",
      "The AI agent is ranking actions by urgency and delivery window",
    ],
    explainability: {
      title: "Storm Response Actions Pipeline",
      reasoning: [
        { factor: "Action urgency ranking", weight: 35, insight: "5 storm-response actions ranked: emergency reorder (CRITICAL), cold-chain (HIGH), supplier activation (HIGH), generator resupply (MEDIUM), recovery pre-position (LOW)." },
        { factor: "Delivery window constraint", weight: 30, insight: "Emergency reorder and cold-chain transport must execute before 2:00 PM cutoff — 4 hours remaining." },
        { factor: "Resource validation", weight: 20, insight: "All actions validated against DC capacity, route clearance, supplier availability, and budget authorization." },
        { factor: "Execution readiness", weight: 15, insight: "3 actions ready for one-click approval. 2 actions require budget authorization first." },
      ],
      confidence: 91,
      model: "Storm Action Planner v1.6",
    },
    response:
      "The AI agent has identified **5 active storm response actions** ranked by urgency. The emergency reorder is **CRITICAL** — the pre-storm delivery window closes in 4 hours. Each action below has been validated against delivery constraints and is ready for execution.",
    snapshots: ["campaigns", "analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve the emergency reorder now",
      "What delivery routes are still open?",
    ],
  },
  // ── Storm demand decomposition ──────────────────────────────────────────
  {
    triggers: ["demand driver analysis", "driver analysis", "driver decomposition", "demand decomposition"],
    agentSteps: [
      "The AI agent is loading storm-adjusted demand driver model",
      "The AI agent is decomposing demand by storm signal contribution",
      "The AI agent is generating storm impact attribution by category",
    ],
    explainability: {
      title: "Storm Demand Driver Attribution",
      reasoning: [
        { factor: "Weather severity contribution", weight: 35, insight: "Storm severity drives 45% of current demand variance. Blizzard category and duration are the dominant signals." },
        { factor: "Panic buying acceleration", weight: 30, insight: "Social media and news coverage amplifying panic buying — contributing 25% of demand surge above weather signal alone." },
        { factor: "Route closure impact", weight: 20, insight: "Delivery constraints creating artificial scarcity signal — customers buying more per trip as store closures loom." },
        { factor: "Baseline demand extraction", weight: 15, insight: "After removing storm drivers, baseline demand is flat. All variance is storm-attributable." },
      ],
      confidence: 90,
      model: "Storm Driver Attribution v2.4",
    },
    response:
      "Here's your **storm demand driver analysis**. The AI model decomposes current demand into **baseline + storm drivers**: weather severity drives **45%** of demand variance, panic buying amplification adds **25%**, delivery route constraints contribute **20%**, and store closure anticipation accounts for **10%**. All current demand variance is storm-attributable — baseline demand is flat. The full driver breakdown by category is shown below.",
    snapshots: ["mmm", "reports"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Which SKUs are at critical stockout risk?",
      "How should we plan for post-storm recovery?",
    ],
  },
  // ── Storm dashboard / overview ──────────────────────────────────────────
  {
    triggers: ["performance summary", "summary", "overview", "how are we doing", "dashboard", "overall", "status"],
    agentSteps: [
      "Pulling together storm response metrics across all nodes",
      "Comparing current KPIs to pre-storm baselines",
      "Building storm response summary with critical action items",
    ],
    explainability: {
      title: "Storm Response Dashboard Summary",
      reasoning: [
        { factor: "KPI degradation tracking", weight: 30, insight: "Forecast accuracy 72.3% (down from 82%), waste rate 14.2% (up from 8%), fill rate 78.4% (down from 91%)." },
        { factor: "Revenue risk aggregation", weight: 25, insight: "$820K at risk from stockouts + $640K spoilage exposure = $1.46M total storm impact if no action taken." },
        { factor: "Agent activity summary", weight: 25, insight: "3 emergency actions pending approval, 5 monitoring feeds active, storm pipeline running." },
        { factor: "Time-critical alerts", weight: 20, insight: "Pre-storm delivery window closes at 2:00 PM — emergency reorder requires immediate approval." },
      ],
      confidence: 94,
      model: "Storm Dashboard v2.0",
    },
    response:
      "Here's your storm response overview. **Forecast accuracy** has declined to **72.3%**, **waste rate** is storm-elevated at **14.2%**, and **fill rate** has dropped to **78.4%**. You have **3 emergency actions** pending approval, with the emergency reorder flagged as **CRITICAL** — delivery window closes at 2:00 PM. Total storm exposure: **$1.46M** ($820K stockout risk + $640K spoilage risk).",
    snapshots: ["dashboard", "analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve the emergency reorder now",
      "What is the cold-chain status?",
    ],
  },
  // ── Storm-critical SKU segments ─────────────────────────────────────────
  {
    triggers: ["segment", "segments", "forecastability", "sku segment", "sku segments", "segmentation"],
    agentSteps: [
      "Classifying SKUs by storm-response urgency tier",
      "Analyzing demand surge patterns by storm-critical category",
      "Mapping inventory cover against lockdown duration",
    ],
    explainability: {
      title: "Storm-Critical SKU Segmentation",
      reasoning: [
        { factor: "Emergency essentials tier", weight: 35, insight: "47 SKUs: water, batteries, first aid, ready meals, pet food. Demand +150-320% above baseline. Highest urgency." },
        { factor: "Cold-chain tier", weight: 25, insight: "85 SKUs: frozen desserts, chilled ready meals, dairy. At risk from power outage, not demand surge." },
        { factor: "Warm clothing/bedding tier", weight: 20, insight: "32 SKUs: blankets, warm clothing, hand warmers. Demand +120% — secondary urgency." },
        { factor: "Recovery tier", weight: 20, insight: "120 SKUs: fresh produce, cleaning supplies, hardware. Post-storm demand — pre-position at Southern DC." },
      ],
      confidence: 90,
      model: "Storm Segmentation Engine v1.8",
    },
    response:
      "Here's your **storm-critical SKU segmentation**. Your portfolio is segmented into four urgency tiers for storm response:\n\n• **Tier 1 — Emergency Essentials (47 SKUs)**: Water, batteries, first aid, ready meals, pet food. Demand surging 150-320% above baseline. **Immediate reorder required.**\n• **Tier 2 — Cold-Chain Protected (85 SKUs)**: Frozen desserts, chilled ready meals, dairy. At risk from power outages, not demand surges. **Cold-chain protocols needed.**\n• **Tier 3 — Warm Comfort (32 SKUs)**: Blankets, warm clothing, hand warmers. Demand +120%. **Secondary priority.**\n• **Tier 4 — Recovery Stock (120 SKUs)**: Fresh produce, cleaning supplies, hardware. Post-storm demand. **Pre-position at Southern DC.**",
    snapshots: ["audiences", "customers"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve the emergency reorder for Tier 1",
      "What is the cold-chain status for Tier 2?",
    ],
  },
  // ── Storm impact report ─────────────────────────────────────────────────
  {
    triggers: ["report", "reports", "forecast report", "weekly report", "storm report"],
    agentSteps: [
      "Compiling storm impact assessment across all supply chain nodes",
      "Calculating financial exposure from stockouts and spoilage",
      "Formatting storm response report with action recommendations",
    ],
    explainability: {
      title: "Storm Impact Assessment Report",
      reasoning: [
        { factor: "Financial exposure computation", weight: 30, insight: "$820K stockout risk + $640K spoilage exposure = $1.46M total storm impact without intervention." },
        { factor: "KPI degradation tracking", weight: 30, insight: "Forecast accuracy down 10 pts (82% → 72.3%), fill rate down 13 pts (91% → 78.4%), waste rate up 6 pts." },
        { factor: "Action status summary", weight: 25, insight: "3 emergency actions pending. Emergency reorder: CRITICAL. Cold-chain: HIGH. Supplier activation: HIGH." },
        { factor: "Recovery outlook", weight: 15, insight: "Post-storm recovery projected Day 4-6. Pre-positioning at Southern DC reduces recovery restock time by 3 days." },
      ],
      confidence: 91,
      model: "Storm Report Generator v2.1",
    },
    response:
      "Here's your **storm impact assessment report**. Total financial exposure is **$1.46M** — comprising **$820K** in stockout risk and **$640K** in spoilage exposure. KPIs have degraded significantly: forecast accuracy down to **72.3%**, fill rate at **78.4%**, waste rate elevated to **14.2%**. The report includes 3 recommended actions, current monitoring status, and post-storm recovery projections.",
    snapshots: ["reports"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve the emergency reorder now",
      "How should we plan for post-storm recovery?",
    ],
  },
  // ── Store closure / reopening status ────────────────────────────────────
  {
    triggers: ["store", "store insight", "store insights", "store level", "store performance", "store closure", "store reopen"],
    agentSteps: [
      "Mapping store closure status across the storm zone",
      "Projecting reopening sequence based on road clearance timeline",
      "Identifying priority stores for recovery inventory allocation",
    ],
    explainability: {
      title: "Store Closure & Reopening Analysis",
      reasoning: [
        { factor: "Storm zone mapping", weight: 30, insight: "23 stores in storm zone. 8 closing within 12 hours (Zone A — heaviest impact). 15 on reduced hours (Zone B)." },
        { factor: "Reopening projection", weight: 30, insight: "First wave reopening (8 stores) projected Day 4 post-storm. Full reopening Day 6 based on road clearance models." },
        { factor: "Demand rebound modeling", weight: 25, insight: "Historical storms show 40-60% demand surge in first 48 hours after reopening. Fresh produce and essentials lead." },
        { factor: "Recovery allocation", weight: 15, insight: "Priority stores (highest population density) allocated first from Southern DC recovery stock." },
      ],
      confidence: 87,
      model: "Store Operations Analytics v1.7",
    },
    response:
      "Here's your **store closure and reopening status**. Of **23 stores** in the storm zone:\n\n• **Zone A — Closing (8 stores)**: Heaviest storm impact. Closing within 12 hours. Projected reopening: **Day 4** post-storm based on road clearance timeline\n• **Zone B — Reduced Hours (15 stores)**: Moderate impact. Operating on reduced hours during storm. Expected to resume normal operations **Day 2-3**\n• **Zone C — Unaffected (119 stores)**: Outside storm zone. Operating normally — absorbing some redirected demand\n\nThe AI agent is monitoring road clearance reports to update reopening projections in real time. Recovery inventory is being pre-positioned at Southern DC for rapid redistribution when stores reopen.",
    snapshots: ["customers"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "How should we plan for post-storm recovery?",
      "Pre-position recovery inventory now",
    ],
  },
  // ── Storm demand acceleration / trends ──────────────────────────────────
  {
    triggers: ["analytics", "trends", "weekly trends", "demand trends", "demand analytics", "acceleration"],
    agentSteps: [
      "Scanning demand acceleration patterns as storm approaches",
      "Identifying hourly buying velocity changes by category",
      "Projecting peak demand window before lockdown",
    ],
    explainability: {
      title: "Storm Demand Acceleration Analytics",
      reasoning: [
        { factor: "Hourly acceleration tracking", weight: 30, insight: "Demand accelerating 8-12% per hour for emergency essentials. Peak expected 4-6 hours before storm arrival." },
        { factor: "Category velocity analysis", weight: 25, insight: "Water velocity: 4.2x baseline. Batteries: 3.8x. First aid: 2.6x. All accelerating, not plateauing." },
        { factor: "Historical storm comparison", weight: 25, insight: "Current surge matches 2024 Nor'easter pattern — peak demand hit 6 hours pre-storm, then dropped to near-zero." },
        { factor: "Post-lockdown projection", weight: 20, insight: "Demand expected to drop to near-zero during 72-hour lockdown, then surge 40-60% above baseline on reopening." },
      ],
      confidence: 89,
      model: "Storm Demand Analytics v2.3",
    },
    response:
      "Here are your **demand acceleration analytics** as the storm approaches. Buying velocity is **accelerating 8-12% per hour** for emergency essentials — this is not plateauing yet.\n\nCurrent demand velocities:\n• **Water**: 4.2x baseline and accelerating\n• **Batteries**: 3.8x baseline and accelerating\n• **First aid**: 2.6x baseline and accelerating\n• **Ready meals**: 2.4x baseline\n• **Pet food**: 1.9x baseline\n\nBased on the 2024 Nor'easter pattern, peak demand is expected **4-6 hours before storm arrival**, then drops to near-zero during the 72-hour lockdown. Post-lockdown, expect a **40-60% demand rebound** in the first 48 hours.",
    snapshots: ["analytics"],
    followUps: [
      "Show me the AI agent's recommended actions",
      "Approve the emergency reorder now",
      "How should we plan for post-storm recovery?",
    ],
  },
];

export const DEFAULT_FLOW: ChatFlow = {
  triggers: [],
  agentSteps: [
    "Processing your request",
    "Searching storm response knowledge base",
    "Preparing response",
  ],
  response:
    "I can help you with that! Here's a quick overview of your current storm response status. You can ask me about **stockout risk**, **cold-chain status**, **delivery routes**, or explore a **response scenario** to see how the AI agent can protect your supply chain during the blizzard.",
  snapshots: ["dashboard"],
  followUps: [
    "Show me the AI agent's recommended actions",
    "Which SKUs are at critical stockout risk?",
    "What is the cold-chain status?",
    "How should we plan for post-storm recovery?",
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
    { category: "dashboard", title: "Cold-chain protection scenario modelled", summary: "Projected -60% spoilage risk with cold-chain transport protocols and generator backup verified.", metric: "-60% Spoilage" },
    { category: "mmm", title: "Storm spoilage driver analysis updated", summary: "Power outage risk and transit delays identified as primary spoilage drivers across 4 DCs.", metric: "$640K Protected" },
    { category: "reports", title: "Cold-chain status report generated", summary: "Temperature telemetry and generator status across all storm-impacted DCs and in-transit shipments." },
    { category: "campaigns", title: "Cold-chain actions recommended", summary: "Transport approval and generator resupply recommended by agent for immediate execution." },
    { category: "analytics", title: "Spoilage risk projections updated", summary: "72-hour projection shows spoilage risk declining from 22% to 8.8% with cold-chain protocols active." },
  ],
  "stockout-prevention": [
    { category: "dashboard", title: "Emergency stockout prevention modelled", summary: "Projected $820K revenue protected through emergency reorders before delivery window closes.", metric: "$820K Protected" },
    { category: "campaigns", title: "Emergency reorder actions proposed", summary: "Priority purchase orders for 47 storm-critical SKUs at Northeast DC ready for approval." },
    { category: "audiences", title: "Storm-critical SKU tiers analyzed", summary: "4-tier urgency segmentation: 47 emergency essentials, 85 cold-chain, 32 comfort, 120 recovery." },
    { category: "customers", title: "Store stockout risk mapped", summary: "23 stores in storm zone ranked by stockout risk and projected closure timeline." },
    { category: "analytics", title: "Demand surge projections updated", summary: "Panic buying acceleration tracked — peak demand expected 4-6 hours before storm arrival." },
  ],
  "promotion-planning": [
    { category: "dashboard", title: "Storm recovery scenario modelled", summary: "Projected +$340K recovery revenue with pre-positioned inventory at Southern DC.", metric: "+$340K Recovery" },
    { category: "campaigns", title: "Recovery inventory actions proposed", summary: "+12% inventory pre-positioned at Southern DC for rapid redistribution on store reopening." },
    { category: "audiences", title: "Recovery demand categories flagged", summary: "Fresh produce, cleaning supplies, and hardware identified as highest post-storm demand categories." },
    { category: "customers", title: "Store reopening sequence planned", summary: "23 stores sequenced for reopening based on road clearance — first wave (8 stores) projected Day 4." },
    { category: "analytics", title: "Post-storm demand rebound modelled", summary: "Historical data projects 40-60% demand surge in first 48 hours after lockdown lifts." },
  ],
};

export const EXECUTION_ARTIFACTS: Record<NBAActionId, ScenarioArtifactDef[]> = {
  "adjust-forecast-dairy": [
    { category: "campaigns", title: "Emergency reorder executed", summary: "Priority orders for water, batteries, first aid, ready meals, and pet food submitted to Northeast DC.", metric: "$820K protected" },
    { category: "mmm", title: "Storm delivery routing confirmed", summary: "Shipments routed via cleared I-95 corridor — ETA 4 hours before pre-storm delivery cutoff." },
  ],
  "reduce-bakery-order": [
    { category: "campaigns", title: "Cold-chain transport approved", summary: "Sub-4°C conditional transport for frozen/chilled goods to Northeast DC — monitoring active.", metric: "-60% spoilage risk" },
    { category: "analytics", title: "Temperature monitoring activated", summary: "Continuous cold-chain telemetry with 15-minute alerts across 3 in-transit trucks and Northeast DC." },
  ],
  "trigger-promo-restock": [
    { category: "campaigns", title: "Backup suppliers activated", summary: "4 emergency suppliers activated for water, batteries, first aid, and pet food categories.", metric: "-35% stockout risk" },
    { category: "audiences", title: "Supplier delivery tracking active", summary: "GPS tracking on all backup supplier shipments — ETAs 12-24 hours via cleared corridors." },
    { category: "customers", title: "Supplier capacity confirmed", summary: "Combined backup supplier capacity covers projected 72-hour lockdown demand across storm-critical categories." },
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

export function matchFlow(input: string): ChatFlow | null {
  const lower = input.toLowerCase().trim();
  for (const flow of CHAT_FLOWS) {
    if (flow.triggers.some((t) => lower.includes(t))) {
      return flow;
    }
  }
  return null;
}
