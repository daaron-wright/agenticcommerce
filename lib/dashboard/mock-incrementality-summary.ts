/* Incrementality & Attribution mock data — DEMA-inspired */

export type IncrementalityMetric = {
  label: string;
  value: string;
  barWidth: number; // 0-100 for bar chart rendering
  highlight?: boolean;
};

export type EpRoasComparison = {
  label: string;
  value: number;
};

export type AttributionModelRow = {
  channelGroup: string;
  channel: string;
  campaign: string;
  marketingSpend: number;
  roasDemaMTA: string;
  roasLinear: string;
  roasLastClick: string;
  roasAdPlatform: string;
  roasMMM: string;
};

export type ExperimentSummary = {
  name: string;
  status: "Final results" | "Running" | "Planning";
  country: string;
  channel: string;
  spendDuringExperiment: string;
  incrementalProfit: string;
  incrementalEpRoas: string;
  pValue: string;
  treatmentPeriod: string;
};

export type IncrementalityComparisonBar = {
  model: string;
  roas: number;
  highlight?: boolean;
};

export const incrementalityMetrics: IncrementalityMetric[] = [
  { label: "Spend", value: "$1,149", barWidth: 35 },
  { label: "ROAS", value: "3.1x", barWidth: 62 },
  { label: "Profit ROAS", value: "2.2x", barWidth: 48 },
  { label: "CAC", value: "$42", barWidth: 28, highlight: true },
];

export const epRoasComparison: EpRoasComparison[] = [
  { label: "Incremental epROAS", value: 1.8 },
  { label: "Ad platform epROAS", value: 4.2 },
  { label: "Dema MTA epROAS", value: 2.4 },
];

export const incrementalityComparisonBars: IncrementalityComparisonBar[] = [
  { model: "MTA", roas: 1.4 },
  { model: "Ad Platform", roas: 4.1 },
  { model: "MMM", roas: 2.8 },
  { model: "Incrementality", roas: 3.2, highlight: true },
];

export const experimentSummary: ExperimentSummary = {
  name: "Google Lift Test Summer '24",
  status: "Final results",
  country: "United States",
  channel: "Google",
  spendDuringExperiment: "$797,983",
  incrementalProfit: "$1,450,974",
  incrementalEpRoas: "181.83%",
  pValue: "1.00%",
  treatmentPeriod: "6 weeks",
};

export const attributionModelRows: AttributionModelRow[] = [
  { channelGroup: "Search Paid", channel: "Google", campaign: "IT_Standard_Shopping", marketingSpend: 12700684, roasDemaMTA: "889.00%", roasLinear: "889.49%", roasLastClick: "889.65%", roasAdPlatform: "411.99%", roasMMM: "572.30%" },
  { channelGroup: "Search Paid", channel: "Google", campaign: "ROW_search_brand", marketingSpend: 87346, roasDemaMTA: "1,040.05%", roasLinear: "1,256.88%", roasLastClick: "1,308.53%", roasAdPlatform: "2,457.35%", roasMMM: "803.64%" },
  { channelGroup: "Search Paid", channel: "Google", campaign: "CH_standard_shopping", marketingSpend: 86731, roasDemaMTA: "149.09%", roasLinear: "164.86%", roasLastClick: "196.39%", roasAdPlatform: "149.58%", roasMMM: "553.32%" },
  { channelGroup: "Social Paid", channel: "Facebook", campaign: "TOF – DE – Prospecting", marketingSpend: 86010, roasDemaMTA: "0.00%", roasLinear: "0.00%", roasLastClick: "0.00%", roasAdPlatform: "53.60%", roasMMM: "103.94%" },
];
