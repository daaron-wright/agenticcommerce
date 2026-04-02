/* Product & Inventory mock data — DEMA-inspired */

export type ProductReportRow = {
  productId: string;
  name: string;
  endOfSeasonInventory: number;
  currentInventory: number;
  productViews: number;
  orderCount: number;
  grossSales: number;
  marketingSpend: number;
};

export type InventoryForecastPoint = {
  week: string;
  actual: number;
  forecast: number | null;
};

export type AtRiskProduct = {
  name: string;
  sku: string;
  daysOfStock: number;
  sellThroughRate: number;
  risk: "high" | "medium";
};

export const productReportRows: ProductReportRow[] = [
  { productId: "758394520", name: "Belted Wrap Cardigan", endOfSeasonInventory: 758, currentInventory: 3583, productViews: 11921, orderCount: 38, grossSales: 32102, marketingSpend: 9121 },
  { productId: "284829492", name: "Jacquard Knitted Dress", endOfSeasonInventory: 2924, currentInventory: 13583, productViews: 152, orderCount: 38, grossSales: 75085, marketingSpend: 17278 },
  { productId: "319284710", name: "Wool Blend Overcoat", endOfSeasonInventory: 1250, currentInventory: 8420, productViews: 8340, orderCount: 124, grossSales: 124800, marketingSpend: 22400 },
  { productId: "502918374", name: "Ribbed Knit Cardigan", endOfSeasonInventory: 3100, currentInventory: 15200, productViews: 6290, orderCount: 89, grossSales: 53400, marketingSpend: 8900 },
  { productId: "891027345", name: "Cropped Denim Jacket", endOfSeasonInventory: 620, currentInventory: 2100, productViews: 14500, orderCount: 210, grossSales: 168000, marketingSpend: 31500 },
  { productId: "723918456", name: "Linen Blend Trousers", endOfSeasonInventory: 4200, currentInventory: 22100, productViews: 3210, orderCount: 56, grossSales: 28000, marketingSpend: 5600 },
  { productId: "612093847", name: "Silk Camisole Top", endOfSeasonInventory: 890, currentInventory: 4500, productViews: 9800, orderCount: 165, grossSales: 82500, marketingSpend: 14200 },
];

export const productReportTotals = {
  endOfSeasonInventory: 41237,
  currentInventory: 3954329,
  productViews: 81321,
  orderCount: 1908,
  grossSales: 2773986,
  marketingSpend: 458392,
};

export const inventoryForecastData: InventoryForecastPoint[] = [
  { week: "W1", actual: 42000, forecast: 41800 },
  { week: "W2", actual: 40500, forecast: 40200 },
  { week: "W3", actual: 39200, forecast: 39500 },
  { week: "W4", actual: 38100, forecast: 38000 },
  { week: "W5", actual: 36800, forecast: 37200 },
  { week: "W6", actual: 35200, forecast: 35800 },
  { week: "W7", actual: 34100, forecast: 34500 },
  { week: "W8", actual: 33200, forecast: 33000 },
  { week: "W9", actual: null, forecast: 31500 },
  { week: "W10", actual: null, forecast: 30200 },
  { week: "W11", actual: null, forecast: 28800 },
  { week: "W12", actual: null, forecast: 27500 },
];

export const atRiskProducts: AtRiskProduct[] = [
  { name: "Cropped Denim Jacket", sku: "CDJ-891", daysOfStock: 8, sellThroughRate: 78.2, risk: "high" },
  { name: "Belted Wrap Cardigan", sku: "BWC-758", daysOfStock: 14, sellThroughRate: 62.5, risk: "medium" },
  { name: "Silk Camisole Top", sku: "SCT-612", daysOfStock: 12, sellThroughRate: 71.1, risk: "medium" },
];
