/* MMM & Saturation mock data — DEMA-inspired */

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
  { label: "Actual spend (SEK)", value: "982.6K", change: "-11.77%", positive: false },
  { label: "Proposed spend (SEK)", value: "866.9K", change: "-11.77%", positive: false },
  { label: "Actual sales (SEK)", value: "6.0M", change: "", positive: true },
  { label: "Predicted sales (SEK)", value: "6.0M", change: "-0.41%", positive: false },
  { label: "Actual profit (SEK)", value: "1.4M", change: "", positive: true },
  { label: "Predicted profit (SEK)", value: "1.5M", change: "8.73%", positive: true },
];

export const missedPotentialData: MissedPotentialData = {
  actualProfit: 1400168,
  missedPotential: 122228,
  predictedProfit: 1522396,
};

export const marketOverview: MarketOverviewRow[] = [
  { market: "Finland", spendChange: "-9.56%", positive: false, potential: "20.5K" },
  { market: "Germany", spendChange: "-27.45%", positive: false, potential: "36.2K" },
  { market: "Norway", spendChange: "-20.06%", positive: false, potential: "30.1K" },
  { market: "Sweden", spendChange: "+4.25%", positive: true, potential: "35.4K" },
];

export const channelRecommendations: ChannelRecommendation[] = [
  { channel: "Google Generic", lastWeekSpend: 6557, proposedSpend: 7205, changePercent: "+10%", positive: true, grossSalesPredicted: 49189, profitPredicted: 13376, roas: "682.70%", epRoas: "285.65%", recommendation: "Increase spend" },
  { channel: "Google PMAX", lastWeekSpend: 16671, proposedSpend: 54142, changePercent: "+225%", positive: true, grossSalesPredicted: 382276, profitPredicted: 105806, roas: "706.06%", epRoas: "295.42%", recommendation: "Increase spend" },
  { channel: "Facebook Awareness", lastWeekSpend: 11899, proposedSpend: 0, changePercent: "-100%", positive: false, grossSalesPredicted: 0, profitPredicted: 0, roas: "N/A", epRoas: "N/A", recommendation: "Decrease spend" },
  { channel: "Facebook Sale", lastWeekSpend: 69663, proposedSpend: 76899, changePercent: "+10%", positive: true, grossSalesPredicted: 580794, profitPredicted: 166111, roas: "755.27%", epRoas: "316.01%", recommendation: "Increase spend" },
  { channel: "Snapchat Sale", lastWeekSpend: 7008, proposedSpend: 0, changePercent: "-100%", positive: false, grossSalesPredicted: 0, profitPredicted: 0, roas: "N/A", epRoas: "N/A", recommendation: "Pause" },
  { channel: "TikTok Awareness", lastWeekSpend: 9212, proposedSpend: 2610, changePercent: "-72%", positive: false, grossSalesPredicted: 9813, profitPredicted: 1496, roas: "375.99%", epRoas: "157.32%", recommendation: "Decrease spend" },
  { channel: "TikTok Sale", lastWeekSpend: 29023, proposedSpend: 4692, changePercent: "-84%", positive: false, grossSalesPredicted: 20320, profitPredicted: 3810, roas: "433.07%", epRoas: "181.20%", recommendation: "Decrease spend" },
];

export const saturationChannels: SaturationChannelData[] = [
  {
    channel: "Google PMAX",
    curveData: Array.from({ length: 60 }, (_, i) => {
      const spend = i * 1100;
      return { spend, profit: 32000 * (1 - Math.exp(-spend / 28000)) };
    }),
    actualSpend: 16671,
    actualProfit: 18200,
    proposedSpend: 22502,
    proposedProfit: 24046,
    saturationSpend: 45000,
    saturationProfit: 30800,
  },
  {
    channel: "Facebook Sale",
    curveData: Array.from({ length: 60 }, (_, i) => {
      const spend = i * 1500;
      return { spend, profit: 42000 * (1 - Math.exp(-spend / 35000)) };
    }),
    actualSpend: 69663,
    actualProfit: 36500,
    proposedSpend: 76899,
    proposedProfit: 38200,
    saturationSpend: 85000,
    saturationProfit: 41200,
  },
];

export const profitAnalysisWeeks: ProfitAnalysisWeek[] = [
  { week: "09 jun – 15 jun, 2025", spend: 94684, proposedSpend: 105932, proposedChange: "+12%", sales: 644488, missedSales: 61085, profit: 179541, missedProfit: "7.97%" },
  { week: "02 jun – 08 jun, 2025", spend: 208704, proposedSpend: 166840, proposedChange: "-20%", sales: 970482, missedSales: -25341, profit: 245183, missedProfit: "12.29%" },
];
