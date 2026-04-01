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
  // Team-submitted actions (original Action Queue)
  {
    id: "review-1",
    title: "Increase PMAX budget by 15%",
    action: "Raise daily budget for top-performing PMAX campaign",
    segment: "High intent shoppers",
    confidence: 91,
    expectedLift: "+8.2% conversion value",
    agentReason: "Recent ROAS trend is stable and below saturation threshold.",
    requestedBy: "Logan Pierce",
    requestedAt: "2026-03-10T10:12:00.000Z",
    status: "pending",
    actionId: "boost-pmax",
    source: "team",
  },
  {
    id: "review-2",
    title: "Launch churn win-back journey",
    action: "Trigger retention flow for lapsing VIP cohort",
    segment: "At-risk high LTV customers",
    confidence: 87,
    expectedLift: "-4.1% churn",
    agentReason: "Gap-to-purchase signal crossed threshold in top-value segment.",
    requestedBy: "Logan Pierce",
    requestedAt: "2026-03-10T10:18:00.000Z",
    status: "pending",
    actionId: "launch-winback",
    source: "team",
  },
  {
    id: "review-3",
    title: "Shift spend to search",
    action: "Move 12% paid social budget to branded search",
    segment: "Brand seekers",
    confidence: 84,
    expectedLift: "+6.0% ROAS",
    agentReason: "Search CPC dropped while branded conversion rate increased week-over-week.",
    requestedBy: "Riley Chen",
    requestedAt: "2026-03-10T10:22:00.000Z",
    status: "pending",
    actionId: "suppress-fb",
    source: "team",
  },
  {
    id: "review-4",
    title: "Expand lookalike audience",
    action: "Create 2% lookalike from recent high-value purchasers",
    segment: "Prospecting",
    confidence: 82,
    expectedLift: "+11% new customer rate",
    agentReason: "Acquisition scenario shows strongest incremental gain from modeled lookalikes.",
    requestedBy: "Riley Chen",
    requestedAt: "2026-03-10T10:29:00.000Z",
    status: "pending",
    actionId: "boost-pmax",
    source: "team",
  },
  {
    id: "review-5",
    title: "Reduce frequency cap",
    action: "Lower display frequency cap from 7 to 5",
    segment: "Display retargeting",
    confidence: 79,
    expectedLift: "+3.4% CTR",
    agentReason: "Fatigue indicators are rising in repeat-exposure cohorts.",
    requestedBy: "Logan Pierce",
    requestedAt: "2026-03-10T10:36:00.000Z",
    status: "pending",
    actionId: "suppress-fb",
    source: "team",
  },
  // Agent-generated NBAs (from demand planning)
  {
    id: "nba-1",
    title: "Reactivate At-Risk High Value Customers",
    action: "Send personalised win-back offer via email + retarget on Facebook Sale",
    segment: "At-Risk High Value (512 customers)",
    confidence: 94,
    expectedLift: "+18% retention",
    agentReason: "Detected 38-day purchase gap for 512 high-LTV customers. Historical data shows email + paid retargeting recovers 18% within 14 days.",
    requestedBy: "Agent (Demand)",
    requestedAt: "2026-03-10T09:45:00.000Z",
    status: "pending",
    actionId: "launch-winback",
    source: "agent",
  },
  {
    id: "nba-2",
    title: "Boost Google PMAX Budget – Norway",
    action: "Increase Google PMAX daily budget by 30% for Norway market",
    segment: "All Active Customers (18,400)",
    confidence: 88,
    expectedLift: "+£17K net profit/day",
    agentReason: "MMM attribution model shows PMAX is undersaturated. Moving £3K/day from TikTok Sale to PMAX projects +£17K net profit improvement.",
    requestedBy: "Agent (Demand)",
    requestedAt: "2026-03-10T09:50:00.000Z",
    status: "pending",
    actionId: "boost-pmax",
    source: "agent",
  },
  {
    id: "nba-3",
    title: "Suppress Wasteful Facebook Awareness Spend",
    action: "Reduce Facebook Awareness budget to zero – redirect to Facebook Sale",
    segment: "Awareness Audiences (11,899)",
    confidence: 91,
    expectedLift: "£2K cost saving/day",
    agentReason: "Facebook Awareness shows 0% attributed conversions for 6 consecutive weeks. Budget reallocation to Facebook Sale yields measurable epROAS.",
    requestedBy: "Agent (Commercial)",
    requestedAt: "2026-03-10T09:55:00.000Z",
    status: "approved",
    actionId: "suppress-fb",
    source: "agent",
  },
  {
    id: "nba-4",
    title: "Loyalty Reward for Brand Advocates",
    action: "Trigger loyalty discount email (15% off next purchase)",
    segment: "High-Value Loyalists (2,840)",
    confidence: 82,
    expectedLift: "+12% purchase frequency",
    agentReason: "Brand Advocates have 4.8 avg purchase frequency. A targeted loyalty incentive is projected to increase to 5.4x and raise LTV by £8.2K.",
    requestedBy: "Agent (Demand)",
    requestedAt: "2026-03-10T10:00:00.000Z",
    status: "pending",
    actionId: "launch-winback",
    source: "agent",
  },
  {
    id: "nba-5",
    title: "Pause TikTok Sale – Saturated Market",
    action: "Reduce TikTok Sale spend by 41% – reallocate to Google PMAX",
    segment: "TikTok Audiences (29,023)",
    confidence: 86,
    expectedLift: "+£105K net profit",
    agentReason: "TikTok Sale shows diminishing marginal returns above £17K/week. Saturation curve analysis indicates reallocation improves overall portfolio ROAS.",
    requestedBy: "Agent (Demand)",
    requestedAt: "2026-03-10T10:05:00.000Z",
    status: "rejected",
    actionId: "suppress-fb",
    source: "agent",
  },
];
