/**
 * Async data-fetcher wrappers for all dashboard mock data.
 * Swap the imports/bodies to real API calls when ready.
 */

import {
  productReportRows,
  productReportTotals,
  inventoryForecastData,
  atRiskProducts,
  type ProductReportRow,
  type InventoryForecastPoint,
  type AtRiskProduct,
} from "./mock-product-inventory";

import {
  mmmOverviewKpis,
  missedPotentialData,
  marketOverview,
  channelRecommendations,
  saturationChannels,
  profitAnalysisWeeks,
  type MMMOverviewKpi,
  type MissedPotentialData,
  type MarketOverviewRow,
  type ChannelRecommendation,
  type SaturationChannelData,
  type ProfitAnalysisWeek,
} from "./mock-mmm-saturation";

import {
  incrementalityMetrics,
  epRoasComparison,
  incrementalityComparisonBars,
  experimentSummary,
  attributionModelRows,
  type IncrementalityMetric,
  type EpRoasComparison,
  type IncrementalityComparisonBar,
  type ExperimentSummary,
  type AttributionModelRow,
} from "./mock-incrementality-summary";

import {
  performanceHeroKpis,
  multiMetricTrend,
  productSellThrough,
  type PerformanceHeroKpi,
  type MultiMetricTrendPoint,
  type ProductSellThrough,
} from "./mock-overall-performance";

/* ── Product & Inventory ──────────────────────────────────────── */
export async function fetchProductReport(): Promise<ProductReportRow[]> {
  return productReportRows;
}
export async function fetchProductTotals() {
  return productReportTotals;
}
export async function fetchInventoryForecast(): Promise<InventoryForecastPoint[]> {
  return inventoryForecastData;
}
export async function fetchAtRiskProducts(): Promise<AtRiskProduct[]> {
  return atRiskProducts;
}

/* ── MMM & Saturation ─────────────────────────────────────────── */
export async function fetchMMMOverviewKpis(): Promise<MMMOverviewKpi[]> {
  return mmmOverviewKpis;
}
export async function fetchMissedPotential(): Promise<MissedPotentialData> {
  return missedPotentialData;
}
export async function fetchMarketOverview(): Promise<MarketOverviewRow[]> {
  return marketOverview;
}
export async function fetchChannelRecommendations(): Promise<ChannelRecommendation[]> {
  return channelRecommendations;
}
export async function fetchSaturationChannels(): Promise<SaturationChannelData[]> {
  return saturationChannels;
}
export async function fetchProfitAnalysis(): Promise<ProfitAnalysisWeek[]> {
  return profitAnalysisWeeks;
}

/* ── Incrementality ───────────────────────────────────────────── */
export async function fetchIncrementalityMetrics(): Promise<IncrementalityMetric[]> {
  return incrementalityMetrics;
}
export async function fetchEpRoasComparison(): Promise<EpRoasComparison[]> {
  return epRoasComparison;
}
export async function fetchIncrementalityComparison(): Promise<IncrementalityComparisonBar[]> {
  return incrementalityComparisonBars;
}
export async function fetchExperimentSummary(): Promise<ExperimentSummary> {
  return experimentSummary;
}
export async function fetchAttributionModelRows(): Promise<AttributionModelRow[]> {
  return attributionModelRows;
}

/* ── Overall Performance ──────────────────────────────────────── */
export async function fetchPerformanceKpis(): Promise<PerformanceHeroKpi[]> {
  return performanceHeroKpis;
}
export async function fetchMultiMetricTrend(): Promise<MultiMetricTrendPoint[]> {
  return multiMetricTrend;
}
export async function fetchProductSellThrough(): Promise<ProductSellThrough[]> {
  return productSellThrough;
}
