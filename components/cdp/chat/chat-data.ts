import type {
  IncrementalityApplication,
  IncrementalityDomainLens,
  IncrementalityTemplate,
} from "@/lib/incrementality-data";

export type SnapshotType =
  | "dashboard"
  | "reports"
  | "mmm"
  | "campaigns"
  | "audiences"
  | "customers"
  | "analytics"
  | "current-state"
  | "scenario-profit"
  | "scenario-acquisition"
  | "scenario-retention"
  | "nba-execution";

export type ReportCardType = "weekly-commercial-review";

export type ScenarioId = "profit" | "acquisition" | "retention";

export type ChatPersona = "ecommerce" | "operations" | "general_user";

export type WarningActionId =
  | "warning-return-drivers"
  | "warning-return-recs"
  | "warning-stockout-risk"
  | "warning-checkout-friction"
  | "warning-conversion-wins"
  | "warning-conversion-scenario";

export type NBAActionId =
  | "boost-pmax"
  | "suppress-fb"
  | "launch-winback"
  | "optimize-pdp"
  | "rebalance-inventory"
  | "promote-bundles"
  | "improve-checkout"
  | "reduce-returns"
  | "launch-loyalty";

export type NBAActionIntent = "execute" | "review";

export interface NBAActionExperimentConfig {
  title: string;
  application: IncrementalityApplication;
  template: IncrementalityTemplate;
  domainLens: IncrementalityDomainLens;
  hypothesis: string;
  primaryAudienceLabel: string;
  controlAudienceLabel: string;
  impactedCustomerScope: string;
  scopeLabel: string;
  primaryMetric: string;
  treatmentDesign: string;
  controlDesign: string;
}

export interface NBAAction {
  id: NBAActionId;
  title: string;
  segment: string;
  action: string;
  expectedLift: string;
  confidence: number;
  agentReason: string;
  experiment: NBAActionExperimentConfig;
}

export interface ChatFlow {
  triggers: string[];
  agentSteps: string[];
  response: string;
  snapshots: SnapshotType[];
  followUps: string[];
  reportCard?: ReportCardType;
  /** If set, the response includes scenario selection buttons */
  offerScenarios?: boolean;
  /** If set, show NBA action cards after the response. "all" shows all, or a ScenarioId to show scenario-specific ones. */
  showNBACards?: "all" | ScenarioId;
}

export const SCENARIO_META: Record<
  ScenarioId,
  { label: string; description: string; risk: string; outcome: string; budget: string }
> = {
  profit: {
    label: "Maximize Short-Term Profit",
    description: "Focus on high-margin segments and channels to boost revenue within the next quarter.",
    risk: "Medium",
    outcome: "+15% Net Profit",
    budget: "-5% Total Spend",
  },
  acquisition: {
    label: "Aggressive Customer Acquisition",
    description: "Reallocate budget toward broad-reach channels to capture new market share rapidly.",
    risk: "High",
    outcome: "+20% New Users",
    budget: "+15% Total Spend",
  },
  retention: {
    label: "Defend High-Value Segment",
    description: "Increase retention efforts and loyalty incentives for the top 10% of customers.",
    risk: "Low",
    outcome: "-30% Churn Rate",
    budget: "No Change",
  },
};

// ── Welcome prompt cards (icon-based, scenario-focused) ─────────────────────

export type SuggestedPromptDomain = "udp" | "demand" | "campaign" | "platform";

export interface SuggestedPromptCard {
  icon: string; // lucide icon name key
  label: string;
  boldWords?: string[]; // words to bold in the label
  prompt: string; // the actual text sent to the chat
  domain?: SuggestedPromptDomain;
}

export const WELCOME_PROMPT_CARDS: SuggestedPromptCard[] = [
  {
    icon: "BarChart3",
    label: "What is the storm impact on my supply chain?",
    boldWords: ["storm impact", "supply chain"],
    prompt: "What is the storm impact on my supply chain?",
  },
  {
    icon: "TrendingUp",
    label: "Which SKUs are at critical stockout risk?",
    boldWords: ["critical stockout"],
    prompt: "Which SKUs are at critical stockout risk from the blizzard?",
  },
  {
    icon: "Target",
    label: "Show me the emergency reorder plan status.",
    boldWords: ["emergency reorder"],
    prompt: "Show me the emergency reorder plan status",
  },
  {
    icon: "ShieldCheck",
    label: "What is the cold-chain status across our DCs?",
    boldWords: ["cold-chain", "DCs"],
    prompt: "What is the cold-chain status across our DCs?",
  },
  {
    icon: "BarChart3",
    label: "Run the weekly commercial review.",
    boldWords: ["weekly commercial review"],
    prompt: "Run weekly commercial review for last week",
  },
  {
    icon: "AiRecommend",
    label: "What actions is the AI agent recommending right now?",
    boldWords: ["AI agent", "recommending"],
    prompt: "What actions is the AI agent recommending right now?",
  },
  {
    icon: "PieChart",
    label: "How should we plan for post-storm recovery?",
    boldWords: ["post-storm", "recovery"],
    prompt: "How should we plan for post-storm recovery?",
  },
  {
    icon: "Target",
    label: "Which delivery routes are blocked by road closures?",
    boldWords: ["delivery routes", "road closures"],
    prompt: "Which delivery routes are blocked by road closures?",
  },
  {
    icon: "BarChart3",
    label: "What is the on-time delivery rate in the storm zone?",
    boldWords: ["on-time delivery", "storm zone"],
    prompt: "What is the on-time delivery rate in the storm zone?",
  },
];

export const WELCOME_HEADING = "Storm Response — What do you need?";

export const CHAT_PERSONA_OPTIONS: { value: ChatPersona; label: string }[] = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "operations", label: "Operations" },
  { value: "general_user", label: "General user" },
];

export const OPERATIONS_PROMPT_CARDS: SuggestedPromptCard[] = [
  {
    icon: "BarChart3",
    label: "What is the DC operational status across storm zones?",
    boldWords: ["DC operational status", "storm zones"],
    prompt: "What is the DC operational status across storm zones?",
  },
  {
    icon: "BarChart3",
    label: "Which stores need emergency inventory allocation?",
    boldWords: ["stores", "emergency inventory"],
    prompt: "Which stores need emergency inventory allocation?",
  },
  {
    icon: "TrendingUp",
    label: "What is the cold-chain integrity status at Northeast DC?",
    boldWords: ["cold-chain", "Northeast DC"],
    prompt: "What is the cold-chain integrity status at Northeast DC?",
  },
  {
    icon: "Target",
    label: "Prioritize inventory for storm-critical SKUs.",
    boldWords: ["inventory", "storm-critical"],
    prompt: "Which inventory should we prioritize for storm-critical SKUs?",
  },
  {
    icon: "PieChart",
    label: "Summarize fill rate and stock risk across regions.",
    boldWords: ["fill rate", "stock risk"],
    prompt: "Summarize fill rate and stock risk across regions",
  },
  {
    icon: "AiRecommend",
    label: "What operations actions is the AI recommending now?",
    boldWords: ["operations actions", "AI"],
    prompt: "What operations actions is the AI recommending now?",
  },
  {
    icon: "ShieldCheck",
    label: "What is the generator fuel status at storm-impacted DCs?",
    boldWords: ["generator fuel", "DCs"],
    prompt: "What is the generator fuel status at storm-impacted DCs?",
  },
  {
    icon: "Target",
    label: "Check transport network availability in storm zones.",
    boldWords: ["transport network", "storm zones"],
    prompt: "Check transport network availability in storm zones",
  },
  {
    icon: "TrendingUp",
    label: "What is the last-mile delivery capacity after road closures?",
    boldWords: ["last-mile", "road closures"],
    prompt: "What is the last-mile delivery capacity after road closures?",
  },
];

export const GENERAL_USER_PROMPT_CARDS: SuggestedPromptCard[] = [
  {
    icon: "BarChart3",
    label: "Give me a storm impact summary across all operations.",
    boldWords: ["storm impact", "all operations"],
    prompt: "Give me a storm impact summary across all operations",
  },
  {
    icon: "BarChart3",
    label: "What is the overall storm readiness status?",
    boldWords: ["storm readiness"],
    prompt: "What is the overall storm readiness status?",
  },
  {
    icon: "TrendingUp",
    label: "Where are the biggest revenue risks from the storm?",
    boldWords: ["revenue risks", "storm"],
    prompt: "Where are the biggest revenue risks from the storm?",
  },
  {
    icon: "Target",
    label: "What storm response actions should we prioritize?",
    boldWords: ["prioritize"],
    prompt: "What storm response actions should we prioritize?",
  },
  {
    icon: "PieChart",
    label: "Show emergency channel and delivery performance.",
    boldWords: ["emergency channel", "delivery performance"],
    prompt: "Show emergency channel and delivery performance",
  },
  {
    icon: "AiRecommend",
    label: "What is the AI agent recommending at this moment?",
    boldWords: ["AI agent", "recommending"],
    prompt: "What is the AI agent recommending at this moment?",
  },
  {
    icon: "ShieldCheck",
    label: "What are the critical operational risks right now?",
    boldWords: ["operational risks"],
    prompt: "What are the critical operational risks right now?",
  },
];

// ── Next Best Actions ───────────────────────────────────────────────────────

export const ALL_NBA_ACTIONS: NBAAction[] = [
  {
    id: "boost-pmax",
    title: "Boost Google PMAX Budget",
    segment: "High-Intent Shoppers",
    action: "Increase PMAX budget by 30%",
    expectedLift: "+£17K net profit/day",
    confidence: 88,
    agentReason: "MMM shows PMAX is undersaturated — additional spend projects strong incremental returns before hitting diminishing returns threshold.",
    experiment: {
      title: "PMAX Budget Lift Holdout – High Intent",
      application: "campaigns",
      template: "geo_lift",
      domainLens: "udp",
      hypothesis:
        "Increasing PMAX budget for high-intent shoppers will improve incremental revenue without violating ROAS guardrails.",
      primaryAudienceLabel: "High-intent shoppers eligible for PMAX expansion",
      controlAudienceLabel: "Matched PMAX holdout audience at current spend",
      impactedCustomerScope: "214K high-intent prospects across paid search and shopping journeys",
      scopeLabel: "Google PMAX budget expansion",
      primaryMetric: "Incremental ROAS",
      treatmentDesign: "Scenario A increases PMAX budget by 30% for high-intent shoppers with CPA and ROAS guardrails enabled.",
      controlDesign: "Holdout keeps PMAX spend at the current baseline to isolate incremental return.",
    },
  },
  {
    id: "suppress-fb",
    title: "Suppress Facebook Awareness Spend",
    segment: "Broad Awareness Audience",
    action: "Pause Facebook Awareness campaigns",
    expectedLift: "£2K/day savings",
    confidence: 91,
    agentReason: "Zero attributed conversions for 6 consecutive weeks. Model confidence is high that this spend is non-incremental.",
    experiment: {
      title: "Facebook Awareness Suppression Test – Broad Reach",
      application: "campaigns",
      template: "holdout",
      domainLens: "udp",
      hypothesis:
        "Suppressing broad Facebook awareness spend will reduce waste while preserving downstream demand in high-intent cohorts.",
      primaryAudienceLabel: "Broad awareness audience exposed to Meta top-of-funnel spend",
      controlAudienceLabel: "Matched awareness holdout kept on current Meta delivery",
      impactedCustomerScope: "1.2M upper-funnel shoppers in broad awareness pools",
      scopeLabel: "Meta awareness suppression",
      primaryMetric: "Media efficiency improvement",
      treatmentDesign: "Scenario A pauses Facebook awareness ad sets and reallocates reserve budget away from non-incremental impressions.",
      controlDesign: "Holdout retains current awareness delivery so brand-search and assisted-demand effects can be measured.",
    },
  },
  {
    id: "launch-winback",
    title: "Launch Win-Back Campaign",
    segment: "512 At-Risk High-LTV Customers",
    action: "Deploy email + retargeting win-back",
    expectedLift: "18% recovery in 14 days",
    confidence: 94,
    agentReason: "Churn model identified 512 high-LTV customers with 38-day purchase gap. Personalized win-back has highest projected ROI.",
    experiment: {
      title: "Win-Back Recovery Split – At-Risk High LTV",
      application: "campaigns",
      template: "audience_split",
      domainLens: "udp",
      hypothesis:
        "A personalized win-back journey will recover more high-LTV customers than the current generic retention cadence.",
      primaryAudienceLabel: "512 at-risk high-LTV customers with a 38-day purchase gap",
      controlAudienceLabel: "High-LTV holdout cohort kept on the current retention journey",
      impactedCustomerScope: "High-value loyalty profiles with churn risk and consent-safe email eligibility",
      scopeLabel: "Win-back recovery journey",
      primaryMetric: "Purchase recovery rate",
      treatmentDesign: "Scenario A launches a personalized win-back email and retargeting sequence to the at-risk high-LTV segment.",
      controlDesign: "Holdout preserves the existing retention treatment to isolate recovery lift.",
    },
  },
];

export const MERCHANDISER_NBA_ACTIONS: NBAAction[] = [
  {
    id: "optimize-pdp",
    title: "Optimize PDP for Top Return SKU",
    segment: "High-traffic apparel detail pages",
    action: "Update sizing module + fit guidance on PDP",
    expectedLift: "-1.8pp return rate",
    confidence: 86,
    agentReason: "Fit-related returns are concentrated on top-traffic SKUs. PDP sizing guidance has highest expected impact with minimal operational risk.",
    experiment: {
      title: "PDP Experience Split – Return-Prone SKUs",
      application: "customer_insights",
      template: "audience_split",
      domainLens: "udp",
      hypothesis:
        "Publishing richer fit guidance and product detail content will reduce avoidable returns without harming conversion rate.",
      primaryAudienceLabel: "High-traffic visitors on return-prone apparel PDPs",
      controlAudienceLabel: "Matched PDP traffic holdout on the current page experience",
      impactedCustomerScope: "Top-return apparel shoppers across 12 priority PDPs",
      scopeLabel: "PDP remediation for return-prone SKUs",
      primaryMetric: "Return-rate delta",
      treatmentDesign: "Scenario A shows enhanced fit guidance, updated size notes, and richer content on priority PDPs.",
      controlDesign: "Holdout keeps the current PDP experience to measure return-rate and conversion deltas.",
    },
  },
  {
    id: "rebalance-inventory",
    title: "Rebalance Inventory to High Demand Regions",
    segment: "Footwear and outerwear best sellers",
    action: "Transfer inventory from low-demand to high-demand regions",
    expectedLift: "+6.4% sell-through",
    confidence: 89,
    agentReason: "Regional demand imbalance is causing missed conversions and markdown pressure. Rebalancing reduces stockout risk on fast movers.",
    experiment: {
      title: "Regional Demand Rebalance Test – Fast Movers",
      application: "demand",
      template: "geo_lift",
      domainLens: "demand",
      hypothesis:
        "Rebalancing inventory into high-demand regions will improve sell-through and protect demand conversion on fast-moving categories.",
      primaryAudienceLabel: "Demand-heavy regions for footwear and outerwear best sellers",
      controlAudienceLabel: "Baseline region set kept on the current inventory posture",
      impactedCustomerScope: "Regional demand cohorts shopping fast-moving footwear and outerwear",
      scopeLabel: "Regional inventory rebalance",
      primaryMetric: "Sell-through lift",
      treatmentDesign: "Scenario A shifts inventory into demand-heavy regions to protect availability for best sellers.",
      controlDesign: "Holdout keeps the current regional inventory footprint to compare sell-through and stockout effects.",
    },
  },
  {
    id: "promote-bundles",
    title: "Promote Bundle Cross-Sells",
    segment: "Basket builders on product pages",
    action: "Pin accessory bundles on top 20 product pages",
    expectedLift: "+4.9% AOV",
    confidence: 83,
    agentReason: "Bundle affinity analysis shows strong co-purchase signals for accessories. Above-the-fold placement has projected AOV lift.",
    experiment: {
      title: "Bundle Attach Test – Basket Builders",
      application: "campaigns",
      template: "audience_split",
      domainLens: "udp",
      hypothesis:
        "Pinned bundle placements for basket builders will increase attach rate and AOV versus the current recommendation stack.",
      primaryAudienceLabel: "Basket builders on top-traffic PDP and cart journeys",
      controlAudienceLabel: "Matched bundle holdout served the current recommendation layout",
      impactedCustomerScope: "Customers showing multi-item purchase intent on top 20 product pages",
      scopeLabel: "Bundle cross-sell optimization",
      primaryMetric: "Attach-rate lift",
      treatmentDesign: "Scenario A promotes curated accessory bundles in the highest-visibility recommendation slots.",
      controlDesign: "Holdout preserves the current cross-sell ranking to measure attach-rate and AOV delta.",
    },
  },
];

export const GENERAL_USER_NBA_ACTIONS: NBAAction[] = [
  {
    id: "improve-checkout",
    title: "Improve Checkout Completion",
    segment: "Mobile checkout users",
    action: "Enable express payment defaults for mobile checkout",
    expectedLift: "+1.1pp conversion",
    confidence: 85,
    agentReason: "Checkout drop-off is highest on mobile payment step. Streamlined payment defaults are projected to improve completion rates.",
    experiment: {
      title: "Checkout Completion Split – Mobile Express Pay",
      application: "customer_insights",
      template: "activation_readiness",
      domainLens: "udp",
      hypothesis:
        "Promoting express payment defaults on mobile checkout will improve completion rate without increasing payment failures.",
      primaryAudienceLabel: "Mobile checkout users eligible for express payment",
      controlAudienceLabel: "Mobile checkout holdout kept on the current payment-step layout",
      impactedCustomerScope: "Mobile shoppers reaching the payment step during peak conversion windows",
      scopeLabel: "Mobile checkout experience test",
      primaryMetric: "Checkout completion rate",
      treatmentDesign: "Scenario A surfaces express payment options first and streamlines mobile payment defaults.",
      controlDesign: "Holdout retains the current mobile checkout payment flow for baseline comparison.",
    },
  },
  {
    id: "reduce-returns",
    title: "Reduce Returns on Key Categories",
    segment: "High-return fashion categories",
    action: "Deploy fit guidance and return-risk alerts",
    expectedLift: "-0.9pp return rate",
    confidence: 81,
    agentReason: "Return drivers are concentrated in specific categories. Guidance and pre-purchase alerts reduce avoidable returns.",
    experiment: {
      title: "Return Risk Guidance Test – Key Categories",
      application: "customer_insights",
      template: "activation_readiness",
      domainLens: "udp",
      hypothesis:
        "Return-risk messaging and fit guidance will lower avoidable returns in high-risk categories without suppressing demand.",
      primaryAudienceLabel: "Shoppers browsing high-return fashion categories",
      controlAudienceLabel: "Matched category holdout kept on the current product guidance",
      impactedCustomerScope: "Fashion-category shoppers exposed to high-return assortments",
      scopeLabel: "Return-risk guidance rollout",
      primaryMetric: "Return-rate reduction",
      treatmentDesign: "Scenario A enables pre-purchase return-risk prompts and fit guidance for high-return category traffic.",
      controlDesign: "Holdout preserves the existing product guidance experience for baseline measurement.",
    },
  },
  {
    id: "launch-loyalty",
    title: "Launch Loyalty Reactivation Push",
    segment: "Dormant repeat buyers",
    action: "Send reactivation offers to dormant loyalty members",
    expectedLift: "+7.3% repeat orders",
    confidence: 88,
    agentReason: "Dormant loyalty cohort has high historical conversion elasticity. Short-cycle offer sequence drives strong repeat purchase recovery.",
    experiment: {
      title: "Loyalty Reactivation Holdout – Dormant Buyers",
      application: "audiences",
      template: "holdout",
      domainLens: "udp",
      hypothesis:
        "A coordinated email and push reactivation sequence will lift repeat-order recovery among dormant loyalty buyers without breaching fatigue guardrails.",
      primaryAudienceLabel: "Dormant repeat buyers eligible for loyalty reactivation",
      controlAudienceLabel: "Dormant loyalty holdout kept on the current CRM baseline",
      impactedCustomerScope: "18.4K dormant repeat buyers with consent-safe email and push permissions",
      scopeLabel: "Loyalty reactivation sequence",
      primaryMetric: "Repeat-order recovery",
      treatmentDesign: "Scenario A launches the full loyalty reactivation sequence across email and push for dormant repeat buyers.",
      controlDesign: "Holdout preserves the current CRM baseline to isolate repeat-order lift and fatigue impact.",
    },
  },
];

export const ALL_NBA_ACTIONS_BY_PERSONA: Record<ChatPersona, NBAAction[]> = {
  ecommerce: ALL_NBA_ACTIONS,
  operations: MERCHANDISER_NBA_ACTIONS,
  general_user: GENERAL_USER_NBA_ACTIONS,
};

export const SCENARIO_NBAS: Record<ScenarioId, NBAActionId[]> = {
  profit: ["boost-pmax", "suppress-fb"],
  acquisition: ["boost-pmax", "launch-winback"],
  retention: ["launch-winback", "suppress-fb"],
};

export const PERSONA_SCENARIO_NBAS: Record<ChatPersona, Record<ScenarioId, NBAActionId[]>> = {
  ecommerce: SCENARIO_NBAS,
  operations: {
    profit: ["rebalance-inventory", "promote-bundles"],
    acquisition: ["promote-bundles", "optimize-pdp"],
    retention: ["optimize-pdp", "rebalance-inventory"],
  },
  general_user: {
    profit: ["improve-checkout", "reduce-returns"],
    acquisition: ["launch-loyalty", "improve-checkout"],
    retention: ["reduce-returns", "launch-loyalty"],
  },
};

export const EXECUTION_FLOWS: Record<NBAActionId, ChatFlow> = {
  "boost-pmax": {
    triggers: [
      "execute boost google pmax budget",
      "run boost google pmax budget",
      "execute boost pmax",
    ],
    agentSteps: [
      "Validating budget headroom and constraints",
      "Submitting +30% budget increase to Google Ads",
      "Configuring performance monitoring rules",
      "Activating anomaly detection agent",
    ],
    response:
      "The PMAX budget increase has been **executed successfully**. Here's what was activated:\n\n• **Budget change**: +30% increase submitted to Google Ads API — live in 15 minutes\n• **Monitoring rules**: CPA ceiling of £18 and ROAS floor of 2.5x configured\n• **Anomaly detection**: Agent will flag any performance deviation > 15% within the first 24 hours\n• **Auto-rollback**: If ROAS drops below 2.0x for 4 consecutive hours, budget will auto-revert\n\nThe agent is now actively monitoring this change. I'll alert you if any anomalies are detected.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Show me projected impact now",
      "Show the full dashboard",
    ],
  },
  "suppress-fb": {
    triggers: [
      "execute suppress facebook awareness spend",
      "run suppress facebook awareness spend",
      "execute suppress fb",
    ],
    agentSteps: [
      "Validating campaign dependencies",
      "Pausing Facebook Awareness ad sets",
      "Reallocating freed budget to reserve pool",
      "Activating spend monitoring agent",
    ],
    response:
      "Facebook Awareness suppression has been **executed successfully**. Here's what was activated:\n\n• **Campaign pause**: All Facebook Awareness ad sets paused effective immediately\n• **Budget freed**: £2K/day moved to reserve pool for reallocation\n• **Monitoring**: Agent tracking any downstream impact on brand search volume\n• **Reactivation trigger**: If brand search drops > 10% in 7 days, agent will recommend reactivation\n\nThe agent is now monitoring brand metrics to ensure no negative side effects.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Reallocate the freed budget to PMAX",
      "Show the full dashboard",
    ],
  },
  "launch-winback": {
    triggers: [
      "execute launch win back campaign",
      "run launch win back campaign",
      "execute launch winback",
    ],
    agentSteps: [
      "Building audience segment from churn model",
      "Matching creative assets to customer profiles",
      "Configuring email sequences and retargeting rules",
      "Deploying campaign to execution pipeline",
    ],
    response:
      "The win-back campaign has been **executed successfully**. Here's what was activated:\n\n• **Audience**: 512 at-risk high-LTV customers segmented and loaded\n• **Email sequence**: 3-touch personalized email series scheduled over 14 days\n• **Retargeting**: Paid social retargeting activated for non-openers after 48 hours\n• **Success metric**: Tracking purchase recovery rate with 18% target\n\nThe agent is monitoring open rates, click-throughs, and purchase conversions in real time.",
    snapshots: ["nba-execution"],
    followUps: [
      "What is the agent monitoring?",
      "Execute another recommended action",
      "Show me the audience segment details",
      "Show the full dashboard",
    ],
  },
  "optimize-pdp": {
    triggers: [
      "execute optimize pdp for top return sku",
      "run optimize pdp for top return sku",
      "execute optimize pdp",
    ],
    agentSteps: [
      "Identifying highest-return product pages",
      "Applying fit guidance module updates",
      "Publishing updated PDP templates",
      "Starting return-rate monitoring",
    ],
    response:
      "PDP optimization has been **executed successfully** for high-return products. Here's what was activated:\n\n• **Template update**: Fit guidance module deployed to top return-prone SKUs\n• **Content sync**: Size charts and material notes updated from catalog metadata\n• **Monitoring**: Return-rate and conversion deltas now tracked at SKU level\n• **Safeguard**: Agent will rollback template changes if conversion drops by >8%\n\nThe merchandising optimization is now live and under active monitoring.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show return-rate impact forecast",
      "Execute another recommended action",
      "Show me merchandising performance",
    ],
  },
  "rebalance-inventory": {
    triggers: [
      "execute rebalance inventory to high demand regions",
      "run rebalance inventory to high demand regions",
      "execute rebalance inventory",
    ],
    agentSteps: [
      "Calculating regional demand imbalance",
      "Building stock transfer recommendations",
      "Submitting transfer plan to fulfillment operations",
      "Activating stockout-risk monitoring",
    ],
    response:
      "Inventory rebalance has been **executed successfully**. Here's what was activated:\n\n• **Reallocation plan**: Stock moved from low-demand to high-demand regions\n• **Priority SKUs**: Outerwear and footwear fast movers received first allocation\n• **Monitoring**: Stockout risk and sell-through trend tracking enabled\n• **Escalation**: Agent will alert if critical SKUs fall below threshold in any region\n\nInventory health is now being monitored in real time.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show regional stock risk now",
      "Execute another recommended action",
      "What else should merchandisers prioritize?",
    ],
  },
  "promote-bundles": {
    triggers: [
      "execute promote bundle cross sells",
      "run promote bundle cross sells",
      "execute promote bundles",
    ],
    agentSteps: [
      "Identifying high-affinity product combinations",
      "Configuring bundle placements on key pages",
      "Publishing bundle merchandising rules",
      "Starting AOV uplift monitoring",
    ],
    response:
      "Bundle promotion has been **executed successfully**. Here's what was activated:\n\n• **Bundle setup**: Top accessory bundles now pinned on 20 high-traffic product pages\n• **Placement logic**: Dynamic bundle prioritization enabled by affinity score\n• **Monitoring**: AOV and attach-rate tracking activated\n• **Fallback**: Agent will rotate bundle pairings if attach rate underperforms\n\nBundle performance is now under continuous optimization.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show bundle attach-rate forecast",
      "Execute another recommended action",
      "Show me product performance",
    ],
  },
  "improve-checkout": {
    triggers: [
      "execute improve checkout completion",
      "run improve checkout completion",
      "execute improve checkout",
    ],
    agentSteps: [
      "Validating checkout funnel drop-off points",
      "Applying express payment default configuration",
      "Publishing checkout UX changes",
      "Starting conversion delta monitoring",
    ],
    response:
      "Checkout improvement has been **executed successfully**. Here's what was activated:\n\n• **Payment defaults**: Express payment options prioritized on mobile checkout\n• **UX optimization**: Friction points reduced on the payment step\n• **Monitoring**: Conversion completion and abandonment now tracked hourly\n• **Guardrail**: Agent will rollback if payment failure rate rises unexpectedly\n\nCheckout performance is now being actively monitored.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show checkout conversion trend",
      "Execute another recommended action",
      "What is the next biggest friction point?",
    ],
  },
  "reduce-returns": {
    triggers: [
      "execute reduce returns on key categories",
      "run reduce returns on key categories",
      "execute reduce returns",
    ],
    agentSteps: [
      "Identifying top return drivers by category",
      "Publishing return-risk guidance blocks",
      "Activating product-level return alerts",
      "Starting return-rate impact tracking",
    ],
    response:
      "Return reduction workflow has been **executed successfully**. Here's what was activated:\n\n• **Risk guidance**: Return-risk messages enabled on high-risk categories\n• **Product updates**: Fit and product-detail quality checks published\n• **Monitoring**: Category return-rate deltas tracked daily\n• **Escalation**: Agent will flag SKUs with worsening post-change return rates\n\nReturns performance is now being monitored with active alerts.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show category return risks",
      "Execute another recommended action",
      "What products need immediate changes?",
    ],
  },
  "launch-loyalty": {
    triggers: [
      "execute launch loyalty reactivation push",
      "run launch loyalty reactivation push",
      "execute launch loyalty",
    ],
    agentSteps: [
      "Scoring dormant loyalty cohort",
      "Configuring reactivation offer sequence",
      "Publishing email and push campaign",
      "Starting repeat-order monitoring",
    ],
    response:
      "Loyalty reactivation has been **executed successfully**. Here's what was activated:\n\n• **Audience loaded**: Dormant repeat buyers segmented and targeted\n• **Offer sequence**: Multi-step reactivation campaign launched\n• **Monitoring**: Repeat-order recovery and redemption metrics now tracked\n• **Safety control**: Agent will pause the sequence if unsubscribe rate spikes\n\nLoyalty recovery performance is now live and monitored.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show loyalty recovery forecast",
      "Execute another recommended action",
      "What segment should we prioritize next?",
    ],
  },
};

export const REVIEW_REQUEST_FLOWS: ChatFlow[] = [
  {
    triggers: ["send boost google pmax budget for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for PMAX budget action",
      "Sending request to marketing admin queue",
    ],
    response:
      "Review request submitted for **Boost Google PMAX Budget**. A marketing admin has been notified and can approve execution from the AI actions queue.",
    snapshots: ["dashboard"],
    followUps: [
      "What is the expected impact if approved?",
      "Show all pending AI actions",
      "Open the dashboard",
    ],
  },
  {
    triggers: ["send suppress facebook awareness spend for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for Facebook suppression",
      "Sending request to marketing admin queue",
    ],
    response:
      "Review request submitted for **Suppress Facebook Awareness Spend**. The action is now awaiting admin approval.",
    snapshots: ["dashboard"],
    followUps: [
      "Show all pending AI actions",
      "What budget would this free up?",
      "Open campaigns",
    ],
  },
  {
    triggers: ["send launch win back campaign for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for win-back campaign",
      "Sending request to marketing admin queue",
    ],
    response:
      "Review request submitted for **Launch Win-Back Campaign**. The proposal has been queued for approval.",
    snapshots: ["audiences"],
    followUps: [
      "Show all pending AI actions",
      "Show win-back segment details",
      "Open customers",
    ],
  },
  {
    triggers: ["send optimize pdp for top return sku for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for PDP optimization",
      "Sending request to merchandising admin queue",
    ],
    response:
      "Review request submitted for **Optimize PDP for Top Return SKU**. Merchandising approval is now pending.",
    snapshots: ["mmm"],
    followUps: [
      "Show all pending AI actions",
      "Show projected return-rate impact",
      "Open MMM",
    ],
  },
  {
    triggers: ["send rebalance inventory to high demand regions for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for inventory rebalance",
      "Sending request to merchandising admin queue",
    ],
    response:
      "Review request submitted for **Rebalance Inventory to High Demand Regions**. The transfer plan is queued for approval.",
    snapshots: ["dashboard"],
    followUps: [
      "Show all pending AI actions",
      "Show regional stock risk now",
      "Open dashboard",
    ],
  },
  {
    triggers: ["send promote bundle cross sells for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for bundle promotion",
      "Sending request to merchandising admin queue",
    ],
    response:
      "Review request submitted for **Promote Bundle Cross-Sells**. The action is now awaiting admin approval.",
    snapshots: ["campaigns"],
    followUps: [
      "Show all pending AI actions",
      "What uplift is expected if approved?",
      "Open campaigns",
    ],
  },
  {
    triggers: ["send improve checkout completion for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for checkout improvement",
      "Sending request to marketing admin queue",
    ],
    response:
      "Review request submitted for **Improve Checkout Completion**. The action has been queued for approval.",
    snapshots: ["analytics"],
    followUps: [
      "Show all pending AI actions",
      "Open analytics",
      "What is the expected conversion lift?",
    ],
  },
  {
    triggers: ["send reduce returns on key categories for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for return reduction",
      "Sending request to service admin queue",
    ],
    response:
      "Review request submitted for **Reduce Returns on Key Categories**. The proposal is now awaiting approval.",
    snapshots: ["reports"],
    followUps: [
      "Show all pending AI actions",
      "Open reports",
      "Show projected return-rate impact",
    ],
  },
  {
    triggers: ["send launch loyalty reactivation push for review"],
    agentSteps: [
      "Validating review policy and approver routing",
      "Creating review request for loyalty reactivation",
      "Sending request to marketing admin queue",
    ],
    response:
      "Review request submitted for **Launch Loyalty Reactivation Push**. The request is pending admin approval.",
    snapshots: ["customers"],
    followUps: [
      "Show all pending AI actions",
      "Open customers",
      "What segment will this target?",
    ],
  },
];

const REVIEW_TRIGGER_BY_ACTION_ID: Partial<Record<NBAActionId, string>> = {
  "boost-pmax": "send boost google pmax budget for review",
  "suppress-fb": "send suppress facebook awareness spend for review",
  "launch-winback": "send launch win back campaign for review",
  "optimize-pdp": "send optimize pdp for top return sku for review",
  "rebalance-inventory": "send rebalance inventory to high demand regions for review",
  "promote-bundles": "send promote bundle cross sells for review",
  "improve-checkout": "send improve checkout completion for review",
  "reduce-returns": "send reduce returns on key categories for review",
  "launch-loyalty": "send launch loyalty reactivation push for review",
};

// ── Scenario response flows (triggered when user selects a scenario) ────────

export const SCENARIO_FLOWS: Record<ScenarioId, ChatFlow> = {
  profit: {
    triggers: [],
    agentSteps: [
      "Running MMM profit optimization model",
      "Computing channel saturation curves",
      "Projecting revenue impact over 12 weeks",
      "Generating budget reallocation plan",
    ],
    response:
      "Here's the projected impact of the **Maximize Short-Term Profit** scenario. The model recommends increasing Google PMAX budget by 30% and suppressing Facebook Awareness spend entirely. This projects a **+£17K net profit/day** improvement with an overall **+15% net profit** over the next quarter. The chart below shows your current trajectory versus the projected outcome with these changes applied.",
    snapshots: ["current-state", "scenario-profit"],
    followUps: [],
    showNBACards: "profit" as ScenarioId,
  },
  acquisition: {
    triggers: [],
    agentSteps: [
      "Running customer acquisition model",
      "Analyzing untapped market regions",
      "Projecting new user growth over 12 weeks",
      "Generating channel expansion plan",
    ],
    response:
      "Here's the projected impact of the **Aggressive Customer Acquisition** scenario. The model recommends launching TikTok TOF campaigns targeting 18-34 demographics in underserved northern regions, plus expanding Google Discovery Ads in the Midlands. This projects **+20% new users** with an estimated **+8.2K new prospects/week**. The chart below compares your current business trajectory against the projected growth.",
    snapshots: ["current-state", "scenario-acquisition"],
    followUps: [],
    showNBACards: "acquisition" as ScenarioId,
  },
  retention: {
    triggers: [],
    agentSteps: [
      "Running churn prediction model",
      "Identifying at-risk high-LTV customers",
      "Projecting retention impact over 12 weeks",
      "Generating win-back campaign plan",
    ],
    response:
      "Here's the projected impact of the **Defend High-Value Segment** scenario. The model has identified **512 at-risk high-LTV customers** with a 38-day purchase gap. A personalized win-back campaign via email + paid retargeting is projected to recover **18% within 14 days** and reduce overall churn by **30%**. The chart below shows your current revenue trajectory versus the projected outcome with retention actions applied.",
    snapshots: ["current-state", "scenario-retention"],
    followUps: [],
    showNBACards: "retention" as ScenarioId,
  },
};

export const MERCHANDISER_SCENARIO_META: Record<
  ScenarioId,
  { label: string; description: string; risk: string; outcome: string; budget: string }
> = {
  profit: {
    label: "Increase Sell-Through Efficiency",
    description: "Focus on inventory allocation and product placement to maximize sell-through with controlled markdown risk.",
    risk: "Medium",
    outcome: "+6.4% Sell-through",
    budget: "No Change",
  },
  acquisition: {
    label: "Boost Product Discovery",
    description: "Expand cross-sell placements and on-site merchandising to increase discovery for high-potential categories.",
    risk: "Low",
    outcome: "+4.9% AOV",
    budget: "+3% Merchandising Spend",
  },
  retention: {
    label: "Reduce Return-Driven Churn",
    description: "Optimize PDP clarity and fit guidance to lower returns and improve repeat purchase confidence.",
    risk: "Low",
    outcome: "-1.8pp Return Rate",
    budget: "No Change",
  },
};

export const GENERAL_USER_SCENARIO_META: Record<
  ScenarioId,
  { label: string; description: string; risk: string; outcome: string; budget: string }
> = {
  profit: {
    label: "Improve Checkout Efficiency",
    description: "Reduce checkout friction to recover conversion and maximize short-term revenue impact.",
    risk: "Low",
    outcome: "+1.1pp Conversion",
    budget: "No Change",
  },
  acquisition: {
    label: "Reactivate High-Value Demand",
    description: "Recover dormant buyers through targeted loyalty reactivation campaigns.",
    risk: "Medium",
    outcome: "+7.3% Repeat Orders",
    budget: "+4% CRM Spend",
  },
  retention: {
    label: "Lower Returns & Service Load",
    description: "Reduce avoidable returns to improve margin and operational stability.",
    risk: "Low",
    outcome: "-0.9pp Return Rate",
    budget: "No Change",
  },
};

export const MERCHANDISER_SCENARIO_FLOWS: Record<ScenarioId, ChatFlow> = {
  profit: {
    triggers: [],
    agentSteps: [
      "Analyzing sell-through velocity by category",
      "Detecting regional inventory imbalance",
      "Projecting markdown avoidance impact",
      "Generating merchandising action plan",
    ],
    response:
      "Here's the projected impact of the **Increase Sell-Through Efficiency** scenario. The model recommends inventory rebalancing toward high-demand regions and prioritized placement for fast movers. This projects **+6.4% sell-through** and lower markdown pressure over the next cycle.",
    snapshots: ["current-state", "scenario-profit"],
    followUps: [],
    showNBACards: "profit",
  },
  acquisition: {
    triggers: [],
    agentSteps: [
      "Evaluating product discovery pathways",
      "Identifying high-affinity bundle opportunities",
      "Projecting basket uplift from placement changes",
      "Generating onsite merchandising plan",
    ],
    response:
      "Here's the projected impact of the **Boost Product Discovery** scenario. The model recommends expanding bundle placements and featured collections on high-traffic pages. This projects **+4.9% AOV** with stronger product discovery across priority categories.",
    snapshots: ["current-state", "scenario-acquisition"],
    followUps: [],
    showNBACards: "acquisition",
  },
  retention: {
    triggers: [],
    agentSteps: [
      "Analyzing return-driver patterns",
      "Flagging high-risk product detail pages",
      "Projecting return reduction with content changes",
      "Generating PDP optimization plan",
    ],
    response:
      "Here's the projected impact of the **Reduce Return-Driven Churn** scenario. The model identified high-return SKUs where improved fit guidance can cut return risk. The projected outcome is **-1.8pp return rate**, supporting stronger retention and improved margin.",
    snapshots: ["current-state", "scenario-retention"],
    followUps: [],
    showNBACards: "retention",
  },
};

export const GENERAL_USER_SCENARIO_FLOWS: Record<ScenarioId, ChatFlow> = {
  profit: {
    triggers: [],
    agentSteps: [
      "Reviewing checkout funnel drop-off",
      "Modeling conversion uplift from friction fixes",
      "Projecting revenue impact over 8 weeks",
      "Preparing execution recommendation",
    ],
    response:
      "Here's the projected impact of the **Improve Checkout Efficiency** scenario. The model recommends reducing checkout friction for mobile users and enabling express payment defaults. This projects **+1.1pp conversion** and immediate revenue uplift.",
    snapshots: ["current-state", "scenario-profit"],
    followUps: [],
    showNBACards: "profit",
  },
  acquisition: {
    triggers: [],
    agentSteps: [
      "Scoring dormant high-value customers",
      "Modeling reactivation response rates",
      "Projecting repeat-order recovery",
      "Generating loyalty activation plan",
    ],
    response:
      "Here's the projected impact of the **Reactivate High-Value Demand** scenario. The model recommends a loyalty reactivation sequence for dormant repeat buyers. This projects **+7.3% repeat orders** with measurable short-term revenue recovery.",
    snapshots: ["current-state", "scenario-acquisition"],
    followUps: [],
    showNBACards: "acquisition",
  },
  retention: {
    triggers: [],
    agentSteps: [
      "Analyzing category-level return burden",
      "Estimating operational savings from return reduction",
      "Modeling customer experience impact",
      "Preparing mitigation actions",
    ],
    response:
      "Here's the projected impact of the **Lower Returns & Service Load** scenario. The model recommends return-risk guidance and category quality interventions. The projected outcome is **-0.9pp return rate** with improved retention and lower support load.",
    snapshots: ["current-state", "scenario-retention"],
    followUps: [],
    showNBACards: "retention",
  },
};

// ── Standard conversation flows ─────────────────────────────────────────────

const WEEKLY_COMMERCIAL_REVIEW_FLOW: ChatFlow = {
  triggers: [
    "run weekly commercial review for last week",
    "monday trading",
    "weekly commercial review",
    "trading review",
    "last week commercial review",
  ],
  agentSteps: [
    "Resolving last-week Monday-Sunday trading window",
    "Comparing weekly commercial KPIs against prior week and last year",
    "Ranking market and paid channel performance",
    "Generating Monday trading discussion flags",
  ],
  response:
    "I ran the **Weekly Commercial Review** for **09 Mar – 15 Mar, 2026**. **Gross sales** closed at **£1.82M** (**-4.8% WoW**, **+18.6% YoY**), **new customer acquisition** softened to **12.4K** with **CAC up to £28.40 (+12.8% WoW)**, and **North of England** was the **strongest market** at **£438K gross sales (+9.4% WoW)**. I\'ve generated the KPI table, market breakdown, paid channel performance, gross sales trend, and Monday trading discussion flags below.",
  snapshots: ["mmm"],
  followUps: [
    "Which paid channels are driving the CAC increase?",
    "Show me the strongest and weakest markets from last week",
    "What should we discuss in Monday trading based on this review?",
  ],
  reportCard: "weekly-commercial-review",
};

export const CHAT_FLOWS: ChatFlow[] = [
  WEEKLY_COMMERCIAL_REVIEW_FLOW,
  // ── Scenario / profit triggers ──────────────────────────────────────────
  {
    triggers: ["maximize profit", "short-term profit", "maximizing profit", "optimize channel spend", "optimizing channel spend"],
    agentSteps: SCENARIO_FLOWS.profit.agentSteps,
    response: SCENARIO_FLOWS.profit.response,
    snapshots: SCENARIO_FLOWS.profit.snapshots,
    followUps: SCENARIO_FLOWS.profit.followUps,
    showNBACards: SCENARIO_FLOWS.profit.showNBACards,
  },
  // ── Scenario / acquisition triggers ─────────────────────────────────────
  {
    triggers: ["customer acquisition", "new users", "grow", "growth", "untapped", "new markets"],
    agentSteps: SCENARIO_FLOWS.acquisition.agentSteps,
    response: SCENARIO_FLOWS.acquisition.response,
    snapshots: SCENARIO_FLOWS.acquisition.snapshots,
    followUps: SCENARIO_FLOWS.acquisition.followUps,
    showNBACards: SCENARIO_FLOWS.acquisition.showNBACards,
  },
  // ── Scenario / retention triggers ───────────────────────────────────────
  {
    triggers: ["retention", "churn", "defend", "high-value", "win-back", "retain"],
    agentSteps: SCENARIO_FLOWS.retention.agentSteps,
    response: SCENARIO_FLOWS.retention.response,
    snapshots: SCENARIO_FLOWS.retention.snapshots,
    followUps: SCENARIO_FLOWS.retention.followUps,
    showNBACards: SCENARIO_FLOWS.retention.showNBACards,
  },
  // ── Agentic action triggers ─────────────────────────────────────────────
  {
    triggers: ["activate", "launch", "deploy", "execute", "start campaign", "turn on"],
    agentSteps: [
      "Validating action prerequisites",
      "Checking budget headroom",
      "Preparing campaign configuration",
      "Submitting to execution pipeline",
    ],
    response:
      "The agentic AI is now **executing** the requested action. Here's what's happening:\n\n• **Budget reallocation** has been submitted to the campaign management system\n• **Audience targeting** rules are being applied to the new segments\n• **Creative assets** are being matched to the campaign objectives\n• **Monitoring agents** are standing by to track early performance signals\n\nThe pipeline will report back within 24 hours with initial performance metrics. I'll flag any anomalies automatically.",
    snapshots: ["campaigns"],
    followUps: [
      "Show me the current campaign status",
      "What other actions can we take?",
      "What is the AI monitoring right now?",
      "Show the full dashboard",
    ],
  },
  // ── Agent recommendations trigger (shows NBA cards) ─────────────────────
  {
    triggers: ["agent recommend", "ai agent", "recommending", "what actions", "next best", "another recommended action", "execute another"],
    agentSteps: [
      "Polling agentic workflow pipeline",
      "Evaluating pending recommendations",
      "Ranking by projected impact",
      "Formatting action queue",
    ],
    response:
      "The agentic AI currently has **3 active recommendations** queued for your review. Each action below has been ranked by projected impact and model confidence. You can **execute any action directly** from the cards below.",
    snapshots: [],
    followUps: [],
    showNBACards: "all",
  },
  // ── "Model the impact" / scenario overview trigger ──────────────────────
  {
    triggers: [
      "model the impact", "model the profit", "scenario", "scenarios",
      "business scenario", "what can we do", "what should we do", "options",
      "strategies", "strategic", "what business scenarios", "propose",
      "recommendations",
    ],
    agentSteps: [
      "Aggregating cross-channel metrics",
      "Evaluating current business trajectory",
      "Computing scenario projections",
      "Preparing strategic recommendations",
    ],
    response:
      "Here's where your marketing stands today. Total revenue is up **12% month-over-month** with a blended ROAS of **2.8x** across all channels. You have **8 active campaigns** reaching **45.2K** customers at a **3.8% conversion rate**.\n\nBased on current data, I've identified **3 strategic scenarios** the agentic AI can model for you. Each shows what tomorrow could look like with optimized budget allocation and targeting. Select a scenario below to see the projected impact.",
    snapshots: ["current-state"],
    followUps: [],
    offerScenarios: true,
  },
  // ── Monitoring / agent status ───────────────────────────────────────────
  {
    triggers: ["monitoring", "what is the ai monitoring", "agent status", "pipeline status"],
    agentSteps: [
      "Querying agent monitoring dashboard",
      "Checking active pipelines",
      "Summarizing agent activity",
    ],
    response:
      "Here's what the agentic AI is actively monitoring right now:\n\n• **Campaign performance** — tracking 8 active campaigns for anomalies in CTR, CPC, and conversion rate\n• **Channel saturation** — MMM model updates every 6 hours, watching for diminishing returns\n• **Audience drift** — monitoring segment composition for unexpected shifts\n• **Budget pacing** — ensuring daily spend stays within guardrails across all channels\n\nNo anomalies detected in the last 24 hours. The next model refresh is scheduled in 2 hours.",
    snapshots: ["analytics"],
    followUps: [
      "What actions is the AI recommending?",
      "Show campaign performance details",
      "What business scenarios can we explore?",
    ],
  },
  // ── Campaign performance ────────────────────────────────────────────────
  {
    triggers: ["campaign performance", "campaign status", "campaign", "campaigns", "how are campaigns"],
    agentSteps: [
      "Querying campaign metrics API",
      "Analyzing performance data",
      "Generating campaign summary",
    ],
    response:
      "Here's your campaign performance overview. You have **8 active campaigns** running across Google, Facebook, and TikTok. The Summer Sale campaign is your top performer with a **3.2x ROAS**, while overall conversion rate sits at **3.8%**. I've pulled the latest campaign details and trend analytics below.",
    snapshots: ["campaigns", "analytics"],
    followUps: [
      "What actions should we take on these campaigns?",
      "Which campaigns should the AI pause?",
      "What business scenarios can we explore?",
    ],
  },
  // ── High-performing segments campaign push ────────────────────────────
  {
    triggers: [
      "high-performing customer groups",
      "performing customer groups",
      "push campaigns to",
      "push ads to",
      "best performing segments",
      "top segments",
      "winning segments",
    ],
    agentSteps: [
      "Identifying top-performing customer cohorts",
      "Scoring segment momentum and marginal response",
      "Building segment-specific campaign plan",
      "Preparing rollout guardrails by cohort",
    ],
    response:
      "I mapped your highest-performing customer groups and prepared a targeted campaign push plan. The strongest cohorts right now are **High-Value Loyalists**, **Recent Repeat Buyers**, and **Seasonal Category Enthusiasts**.\n\nRecommended rollout:\n• Increase budget and creative frequency for top cohorts with sustained ROAS\n• Split messaging by lifecycle stage to avoid fatigue\n• Apply holdout controls so we can isolate incremental lift by segment\n\nThis approach prioritizes efficient growth from customers already showing strong response signals.",
    snapshots: ["audiences", "campaigns", "analytics"],
    followUps: [
      "Show me the top 3 customer cohorts by ROAS",
      "Which cohort should get incremental budget first?",
      "What guardrails should we apply before launch?",
    ],
  },
  // ── Advertising by brand performance ───────────────────────────────────
  {
    triggers: [
      "brand performance",
      "advertising by brand",
      "ads by brand",
      "brand-level advertising",
      "which brands are performing",
      "brand mix",
    ],
    agentSteps: [
      "Aggregating brand-level spend and revenue performance",
      "Computing efficiency tiers by brand",
      "Detecting underfunded and overspent brands",
      "Generating brand-based budget recommendations",
    ],
    response:
      "I analyzed advertising performance by brand and grouped each into **scale**, **optimize**, and **contain** tiers.\n\nRecommended allocation pattern:\n• **Scale** brands with strong conversion efficiency and stable margin\n• **Optimize** mid-performing brands with creative and audience refinements\n• **Contain** low-efficiency brands until economics improve\n\nThis gives you a brand-level budget model that protects spend while maximizing return across your portfolio.",
    snapshots: ["campaigns", "reports", "analytics"],
    followUps: [
      "Show the scale/optimize/contain brand list",
      "Which brand should receive incremental spend this week?",
      "Where are we over-investing today?",
    ],
  },
  // ── Marketing mix ───────────────────────────────────────────────────────
  {
    triggers: ["marketing mix", "mmm", "media mix", "channel allocation", "budget allocation", "compare"],
    agentSteps: [
      "Loading MMM attribution model",
      "Computing channel saturation curves",
      "Generating allocation recommendations",
    ],
    response:
      "Here's your Marketing Mix Model analysis. Google PMAX is currently **undersaturated** — the model suggests increasing budget by 30% for an estimated +£17K net profit/day. Meanwhile, Facebook Awareness shows **diminishing returns** and TikTok Sale is approaching saturation above £17K/week. I've included the full breakdown and report details below.",
    snapshots: ["mmm", "reports"],
    followUps: [
      "Activate the recommended budget changes",
      "Model the full profit scenario",
      "What audiences should we target?",
    ],
  },
  // ── Performance summary ─────────────────────────────────────────────────
  {
    triggers: ["performance summary", "summary for all", "generate a performance", "overview", "how are we doing", "dashboard", "overall", "status"],
    agentSteps: [
      "Aggregating cross-channel metrics",
      "Computing period-over-period trends",
      "Building executive summary",
    ],
    response:
      "Here's your marketing overview. Total revenue is up **12% month-over-month** with a blended ROAS of **2.8x** across all channels. You have **8 active campaigns** with a combined reach of **45.2K** and an average conversion rate of **3.8%**. Google PMAX is your strongest channel, while the loyalty segment continues to grow.",
    snapshots: ["dashboard", "analytics"],
    followUps: [
      "What actions is the AI recommending?",
      "What business scenarios can we explore?",
      "Show me audience segments",
    ],
  },
  // ── Audiences ───────────────────────────────────────────────────────────
  {
    triggers: ["audience", "audiences", "segments", "segment", "who are our customers", "targeting"],
    agentSteps: [
      "Querying audience segmentation engine",
      "Analyzing customer profiles",
      "Mapping segment overlaps",
    ],
    response:
      "Here's a view of your key audience segments. Your **High-Value Loyalists** (top 10% by LTV) are driving 42% of revenue. I've also flagged **512 at-risk high-value customers** with a 38-day purchase gap — a win-back campaign could recover 18% of them.",
    snapshots: ["audiences", "customers"],
    followUps: [
      "Deploy a win-back campaign for at-risk customers",
      "What business scenarios can we explore?",
      "Explain the AI model",
    ],
  },
  // ── Reports ─────────────────────────────────────────────────────────────
  {
    triggers: ["report", "reports", "performance report", "weekly report"],
    agentSteps: [
      "Compiling performance report",
      "Calculating spend vs. return metrics",
      "Formatting report data",
    ],
    response:
      "Here's your latest performance report. Total marketing spend this period was **£142K** with an aggregate return of **£398K** (2.8x blended ROAS). Google channels delivered the highest efficiency at **3.4x ROAS**, while social channels averaged **2.1x**.",
    snapshots: ["reports"],
    followUps: [
      "What actions does the AI recommend?",
      "Model the profit optimization scenario",
      "Show the dashboard overview",
    ],
  },
  // ── Customer insights ───────────────────────────────────────────────────
  {
    triggers: ["customer", "customer insights", "customer data", "who buys"],
    agentSteps: [
      "Querying customer data platform",
      "Analyzing purchase patterns",
      "Segmenting by behavior",
    ],
    response:
      "Here's a snapshot of your customer insights. Your customer base spans **12,453 active profiles** with an average LTV of **£284**. The top segment — Brand Advocates — has a purchase frequency of **4.8x** and represents your highest growth opportunity.",
    snapshots: ["customers"],
    followUps: [
      "Deploy a loyalty reward for Brand Advocates",
      "What business scenarios can we explore?",
      "Show audience segments",
    ],
  },
  // ── Analytics ───────────────────────────────────────────────────────────
  {
    triggers: ["analytics", "trends", "weekly trends", "performance trends"],
    agentSteps: [
      "Loading analytics pipeline",
      "Computing weekly trend data",
      "Identifying anomalies",
    ],
    response:
      "Here are your performance analytics. Weekly sessions are trending **up 8%** with conversion rates stabilizing around **3.8%**. I've detected a notable uptick in mobile traffic (+15%) which correlates with the TikTok campaign launch.",
    snapshots: ["analytics"],
    followUps: [
      "What actions should we take on these trends?",
      "What business scenarios can we explore?",
      "Show campaign performance",
    ],
  },
];

export const MERCHANDISER_CHAT_FLOWS: ChatFlow[] = [
  WEEKLY_COMMERCIAL_REVIEW_FLOW,
  {
    triggers: ["maximize profit", "sell-through", "inventory", "merchandising"],
    agentSteps: MERCHANDISER_SCENARIO_FLOWS.profit.agentSteps,
    response: MERCHANDISER_SCENARIO_FLOWS.profit.response,
    snapshots: MERCHANDISER_SCENARIO_FLOWS.profit.snapshots,
    followUps: MERCHANDISER_SCENARIO_FLOWS.profit.followUps,
    showNBACards: MERCHANDISER_SCENARIO_FLOWS.profit.showNBACards,
  },
  {
    triggers: ["discovery", "cross-sell", "bundle", "aov", "upsell"],
    agentSteps: MERCHANDISER_SCENARIO_FLOWS.acquisition.agentSteps,
    response: MERCHANDISER_SCENARIO_FLOWS.acquisition.response,
    snapshots: MERCHANDISER_SCENARIO_FLOWS.acquisition.snapshots,
    followUps: MERCHANDISER_SCENARIO_FLOWS.acquisition.followUps,
    showNBACards: MERCHANDISER_SCENARIO_FLOWS.acquisition.showNBACards,
  },
  {
    triggers: ["return", "returns", "fit", "product detail", "retention"],
    agentSteps: MERCHANDISER_SCENARIO_FLOWS.retention.agentSteps,
    response: MERCHANDISER_SCENARIO_FLOWS.retention.response,
    snapshots: MERCHANDISER_SCENARIO_FLOWS.retention.snapshots,
    followUps: MERCHANDISER_SCENARIO_FLOWS.retention.followUps,
    showNBACards: MERCHANDISER_SCENARIO_FLOWS.retention.showNBACards,
  },
  {
    triggers: [
      "demand vs stock",
      "demand versus stock",
      "stock coverage",
      "inventory coverage",
      "demand coverage",
      "which products are understocked",
    ],
    agentSteps: [
      "Collecting SKU-level demand velocity",
      "Comparing on-hand and in-transit stock by category",
      "Flagging overstock and understock risk zones",
      "Preparing replenishment and markdown actions",
    ],
    response:
      "I ran a demand-versus-stock review and flagged where inventory is misaligned with current demand.\n\nKey outcomes:\n• High-demand categories with low coverage were flagged for urgent replenishment\n• Slow-demand categories with excess stock were flagged for markdown or bundle support\n• Priority actions were ranked by revenue-at-risk and sell-through recovery potential\n\nThis gives you a practical weekly plan to reduce stockouts and limit excess inventory drag.",
    snapshots: ["dashboard", "analytics", "reports"],
    followUps: [
      "Show me the highest revenue-at-risk stockouts",
      "Which categories are overstocked right now?",
      "Recommend replenishment priorities for this week",
    ],
  },
  {
    triggers: [
      "other businesses",
      "other retailers",
      "what products are performing well elsewhere",
      "performing well in other businesses",
      "brand relations",
      "brand partnerships",
      "new product relations",
    ],
    agentSteps: [
      "Reviewing external market and category trend signals",
      "Mapping high-growth product archetypes to your catalog",
      "Identifying white-space brand collaboration opportunities",
      "Prioritizing partnership and assortment expansion ideas",
    ],
    response:
      "I prepared a market-informed merchandising brief using product trends seen across comparable businesses.\n\nRecommended opportunities:\n• Prioritize product types showing cross-retailer momentum but low local saturation\n• Test complementary brand pairings where basket affinity is high\n• Pilot limited collaboration capsules in categories with strong trend acceleration\n\nThis approach helps you capitalize on external demand patterns while keeping assortment risk controlled.",
    snapshots: ["reports", "analytics", "campaigns"],
    followUps: [
      "Show top emerging product archetypes to test",
      "Which brand partnerships should we prioritize first?",
      "What low-risk pilot assortment should we launch?",
    ],
  },
  {
    triggers: ["what actions", "ai recommend", "recommendations", "next best"],
    agentSteps: [
      "Polling merchandising recommendation engine",
      "Ranking actions by sell-through and margin impact",
      "Preparing prioritized action queue",
    ],
    response:
      "The AI currently has **3 merchandising actions** queued for your review. These are ranked by projected sell-through, return-rate, and margin impact.",
    snapshots: [],
    followUps: [],
    showNBACards: "all",
  },
  {
    triggers: ["performance summary", "summary", "overview", "how are we doing"],
    agentSteps: [
      "Aggregating product and category performance",
      "Computing sell-through and stock health trends",
      "Preparing merchandising summary",
    ],
    response:
      "Here's your merchandising overview. Sell-through is trending **up 6%**, with strongest momentum in outerwear and accessories. Low-stock risk is concentrated in 6 priority SKUs, and return pressure remains highest in two apparel categories.",
    snapshots: ["dashboard", "analytics"],
    followUps: [
      "What merchandising actions should we take next?",
      "Which products are highest risk right now?",
      "Model merchandising scenarios",
    ],
  },
];

export const GENERAL_USER_CHAT_FLOWS: ChatFlow[] = [
  WEEKLY_COMMERCIAL_REVIEW_FLOW,
  {
    triggers: ["maximize profit", "revenue", "conversion", "checkout"],
    agentSteps: GENERAL_USER_SCENARIO_FLOWS.profit.agentSteps,
    response: GENERAL_USER_SCENARIO_FLOWS.profit.response,
    snapshots: GENERAL_USER_SCENARIO_FLOWS.profit.snapshots,
    followUps: GENERAL_USER_SCENARIO_FLOWS.profit.followUps,
    showNBACards: GENERAL_USER_SCENARIO_FLOWS.profit.showNBACards,
  },
  {
    triggers: ["acquisition", "growth", "repeat", "reactivation", "loyalty"],
    agentSteps: GENERAL_USER_SCENARIO_FLOWS.acquisition.agentSteps,
    response: GENERAL_USER_SCENARIO_FLOWS.acquisition.response,
    snapshots: GENERAL_USER_SCENARIO_FLOWS.acquisition.snapshots,
    followUps: GENERAL_USER_SCENARIO_FLOWS.acquisition.followUps,
    showNBACards: GENERAL_USER_SCENARIO_FLOWS.acquisition.showNBACards,
  },
  {
    triggers: ["retention", "return", "returns", "operational risk"],
    agentSteps: GENERAL_USER_SCENARIO_FLOWS.retention.agentSteps,
    response: GENERAL_USER_SCENARIO_FLOWS.retention.response,
    snapshots: GENERAL_USER_SCENARIO_FLOWS.retention.snapshots,
    followUps: GENERAL_USER_SCENARIO_FLOWS.retention.followUps,
    showNBACards: GENERAL_USER_SCENARIO_FLOWS.retention.showNBACards,
  },
  {
    triggers: ["what actions", "ai recommend", "recommendations", "next best"],
    agentSteps: [
      "Polling cross-functional recommendation engine",
      "Ranking actions by business impact",
      "Preparing prioritized queue",
    ],
    response:
      "The AI currently has **3 high-priority actions** queued. These are ranked by expected impact on conversion, repeat orders, and operational efficiency.",
    snapshots: [],
    followUps: [],
    showNBACards: "all",
  },
  {
    triggers: ["performance summary", "summary", "overview", "status", "dashboard"],
    agentSteps: [
      "Aggregating revenue, conversion, and retention metrics",
      "Computing week-over-week trend movement",
      "Preparing executive summary",
    ],
    response:
      "Here's your business summary. Revenue trend remains positive, checkout performance is improving, and repeat-order recovery is the biggest near-term upside. Return burden remains the primary operational risk to watch this week.",
    snapshots: ["dashboard", "analytics"],
    followUps: [
      "Show me the top recommended actions",
      "What scenario should we run next?",
      "Where is the biggest operational risk?",
    ],
  },
];

export const WARNING_ACTION_PROMPTS: Record<WarningActionId, string> = {
  "warning-return-drivers": "Why is return rate up and which categories are most affected?",
  "warning-return-recs": "What AI actions are recommended to reduce returns?",
  "warning-stockout-risk": "Show me demand versus stock outage risk by category",
  "warning-checkout-friction": "Review checkout funnel drop-off and show where conversion is leaking",
  "warning-conversion-wins": "What AI actions are recommended to improve checkout conversion?",
  "warning-conversion-scenario": "Run a scenario to improve checkout efficiency and project conversion uplift",
};

export const WARNING_ACTION_FLOWS: Record<WarningActionId, ChatFlow> = {
  "warning-return-drivers": {
    triggers: [],
    agentSteps: [
      "Collecting category-level return signals",
      "Attributing return causes by SKU and reason code",
      "Scoring categories by return impact",
      "Preparing category return mitigation plan",
    ],
    response:
      "I analyzed return pressure by category and identified the top drivers behind the recent increase. **Footwear** and **outerwear** are the highest-impact categories, with size mismatch and expectation gaps contributing most of the return volume.\n\nRecommended next moves:\n• Prioritize fit guidance improvements on the highest-return SKUs\n• Tighten product detail clarity for top driver categories\n• Monitor return-rate deltas weekly to verify impact",
    snapshots: ["reports", "analytics", "customers"],
    followUps: [
      "Show the top 10 return-driver SKUs",
      "What actions should we execute first?",
      "Compare return drivers by region",
    ],
    showNBACards: "all",
  },
  "warning-return-recs": {
    triggers: [],
    agentSteps: [
      "Loading return-pressure recommendation model",
      "Ranking return-reduction actions by projected impact",
      "Generating prioritized return action queue",
      "Preparing execution guardrails for return controls",
    ],
    response:
      "I prepared a prioritized action queue focused on reducing return pressure while protecting conversion. The AI recommends targeting high-impact category interventions first, then scaling the proven controls.\n\nUse the recommended actions below to execute or send for review.",
    snapshots: ["analytics", "reports"],
    followUps: [
      "Show expected return-rate improvement",
      "Which action has the fastest impact?",
      "How should we phase rollout by category?",
    ],
    showNBACards: "all",
  },
  "warning-stockout-risk": {
    triggers: [],
    agentSteps: [
      "Collecting demand velocity and stock coverage data",
      "Detecting stockout and overstock risk by category",
      "Projecting revenue-at-risk from stock imbalance",
      "Preparing replenishment and transfer priorities",
    ],
    response:
      "I ran a demand-versus-stock outage risk assessment and flagged categories where inventory coverage is misaligned with current demand. The highest risk zones now have prioritized replenishment and transfer actions, ranked by revenue at risk and near-term recovery potential.",
    snapshots: ["dashboard", "analytics", "reports"],
    followUps: [
      "Show the highest stockout-risk categories",
      "Which transfers should we execute today?",
      "What overstock should be marked down first?",
    ],
    showNBACards: "all",
  },
  "warning-checkout-friction": {
    triggers: [],
    agentSteps: [
      "Analyzing checkout funnel abandonment by step",
      "Segmenting drop-off by device and channel",
      "Identifying highest-friction checkout interactions",
      "Preparing checkout friction remediation plan",
    ],
    response:
      "I diagnosed checkout friction and found the largest abandonment concentrated in payment-step interactions on mobile sessions. The remediation plan prioritizes the highest-lift fixes first, with guardrails to ensure payment reliability while conversion recovers.",
    snapshots: ["analytics", "dashboard"],
    followUps: [
      "Show mobile vs desktop drop-off comparison",
      "Which fix should ship first?",
      "Estimate conversion lift by intervention",
    ],
    showNBACards: "all",
  },
  "warning-conversion-wins": {
    triggers: [],
    agentSteps: [
      "Loading conversion uplift opportunity model",
      "Scoring quick-win interventions by effort and impact",
      "Ranking conversion actions for immediate rollout",
      "Preparing rapid conversion optimization queue",
    ],
    response:
      "I generated a fast conversion-win queue ranked by expected uplift and implementation effort. The top actions focus on checkout flow simplification and payment preference tuning to recover performance quickly.",
    snapshots: ["analytics", "campaigns"],
    followUps: [
      "Show projected uplift for top 3 quick wins",
      "Which action can be launched today?",
      "How should we monitor post-launch impact?",
    ],
    showNBACards: "all",
  },
  "warning-conversion-scenario": {
    triggers: [],
    agentSteps: [
      "Running conversion uplift scenario model",
      "Projecting revenue impact from checkout improvements",
      "Evaluating rollout risk and control thresholds",
      "Preparing conversion scenario execution plan",
    ],
    response:
      "I modeled the conversion uplift scenario and projected revenue impact from targeted checkout improvements. The recommended rollout sequence balances conversion recovery speed with operational risk controls, with clear thresholds for rollback if performance degrades.",
    snapshots: ["current-state", "scenario-profit"],
    followUps: [
      "Show before/after projection chart",
      "What confidence level does the model have?",
      "Prepare this for execution review",
    ],
    showNBACards: "profit",
  },
};

export const DEFAULT_FLOW: ChatFlow = {
  triggers: [],
  agentSteps: [
    "Processing your request",
    "Searching knowledge base",
    "Preparing response",
  ],
  response:
    "I can help you with that! Here's a quick overview of your current marketing performance. You can ask me about **campaign performance**, **marketing mix models**, **audience segments**, or explore a **business scenario** to see how agentic AI can project and act on your future outcomes.",
  snapshots: ["dashboard"],
  followUps: [
    "What actions is the AI recommending?",
    "What business scenarios can we explore?",
    "Show campaign performance",
    "Who are our key audiences?",
  ],
};

export const MERCHANDISER_DEFAULT_FLOW: ChatFlow = {
  triggers: [],
  agentSteps: [
    "Processing your merchandising request",
    "Reviewing product and inventory signals",
    "Preparing recommendation",
  ],
  response:
    "I can help with merchandising decisions. Ask about **sell-through**, **inventory risk**, **product page optimization**, or run a **merchandising scenario** for projected impact.",
  snapshots: ["dashboard"],
  followUps: [
    "What merchandising actions are recommended?",
    "Show product and category performance",
    "Model a merchandising scenario",
  ],
};

export const GENERAL_USER_DEFAULT_FLOW: ChatFlow = {
  triggers: [],
  agentSteps: [
    "Processing your request",
    "Reviewing cross-functional performance signals",
    "Preparing response",
  ],
  response:
    "I can help with a broad business view. Ask about **performance summary**, **priority actions**, **checkout and retention trends**, or run a **scenario** to compare outcomes.",
  snapshots: ["dashboard"],
  followUps: [
    "What actions should we prioritize now?",
    "Show me a business performance summary",
    "Run a scenario for projected impact",
  ],
};

// ── Scenario-specific artifact mappings ──────────────────────────────────────
// Only scenario flows and NBA execution flows produce artifacts across tabs.

import type { ArtifactCategory } from "@/lib/artifact-store";

export interface ScenarioArtifactDef {
  category: ArtifactCategory;
  title: string;
  summary: string;
  metric?: string;
}

export const SCENARIO_ARTIFACTS: Record<ScenarioId, ScenarioArtifactDef[]> = {
  profit: [
    { category: "dashboard", title: "Profit scenario modelled", summary: "Projected +15% net profit with -5% total spend through PMAX and FB reallocation.", metric: "+15% Net Profit" },
    { category: "mmm", title: "Budget reallocation proposed", summary: "MMM recommends +30% PMAX budget and suppressing Facebook Awareness entirely.", metric: "+£17K/day" },
    { category: "reports", title: "Scenario report generated", summary: "Before/after comparison showing projected revenue impact over 12 weeks." },
    { category: "campaigns", title: "Campaign changes recommended", summary: "PMAX budget increase and Facebook Awareness pause recommended by agent." },
    { category: "analytics", title: "Projected trends updated", summary: "12-week projection shows improved ROAS trajectory from 2.8x to 3.4x blended." },
  ],
  acquisition: [
    { category: "dashboard", title: "Acquisition scenario modelled", summary: "Projected +20% new users with +15% budget increase across untapped regions." },
    { category: "campaigns", title: "New campaigns proposed", summary: "TikTok TOF and Google Discovery campaigns targeting underserved regions." },
    { category: "audiences", title: "New segments identified", summary: "18-34 demographic in northern regions flagged as high-opportunity acquisition target." },
    { category: "customers", title: "Prospect analysis logged", summary: "Estimated +8.2K new prospects/week from expanded channel mix." },
    { category: "analytics", title: "Growth projections updated", summary: "New user growth projected at +20% over 12 weeks with expanded reach." },
  ],
  retention: [
    { category: "dashboard", title: "Retention scenario modelled", summary: "Projected -30% churn rate with no budget change through targeted win-back." },
    { category: "campaigns", title: "Win-back campaign proposed", summary: "Email + retargeting campaign targeting 512 at-risk high-LTV customers." },
    { category: "audiences", title: "At-risk segment flagged", summary: "512 high-LTV customers with 38-day purchase gap identified for intervention." },
    { category: "customers", title: "Churn risk analysis logged", summary: "High-LTV cohort showing 38-day purchase gap — 18% projected recovery with win-back." },
    { category: "analytics", title: "Retention projections updated", summary: "Revenue trajectory stabilises with 30% churn reduction over 12 weeks." },
  ],
};

export const EXECUTION_ARTIFACTS: Record<NBAActionId, ScenarioArtifactDef[]> = {
  "boost-pmax": [
    { category: "campaigns", title: "PMAX budget increased", summary: "+30% budget increase submitted to Google Ads with CPA ceiling and ROAS floor guardrails.", metric: "+£17K/day" },
    { category: "mmm", title: "Budget change executed", summary: "MMM-recommended PMAX budget increase now live — monitoring for saturation signals." },
  ],
  "suppress-fb": [
    { category: "campaigns", title: "Facebook Awareness paused", summary: "All Facebook Awareness ad sets paused — £2K/day freed to reserve pool.", metric: "£2K/day saved" },
    { category: "analytics", title: "Spend reallocation tracked", summary: "Agent monitoring brand search volume for downstream impact of FB suppression." },
  ],
  "launch-winback": [
    { category: "campaigns", title: "Win-back campaign launched", summary: "3-touch email series + retargeting deployed to 512 at-risk high-LTV customers.", metric: "18% recovery target" },
    { category: "audiences", title: "Win-back audience activated", summary: "512 at-risk high-LTV customers segmented and loaded into campaign pipeline." },
    { category: "customers", title: "Churn intervention deployed", summary: "Personalised win-back targeting 512 high-LTV customers with 38-day purchase gap." },
  ],
  "optimize-pdp": [
    { category: "campaigns", title: "PDP optimization deployed", summary: "Fit guidance module and sizing improvements deployed to highest-return SKU pages." },
    { category: "analytics", title: "Return monitoring activated", summary: "SKU-level return delta tracking activated for optimized product pages." },
  ],
  "rebalance-inventory": [
    { category: "dashboard", title: "Inventory rebalance executed", summary: "Stock reallocated to high-demand regions for priority categories." },
    { category: "analytics", title: "Stockout risk monitoring active", summary: "Regional stockout and sell-through risk now tracked with alerts." },
  ],
  "promote-bundles": [
    { category: "campaigns", title: "Bundle placements activated", summary: "Cross-sell bundle placements enabled on top-traffic product pages." },
    { category: "analytics", title: "Bundle performance tracked", summary: "Attach-rate and AOV uplift tracking started for active bundle placements." },
  ],
  "improve-checkout": [
    { category: "dashboard", title: "Checkout optimization launched", summary: "Mobile checkout payment-flow improvements deployed." },
    { category: "analytics", title: "Checkout conversion monitoring active", summary: "Conversion and abandonment deltas tracked after checkout update." },
  ],
  "reduce-returns": [
    { category: "customers", title: "Return-risk mitigation activated", summary: "Return-risk guidance deployed on high-risk categories and SKUs." },
    { category: "analytics", title: "Return trends under monitoring", summary: "Category-level return-rate changes tracked after mitigation rollout." },
  ],
  "launch-loyalty": [
    { category: "campaigns", title: "Loyalty reactivation launched", summary: "Dormant repeat-buyer reactivation campaign deployed." },
    { category: "customers", title: "Dormant cohort re-engaged", summary: "Dormant loyalty segment loaded and campaign response tracking enabled." },
  ],
};

const PERSONA_WELCOME_PROMPTS: Record<ChatPersona, SuggestedPromptCard[]> = {
  ecommerce: WELCOME_PROMPT_CARDS,
  operations: OPERATIONS_PROMPT_CARDS,
  general_user: GENERAL_USER_PROMPT_CARDS,
};

const PERSONA_SCENARIO_META: Record<ChatPersona, Record<ScenarioId, { label: string; description: string; risk: string; outcome: string; budget: string }>> = {
  ecommerce: SCENARIO_META,
  operations: MERCHANDISER_SCENARIO_META,
  general_user: GENERAL_USER_SCENARIO_META,
};

const PERSONA_SCENARIO_FLOWS: Record<ChatPersona, Record<ScenarioId, ChatFlow>> = {
  ecommerce: SCENARIO_FLOWS,
  operations: MERCHANDISER_SCENARIO_FLOWS,
  general_user: GENERAL_USER_SCENARIO_FLOWS,
};

const PERSONA_CHAT_FLOWS: Record<ChatPersona, ChatFlow[]> = {
  ecommerce: CHAT_FLOWS,
  operations: MERCHANDISER_CHAT_FLOWS,
  general_user: GENERAL_USER_CHAT_FLOWS,
};

// ── Helpers to identify scenario flows ───────────────────────────────────────

/** Returns the ScenarioId if a flow is a scenario flow, or null */
export function getScenarioIdFromFlow(flow: ChatFlow): ScenarioId | null {
  for (const flowSet of Object.values(PERSONA_SCENARIO_FLOWS)) {
    for (const [id, scenarioFlow] of Object.entries(flowSet)) {
      if (flow.response === scenarioFlow.response) return id as ScenarioId;
    }
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

export function getWelcomePromptCardsForPersona(persona: ChatPersona): SuggestedPromptCard[] {
  return PERSONA_WELCOME_PROMPTS[persona] ?? WELCOME_PROMPT_CARDS;
}

// ── Unified cross-domain prompt cards ────────────────────────────────────────

export const CREATE_KNOWLEDGE_GRAPH_PROMPT = "Create knowledge graph workspace";

export const UNIFIED_DOMAIN_PROMPT_CARDS: SuggestedPromptCard[] = [
  // Platform / cross-domain
  {
    icon: "Database",
    label: "Create a saved knowledge graph workspace for this investigation.",
    boldWords: ["knowledge graph workspace"],
    prompt: CREATE_KNOWLEDGE_GRAPH_PROMPT,
    domain: "platform",
  },
  {
    icon: "Monitor",
    label: "What needs my attention across all domains right now?",
    boldWords: ["all domains"],
    prompt: "What needs my attention across all domains right now?",
    domain: "platform",
  },
  {
    icon: "BarChart3",
    label: "Give me a full cross-domain operations summary.",
    boldWords: ["cross-domain operations summary"],
    prompt: "Give me a full cross-domain operations summary.",
    domain: "platform",
  },
  // Demand
  {
    icon: "TrendingUp",
    label: "Explain the current forecast deviation and its root cause.",
    boldWords: ["forecast deviation", "root cause"],
    prompt: "Explain the current forecast deviation and its root cause.",
    domain: "demand",
  },
  {
    icon: "ShieldCheck",
    label: "Which product categories are most at risk of stockout this week?",
    boldWords: ["stockout"],
    prompt: "Which product categories are most at risk of stockout this week?",
    domain: "demand",
  },
  {
    icon: "BarChart3",
    label: "How should I adjust the demand plan given the latest sell-through?",
    boldWords: ["demand plan", "sell-through"],
    prompt: "How should I adjust the demand plan given the latest sell-through data?",
    domain: "demand",
  },
  {
    icon: "Target",
    label: "What's driving the gap between our forecast and actuals?",
    boldWords: ["forecast", "actuals"],
    prompt: "What's driving the gap between our forecast and actuals?",
    domain: "demand",
  },
  // UDP / CDP
  {
    icon: "Database",
    label: "What UDP issues are blocking segment activation right now?",
    boldWords: ["UDP issues", "segment activation"],
    prompt: "What UDP issues are blocking segment activation right now?",
    domain: "udp",
  },
  {
    icon: "ScanFace",
    label: "How complete is our identity resolution across first-party sources?",
    boldWords: ["identity resolution", "first-party"],
    prompt: "How complete is our identity resolution across first-party data sources?",
    domain: "udp",
  },
  {
    icon: "ShieldCheck",
    label: "Which data quality issues are highest priority right now?",
    boldWords: ["data quality issues"],
    prompt: "Which data quality issues are highest priority right now?",
    domain: "udp",
  },
  {
    icon: "Users",
    label: "Show me activation readiness for our top audience segments.",
    boldWords: ["activation readiness", "audience segments"],
    prompt: "Show me the activation readiness for our top audience segments.",
    domain: "udp",
  },
  // Campaign
  {
    icon: "Megaphone",
    label: "Is our PMAX spend hitting its target ROAS?",
    boldWords: ["PMAX spend", "ROAS"],
    prompt: "Is our PMAX spend hitting its target ROAS?",
    domain: "campaign",
  },
  {
    icon: "BarChart3",
    label: "Which campaigns are overspending vs. budget this week?",
    boldWords: ["overspending", "budget"],
    prompt: "Which campaigns are overspending versus their budget this week?",
    domain: "campaign",
  },
  {
    icon: "AiRecommend",
    label: "Recommend budget reallocations to maximize campaign ROI.",
    boldWords: ["budget reallocations", "ROI"],
    prompt: "Recommend budget reallocations across our campaigns to maximize ROI.",
    domain: "campaign",
  },
  {
    icon: "TrendingUp",
    label: "How is our BOGO promo performing against the forecast?",
    boldWords: ["BOGO promo", "forecast"],
    prompt: "How is our BOGO promotion performing against the original forecast?",
    domain: "campaign",
  },
];

export function getScenarioMetaForPersona(
  persona: ChatPersona
): Record<ScenarioId, { label: string; description: string; risk: string; outcome: string; budget: string }> {
  return PERSONA_SCENARIO_META[persona] ?? SCENARIO_META;
}

export function getScenarioFlowForPersona(persona: ChatPersona, scenarioId: ScenarioId): ChatFlow {
  const flows = PERSONA_SCENARIO_FLOWS[persona] ?? SCENARIO_FLOWS;
  return flows[scenarioId];
}

export function getAllNBAsForPersona(persona: ChatPersona): NBAAction[] {
  return ALL_NBA_ACTIONS_BY_PERSONA[persona] ?? ALL_NBA_ACTIONS;
}

export function getNBAsByScenario(scenarioId: ScenarioId, persona: ChatPersona = "ecommerce"): NBAAction[] {
  const ids = PERSONA_SCENARIO_NBAS[persona][scenarioId];
  const actions = ALL_NBA_ACTIONS_BY_PERSONA[persona];
  return actions.filter((action) => ids.includes(action.id));
}

export function getNBAById(id: NBAActionId): NBAAction | undefined {
  const allActions = Object.values(ALL_NBA_ACTIONS_BY_PERSONA).flat();
  return allActions.find((action) => action.id === id);
}

export function isNBAActionId(value: string): value is NBAActionId {
  return Object.values(ALL_NBA_ACTIONS_BY_PERSONA)
    .flat()
    .some((action) => action.id === value);
}

export function getExecutionFlowByActionId(actionId: NBAActionId): ChatFlow {
  return EXECUTION_FLOWS[actionId];
}

export function getReviewRequestFlowByActionId(actionId: NBAActionId): ChatFlow | null {
  const trigger = REVIEW_TRIGGER_BY_ACTION_ID[actionId];
  if (!trigger) return null;
  return REVIEW_REQUEST_FLOWS.find((flow) => flow.triggers.includes(trigger)) ?? null;
}

export function isWarningActionId(value: string): value is WarningActionId {
  return value in WARNING_ACTION_FLOWS;
}

export function getWarningActionFlow(actionId: WarningActionId): ChatFlow {
  return WARNING_ACTION_FLOWS[actionId];
}

export function getWarningActionPrompt(actionId: WarningActionId): string {
  return WARNING_ACTION_PROMPTS[actionId];
}

export function matchFlowForPersona(input: string, persona: ChatPersona): ChatFlow | null {
  const lower = input.toLowerCase().trim();

  for (const flow of REVIEW_REQUEST_FLOWS) {
    if (flow.triggers.some((t) => lower.includes(t))) {
      return flow;
    }
  }

  for (const flow of Object.values(EXECUTION_FLOWS)) {
    if (flow.triggers.some((t) => lower.includes(t))) {
      return flow;
    }
  }

  const flows = PERSONA_CHAT_FLOWS[persona] ?? CHAT_FLOWS;
  for (const flow of flows) {
    if (flow.triggers.some((t) => lower.includes(t))) {
      return flow;
    }
  }
  return null;
}

export function matchFlow(input: string): ChatFlow | null {
  return matchFlowForPersona(input, "ecommerce");
}
