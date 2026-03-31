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
    { label: "Gross Revenue", value: "£1.28M", delta: "+12.4%", direction: "up", subtext: "vs previous 30 days" },
    { label: "Total Orders", value: "24,890", delta: "+8.1%", direction: "up", subtext: "across all channels" },
    { label: "Average Order Value", value: "£51.40", delta: "+3.2%", direction: "up", subtext: "basket size trend" },
    {
      label: "Conversion Rate",
      value: "3.9%",
      delta: "-0.2pp",
      direction: "down",
      subtext: "sessions to purchase",
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
    { label: "Returning Customer Rate", value: "37.5%", delta: "+1.4pp", direction: "up", subtext: "customer loyalty indicator" },
    {
      label: "Return Rate",
      value: "6.1%",
      delta: "+0.6pp",
      direction: "down",
      subtext: "watch high-return SKUs",
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
    { name: "Urban Winter Jacket", sku: "UWJ-244", unitsSold: 1820, revenue: 154700, returnRate: 4.1, stockStatus: "Healthy" },
    { name: "Performance Running Shoes", sku: "PRS-819", unitsSold: 1635, revenue: 129400, returnRate: 6.7, stockStatus: "Low" },
    { name: "Smart Fitness Tracker", sku: "SFT-102", unitsSold: 1310, revenue: 118900, returnRate: 3.2, stockStatus: "Healthy" },
    {
      name: "Travel Pro Backpack",
      sku: "TPB-551",
      unitsSold: 980,
      revenue: 84200,
      returnRate: 8.6,
      stockStatus: "Critical",
      warningActionId: "warning-stockout-risk",
      warningPrompt:
        "Assess Travel Pro Backpack (TPB-551) critical stockout risk and recommend immediate replenishment or transfer actions",
      isCriticalWarning: true,
    },
    { name: "Essential Hoodie", sku: "EHD-331", unitsSold: 1425, revenue: 80300, returnRate: 5.4, stockStatus: "Low" },
  ],
  operations: [
    { label: "On-time Fulfillment", value: "96.2%", status: "good" },
    { label: "Avg Delivery Time", value: "2.8 days", status: "good" },
    { label: "Refund Processing SLA", value: "91.4%", status: "warning" },
    { label: "Low Stock SKUs", value: "27", status: "warning" },
    {
      label: "Critical Stockout Risk",
      value: "6",
      status: "risk",
      warningActionId: "warning-stockout-risk",
      warningPrompt: "Show me demand versus stock outage risk by category",
      isCriticalWarning: true,
    },
    { label: "CSAT", value: "4.6 / 5", status: "good" },
  ],
  regions: [
    { region: "United Kingdom", revenue: 472000 },
    { region: "Germany", revenue: 241000 },
    { region: "France", revenue: 198000 },
    { region: "Nordics", revenue: 156000 },
    { region: "Rest of EU", revenue: 213000 },
  ],
  recentActivity: [
    { text: "Weekend campaign drove +9% uplift in orders for outerwear category", time: "12m ago" },
    { text: "Stock alert triggered for Travel Pro Backpack in 3 warehouses", time: "34m ago" },
    { text: "Returns rate rose for Running Shoes after size-guide change", time: "1h ago" },
    { text: "Email automation recovered 420 abandoned carts in 24h", time: "2h ago" },
    { text: "Fulfillment SLA restored above 95% after courier routing fix", time: "4h ago" },
  ],
};
