import { type NBAActionId } from "@/components/cdp/chat/chat-data";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type ActionSource = "team" | "agent";

export interface ReviewItem {
  id: string;
  title: string;
  action: string;
  segment: string;
  confidence: number;
  expectedLift: string;
  agentReason: string;
  requestedBy: string;
  requestedAt: string;
  status: ReviewStatus;
  actionId: NBAActionId;
  source: ActionSource;
}

export const ALL_ITEMS: ReviewItem[] = [
  // Team-submitted actions (storm response)
  {
    id: "review-1",
    title: "Emergency reorder — Water (Bulk Packs)",
    action: "Approve emergency reorder of 18,000 cases at Northeast DC",
    segment: "Storm-critical SKU — Water",
    confidence: 94,
    expectedLift: "Protects $72K revenue",
    agentReason: "Only 1.2 days cover remaining. Panic buying driving 280% demand surge. Pre-storm delivery window closes at 2:00 PM.",
    requestedBy: "Avery Parker",
    requestedAt: "2026-03-10T10:12:00.000Z",
    status: "pending",
    actionId: "boost-pmax",
    source: "team",
  },
  {
    id: "review-2",
    title: "Cold-chain conditional transport — Frozen Desserts",
    action: "Approve sub-4°C transport for 8,000 cases of frozen desserts to Northeast DC",
    segment: "Temperature-controlled goods",
    confidence: 91,
    expectedLift: "-60% spoilage risk",
    agentReason: "Power outage risk at Northeast DC. Transport must maintain below -2°C. Generator fuel resupply dispatched.",
    requestedBy: "Avery Parker",
    requestedAt: "2026-03-10T10:18:00.000Z",
    status: "pending",
    actionId: "launch-winback",
    source: "team",
  },
  {
    id: "review-3",
    title: "Demand surge forecast adjustment (+40%)",
    action: "Approve +40% demand uplift across all storm-critical categories",
    segment: "Emergency categories — 47 SKUs",
    confidence: 88,
    expectedLift: "+13.7% fill rate recovery",
    agentReason: "Weather-adjusted demand models project 40% uplift. Current forecast does not reflect storm-driven panic buying patterns.",
    requestedBy: "Riley Chen",
    requestedAt: "2026-03-10T10:22:00.000Z",
    status: "pending",
    actionId: "suppress-fb",
    source: "team",
  },
  {
    id: "review-4",
    title: "Emergency supplier activation — 4 backup suppliers",
    action: "Activate backup suppliers for water, batteries, first aid, and pet food",
    segment: "Storm-critical categories",
    confidence: 88,
    expectedLift: "-35% stockout risk",
    agentReason: "Primary supply chain disrupted by storm. Backup suppliers confirmed capacity — delivery via cleared routes within 24 hours.",
    requestedBy: "Riley Chen",
    requestedAt: "2026-03-10T10:29:00.000Z",
    status: "pending",
    actionId: "boost-pmax",
    source: "team",
  },
  {
    id: "review-5",
    title: "Last-mile delivery rerouting — Northeast",
    action: "Approve rerouting for 142 blocked delivery routes via cleared highways",
    segment: "Northeast storm zone deliveries",
    confidence: 82,
    expectedLift: "$145K delay cost avoidance",
    agentReason: "68% of planned delivery routes blocked by road closures. 3 alternative highway corridors still accessible.",
    requestedBy: "Dana Torres",
    requestedAt: "2026-03-10T10:36:00.000Z",
    status: "pending",
    actionId: "suppress-fb",
    source: "team",
  },
  // Agent-generated NBAs (storm response)
  {
    id: "nba-1",
    title: "Emergency Reorder — Batteries & Flashlights",
    action: "Approve emergency reorder of 14,000 units at Northeast DC — demand surge 320% above baseline",
    segment: "Storm-critical SKU — Batteries (14,000 units)",
    confidence: 94,
    expectedLift: "Protects $56K revenue",
    agentReason: "Only 0.8 days cover remaining. Demand surge 320% above baseline. No deferral recommended — critical need during 72-hour lockdown.",
    requestedBy: "Agent (Weather Intelligence)",
    requestedAt: "2026-03-10T09:45:00.000Z",
    status: "pending",
    actionId: "launch-winback",
    source: "agent",
  },
  {
    id: "nba-2",
    title: "Emergency Reorder — First Aid Kits",
    action: "Approve full quantity emergency reorder of 6,000 units — critical safety item",
    segment: "Storm-critical SKU — First Aid (6,000 units)",
    confidence: 92,
    expectedLift: "Protects $54K revenue",
    agentReason: "Only 1.4 days cover remaining. Critical safety item — full quantity approval recommended. Escalate if delivery not confirmed within 24 hours.",
    requestedBy: "Agent (Inventory Analysis)",
    requestedAt: "2026-03-10T09:50:00.000Z",
    status: "pending",
    actionId: "boost-pmax",
    source: "agent",
  },
  {
    id: "nba-3",
    title: "Generator Fuel Resupply — Northeast DC",
    action: "Dispatch emergency fuel resupply to Northeast DC — 18 hours remaining",
    segment: "Cold-chain infrastructure",
    confidence: 91,
    expectedLift: "Protects 4,200 frozen cases",
    agentReason: "Backup generator fuel at 18 hours. Power grid instability warning active. Fuel resupply must arrive before road closures at 2:00 PM.",
    requestedBy: "Agent (Cold-Chain Monitor)",
    requestedAt: "2026-03-10T09:55:00.000Z",
    status: "approved",
    actionId: "suppress-fb",
    source: "agent",
  },
  {
    id: "nba-4",
    title: "In-Store Pickup Redirect — 3,400 Orders",
    action: "Redirect delivery orders to in-store pickup at 26 open locations in storm periphery",
    segment: "Storm-zone delivery orders (3,400)",
    confidence: 86,
    expectedLift: "60% order recovery",
    agentReason: "3,400 delivery orders affected by road closures. 26 stores still open in storm periphery. Consumer app can push pickup notifications — 60% estimated acceptance.",
    requestedBy: "Agent (Logistics)",
    requestedAt: "2026-03-10T10:00:00.000Z",
    status: "pending",
    actionId: "launch-winback",
    source: "agent",
  },
  {
    id: "nba-5",
    title: "Post-Storm Recovery Restock Pre-Position",
    action: "Pre-position recovery inventory at Northeast DC for post-lockdown store reopening",
    segment: "Recovery inventory — all categories",
    confidence: 82,
    expectedLift: "+$340K recovery revenue",
    agentReason: "72-hour lockdown ends Friday. Historical storm events show 20-30% demand surge in first 48 hours after reopening. Pre-positioning now ensures availability.",
    requestedBy: "Agent (Demand Planning)",
    requestedAt: "2026-03-10T10:05:00.000Z",
    status: "rejected",
    actionId: "suppress-fb",
    source: "agent",
  },
];
