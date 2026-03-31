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
      title: "Sales down WoW, still strong YoY",
      narrative:
        "Gross sales closed at £1.82M as softer midweek trading offset a solid Friday-Saturday finish, but the business remains materially ahead of last year.",
      metric: "£1.82M gross sales · -4.8% WoW · +18.6% YoY",
      tone: "warning",
    },
    {
      title: "New customer acquisition is the main concern",
      narrative:
        "New customer volume fell faster than total sales, with weaker Meta and TikTok prospecting efficiency pushing acquisition output below plan.",
      metric: "12.4K new customers · -9.2% WoW · CAC £28.40 (+12.8% WoW)",
      tone: "warning",
    },
    {
      title: "North of England is the star market",
      narrative:
        "Northern trading outperformed every other region on both growth and efficiency, supported by stronger conversion and the lowest CAC in the mix.",
      metric: "£438K gross sales · +9.4% WoW · CAC £23.40",
      tone: "positive",
    },
    {
      title: "CAC is rising across paid acquisition",
      narrative:
        "Acquisition costs increased for the second consecutive week, with paid social contributing most of the inflation while search remained relatively stable.",
      metric: "Blended CAC £28.40 · +12.8% WoW · -6.1% YoY",
      tone: "warning",
    },
  ] satisfies CommercialReviewTakeaway[],
  kpis: [
    { label: "Gross sales", value: "£1.82M", wow: "-4.8%", yoy: "+18.6%", status: "watch" },
    { label: "Net sales", value: "£1.54M", wow: "-4.1%", yoy: "+17.3%", status: "strong" },
    { label: "Orders", value: "41.2K", wow: "-3.1%", yoy: "+15.4%", status: "strong" },
    { label: "Conversion rate", value: "3.7%", wow: "-0.2pp", yoy: "+0.4pp", status: "watch" },
    { label: "New customers", value: "12.4K", wow: "-9.2%", yoy: "+11.1%", status: "risk" },
    { label: "CAC", value: "£28.40", wow: "+12.8%", yoy: "-6.1%", status: "risk" },
    { label: "Blended ROAS", value: "3.4x", wow: "-0.2x", yoy: "+0.5x", status: "strong" },
    { label: "Gross margin", value: "58.1%", wow: "+0.6pp", yoy: "+1.2pp", status: "strong" },
  ] satisfies CommercialReviewKPI[],
  marketBreakdown: [
    {
      market: "London & South East",
      grossSales: 602000,
      wow: "-6.1%",
      yoy: "+14.8%",
      newCustomers: "4.0K",
      cac: "£26.20",
      note: "Largest market, but promo-led demand softened midweek.",
    },
    {
      market: "Midlands & East",
      grossSales: 381000,
      wow: "-5.0%",
      yoy: "+16.2%",
      newCustomers: "2.6K",
      cac: "£30.10",
      note: "Stable basket size, but acquisition cost stepped up.",
    },
    {
      market: "North of England",
      grossSales: 438000,
      wow: "+9.4%",
      yoy: "+28.7%",
      newCustomers: "3.1K",
      cac: "£23.40",
      note: "Best-performing market on growth, ROAS, and CAC efficiency.",
    },
    {
      market: "Scotland & Wales",
      grossSales: 245000,
      wow: "-12.3%",
      yoy: "+10.1%",
      newCustomers: "1.7K",
      cac: "£31.80",
      note: "Weekend softness widened the WoW decline.",
    },
    {
      market: "International ecommerce",
      grossSales: 156000,
      wow: "-8.9%",
      yoy: "+21.4%",
      newCustomers: "1.0K",
      cac: "£34.20",
      note: "Healthy YoY growth, but prospecting costs remain elevated.",
    },
  ] satisfies CommercialReviewMarketRow[],
  paidChannelPerformance: [
    {
      channel: "Google PMAX",
      spend: 156000,
      grossSales: 612000,
      wowSales: "+6.8%",
      roas: "3.9x",
      cac: "£21.40",
      newCustomers: "4.8K",
      action: "Scale into North and branded demand capture.",
    },
    {
      channel: "Google Search",
      spend: 102000,
      grossSales: 356000,
      wowSales: "-2.1%",
      roas: "3.5x",
      cac: "£24.80",
      newCustomers: "2.7K",
      action: "Hold coverage and protect generic efficiency.",
    },
    {
      channel: "Meta Prospecting",
      spend: 118000,
      grossSales: 298000,
      wowSales: "-11.4%",
      roas: "2.5x",
      cac: "£33.90",
      newCustomers: "2.1K",
      action: "Refresh creative and tighten audience exclusions.",
    },
    {
      channel: "TikTok Prospecting",
      spend: 74000,
      grossSales: 163000,
      wowSales: "-14.9%",
      roas: "2.2x",
      cac: "£38.70",
      newCustomers: "1.5K",
      action: "Reduce pressure until creative relevance improves.",
    },
    {
      channel: "Affiliate",
      spend: 28000,
      grossSales: 91000,
      wowSales: "+4.2%",
      roas: "3.3x",
      cac: "£18.60",
      newCustomers: "1.3K",
      action: "Keep always-on; efficient support channel.",
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
    "New customer acquisition is weakening faster than headline sales, so paid social prospecting needs immediate attention before volume softness carries into the next week.",
    "North of England is outperforming on both sales growth and CAC, making it the clearest candidate for incremental budget or stronger stock support.",
    "London & South East remains the biggest market, but its WoW decline suggests promo fatigue or assortment softness worth reviewing in Monday trading.",
    "CAC has risen for two consecutive weeks; if paid social efficiency does not recover, the team should rebalance budget toward Google PMAX and higher-converting regional demand.",
  ],
} as const;

export function formatCommercialCurrency(value: number): string {
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(0)}K`;
  }
  return `£${value.toLocaleString("en-GB")}`;
}