import { ecommerceDashboardData } from "@/lib/dashboard/mock-ecommerce";
import { buildIncrementalityHref } from "@/lib/incrementality-data";

export type ControlTowerDomain = "udp" | "demand" | "risk" | "campaign";
export type ControlTowerSeverity = "critical" | "high" | "medium" | "info";
export type ControlTowerStatus = "healthy" | "attention" | "critical";
export type TrendDirection = "up" | "down" | "flat";
export type ControlTowerWidgetKind =
  | "table"
  | "scorecard_list"
  | "capacity_bars"
  | "dual_line_trend"
  | "timeline_gantt"
  | "single_line_trend"
  | "donut_breakdown"
  | "horizontal_bar_breakdown"
  | "list"
  | "summary";
export type ControlTowerActionState = "pending" | "approved" | "in_review" | "dismissed";
export type ControlTowerActionType = "approve" | "route" | "review" | "dismiss";

export interface ControlTowerHeroMetric {
  id: string;
  label: string;
  value: string;
  status: ControlTowerStatus;
  detail: string;
  sparkline: number[];
}

export interface ControlTowerDomainSummary {
  domain: ControlTowerDomain;
  label: string;
  description: string;
  status: ControlTowerStatus;
  alertCount: number;
  moduleHref: string;
  chatHref: string;
  graphScopeId?: string;
  graphCenterNodeId?: string;
  graphPreset?: string;
  kpis: {
    label: string;
    value: string;
    trend?: TrendDirection;
    trendLabel?: string;
  }[];
}

export interface ControlTowerWidgetRow {
  label: string;
  value?: string;
  meta?: string;
  status?: ControlTowerStatus;
  progress?: number;
}

export interface ControlTowerTableColumn {
  key: string;
  label: string;
  align?: "left" | "right";
}

export interface ControlTowerTableRow {
  id: string;
  values: Record<string, string>;
  status?: ControlTowerStatus;
  statusLabel?: string;
}

export interface ControlTowerScoreRow {
  label: string;
  meta: string;
  score: number;
  status: ControlTowerStatus;
  statusLabel?: string;
}

export interface ControlTowerCapacityRow {
  label: string;
  meta: string;
  usedPercent: number;
  reservedPercent?: number;
  totalLabel?: string;
  status: ControlTowerStatus;
}

export interface ControlTowerTrendPoint {
  label: string;
  primary: number;
  secondary?: number;
}

export interface ControlTowerTimelineRow {
  label: string;
  meta: string;
  offset: number;
  span: number;
  status: ControlTowerStatus;
  rightLabel?: string;
}

export interface ControlTowerBreakdownSegment {
  label: string;
  value: number;
  color: string;
  meta?: string;
}

export interface ControlTowerWidget {
  id: string;
  domain: ControlTowerDomain;
  title: string;
  subtitle: string;
  kind: ControlTowerWidgetKind;
  defaultExpanded: boolean;
  routeHref: string;
  routeLabel: string;
  summary?: string;
  rows?: ControlTowerWidgetRow[];
  tableColumns?: ControlTowerTableColumn[];
  tableRows?: ControlTowerTableRow[];
  scoreRows?: ControlTowerScoreRow[];
  capacityRows?: ControlTowerCapacityRow[];
  trendPoints?: ControlTowerTrendPoint[];
  trendLegend?: {
    primaryLabel: string;
    secondaryLabel?: string;
  };
  timelineRows?: ControlTowerTimelineRow[];
  breakdownSegments?: ControlTowerBreakdownSegment[];
}

export interface ControlTowerAlertActionOption {
  id: string;
  label: string;
  type: ControlTowerActionType;
}

export interface ControlTowerDecisionItem {
  id: string;
  title: string;
  subtitle: string;
  metric: string;
  detail: string;
  supportingLabel?: string;
  stock?: string;
  actionAmount?: string;
  unitCost?: string;
  totalCost?: string;
  suggestedConditions?: string[];
}

export interface ControlTowerDecisionSummaryEntry {
  id: string;
  title: string;
  outcome: string;
  detail: string;
  metric?: string;
}

export interface ControlTowerAgentFlowCard {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  output: string;
  priority: string;
  processingTime: string;
  tone: "amber" | "blue" | "violet" | "emerald" | "slate";
}

export interface ControlTowerDrilldown {
  title: string;
  summary: string[];
  items: ControlTowerDecisionItem[];
  auditTrail: Array<{
    time: string;
    actor: string;
    detail: string;
    badge?: string;
  }>;
  nextSteps?: string[];
  decisionSummary?: {
    headline: string;
    loggedAt: string;
    reference: string;
    items: ControlTowerDecisionSummaryEntry[];
  };
  agentFlow?: ControlTowerAgentFlowCard[];
}

export interface ControlTowerAlert {
  id: string;
  domain: ControlTowerDomain;
  severity: ControlTowerSeverity;
  title: string;
  description: string;
  timestamp: string;
  routeHref: string;
  routeLabel: string;
  experimentHref?: string;
  graphScopeId?: string;
  graphCenterNodeId?: string;
  graphPreset?: string;
  drilldown: ControlTowerDrilldown;
}

export interface ControlTowerAction {
  id: string;
  domain: ControlTowerDomain;
  severity: ControlTowerSeverity;
  title: string;
  summary: string;
  impact: string;
  dueLabel: string;
  state: ControlTowerActionState;
  primaryAction: {
    label: string;
    type: ControlTowerActionType;
  };
  secondaryAction?: {
    label: string;
    type: ControlTowerActionType;
  };
  routeHref: string;
  routeLabel: string;
  experimentHref?: string;
  graphScopeId?: string;
  graphCenterNodeId?: string;
  graphPreset?: string;
}

export interface ControlTowerAssistantSuggestion {
  id: string;
  label: string;
  href: string;
  domain: ControlTowerDomain | "platform";
}

const udpRevenue = ecommerceDashboardData.kpis[0]?.value ?? "$1.28M";

export const CONTROL_TOWER_HERO_METRICS: ControlTowerHeroMetric[] = [
  {
    id: "platform-health",
    label: "Forecast Accuracy",
    value: "72.3%",
    status: "attention",
    detail: "Weather-adjusted forecast accuracy across storm-impacted categories",
    sparkline: [82.1, 80.4, 78.6, 76.2, 74.8, 73.1, 72.3],
  },
  {
    id: "active-alerts",
    label: "Active Business Alerts",
    value: "12",
    status: "critical",
    detail: "6 storm-related alerts require immediate decisions",
    sparkline: [4, 5, 6, 7, 8, 10, 12],
  },
  {
    id: "pending-actions",
    label: "Open Approvals",
    value: "8",
    status: "critical",
    detail: "3 emergency reorder approvals due within 2 hours",
    sparkline: [3, 3, 4, 5, 6, 7, 8],
  },
  {
    id: "udp-readiness",
    label: "DC In-Stock Rate",
    value: "84.6%",
    status: "attention",
    detail: "Distribution center stock levels declining under storm-driven demand surge",
    sparkline: [96.2, 95.1, 93.4, 91.0, 88.7, 86.3, 84.6],
  },
  {
    id: "forecast-accuracy",
    label: "SKUs at Risk",
    value: "47",
    status: "critical",
    detail: "47 SKUs projected to stock out within 48 hours across storm zones",
    sparkline: [8, 12, 18, 25, 33, 41, 47],
  },
  {
    id: "activation-readiness",
    label: "On-Time Delivery",
    value: "68.2%",
    status: "critical",
    detail: "Road closures and storm conditions delaying last-mile delivery",
    sparkline: [94.5, 91.2, 87.6, 82.1, 76.4, 71.8, 68.2],
  },
];

export const CONTROL_TOWER_DOMAIN_SUMMARIES: ControlTowerDomainSummary[] = [
  {
    domain: "udp",
    label: "Unified Data Platform",
    description: "Weather signal integration, data freshness, and cross-system connectivity for storm response",
    status: "attention",
    alertCount: 3,
    moduleHref: "/udp/dashboard",
    chatHref: "/chat",
    graphScopeId: "udp-consent-readiness",
    graphCenterNodeId: "graph-consent-record",
    graphPreset: "udp-neighborhood",
    kpis: [
      { label: "Gross Revenue", value: udpRevenue, trend: "up", trendLabel: "+22.8% storm-prep surge vs prior week" },
      { label: "Weather Signal Quality", value: "96.1%", trend: "up", trendLabel: "NOAA feed integrated in real-time" },
      { label: "Data Freshness Score", value: "88/100", trend: "down", trendLabel: "-4 pts due to delayed store feeds" },
      { label: "Cross-System Connectivity", value: "91.3%", trend: "flat", trendLabel: "Stable across DC and POS systems" },
    ],
  },
  {
    domain: "demand",
    label: "Demand Signal",
    description: "Storm-driven demand surge with cold-chain risk and fill rate under extreme pressure",
    status: "critical",
    alertCount: 7,
    moduleHref: "/demand/dashboard",
    chatHref: "/demand/chat",
    graphScopeId: "demand-stockout-chain",
    graphCenterNodeId: "graph-demand-alert",
    graphPreset: "demand-chain",
    kpis: [
      { label: "Forecast Accuracy", value: "72.3%", trend: "down", trendLabel: "-7.7% vs 80% target — storm disruption" },
      { label: "Cold-Chain Risk", value: "High", trend: "up", trendLabel: "Power outage risk at 3 DCs" },
      { label: "Fill Rate", value: "78.4%", trend: "down", trendLabel: "-12.8% this week under panic buying" },
      { label: "Emergency Alerts", value: "7", trend: "up", trendLabel: "Stockout and cold-chain pressure" },
    ],
  },
];

export const CONTROL_TOWER_WIDGETS: ControlTowerWidget[] = [
  {
    id: "active-work-queue",
    domain: "demand",
    title: "Active Work Queue",
    subtitle: "Storm-response decisions across supply chain, demand, and operations",
    kind: "table",
    defaultExpanded: true,
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    tableColumns: [
      { key: "item", label: "Work Item" },
      { key: "domain", label: "Domain" },
      { key: "impact", label: "Impact", align: "right" },
      { key: "due", label: "Due", align: "right" },
      { key: "status", label: "Status", align: "right" },
    ],
    tableRows: [
      {
        id: "queue-reorder",
        values: {
          item: "Emergency reorder approval — storm-critical SKUs",
          domain: "Demand",
          impact: "$820K at risk",
          due: "2h",
          status: "Pending",
        },
        status: "critical",
        statusLabel: "Pending",
      },
      {
        id: "queue-coldchain",
        values: {
          item: "Cold-chain risk review — frozen & chilled goods",
          domain: "Demand",
          impact: "3 DCs affected",
          due: "4h",
          status: "Review",
        },
        status: "critical",
        statusLabel: "Review",
      },
      {
        id: "queue-reroute",
        values: {
          item: "Delivery route replanning — Northeast storm zone",
          domain: "Demand",
          impact: "$145K delay cost",
          due: "Today",
          status: "Ready",
        },
        status: "attention",
        statusLabel: "Ready",
      },
      {
        id: "queue-forecast",
        values: {
          item: "Demand surge forecast update (+40% storm categories)",
          domain: "Demand",
          impact: "+40% demand uplift",
          due: "Today",
          status: "Pending",
        },
        status: "attention",
        statusLabel: "Pending",
      },
    ],
  },
  {
    id: "udp-health",
    domain: "udp",
    title: "Operational Readiness Scorecard",
    subtitle: "Storm readiness across distribution, cold-chain, transport, and emergency response",
    kind: "scorecard_list",
    defaultExpanded: true,
    routeHref: "/udp/dashboard",
    routeLabel: "Open UDP Dashboard",
    scoreRows: [
      { label: "DC operational status", meta: "Distribution center uptime and staffing under storm conditions", score: 82, status: "attention", statusLabel: "Strained" },
      { label: "Cold-chain integrity", meta: "Temperature-controlled storage and transport compliance", score: 64, status: "critical", statusLabel: "At Risk" },
      { label: "Transport network", meta: "Road access and carrier availability in storm zones", score: 48, status: "critical", statusLabel: "Critical" },
      { label: "Last-mile delivery capacity", meta: "Final delivery capability under road closures and weather delays", score: 52, status: "critical", statusLabel: "Degraded" },
      { label: "Emergency supplier readiness", meta: "Backup supplier activation and response time", score: 76, status: "attention", statusLabel: "Activating" },
    ],
  },
  {
    id: "experiments-program",
    domain: "udp",
    title: "Incrementality Program",
    subtitle: "Business experiments across UDP applications and demand",
    kind: "list",
    defaultExpanded: false,
    routeHref: buildIncrementalityHref({ entry: "udp" }),
    routeLabel: "Open Experiment Workspace",
    summary:
      "Launch and monitor experiments across campaigns, audiences, identity, consent, data quality, customer insights, and demand signals.",
    rows: [
      {
        label: "Active experiments",
        value: "4 live",
        meta: "Live across audiences, consent recovery, customer insights, and demand",
        status: "healthy",
      },
      {
        label: "Awaiting readout",
        value: "3 queued",
        meta: "Running and completed tests ready for business review",
        status: "attention",
      },
      {
        label: "Strongest recent lift",
        value: "+22.3%",
        meta: "Emergency push notification test validated storm-prep conversion uplift",
        status: "healthy",
      },
      {
        label: "Applications covered",
        value: "7",
        meta: "Campaigns, audiences, identity, consent, quality, insights, and demand",
        status: "healthy",
      },
    ],
  },
  {
    id: "demand-forecast",
    domain: "demand",
    title: "Forecast vs Actual Demand",
    subtitle: "Storm-driven demand surge across priority categories",
    kind: "dual_line_trend",
    defaultExpanded: true,
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    summary: "Panic buying and storm-prep demand is significantly outpacing forecast across emergency categories.",
    trendLegend: {
      primaryLabel: "Actual",
      secondaryLabel: "Forecast",
    },
    trendPoints: [
      { label: "Wk -6", primary: 68, secondary: 70 },
      { label: "Wk -5", primary: 71, secondary: 70 },
      { label: "Wk -4", primary: 74, secondary: 72 },
      { label: "Wk -3", primary: 82, secondary: 73 },
      { label: "Wk -2", primary: 96, secondary: 75 },
      { label: "Wk -1", primary: 118, secondary: 78 },
    ],
  },
  {
    id: "regional-coverage",
    domain: "demand",
    title: "Regional Coverage Levels",
    subtitle: "Current demand cover across US fulfillment nodes under storm impact",
    kind: "capacity_bars",
    defaultExpanded: false,
    routeHref: "/demand/dashboard",
    routeLabel: "View Regional Coverage",
    capacityRows: [
      { label: "Northeast DC", meta: "620 MT available · 2,800 MT reserved — storm zone", usedPercent: 92, reservedPercent: 6, totalLabel: "6,000 MT capacity", status: "critical" },
      { label: "Chicago DC", meta: "1,400 MT available · 1,900 MT reserved", usedPercent: 78, reservedPercent: 14, totalLabel: "4,800 MT capacity", status: "attention" },
      { label: "Denver Hub", meta: "2,200 MT available · 1,400 MT reserved", usedPercent: 62, reservedPercent: 12, totalLabel: "6,200 MT capacity", status: "healthy" },
      { label: "Atlanta DC", meta: "3,100 MT available · 1,000 MT reserved", usedPercent: 48, reservedPercent: 8, totalLabel: "8,100 MT capacity", status: "healthy" },
    ],
  },
  {
    id: "inventory-coverage",
    domain: "demand",
    title: "Business Commitments Timeline",
    subtitle: "Storm-response milestones and operational deadlines",
    kind: "timeline_gantt",
    defaultExpanded: false,
    routeHref: "/demand/dashboard",
    routeLabel: "View Inbound Timeline",
    timelineRows: [
      { label: "Emergency replenishment cutoff", meta: "Final order window before road closures — 2:00 PM today", offset: 4, span: 20, status: "critical", rightLabel: "STORM-001" },
      { label: "Delivery window closure", meta: "Last-mile delivery suspended in storm zone", offset: 20, span: 30, status: "critical", rightLabel: "STORM-002" },
      { label: "Store closure timeline", meta: "Northeast region stores closing for 72-hour lockdown", offset: 28, span: 44, status: "attention", rightLabel: "STORM-003" },
      { label: "Post-storm recovery assessment", meta: "Stores reopen — fulfilment backlogs reprioritized", offset: 72, span: 18, status: "healthy", rightLabel: "STORM-004" },
    ],
  },
  {
    id: "identity-exceptions",
    domain: "udp",
    title: "Data Integration Exceptions",
    subtitle: "Records impacting storm-response coordination",
    kind: "list",
    defaultExpanded: false,
    routeHref: "/customers",
    routeLabel: "Review Customer Records",
    rows: [
      { label: "POS feed delay", value: "14 stores", meta: "Northeast stores with stale inventory data", status: "critical", progress: 35 },
      { label: "Weather API sync gap", value: "22 min", meta: "NOAA feed lag affecting forecast models", status: "attention", progress: 68 },
      { label: "DC inventory mismatch", value: "847 SKUs", meta: "Physical vs. system count discrepancy at Northeast DC", status: "attention", progress: 42 },
    ],
  },
  {
    id: "campaign-efficiency",
    domain: "campaign",
    title: "Emergency Communication Channels",
    subtitle: "Storm-response messaging mix across active channels",
    kind: "donut_breakdown",
    defaultExpanded: false,
    routeHref: "/campaigns",
    routeLabel: "Open Campaigns",
    breakdownSegments: [
      { label: "Push Notifications", value: 38, color: "#3f7f89", meta: "$190K" },
      { label: "App Alerts", value: 24, color: "#f28c82", meta: "$120K" },
      { label: "Email / CRM", value: 18, color: "#8a9bcf", meta: "$90K" },
      { label: "SMS Alerts", value: 12, color: "#92c6c0", meta: "$60K" },
      { label: "In-Store Signage", value: 8, color: "#d6b37a", meta: "$40K" },
    ],
  },
];

export const CONTROL_TOWER_ALERTS: ControlTowerAlert[] = [
  {
    id: "alert-demand-stockout",
    domain: "demand",
    severity: "critical",
    title: "Emergency Demand Surge & Supply Disruption",
    description: "Severe blizzard is driving panic buying of water, batteries, first aid, and ready meals across the Northeast. Cold-chain integrity at risk from power outages. Last-mile delivery constrained by road closures. Stock-outs appearing across 47 SKUs.",
    timestamp: "11:56",
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    experimentHref: buildIncrementalityHref({
      entry: "demand",
      lens: "demand",
      application: "demand",
      experimentId: "exp-promo-forecast",
    }),
    graphScopeId: "demand-stockout-chain",
    graphCenterNodeId: "graph-demand-alert",
    graphPreset: "demand-chain",
    drilldown: {
      title: "Emergency Reorder Approval",
      summary: [
        "A severe blizzard with 72-hour lockdown is driving emergency demand across water, batteries, first aid, ready meals, and pet supplies.",
        "Six critical SKUs are below minimum cover and at risk of stockout within 24–48 hours at the Northeast DC.",
        "Cold-chain products require sub-4°C transport conditions — conditional approvals needed to protect product integrity.",
      ],
      items: [
        {
          id: "water-bulk",
          title: "Water (Bulk Packs)",
          subtitle: "Northeast DC · 1.2 days cover remaining",
          metric: "18,000 cases · $72,000",
          detail: "Emergency reorder — priority allocation from Atlanta DC surplus.",
          supportingLabel: "Alt. Supplier: ClearSpring Distributors",
          stock: "420 cases",
          actionAmount: "Reorder: 18,000 cases",
          unitCost: "$4.00",
          totalCost: "$72,000",
          suggestedConditions: [
            "Auto-cancel if delivery confirmation is not received within 3 business days",
            "Approve up to 15,000 cases and defer remainder to next available transport window",
            "Escalate to logistics if ETA slips by more than 8 hours",
          ],
        },
        {
          id: "batteries-flashlights",
          title: "Batteries & Flashlights",
          subtitle: "Northeast DC · 0.8 days cover remaining",
          metric: "14,000 units · $56,000",
          detail: "Emergency reorder — demand surge 320% above baseline.",
          supportingLabel: "Alt. Supplier: PowerCell Direct",
          stock: "180 units",
          actionAmount: "Reorder: 14,000 units",
          unitCost: "$4.00",
          totalCost: "$56,000",
          suggestedConditions: [
            "Route to alternate supplier if primary inbound slot is missed",
            "Approve full quantity — no deferral due to critical need",
          ],
        },
        {
          id: "chilled-ready-meals",
          title: "Chilled Ready Meals",
          subtitle: "Northeast DC · 1.8 days cover remaining",
          metric: "12,000 cases · $48,000",
          detail: "Cold-chain conditional approval — transport must maintain below 4°C.",
          supportingLabel: "Alt. Supplier: FreshPrep Co.",
          stock: "310 cases",
          actionAmount: "Reorder: 12,000 cases",
          unitCost: "$4.00",
          totalCost: "$48,000",
          suggestedConditions: [
            "Auto-cancel if chilled transport cannot maintain sub-4°C conditions",
            "Approve up to 10,000 cases and defer remainder to next standard cycle",
            "Cancel if unit cost exceeds $4.80 at invoicing",
          ],
        },
        {
          id: "frozen-desserts",
          title: "Frozen Desserts",
          subtitle: "Northeast DC · 2.1 days cover remaining",
          metric: "8,000 cases · $28,000",
          detail: "Strict sub-4°C transport required — cold-chain integrity non-negotiable for frozen goods.",
          supportingLabel: "Alt. Supplier: Arctic Foods",
          stock: "240 cases",
          actionAmount: "Reorder: 8,000 cases",
          unitCost: "$3.50",
          totalCost: "$28,000",
          suggestedConditions: [
            "Reject if transport temperature exceeds -2°C at any checkpoint",
            "Route to alternate supplier if inbound slot is missed",
            "Escalate to operations if condition threshold is breached during transit",
          ],
        },
        {
          id: "first-aid-kits",
          title: "First Aid Kits",
          subtitle: "Northeast DC · 1.4 days cover remaining",
          metric: "6,000 units · $54,000",
          detail: "Emergency reorder — demand spike from storm-prep buying.",
          supportingLabel: "Alt. Supplier: MedReady Supply",
          stock: "95 units",
          actionAmount: "Reorder: 6,000 units",
          unitCost: "$9.00",
          totalCost: "$54,000",
          suggestedConditions: [
            "Approve full quantity — critical safety item",
            "Escalate if delivery cannot be confirmed within 24 hours",
          ],
        },
        {
          id: "emergency-pet-food",
          title: "Emergency Pet Food",
          subtitle: "Northeast DC · 1.6 days cover remaining",
          metric: "5,000 cases · $30,000",
          detail: "Reorder — pet necessities are high-priority during lockdown.",
          supportingLabel: "Alt. Supplier: PetPantry Direct",
          stock: "210 cases",
          actionAmount: "Reorder: 5,000 cases",
          unitCost: "$6.00",
          totalCost: "$30,000",
          suggestedConditions: [
            "Auto-cancel if delivery confirmation is not received within 4 business days",
            "Reduce reorder by 20% if adjacent DC surplus becomes available",
          ],
        },
      ],
      auditTrail: [
        { time: "06:15", actor: "Weather Intelligence Agent", detail: "Detected severe blizzard advisory — 72-hour lockdown projected for Northeast region.", badge: "Weather Intelligence Agent" },
        { time: "06:30", actor: "Inventory Analysis Agent", detail: "Identified 47 SKUs below minimum cover threshold across storm-impacted categories.", badge: "Inventory Analysis Agent" },
        { time: "07:00", actor: "Policy Engine", detail: "Prepared conditional approval templates with cold-chain requirements and alternate supplier options.", badge: "Policy Engine" },
        { time: "08:45", actor: "Supply Chain Manager", detail: "Alert acknowledged and queued for planning manager approval.", badge: "Supply Chain Manager" },
      ],
      nextSteps: [
        "Emergency delivery slots confirmed with carriers — pre-storm window closes at 2:00 PM",
        "Policy engine activated to monitor cold-chain conditions and auto-cancel if breached",
        "Projected revenue loss of $820K reduced to $180K if emergency reorders are approved within 2 hours",
      ],
      decisionSummary: {
        headline: "Decisions submitted",
        loggedAt: "11:56",
        reference: "STORM-EOR-4201",
        items: [
          {
            id: "summary-water",
            title: "Water (Bulk Packs)",
            outcome: "Approved",
            detail: "Full quantity approved — emergency priority allocation from Atlanta DC.",
            metric: "18,000 cases · $72,000",
          },
          {
            id: "summary-batteries",
            title: "Batteries & Flashlights",
            outcome: "Approved",
            detail: "Full quantity approved — routed to alternate supplier for fastest delivery.",
            metric: "14,000 units · $56,000",
          },
          {
            id: "summary-ready-meals",
            title: "Chilled Ready Meals",
            outcome: "Conditional approval",
            detail: "Approve up to 10,000 cases — conditional on sub-4°C transport confirmation.",
            metric: "12,000 cases · $48,000",
          },
          {
            id: "summary-frozen",
            title: "Frozen Desserts",
            outcome: "Pending business decision",
            detail: "Awaiting cold-chain transport confirmation before approval.",
            metric: "8,000 cases · $28,000",
          },
          {
            id: "summary-first-aid",
            title: "First Aid Kits",
            outcome: "Approved",
            detail: "Full quantity approved — critical safety item.",
            metric: "6,000 units · $54,000",
          },
          {
            id: "summary-pet-food",
            title: "Emergency Pet Food",
            outcome: "Pending business decision",
            detail: "Awaiting adjacent DC surplus check before final approval.",
            metric: "5,000 cases · $30,000",
          },
        ],
      },
      agentFlow: [
        {
          id: "weather-intel",
          title: "Weather Intelligence Agent",
          subtitle: "06:15",
          summary: "Monitors NOAA feeds and severe weather advisories to trigger storm-response protocols.",
          output: "storm_advisory",
          priority: "Critical",
          processingTime: "1 min",
          tone: "amber",
        },
        {
          id: "inventory-analysis",
          title: "Inventory Analysis Agent",
          subtitle: "06:30",
          summary: "Identifies understocked SKUs and calculates emergency reorder quantities based on storm-adjusted demand.",
          output: "reorder_qty",
          priority: "Critical",
          processingTime: "50 sec",
          tone: "blue",
        },
        {
          id: "coldchain-monitor",
          title: "Cold-Chain Monitor Agent",
          subtitle: "06:45",
          summary: "Validates transport temperature compliance and flags cold-chain risk for frozen and chilled goods.",
          output: "coldchain_status",
          priority: "High",
          processingTime: "30 sec",
          tone: "violet",
        },
        {
          id: "alert-dispatch",
          title: "Alert Dispatch Agent",
          subtitle: "07:00",
          summary: "Dispatches the urgent approval request to the control tower and policy engine.",
          output: "alert_id",
          priority: "High",
          processingTime: "1 min",
          tone: "emerald",
        },
      ],
    },
  },
  {
    id: "alert-coldchain-risk",
    domain: "demand",
    severity: "high",
    title: "Cold-Chain Integrity Risk",
    description: "Temperature-controlled products at risk from power outages and transport delays at 3 distribution centers in the storm zone. Frozen desserts and chilled ready meals require immediate cold-chain verification.",
    timestamp: "09:30",
    routeHref: "/demand/dashboard",
    routeLabel: "Review Cold-Chain Status",
    experimentHref: buildIncrementalityHref({
      entry: "demand",
      lens: "demand",
      application: "demand",
      experimentId: "exp-promo-forecast",
    }),
    graphScopeId: "demand-stockout-chain",
    graphCenterNodeId: "graph-demand-alert",
    graphPreset: "demand-chain",
    drilldown: {
      title: "Cold-Chain Compliance Review",
      summary: [
        "Power outage risk at Northeast DC is threatening cold-chain integrity for frozen and chilled products.",
        "Backup generators have 18 hours of fuel — emergency refueling must be coordinated before storm peak.",
      ],
      items: [
        {
          id: "frozen-storage",
          title: "Frozen storage — Northeast DC",
          subtitle: "Generator backup: 18 hours remaining",
          metric: "4,200 cases at risk",
          detail: "Temperature must remain below -18°C. Generator fuel resupply needed before storm peak.",
          supportingLabel: "Owner: Logistics Manager",
          stock: "Affected SKUs: 23",
          actionAmount: "Action: Emergency fuel resupply",
          suggestedConditions: [
            "Dispatch fuel resupply within 4 hours before road closures",
            "Transfer high-value frozen goods to Chicago DC if fuel cannot be confirmed",
          ],
        },
        {
          id: "chilled-transport",
          title: "Chilled transport in transit",
          subtitle: "3 trucks en route to Northeast DC",
          metric: "2,800 cases in transit",
          detail: "Transport must maintain sub-4°C. Road delays could extend transit by 6+ hours.",
          supportingLabel: "Owner: Supply Chain Manager",
          stock: "Affected trucks: 3",
          actionAmount: "Action: Reroute or expedite",
          suggestedConditions: [
            "Reroute to Chicago DC if Northeast roads close before arrival",
            "Reject delivery if temperature logs show breach above 4°C during transit",
          ],
        },
      ],
      auditTrail: [
        { time: "07:30", actor: "Cold-Chain Monitor Agent", detail: "Detected power grid instability warning for Northeast region.", badge: "Cold-Chain Monitor Agent" },
        { time: "08:00", actor: "Logistics Agent", detail: "Verified generator fuel levels and backup capacity at Northeast DC.", badge: "Logistics Agent" },
      ],
      nextSteps: [
        "Fuel resupply dispatched — arrival ETA 12:30 PM",
        "Chicago DC placed on standby to receive rerouted chilled goods",
        "Temperature sensors elevated to 5-minute reporting intervals",
      ],
      decisionSummary: {
        headline: "Review submitted",
        loggedAt: "09:30",
        reference: "STORM-CC-4202",
        items: [
          {
            id: "summary-frozen-storage",
            title: "Frozen storage — Northeast DC",
            outcome: "Fuel resupply dispatched",
            detail: "Emergency fuel delivery confirmed — ETA 12:30 PM.",
            metric: "4,200 cases protected",
          },
          {
            id: "summary-chilled-transport",
            title: "Chilled transport in transit",
            outcome: "Monitoring",
            detail: "Reroute decision pending based on road closure updates at 11:00 AM.",
            metric: "2,800 cases in transit",
          },
        ],
      },
      agentFlow: [
        {
          id: "coldchain-agent",
          title: "Cold-Chain Monitor Agent",
          subtitle: "07:30",
          summary: "Monitors temperature sensors and power grid status across distribution network.",
          output: "coldchain_alert",
          priority: "High",
          processingTime: "25 sec",
          tone: "amber",
        },
        {
          id: "logistics-agent",
          title: "Logistics Agent",
          subtitle: "08:00",
          summary: "Validates generator capacity and coordinates emergency fuel resupply.",
          output: "logistics_status",
          priority: "High",
          processingTime: "45 sec",
          tone: "blue",
        },
      ],
    },
  },
  {
    id: "alert-lastmile-constraint",
    domain: "demand",
    severity: "medium",
    title: "Last-Mile Delivery Constraint",
    description: "Road closures in the Northeast storm zone are affecting 68% of planned delivery routes. On-time delivery has dropped to 68.2%. Alternative routing and in-store pickup options being evaluated.",
    timestamp: "08:15",
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    drilldown: {
      title: "Delivery Route Replanning",
      summary: [
        "Major road closures across the Northeast are blocking 68% of planned last-mile delivery routes.",
        "On-time delivery rate has dropped from 94.5% to 68.2% in the last 48 hours.",
        "Alternative routing through cleared highways and in-store pickup redirection are available options.",
      ],
      items: [
        {
          id: "route-replan",
          title: "Reroute deliveries via cleared highways",
          subtitle: "Northeast storm zone — 142 affected routes",
          metric: "$145K delay cost avoidance",
          detail: "GPS and DOT data show 3 alternative highway corridors still accessible. Rerouting recovers 40% of affected deliveries.",
        },
        {
          id: "pickup-redirect",
          title: "Redirect to in-store pickup",
          subtitle: "26 stores still open in storm periphery",
          metric: "3,400 orders eligible for redirect",
          detail: "Consumer app can push pickup notifications to affected delivery customers. Estimated 60% acceptance rate.",
        },
      ],
      auditTrail: [
        { time: "06:00", actor: "Route Optimization Agent", detail: "Detected road closure cascade across Northeast delivery zones." },
        { time: "06:30", actor: "Logistics Agent", detail: "Identified alternative highway corridors and in-store pickup capacity." },
        { time: "08:12", actor: "Logistics Manager", detail: "Alert queued for business approval on rerouting plan." },
      ],
    },
  },
];

export const CONTROL_TOWER_ACTIONS: ControlTowerAction[] = [
  {
    id: "action-emergency-reorder",
    domain: "demand",
    severity: "critical",
    title: "Approve emergency reorder for storm-critical SKUs at Northeast DC",
    summary: "Emergency reorder for water, batteries, first aid kits, ready meals, frozen desserts, and pet food to avoid stockout during 72-hour blizzard lockdown.",
    impact: "Protects $820K in revenue and ensures essential supply availability for storm-impacted communities.",
    dueLabel: "Due in 2h",
    state: "pending",
    primaryAction: { label: "Approve", type: "approve" },
    secondaryAction: { label: "Review details", type: "review" },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand View",
    graphScopeId: "demand-stockout-chain",
    graphCenterNodeId: "graph-demand-approval",
    graphPreset: "demand-chain",
  },
  {
    id: "action-coldchain-transport",
    domain: "demand",
    severity: "high",
    title: "Approve cold-chain conditional transport for frozen/chilled goods",
    summary: "Frozen desserts and chilled ready meals require confirmed sub-4°C transport. Conditional approval needed before pre-storm delivery window closes.",
    impact: "Protects $76K in temperature-sensitive inventory and prevents product waste.",
    dueLabel: "Due in 4h",
    state: "pending",
    primaryAction: { label: "Approve with conditions", type: "approve" },
    secondaryAction: { label: "Review cold-chain status", type: "review" },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand View",
    graphScopeId: "demand-stockout-chain",
    graphCenterNodeId: "graph-demand-forecast",
    graphPreset: "demand-chain",
  },
  {
    id: "action-demand-surge",
    domain: "demand",
    severity: "high",
    title: "Review demand surge forecast adjustment (+40% for storm categories)",
    summary: "Weather-adjusted demand models project a 40% uplift across emergency categories. Forecast update needed to align replenishment and allocation.",
    impact: "Improves fill rate from 78.4% to projected 92.1% across storm-critical categories.",
    dueLabel: "Due today",
    state: "pending",
    primaryAction: { label: "Approve forecast update", type: "approve" },
    secondaryAction: { label: "Open demand scenario", type: "route" },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    experimentHref: buildIncrementalityHref({
      entry: "demand",
      lens: "demand",
      application: "demand",
      experimentId: "exp-promo-forecast",
    }),
    graphScopeId: "demand-stockout-chain",
    graphCenterNodeId: "graph-demand-forecast",
    graphPreset: "demand-chain",
  },
  {
    id: "action-lastmile-reroute",
    domain: "demand",
    severity: "medium",
    title: "Approve last-mile delivery rerouting plan",
    summary: "142 delivery routes blocked by road closures. Rerouting through cleared highways and redirecting to in-store pickup recovers 40% of affected deliveries.",
    impact: "Avoids $145K in delay costs and restores delivery to 3,400 affected orders.",
    dueLabel: "Due today",
    state: "pending",
    primaryAction: { label: "Approve rerouting", type: "approve" },
    secondaryAction: { label: "Review route plan", type: "review" },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
  },
  {
    id: "action-emergency-supplier",
    domain: "demand",
    severity: "medium",
    title: "Approve emergency supplier activation",
    summary: "Activate 4 backup suppliers for water, batteries, first aid, and pet food to supplement primary supply chain disrupted by storm.",
    impact: "Provides secondary supply path — reduces stockout risk by 35% across emergency categories.",
    dueLabel: "Due today",
    state: "pending",
    primaryAction: { label: "Activate suppliers", type: "approve" },
    secondaryAction: { label: "Review supplier details", type: "review" },
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
  },
];

export const CONTROL_TOWER_ASSISTANT_SUGGESTIONS: ControlTowerAssistantSuggestion[] = [
  { id: "assist-storm", label: "What is the storm impact on my supply chain?", href: "/chat", domain: "platform" },
  { id: "assist-stockout", label: "Which SKUs are at critical stockout risk?", href: "/demand/chat", domain: "demand" },
  { id: "assist-reorder", label: "Show me the emergency reorder plan status", href: "/chat", domain: "demand" },
];

export interface ControlTowerJourneySignal {
  id: string;
  metricId: string;
  signalType: string;
  badgeLabel: string;
  badgeColor: string;
  title: string;
  description: string;
  customerName: string;
  customerRole: string;
  impact: string;
  channel: string;
  timestamp: string;
  sidebarLabel: string;
  drilldown: {
    narrative: string;
    ndcExplainer?: string;
    journeySteps: string[];
    nextSteps: string[];
  };
}

export const CONTROL_TOWER_JOURNEY_SIGNALS: ControlTowerJourneySignal[] = [
  {
    id: "signal-storm-prep",
    metricId: "platform-health",
    signalType: "storm_prep_alert",
    badgeLabel: "Storm Prep",
    badgeColor: "border-red-200 bg-red-50 text-red-700",
    title: "Storm prep alert triggered",
    description:
      "Consumer receives severe weather alert via loyalty app and begins adding essentials — water, batteries, flashlights, first aid — to cart. 4,200 similar sessions detected in the last hour.",
    customerName: "Sarah M.",
    customerRole: "Loyalty Member, Northeast Region",
    impact: "Storm-prep alert triggers cascade of emergency demand signals across supply chain.",
    channel: "App",
    timestamp: "12 min ago",
    sidebarLabel: "Storm prep alert signals",
    drilldown: {
      narrative:
        "Sarah is a loyalty member in the Northeast region. She receives a severe weather alert from the retailer's app warning of an incoming blizzard with 72-hour stay-at-home advisory. She immediately begins adding emergency essentials to her cart — water, batteries, flashlights, and first aid kits.",
      journeySteps: [
        "Severe weather push notification received via loyalty app",
        "Sarah opens app and views storm-prep essentials collection",
        "Adds water (bulk pack), batteries, flashlights, and first aid kit to cart",
        "App shows real-time stock availability at nearest store",
      ],
      nextSteps: [
        "Feed storm-prep basket data into demand surge forecasting models",
        "Trigger emergency inventory alerts for high-demand SKUs",
        "Activate storm-prep push notifications to similar segments in storm zone",
      ],
    },
  },
  {
    id: "signal-smart-substitution",
    metricId: "active-alerts",
    signalType: "smart_substitution",
    badgeLabel: "Smart Sub",
    badgeColor: "border-blue-200 bg-blue-50 text-blue-700",
    title: "Smart substitution offered",
    description:
      "App suggests product substitutes for out-of-stock items in real-time. Sarah's preferred flashlight is unavailable — alternative brand offered at same price.",
    customerName: "Sarah M.",
    customerRole: "Loyalty Member, Northeast Region",
    impact: "Smart substitution preserves basket value and reduces abandonment during stockout pressure.",
    channel: "App",
    timestamp: "18 min ago",
    sidebarLabel: "Smart substitution alerts",
    drilldown: {
      narrative:
        "Sarah tries to add her preferred LED flashlight to her cart but finds it out of stock. The app immediately suggests a comparable alternative from a different brand at the same price point, along with a bundled battery pack deal.",
      journeySteps: [
        "Sarah attempts to add LED Flashlight (Brand A) — out of stock",
        "App detects stockout and surfaces real-time substitution",
        "Alternative LED Flashlight (Brand B) offered at same price — $14.99",
        "Sarah accepts substitution and adds bundled battery pack",
        "Substitution acceptance feeds back into inventory allocation model",
      ],
      nextSteps: [
        "Track substitution acceptance rate across storm-impacted categories",
        "Update inventory allocation to prioritize available substitute SKUs",
        "Feed substitution data back into demand forecasting for next storm event",
      ],
    },
  },
  {
    id: "signal-delivery-adaptation",
    metricId: "pending-actions",
    signalType: "delivery_adaptation",
    badgeLabel: "Delivery Update",
    badgeColor: "border-amber-200 bg-amber-50 text-amber-700",
    title: "Delivery adaptation triggered",
    description:
      "System warns Sarah about delivery delays due to road closures. Offers in-store pickup at nearest open location or expedited pre-storm delivery slot.",
    customerName: "Sarah M.",
    customerRole: "Loyalty Member, Northeast Region",
    impact: "Proactive delivery adaptation reduces failed deliveries and captures revenue before storm lockdown.",
    channel: "App",
    timestamp: "8 min ago",
    sidebarLabel: "Delivery adaptation signals",
    drilldown: {
      narrative:
        "Sarah proceeds to checkout and the system detects that her delivery address is in the storm impact zone. The app proactively warns her that standard delivery may be delayed by 48–72 hours and offers two alternatives: in-store pickup at a nearby open location, or an expedited pre-storm delivery slot.",
      journeySteps: [
        "Checkout initiated — delivery address flagged in storm zone",
        "App displays storm delay warning with 48–72 hour estimate",
        "Two alternatives offered: in-store pickup or expedited pre-storm slot",
        "Sarah selects expedited pre-storm delivery — arrival by 1:00 PM today",
        "Order prioritized in pre-storm fulfilment queue",
      ],
      nextSteps: [
        "Monitor pre-storm delivery slot utilization and capacity",
        "Track customer preference between pickup and expedited delivery during storms",
        "Feed delivery adaptation choices into logistics planning models",
      ],
    },
  },
  {
    id: "signal-subscription-mgmt",
    metricId: "udp-readiness",
    signalType: "subscription_management",
    badgeLabel: "Subscription",
    badgeColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
    title: "Subscription management prompted",
    description:
      "App asks Sarah whether to expedite or defer her upcoming subscription orders before the storm. Prescription and pet food subscriptions flagged as critical.",
    customerName: "Sarah M.",
    customerRole: "Loyalty Member, Northeast Region",
    impact: "Proactive subscription management prevents missed critical deliveries during lockdown.",
    channel: "App",
    timestamp: "5 min ago",
    sidebarLabel: "Subscription management signals",
    drilldown: {
      narrative:
        "Sarah has active subscriptions for prescription medication and pet food, both scheduled for delivery during the storm window. The app proactively prompts her to choose whether to expedite these deliveries before the storm or defer them until after the lockdown ends.",
      journeySteps: [
        "App detects 2 active subscriptions scheduled during storm window",
        "Push notification: \"Storm alert — manage your upcoming deliveries\"",
        "Sarah views subscription dashboard — prescription and pet food flagged",
        "Selects \"Expedite\" for prescription — delivery moved to today",
        "Selects \"Defer\" for pet food — rescheduled to post-storm window",
      ],
      nextSteps: [
        "Prioritize expedited subscription orders in pre-storm fulfilment queue",
        "Update subscription delivery models with storm-response preference data",
        "Monitor deferred subscription reactivation rates post-storm",
      ],
    },
  },
  {
    id: "signal-cross-channel",
    metricId: "forecast-accuracy",
    signalType: "cross_channel_storm",
    badgeLabel: "Cross-Channel",
    badgeColor: "border-teal-200 bg-teal-50 text-teal-700",
    title: "Cross-channel storm prep journey",
    description:
      "Sarah engages across app, web, and in-store pickup for storm essentials. 3-channel journey within a single storm-prep session.",
    customerName: "Sarah M.",
    customerRole: "Loyalty Member, Northeast Region",
    impact: "Cross-channel storm-prep data enables better demand signal aggregation and inventory allocation.",
    channel: "Omni-channel",
    timestamp: "15 min ago",
    sidebarLabel: "Cross-channel storm prep",
    drilldown: {
      narrative:
        "Sarah begins her storm preparation on the mobile app, checks additional inventory availability on the website, then drives to the nearest open store for immediate pickup of critical items. Her cross-channel engagement creates a rich demand signal that feeds into the enterprise planning system.",
      journeySteps: [
        "Mobile app: Adds water, batteries, and first aid kit to cart",
        "Web: Checks larger pack sizes and bulk pricing not shown on app",
        "Web: Adds prescription refill request for storm window",
        "In-store: Picks up water and batteries at nearest open location",
        "App: Confirms remaining items for expedited pre-storm delivery",
      ],
      nextSteps: [
        "Aggregate cross-channel basket data into storm demand signal",
        "Update inventory allocation based on channel-specific demand patterns",
        "Feed cross-channel journey data into storm-response planning models",
      ],
    },
  },
  {
    id: "signal-inventory-demand",
    metricId: "activation-readiness",
    signalType: "emergency_inventory_signal",
    badgeLabel: "Demand Signal",
    badgeColor: "border-indigo-200 bg-indigo-50 text-indigo-700",
    title: "Emergency inventory signal generated",
    description:
      "Sarah's basket data — combined with 4,200 similar sessions — feeds into the enterprise demand signal engine. Emergency reorder thresholds triggered for 6 SKUs.",
    customerName: "Sarah M.",
    customerRole: "Loyalty Member, Northeast Region",
    impact: "Consumer basket data aggregation drives real-time emergency reorder decisions across the supply chain.",
    channel: "Platform",
    timestamp: "3 min ago",
    sidebarLabel: "Emergency inventory signals",
    drilldown: {
      narrative:
        "Sarah's completed order, combined with 4,200 similar storm-prep sessions in the last hour, triggers an aggregate demand signal that exceeds emergency reorder thresholds for 6 critical SKUs. The signal flows from consumer behavior through the demand engine to the supply chain control tower.",
      journeySteps: [
        "Sarah completes storm-prep order — $142.50 total",
        "Order data enters demand signal aggregation engine",
        "4,200 similar sessions detected in the last hour across Northeast zone",
        "Aggregate demand exceeds emergency reorder threshold for 6 SKUs",
        "Emergency reorder alert dispatched to control tower for approval",
      ],
      nextSteps: [
        "Monitor aggregate demand signal in real-time for threshold escalation",
        "Feed consumer demand patterns into post-storm recovery planning",
        "Optimize emergency reorder thresholds based on storm-event learnings",
      ],
    },
  },
];

export const CONTROL_TOWER_SUMMARY = {
  totalAlerts: CONTROL_TOWER_ALERTS.length,
  criticalAlerts: CONTROL_TOWER_ALERTS.filter((alert) => alert.severity === "critical").length,
  highAlerts: CONTROL_TOWER_ALERTS.filter((alert) => alert.severity === "high").length,
  dataFreshness: "Updated 8 min ago",
};
