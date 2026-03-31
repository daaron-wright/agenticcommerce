"use client";

import type { NBAActionId } from "./chat-data";

export interface ExecutionPreviewField {
  label: string;
  values: string[];
  tone?: "default" | "accent" | "success" | "warning";
}

export interface ExecutionPreviewPanel {
  id: string;
  title: string;
  subtitle: string;
  badgeValues?: string[];
  fields: ExecutionPreviewField[];
}

export interface ExecutionPreviewStep {
  label: string;
  detail: string;
  status: "draft" | "validating" | "publishing" | "live";
  focusPanelId: string;
}

export interface ExecutionPreviewScenario {
  id: string;
  label: string;
  badge: string;
  audienceLabel: string;
  activationPath: string;
  treatmentDifference: string;
  expectedImpact: string;
  guardrail: string;
}

export interface ExecutionPreviewScene {
  actionId: NBAActionId;
  title: string;
  subtitle: string;
  surfaceTitle: string;
  surfaceSubtitle: string;
  monitoringLabel: string;
  steps: ExecutionPreviewStep[];
  scenarios: ExecutionPreviewScenario[];
  panels: ExecutionPreviewPanel[];
}

function valueSeries(...values: string[]) {
  return values;
}

function createScenarioCarousel(input: {
  primaryAudienceLabel: string;
  controlAudienceLabel: string;
  scenarioA: {
    activationPath: string;
    treatmentDifference: string;
    expectedImpact: string;
    guardrail: string;
  };
  scenarioB: {
    activationPath: string;
    treatmentDifference: string;
    expectedImpact: string;
    guardrail: string;
  };
  holdout: {
    activationPath: string;
    treatmentDifference: string;
    expectedImpact: string;
    guardrail: string;
  };
}): ExecutionPreviewScenario[] {
  return [
    {
      id: "scenario-a",
      label: "Scenario A",
      badge: "Treatment",
      audienceLabel: input.primaryAudienceLabel,
      activationPath: input.scenarioA.activationPath,
      treatmentDifference: input.scenarioA.treatmentDifference,
      expectedImpact: input.scenarioA.expectedImpact,
      guardrail: input.scenarioA.guardrail,
    },
    {
      id: "scenario-b",
      label: "Scenario B",
      badge: "Alternate",
      audienceLabel: input.primaryAudienceLabel,
      activationPath: input.scenarioB.activationPath,
      treatmentDifference: input.scenarioB.treatmentDifference,
      expectedImpact: input.scenarioB.expectedImpact,
      guardrail: input.scenarioB.guardrail,
    },
    {
      id: "holdout",
      label: "Holdout",
      badge: "Control",
      audienceLabel: input.controlAudienceLabel,
      activationPath: input.holdout.activationPath,
      treatmentDifference: input.holdout.treatmentDifference,
      expectedImpact: input.holdout.expectedImpact,
      guardrail: input.holdout.guardrail,
    },
  ];
}

export const EXECUTION_PREVIEW_SCENES: Record<NBAActionId, ExecutionPreviewScene> = {
  "boost-pmax": {
    actionId: "boost-pmax",
    title: "Boost Google PMAX Budget",
    subtitle: "Budget optimization agent applying spend and guardrail changes.",
    surfaceTitle: "Campaign Execution Console",
    surfaceSubtitle: "Google PMAX budget orchestration",
    monitoringLabel: "Monitoring CPA, ROAS, and spend pacing after launch.",
    steps: [
      { label: "Validate headroom", detail: "Checking budget caps and pacing constraints.", status: "validating", focusPanelId: "budget" },
      { label: "Increase budget", detail: "Applying +30% daily budget to PMAX.", status: "publishing", focusPanelId: "budget" },
      { label: "Enable guardrails", detail: "Configuring CPA and ROAS protection thresholds.", status: "publishing", focusPanelId: "guardrails" },
      { label: "Activate monitoring", detail: "Turning on anomaly detection and auto-rollback.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "High-intent shoppers eligible for PMAX expansion",
      controlAudienceLabel: "Matched PMAX holdout audience at current spend",
      scenarioA: {
        activationPath: "PMAX treatment on core prospecting + shopping",
        treatmentDifference: "Increase PMAX budget by 30% with growth-priority pacing.",
        expectedImpact: "+0.4x ROAS recovery and +£17K net profit/day",
        guardrail: "Auto-rollback if ROAS drops below 2.0x for four hours.",
      },
      scenarioB: {
        activationPath: "PMAX + selective creative refresh",
        treatmentDifference: "Increase PMAX budget by 20% and rotate higher-conversion creative.",
        expectedImpact: "+0.2x ROAS improvement with lower spend risk",
        guardrail: "Cap spend if CPA rises above £18.",
      },
      holdout: {
        activationPath: "Current PMAX baseline",
        treatmentDifference: "Keep budget and pacing unchanged for baseline comparison.",
        expectedImpact: "Reference baseline for incremental lift and pacing changes",
        guardrail: "Monitor naturally without intervention.",
      },
    }),
    panels: [
      {
        id: "budget",
        title: "Budget Settings",
        subtitle: "Daily cap and pacing",
        badgeValues: valueSeries("Draft", "Validated", "Publishing", "Live"),
        fields: [
          { label: "Current budget", values: valueSeries("£6,200/day", "£6,200/day", "£8,060/day", "£8,060/day"), tone: "accent" },
          { label: "Pacing mode", values: valueSeries("Balanced", "Balanced", "Growth priority", "Growth priority") },
          { label: "Channel target", values: valueSeries("PMAX - Core Prospecting", "PMAX - Core Prospecting", "PMAX - Core Prospecting", "PMAX - Core Prospecting") },
        ],
      },
      {
        id: "guardrails",
        title: "Guardrails",
        subtitle: "Safety policy checks",
        badgeValues: valueSeries("Queued", "Queued", "Applied", "Applied"),
        fields: [
          { label: "CPA ceiling", values: valueSeries("Not set", "£18", "£18", "£18"), tone: "warning" },
          { label: "ROAS floor", values: valueSeries("Not set", "2.5x", "2.5x", "2.5x"), tone: "success" },
          { label: "Rollback trigger", values: valueSeries("Pending", "Pending", "ROAS < 2.0x for 4h", "ROAS < 2.0x for 4h") },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring Agent",
        subtitle: "Post-launch oversight",
        badgeValues: valueSeries("Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "Anomaly checks", values: valueSeries("Off", "Queued", "Queued", "15% deviation alerting"), tone: "success" },
          { label: "Reporting cadence", values: valueSeries("Daily", "Hourly", "Hourly", "Hourly") },
          { label: "Next checkpoint", values: valueSeries("Not scheduled", "T+30 min", "T+30 min", "T+30 min") },
        ],
      },
    ],
  },
  "suppress-fb": {
    actionId: "suppress-fb",
    title: "Suppress Facebook Awareness Spend",
    subtitle: "Awareness campaign suppression with reserve-pool reallocation.",
    surfaceTitle: "Campaign Control Surface",
    surfaceSubtitle: "Meta awareness controls",
    monitoringLabel: "Monitoring brand search, reach, and any downstream demand drop after suppression.",
    steps: [
      { label: "Validate dependencies", detail: "Checking active dependencies before pause.", status: "validating", focusPanelId: "campaign" },
      { label: "Pause ad sets", detail: "Suppressing awareness ad sets immediately.", status: "publishing", focusPanelId: "campaign" },
      { label: "Move reserve budget", detail: "Shifting spend to reserve for later reuse.", status: "publishing", focusPanelId: "budget" },
      { label: "Start monitoring", detail: "Watching search demand and branded traffic.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "Broad awareness audience exposed to Meta top-of-funnel spend",
      controlAudienceLabel: "Matched awareness holdout kept on current Meta delivery",
      scenarioA: {
        activationPath: "Suppress awareness spend and move budget to reserve",
        treatmentDifference: "Pause all awareness ad sets immediately.",
        expectedImpact: "£2K/day savings with minimal downstream demand loss",
        guardrail: "Re-enable if brand-search drops more than 10%.",
      },
      scenarioB: {
        activationPath: "Reduce awareness frequency only",
        treatmentDifference: "Cut spend by 50% while preserving highest-performing creative.",
        expectedImpact: "Partial savings with softer reach decay",
        guardrail: "Restore coverage if reach declines too quickly.",
      },
      holdout: {
        activationPath: "Current awareness delivery",
        treatmentDifference: "Maintain the baseline awareness cadence and spend.",
        expectedImpact: "Baseline assisted-demand benchmark",
        guardrail: "Observe without intervention.",
      },
    }),
    panels: [
      {
        id: "campaign",
        title: "Awareness Campaign",
        subtitle: "Lifecycle state",
        badgeValues: valueSeries("Live", "Validated", "Paused", "Paused"),
        fields: [
          { label: "Ad set status", values: valueSeries("6 active", "6 active", "0 active", "0 active"), tone: "warning" },
          { label: "Primary objective", values: valueSeries("Brand awareness", "Brand awareness", "Brand awareness", "Brand awareness") },
          { label: "Estimated stop time", values: valueSeries("Pending", "Immediate", "Immediate", "Completed") },
        ],
      },
      {
        id: "budget",
        title: "Freed Budget",
        subtitle: "Reserve pool transfer",
        badgeValues: valueSeries("Pending", "Pending", "Transferred", "Transferred"),
        fields: [
          { label: "Daily budget released", values: valueSeries("£0", "£0", "£2,000", "£2,000"), tone: "accent" },
          { label: "Destination", values: valueSeries("—", "Reserve pool", "Reserve pool", "Reserve pool") },
          { label: "Reallocation state", values: valueSeries("Queued", "Queued", "Ready for reuse", "Ready for reuse") },
        ],
      },
      {
        id: "monitoring",
        title: "Brand Watch",
        subtitle: "Post-suppression checks",
        badgeValues: valueSeries("Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "Brand search floor", values: valueSeries("Not set", "10% drop threshold", "10% drop threshold", "10% drop threshold") },
          { label: "Reach decay watch", values: valueSeries("Off", "Enabled", "Enabled", "Enabled") },
          { label: "Next scan", values: valueSeries("—", "4 hours", "4 hours", "4 hours") },
        ],
      },
    ],
  },
  "launch-winback": {
    actionId: "launch-winback",
    title: "Launch Win-Back Campaign",
    subtitle: "Retention agent building and deploying recovery journeys.",
    surfaceTitle: "Journey Activation Studio",
    surfaceSubtitle: "Win-back campaign launch",
    monitoringLabel: "Monitoring open rate, click-through, and recovered purchase rate.",
    steps: [
      { label: "Build segment", detail: "Scoring at-risk high-LTV customers.", status: "validating", focusPanelId: "audience" },
      { label: "Match creative", detail: "Aligning offer creative to customer profiles.", status: "publishing", focusPanelId: "creative" },
      { label: "Schedule sequence", detail: "Publishing 3-touch email and retargeting flow.", status: "publishing", focusPanelId: "sequence" },
      { label: "Activate monitoring", detail: "Starting recovery-rate tracking.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "512 at-risk high-LTV customers with a 38-day purchase gap",
      controlAudienceLabel: "High-LTV holdout cohort kept on the current retention journey",
      scenarioA: {
        activationPath: "Email + retargeting win-back journey",
        treatmentDifference: "Launch personalized email cadence with social retargeting follow-up.",
        expectedImpact: "18% purchase recovery target in 14 days",
        guardrail: "Pause if unsubscribe rate exceeds 1.5%.",
      },
      scenarioB: {
        activationPath: "Email-only recovery path",
        treatmentDifference: "Launch the same recovery journey without paid retargeting.",
        expectedImpact: "Lower media cost with slightly softer recovery lift",
        guardrail: "Escalate if recovery stays below 10%.",
      },
      holdout: {
        activationPath: "Current retention baseline",
        treatmentDifference: "Keep the current CRM cadence without personalized recovery triggers.",
        expectedImpact: "Baseline purchase recovery benchmark",
        guardrail: "Observe customer fatigue without intervention.",
      },
    }),
    panels: [
      {
        id: "audience",
        title: "Audience",
        subtitle: "Recovery target set",
        badgeValues: valueSeries("Draft", "Loaded", "Loaded", "Live"),
        fields: [
          { label: "At-risk customers", values: valueSeries("0", "512", "512", "512"), tone: "accent" },
          { label: "Value tier", values: valueSeries("Pending", "High-LTV", "High-LTV", "High-LTV") },
          { label: "Eligibility rule", values: valueSeries("Pending", "38+ day purchase gap", "38+ day purchase gap", "38+ day purchase gap") },
        ],
      },
      {
        id: "creative",
        title: "Creative Mapping",
        subtitle: "Offer and content selection",
        badgeValues: valueSeries("Queued", "Matching", "Matched", "Matched"),
        fields: [
          { label: "Offer", values: valueSeries("Pending", "15% recovery offer", "15% recovery offer", "15% recovery offer") },
          { label: "Dynamic content", values: valueSeries("Pending", "Product affinity blocks", "Product affinity blocks", "Product affinity blocks") },
          { label: "Fallback creative", values: valueSeries("Pending", "Brand-safe generic", "Brand-safe generic", "Brand-safe generic") },
        ],
      },
      {
        id: "sequence",
        title: "Journey Sequence",
        subtitle: "Touch cadence",
        badgeValues: valueSeries("Draft", "Configured", "Publishing", "Live"),
        fields: [
          { label: "Email cadence", values: valueSeries("—", "Day 0 / Day 4 / Day 10", "Day 0 / Day 4 / Day 10", "Day 0 / Day 4 / Day 10") },
          { label: "Retargeting", values: valueSeries("Off", "48h non-opener follow-up", "48h non-opener follow-up", "48h non-opener follow-up") },
          { label: "Recovery target", values: valueSeries("—", "18% purchase recovery", "18% purchase recovery", "18% purchase recovery") },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring",
        subtitle: "Recovery and fatigue checks",
        badgeValues: valueSeries("Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "KPIs", values: valueSeries("—", "Open / Click / Purchase", "Open / Click / Purchase", "Open / Click / Purchase") },
          { label: "Fatigue guardrail", values: valueSeries("Pending", "Unsub > 1.5%", "Unsub > 1.5%", "Unsub > 1.5%") },
          { label: "Reporting cadence", values: valueSeries("Daily", "4-hourly", "4-hourly", "4-hourly") },
        ],
      },
    ],
  },
  "optimize-pdp": {
    actionId: "optimize-pdp",
    title: "Optimize PDP for Top Return SKU",
    subtitle: "Merchandising agent publishing fit-guidance changes.",
    surfaceTitle: "Product Experience Manager",
    surfaceSubtitle: "PDP remediation workflow",
    monitoringLabel: "Monitoring return-rate delta and conversion impact by SKU.",
    steps: [
      { label: "Identify SKUs", detail: "Selecting highest-return pages for remediation.", status: "validating", focusPanelId: "sku" },
      { label: "Apply guidance", detail: "Updating fit guidance and product notes.", status: "publishing", focusPanelId: "content" },
      { label: "Publish templates", detail: "Deploying revised PDP modules.", status: "publishing", focusPanelId: "content" },
      { label: "Track impact", detail: "Turning on return-risk monitoring.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "High-traffic visitors on return-prone apparel PDPs",
      controlAudienceLabel: "Matched PDP traffic holdout on the current page experience",
      scenarioA: {
        activationPath: "Enhanced fit guidance on priority PDPs",
        treatmentDifference: "Show richer fit notes, size guidance, and material context.",
        expectedImpact: "-1.8pp return-rate improvement on priority SKUs",
        guardrail: "Rollback if conversion drops more than 8%.",
      },
      scenarioB: {
        activationPath: "Condensed fit summary treatment",
        treatmentDifference: "Show shorter fit guidance with an expandable size module.",
        expectedImpact: "Moderate return reduction with lighter UX change",
        guardrail: "Watch for rising bounce on mobile PDP sessions.",
      },
      holdout: {
        activationPath: "Current PDP baseline",
        treatmentDifference: "Retain existing PDP content and fit guidance.",
        expectedImpact: "Baseline return-rate and conversion benchmark",
        guardrail: "Observe organically.",
      },
    }),
    panels: [
      {
        id: "sku",
        title: "Target SKUs",
        subtitle: "Return-risk selection",
        badgeValues: valueSeries("Draft", "Selected", "Selected", "Live"),
        fields: [
          { label: "SKU set", values: valueSeries("Pending", "Top 12 return-prone SKUs", "Top 12 return-prone SKUs", "Top 12 return-prone SKUs"), tone: "accent" },
          { label: "Return driver", values: valueSeries("Pending", "Fit ambiguity", "Fit ambiguity", "Fit ambiguity") },
          { label: "Priority tier", values: valueSeries("Pending", "High", "High", "High") },
        ],
      },
      {
        id: "content",
        title: "PDP Content",
        subtitle: "Guidance and chart updates",
        badgeValues: valueSeries("Queued", "Editing", "Published", "Published"),
        fields: [
          { label: "Fit guidance", values: valueSeries("Off", "On", "On", "On"), tone: "success" },
          { label: "Size chart", values: valueSeries("Legacy", "Metadata synced", "Metadata synced", "Metadata synced") },
          { label: "Material notes", values: valueSeries("Basic", "Expanded detail", "Expanded detail", "Expanded detail") },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring",
        subtitle: "Conversion and return watch",
        badgeValues: valueSeries("Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "Rollback rule", values: valueSeries("Pending", "Conversion drop > 8%", "Conversion drop > 8%", "Conversion drop > 8%") },
          { label: "Return KPI", values: valueSeries("Pending", "SKU return-rate delta", "SKU return-rate delta", "SKU return-rate delta") },
          { label: "Scan cadence", values: valueSeries("Daily", "Daily", "Hourly first 24h", "Hourly first 24h") },
        ],
      },
    ],
  },
  "rebalance-inventory": {
    actionId: "rebalance-inventory",
    title: "Rebalance Inventory to High Demand Regions",
    subtitle: "Operations agent creating stock transfer recommendations.",
    surfaceTitle: "Fulfillment Rebalance Console",
    surfaceSubtitle: "Regional inventory orchestration",
    monitoringLabel: "Monitoring stockout risk and transfer completion across regions.",
    steps: [
      { label: "Assess imbalance", detail: "Calculating regional demand mismatch.", status: "validating", focusPanelId: "regions" },
      { label: "Build transfer plan", detail: "Selecting SKUs and source locations.", status: "publishing", focusPanelId: "transfers" },
      { label: "Submit operations plan", detail: "Sending transfer plan to fulfillment.", status: "publishing", focusPanelId: "transfers" },
      { label: "Watch stockouts", detail: "Activating stockout-risk monitoring.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "Demand-heavy regions for footwear and outerwear best sellers",
      controlAudienceLabel: "Baseline region set kept on the current inventory posture",
      scenarioA: {
        activationPath: "Aggressive rebalance into demand-heavy regions",
        treatmentDifference: "Transfer priority fast movers into North East and London demand clusters.",
        expectedImpact: "+6.4% sell-through and lower stockout pressure",
        guardrail: "Cancel if source-region cover falls below 14 days.",
      },
      scenarioB: {
        activationPath: "Conservative rebalance with narrower SKU set",
        treatmentDifference: "Move only the top-performing SKUs with the highest demand confidence.",
        expectedImpact: "Smaller sell-through lift with lower transfer cost",
        guardrail: "Escalate if demand uplift weakens mid-cycle.",
      },
      holdout: {
        activationPath: "Current regional allocation",
        treatmentDifference: "Keep existing regional distribution in place.",
        expectedImpact: "Baseline sell-through and stockout benchmark",
        guardrail: "Observe regional demand drift only.",
      },
    }),
    panels: [
      {
        id: "regions",
        title: "Regional Demand",
        subtitle: "Imbalance analysis",
        badgeValues: valueSeries("Scanning", "Ready", "Ready", "Live"),
        fields: [
          { label: "High-pressure regions", values: valueSeries("Pending", "North East / London", "North East / London", "North East / London"), tone: "warning" },
          { label: "Source regions", values: valueSeries("Pending", "Midlands / South West", "Midlands / South West", "Midlands / South West") },
          { label: "Risk tier", values: valueSeries("Pending", "Elevated", "Elevated", "Elevated") },
        ],
      },
      {
        id: "transfers",
        title: "Transfer Plan",
        subtitle: "Stock movement",
        badgeValues: valueSeries("Draft", "Built", "Submitted", "Submitted"),
        fields: [
          { label: "Priority SKUs", values: valueSeries("—", "Outerwear / Footwear", "Outerwear / Footwear", "Outerwear / Footwear") },
          { label: "Movement volume", values: valueSeries("—", "4,800 units", "4,800 units", "4,800 units"), tone: "accent" },
          { label: "Ops status", values: valueSeries("Queued", "Queued", "Accepted by fulfillment", "Accepted by fulfillment") },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring",
        subtitle: "Stock health checks",
        badgeValues: valueSeries("Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "Stockout alerts", values: valueSeries("Off", "Enabled", "Enabled", "Enabled"), tone: "success" },
          { label: "Sell-through watch", values: valueSeries("Off", "Enabled", "Enabled", "Enabled") },
          { label: "Critical threshold", values: valueSeries("Pending", "14 days cover", "14 days cover", "14 days cover") },
        ],
      },
    ],
  },
  "promote-bundles": {
    actionId: "promote-bundles",
    title: "Promote Bundle Cross-Sells",
    subtitle: "Cross-sell agent configuring attach-rate bundle placements.",
    surfaceTitle: "Bundle Merchandising Studio",
    surfaceSubtitle: "Cross-sell promotion controls",
    monitoringLabel: "Monitoring attach rate and AOV uplift for live bundle placements.",
    steps: [
      { label: "Find combinations", detail: "Ranking high-affinity bundle pairs.", status: "validating", focusPanelId: "bundles" },
      { label: "Place bundles", detail: "Pinning bundles to priority PDPs.", status: "publishing", focusPanelId: "placements" },
      { label: "Publish rules", detail: "Deploying dynamic ranking logic.", status: "publishing", focusPanelId: "placements" },
      { label: "Track uplift", detail: "Starting AOV and attach-rate monitoring.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "Basket builders on top-traffic PDP and cart journeys",
      controlAudienceLabel: "Matched bundle holdout served the current recommendation layout",
      scenarioA: {
        activationPath: "Pinned bundle placements on top PDPs",
        treatmentDifference: "Promote curated bundle combinations in the highest-visibility recommendation slots.",
        expectedImpact: "+4.9% AOV and attach-rate lift",
        guardrail: "Rotate out underperforming bundles automatically.",
      },
      scenarioB: {
        activationPath: "Cart-stage bundle prompt only",
        treatmentDifference: "Show bundle offers later in the cart instead of on PDPs.",
        expectedImpact: "Smaller AOV lift with lower merchandising disruption",
        guardrail: "Retire if attach rate stays below 5%.",
      },
      holdout: {
        activationPath: "Current recommendation layout",
        treatmentDifference: "Keep the existing merchandising sequence unchanged.",
        expectedImpact: "Baseline attach-rate and AOV benchmark",
        guardrail: "Observe without intervention.",
      },
    }),
    panels: [
      {
        id: "bundles",
        title: "Bundle Set",
        subtitle: "High-affinity combinations",
        badgeValues: valueSeries("Draft", "Ranked", "Ranked", "Live"),
        fields: [
          { label: "Top pairings", values: valueSeries("Pending", "Accessory / Footwear", "Accessory / Footwear", "Accessory / Footwear"), tone: "accent" },
          { label: "Pages targeted", values: valueSeries("0", "20 PDPs", "20 PDPs", "20 PDPs") },
          { label: "Ranking source", values: valueSeries("Pending", "Affinity score", "Affinity score", "Affinity score") },
        ],
      },
      {
        id: "placements",
        title: "Placement Rules",
        subtitle: "On-site merchandising",
        badgeValues: valueSeries("Queued", "Configuring", "Published", "Published"),
        fields: [
          { label: "Pin position", values: valueSeries("Pending", "Mid-page recommendation slot", "Mid-page recommendation slot", "Mid-page recommendation slot") },
          { label: "Fallback", values: valueSeries("Pending", "Rotate low-performing pairs", "Rotate low-performing pairs", "Rotate low-performing pairs") },
          { label: "Attach target", values: valueSeries("Pending", "8% attach rate", "8% attach rate", "8% attach rate"), tone: "success" },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring",
        subtitle: "AOV and attach checks",
        badgeValues: valueSeries("Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "AOV watch", values: valueSeries("Off", "Enabled", "Enabled", "Enabled") },
          { label: "Attach-rate watch", values: valueSeries("Off", "Enabled", "Enabled", "Enabled") },
          { label: "Re-rotation trigger", values: valueSeries("Pending", "Underperforming pair replacement", "Underperforming pair replacement", "Underperforming pair replacement") },
        ],
      },
    ],
  },
  "improve-checkout": {
    actionId: "improve-checkout",
    title: "Improve Checkout Completion",
    subtitle: "Checkout optimization agent applying payment-step defaults.",
    surfaceTitle: "Checkout Configuration Console",
    surfaceSubtitle: "Conversion recovery workflow",
    monitoringLabel: "Monitoring checkout completion, abandonment, and payment failures.",
    steps: [
      { label: "Validate funnel", detail: "Confirming top drop-off on mobile payment.", status: "validating", focusPanelId: "funnel" },
      { label: "Apply defaults", detail: "Prioritizing express payment options.", status: "publishing", focusPanelId: "payment" },
      { label: "Publish UX change", detail: "Sending checkout config live.", status: "publishing", focusPanelId: "payment" },
      { label: "Monitor delta", detail: "Tracking conversion and failure-rate delta.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "Mobile checkout users eligible for express payment",
      controlAudienceLabel: "Mobile checkout holdout kept on the current payment-step layout",
      scenarioA: {
        activationPath: "Express payment promoted as the default",
        treatmentDifference: "Move express payment above the fold and preserve legacy fallback routing.",
        expectedImpact: "+1.1pp checkout completion",
        guardrail: "Rollback if payment failures rise above baseline.",
      },
      scenarioB: {
        activationPath: "Streamlined card-entry treatment",
        treatmentDifference: "Keep express payment secondary but shorten the card-entry step.",
        expectedImpact: "Smaller completion lift with less payment-path disruption",
        guardrail: "Escalate if abandonment remains elevated.",
      },
      holdout: {
        activationPath: "Current mobile checkout flow",
        treatmentDifference: "Retain the existing payment-step hierarchy.",
        expectedImpact: "Baseline conversion and payment-failure benchmark",
        guardrail: "Observe without changing routing.",
      },
    }),
    panels: [
      {
        id: "funnel",
        title: "Funnel Insight",
        subtitle: "Checkout friction source",
        badgeValues: valueSeries("Scanning", "Ready", "Ready", "Ready"),
        fields: [
          { label: "Primary drop-off", values: valueSeries("Pending", "Mobile payment step", "Mobile payment step", "Mobile payment step"), tone: "warning" },
          { label: "Affected sessions", values: valueSeries("Pending", "18.4% of mobile carts", "18.4% of mobile carts", "18.4% of mobile carts") },
          { label: "Recommended fix", values: valueSeries("Pending", "Express payment default", "Express payment default", "Express payment default") },
        ],
      },
      {
        id: "payment",
        title: "Payment Configuration",
        subtitle: "Express checkout controls",
        badgeValues: valueSeries("Draft", "Editing", "Published", "Live"),
        fields: [
          { label: "Express payment", values: valueSeries("Secondary", "Primary", "Primary", "Primary"), tone: "success" },
          { label: "Fallback routing", values: valueSeries("Legacy", "Preserved", "Preserved", "Preserved") },
          { label: "Failure guardrail", values: valueSeries("Pending", "Rollback on failure-rate rise", "Rollback on failure-rate rise", "Rollback on failure-rate rise") },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring",
        subtitle: "Completion and payment checks",
        badgeValues: valueSeries("Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "Completion KPI", values: valueSeries("Off", "Enabled", "Enabled", "Enabled") },
          { label: "Abandonment alerts", values: valueSeries("Off", "Enabled", "Enabled", "Enabled") },
          { label: "Scan cadence", values: valueSeries("Daily", "Hourly", "Hourly", "Hourly") },
        ],
      },
    ],
  },
  "reduce-returns": {
    actionId: "reduce-returns",
    title: "Reduce Returns on Key Categories",
    subtitle: "Return-control agent publishing risk guidance and alerts.",
    surfaceTitle: "Return Risk Console",
    surfaceSubtitle: "Category guidance deployment",
    monitoringLabel: "Monitoring category-level return-rate deltas and worsening SKUs.",
    steps: [
      { label: "Map return drivers", detail: "Finding highest-risk categories.", status: "validating", focusPanelId: "drivers" },
      { label: "Publish guidance", detail: "Enabling return-risk guidance blocks.", status: "publishing", focusPanelId: "guidance" },
      { label: "Enable alerts", detail: "Turning on product-level warning rules.", status: "publishing", focusPanelId: "guidance" },
      { label: "Track impact", detail: "Starting return-rate impact monitoring.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "Shoppers browsing high-return fashion categories",
      controlAudienceLabel: "Matched category holdout kept on the current product guidance",
      scenarioA: {
        activationPath: "Return-risk guidance across high-return categories",
        treatmentDifference: "Show fit messaging and return alerts before add-to-cart.",
        expectedImpact: "-0.9pp return-rate reduction",
        guardrail: "Pause if conversion drop exceeds tolerance.",
      },
      scenarioB: {
        activationPath: "Guidance on the highest-risk SKUs only",
        treatmentDifference: "Restrict return messaging to the worst-performing SKU subset.",
        expectedImpact: "Smaller return-rate improvement with lighter UX change",
        guardrail: "Expand only if early results stay positive.",
      },
      holdout: {
        activationPath: "Current category guidance baseline",
        treatmentDifference: "Keep the existing product detail experience unchanged.",
        expectedImpact: "Baseline return trend benchmark",
        guardrail: "Observe naturally.",
      },
    }),
    panels: [
      {
        id: "drivers",
        title: "Return Drivers",
        subtitle: "Category concentration",
        badgeValues: valueSeries("Scanning", "Ready", "Ready", "Ready"),
        fields: [
          { label: "Top categories", values: valueSeries("Pending", "Fashion / Footwear", "Fashion / Footwear", "Fashion / Footwear"), tone: "warning" },
          { label: "Primary issue", values: valueSeries("Pending", "Fit mismatch", "Fit mismatch", "Fit mismatch") },
          { label: "Risk rank", values: valueSeries("Pending", "High", "High", "High") },
        ],
      },
      {
        id: "guidance",
        title: "Guidance Blocks",
        subtitle: "Pre-purchase controls",
        badgeValues: valueSeries("Draft", "Editing", "Published", "Published"),
        fields: [
          { label: "Risk message", values: valueSeries("Off", "On", "On", "On"), tone: "success" },
          { label: "Detail check", values: valueSeries("Queued", "Expanded fit notes", "Expanded fit notes", "Expanded fit notes") },
          { label: "Alerting", values: valueSeries("Off", "Queued", "Product-level alerts", "Product-level alerts") },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring",
        subtitle: "Return delta checks",
        badgeValues: valueSeries("Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "Category KPI", values: valueSeries("Off", "Enabled", "Enabled", "Enabled") },
          { label: "Escalation rule", values: valueSeries("Pending", "Flag worsening SKUs", "Flag worsening SKUs", "Flag worsening SKUs") },
          { label: "Reporting cadence", values: valueSeries("Daily", "Daily", "Daily", "Daily") },
        ],
      },
    ],
  },
  "launch-loyalty": {
    actionId: "launch-loyalty",
    title: "Launch Loyalty Reactivation Push",
    subtitle: "Retention agent activating a dormant-loyalty recovery sequence.",
    surfaceTitle: "Loyalty Reactivation Console",
    surfaceSubtitle: "Dormant loyalty sequence deployment",
    monitoringLabel: "Monitoring repeat-order recovery, redemption, and unsubscribe rate after launch.",
    steps: [
      { label: "Score dormant cohort", detail: "Selecting dormant repeat buyers with recovery potential.", status: "validating", focusPanelId: "audience" },
      { label: "Configure offer sequence", detail: "Applying incentive and timing rules to the recovery journey.", status: "publishing", focusPanelId: "offer" },
      { label: "Enable email + push", detail: "Activating coordinated email and push delivery.", status: "publishing", focusPanelId: "channels" },
      { label: "Publish campaign", detail: "Sending the loyalty recovery journey live.", status: "publishing", focusPanelId: "campaign" },
      { label: "Activate monitoring", detail: "Watching repeat-order recovery and fatigue signals.", status: "live", focusPanelId: "monitoring" },
    ],
    scenarios: createScenarioCarousel({
      primaryAudienceLabel: "Dormant repeat buyers eligible for loyalty reactivation",
      controlAudienceLabel: "Dormant loyalty holdout kept on the current CRM baseline",
      scenarioA: {
        activationPath: "Email + push loyalty reactivation sequence",
        treatmentDifference: "Launch coordinated email and push with a 15% recovery offer.",
        expectedImpact: "+7.3% repeat-order recovery",
        guardrail: "Auto-pause if unsubscribe exceeds 1.8%.",
      },
      scenarioB: {
        activationPath: "Email-first loyalty recovery path",
        treatmentDifference: "Launch the same sequence but hold push until day 3 engagement signals arrive.",
        expectedImpact: "Softer repeat-order lift with lower fatigue risk",
        guardrail: "Escalate if redemption stalls after day 3.",
      },
      holdout: {
        activationPath: "Current loyalty CRM baseline",
        treatmentDifference: "Keep dormant buyers on the existing loyalty cadence for comparison.",
        expectedImpact: "Baseline repeat-order and fatigue benchmark",
        guardrail: "Observe recovery without intervention.",
      },
    }),
    panels: [
      {
        id: "audience",
        title: "Audience Builder",
        subtitle: "Dormant loyalty members",
        badgeValues: valueSeries("Draft", "Loaded", "Loaded", "Loaded", "Live"),
        fields: [
          { label: "Target cohort", values: valueSeries("Pending", "Dormant repeat buyers", "Dormant repeat buyers", "Dormant repeat buyers", "Dormant repeat buyers"), tone: "accent" },
          { label: "Eligible members", values: valueSeries("0", "18,420", "18,420", "18,420", "18,420") },
          { label: "Eligibility rule", values: valueSeries("Pending", "No order in 45+ days", "No order in 45+ days", "No order in 45+ days", "No order in 45+ days") },
        ],
      },
      {
        id: "offer",
        title: "Offer Sequence",
        subtitle: "Recovery incentive and cadence",
        badgeValues: valueSeries("Draft", "Draft", "Configured", "Configured", "Live"),
        fields: [
          { label: "Incentive", values: valueSeries("Pending", "Pending", "15% reactivation offer", "15% reactivation offer", "15% reactivation offer"), tone: "success" },
          { label: "Cadence", values: valueSeries("Pending", "Pending", "Day 0 / Day 3 / Day 8", "Day 0 / Day 3 / Day 8", "Day 0 / Day 3 / Day 8") },
          { label: "Expiration", values: valueSeries("Pending", "Pending", "10-day validity", "10-day validity", "10-day validity") },
        ],
      },
      {
        id: "channels",
        title: "Channel Activation",
        subtitle: "Email and push delivery",
        badgeValues: valueSeries("Off", "Off", "Queued", "Active", "Active"),
        fields: [
          { label: "Email", values: valueSeries("Disabled", "Disabled", "Prepared", "Enabled", "Enabled"), tone: "success" },
          { label: "Push", values: valueSeries("Disabled", "Disabled", "Prepared", "Enabled", "Enabled"), tone: "success" },
          { label: "Suppression check", values: valueSeries("Pending", "Pending", "Respecting consent + fatigue", "Respecting consent + fatigue", "Respecting consent + fatigue") },
        ],
      },
      {
        id: "campaign",
        title: "Campaign State",
        subtitle: "Publish and guardrails",
        badgeValues: valueSeries("Draft", "Draft", "Draft", "Publishing", "Live"),
        fields: [
          { label: "Journey status", values: valueSeries("Draft", "Validated", "Ready", "Publishing", "Live"), tone: "accent" },
          { label: "Rollback rule", values: valueSeries("Pending", "Pending", "Pause on unsub spike", "Pause on unsub spike", "Pause on unsub spike") },
          { label: "Recovery target", values: valueSeries("Pending", "Pending", "7.3% repeat orders", "7.3% repeat orders", "7.3% repeat orders") },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring Agent",
        subtitle: "Recovery and fatigue signals",
        badgeValues: valueSeries("Idle", "Idle", "Arming", "Arming", "Active"),
        fields: [
          { label: "Repeat-order watch", values: valueSeries("Off", "Off", "Queued", "Queued", "Enabled"), tone: "success" },
          { label: "Redemption tracking", values: valueSeries("Off", "Off", "Queued", "Queued", "Enabled") },
          { label: "Unsubscribe guardrail", values: valueSeries("Pending", "Pending", "> 1.8% auto-pause", "> 1.8% auto-pause", "> 1.8% auto-pause"), tone: "warning" },
        ],
      },
    ],
  },
};

export function buildExecutionPreviewSrc(
  actionId: NBAActionId,
  run: string,
  experimentId?: string | null,
) {
  const params = new URLSearchParams({
    actionId,
    run,
  });
  if (experimentId) {
    params.set("experimentId", experimentId);
  }

  return `/chat/execution-preview?${params.toString()}`;
}

export function getExecutionPreviewScene(actionId: NBAActionId) {
  return EXECUTION_PREVIEW_SCENES[actionId];
}
