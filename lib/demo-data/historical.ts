/**
 * 13-Week Historical Performance Data
 * W1 = week ending 2025-12-21 → W13 = week ending 2026-03-15
 * All revenue figures in GBP.
 */

export interface WeeklyMetrics {
  week: number;
  weekLabel: string; // e.g. "W1"
  periodEnd: string; // ISO date string
  grossSales: number;
  orders: number;
  conversionRate: number; // %
  newCustomers: number;
  cac: number; // £
  roas: number; // ratio e.g. 3.8
  returnRate: number; // %
  adSpend: number; // £
  channels: {
    google: number; // gross sales £
    facebook: number;
    tiktok: number;
    snapchat: number;
    email: number;
    organic: number;
    direct: number;
  };
  context: string; // explanation of notable drivers this week
}

export const WEEKLY_PERFORMANCE: WeeklyMetrics[] = [
  {
    week: 1,
    weekLabel: "W1",
    periodEnd: "2025-12-21",
    grossSales: 182_400,
    orders: 2_140,
    conversionRate: 3.2,
    newCustomers: 390,
    cac: 28.4,
    roas: 3.2,
    returnRate: 8.1,
    adSpend: 42_000,
    channels: { google: 68_200, facebook: 36_100, tiktok: 22_400, snapchat: 9_800, email: 21_300, organic: 14_200, direct: 10_400 },
    context: "Pre-Christmas surge begins. Gift category (bags, accessories) drives +18% WoW. TikTok gifting content performing above average.",
  },
  {
    week: 2,
    weekLabel: "W2",
    periodEnd: "2025-12-28",
    grossSales: 224_800,
    orders: 2_810,
    conversionRate: 3.8,
    newCustomers: 540,
    cac: 26.1,
    roas: 3.9,
    returnRate: 7.4,
    adSpend: 46_200,
    channels: { google: 89_600, facebook: 44_200, tiktok: 28_100, snapchat: 12_400, email: 28_600, organic: 12_800, direct: 9_100 },
    context: "Christmas week peak. PMAX budget increased +10%. Outerwear and Fitness Electronics spike on gifting demand. New customer acquisition record for Q4.",
  },
  {
    week: 3,
    weekLabel: "W3",
    periodEnd: "2026-01-04",
    grossSales: 198_100,
    orders: 2_480,
    conversionRate: 3.5,
    newCustomers: 460,
    cac: 27.8,
    roas: 3.6,
    returnRate: 11.2,
    adSpend: 43_800,
    channels: { google: 74_400, facebook: 38_600, tiktok: 24_200, snapchat: 10_200, email: 26_400, organic: 14_600, direct: 9_700 },
    context: "Boxing Day and New Year sales. Return rate spike (+4pp) from Christmas gift returns — expected seasonal pattern. Email reactivation campaign boosted repeat buyers.",
  },
  {
    week: 4,
    weekLabel: "W4",
    periodEnd: "2026-01-11",
    grossSales: 156_300,
    orders: 1_920,
    conversionRate: 3.1,
    newCustomers: 280,
    cac: 34.2,
    roas: 3.1,
    returnRate: 9.6,
    adSpend: 38_400,
    channels: { google: 58_100, facebook: 30_200, tiktok: 18_600, snapchat: 8_100, email: 18_400, organic: 13_800, direct: 9_100 },
    context: "Post-holiday demand trough. January slump — consumers pulling back after Christmas spend. Ad efficiency drops; CAC rises to seasonal high. Began Activewear 'New Year' push.",
  },
  {
    week: 5,
    weekLabel: "W5",
    periodEnd: "2026-01-18",
    grossSales: 161_800,
    orders: 1_990,
    conversionRate: 3.2,
    newCustomers: 310,
    cac: 32.9,
    roas: 3.2,
    returnRate: 8.8,
    adSpend: 39_600,
    channels: { google: 62_400, facebook: 31_800, tiktok: 21_200, snapchat: 7_900, email: 17_800, organic: 12_600, direct: 8_100 },
    context: "New Year resolution uplift in Activewear and Fitness Electronics. TikTok 'January fitness' content performs well. Gradual recovery from holiday trough.",
  },
  {
    week: 6,
    weekLabel: "W6",
    periodEnd: "2026-01-25",
    grossSales: 168_200,
    orders: 2_060,
    conversionRate: 3.3,
    newCustomers: 330,
    cac: 31.4,
    roas: 3.3,
    returnRate: 8.4,
    adSpend: 40_200,
    channels: { google: 64_800, facebook: 33_600, tiktok: 22_800, snapchat: 8_200, email: 18_200, organic: 12_400, direct: 8_200 },
    context: "Steady January recovery. Loyalty programme reactivation drives email channel gains. Facebook audience expansion test begins targeting lapsed customers 90d+.",
  },
  {
    week: 7,
    weekLabel: "W7",
    periodEnd: "2026-02-01",
    grossSales: 172_600,
    orders: 2_120,
    conversionRate: 3.4,
    newCustomers: 340,
    cac: 30.8,
    roas: 3.4,
    returnRate: 8.2,
    adSpend: 40_800,
    channels: { google: 67_100, facebook: 34_600, tiktok: 22_400, snapchat: 8_400, email: 18_900, organic: 12_800, direct: 8_400 },
    context: "February begins solidly. Outerwear end-of-season clearance adds incremental revenue. Supply chain alert on Travel Pro Backpack — stock tightening.",
  },
  {
    week: 8,
    weekLabel: "W8",
    periodEnd: "2026-02-08",
    grossSales: 178_900,
    orders: 2_210,
    conversionRate: 3.5,
    newCustomers: 360,
    cac: 29.6,
    roas: 3.5,
    returnRate: 7.9,
    adSpend: 41_400,
    channels: { google: 69_400, facebook: 35_800, tiktok: 23_600, snapchat: 8_600, email: 19_400, organic: 12_900, direct: 9_200 },
    context: "Valentine's Day build-up. Accessories and Footwear gifting push. TikTok creative refresh improves CTR by +12%. CDP audience activation for 'gifters' segment launched.",
  },
  {
    week: 9,
    weekLabel: "W9",
    periodEnd: "2026-02-15",
    grossSales: 186_400,
    orders: 2_290,
    conversionRate: 3.6,
    newCustomers: 370,
    cac: 28.9,
    roas: 3.7,
    returnRate: 7.6,
    adSpend: 41_800,
    channels: { google: 72_600, facebook: 37_200, tiktok: 24_800, snapchat: 9_000, email: 20_100, organic: 13_200, direct: 9_500 },
    context: "Valentine's week peak. Accessories strongest week of Q1. Snapchat experiment delivers 2.1x ROAS vs 1.6x benchmark — scaling budget next week.",
  },
  {
    week: 10,
    weekLabel: "W10",
    periodEnd: "2026-02-22",
    grossSales: 175_200,
    orders: 2_160,
    conversionRate: 3.4,
    newCustomers: 345,
    cac: 30.2,
    roas: 3.5,
    returnRate: 8.0,
    adSpend: 41_200,
    channels: { google: 68_100, facebook: 34_800, tiktok: 23_200, snapchat: 9_400, email: 19_200, organic: 12_400, direct: 8_100 },
    context: "Post-Valentine's normalisation. Snapchat budget scaled +15% on strong prior week results. Travel Pro Backpack stockout begins impacting conversion in Bags & Luggage.",
  },
  {
    week: 11,
    weekLabel: "W11",
    periodEnd: "2026-03-01",
    grossSales: 179_800,
    orders: 2_200,
    conversionRate: 3.5,
    newCustomers: 352,
    cac: 29.8,
    roas: 3.6,
    returnRate: 7.8,
    adSpend: 41_600,
    channels: { google: 70_200, facebook: 35_400, tiktok: 23_800, snapchat: 9_200, email: 19_600, organic: 12_800, direct: 8_800 },
    context: "Spring transition collection launches. Lighter Outerwear and Activewear shift upward. Email campaign for 'Spring Drop' achieves 28% open rate — highest of quarter.",
  },
  {
    week: 12,
    weekLabel: "W12",
    periodEnd: "2026-03-08",
    grossSales: 183_600,
    orders: 2_260,
    conversionRate: 3.6,
    newCustomers: 362,
    cac: 29.4,
    roas: 3.7,
    returnRate: 7.7,
    adSpend: 41_800,
    channels: { google: 71_800, facebook: 36_200, tiktok: 24_400, snapchat: 9_400, email: 19_800, organic: 13_000, direct: 9_000 },
    context: "International Women's Day uplift. Activewear and Accessories perform well. PMAX broad match expansion contributing to new customer acquisition gains. Demand sensing flags Mother's Day opportunity in W16–W17.",
  },
  {
    week: 13,
    weekLabel: "W13",
    periodEnd: "2026-03-15",
    grossSales: 187_200,
    orders: 2_310,
    conversionRate: 3.7,
    newCustomers: 371,
    cac: 28.6,
    roas: 3.8,
    returnRate: 7.5,
    adSpend: 42_200,
    channels: { google: 73_200, facebook: 37_000, tiktok: 25_200, snapchat: 9_600, email: 20_200, organic: 13_400, direct: 8_600 },
    context: "Mid-March steady growth. Forecast accuracy improving to 76% as spring demand signals strengthen. Travel Pro Backpack restock expected W15. YTD gross sales tracking £180K/week average.",
  },
];

/** Aggregate the 13 weeks into monthly buckets (Dec-25, Jan-26, Feb-26, Mar-26) */
export interface MonthlyRollup {
  month: string;
  weeks: number[];
  grossSales: number;
  orders: number;
  newCustomers: number;
  avgConversionRate: number;
  avgRoas: number;
  avgCac: number;
}

export const MONTHLY_ROLLUPS: MonthlyRollup[] = [
  {
    month: "December 2025",
    weeks: [1, 2, 3],
    grossSales: WEEKLY_PERFORMANCE.slice(0, 3).reduce((s, w) => s + w.grossSales, 0),
    orders: WEEKLY_PERFORMANCE.slice(0, 3).reduce((s, w) => s + w.orders, 0),
    newCustomers: WEEKLY_PERFORMANCE.slice(0, 3).reduce((s, w) => s + w.newCustomers, 0),
    avgConversionRate: parseFloat((WEEKLY_PERFORMANCE.slice(0, 3).reduce((s, w) => s + w.conversionRate, 0) / 3).toFixed(2)),
    avgRoas: parseFloat((WEEKLY_PERFORMANCE.slice(0, 3).reduce((s, w) => s + w.roas, 0) / 3).toFixed(2)),
    avgCac: parseFloat((WEEKLY_PERFORMANCE.slice(0, 3).reduce((s, w) => s + w.cac, 0) / 3).toFixed(2)),
  },
  {
    month: "January 2026",
    weeks: [4, 5, 6, 7],
    grossSales: WEEKLY_PERFORMANCE.slice(3, 7).reduce((s, w) => s + w.grossSales, 0),
    orders: WEEKLY_PERFORMANCE.slice(3, 7).reduce((s, w) => s + w.orders, 0),
    newCustomers: WEEKLY_PERFORMANCE.slice(3, 7).reduce((s, w) => s + w.newCustomers, 0),
    avgConversionRate: parseFloat((WEEKLY_PERFORMANCE.slice(3, 7).reduce((s, w) => s + w.conversionRate, 0) / 4).toFixed(2)),
    avgRoas: parseFloat((WEEKLY_PERFORMANCE.slice(3, 7).reduce((s, w) => s + w.roas, 0) / 4).toFixed(2)),
    avgCac: parseFloat((WEEKLY_PERFORMANCE.slice(3, 7).reduce((s, w) => s + w.cac, 0) / 4).toFixed(2)),
  },
  {
    month: "February 2026",
    weeks: [8, 9, 10, 11],
    grossSales: WEEKLY_PERFORMANCE.slice(7, 11).reduce((s, w) => s + w.grossSales, 0),
    orders: WEEKLY_PERFORMANCE.slice(7, 11).reduce((s, w) => s + w.orders, 0),
    newCustomers: WEEKLY_PERFORMANCE.slice(7, 11).reduce((s, w) => s + w.newCustomers, 0),
    avgConversionRate: parseFloat((WEEKLY_PERFORMANCE.slice(7, 11).reduce((s, w) => s + w.conversionRate, 0) / 4).toFixed(2)),
    avgRoas: parseFloat((WEEKLY_PERFORMANCE.slice(7, 11).reduce((s, w) => s + w.roas, 0) / 4).toFixed(2)),
    avgCac: parseFloat((WEEKLY_PERFORMANCE.slice(7, 11).reduce((s, w) => s + w.cac, 0) / 4).toFixed(2)),
  },
  {
    month: "March 2026 (partial, W12–W13)",
    weeks: [12, 13],
    grossSales: WEEKLY_PERFORMANCE.slice(11, 13).reduce((s, w) => s + w.grossSales, 0),
    orders: WEEKLY_PERFORMANCE.slice(11, 13).reduce((s, w) => s + w.orders, 0),
    newCustomers: WEEKLY_PERFORMANCE.slice(11, 13).reduce((s, w) => s + w.newCustomers, 0),
    avgConversionRate: parseFloat((WEEKLY_PERFORMANCE.slice(11, 13).reduce((s, w) => s + w.conversionRate, 0) / 2).toFixed(2)),
    avgRoas: parseFloat((WEEKLY_PERFORMANCE.slice(11, 13).reduce((s, w) => s + w.roas, 0) / 2).toFixed(2)),
    avgCac: parseFloat((WEEKLY_PERFORMANCE.slice(11, 13).reduce((s, w) => s + w.cac, 0) / 2).toFixed(2)),
  },
];

export function getQtdSummary() {
  const q1Weeks = WEEKLY_PERFORMANCE; // all 13 weeks span Q4-25 tail + Q1-26
  const totalSales = q1Weeks.reduce((s, w) => s + w.grossSales, 0);
  const totalOrders = q1Weeks.reduce((s, w) => s + w.orders, 0);
  const totalNewCustomers = q1Weeks.reduce((s, w) => s + w.newCustomers, 0);
  const avgRoas = parseFloat((q1Weeks.reduce((s, w) => s + w.roas, 0) / q1Weeks.length).toFixed(2));
  const avgCac = parseFloat((q1Weeks.reduce((s, w) => s + w.cac, 0) / q1Weeks.length).toFixed(2));
  const peakWeek = q1Weeks.reduce((best, w) => (w.grossSales > best.grossSales ? w : best), q1Weeks[0]);
  const troughWeek = q1Weeks.reduce((worst, w) => (w.grossSales < worst.grossSales ? w : worst), q1Weeks[0]);
  return { totalSales, totalOrders, totalNewCustomers, avgRoas, avgCac, peakWeek, troughWeek, weekCount: q1Weeks.length };
}
