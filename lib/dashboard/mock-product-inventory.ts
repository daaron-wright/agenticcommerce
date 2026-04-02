/* Product & Inventory mock data — Winter Weather Hazard Simulation */

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
  { productId: "WTR-101", name: "Water Bulk Pack (24ct)", endOfSeasonInventory: 120, currentInventory: 480, productViews: 86400, orderCount: 12_840, grossSales: 154_080, marketingSpend: 18_200 },
  { productId: "BAT-201", name: "AA Batteries 48-Pack", endOfSeasonInventory: 85, currentInventory: 620, productViews: 72_100, orderCount: 9_820, grossSales: 235_680, marketingSpend: 14_600 },
  { productId: "FAK-301", name: "First Aid Kit Deluxe", endOfSeasonInventory: 210, currentInventory: 1_240, productViews: 54_200, orderCount: 6_420, grossSales: 359_520, marketingSpend: 22_400 },
  { productId: "RDY-401", name: "Chilled Ready Meals (6-pack)", endOfSeasonInventory: 340, currentInventory: 2_100, productViews: 48_600, orderCount: 8_240, grossSales: 148_320, marketingSpend: 12_800 },
  { productId: "FRZ-501", name: "Frozen Desserts Variety Pack", endOfSeasonInventory: 280, currentInventory: 1_860, productViews: 32_400, orderCount: 5_180, grossSales: 82_880, marketingSpend: 8_400 },
  { productId: "BAT-202", name: "LED Flashlight Pro", endOfSeasonInventory: 62, currentInventory: 380, productViews: 64_800, orderCount: 7_620, grossSales: 320_040, marketingSpend: 16_200 },
  { productId: "WRM-701", name: "Insulated Winter Coat", endOfSeasonInventory: 420, currentInventory: 3_200, productViews: 28_400, orderCount: 3_840, grossSales: 341_760, marketingSpend: 24_600 },
];

export const productReportTotals = {
  endOfSeasonInventory: 1_517,
  currentInventory: 9_880,
  productViews: 386_900,
  orderCount: 53_960,
  grossSales: 1_642_280,
  marketingSpend: 117_200,
};

export const inventoryForecastData: InventoryForecastPoint[] = [
  { week: "W1", actual: 42000, forecast: 41800 },
  { week: "W2", actual: 40500, forecast: 40200 },
  { week: "W3", actual: 39200, forecast: 39500 },
  { week: "W4", actual: 38100, forecast: 38000 },
  { week: "W5", actual: 37200, forecast: 37200 },
  { week: "W6", actual: 36400, forecast: 36800 },
  { week: "W7", actual: 35600, forecast: 35500 },
  { week: "W8", actual: 34200, forecast: 34000 },
  { week: "W9", actual: 28400, forecast: 32500 },
  { week: "W10", actual: 16800, forecast: 30200 },
  { week: "W11", actual: null, forecast: 8400 },
  { week: "W12", actual: null, forecast: 2200 },
];

/* ── Sell-Through Optimization scatter data ───────────────────────────── */

export type SellThroughProduct = {
  name: string;
  forecastSellThrough: number;
  marketingSpend: number;
  excludedFromMarketing: boolean;
};

export const sellThroughProducts: SellThroughProduct[] = [
  { name: "Water Bulk Pack (24ct)", forecastSellThrough: 94, marketingSpend: 18200, excludedFromMarketing: false },
  { name: "AA Batteries 48-Pack", forecastSellThrough: 88, marketingSpend: 14600, excludedFromMarketing: false },
  { name: "First Aid Kit Deluxe", forecastSellThrough: 82, marketingSpend: 22400, excludedFromMarketing: false },
  { name: "Chilled Ready Meals (6-pack)", forecastSellThrough: 76, marketingSpend: 12800, excludedFromMarketing: false },
  { name: "Frozen Desserts Variety Pack", forecastSellThrough: 68, marketingSpend: 8400, excludedFromMarketing: false },
  { name: "LED Flashlight Pro", forecastSellThrough: 92, marketingSpend: 16200, excludedFromMarketing: false },
  { name: "Insulated Winter Coat", forecastSellThrough: 58, marketingSpend: 24600, excludedFromMarketing: false },
  { name: "Emergency Pet Food (Dog, 20lb)", forecastSellThrough: 72, marketingSpend: 6800, excludedFromMarketing: false },
  { name: "Thermal Blanket Bundle (3ct)", forecastSellThrough: 64, marketingSpend: 8200, excludedFromMarketing: false },
  { name: "Portable Phone Charger", forecastSellThrough: 86, marketingSpend: 12400, excludedFromMarketing: false },
  { name: "Emergency Radio (Hand-Crank)", forecastSellThrough: 78, marketingSpend: 9600, excludedFromMarketing: false },
  { name: "Shelf-Stable Soup Variety (12ct)", forecastSellThrough: 62, marketingSpend: 4800, excludedFromMarketing: true },
  { name: "Emergency Protein Bars (24ct)", forecastSellThrough: 70, marketingSpend: 5200, excludedFromMarketing: true },
  { name: "Prescription Replenishment Pack", forecastSellThrough: 44, marketingSpend: 3200, excludedFromMarketing: true },
  { name: "Fleece-Lined Gloves", forecastSellThrough: 52, marketingSpend: 4600, excludedFromMarketing: false },
  { name: "Water Filtration Jug", forecastSellThrough: 48, marketingSpend: 6200, excludedFromMarketing: false },
  { name: "Portable Lantern", forecastSellThrough: 74, marketingSpend: 7800, excludedFromMarketing: false },
  { name: "Frozen Pizza Bundle (4ct)", forecastSellThrough: 56, marketingSpend: 3600, excludedFromMarketing: true },
  { name: "Mixed-Leaf Salad (Family)", forecastSellThrough: 18, marketingSpend: 1200, excludedFromMarketing: true },
  { name: "Emergency Pet Food (Cat, 15lb)", forecastSellThrough: 66, marketingSpend: 5400, excludedFromMarketing: false },
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
    id: "WTR-101",
    name: "Water Bulk Pack (24ct)",
    category: "Water & Emergency",
    market: "Northeast US",
    imageUrl: "https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 12840,
    productsSoldChange: 248.6,
    forecastSellThrough: 94,
    sellThroughChange: 42.1,
    marketingSpend: 18200,
    marketingSpendChange: 86.4,
    marginAfterMarketing: 22.4,
    marginChange: 8.6,
    weeklySales: [420, 440, 460, 480, 520, 1240, 4800, 12840],
  },
  {
    id: "BAT-201",
    name: "AA Batteries 48-Pack",
    category: "Batteries & Lighting",
    market: "Northeast US",
    imageUrl: "https://images.pexels.com/photos/3850587/pexels-photo-3850587.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 9820,
    productsSoldChange: 186.4,
    forecastSellThrough: 88,
    sellThroughChange: 38.2,
    marketingSpend: 14600,
    marketingSpendChange: 64.2,
    marginAfterMarketing: 28.6,
    marginChange: 12.4,
    weeklySales: [380, 390, 410, 420, 480, 980, 3600, 9820],
  },
  {
    id: "FAK-301",
    name: "First Aid Kit Deluxe",
    category: "First Aid & Medical",
    market: "Northeast US",
    imageUrl: "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 6420,
    productsSoldChange: 142.8,
    forecastSellThrough: 82,
    sellThroughChange: 28.6,
    marketingSpend: 22400,
    marketingSpendChange: 48.2,
    marginAfterMarketing: 18.2,
    marginChange: 6.4,
    weeklySales: [280, 290, 310, 320, 380, 680, 2400, 6420],
  },
  {
    id: "RDY-401",
    name: "Chilled Ready Meals (6-pack)",
    category: "Ready Meals",
    market: "Midwest US",
    imageUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 8240,
    productsSoldChange: 168.4,
    forecastSellThrough: 76,
    sellThroughChange: 22.8,
    marketingSpend: 12800,
    marketingSpendChange: 42.6,
    marginAfterMarketing: 14.8,
    marginChange: 4.2,
    weeklySales: [340, 360, 380, 400, 520, 1120, 3200, 8240],
  },
  {
    id: "FRZ-501",
    name: "Frozen Desserts Variety Pack",
    category: "Frozen Foods",
    market: "Southeast US",
    imageUrl: "https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 5180,
    productsSoldChange: 124.6,
    forecastSellThrough: 68,
    sellThroughChange: 18.4,
    marketingSpend: 8400,
    marketingSpendChange: 32.8,
    marginAfterMarketing: 12.4,
    marginChange: 2.8,
    weeklySales: [220, 240, 260, 280, 340, 620, 1800, 5180],
  },
  {
    id: "BAT-202",
    name: "LED Flashlight Pro",
    category: "Batteries & Lighting",
    market: "Northeast US",
    imageUrl: "https://images.pexels.com/photos/3862634/pexels-photo-3862634.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 7620,
    productsSoldChange: 196.2,
    forecastSellThrough: 92,
    sellThroughChange: 40.6,
    marketingSpend: 16200,
    marketingSpendChange: 72.4,
    marginAfterMarketing: 32.8,
    marginChange: 14.2,
    weeklySales: [310, 320, 340, 360, 440, 860, 3200, 7620],
  },
  {
    id: "WRM-701",
    name: "Insulated Winter Coat",
    category: "Warm Clothing",
    market: "West US",
    imageUrl: "https://images.pexels.com/photos/7083673/pexels-photo-7083673.jpeg?auto=compress&cs=tinysrgb&w=400",
    productsSold: 3840,
    productsSoldChange: 86.4,
    forecastSellThrough: 58,
    sellThroughChange: 12.2,
    marketingSpend: 24600,
    marketingSpendChange: 28.4,
    marginAfterMarketing: 8.6,
    marginChange: 1.4,
    weeklySales: [240, 260, 280, 300, 380, 520, 1240, 3840],
  },
];

export const atRiskProducts: AtRiskProduct[] = [
  { name: "Water Bulk Pack (24ct)", sku: "WTR-101", daysOfStock: 2, sellThroughRate: 94.2, risk: "high" },
  { name: "AA Batteries 48-Pack", sku: "BAT-201", daysOfStock: 3, sellThroughRate: 88.6, risk: "high" },
  { name: "LED Flashlight Pro", sku: "BAT-202", daysOfStock: 3, sellThroughRate: 92.1, risk: "high" },
  { name: "First Aid Kit Deluxe", sku: "FAK-301", daysOfStock: 5, sellThroughRate: 82.4, risk: "high" },
  { name: "Chilled Ready Meals (6-pack)", sku: "RDY-401", daysOfStock: 6, sellThroughRate: 76.8, risk: "medium" },
  { name: "Frozen Desserts Variety Pack", sku: "FRZ-501", daysOfStock: 8, sellThroughRate: 68.2, risk: "medium" },
];
