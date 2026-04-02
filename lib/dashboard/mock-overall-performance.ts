/* Overall Performance mock data — DEMA-inspired */

export type PerformanceHeroKpi = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

export type MultiMetricTrendPoint = {
  date: string;
  grossSales: number;
  costOfSales: number;
  visits: number;
};

export type ProductSellThrough = {
  name: string;
  orderCount: number;
  currentAndIncoming: number;
  predictedSellThrough: string;
  risk: boolean;
};

export const performanceHeroKpis: PerformanceHeroKpi[] = [
  { label: "Visits", value: "1,574,832", delta: "11.09%", positive: true },
  { label: "Conversion rate", value: "1.77%", delta: "-5.64%", positive: false },
  { label: "Product views", value: "4,458,207", delta: "13.12%", positive: true },
  { label: "Order count", value: "28,932", delta: "-2.12%", positive: false },
];

export const multiMetricTrend: MultiMetricTrendPoint[] = [
  { date: "20 Jan", grossSales: 680000, costOfSales: 42000, visits: 210000 },
  { date: "21 Jan", grossSales: 720000, costOfSales: 45000, visits: 225000 },
  { date: "22 Jan", grossSales: 695000, costOfSales: 43000, visits: 218000 },
  { date: "23 Jan", grossSales: 740000, costOfSales: 47000, visits: 232000 },
  { date: "24 Jan", grossSales: 780000, costOfSales: 49000, visits: 245000 },
  { date: "25 Jan", grossSales: 810000, costOfSales: 51000, visits: 260000 },
  { date: "26 Jan", grossSales: 760000, costOfSales: 48000, visits: 238000 },
];

export const productSellThrough: ProductSellThrough[] = [
  { name: "Cropped Denim Jacket", orderCount: 53, currentAndIncoming: 152, predictedSellThrough: "225.39%", risk: true },
  { name: "Ribbed Knit Cardigan", orderCount: 105, currentAndIncoming: 340, predictedSellThrough: "156.26%", risk: false },
  { name: "Wool Blend Overcoat", orderCount: 78, currentAndIncoming: 210, predictedSellThrough: "142.18%", risk: false },
  { name: "Silk Camisole Top", orderCount: 165, currentAndIncoming: 380, predictedSellThrough: "198.42%", risk: true },
];
