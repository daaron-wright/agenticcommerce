/**
 * LLM Context Builder
 *
 * Compiles the demo's actual mock data into a structured text block that is
 * injected into the system prompt of every chat request. This keeps LLM
 * responses grounded in the numbers the UI is showing — not generic estimates.
 *
 * Import from real data sources only; no duplication of values.
 */

import { ecommerceDashboardData } from "./dashboard/mock-ecommerce";
import { WEEKLY_COMMERCIAL_REVIEW } from "./commercial-review";
import {
  CONTROL_TOWER_ALERTS,
  CONTROL_TOWER_HERO_METRICS,
  CONTROL_TOWER_DOMAIN_SUMMARIES,
} from "./control-tower-data";
import { CUSTOMERS, getSegmentSummary } from "./demo-data/customers";
import { WEEKLY_PERFORMANCE, MONTHLY_ROLLUPS, getQtdSummary } from "./demo-data/historical";
import { CATEGORIES, getCategoryTotals } from "./demo-data/categories";
import { INCREMENTALITY_EXPERIMENTS } from "./incrementality-data";

function fmt(n: number): string {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(0)}K`;
  return `£${n}`;
}

export function getDemoContext(): string {
  const sections: string[] = [];

  // ── Platform health ─────────────────────────────────────────────────────────
  const heroLines = CONTROL_TOWER_HERO_METRICS.map(
    (m) => `- ${m.label}: ${m.value} — ${m.detail}`
  ).join("\n");

  sections.push(`### Platform Health\n${heroLines}`);

  // ── Domain KPI summary ──────────────────────────────────────────────────────
  const domainLines = CONTROL_TOWER_DOMAIN_SUMMARIES.map((d) => {
    const kpiStr = d.kpis.map((k) => `${k.label}: ${k.value}${k.trendLabel ? ` (${k.trendLabel})` : ""}`).join(", ");
    return `- ${d.label} [${d.status}]: ${kpiStr}`;
  }).join("\n");

  sections.push(`### Domain KPI Summary\n${domainLines}`);

  // ── E-commerce KPIs ─────────────────────────────────────────────────────────
  const kpiLines = ecommerceDashboardData.kpis.map(
    (k) => `- ${k.label}: ${k.value} (${k.delta} ${k.subtext})${k.warning ? " ⚠ " + k.warning.message : ""}`
  ).join("\n");

  sections.push(`### E-Commerce KPIs (Last 30 Days)\n${kpiLines}`);

  // ── Channel performance ─────────────────────────────────────────────────────
  const channelHeader = "Channel | Sessions | Orders | Revenue | Conv%";
  const channelRows = ecommerceDashboardData.channels
    .filter((c) => c.orders > 0)
    .map(
      (c) =>
        `${c.channel} | ${(c.sessions / 1000).toFixed(0)}K | ${c.orders.toLocaleString()} | ${fmt(c.revenue)} | ${c.conversionRate}%`
    )
    .join("\n");

  sections.push(`### E-Commerce Channel Performance\n${channelHeader}\n${channelRows}`);

  // ── Top products ─────────────────────────────────────────────────────────────
  const productLines = ecommerceDashboardData.topProducts.map(
    (p) =>
      `- ${p.name} (${p.sku}): ${p.unitsSold.toLocaleString()} units, ${fmt(p.revenue)}, ${p.returnRate}% returns, Stock: ${p.stockStatus}${p.stockStatus === "Critical" ? " ⚠ CRITICAL STOCKOUT" : ""}`
  ).join("\n");

  sections.push(`### Top Products\n${productLines}`);

  // ── Operations ───────────────────────────────────────────────────────────────
  const opsLines = ecommerceDashboardData.operations.map(
    (o) => `- ${o.label}: ${o.value}${o.status === "risk" ? " ⚠ RISK" : o.status === "warning" ? " ⚠" : " ✓"}`
  ).join("\n");

  sections.push(`### Operations Metrics\n${opsLines}`);

  // ── Weekly commercial review KPIs ─────────────────────────────────────────
  const reviewPeriod = `${WEEKLY_COMMERCIAL_REVIEW.periodLabel} vs ${WEEKLY_COMMERCIAL_REVIEW.comparisonLabel}`;
  const reviewKpiLines = WEEKLY_COMMERCIAL_REVIEW.kpis.map(
    (k) => `- ${k.label}: ${k.value} (WoW ${k.wow}, YoY ${k.yoy}) [${k.status}]`
  ).join("\n");

  sections.push(`### Weekly Commercial Review — ${reviewPeriod}\n${reviewKpiLines}`);

  // ── Paid channel performance ─────────────────────────────────────────────
  const paidHeader = "Channel | Spend | Sales | ROAS | CAC | New Customers";
  const paidRows = WEEKLY_COMMERCIAL_REVIEW.paidChannelPerformance.map(
    (c) =>
      `${c.channel} | ${fmt(c.spend)} | ${fmt(c.grossSales)} | ${c.roas} | ${c.cac} | ${c.newCustomers} (${c.wowSales} WoW)`
  ).join("\n");

  sections.push(`### Paid Channel Performance\n${paidHeader}\n${paidRows}`);

  // ── Market breakdown ─────────────────────────────────────────────────────
  const marketLines = WEEKLY_COMMERCIAL_REVIEW.marketBreakdown.map(
    (m) => `- ${m.market}: ${fmt(m.grossSales)} (${m.wow} WoW), CAC ${m.cac}, ${m.newCustomers} new customers — ${m.note}`
  ).join("\n");

  sections.push(`### Regional Market Performance\n${marketLines}`);

  // ── AI recommendations ────────────────────────────────────────────────────
  const recLines = WEEKLY_COMMERCIAL_REVIEW.recommendations.slice(0, 4).map(
    (r, i) => `${i + 1}. [${r.priority.toUpperCase()}] ${r.title} — ${r.action} Impact: ${r.impact}`
  ).join("\n");

  sections.push(`### AI Recommendations (Commercial)\n${recLines}`);

  // ── Active control tower alerts ─────────────────────────────────────────
  const alertLines = CONTROL_TOWER_ALERTS.map(
    (a) =>
      `- [${a.domain}/${a.severity}] ${a.title} — ${a.description}`
  ).join("\n");

  sections.push(`### Active Control Tower Alerts (${CONTROL_TOWER_ALERTS.length} total)\n${alertLines}`);

  // ── Demand planning metrics (from domain summaries) ──────────────────────
  const demandDomain = CONTROL_TOWER_DOMAIN_SUMMARIES.find((d) => d.domain === "demand");
  if (demandDomain) {
    const demandLines = demandDomain.kpis.map(
      (k) => `- ${k.label}: ${k.value}${k.trendLabel ? ` (${k.trendLabel})` : ""}`
    ).join("\n");
    sections.push(`### Demand Planning Metrics\n${demandLines}`);
  }

  // ── Customer segment summary ──────────────────────────────────────────────
  const segSummary = getSegmentSummary();
  const segLines = segSummary.map(
    (s) => `- ${s.segment}: ${s.count} customers, avg LTV £${s.avgLTV.toLocaleString()}, total LTV £${s.totalLTV.toLocaleString()}`
  ).join("\n");
  const totalCustomers = segSummary.reduce((sum, s) => sum + s.count, 0);
  sections.push(`### Customer Segments (${totalCustomers} profiled)\n${segLines}`);

  // ── 13-week historical performance ───────────────────────────────────────
  const qtd = getQtdSummary();
  const qtdSummaryLines = [
    `- Period: W1 (w/e 21 Dec 2025) → W13 (w/e 15 Mar 2026), ${qtd.weekCount} weeks`,
    `- Total gross sales: ${fmt(qtd.totalSales)}, total orders: ${qtd.totalOrders.toLocaleString()}, new customers: ${qtd.totalNewCustomers.toLocaleString()}`,
    `- Avg ROAS: ${qtd.avgRoas}x, avg CAC: £${qtd.avgCac}`,
    `- Peak week: ${qtd.peakWeek.weekLabel} (w/e ${qtd.peakWeek.periodEnd}) — ${fmt(qtd.peakWeek.grossSales)} — ${qtd.peakWeek.context.split(".")[0]}`,
    `- Trough week: ${qtd.troughWeek.weekLabel} (w/e ${qtd.troughWeek.periodEnd}) — ${fmt(qtd.troughWeek.grossSales)} — ${qtd.troughWeek.context.split(".")[0]}`,
  ].join("\n");

  const monthlyLines = MONTHLY_ROLLUPS.map(
    (m) => `- ${m.month}: ${fmt(m.grossSales)} sales, ${m.orders.toLocaleString()} orders, ${m.newCustomers} new customers, avg ROAS ${m.avgRoas}x`
  ).join("\n");

  const recentWeeks = WEEKLY_PERFORMANCE.slice(-4);
  const recentHeader = "Week | Period End | Gross Sales | Orders | Conv% | ROAS | CAC";
  const recentRows = recentWeeks.map(
    (w) => `${w.weekLabel} | ${w.periodEnd} | ${fmt(w.grossSales)} | ${w.orders.toLocaleString()} | ${w.conversionRate}% | ${w.roas}x | £${w.cac}`
  ).join("\n");

  sections.push(`### 13-Week Performance Summary\n${qtdSummaryLines}\n\n**Monthly Rollup:**\n${monthlyLines}\n\n**Last 4 Weeks (${recentHeader}):**\n${recentRows}`);

  // ── Category P&L ─────────────────────────────────────────────────────────
  const catTotals = getCategoryTotals();
  const catSummaryLines = [
    `- Total category revenue: ${fmt(catTotals.totalRevenue)}, blended gross margin: ${catTotals.blendedMargin}%`,
    `- Highest margin: ${catTotals.highestMargin.name} (${catTotals.highestMargin.grossMargin}%)`,
    `- Lowest margin: ${catTotals.lowestMargin.name} (${catTotals.lowestMargin.grossMargin}%)`,
    `- Fastest growing YoY: ${catTotals.fastestGrowing.name} (+${catTotals.fastestGrowing.yoyGrowth}% YoY)`,
    `- Avg return rate across categories: ${catTotals.avgReturnRate}%`,
  ].join("\n");

  const catHeader = "Category | Revenue | Gross Margin% | Units | Return% | WoW | YoY | Cover (wks)";
  const catRows = CATEGORIES.map(
    (c) =>
      `${c.name} | ${fmt(c.revenue)} | ${c.grossMargin}% | ${c.units.toLocaleString()} | ${c.returnRate}% | ${c.wowGrowth > 0 ? "+" : ""}${c.wowGrowth}% | +${c.yoyGrowth}% | ${c.inventoryCover}`
  ).join("\n");

  const catNotes = CATEGORIES.filter((c) => c.notes.toLowerCase().includes("stockout") || c.trend === "down" || c.wowGrowth < -1)
    .map((c) => `- ${c.name}: ${c.notes}`)
    .join("\n");

  sections.push(`### Category P&L (Q1 YTD, 13 weeks)\n${catSummaryLines}\n\n${catHeader}\n${catRows}${catNotes ? `\n\n**Notable alerts:**\n${catNotes}` : ""}`);

  // ── Incrementality experiments ──────────────────────────────────────────
  const expHeader = "Experiment | Application | Status | Stage | Primary Metric | Key Result";
  const expRows = INCREMENTALITY_EXPERIMENTS.map((e) => {
    const topMetric = e.secondaryMetrics?.[0];
    return `${e.name} | ${e.scopeLabel} | ${e.status.replace("_", " ")} | ${e.stage} | ${e.primaryMetric} | ${topMetric ? `${topMetric.label}: ${topMetric.value}` : "—"}`;
  }).join("\n");

  const expNotes = INCREMENTALITY_EXPERIMENTS.map((e) => `- **${e.name}**: ${e.summary}`).join("\n");

  sections.push(`### Incrementality Experiments (${INCREMENTALITY_EXPERIMENTS.length} total)\n${expHeader}\n${expRows}\n\n**Summaries:**\n${expNotes}`);

  return sections.join("\n\n");
}
