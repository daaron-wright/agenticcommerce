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

/* ── Sell-Through Optimization scatter data ───────────────────────────── */

export type SellThroughProduct = {
  name: string;
  forecastSellThrough: number;
  marketingSpend: number;
  excludedFromMarketing: boolean;
};

export const sellThroughProducts: SellThroughProduct[] = [
  { name: "Belted Wrap Cardigan", forecastSellThrough: 12, marketingSpend: 9100, excludedFromMarketing: false },
  { name: "Jacquard Knitted Dress", forecastSellThrough: 8, marketingSpend: 17200, excludedFromMarketing: false },
  { name: "Wool Blend Overcoat", forecastSellThrough: 22, marketingSpend: 22400, excludedFromMarketing: false },
  { name: "Ribbed Knit Cardigan", forecastSellThrough: 6, marketingSpend: 8900, excludedFromMarketing: false },
  { name: "Cropped Denim Jacket", forecastSellThrough: 45, marketingSpend: 31500, excludedFromMarketing: false },
  { name: "Linen Blend Trousers", forecastSellThrough: 10, marketingSpend: 5600, excludedFromMarketing: true },
  { name: "Silk Camisole Top", forecastSellThrough: 35, marketingSpend: 14200, excludedFromMarketing: false },
  { name: "Cotton Polo Shirt", forecastSellThrough: 18, marketingSpend: 3200, excludedFromMarketing: true },
  { name: "Pleated Midi Skirt", forecastSellThrough: 28, marketingSpend: 11800, excludedFromMarketing: false },
  { name: "Cashmere V-Neck", forecastSellThrough: 14, marketingSpend: 19500, excludedFromMarketing: false },
  { name: "Relaxed Fit Chinos", forecastSellThrough: 9, marketingSpend: 4100, excludedFromMarketing: true },
  { name: "Oversized Blazer", forecastSellThrough: 32, marketingSpend: 26800, excludedFromMarketing: false },
  { name: "Merino Turtleneck", forecastSellThrough: 20, marketingSpend: 7400, excludedFromMarketing: false },
  { name: "Printed Scarf", forecastSellThrough: 5, marketingSpend: 1200, excludedFromMarketing: true },
  { name: "Leather Belt", forecastSellThrough: 42, marketingSpend: 2800, excludedFromMarketing: true },
  { name: "Tailored Trousers", forecastSellThrough: 16, marketingSpend: 15600, excludedFromMarketing: false },
  { name: "Knitted Beanie", forecastSellThrough: 38, marketingSpend: 3500, excludedFromMarketing: false },
  { name: "Suede Ankle Boots", forecastSellThrough: 25, marketingSpend: 21000, excludedFromMarketing: false },
  { name: "Striped T-Shirt", forecastSellThrough: 11, marketingSpend: 6200, excludedFromMarketing: true },
  { name: "Puffer Vest", forecastSellThrough: 30, marketingSpend: 18900, excludedFromMarketing: false },
];

/* ── Product Profitability Cards ───────────────────────────────────────── */

export type ProductProfitabilityCard = {
  id: string;
  name: string;
  category: string;
  market: string;
  imageUrl: string;
  productsSold: number;
  productsSoldChange: number;
  forecastSellThrough: number;
  sellThroughChange: number;
  marketingSpend: number;
  marketingSpendChange: number;
  marginAfterMarketing: number;
  marginChange: number;
  weeklySales: number[];
};

export const productProfitabilityCards: ProductProfitabilityCard[] = [
  {
    id: "758394520",
    name: "Belted Wrap Cardigan",
    category: "Knitwear",
    market: "DACH",
    imageUrl: "https://images.pexels.com/photos/9860463/pexels-photo-9860463.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 1841,
    productsSoldChange: -8.61,
    forecastSellThrough: 119,
    sellThroughChange: 1.81,
    marketingSpend: 9121,
    marketingSpendChange: 8.97,
    marginAfterMarketing: -3.15,
    marginChange: -2.15,
    weeklySales: [210, 195, 220, 180, 240, 215, 230, 250],
  },
  {
    id: "284829492",
    name: "Jacquard Knitted Dress",
    category: "Dresses",
    market: "UK",
    imageUrl: "https://images.pexels.com/photos/18149119/pexels-photo-18149119.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 2340,
    productsSoldChange: 12.4,
    forecastSellThrough: 85,
    sellThroughChange: 5.2,
    marketingSpend: 17278,
    marketingSpendChange: -3.1,
    marginAfterMarketing: 8.42,
    marginChange: 2.8,
    weeklySales: [280, 310, 295, 340, 320, 355, 380, 390],
  },
  {
    id: "319284710",
    name: "Wool Blend Overcoat",
    category: "Outerwear",
    market: "UK",
    imageUrl: "https://images.pexels.com/photos/7083673/pexels-photo-7083673.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 3120,
    productsSoldChange: 18.3,
    forecastSellThrough: 142,
    sellThroughChange: 9.6,
    marketingSpend: 22400,
    marketingSpendChange: 4.2,
    marginAfterMarketing: 14.7,
    marginChange: 3.1,
    weeklySales: [350, 380, 410, 390, 425, 460, 480, 510],
  },
  {
    id: "891027345",
    name: "Cropped Denim Jacket",
    category: "Outerwear",
    market: "Nordics",
    imageUrl: "https://images.pexels.com/photos/8685990/pexels-photo-8685990.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 4280,
    productsSoldChange: 22.1,
    forecastSellThrough: 168,
    sellThroughChange: 15.3,
    marketingSpend: 31500,
    marketingSpendChange: 12.5,
    marginAfterMarketing: 11.2,
    marginChange: 1.9,
    weeklySales: [480, 520, 510, 560, 590, 620, 640, 680],
  },
  {
    id: "723918456",
    name: "Linen Blend Trousers",
    category: "Trousers",
    market: "DACH",
    imageUrl: "https://images.pexels.com/photos/27256456/pexels-photo-27256456.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 890,
    productsSoldChange: -4.2,
    forecastSellThrough: 56,
    sellThroughChange: -2.1,
    marketingSpend: 5600,
    marketingSpendChange: -8.4,
    marginAfterMarketing: 2.3,
    marginChange: -1.4,
    weeklySales: [120, 115, 108, 110, 105, 100, 98, 95],
  },
  {
    id: "612093847",
    name: "Silk Camisole Top",
    category: "Tops",
    market: "UK",
    imageUrl: "https://images.pexels.com/photos/11292946/pexels-photo-11292946.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 2780,
    productsSoldChange: 9.8,
    forecastSellThrough: 132,
    sellThroughChange: 7.4,
    marketingSpend: 14200,
    marketingSpendChange: 2.1,
    marginAfterMarketing: 6.8,
    marginChange: 1.2,
    weeklySales: [320, 340, 355, 370, 360, 385, 400, 410],
  },
  {
    id: "502918374",
    name: "Ribbed Knit Cardigan",
    category: "Knitwear",
    market: "Nordics",
    imageUrl: "https://images.pexels.com/photos/18993419/pexels-photo-18993419.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 1560,
    productsSoldChange: -1.3,
    forecastSellThrough: 72,
    sellThroughChange: 0.8,
    marketingSpend: 8900,
    marketingSpendChange: -5.2,
    marginAfterMarketing: 4.1,
    marginChange: -0.6,
    weeklySales: [200, 195, 210, 190, 205, 198, 192, 188],
  },
];

export const atRiskProducts: AtRiskProduct[] = [
  { name: "Cropped Denim Jacket", sku: "CDJ-891", daysOfStock: 8, sellThroughRate: 78.2, risk: "high" },
  { name: "Belted Wrap Cardigan", sku: "BWC-758", daysOfStock: 14, sellThroughRate: 62.5, risk: "medium" },
  { name: "Silk Camisole Top", sku: "SCT-612", daysOfStock: 12, sellThroughRate: 71.1, risk: "medium" },
];
