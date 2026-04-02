/**
 * 13-Week Historical Performance Data — Winter Weather Hazard Simulation
 * W1 = week ending 2025-12-21 → W13 = week ending 2026-03-15
 * All revenue figures in USD.
 * Pattern: Normal → uptick → massive surge as storm approaches in W12-W13
 */

export interface WeeklyMetrics {
  week: number;
  weekLabel: string; // e.g. "W1"
  periodEnd: string; // ISO date string
  grossSales: number;
  orders: number;
  conversionRate: number; // %
  newCustomers: number;
  cac: number; // $
  roas: number; // ratio e.g. 3.8
  returnRate: number; // %
  adSpend: number; // $
  channels: {
    pushNotifications: number; // gross sales $
    appAlerts: number;
    email: number;
    sms: number;
    inStore: number;
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
    returnRate: 4.1,
    adSpend: 42_000,
    channels: { pushNotifications: 28_200, appAlerts: 32_100, email: 42_400, sms: 18_800, inStore: 31_300, organic: 18_200, direct: 11_400 },
    context: "Pre-Christmas baseline. Normal seasonal demand for essentials and warm clothing. Steady in-store traffic.",
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
    returnRate: 3.8,
    adSpend: 46_200,
    channels: { pushNotifications: 36_600, appAlerts: 42_200, email: 52_100, sms: 22_400, inStore: 38_600, organic: 20_800, direct: 12_100 },
    context: "Christmas week peak. Strong warm clothing and emergency supply gifting. Water and batteries see seasonal uplift.",
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
    returnRate: 5.2,
    adSpend: 43_800,
    channels: { pushNotifications: 30_400, appAlerts: 36_600, email: 46_400, sms: 20_200, inStore: 34_600, organic: 18_600, direct: 11_300 },
    context: "Post-Christmas normalisation. Return rate up slightly from gift returns. Shelf-stable food steady.",
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
    returnRate: 4.6,
    adSpend: 38_400,
    channels: { pushNotifications: 22_100, appAlerts: 28_200, email: 38_400, sms: 16_100, inStore: 28_800, organic: 13_800, direct: 8_900 },
    context: "January demand trough. Consumers pulling back post-holiday. Emergency supplies at baseline levels.",
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
    returnRate: 4.2,
    adSpend: 39_600,
    channels: { pushNotifications: 24_400, appAlerts: 30_800, email: 39_800, sms: 17_900, inStore: 26_600, organic: 13_600, direct: 8_700 },
    context: "Gradual January recovery. First aid and prescription items see modest winter uplift.",
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
    returnRate: 4.0,
    adSpend: 40_200,
    channels: { pushNotifications: 26_800, appAlerts: 32_600, email: 40_200, sms: 18_200, inStore: 28_400, organic: 13_400, direct: 8_600 },
    context: "Steady recovery continues. Pet food and ready meals showing slight uptick from cold snap forecast.",
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
    returnRate: 3.8,
    adSpend: 40_800,
    channels: { pushNotifications: 28_100, appAlerts: 33_600, email: 41_400, sms: 18_400, inStore: 28_800, organic: 13_600, direct: 8_700 },
    context: "February begins. Cold weather driving warm clothing demand. First weather advisories for late-season storm activity.",
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
    returnRate: 3.6,
    adSpend: 41_400,
    channels: { pushNotifications: 30_400, appAlerts: 35_800, email: 42_600, sms: 19_600, inStore: 28_900, organic: 12_800, direct: 9_000 },
    context: "Normal February demand. Water and batteries see small uptick. First storm watch issued for Northeast corridor.",
  },
  {
    week: 9,
    weekLabel: "W9",
    periodEnd: "2026-02-15",
    grossSales: 196_400,
    orders: 2_490,
    conversionRate: 3.8,
    newCustomers: 420,
    cac: 28.2,
    roas: 3.9,
    returnRate: 3.2,
    adSpend: 42_800,
    channels: { pushNotifications: 36_600, appAlerts: 40_200, email: 44_100, sms: 22_000, inStore: 30_200, organic: 14_200, direct: 9_100 },
    context: "Early storm signals. Weather models show potential blizzard in 3-4 weeks. Smart consumers begin pre-positioning essentials.",
  },
  {
    week: 10,
    weekLabel: "W10",
    periodEnd: "2026-02-22",
    grossSales: 228_600,
    orders: 3_120,
    conversionRate: 4.2,
    newCustomers: 580,
    cac: 24.6,
    roas: 4.4,
    returnRate: 2.8,
    adSpend: 44_200,
    channels: { pushNotifications: 48_100, appAlerts: 46_800, email: 46_200, sms: 28_400, inStore: 32_400, organic: 16_400, direct: 10_300 },
    context: "Storm prep acceleration. Weather models converge on severe blizzard forecast. Water and batteries +32% WoW. Push notifications driving engagement.",
  },
  {
    week: 11,
    weekLabel: "W11",
    periodEnd: "2026-03-01",
    grossSales: 486_200,
    orders: 6_840,
    conversionRate: 5.8,
    newCustomers: 1_420,
    cac: 18.4,
    roas: 8.2,
    returnRate: 1.8,
    adSpend: 52_600,
    channels: { pushNotifications: 112_000, appAlerts: 98_400, email: 82_600, sms: 68_200, inStore: 62_800, organic: 38_800, direct: 23_400 },
    context: "Storm confirmed — NOAA issues blizzard warning. Panic buying begins. Water, batteries, first aid +180% WoW. App downloads surge 340%. Cold-chain products in demand.",
  },
  {
    week: 12,
    weekLabel: "W12",
    periodEnd: "2026-03-08",
    grossSales: 1_842_000,
    orders: 28_600,
    conversionRate: 7.6,
    newCustomers: 6_200,
    cac: 12.40,
    roas: 18.6,
    returnRate: 0.8,
    adSpend: 86_000,
    channels: { pushNotifications: 486_000, appAlerts: 382_000, email: 298_000, sms: 248_000, inStore: 224_000, organic: 118_000, direct: 86_000 },
    context: "Peak storm-prep week. 72-hour lockdown announced. Emergency reorders activated. 47 SKUs at critical stockout risk. Northeast DC under extreme pressure. Cold-chain integrity at risk.",
  },
  {
    week: 13,
    weekLabel: "W13",
    periodEnd: "2026-03-15",
    grossSales: 2_760_000,
    orders: 48_200,
    conversionRate: 8.4,
    newCustomers: 8_400,
    cac: 8.60,
    roas: 22.4,
    returnRate: 0.4,
    adSpend: 108_000,
    channels: { pushNotifications: 892_000, appAlerts: 684_000, email: 412_000, sms: 298_000, inStore: 186_000, organic: 168_000, direct: 120_000 },
    context: "Storm week. Record demand — $2.76M gross sales. On-time delivery dropped to 68.2%. DC in-stock at 84.6%. Fill rate at 78.4%. Emergency supplier activation in progress. Post-storm recovery planning underway.",
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
  const q1Weeks = WEEKLY_PERFORMANCE;
  const totalSales = q1Weeks.reduce((s, w) => s + w.grossSales, 0);
  const totalOrders = q1Weeks.reduce((s, w) => s + w.orders, 0);
  const totalNewCustomers = q1Weeks.reduce((s, w) => s + w.newCustomers, 0);
  const avgRoas = parseFloat((q1Weeks.reduce((s, w) => s + w.roas, 0) / q1Weeks.length).toFixed(2));
  const avgCac = parseFloat((q1Weeks.reduce((s, w) => s + w.cac, 0) / q1Weeks.length).toFixed(2));
  const peakWeek = q1Weeks.reduce((best, w) => (w.grossSales > best.grossSales ? w : best), q1Weeks[0]);
  const troughWeek = q1Weeks.reduce((worst, w) => (w.grossSales < worst.grossSales ? w : worst), q1Weeks[0]);
  return { totalSales, totalOrders, totalNewCustomers, avgRoas, avgCac, peakWeek, troughWeek, weekCount: q1Weeks.length };
}
