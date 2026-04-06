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
    { day: "Mon", currentWeek: 218000, previousWeek: 142000, lastYear: 68000 },
    { day: "Tue", currentWeek: 264000, previousWeek: 148000, lastYear: 72000 },
    { day: "Wed", currentWeek: 342000, previousWeek: 152000, lastYear: 74000 },
    { day: "Thu", currentWeek: 486000, previousWeek: 156000, lastYear: 76000 },
    { day: "Fri", currentWeek: 624000, previousWeek: 162000, lastYear: 78000 },
    { day: "Sat", currentWeek: 548000, previousWeek: 168000, lastYear: 82000 },
    { day: "Sun", currentWeek: 278000, previousWeek: 158000, lastYear: 74000 },
  ] satisfies CommercialReviewTrendPoint[],
  performanceTrend: [
    { day: "Mon", grossSalesCurrent: 218000, grossSalesPrevious: 142000, grossSalesLastYear: 68000, roas: 18.4, cac: 6.2 },
    { day: "Tue", grossSalesCurrent: 264000, grossSalesPrevious: 148000, grossSalesLastYear: 72000, roas: 19.8, cac: 5.8 },
    { day: "Wed", grossSalesCurrent: 342000, grossSalesPrevious: 152000, grossSalesLastYear: 74000, roas: 21.2, cac: 5.4 },
    { day: "Thu", grossSalesCurrent: 486000, grossSalesPrevious: 156000, grossSalesLastYear: 76000, roas: 22.6, cac: 4.8 },
    { day: "Fri", grossSalesCurrent: 624000, grossSalesPrevious: 162000, grossSalesLastYear: 78000, roas: 24.1, cac: 4.2 },
    { day: "Sat", grossSalesCurrent: 548000, grossSalesPrevious: 168000, grossSalesLastYear: 82000, roas: 22.8, cac: 4.6 },
    { day: "Sun", grossSalesCurrent: 278000, grossSalesPrevious: 158000, grossSalesLastYear: 74000, roas: 19.2, cac: 5.8 },
  ] satisfies CommercialReviewPerformanceTrendPoint[],
  recommendations: [
    {
      id: "rec-boost-pmax",
      title: "Activate emergency push notifications for storm-critical SKUs",
      type: "strategic",
      priority: "high",
      action: "Scale push notification campaigns for water, batteries, and first aid — highest conversion channel during storm-prep.",
      impact: "Expected +$42K revenue/day from emergency essentials with 92% confidence.",
      nbaActionId: "boost-pmax",
      executePrompt: "execute activate emergency push notifications",
      reviewPrompt: "send activate emergency push notifications for review",
    },
    {
      id: "rec-suppress-fb",
      title: "Pause non-essential awareness campaigns",
      type: "strategic",
      priority: "high",
      action: "Suppress all brand awareness and lifestyle campaigns — redirect budget to emergency communication channels.",
      impact: "Expected $8K/day savings redirected to storm-response channels.",
      nbaActionId: "suppress-fb",
      executePrompt: "execute pause non essential awareness campaigns",
      reviewPrompt: "send pause non essential awareness campaigns for review",
    },
    {
      id: "rec-winback",
      title: "Launch subscription expedite campaign",
      type: "strategic",
      priority: "medium",
      action: "Notify subscription customers of pre-storm expedite option — deliver recurring essentials before lockdown.",
      impact: "Expected 34% subscription expedite rate, protecting $180K recurring revenue.",
      nbaActionId: "launch-winback",
      executePrompt: "execute launch subscription expedite campaign",
      reviewPrompt: "send launch subscription expedite campaign for review",
    },
    {
      id: "rec-pdp",
      title: "Enable smart substitution for out-of-stock items",
      type: "tactical",
      priority: "medium",
      action: "Activate AI-powered substitution suggestions on product pages for storm-critical SKUs at critical stock levels.",
      impact: "Projected +12% conversion recovery on out-of-stock product pages.",
      nbaActionId: "optimize-pdp",
      executePrompt: "execute enable smart substitution",
      reviewPrompt: "send enable smart substitution for review",
    },
    {
      id: "rec-inventory",
      title: "Emergency inventory rebalance to Northeast DC",
      type: "tactical",
      priority: "high",
      action: "Redirect storm-critical inventory from Atlanta DC and Denver Hub to Northeast DC before delivery window closes at 2:00 PM.",
      impact: "Projected +18% fill rate improvement for storm zone, $320K revenue recovery.",
      nbaActionId: "rebalance-inventory",
      executePrompt: "execute emergency inventory rebalance to northeast",
      reviewPrompt: "send emergency inventory rebalance to northeast for review",
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
