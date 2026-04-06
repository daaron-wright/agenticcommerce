import { ecommerceDashboardData } from "@/lib/dashboard/mock-ecommerce";
import {
  SERVICES,
  fmtCurrencyShort,
  getAllAuditEvents,
  getAllSignals,
  getPortfolioKPIs,
} from "@/lib/risk/cyber-risk-data";

export type KnowledgeGraphDomain = "udp" | "demand" | "risk" | "cross-domain";

export type KnowledgeGraphNodeType =
  | "customer"
  | "segment"
  | "product"
  | "vendor"
  | "location"
  | "campaign"
  | "service"
  | "identity_profile"
  | "consent_record"
  | "forecast"
  | "inventory_signal"
  | "risk_assessment"
  | "control"
  | "alert"
  | "issue"
  | "recommendation"
  | "action"
  | "approval"
  | "audit_event";

export type KnowledgeGraphEdgeType =
  | "belongs_to"
  | "linked_to"
  | "affects"
  | "derived_from"
  | "at_risk_from"
  | "recommended_by"
  | "approved_by"
  | "routed_to"
  | "monitored_by"
  | "supplied_by"
  | "governed_by"
  | "triggers"
  | "depends_on";

export type KnowledgeGraphPresetId =
  | "full-graph"
  | "udp-neighborhood"
  | "demand-chain"
  | "vendor-risk-path"
  | "story-neighborhood";

export interface KnowledgeGraphNodeAction {
  label: string;
  href: string;
}

export interface KnowledgeGraphNodeAttribute {
  label: string;
  value: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: KnowledgeGraphNodeType;
  domain: KnowledgeGraphDomain;
  summary: string;
  position: { x: number; y: number };
  routeHref: string;
  routeLabel: string;
  attributes: KnowledgeGraphNodeAttribute[];
  tags?: string[];
  suggestedActions?: KnowledgeGraphNodeAction[];
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: KnowledgeGraphEdgeType;
  domain: KnowledgeGraphDomain;
  label: string;
}

export interface KnowledgeGraphNeighborhood {
  id: string;
  title: string;
  description: string;
  preset: KnowledgeGraphPresetId;
  centerNodeId: string;
  nodeIds: string[];
}

export interface KnowledgeGraphPreset {
  id: KnowledgeGraphPresetId;
  label: string;
  description: string;
  defaultNeighborhoodId?: string;
}

export interface KnowledgeGraphFilterState {
  query: string;
  domains: KnowledgeGraphDomain[];
  nodeTypes: KnowledgeGraphNodeType[];
  preset: KnowledgeGraphPresetId;
  activeNeighborhoodId?: string | null;
}

export interface KnowledgeGraphLinkOptions {
  graphPreset?: string;
  graphScopeId?: string;
  graphCenterNodeId?: string;
}

export const KNOWLEDGE_GRAPH_DOMAIN_LABELS: Record<KnowledgeGraphDomain, string> = {
  udp: "UDP / CDP",
  demand: "Demand Planning",
  risk: "Vendor Risk",
  "cross-domain": "Cross-domain",
};

export const VISIBLE_KNOWLEDGE_GRAPH_DOMAINS: KnowledgeGraphDomain[] = [
  "cross-domain",
  "udp",
  "demand",
];

export const KNOWLEDGE_GRAPH_NODE_TYPE_LABELS: Record<KnowledgeGraphNodeType, string> = {
  customer: "Customer",
  segment: "Segment",
  product: "Product / SKU",
  vendor: "Vendor",
  location: "Location / DC",
  campaign: "Campaign",
  service: "Service",
  identity_profile: "Identity Profile",
  consent_record: "Consent Record",
  forecast: "Forecast",
  inventory_signal: "Inventory Signal",
  risk_assessment: "Risk Assessment",
  control: "Control",
  alert: "Alert",
  issue: "Issue",
  recommendation: "Recommendation",
  action: "Action",
  approval: "Approval",
  audit_event: "Audit Event",
};

export const KNOWLEDGE_GRAPH_EDGE_TYPE_LABELS: Record<KnowledgeGraphEdgeType, string> = {
  belongs_to: "belongs to",
  linked_to: "linked to",
  affects: "affects",
  derived_from: "derived from",
  at_risk_from: "at risk from",
  recommended_by: "recommended by",
  approved_by: "approved by",
  routed_to: "routed to",
  monitored_by: "monitored by",
  supplied_by: "supplied by",
  governed_by: "governed by",
  triggers: "triggers",
  depends_on: "depends on",
};

const riskPortfolio = getPortfolioKPIs();
const riskSignals = getAllSignals();
const riskAuditTrail = getAllAuditEvents();
const fastFreightSignal = riskSignals.find((signal) =>
  signal.serviceName.toLowerCase().includes("payment"),
);
const fastFreightAudit = riskAuditTrail.find((event) =>
  event.details.toLowerCase().includes("vulnerability"),
);
const revenueKpi = ecommerceDashboardData.kpis.find((kpi) => kpi.label === "Gross Revenue");
const conversionKpi = ecommerceDashboardData.kpis.find((kpi) => kpi.label === "Conversion Rate");
const criticalProduct =
  ecommerceDashboardData.topProducts.find((product) => product.isCriticalWarning) ??
  ecommerceDashboardData.topProducts[0];
const paymentService =
  SERVICES.find((service) => service.id === "payment-gateway") ?? SERVICES[0];
const ecommerceService =
  SERVICES.find((service) => service.id === "ecommerce-platform") ?? SERVICES[1] ?? SERVICES[0];

export const KNOWLEDGE_GRAPH_PRESETS: KnowledgeGraphPreset[] = [
  {
    id: "full-graph",
    label: "Full graph",
    description: "See the complete cross-domain semantic graph.",
  },
  {
    id: "udp-neighborhood",
    label: "UDP neighborhood",
    description: "Identity, consent, customer, and campaign readiness relationships.",
    defaultNeighborhoodId: "udp-consent-readiness",
  },
  {
    id: "demand-chain",
    label: "Demand chain",
    description: "Forecast, stockout, supplier, DC, and approval relationships.",
    defaultNeighborhoodId: "demand-stockout-chain",
  },
  {
    id: "story-neighborhood",
    label: "Story neighborhood",
    description: "The curated control-tower story linking UDP, commercial activation, and demand planning.",
    defaultNeighborhoodId: "control-tower-story",
  },
];

export const KNOWLEDGE_GRAPH_NODES: KnowledgeGraphNode[] = [
  {
    id: "graph-control-tower",
    label: "Unified Control Tower",
    type: "alert",
    domain: "cross-domain",
    summary:
      "The operator surface that triages active alerts, open approvals, and cross-domain actions.",
    position: { x: 770, y: 40 },
    routeHref: "/dashboard",
    routeLabel: "Open Control Tower",
    attributes: [
      { label: "Active alerts", value: "10" },
      { label: "Pending actions", value: "6" },
      { label: "Data freshness", value: "Updated 8 min ago" },
    ],
    tags: ["operator", "control tower", "cross-domain", "dashboard"],
    suggestedActions: [
      { label: "Return to control tower", href: "/dashboard" },
      { label: "Ask the assistant", href: "/chat" },
    ],
  },
  {
    id: "graph-fresh-demand-segment",
    label: "Fresh Demand Growth Segment",
    type: "segment",
    domain: "cross-domain",
    summary:
      "A cross-domain segment combining loyalty, consent readiness, and propensity for chilled-meal demand uplift.",
    position: { x: 540, y: 185 },
    routeHref: "/audiences",
    routeLabel: "Open Audiences",
    attributes: [
      { label: "Audience size", value: "84.2K profiles" },
      { label: "Consent ready", value: "87.6%" },
      { label: "Demand lift", value: "+14% chilled meals" },
    ],
    tags: ["segment", "demand sensing", "customer intent"],
    suggestedActions: [
      { label: "Review audience", href: "/audiences" },
      { label: "Open UDP dashboard", href: "/udp/dashboard" },
    ],
  },
  {
    id: "graph-customer-household",
    label: "Household H-2048",
    type: "customer",
    domain: "udp",
    summary:
      "Representative unified customer household used to explain how identity, consent, and demand signals connect.",
    position: { x: 120, y: 110 },
    routeHref: "/customers",
    routeLabel: "Open Customers",
    attributes: [
      { label: "Lifetime value", value: "£4.8K" },
      { label: "Preferred channel", value: "Email + mobile" },
      { label: "Fresh meals affinity", value: "High" },
    ],
    tags: ["customer", "household", "loyalty"],
    suggestedActions: [
      { label: "Inspect customer records", href: "/customers" },
      { label: "Review identity exceptions", href: "/udp/dashboard" },
    ],
  },
  {
    id: "graph-identity-profile",
    label: "Identity Graph Cluster 1,240",
    type: "identity_profile",
    domain: "udp",
    summary:
      "Cross-channel identity cluster representing the merge exceptions currently blocking clean downstream activation.",
    position: { x: 120, y: 250 },
    routeHref: "/customers",
    routeLabel: "Review Customer Records",
    attributes: [
      { label: "Failed merges", value: "1,240" },
      { label: "Duplicate households", value: "216" },
      { label: "Primary issue", value: "Malformed email IDs" },
    ],
    tags: ["identity", "merge exception", "customer 360"],
    suggestedActions: [
      { label: "Route to UDP team", href: "/udp/dashboard" },
      { label: "Open customer records", href: "/customers" },
    ],
  },
  {
    id: "graph-consent-record",
    label: "Consent Conflict Cluster",
    type: "consent_record",
    domain: "udp",
    summary:
      "Channel consent conflicts from the refresh campaign that currently pause activation and downstream demand-driven targeting.",
    position: { x: 120, y: 390 },
    routeHref: "/consent",
    routeLabel: "Open Consent Controls",
    attributes: [
      { label: "Conflicting records", value: "37" },
      { label: "Email mismatches", value: "21" },
      { label: "SMS mismatches", value: "16" },
    ],
    tags: ["consent", "privacy", "activation"],
    suggestedActions: [
      { label: "Review consent state", href: "/consent" },
      { label: "Open control tower alert", href: "/dashboard" },
    ],
  },
  {
    id: "graph-spring-refresh-campaign",
    label: "Spring Refresh Campaign",
    type: "campaign",
    domain: "udp",
    summary:
      "Consent refresh campaign linked to downstream activation readiness and customer demand sensing.",
    position: { x: 360, y: 125 },
    routeHref: "/campaigns",
    routeLabel: "Open Campaigns",
    attributes: [
      { label: "Re-consent rate", value: "84.3%" },
      { label: "Primary channel", value: "Email" },
      { label: "Status", value: "Paused for conflicts" },
    ],
    tags: ["campaign", "consent refresh", "activation"],
    suggestedActions: [
      { label: "Open campaigns", href: "/campaigns" },
      { label: "Inspect audience", href: "/audiences" },
    ],
  },
  {
    id: "graph-udp-alert",
    label: "Consent Conflict Alert",
    type: "alert",
    domain: "udp",
    summary:
      "Control-tower alert raised because conflicting consent states could invalidate downstream activation and analytics.",
    position: { x: 360, y: 305 },
    routeHref: "/dashboard",
    routeLabel: "Open Control Tower",
    attributes: [
      { label: "Severity", value: "Medium" },
      { label: "Records affected", value: "37" },
      { label: "Timestamp", value: "09:30" },
    ],
    tags: ["alert", "consent", "operator review"],
    suggestedActions: [
      { label: "Review alert", href: "/dashboard" },
      { label: "Open graph neighborhood", href: buildKnowledgeGraphHref({ graphPreset: "udp-neighborhood", graphScopeId: "udp-consent-readiness", graphCenterNodeId: "graph-consent-record" }) },
    ],
  },
  {
    id: "graph-udp-action",
    label: "Resolve Identity Merge Exceptions",
    type: "action",
    domain: "udp",
    summary:
      "Operator work item to route malformed identity and duplicate household records to the UDP team for remediation.",
    position: { x: 360, y: 470 },
    routeHref: "/udp/dashboard",
    routeLabel: "Open UDP Dashboard",
    attributes: [
      { label: "Owner", value: "UDP operations" },
      { label: "Due", value: "Today" },
      { label: "Impact", value: "Activation readiness" },
    ],
    tags: ["action", "identity", "data quality"],
    suggestedActions: [
      { label: "Open UDP dashboard", href: "/udp/dashboard" },
      { label: "Inspect customer records", href: "/customers" },
    ],
  },
  {
    id: "graph-manchester-dc",
    label: "Northeast DC",
    type: "location",
    domain: "demand",
    summary:
      "Distribution center under stockout pressure for chilled and perishable categories.",
    position: { x: 730, y: 285 },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    attributes: [
      { label: "Weeks of cover", value: "1.8" },
      { label: "Priority risk", value: "Perishables" },
      { label: "Inbound pressure", value: "Tariff disruptions" },
    ],
    tags: ["dc", "inventory", "fulfillment"],
    suggestedActions: [
      { label: "Open demand dashboard", href: "/demand/dashboard" },
      { label: "Review analytics", href: "/demand/analytics" },
    ],
  },
  {
    id: "graph-chilled-ready-meals",
    label: "Chilled Ready Meals",
    type: "product",
    domain: "demand",
    summary:
      "Category under forecast pressure due to weather-driven demand uplift and fresh demand segment activity.",
    position: { x: 730, y: 120 },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    attributes: [
      { label: "Category uplift", value: "+15%" },
      { label: "Waste pressure", value: "Moderate" },
      { label: "Fill rate risk", value: "High" },
    ],
    tags: ["category", "demand", "perishable"],
    suggestedActions: [
      { label: "Review demand dashboard", href: "/demand/dashboard" },
      { label: "Open reports", href: "/demand/reports" },
    ],
  },
  {
    id: "graph-chicken-tikka-sku",
    label: "Chicken Tikka SKU-8821",
    type: "product",
    domain: "demand",
    summary:
      "The highest-priority understocked SKU in the emergency reorder approval chain.",
    position: { x: 970, y: 115 },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    attributes: [
      { label: "Cover remaining", value: "2 days" },
      { label: "Reorder quantity", value: "12,000 cases" },
      { label: "Exposure", value: "£43,200" },
    ],
    tags: ["sku", "understock", "reorder"],
    suggestedActions: [
      { label: "Open demand dashboard", href: "/demand/dashboard" },
      { label: "View graph path", href: buildKnowledgeGraphHref({ graphPreset: "demand-chain", graphScopeId: "demand-stockout-chain", graphCenterNodeId: "graph-chicken-tikka-sku" }) },
    ],
  },
  {
    id: "graph-demand-forecast",
    label: "Heatwave Demand Forecast",
    type: "forecast",
    domain: "demand",
    summary:
      "Forecast adjustment model recommending a 15% uplift for chilled dairy and meal categories over the next 7 days.",
    position: { x: 970, y: 265 },
    routeHref: "/demand/analytics",
    routeLabel: "Open Demand Analytics",
    attributes: [
      { label: "Forecast accuracy", value: "76.4%" },
      { label: "Adjustment", value: "+15%" },
      { label: "Window", value: "Next 7 days" },
    ],
    tags: ["forecast", "weather", "demand sensing"],
    suggestedActions: [
      { label: "Inspect demand analytics", href: "/demand/analytics" },
      { label: "Approve model adjustment", href: "/demand/dashboard" },
    ],
  },
  {
    id: "graph-inventory-signal",
    label: "Inventory Cover Signal",
    type: "inventory_signal",
    domain: "demand",
    summary:
      "Below-threshold cover signal generated when Manchester DC inventory fell under perishable safety stock targets.",
    position: { x: 970, y: 410 },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    attributes: [
      { label: "Signal severity", value: "Critical" },
      { label: "Categories impacted", value: "3" },
      { label: "Revenue at risk", value: "£576K" },
    ],
    tags: ["inventory signal", "stockout", "fulfillment"],
    suggestedActions: [
      { label: "Open demand dashboard", href: "/demand/dashboard" },
      { label: "Review forecast path", href: buildKnowledgeGraphHref({ graphPreset: "demand-chain", graphCenterNodeId: "graph-demand-forecast", graphScopeId: "demand-stockout-chain" }) },
    ],
  },
  {
    id: "graph-matheson-foods",
    label: "Matheson Foods",
    type: "vendor",
    domain: "demand",
    summary:
      "Primary chilled supplier in the emergency reorder flow. Delivery reliability affects the stockout response timeline.",
    position: { x: 1210, y: 135 },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    attributes: [
      { label: "Role", value: "Primary chilled supplier" },
      { label: "Delivery SLA", value: "5 business days" },
      { label: "Risk flag", value: "Route disruption" },
    ],
    tags: ["supplier", "vendor", "fulfillment"],
    suggestedActions: [
      { label: "Review demand approval", href: "/demand/dashboard" },
      { label: "Inspect risk dashboard", href: "/risk/dashboard" },
    ],
  },
  {
    id: "graph-demand-alert",
    label: "SKU Understock Alert",
    type: "alert",
    domain: "demand",
    summary:
      "Critical control-tower alert raised when perishable SKUs in Manchester DC dropped below safe cover.",
    position: { x: 1210, y: 305 },
    routeHref: "/dashboard",
    routeLabel: "Open Control Tower",
    attributes: [
      { label: "Severity", value: "Critical" },
      { label: "Timestamp", value: "11:56" },
      { label: "Decision window", value: "4 hours" },
    ],
    tags: ["alert", "stockout", "approval"],
    suggestedActions: [
      { label: "Review control tower alert", href: "/dashboard" },
      { label: "Open graph chain", href: buildKnowledgeGraphHref({ graphPreset: "demand-chain", graphScopeId: "demand-stockout-chain", graphCenterNodeId: "graph-demand-alert" }) },
    ],
  },
  {
    id: "graph-demand-approval",
    label: "Emergency Reorder Approval",
    type: "approval",
    domain: "demand",
    summary:
      "Conditional operator approval to reorder critical chilled items, with automatic cancellation if delivery confirmation does not arrive.",
    position: { x: 1210, y: 470 },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    attributes: [
      { label: "Condition", value: "Auto-cancel after 5 days" },
      { label: "Scope", value: "3 Northeast DC SKUs" },
      { label: "Owner", value: "Supply operator" },
    ],
    tags: ["approval", "reorder", "policy engine"],
    suggestedActions: [
      { label: "Approve in demand dashboard", href: "/demand/dashboard" },
      { label: "Review graph detail", href: buildKnowledgeGraphHref({ graphPreset: "demand-chain", graphCenterNodeId: "graph-demand-approval", graphScopeId: "demand-stockout-chain" }) },
    ],
  },
  {
    id: "graph-demand-action",
    label: "Approve Heatwave Forecast Adjustment",
    type: "action",
    domain: "demand",
    summary:
      "Control-tower action to increase fresh demand forecasts by 15% to protect fill rate and reduce spoilage.",
    position: { x: 730, y: 535 },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    attributes: [
      { label: "Impact", value: "Fill rate to 97.5%" },
      { label: "Waste effect", value: "Lower spoilage risk" },
      { label: "Due", value: "Tomorrow" },
    ],
    tags: ["action", "forecast", "heatwave"],
    suggestedActions: [
      { label: "Open demand dashboard", href: "/demand/dashboard" },
      { label: "Inspect forecast", href: "/demand/analytics" },
    ],
  },
  {
    id: "graph-fastfreight-vendor",
    label: "FastFreight Logistics",
    type: "vendor",
    domain: "risk",
    summary:
      "Third-party logistics vendor with elevated exposure and active remediation review in the control tower.",
    position: { x: 1450, y: 120 },
    routeHref: "/risk/vendors",
    routeLabel: "Open Vendor Risk",
    attributes: [
      { label: "Risk score", value: "71" },
      { label: "ALE", value: "$1.1M" },
      { label: "Status", value: "Escalated" },
    ],
    tags: ["vendor", "third party", "logistics"],
    suggestedActions: [
      { label: "Review vendor risk", href: "/risk/vendors" },
      { label: "Open graph risk path", href: buildKnowledgeGraphHref({ graphPreset: "vendor-risk-path", graphScopeId: "risk-escalation-path", graphCenterNodeId: "graph-fastfreight-vendor" }) },
    ],
  },
  {
    id: "graph-payment-service",
    label: paymentService.name,
    type: "service",
    domain: "risk",
    summary:
      "Critical service from the risk portfolio whose exposure pattern is used in the control tower to quantify financial impact.",
    position: { x: 1450, y: 260 },
    routeHref: `/vendor/${paymentService.id}`,
    routeLabel: "Open Service Detail",
    attributes: [
      { label: "Category", value: paymentService.category },
      { label: "Risk band", value: paymentService.riskBand },
      { label: "ALE", value: fmtCurrencyShort(paymentService.ale) },
    ],
    tags: ["service", "portfolio", "financial exposure"],
    suggestedActions: [
      { label: "Open service detail", href: `/vendor/${paymentService.id}` },
      { label: "View risk dashboard", href: "/risk/dashboard" },
    ],
  },
  {
    id: "graph-risk-assessment",
    label: "Vendor Risk Assessment",
    type: "risk_assessment",
    domain: "risk",
    summary:
      "Portfolio model combining control gaps, open signals, and single-loss exposure into a reviewable risk posture.",
    position: { x: 1450, y: 400 },
    routeHref: "/risk/dashboard",
    routeLabel: "Open Risk Dashboard",
    attributes: [
      { label: "Portfolio ALE", value: `$${(riskPortfolio.totalALE / 1_000_000).toFixed(1)}M` },
      { label: "Services at risk", value: String(riskPortfolio.servicesAtRisk) },
      { label: "Controls coverage", value: `${riskPortfolio.controlsCoverage}%` },
    ],
    tags: ["assessment", "ale", "control gaps"],
    suggestedActions: [
      { label: "Open risk dashboard", href: "/risk/dashboard" },
      { label: "Inspect audit history", href: "/risk/audit" },
    ],
  },
  {
    id: "graph-risk-issue",
    label: fastFreightSignal?.title ?? "Backend Vulnerability Finding",
    type: "issue",
    domain: "risk",
    summary:
      fastFreightSignal?.description ??
      "Backend vulnerability finding correlated to vendor exposure and control-tower escalation.",
    position: { x: 1700, y: 125 },
    routeHref: "/risk/monitoring",
    routeLabel: "Open Threat Monitoring",
    attributes: [
      { label: "Severity", value: fastFreightSignal?.severity ?? "high" },
      { label: "Source agent", value: fastFreightSignal?.sourceAgent ?? "Threat Intel Agent" },
      { label: "Service context", value: fastFreightSignal?.serviceName ?? ecommerceService.name },
    ],
    tags: ["issue", "vulnerability", "threat intel"],
    suggestedActions: [
      { label: "Open threat monitoring", href: "/risk/monitoring" },
      { label: "Inspect vendor risk", href: "/risk/vendors" },
    ],
  },
  {
    id: "graph-segmentation-control",
    label: "Segmentation Control Plan",
    type: "control",
    domain: "risk",
    summary:
      "Compensating control recommended to reduce blast radius and lower projected loss exposure for the escalated vendor path.",
    position: { x: 1700, y: 280 },
    routeHref: "/risk/vendors",
    routeLabel: "Open Vendor Risk",
    attributes: [
      { label: "Control type", value: "Micro-segmentation" },
      { label: "Projected SLE reduction", value: "33%" },
      { label: "Review owner", value: "Vendor risk ops" },
    ],
    tags: ["control", "segmentation", "blast radius"],
    suggestedActions: [
      { label: "Review remediation", href: "/risk/vendors" },
      { label: "Inspect risk path", href: buildKnowledgeGraphHref({ graphPreset: "vendor-risk-path", graphScopeId: "risk-escalation-path", graphCenterNodeId: "graph-segmentation-control" }) },
    ],
  },
  {
    id: "graph-risk-alert",
    label: "FastFreight ALE Escalation",
    type: "alert",
    domain: "risk",
    summary:
      "High-priority control-tower alert that routes vendor exposure for review after new backend vulnerability findings.",
    position: { x: 1700, y: 430 },
    routeHref: "/dashboard",
    routeLabel: "Open Control Tower",
    attributes: [
      { label: "Severity", value: "High" },
      { label: "Timestamp", value: "10:42" },
      { label: "Current ALE", value: "$1.1M" },
    ],
    tags: ["alert", "vendor risk", "ale"],
    suggestedActions: [
      { label: "Review alert", href: "/dashboard" },
      { label: "Inspect graph neighborhood", href: buildKnowledgeGraphHref({ graphPreset: "vendor-risk-path", graphScopeId: "risk-escalation-path", graphCenterNodeId: "graph-risk-alert" }) },
    ],
  },
  {
    id: "graph-risk-action",
    label: "Escalate Vendor Remediation",
    type: "action",
    domain: "risk",
    summary:
      "Control-tower action that sends the FastFreight remediation decision to risk review rather than accepting temporary exposure.",
    position: { x: 1700, y: 560 },
    routeHref: "/risk/vendors",
    routeLabel: "Open Vendor Risk",
    attributes: [
      { label: "Decision path", value: "Review vs temporary exception" },
      { label: "Projected exposure reduction", value: "33%" },
      { label: "Due", value: "Tomorrow" },
    ],
    tags: ["action", "remediation", "vendor review"],
    suggestedActions: [
      { label: "Open vendor risk", href: "/risk/vendors" },
      { label: "Review audit trail", href: "/risk/audit" },
    ],
  },
  {
    id: "graph-risk-audit-event",
    label: fastFreightAudit?.eventType ?? "Audit Logger Event",
    type: "audit_event",
    domain: "risk",
    summary:
      fastFreightAudit?.details ??
      "Audit event proving how the exposure was detected, assessed, and routed for review.",
    position: { x: 1450, y: 585 },
    routeHref: "/risk/audit",
    routeLabel: "Open Assessment History",
    attributes: [
      { label: "Actor", value: fastFreightAudit?.actor ?? "Audit Logger" },
      { label: "Timestamp", value: fastFreightAudit?.timestamp ?? "02/22/2026 · 8:00 AM" },
      { label: "Source", value: fastFreightAudit?.serviceName ?? paymentService.name },
    ],
    tags: ["audit", "evidence", "lineage"],
    suggestedActions: [
      { label: "Open audit history", href: "/risk/audit" },
      { label: "Inspect risk dashboard", href: "/risk/dashboard" },
    ],
  },
  {
    id: "graph-graph-recommendation",
    label: "Knowledge Graph Recommendation",
    type: "recommendation",
    domain: "cross-domain",
    summary:
      "The semantic graph’s recommended next step: resolve UDP conflicts, approve the demand response, and continue vendor remediation review.",
    position: { x: 975, y: 645 },
    routeHref: "/dashboard",
    routeLabel: "Open Control Tower",
    attributes: [
      { label: "Priority path", value: "Resolve → approve → escalate" },
      { label: "Cross-domain impact", value: "Activation + fulfillment + resilience" },
      { label: "Generated from", value: "Curated operator graph" },
    ],
    tags: ["recommendation", "operator guidance", "story neighborhood"],
    suggestedActions: [
      { label: "Return to control tower", href: "/dashboard" },
      { label: "Open full graph", href: buildKnowledgeGraphHref({ graphPreset: "full-graph", graphCenterNodeId: "graph-control-tower" }) },
    ],
  },
];

export const KNOWLEDGE_GRAPH_EDGES: KnowledgeGraphEdge[] = [
  {
    id: "edge-customer-identity",
    source: "graph-customer-household",
    target: "graph-identity-profile",
    type: "linked_to",
    domain: "udp",
    label: "linked to identity cluster",
  },
  {
    id: "edge-customer-consent",
    source: "graph-customer-household",
    target: "graph-consent-record",
    type: "linked_to",
    domain: "udp",
    label: "linked to consent evidence",
  },
  {
    id: "edge-customer-segment",
    source: "graph-customer-household",
    target: "graph-fresh-demand-segment",
    type: "belongs_to",
    domain: "cross-domain",
    label: "belongs to segment",
  },
  {
    id: "edge-campaign-consent",
    source: "graph-spring-refresh-campaign",
    target: "graph-consent-record",
    type: "triggers",
    domain: "udp",
    label: "refreshes consent state",
  },
  {
    id: "edge-campaign-segment",
    source: "graph-fresh-demand-segment",
    target: "graph-spring-refresh-campaign",
    type: "linked_to",
    domain: "udp",
    label: "targeted by",
  },
  {
    id: "edge-consent-alert",
    source: "graph-consent-record",
    target: "graph-udp-alert",
    type: "triggers",
    domain: "udp",
    label: "triggers alert",
  },
  {
    id: "edge-identity-action",
    source: "graph-identity-profile",
    target: "graph-udp-action",
    type: "routed_to",
    domain: "udp",
    label: "routed to remediation",
  },
  {
    id: "edge-udp-alert-action",
    source: "graph-udp-alert",
    target: "graph-udp-action",
    type: "routed_to",
    domain: "udp",
    label: "routes into action",
  },
  {
    id: "edge-tower-udp-alert",
    source: "graph-control-tower",
    target: "graph-udp-alert",
    type: "linked_to",
    domain: "cross-domain",
    label: "surfaces in tower",
  },
  {
    id: "edge-segment-category",
    source: "graph-fresh-demand-segment",
    target: "graph-chilled-ready-meals",
    type: "affects",
    domain: "cross-domain",
    label: "drives demand for",
  },
  {
    id: "edge-category-sku",
    source: "graph-chicken-tikka-sku",
    target: "graph-chilled-ready-meals",
    type: "belongs_to",
    domain: "demand",
    label: "belongs to category",
  },
  {
    id: "edge-forecast-category",
    source: "graph-demand-forecast",
    target: "graph-chilled-ready-meals",
    type: "derived_from",
    domain: "demand",
    label: "derived from category demand",
  },
  {
    id: "edge-forecast-sku",
    source: "graph-demand-forecast",
    target: "graph-chicken-tikka-sku",
    type: "affects",
    domain: "demand",
    label: "adjusts forecast for",
  },
  {
    id: "edge-sku-supplier",
    source: "graph-chicken-tikka-sku",
    target: "graph-matheson-foods",
    type: "supplied_by",
    domain: "demand",
    label: "supplied by",
  },
  {
    id: "edge-sku-location",
    source: "graph-chicken-tikka-sku",
    target: "graph-manchester-dc",
    type: "linked_to",
    domain: "demand",
    label: "held at",
  },
  {
    id: "edge-forecast-signal",
    source: "graph-demand-forecast",
    target: "graph-inventory-signal",
    type: "triggers",
    domain: "demand",
    label: "triggers signal",
  },
  {
    id: "edge-location-signal",
    source: "graph-manchester-dc",
    target: "graph-inventory-signal",
    type: "monitored_by",
    domain: "demand",
    label: "monitored by",
  },
  {
    id: "edge-signal-alert",
    source: "graph-inventory-signal",
    target: "graph-demand-alert",
    type: "triggers",
    domain: "demand",
    label: "triggers alert",
  },
  {
    id: "edge-alert-approval",
    source: "graph-demand-alert",
    target: "graph-demand-approval",
    type: "routed_to",
    domain: "demand",
    label: "routed to approval",
  },
  {
    id: "edge-action-forecast",
    source: "graph-demand-action",
    target: "graph-demand-forecast",
    type: "affects",
    domain: "demand",
    label: "affects model",
  },
  {
    id: "edge-tower-demand-alert",
    source: "graph-control-tower",
    target: "graph-demand-alert",
    type: "linked_to",
    domain: "cross-domain",
    label: "surfaces in tower",
  },
  {
    id: "edge-approval-recommendation",
    source: "graph-demand-approval",
    target: "graph-graph-recommendation",
    type: "approved_by",
    domain: "cross-domain",
    label: "feeds recommended path",
  },
  {
    id: "edge-vendor-service",
    source: "graph-fastfreight-vendor",
    target: "graph-payment-service",
    type: "linked_to",
    domain: "risk",
    label: "supports service path",
  },
  {
    id: "edge-service-assessment",
    source: "graph-risk-assessment",
    target: "graph-payment-service",
    type: "derived_from",
    domain: "risk",
    label: "derived from service exposure",
  },
  {
    id: "edge-vendor-issue",
    source: "graph-fastfreight-vendor",
    target: "graph-risk-issue",
    type: "at_risk_from",
    domain: "risk",
    label: "at risk from issue",
  },
  {
    id: "edge-issue-assessment",
    source: "graph-risk-issue",
    target: "graph-risk-assessment",
    type: "triggers",
    domain: "risk",
    label: "triggers assessment",
  },
  {
    id: "edge-assessment-control",
    source: "graph-risk-assessment",
    target: "graph-segmentation-control",
    type: "governed_by",
    domain: "risk",
    label: "governed by control plan",
  },
  {
    id: "edge-assessment-alert",
    source: "graph-risk-assessment",
    target: "graph-risk-alert",
    type: "triggers",
    domain: "risk",
    label: "triggers alert",
  },
  {
    id: "edge-alert-action",
    source: "graph-risk-alert",
    target: "graph-risk-action",
    type: "routed_to",
    domain: "risk",
    label: "routed to remediation",
  },
  {
    id: "edge-action-audit",
    source: "graph-risk-action",
    target: "graph-risk-audit-event",
    type: "approved_by",
    domain: "risk",
    label: "recorded in audit trail",
  },
  {
    id: "edge-tower-risk-alert",
    source: "graph-control-tower",
    target: "graph-risk-alert",
    type: "linked_to",
    domain: "cross-domain",
    label: "surfaces in tower",
  },
  {
    id: "edge-risk-action-recommendation",
    source: "graph-risk-action",
    target: "graph-graph-recommendation",
    type: "recommended_by",
    domain: "cross-domain",
    label: "feeds recommended path",
  },
  {
    id: "edge-udp-action-recommendation",
    source: "graph-udp-action",
    target: "graph-graph-recommendation",
    type: "recommended_by",
    domain: "cross-domain",
    label: "feeds recommended path",
  },
  {
    id: "edge-story-tower",
    source: "graph-control-tower",
    target: "graph-graph-recommendation",
    type: "recommended_by",
    domain: "cross-domain",
    label: "issues recommendation",
  },
];

export const KNOWLEDGE_GRAPH_NEIGHBORHOODS: KnowledgeGraphNeighborhood[] = [
  {
    id: "control-tower-story",
    title: "Control Tower Story",
    description:
      "A curated cross-domain story that shows how customer readiness, demand sensing, and vendor remediation converge in the control tower.",
    preset: "story-neighborhood",
    centerNodeId: "graph-control-tower",
    nodeIds: [
      "graph-control-tower",
      "graph-fresh-demand-segment",
      "graph-consent-record",
      "graph-udp-alert",
      "graph-demand-forecast",
      "graph-demand-alert",
      "graph-demand-approval",
      "graph-fastfreight-vendor",
      "graph-risk-alert",
      "graph-risk-action",
      "graph-graph-recommendation",
    ],
  },
  {
    id: "udp-consent-readiness",
    title: "UDP Consent Readiness",
    description:
      "The identity, consent, and campaign relationships that explain why activation is paused and which remediation path restores readiness.",
    preset: "udp-neighborhood",
    centerNodeId: "graph-consent-record",
    nodeIds: [
      "graph-customer-household",
      "graph-identity-profile",
      "graph-consent-record",
      "graph-fresh-demand-segment",
      "graph-spring-refresh-campaign",
      "graph-udp-alert",
      "graph-udp-action",
      "graph-control-tower",
    ],
  },
  {
    id: "demand-stockout-chain",
    title: "Demand Stockout Chain",
    description:
      "The demand-planning neighborhood linking segment demand, SKU exposure, the supplier chain, Northeast DC, and the operator approval path.",
    preset: "demand-chain",
    centerNodeId: "graph-demand-alert",
    nodeIds: [
      "graph-fresh-demand-segment",
      "graph-chilled-ready-meals",
      "graph-chicken-tikka-sku",
      "graph-demand-forecast",
      "graph-inventory-signal",
      "graph-manchester-dc",
      "graph-matheson-foods",
      "graph-demand-alert",
      "graph-demand-approval",
      "graph-demand-action",
      "graph-control-tower",
      "graph-graph-recommendation",
    ],
  },
  {
    id: "risk-escalation-path",
    title: "Vendor Risk Escalation Path",
    description:
      "The risk relationship path that explains how threat findings become portfolio exposure, control recommendations, remediation, and audit evidence.",
    preset: "vendor-risk-path",
    centerNodeId: "graph-risk-alert",
    nodeIds: [
      "graph-fastfreight-vendor",
      "graph-payment-service",
      "graph-risk-assessment",
      "graph-risk-issue",
      "graph-segmentation-control",
      "graph-risk-alert",
      "graph-risk-action",
      "graph-risk-audit-event",
      "graph-control-tower",
      "graph-graph-recommendation",
    ],
  },
];

export function buildKnowledgeGraphHref({
  graphPreset,
  graphScopeId,
  graphCenterNodeId,
}: KnowledgeGraphLinkOptions): string {
  const params = new URLSearchParams();

  if (graphPreset) {
    params.set("preset", graphPreset);
  }
  if (graphScopeId) {
    params.set("scope", graphScopeId);
  }
  if (graphCenterNodeId) {
    params.set("center", graphCenterNodeId);
  }

  const query = params.toString();
  return query ? `/dashboard/graph?${query}` : "/dashboard/graph";
}

export function getKnowledgeGraphPreset(id: string | null | undefined) {
  return KNOWLEDGE_GRAPH_PRESETS.find((preset) => preset.id === id);
}

export function getKnowledgeGraphNeighborhood(id: string | null | undefined) {
  return KNOWLEDGE_GRAPH_NEIGHBORHOODS.find((neighborhood) => neighborhood.id === id);
}

export function getKnowledgeGraphNode(id: string | null | undefined) {
  return KNOWLEDGE_GRAPH_NODES.find((node) => node.id === id);
}
