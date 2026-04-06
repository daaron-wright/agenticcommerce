/**
 * Category-Level P&L and Performance Data
 * 7 storm-critical product categories — reflects Q1 2026 YTD (13 weeks through W/E 15 Mar 2026).
 * All revenue and margin figures in USD.
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
  revenue: number; // $ gross, Q1 YTD
  cogs: number; // $ cost of goods
  grossMargin: number; // % e.g. 62.4
  grossProfit: number; // $
  units: number;
  avgOrderValue: number; // $
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
    id: "water_emergency",
    name: "Water & Emergency Supplies",
    revenue: 684_200,
    cogs: 342_100,
    grossMargin: 50.0,
    grossProfit: 342_100,
    units: 42_760,
    avgOrderValue: 16.0,
    returnRate: 0.8,
    inventoryCover: 1.2,
    trend: "up",
    wowGrowth: 280.4,
    yoyGrowth: 312.6,
    shareOfRevenue: 24.8,
    topSkus: [
      { sku: "WTR-101", name: "Bulk Water Pack (24ct)", revenue: 312_400, units: 19_525, margin: 48.2 },
      { sku: "WTR-205", name: "Emergency Water Jug 5gal", revenue: 198_600, units: 11_094, margin: 51.4 },
      { sku: "WTR-088", name: "Purification Tablets 50ct", revenue: 98_200, units: 8_183, margin: 52.8 },
    ],
    notes: "CRITICAL STOCKOUT RISK — 1.2 days cover at Northeast DC. Panic buying driving 280% demand surge. Emergency reorder submitted for 18,000 cases. Atlanta DC surplus being redirected.",
  },
  {
    id: "batteries_lighting",
    name: "Batteries & Lighting",
    revenue: 524_600,
    cogs: 236_070,
    grossMargin: 55.0,
    grossProfit: 288_530,
    units: 36_860,
    avgOrderValue: 14.2,
    returnRate: 1.2,
    inventoryCover: 0.8,
    trend: "up",
    wowGrowth: 320.2,
    yoyGrowth: 348.8,
    shareOfRevenue: 19.0,
    topSkus: [
      { sku: "BAT-301", name: "AA Batteries 48-Pack", revenue: 218_400, units: 15_600, margin: 54.6 },
      { sku: "FLT-112", name: "LED Flashlight Pro", revenue: 164_200, units: 10_947, margin: 56.2 },
      { sku: "BAT-205", name: "D-Cell Batteries 12-Pack", revenue: 86_400, units: 7_200, margin: 53.8 },
    ],
    notes: "CRITICAL — 0.8 days cover remaining. Demand surge 320% above baseline. Emergency reorder for 14,000 units. Alternate supplier PowerCell Direct activated.",
  },
  {
    id: "first_aid",
    name: "First Aid & Medical",
    revenue: 412_800,
    cogs: 165_120,
    grossMargin: 60.0,
    grossProfit: 247_680,
    units: 22_934,
    avgOrderValue: 18.0,
    returnRate: 0.4,
    inventoryCover: 1.4,
    trend: "up",
    wowGrowth: 240.6,
    yoyGrowth: 268.4,
    shareOfRevenue: 15.0,
    topSkus: [
      { sku: "FAK-401", name: "Emergency First Aid Kit", revenue: 186_200, units: 9_310, margin: 62.4 },
      { sku: "FAK-205", name: "Prescription Refill Bundle", revenue: 124_800, units: 6_240, margin: 58.8 },
      { sku: "FAK-089", name: "Cold & Flu Emergency Pack", revenue: 68_400, units: 5_700, margin: 59.6 },
    ],
    notes: "Emergency reorder submitted — critical safety item. Full quantity approval recommended. Prescription refills flagged for expedited subscription delivery before storm lockdown.",
  },
  {
    id: "ready_meals",
    name: "Ready Meals & Shelf-Stable Food",
    revenue: 386_400,
    cogs: 170_016,
    grossMargin: 56.0,
    grossProfit: 216_384,
    units: 28_960,
    avgOrderValue: 13.3,
    returnRate: 2.4,
    inventoryCover: 1.8,
    trend: "up",
    wowGrowth: 186.2,
    yoyGrowth: 204.8,
    shareOfRevenue: 14.0,
    topSkus: [
      { sku: "RDM-101", name: "Chilled Ready Meals 6-Pack", revenue: 164_800, units: 10_300, margin: 54.2 },
      { sku: "RDM-204", name: "Canned Soup Variety 12ct", revenue: 118_200, units: 9_850, margin: 57.8 },
      { sku: "RDM-088", name: "Instant Noodle Family Pack", revenue: 72_400, units: 7_240, margin: 56.4 },
    ],
    notes: "Chilled ready meals require cold-chain conditional approval — sub-4°C transport. Shelf-stable foods performing well. Mixed-leaf salad excluded due to spoilage risk during storm.",
  },
  {
    id: "frozen_foods",
    name: "Frozen Foods",
    revenue: 298_200,
    cogs: 134_190,
    grossMargin: 55.0,
    grossProfit: 164_010,
    units: 18_640,
    avgOrderValue: 16.0,
    returnRate: 3.8,
    inventoryCover: 2.1,
    trend: "up",
    wowGrowth: 142.4,
    yoyGrowth: 168.6,
    shareOfRevenue: 10.8,
    topSkus: [
      { sku: "FRZ-301", name: "Frozen Desserts Variety Pack", revenue: 128_400, units: 6_420, margin: 54.6 },
      { sku: "FRZ-112", name: "Frozen Pizza Family 4-Pack", revenue: 96_800, units: 6_050, margin: 55.8 },
      { sku: "FRZ-089", name: "Frozen Vegetables Bulk Bag", revenue: 52_200, units: 5_220, margin: 54.2 },
    ],
    notes: "Strict sub-4°C transport required — cold-chain integrity non-negotiable. Power outage risk at Northeast DC. Generator fuel resupply dispatched. Frozen desserts pending business decision.",
  },
  {
    id: "pet_supplies",
    name: "Pet Supplies",
    revenue: 248_600,
    cogs: 109_384,
    grossMargin: 56.0,
    grossProfit: 139_216,
    units: 16_574,
    avgOrderValue: 15.0,
    returnRate: 1.6,
    inventoryCover: 1.6,
    trend: "up",
    wowGrowth: 168.8,
    yoyGrowth: 192.4,
    shareOfRevenue: 9.0,
    topSkus: [
      { sku: "PET-201", name: "Emergency Pet Food 10lb Bag", revenue: 112_400, units: 7_493, margin: 56.8 },
      { sku: "PET-105", name: "Pet First Aid Kit", revenue: 78_200, units: 4_600, margin: 55.4 },
      { sku: "PET-088", name: "Cat Litter Emergency 25lb", revenue: 42_600, units: 3_544, margin: 54.2 },
    ],
    notes: "High-priority lockdown essential. Reorder submitted for 5,000 cases. Adjacent DC surplus check pending before final approval.",
  },
  {
    id: "warm_clothing",
    name: "Warm Clothing & Blankets",
    revenue: 204_800,
    cogs: 81_920,
    grossMargin: 60.0,
    grossProfit: 122_880,
    units: 10_240,
    avgOrderValue: 20.0,
    returnRate: 4.2,
    inventoryCover: 4.8,
    trend: "up",
    wowGrowth: 94.6,
    yoyGrowth: 118.2,
    shareOfRevenue: 7.4,
    topSkus: [
      { sku: "WRM-101", name: "Emergency Blanket 2-Pack", revenue: 86_400, units: 4_320, margin: 62.4 },
      { sku: "WRM-205", name: "Thermal Insulated Coat", revenue: 68_200, units: 2_273, margin: 58.8 },
      { sku: "WRM-088", name: "Wool Socks 6-Pack", revenue: 34_800, units: 2_900, margin: 61.2 },
    ],
    notes: "Adequate cover for storm period. Demand elevated but manageable. Emergency blankets selling fastest — thermal coats and wool socks steady.",
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
