export interface CommercialReviewTakeaway {
  title: string;
  narrative: string;
  metric: string;
  tone: "positive" | "warning";
}

export interface CommercialReviewKPI {
  label: string;
  value: string;
  wow: string;
  yoy: string;
  status: "strong" | "watch" | "risk";
}

export interface CommercialReviewMarketRow {
  market: string;
  grossSales: number;
  wow: string;
  yoy: string;
  newCustomers: string;
  cac: string;
  note: string;
}

export interface CommercialReviewPaidChannelRow {
  channel: string;
  spend: number;
  grossSales: number;
  wowSales: string;
  roas: string;
  cac: string;
  newCustomers: string;
  action: string;
}

export interface CommercialReviewTrendPoint {
  day: string;
  currentWeek: number;
  previousWeek: number;
  lastYear: number;
}

export interface CommercialReviewPerformanceTrendPoint {
  day: string;
  grossSalesCurrent: number;
  grossSalesPrevious: number;
  grossSalesLastYear: number;
  roas: number;
  cac: number;
}

type CommercialReviewNBAActionId =
  | "boost-pmax"
  | "suppress-fb"
  | "launch-winback"
  | "optimize-pdp"
  | "rebalance-inventory"
  | "promote-bundles"
  | "improve-checkout"
  | "reduce-returns"
  | "launch-loyalty";

export interface CommercialReviewRecommendation {
  id: string;
  title: string;
  type: "strategic" | "tactical";
  priority: "high" | "medium" | "low";
  action: string;
  impact: string;
  nbaActionId: CommercialReviewNBAActionId;
  executePrompt: string;
  reviewPrompt: string;
}

export const WEEKLY_COMMERCIAL_REVIEW = {
  title: "Weekly Commercial Review",
  promptLabel: "Run weekly commercial review for last week",
  periodLabel: "09 Mar – 15 Mar, 2026",
  comparisonLabel: "vs 02 Mar – 08 Mar, 2026",
  yoyComparisonLabel: "vs 10 Mar – 16 Mar, 2025",
  keyTakeaways: [
    {
      title: "Storm-prep demand surge driving record revenue",
      narrative:
        "Gross sales surged to $2.76M as panic buying of emergency essentials drove 142% WoW growth. Northeast region accounts for 41% of total revenue.",
      metric: "$2.76M gross sales · +142.8% WoW · +312.6% YoY",
      tone: "positive",
    },
    {
      title: "Conversion rate at all-time high on urgency",
      narrative:
        "Storm-prep urgency driving 8.4% conversion rate as consumers prioritize essentials. App and push notification channels leading engagement.",
      metric: "8.4% conversion · +4.5pp WoW · Push notifications +380%",
      tone: "positive",
    },
    {
      title: "Supply chain under extreme pressure",
      narrative:
        "47 SKUs at critical stockout risk. On-time delivery dropped to 68.2% due to road closures. Cold-chain integrity at risk from power outages.",
      metric: "68.2% on-time delivery · 47 SKUs at risk · 3 DCs impacted",
      tone: "warning",
    },
    {
      title: "Emergency reorder decisions needed within 2 hours",
      narrative:
        "Pre-storm delivery window closes at 2:00 PM. Emergency reorders for water, batteries, first aid, and ready meals require immediate approval.",
      metric: "$820K at risk · 6 emergency reorders pending · 2h window",
      tone: "warning",
    },
  ] satisfies CommercialReviewTakeaway[],
  kpis: [
    { label: "Gross sales", value: "$2.76M", wow: "+142.8%", yoy: "+312.6%", status: "strong" },
    { label: "Net sales", value: "$2.68M", wow: "+138.4%", yoy: "+298.2%", status: "strong" },
    { label: "Orders", value: "48.2K", wow: "+186.4%", yoy: "+324.8%", status: "strong" },
    { label: "Conversion rate", value: "8.4%", wow: "+4.5pp", yoy: "+5.2pp", status: "strong" },
    { label: "Fill rate", value: "78.4%", wow: "-12.8pp", yoy: "-16.2pp", status: "risk" },
    { label: "On-time delivery", value: "68.2%", wow: "-26.3pp", yoy: "-28.1pp", status: "risk" },
    { label: "DC in-stock rate", value: "84.6%", wow: "-11.6pp", yoy: "-12.4pp", status: "watch" },
    { label: "SKUs at risk", value: "47", wow: "+39", yoy: "+44", status: "risk" },
  ] satisfies CommercialReviewKPI[],
  marketBreakdown: [
    {
      market: "Northeast US (Storm Zone)",
      grossSales: 1_124_000,
      wow: "+248.6%",
      yoy: "+412.8%",
      newCustomers: "8.2K",
      cac: "$12.40",
      note: "Epicenter of storm-prep buying. 47 SKUs at critical stockout risk. Delivery severely impacted.",
    },
    {
      market: "Midwest US",
      grossSales: 682_000,
      wow: "+124.2%",
      yoy: "+286.4%",
      newCustomers: "4.8K",
      cac: "$18.60",
      note: "Storm periphery — elevated demand but supply chain functional.",
    },
    {
      market: "Southeast US",
      grossSales: 498_000,
      wow: "+86.4%",
      yoy: "+198.2%",
      newCustomers: "3.4K",
      cac: "$22.10",
      note: "Moderate storm-prep buying. Atlanta DC serving as backup supply source.",
    },
    {
      market: "West US",
      grossSales: 312_000,
      wow: "+42.8%",
      yoy: "+124.6%",
      newCustomers: "2.1K",
      cac: "$26.80",
      note: "Minimal storm impact. Stable demand. Denver Hub operating normally.",
    },
    {
      market: "Other Regions",
      grossSales: 144_000,
      wow: "+18.4%",
      yoy: "+82.6%",
      newCustomers: "1.2K",
      cac: "$28.40",
      note: "Non-storm regions showing sympathetic demand uplift.",
    },
  ] satisfies CommercialReviewMarketRow[],
  paidChannelPerformance: [
    {
      channel: "Push Notifications",
      spend: 42_000,
      grossSales: 892_000,
      wowSales: "+380.4%",
      roas: "21.2x",
      cac: "$4.20",
      newCustomers: "6.8K",
      action: "Storm-prep alerts driving record engagement. Maintain frequency.",
    },
    {
      channel: "App Alerts",
      spend: 28_000,
      grossSales: 684_000,
      wowSales: "+296.8%",
      roas: "24.4x",
      cac: "$5.60",
      newCustomers: "4.2K",
      action: "Smart substitution and delivery adaptation driving conversion.",
    },
    {
      channel: "Email / CRM",
      spend: 18_000,
      grossSales: 412_000,
      wowSales: "+186.2%",
      roas: "22.9x",
      cac: "$8.40",
      newCustomers: "2.8K",
      action: "Subscription expedite campaign performing well. Continue.",
    },
    {
      channel: "SMS Alerts",
      spend: 12_000,
      grossSales: 298_000,
      wowSales: "+242.6%",
      roas: "24.8x",
      cac: "$6.80",
      newCustomers: "1.8K",
      action: "Storm warnings and delivery updates. High open rates.",
    },
    {
      channel: "In-Store Signage",
      spend: 8_000,
      grossSales: 186_000,
      wowSales: "+124.4%",
      roas: "23.3x",
      cac: "$12.20",
      newCustomers: "1.4K",
      action: "Essential items signage at open stores. Effective for pickup.",
    },
  ] satisfies CommercialReviewPaidChannelRow[],
  grossSalesTrend: [
    { day: "Mon", currentWeek: 248000, previousWeek: 255000, lastYear: 208000 },
    { day: "Tue", currentWeek: 252000, previousWeek: 268000, lastYear: 214000 },
    { day: "Wed", currentWeek: 260000, previousWeek: 279000, lastYear: 221000 },
    { day: "Thu", currentWeek: 274000, previousWeek: 286000, lastYear: 229000 },
    { day: "Fri", currentWeek: 301000, previousWeek: 305000, lastYear: 248000 },
    { day: "Sat", currentWeek: 296000, previousWeek: 318000, lastYear: 255000 },
    { day: "Sun", currentWeek: 191000, previousWeek: 203000, lastYear: 162000 },
  ] satisfies CommercialReviewTrendPoint[],
  performanceTrend: [
    { day: "Mon", grossSalesCurrent: 248000, grossSalesPrevious: 255000, grossSalesLastYear: 208000, roas: 3.5, cac: 27.3 },
    { day: "Tue", grossSalesCurrent: 252000, grossSalesPrevious: 268000, grossSalesLastYear: 214000, roas: 3.4, cac: 27.9 },
    { day: "Wed", grossSalesCurrent: 260000, grossSalesPrevious: 279000, grossSalesLastYear: 221000, roas: 3.3, cac: 28.4 },
    { day: "Thu", grossSalesCurrent: 274000, grossSalesPrevious: 286000, grossSalesLastYear: 229000, roas: 3.2, cac: 29.0 },
    { day: "Fri", grossSalesCurrent: 301000, grossSalesPrevious: 305000, grossSalesLastYear: 248000, roas: 3.4, cac: 28.2 },
    { day: "Sat", grossSalesCurrent: 296000, grossSalesPrevious: 318000, grossSalesLastYear: 255000, roas: 3.3, cac: 28.8 },
    { day: "Sun", grossSalesCurrent: 191000, grossSalesPrevious: 203000, grossSalesLastYear: 162000, roas: 3.1, cac: 29.7 },
  ] satisfies CommercialReviewPerformanceTrendPoint[],
  recommendations: [
    {
      id: "rec-boost-pmax",
      title: "Scale Google PMAX where efficiency is strongest",
      type: "strategic",
      priority: "high",
      action: "Increase PMAX budget by 30% and route incremental spend to North + branded demand coverage.",
      impact: "Expected +£17K net profit/day with 88% confidence.",
      nbaActionId: "boost-pmax",
      executePrompt: "execute boost google pmax budget",
      reviewPrompt: "send boost google pmax budget for review",
    },
    {
      id: "rec-suppress-fb",
      title: "Reduce low-yield awareness spend",
      type: "strategic",
      priority: "high",
      action: "Suppress Facebook awareness until branded search and assisted conversions recover.",
      impact: "Expected £2K/day savings and lower blended CAC pressure.",
      nbaActionId: "suppress-fb",
      executePrompt: "execute suppress facebook awareness spend",
      reviewPrompt: "send suppress facebook awareness spend for review",
    },
    {
      id: "rec-winback",
      title: "Protect acquisition softness with win-back",
      type: "strategic",
      priority: "medium",
      action: "Launch win-back journey for at-risk high-LTV customers to stabilize order volume.",
      impact: "Expected 18% recovery within 14 days.",
      nbaActionId: "launch-winback",
      executePrompt: "execute launch win back campaign",
      reviewPrompt: "send launch win back campaign for review",
    },
    {
      id: "rec-pdp",
      title: "Tighten PDP guidance on return-prone SKUs",
      type: "tactical",
      priority: "medium",
      action: "Apply fit guidance and size clarity updates to high-traffic product pages.",
      impact: "Projected -1.8pp return rate on targeted SKUs.",
      nbaActionId: "optimize-pdp",
      executePrompt: "execute optimize pdp for top return sku",
      reviewPrompt: "send optimize pdp for top return sku for review",
    },
    {
      id: "rec-inventory",
      title: "Rebalance stock to strong-converting regions",
      type: "tactical",
      priority: "high",
      action: "Shift fast-moving inventory into North and high-intent clusters before next weekend.",
      impact: "Projected +6.4% sell-through and reduced stockout risk.",
      nbaActionId: "rebalance-inventory",
      executePrompt: "execute rebalance inventory to high demand regions",
      reviewPrompt: "send rebalance inventory to high demand regions for review",
    },
  ] satisfies CommercialReviewRecommendation[],
  discussionFlags: [
    "Emergency reorder decisions for 6 storm-critical SKUs must be approved within 2 hours before the pre-storm delivery window closes at 2:00 PM.",
    "Northeast US accounts for 41% of revenue but has the worst supply chain pressure — 47 SKUs at critical stockout risk and 68.2% on-time delivery.",
    "Cold-chain integrity at risk from power outages — generator fuel resupply dispatched to Northeast DC with 18 hours remaining.",
    "Post-storm recovery planning should begin now — pre-position recovery inventory at Northeast DC for store reopening after 72-hour lockdown.",
  ],
} as const;

export function formatCommercialCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString("en-US")}`;
}
