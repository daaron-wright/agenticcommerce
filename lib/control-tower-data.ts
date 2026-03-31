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

const udpRevenue = ecommerceDashboardData.kpis[0]?.value ?? "£1.28M";

export const CONTROL_TOWER_HERO_METRICS: ControlTowerHeroMetric[] = [
  {
    id: "platform-health",
    label: "Customer Profile Readiness",
    value: "91.8%",
    status: "healthy",
    detail: "Profiles ready for governed activation this week",
    sparkline: [88.4, 90.1, 89.3, 91.0, 90.5, 92.1, 91.8],
  },
  {
    id: "active-alerts",
    label: "Active Business Alerts",
    value: "10",
    status: "attention",
    detail: "4 need commercial or customer decisions today",
    sparkline: [6, 7, 8, 7, 9, 10, 10],
  },
  {
    id: "pending-actions",
    label: "Open Approvals",
    value: "6",
    status: "critical",
    detail: "2 time-sensitive business decisions in the next 4 hours",
    sparkline: [8, 8, 7, 7, 7, 6, 6],
  },
  {
    id: "udp-readiness",
    label: "Consent-Safe Reach",
    value: "94.2%",
    status: "healthy",
    detail: "Identity and consent foundations are supporting active audiences",
    sparkline: [91.5, 92, 92.8, 93, 93.5, 94, 94.2],
  },
  {
    id: "forecast-accuracy",
    label: "Demand Signal Confidence",
    value: "76.4%",
    status: "attention",
    detail: "Below target in two promotional regions",
    sparkline: [78.9, 78.5, 77.8, 77.2, 76.9, 76.5, 76.4],
  },
  {
    id: "activation-readiness",
    label: "Campaign Readiness",
    value: "88.7%",
    status: "attention",
    detail: "Audience and consent readiness across live customer programs",
    sparkline: [84.5, 85.4, 86.1, 86.8, 87.2, 88.0, 88.7],
  },
];

export const CONTROL_TOWER_DOMAIN_SUMMARIES: ControlTowerDomainSummary[] = [
  {
    domain: "udp",
    label: "UDP Business View",
    description: "Customer identity, consent, enrichment, and activation readiness",
    status: "healthy",
    alertCount: 2,
    moduleHref: "/udp/dashboard",
    chatHref: "/chat",
    graphScopeId: "udp-consent-readiness",
    graphCenterNodeId: "graph-consent-record",
    graphPreset: "udp-neighborhood",
    kpis: [
      { label: "Gross Revenue", value: udpRevenue, trend: "up", trendLabel: "+12.4% vs previous 30 days" },
      { label: "Identity Match Rate", value: "94.2%", trend: "up", trendLabel: "+1.4% vs last week" },
      { label: "Data Quality Score", value: "91/100", trend: "up", trendLabel: "+3 pts this month" },
      { label: "Consent Coverage", value: "87.6%", trend: "flat", trendLabel: "Stable" },
    ],
  },
  {
    domain: "demand",
    label: "Demand Signal",
    description: "Forecasting and coverage signals that support commercial and customer decisions",
    status: "attention",
    alertCount: 5,
    moduleHref: "/demand/dashboard",
    chatHref: "/demand/chat",
    graphScopeId: "demand-stockout-chain",
    graphCenterNodeId: "graph-demand-alert",
    graphPreset: "demand-chain",
    kpis: [
      { label: "Forecast Accuracy", value: "76.4%", trend: "down", trendLabel: "-2.1% vs 80% target" },
      { label: "Avg Waste Rate", value: "8.3%", trend: "down", trendLabel: "Improving toward 6% goal" },
      { label: "Fill Rate", value: "91.2%", trend: "up", trendLabel: "+0.8% this week" },
      { label: "High Priority Alerts", value: "3", trend: "up", trendLabel: "Stockout and promo pressure" },
    ],
  },
];

export const CONTROL_TOWER_WIDGETS: ControlTowerWidget[] = [
  {
    id: "active-work-queue",
    domain: "demand",
    title: "Active Work Queue",
    subtitle: "Business decisions across customer data, activation, and demand",
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
          item: "Promo inventory approval",
          domain: "Demand",
          impact: "£576K at risk",
          due: "4h",
          status: "Pending",
        },
        status: "critical",
        statusLabel: "Pending",
      },
      {
        id: "queue-consent",
        values: {
          item: "Consent conflict review",
          domain: "UDP",
          impact: "37 profiles held",
          due: "Today",
          status: "Review",
        },
        status: "attention",
        statusLabel: "Review",
      },
      {
        id: "queue-pmax",
        values: {
          item: "Campaign budget reallocation",
          domain: "Commercial",
          impact: "£28K upside",
          due: "Today",
          status: "Ready",
        },
        status: "healthy",
        statusLabel: "Ready",
      },
      {
        id: "queue-forecast",
        values: {
          item: "Demand-led promo forecast update",
          domain: "Demand",
          impact: "+15% dairy plan",
          due: "Tomorrow",
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
    subtitle: "Customer, consent, audience, and campaign readiness",
    kind: "scorecard_list",
    defaultExpanded: true,
    routeHref: "/udp/dashboard",
    routeLabel: "Open UDP Dashboard",
    scoreRows: [
      { label: "Reachable customer profiles", meta: "Cross-channel household match rate", score: 94, status: "healthy", statusLabel: "Healthy" },
      { label: "Consent-safe audience reach", meta: "Eligible profiles cleared for governed activation", score: 88, status: "healthy", statusLabel: "Healthy" },
      { label: "Campaign efficiency", meta: "Overspend and suppression controls in place", score: 79, status: "attention", statusLabel: "Review" },
      { label: "Profile quality blockers", meta: "Open merge and enrichment exceptions", score: 62, status: "attention", statusLabel: "Watch" },
      { label: "Decision handoff speed", meta: "How quickly customer and demand decisions move to action", score: 48, status: "critical", statusLabel: "Critical" },
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
        meta: "Google Lift Test Summer '24 validated PMAX headroom",
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
    subtitle: "Commercial demand signal across priority categories",
    kind: "dual_line_trend",
    defaultExpanded: true,
    routeHref: "/demand/dashboard",
    routeLabel: "Open Demand Dashboard",
    summary: "Promotional and seasonal demand is running ahead of forecast in priority categories.",
    trendLegend: {
      primaryLabel: "Actual",
      secondaryLabel: "Forecast",
    },
    trendPoints: [
      { label: "Oct", primary: 72, secondary: 70 },
      { label: "Nov", primary: 74, secondary: 71 },
      { label: "Dec", primary: 79, secondary: 75 },
      { label: "Jan", primary: 68, secondary: 69 },
      { label: "Feb", primary: 70, secondary: 70 },
      { label: "Mar", primary: 73, secondary: 72 },
    ],
  },
  {
    id: "regional-coverage",
    domain: "demand",
    title: "Regional Coverage Levels",
    subtitle: "Current demand cover across fulfillment nodes",
    kind: "capacity_bars",
    defaultExpanded: false,
    routeHref: "/demand/dashboard",
    routeLabel: "View Regional Coverage",
    capacityRows: [
      { label: "Manchester DC", meta: "1,800 MT available · 2,400 MT reserved", usedPercent: 77, reservedPercent: 24, totalLabel: "6,000 MT capacity", status: "attention" },
      { label: "Bristol DC", meta: "1,100 MT available · 1,700 MT reserved", usedPercent: 69, reservedPercent: 18, totalLabel: "4,800 MT capacity", status: "attention" },
      { label: "Leeds Hub", meta: "2,400 MT available · 1,200 MT reserved", usedPercent: 58, reservedPercent: 12, totalLabel: "6,200 MT capacity", status: "healthy" },
      { label: "London DC", meta: "2,900 MT available · 900 MT reserved", usedPercent: 46, reservedPercent: 9, totalLabel: "8,100 MT capacity", status: "healthy" },
    ],
  },
  {
    id: "inventory-coverage",
    domain: "demand",
    title: "Business Commitments Timeline",
    subtitle: "Launch, audience refresh, and demand-support milestones",
    kind: "timeline_gantt",
    defaultExpanded: false,
    routeHref: "/demand/dashboard",
    routeLabel: "View Inbound Timeline",
    timelineRows: [
      { label: "Manchester promo coverage", meta: "Demand coverage approval window", offset: 8, span: 42, status: "critical", rightLabel: "DM-4789" },
      { label: "Dairy demand safeguard", meta: "Backup coverage milestone", offset: 18, span: 34, status: "attention", rightLabel: "DM-4811" },
      { label: "Regional demand rebalance", meta: "Cross-region support commitment", offset: 30, span: 28, status: "healthy", rightLabel: "PLAN-204" },
      { label: "Loyalty audience refresh", meta: "Consent-safe activation window", offset: 54, span: 18, status: "healthy", rightLabel: "AUD-88" },
    ],
  },
  {
    id: "identity-exceptions",
    domain: "udp",
    title: "Identity Exceptions",
    subtitle: "Records impacting downstream activation",
    kind: "list",
    defaultExpanded: false,
    routeHref: "/customers",
    routeLabel: "Review Customer Records",
    rows: [
      { label: "Email format mismatch", value: "1,240", meta: "Loyalty records failed merge", status: "attention", progress: 58 },
      { label: "Duplicate household profiles", value: "216", meta: "Needs merge review", status: "attention", progress: 42 },
      { label: "Consent conflicts", value: "37", meta: "Manual override required", status: "critical", progress: 25 },
    ],
  },
  {
    id: "campaign-efficiency",
    domain: "campaign",
    title: "Spend / Mix Breakdown",
    subtitle: "Budget mix across active categories and channels",
    kind: "donut_breakdown",
    defaultExpanded: false,
    routeHref: "/campaigns",
    routeLabel: "Open Campaigns",
    breakdownSegments: [
      { label: "PMAX", value: 44, color: "#3f7f89", meta: "£440K" },
      { label: "Display", value: 18, color: "#f28c82", meta: "£180K" },
      { label: "Meta", value: 14, color: "#8a9bcf", meta: "£140K" },
      { label: "Email / CRM", value: 13, color: "#92c6c0", meta: "£130K" },
      { label: "Affiliates", value: 11, color: "#d6b37a", meta: "£110K" },
    ],
  },
];

export const CONTROL_TOWER_ALERTS: ControlTowerAlert[] = [
  {
    id: "alert-demand-stockout",
    domain: "demand",
    severity: "critical",
    title: "SKU Understock Alert",
    description: "Manchester promotional demand is outpacing cover on three chilled SKUs. Business approval is needed within 4 hours to protect sales.",
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
        "Promotional demand plus inbound delay is compressing cover across three chilled SKUs.",
        "Three perishable SKUs are below minimum cover and at risk of stockout within 2 days.",
        "Conditional approvals can protect revenue while limiting oversupply if delivery slips.",
      ],
      items: [
        {
          id: "chicken-tikka",
          title: "Chilled Ready Meals: Chicken Tikka",
          subtitle: "Manchester DC · 2 days cover remaining",
          metric: "12,000 cases · £43,200",
          detail: "Auto-cancel if delivery confirmation is not received within 5 business days.",
          supportingLabel: "Alt. Supplier: Matheson",
          stock: "340 cases",
          actionAmount: "Reorder: 12,000 cases",
          unitCost: "£3.60",
          totalCost: "£43,200",
          suggestedConditions: [
            "Auto-cancel if delivery confirmation is not received within 5 business days",
            "Approve up to 10,000 cases and defer the remainder to the next standard cycle",
            "Cancel if unit cost exceeds £4.20 at invoicing",
          ],
        },
        {
          id: "panna-cotta",
          title: "Fresh Dairy Desserts: Panna Cotta",
          subtitle: "Manchester DC · 2.1 days cover remaining",
          metric: "8,000 cases · £16,800",
          detail: "Route to alternate supplier if inbound slot is missed.",
          supportingLabel: "Alt. Supplier: Macrock",
          stock: "180 cases",
          actionAmount: "Reorder: 8,000 cases",
          unitCost: "£2.10",
          totalCost: "£16,800",
          suggestedConditions: [
            "Route to alternate supplier if the inbound slot is missed",
            "Escalate to logistics if the ETA slips by more than 12 hours",
          ],
        },
        {
          id: "mixed-leaves",
          title: "Bagged Salad: Mixed Leaves",
          subtitle: "Manchester DC · 1.9 days cover remaining",
          metric: "6,000 cases · £10,800",
          detail: "Escalate to operations if condition threshold is breached.",
          supportingLabel: "Alt. Supplier: Edwin Fresh",
          stock: "95 cases",
          actionAmount: "Reorder: 6,000 cases",
          unitCost: "£1.80",
          totalCost: "£10,800",
          suggestedConditions: [
            "Escalate to operations if the threshold is breached during transit",
            "Reduce the reorder by 20% if adjacent DC surplus becomes available",
          ],
        },
      ],
      auditTrail: [
        { time: "08:20", actor: "Inventory Analysis Agent", detail: "Detected below-threshold cover across three chilled SKUs.", badge: "Inventory Analysis Agent" },
        { time: "08:35", actor: "Policy Engine", detail: "Prepared conditional approval templates and alternate supplier options.", badge: "Policy Engine" },
        { time: "11:12", actor: "Supply Operator", detail: "Alert acknowledged and queued for manager approval.", badge: "Supply Operator" },
      ],
      nextSteps: [
        "Relevant agents notified and emergency delivery slots confirmed",
        "Policy engine activated to monitor live conditions and auto-cancel if breached",
        "Projected revenue loss reduced if at least one conditional approval is accepted",
      ],
      decisionSummary: {
        headline: "Decisions submitted",
        loggedAt: "11:56",
        reference: "REPR-1290",
        items: [
          {
            id: "summary-chicken-tikka",
            title: "Chilled Ready Meals: Chicken Tikka",
            outcome: "Conditional approval",
            detail: "Approve up to 10,000 cases and defer the remainder to the next standard cycle.",
            metric: "12,000 cases · £43,200",
          },
          {
            id: "summary-panna-cotta",
            title: "Fresh Dairy Desserts: Panna Cotta",
            outcome: "Pending business decision",
            detail: "Awaiting final business decision.",
            metric: "8,000 cases · £16,800",
          },
          {
            id: "summary-mixed-leaves",
            title: "Bagged Salad: Mixed Leaves",
            outcome: "Pending business decision",
            detail: "Awaiting final business decision.",
            metric: "6,000 cases · £10,800",
          },
        ],
      },
      agentFlow: [
        {
          id: "supplier-risk",
          title: "Supplier Risk Monitoring",
          subtitle: "06:15",
          summary: "Monitors live supplier feeds for disruption and commodity price spikes.",
          output: "disruption_alert",
          priority: "High",
          processingTime: "2 min",
          tone: "amber",
        },
        {
          id: "inventory-analysis",
          title: "Inventory Analysis Agent",
          subtitle: "06:18",
          summary: "Identifies understocked SKUs and calculates emergency reorder quantities.",
          output: "reorder_qty",
          priority: "High",
          processingTime: "50 sec",
          tone: "blue",
        },
        {
          id: "alert-dispatch",
          title: "Alert Dispatch Agent",
          subtitle: "06:20",
          summary: "Dispatches the urgent approval request to the control tower and policy engine.",
          output: "alert_id",
          priority: "Medium",
          processingTime: "1 min",
          tone: "violet",
        },
      ],
    },
  },
  {
    id: "alert-udp-consent",
    domain: "udp",
    severity: "medium",
    title: "Consent conflict cluster detected",
    description: "37 customer records have conflicting consent state after the latest refresh campaign. Review is needed before the next activation wave can proceed.",
    timestamp: "09:30",
    routeHref: "/customers",
    routeLabel: "Review Records",
    experimentHref: buildIncrementalityHref({
      entry: "udp",
      lens: "udp",
      application: "consent",
      experimentId: "exp-consent-journey",
    }),
    graphScopeId: "udp-consent-readiness",
    graphCenterNodeId: "graph-consent-record",
    graphPreset: "udp-neighborhood",
    drilldown: {
      title: "Consent Conflict Review",
      summary: [
        "The latest consent refresh performed well overall, but 37 customer records now show conflicting channel status.",
        "The next activation wave should stay paused until those records are reviewed and safely released.",
      ],
      items: [
        {
          id: "email-conflicts",
          title: "Email consent mismatch",
          subtitle: "21 records",
          metric: "Activation paused",
          detail: "Conflicting email status between web preference center and in-store opt-in.",
          supportingLabel: "Owner: Consent Operations",
          stock: "Affected profiles: 21",
          actionAmount: "Pause scope: loyalty activation",
          suggestedConditions: [
            "Pause activation until timestamp evidence is attached to the newer consent event",
            "Route the record set to manual review if evidence remains incomplete after 24 hours",
          ],
        },
        {
          id: "sms-conflicts",
          title: "SMS consent mismatch",
          subtitle: "16 records",
          metric: "Manual resolution",
          detail: "Missing timestamp evidence for one of the channel states.",
          supportingLabel: "Owner: Identity Stewardship",
          stock: "Affected profiles: 16",
          actionAmount: "Resolution path: manual",
          suggestedConditions: [
            "Require timestamp evidence before any outbound activation resumes",
            "Notify campaign operations if the mismatch remains unresolved by next send window",
          ],
        },
      ],
      auditTrail: [
        { time: "08:10", actor: "Consent Agent", detail: "Campaign refresh completed at 84.3% re-consent rate.", badge: "Consent Agent" },
        { time: "08:14", actor: "Data Quality Agent", detail: "Flagged 37 conflicting records for business review.", badge: "Data Quality Agent" },
      ],
      nextSteps: [
        "Customer-data and campaign teams notified to keep activation safely paused",
        "Evidence gaps remain visible to the graph neighborhood and customer drill-in pages",
        "Resolved records can be released back into governed activation after review",
      ],
      decisionSummary: {
        headline: "Review submitted",
        loggedAt: "09:30",
        reference: "UDP-8827",
        items: [
          {
            id: "summary-email",
            title: "Email consent mismatch",
            outcome: "Hold for review",
            detail: "Keep outbound activation paused until timestamp evidence is confirmed.",
            metric: "21 profiles",
          },
          {
            id: "summary-sms",
            title: "SMS consent mismatch",
            outcome: "Manual resolution",
            detail: "Route to identity stewardship for evidence reconciliation.",
            metric: "16 profiles",
          },
        ],
      },
      agentFlow: [
        {
          id: "consent-agent",
          title: "Consent Agent",
          subtitle: "08:10",
          summary: "Monitors refresh outcomes and flags cross-channel inconsistencies.",
          output: "consent_delta",
          priority: "Medium",
          processingTime: "25 sec",
          tone: "emerald",
        },
        {
          id: "data-quality-agent",
          title: "Data Quality Agent",
          subtitle: "08:14",
          summary: "Builds the conflicting-record set and recommends the safest activation decision.",
          output: "review_queue",
          priority: "Medium",
          processingTime: "45 sec",
          tone: "blue",
        },
      ],
    },
  },
  {
    id: "alert-campaign-overspend",
    domain: "campaign",
    severity: "high",
    title: "BOGO Promo Overspend",
    description: "Summer BOGO campaign is tracking 18% over budget. Non-performing Display placements are contributing £8.4K in wasted spend.",
    timestamp: "08:15",
    routeHref: "/campaigns",
    routeLabel: "Open Campaigns",
    experimentHref: buildIncrementalityHref({
      entry: "udp",
      lens: "udp",
      application: "campaigns",
      experimentId: "exp-pmax-uk",
    }),
    drilldown: {
      title: "Campaign Budget Deviation",
      summary: [
        "Summer BOGO promotion launched Monday across Google, Meta, and Display.",
        "Display placements are underperforming with 0.4% CTR vs 2.1% target.",
        "Current overspend trajectory projects 22% budget overrun by end of week.",
      ],
      items: [
        {
          id: "display-realloc",
          title: "Reallocate Display budget to PMAX",
          subtitle: "Google Ads campaign",
          metric: "£12K reallocation",
          detail: "PMAX has headroom at current saturation. Shift recovers estimated £28K in forecasted ROAS.",
        },
        {
          id: "meta-pause",
          title: "Pause underperforming Meta placements",
          subtitle: "Audience segment: Mid-funnel",
          metric: "£3.4K weekly saving",
          detail: "3 ad sets below 0.5% CTR threshold. Pausing frees budget for top-funnel retargeting.",
        },
      ],
      auditTrail: [
        { time: "07:40", actor: "Campaign Intelligence Agent", detail: "Detected overspend trajectory across Display placements." },
        { time: "07:58", actor: "Budget Allocation Model", detail: "Identified PMAX headroom and reallocation opportunity." },
        { time: "08:12", actor: "Marketing Operations", detail: "Alert queued for business approval." },
      ],
    },
  },
];

export const CONTROL_TOWER_ACTIONS: ControlTowerAction[] = [
  {
    id: "action-stockout",
    domain: "demand",
    severity: "critical",
    title: "Approve promo demand coverage for chilled ready meals",
    summary: "Conditional business approval is available for three Manchester SKUs to avoid a 48-hour stockout risk during the current promo wave.",
    impact: "Protects fill rate and limits a projected £576K revenue shortfall.",
    dueLabel: "Due in 4h",
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
    id: "action-experiment-launch",
    domain: "udp",
    severity: "medium",
    title: "Approve loyalty audience holdout launch",
    summary: "Marketing wants to launch a consent-safe loyalty holdout to validate reactivation lift before the next wave.",
    impact: "Could improve reactivation rate by 8.6% while reducing blocked-profile leakage.",
    dueLabel: "Due today",
    state: "pending",
    primaryAction: { label: "Approve test launch", type: "approve" },
    secondaryAction: { label: "Review experiment", type: "review" },
    routeHref: buildIncrementalityHref({
      entry: "udp",
      lens: "udp",
      application: "audiences",
      experimentId: "exp-loyalty-audience",
    }),
    routeLabel: "Open Experiment Workspace",
    experimentHref: buildIncrementalityHref({
      entry: "udp",
      lens: "udp",
      application: "audiences",
      experimentId: "exp-loyalty-audience",
    }),
  },
  {
    id: "action-identity",
    domain: "udp",
    severity: "high",
    title: "Review identity merge impact on reachable audience",
    summary: "1,240 records failed cross-channel merge because of malformed email identifiers and household duplication.",
    impact: "Protects reachable audience size and activation quality across live customer programs.",
    dueLabel: "Due today",
    state: "pending",
    primaryAction: { label: "Review audience impact", type: "route" },
    secondaryAction: { label: "Review details", type: "review" },
    routeHref: "/udp/dashboard",
    routeLabel: "Open UDP Dashboard",
    experimentHref: buildIncrementalityHref({
      entry: "udp",
      lens: "udp",
      application: "identity",
      experimentId: "exp-identity-holdout",
    }),
    graphScopeId: "udp-consent-readiness",
    graphCenterNodeId: "graph-identity-profile",
    graphPreset: "udp-neighborhood",
  },
  {
    id: "action-forecast",
    domain: "demand",
    severity: "medium",
    title: "Approve demand-informed promo forecast adjustment",
    summary: "Increase dairy forecast by 15% for the next 7 days to match weather-driven demand uplift around live promotions.",
    impact: "Projected to lift fill rate to 97.5% while supporting promotional availability.",
    dueLabel: "Due tomorrow",
    state: "pending",
    primaryAction: { label: "Approve", type: "approve" },
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
    id: "action-pmax-reallocation",
    domain: "campaign",
    severity: "medium",
    title: "Approve PMAX budget reallocation",
    summary: "Shift £12K from underperforming Display to PMAX to recover forecasted ROAS by 0.4x.",
    impact: "Projected to recover £28K in commercial return at current PMAX performance.",
    dueLabel: "Due today",
    state: "pending",
    primaryAction: { label: "Approve reallocation", type: "approve" },
    secondaryAction: { label: "Review campaign model", type: "review" },
    routeHref: "/campaigns",
    routeLabel: "Open Campaigns",
    experimentHref: buildIncrementalityHref({
      entry: "udp",
      lens: "udp",
      application: "campaigns",
      experimentId: "exp-pmax-uk",
    }),
  },
];

export const CONTROL_TOWER_ASSISTANT_SUGGESTIONS: ControlTowerAssistantSuggestion[] = [
  { id: "assist-urgent", label: "What needs my attention right now?", href: "/chat", domain: "platform" },
  { id: "assist-demand", label: "Explain the forecast deviation", href: "/demand/chat", domain: "demand" },
  { id: "assist-udp", label: "Which UDP issues are blocking activation?", href: "/chat", domain: "udp" },
];

export const CONTROL_TOWER_SUMMARY = {
  totalAlerts: CONTROL_TOWER_ALERTS.length,
  criticalAlerts: CONTROL_TOWER_ALERTS.filter((alert) => alert.severity === "critical").length,
  highAlerts: CONTROL_TOWER_ALERTS.filter((alert) => alert.severity === "high").length,
  dataFreshness: "Updated 8 min ago",
};
