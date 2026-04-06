/* MMM & Saturation mock data — Winter Weather Hazard Simulation */

export type MMMOverviewKpi = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
};

export type MissedPotentialData = {
  actualProfit: number;
  missedPotential: number;
  predictedProfit: number;
};

export type MarketOverviewRow = {
  market: string;
  spendChange: string;
  positive: boolean;
  potential: string;
};

export type ChannelRecommendation = {
  channel: string;
  lastWeekSpend: number;
  proposedSpend: number;
  changePercent: string;
  positive: boolean;
  grossSalesPredicted: number;
  profitPredicted: number;
  roas: string;
  epRoas: string;
  recommendation: "Increase spend" | "Decrease spend" | "Efficient spend" | "Pause";
};

export type SaturationCurvePoint = {
  spend: number;
  profit: number;
};

export type SaturationChannelData = {
  channel: string;
  curveData: SaturationCurvePoint[];
  actualSpend: number;
  actualProfit: number;
  proposedSpend: number;
  proposedProfit: number;
  saturationSpend: number;
  saturationProfit: number;
};

export type ProfitAnalysisWeek = {
  week: string;
  spend: number;
  proposedSpend: number;
  proposedChange: string;
  sales: number;
  missedSales: number;
  profit: number;
  missedProfit: string;
};

export const mmmOverviewKpis: MMMOverviewKpi[] = [
  { label: "Actual spend (USD)", value: "$108.0K", change: "+124.6%", positive: true },
  { label: "Proposed spend (USD)", value: "$142.0K", change: "+31.5%", positive: true },
  { label: "Actual sales (USD)", value: "$2.76M", change: "+142.8%", positive: true },
  { label: "Predicted sales (USD)", value: "$3.12M", change: "+13.0%", positive: true },
  { label: "Actual profit (USD)", value: "$820K", change: "+186.4%", positive: true },
  { label: "Predicted profit (USD)", value: "$948K", change: "+15.6%", positive: true },
];

export const missedPotentialData: MissedPotentialData = {
  actualProfit: 820000,
  missedPotential: 128000,
  predictedProfit: 948000,
};

export const marketOverview: MarketOverviewRow[] = [
  { market: "Northeast US (Storm Zone)", spendChange: "+186.4%", positive: true, potential: "$248K" },
  { market: "Midwest US", spendChange: "+124.2%", positive: true, potential: "$142K" },
  { market: "Southeast US", spendChange: "+86.4%", positive: true, potential: "$98K" },
  { market: "West US", spendChange: "+42.8%", positive: true, potential: "$64K" },
];

export const channelRecommendations: ChannelRecommendation[] = [
  { channel: "Push Notifications", lastWeekSpend: 42000, proposedSpend: 68000, changePercent: "+62%", positive: true, grossSalesPredicted: 1_240_000, profitPredicted: 386_000, roas: "1823.5%", epRoas: "762.4%", recommendation: "Increase spend" },
  { channel: "App Alerts", lastWeekSpend: 28000, proposedSpend: 42000, changePercent: "+50%", positive: true, grossSalesPredicted: 980_000, profitPredicted: 298_000, roas: "2333.3%", epRoas: "976.2%", recommendation: "Increase spend" },
  { channel: "Email / CRM", lastWeekSpend: 18000, proposedSpend: 22000, changePercent: "+22%", positive: true, grossSalesPredicted: 580_000, profitPredicted: 168_000, roas: "2636.4%", epRoas: "1103.6%", recommendation: "Efficient spend" },
  { channel: "SMS Alerts", lastWeekSpend: 12000, proposedSpend: 18000, changePercent: "+50%", positive: true, grossSalesPredicted: 420_000, profitPredicted: 124_000, roas: "2333.3%", epRoas: "976.2%", recommendation: "Increase spend" },
  { channel: "In-Store Signage", lastWeekSpend: 8000, proposedSpend: 6000, changePercent: "-25%", positive: false, grossSalesPredicted: 186_000, profitPredicted: 48_000, roas: "3100.0%", epRoas: "1296.8%", recommendation: "Decrease spend" },
  { channel: "Social Media (Brand)", lastWeekSpend: 14000, proposedSpend: 0, changePercent: "-100%", positive: false, grossSalesPredicted: 0, profitPredicted: 0, roas: "N/A", epRoas: "N/A", recommendation: "Pause" },
  { channel: "Display Awareness", lastWeekSpend: 8000, proposedSpend: 0, changePercent: "-100%", positive: false, grossSalesPredicted: 0, profitPredicted: 0, roas: "N/A", epRoas: "N/A", recommendation: "Pause" },
];

export const saturationChannels: SaturationChannelData[] = [
  {
    channel: "Push Notifications",
    curveData: Array.from({ length: 60 }, (_, i) => {
      const spend = i * 1500;
      return { spend, profit: 420000 * (1 - Math.exp(-spend / 38000)) };
    }),
    actualSpend: 42000,
    actualProfit: 286000,
    proposedSpend: 68000,
    proposedProfit: 348000,
    saturationSpend: 95000,
    saturationProfit: 396000,
  },
  {
    channel: "App Alerts",
    curveData: Array.from({ length: 60 }, (_, i) => {
      const spend = i * 1200;
      return { spend, profit: 340000 * (1 - Math.exp(-spend / 32000)) };
    }),
    actualSpend: 28000,
    actualProfit: 198000,
    proposedSpend: 42000,
    proposedProfit: 262000,
    saturationSpend: 72000,
    saturationProfit: 318000,
  },
];

export const profitAnalysisWeeks: ProfitAnalysisWeek[] = [
  { week: "09 Mar – 15 Mar, 2026", spend: 108000, proposedSpend: 142000, proposedChange: "+31%", sales: 2_760_000, missedSales: 360_000, profit: 820_000, missedProfit: "15.6%" },
  { week: "02 Mar – 08 Mar, 2026", spend: 86000, proposedSpend: 108000, proposedChange: "+26%", sales: 1_842_000, missedSales: 248_000, profit: 548_000, missedProfit: "12.8%" },
];
