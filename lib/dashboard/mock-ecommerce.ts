export type KpiDirection = "up" | "down";

export type EcomKpi = {
  label: string;
  value: string;
  delta: string;
  direction: KpiDirection;
  subtext: string;
  warning?: {
    label: string;
    message: string;
    options: {
      warningActionId: string;
      title: string;
      description: string;
      prompt: string;
    }[];
  };
};

export type DailyPerformancePoint = {
  day: string;
  revenue: number;
  orders: number;
};

export type FunnelStage = {
  stage: "Sessions" | "Add to Cart" | "Checkout" | "Purchase";
  users: number;
};

export type ChannelPerformance = {
  channel: string;
  sessions: number;
  orders: number;
  revenue: number;
  conversionRate: number;
};

export type TopProduct = {
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  returnRate: number;
  stockStatus: "Healthy" | "Low" | "Critical";
  warningActionId?: string;
  warningPrompt?: string;
  isCriticalWarning?: boolean;
};

export type OpsMetric = {
  label: string;
  value: string;
  status: "good" | "warning" | "risk";
  warningActionId?: string;
  warningPrompt?: string;
  isCriticalWarning?: boolean;
};

export type RegionSplit = {
  region: string;
  revenue: number;
};

export type DashboardActivity = {
  text: string;
  time: string;
};

export type EcommerceDashboardData = {
  title: string;
  description: string;
  kpis: EcomKpi[];
  dailyPerformance: DailyPerformancePoint[];
  funnel: FunnelStage[];
  channels: ChannelPerformance[];
  topProducts: TopProduct[];
  operations: OpsMetric[];
  regions: RegionSplit[];
  recentActivity: DashboardActivity[];
};

export const ecommerceDashboardData: EcommerceDashboardData = {
  title: "Ecommerce Dashboard",
  description: "Sales, customers, catalog, and operations performance overview",
  kpis: [
    { label: "Gross Revenue", value: "$2.76M", delta: "+142.8%", direction: "up", subtext: "storm-prep surge vs prior week" },
    { label: "Total Orders", value: "48,210", delta: "+186.4%", direction: "up", subtext: "panic buying across all channels" },
    { label: "Average Order Value", value: "$57.20", delta: "+28.6%", direction: "up", subtext: "bulk buying pattern" },
    {
      label: "Conversion Rate",
      value: "8.4%",
      delta: "+4.5pp",
      direction: "up",
      subtext: "storm-prep urgency driving conversion",
      warning: {
        label: "AI warning",
        message: "Conversion has softened week-over-week, with elevated drop-off in checkout completion.",
        options: [
          {
            warningActionId: "warning-checkout-friction",
            title: "Diagnose checkout friction",
            description: "Identify where users are abandoning and which step has the highest drop-off.",
            prompt: "Review checkout funnel drop-off and show where conversion is leaking",
          },
          {
            warningActionId: "warning-conversion-wins",
            title: "Recommend fast conversion wins",
            description: "Get the highest-impact actions the AI recommends to recover conversion quickly.",
            prompt: "What AI actions are recommended to improve checkout conversion?",
          },
          {
            warningActionId: "warning-conversion-scenario",
            title: "Run conversion uplift scenario",
            description: "Model the projected business impact of reducing checkout friction.",
            prompt: "Run a scenario to improve checkout efficiency and project conversion uplift",
          },
        ],
      },
    },
    { label: "Returning Customer Rate", value: "62.8%", delta: "+25.3pp", direction: "up", subtext: "loyalty members stocking up" },
    {
      label: "Return Rate",
      value: "1.2%",
      delta: "-4.9pp",
      direction: "up",
      subtext: "essential goods — low return rate",
      warning: {
        label: "AI warning",
        message: "Return rate is rising in high-volume categories. Review options to investigate and mitigate risk.",
        options: [
          {
            warningActionId: "warning-return-drivers",
            title: "Analyze category return drivers",
            description: "Find which product categories and SKUs are contributing most to the increase.",
            prompt: "Why is return rate up and which categories are most affected?",
          },
          {
            warningActionId: "warning-return-recs",
            title: "Show AI recommendations",
            description: "Review prioritized actions the AI suggests to reduce return pressure.",
            prompt: "What AI actions are recommended to reduce returns?",
          },
          {
            warningActionId: "warning-stockout-risk",
            title: "Check demand vs stock outage risk",
            description: "Assess whether inventory mismatch is amplifying stockout and fulfillment risk.",
            prompt: "Show me demand versus stock outage risk by category",
          },
        ],
      },
    },
  ],
  dailyPerformance: [
    { day: "Mon", revenue: 38200, orders: 692 },
    { day: "Tue", revenue: 40100, orders: 724 },
    { day: "Wed", revenue: 41900, orders: 741 },
    { day: "Thu", revenue: 44300, orders: 780 },
    { day: "Fri", revenue: 48800, orders: 844 },
    { day: "Sat", revenue: 52100, orders: 905 },
    { day: "Sun", revenue: 49500, orders: 861 },
    { day: "Mon 2", revenue: 40600, orders: 736 },
    { day: "Tue 2", revenue: 42200, orders: 748 },
    { day: "Wed 2", revenue: 44700, orders: 801 },
    { day: "Thu 2", revenue: 47300, orders: 838 },
    { day: "Fri 2", revenue: 52600, orders: 914 },
    { day: "Sat 2", revenue: 56300, orders: 972 },
    { day: "Sun 2", revenue: 53800, orders: 939 },
  ],
  funnel: [
    { stage: "Sessions", users: 648000 },
    { stage: "Add to Cart", users: 120400 },
    { stage: "Checkout", users: 61200 },
    { stage: "Purchase", users: 24890 },
  ],
  channels: [
    { channel: "Direct", sessions: 184000, orders: 8610, revenue: 452000, conversionRate: 4.68 },
    { channel: "Search", sessions: 163000, orders: 7010, revenue: 381000, conversionRate: 4.30 },
    { channel: "Email", sessions: 69000, orders: 3750, revenue: 211000, conversionRate: 5.43 },
    { channel: "Social", sessions: 128000, orders: 3820, revenue: 166000, conversionRate: 2.98 },
    { channel: "Affiliates", sessions: 54000, orders: 1700, revenue: 70000, conversionRate: 3.15 },
    { channel: "Other", sessions: 50000, orders: 0, revenue: 0, conversionRate: 0 },
  ],
  topProducts: [
    {
      name: "Bulk Water Pack (24ct)",
      sku: "WTR-101",
      unitsSold: 19525,
      revenue: 312400,
      returnRate: 0.2,
      stockStatus: "Critical",
      warningActionId: "warning-stockout-risk",
      warningPrompt: "Assess Water Bulk Pack (WTR-101) critical stockout risk and recommend emergency reorder",
      isCriticalWarning: true,
    },
    {
      name: "AA Batteries 48-Pack",
      sku: "BAT-301",
      unitsSold: 15600,
      revenue: 218400,
      returnRate: 0.4,
      stockStatus: "Critical",
      warningActionId: "warning-stockout-risk",
      warningPrompt: "Assess AA Batteries (BAT-301) critical stockout risk and recommend emergency reorder",
      isCriticalWarning: true,
    },
    { name: "Emergency First Aid Kit", sku: "FAK-401", unitsSold: 9310, revenue: 186200, returnRate: 0.1, stockStatus: "Critical" },
    { name: "Chilled Ready Meals 6-Pack", sku: "RDM-101", unitsSold: 10300, revenue: 164800, returnRate: 2.1, stockStatus: "Low" },
    { name: "LED Flashlight Pro", sku: "FLT-112", unitsSold: 10947, revenue: 164200, returnRate: 0.8, stockStatus: "Critical" },
  ],
  operations: [
    { label: "On-time Fulfillment", value: "68.2%", status: "risk" },
    { label: "Avg Delivery Time", value: "6.4 days", status: "risk" },
    { label: "DC In-Stock Rate", value: "84.6%", status: "warning" },
    { label: "Low Stock SKUs", value: "47", status: "risk" },
    {
      label: "Critical Stockout Risk",
      value: "12",
      status: "risk",
      warningActionId: "warning-stockout-risk",
      warningPrompt: "Show me storm-critical SKUs at stockout risk",
      isCriticalWarning: true,
    },
    { label: "Cold-Chain Status", value: "At Risk", status: "risk" },
  ],
  regions: [
    { region: "Northeast US", revenue: 1_124_000 },
    { region: "Midwest US", revenue: 682_000 },
    { region: "Southeast US", revenue: 498_000 },
    { region: "West US", revenue: 312_000 },
    { region: "Other", revenue: 144_000 },
  ],
  recentActivity: [
    { text: "Storm-prep push notifications drove 4,200 sessions in last hour", time: "12m ago" },
    { text: "Emergency reorder submitted for 6 storm-critical SKUs at Northeast DC", time: "34m ago" },
    { text: "Smart substitution activated — 68% acceptance on out-of-stock items", time: "1h ago" },
    { text: "3,400 delivery orders redirected to in-store pickup", time: "2h ago" },
    { text: "Cold-chain alert: Generator fuel at 18 hours — resupply dispatched", time: "4h ago" },
  ],
};
