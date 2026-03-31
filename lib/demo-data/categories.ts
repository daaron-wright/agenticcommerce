/**
 * Category-Level P&L and Performance Data
 * 8 product categories — reflects Q1 2026 YTD (13 weeks through W/E 15 Mar 2026).
 * All revenue and margin figures in GBP.
 */

export type TrendDirection = "up" | "down" | "stable";

export interface CategorySku {
  sku: string;
  name: string;
  revenue: number;
  units: number;
  margin: number; // % gross margin
}

export interface CategoryPerformance {
  id: string;
  name: string;
  revenue: number; // £ gross, Q1 YTD
  cogs: number; // £ cost of goods
  grossMargin: number; // % e.g. 62.4
  grossProfit: number; // £
  units: number;
  avgOrderValue: number; // £
  returnRate: number; // %
  inventoryCover: number; // weeks of cover at current run rate
  trend: TrendDirection;
  wowGrowth: number; // % week-on-week latest week
  yoyGrowth: number; // % year-on-year (vs same period last year)
  shareOfRevenue: number; // % of total category mix
  topSkus: CategorySku[];
  notes: string;
}

export const CATEGORIES: CategoryPerformance[] = [
  {
    id: "outerwear",
    name: "Outerwear",
    revenue: 624_800,
    cogs: 249_920,
    grossMargin: 60.0,
    grossProfit: 374_880,
    units: 18_240,
    avgOrderValue: 34.2,
    returnRate: 7.4,
    inventoryCover: 6.2,
    trend: "down",
    wowGrowth: -2.1,
    yoyGrowth: 4.8,
    shareOfRevenue: 26.1,
    topSkus: [
      { sku: "OWJ-441", name: "Alpine Puffer Jacket", revenue: 198_400, units: 5_120, margin: 62.4 },
      { sku: "OWJ-312", name: "Waterproof Trail Jacket", revenue: 164_200, units: 4_360, margin: 58.8 },
      { sku: "OWC-088", name: "Sherpa Fleece Coat", revenue: 141_600, units: 4_080, margin: 61.2 },
    ],
    notes: "End-of-season clearance in W7–W9 boosted units but compressed margin by ~3pp. Spring transition range launches W14. Cover tightening on hero SKUs.",
  },
  {
    id: "footwear",
    name: "Footwear",
    revenue: 412_600,
    cogs: 154_725,
    grossMargin: 62.5,
    grossProfit: 257_875,
    units: 11_820,
    avgOrderValue: 34.9,
    returnRate: 9.2,
    inventoryCover: 8.4,
    trend: "up",
    wowGrowth: 3.4,
    yoyGrowth: 11.2,
    shareOfRevenue: 17.2,
    topSkus: [
      { sku: "FTW-221", name: "Trail Runner Pro", revenue: 148_400, units: 4_260, margin: 64.1 },
      { sku: "FTW-389", name: "Urban Stride Trainer", revenue: 128_200, units: 3_680, margin: 61.8 },
      { sku: "FTW-102", name: "Classic Leather Loafer", revenue: 96_800, units: 2_880, margin: 62.4 },
    ],
    notes: "Strong YoY growth driven by running category expansion. Trail Runner Pro approaching stockout — reorder in progress. Return rate elevated on size fit issues; exploring virtual try-on feature.",
  },
  {
    id: "activewear",
    name: "Activewear",
    revenue: 394_200,
    cogs: 141_912,
    grossMargin: 64.0,
    grossProfit: 252_288,
    units: 14_640,
    avgOrderValue: 26.9,
    returnRate: 6.1,
    inventoryCover: 9.8,
    trend: "up",
    wowGrowth: 4.8,
    yoyGrowth: 18.6,
    shareOfRevenue: 16.5,
    topSkus: [
      { sku: "AWJ-302", name: "Performance Running Tights", revenue: 122_400, units: 4_880, margin: 66.2 },
      { sku: "AWJ-118", name: "Seamless Sports Bra", revenue: 98_600, units: 4_120, margin: 63.8 },
      { sku: "AWJ-245", name: "Zip-Up Training Hoodie", revenue: 88_200, units: 3_240, margin: 62.4 },
    ],
    notes: "January 'New Year' fitness campaigns delivered +22% WoW in W4–W5. Highest margin category. TikTok creative resonating well with 18–34 female demographic. Spring drop in planning.",
  },
  {
    id: "bags_luggage",
    name: "Bags & Luggage",
    revenue: 368_400,
    cogs: 147_360,
    grossMargin: 60.0,
    grossProfit: 221_040,
    units: 9_210,
    avgOrderValue: 40.0,
    returnRate: 5.8,
    inventoryCover: 3.2,
    trend: "stable",
    wowGrowth: -0.8,
    yoyGrowth: 7.4,
    shareOfRevenue: 15.4,
    topSkus: [
      { sku: "TPB-551", name: "Travel Pro Backpack 40L", revenue: 142_800, units: 2_856, margin: 63.1 },
      { sku: "BGL-228", name: "Weekend Holdall", revenue: 98_400, units: 2_460, margin: 58.4 },
      { sku: "BGL-097", name: "Anti-Theft Crossbody", revenue: 82_200, units: 2_740, margin: 60.8 },
    ],
    notes: "Travel Pro Backpack (TPB-551) is in CRITICAL STOCKOUT — est. 2-week impact before restock arrives W15. This is suppressing category conversion by ~12%. All other lines healthy.",
  },
  {
    id: "fitness_electronics",
    name: "Fitness Electronics",
    revenue: 286_400,
    cogs: 128_880,
    grossMargin: 55.0,
    grossProfit: 157_520,
    units: 5_728,
    avgOrderValue: 50.0,
    returnRate: 4.2,
    inventoryCover: 11.4,
    trend: "stable",
    wowGrowth: 1.2,
    yoyGrowth: 22.4,
    shareOfRevenue: 12.0,
    topSkus: [
      { sku: "FE-881", name: "GPS Sport Watch Elite", revenue: 112_600, units: 1_876, margin: 56.4 },
      { sku: "FE-442", name: "Heart Rate Monitor Pro", revenue: 86_400, units: 1_920, margin: 53.8 },
      { sku: "FE-219", name: "Wireless Earbuds Sport", revenue: 64_200, units: 1_604, margin: 54.6 },
    ],
    notes: "Christmas gifting drove Q4 peak. January 'fitness tech' positioning maintained momentum. Lowest return rate across all categories. Margin constrained by electronics cost structure — target 57% by EOY through mix shift.",
  },
  {
    id: "basics_essentials",
    name: "Basics & Essentials",
    revenue: 224_800,
    cogs: 90_880,
    grossMargin: 59.6,
    grossProfit: 133_920,
    units: 22_480,
    avgOrderValue: 10.0,
    returnRate: 3.8,
    inventoryCover: 14.2,
    trend: "stable",
    wowGrowth: 0.4,
    yoyGrowth: 3.2,
    shareOfRevenue: 9.4,
    topSkus: [
      { sku: "BSC-044", name: "Essential 5-Pack Socks", revenue: 72_400, units: 9_050, margin: 61.2 },
      { sku: "BSC-189", name: "Cotton Crew Tee 3-Pack", revenue: 68_800, units: 6_880, margin: 58.4 },
      { sku: "BSC-302", name: "Performance Base Layer", revenue: 58_200, units: 5_820, margin: 59.8 },
    ],
    notes: "High-volume / low-AOV replenishment category. Drives frequency and basket attachment. Lowest return rate platform-wide. Subscription model testing Q2 — projected 12% revenue uplift if conversion rate holds.",
  },
  {
    id: "accessories",
    name: "Accessories",
    revenue: 198_600,
    cogs: 71_496,
    grossMargin: 64.0,
    grossProfit: 127_104,
    units: 14_186,
    avgOrderValue: 14.0,
    returnRate: 5.2,
    inventoryCover: 12.6,
    trend: "up",
    wowGrowth: 2.8,
    yoyGrowth: 14.8,
    shareOfRevenue: 8.3,
    topSkus: [
      { sku: "ACC-774", name: "Merino Wool Beanie", revenue: 62_200, units: 4_443, margin: 65.8 },
      { sku: "ACC-331", name: "Sport Sunglasses UV400", revenue: 54_800, units: 3_657, margin: 63.2 },
      { sku: "ACC-128", name: "Running Gloves Touchscreen", revenue: 48_400, units: 4_033, margin: 64.1 },
    ],
    notes: "Valentine's Day peak (W8–W9) contributed meaningfully. Second-highest gross margin. Strong add-to-cart attachment rate when paired with Outerwear or Footwear. CDP audience 'gifters' segment driving incremental.",
  },
  {
    id: "swimwear",
    name: "Swimwear",
    revenue: 84_200,
    cogs: 33_680,
    grossMargin: 60.0,
    grossProfit: 50_520,
    units: 3_368,
    avgOrderValue: 25.0,
    returnRate: 8.6,
    inventoryCover: 18.2,
    trend: "up",
    wowGrowth: 6.4,
    yoyGrowth: 28.2,
    shareOfRevenue: 3.5,
    topSkus: [
      { sku: "SWM-410", name: "Performance Swim Shorts", revenue: 34_800, units: 1_392, margin: 61.8 },
      { sku: "SWM-224", name: "Racerback Swimsuit", revenue: 28_400, units: 1_136, margin: 58.4 },
      { sku: "SWM-089", name: "Rash Guard Long Sleeve", revenue: 18_200, units: 728, margin: 61.2 },
    ],
    notes: "Smallest category by revenue but highest YoY growth rate (+28%). Early-spring buying signal detected. Demand planning flagging W16+ uplift ahead of Easter holidays. Inventory cover is high — unlikely to stockout.",
  },
];

export function getCategoryTotals() {
  const totalRevenue = CATEGORIES.reduce((s, c) => s + c.revenue, 0);
  const totalGrossProfit = CATEGORIES.reduce((s, c) => s + c.grossProfit, 0);
  const totalUnits = CATEGORIES.reduce((s, c) => s + c.units, 0);
  const blendedMargin = parseFloat(((totalGrossProfit / totalRevenue) * 100).toFixed(1));
  const avgReturnRate = parseFloat((CATEGORIES.reduce((s, c) => s + c.returnRate, 0) / CATEGORIES.length).toFixed(1));
  const highestMargin = CATEGORIES.reduce((best, c) => (c.grossMargin > best.grossMargin ? c : best), CATEGORIES[0]);
  const lowestMargin = CATEGORIES.reduce((worst, c) => (c.grossMargin < worst.grossMargin ? c : worst), CATEGORIES[0]);
  const fastestGrowing = CATEGORIES.reduce((best, c) => (c.yoyGrowth > best.yoyGrowth ? c : best), CATEGORIES[0]);
  return { totalRevenue, totalGrossProfit, totalUnits, blendedMargin, avgReturnRate, highestMargin, lowestMargin, fastestGrowing };
}
