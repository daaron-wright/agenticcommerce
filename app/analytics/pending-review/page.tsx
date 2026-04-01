"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, ShieldCheck, Clock, CheckCircle2, XCircle, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import { useWorkflowEvents } from "@/lib/workflow-event-context";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EXECUTION_FLOWS, type NBAActionId } from "@/components/cdp/chat/chat-data";
import { addConfirmedAction } from "@/lib/confirmed-actions-store";

type ReviewStatus = "pending" | "approved" | "rejected";
type ActionSource = "team" | "agent";

interface ReviewItem {
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

const ALL_ITEMS: ReviewItem[] = [
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

type FilterMode = "all" | "team" | "agent";

export default function PendingReviewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { emitWorkflowEvent, resetDAG } = useWorkflowEvents();
  const [items, setItems] = useState<ReviewItem[]>(ALL_ITEMS);
  const [filter, setFilter] = useState<FilterMode>("all");
  const hasResetForSessionRef = useRef(false);
  const scheduledTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      scheduledTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      scheduledTimeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && !hasPermissionForUser(user, "action_approve_review")) {
      router.replace("/analytics");
    }
  }, [user, isAuthenticated, router]);

  const stats = useMemo(() => {
    const pending = items.filter((item) => item.status === "pending").length;
    const approved = items.filter((item) => item.status === "approved").length;
    const rejected = items.filter((item) => item.status === "rejected").length;
    return { pending, approved, rejected };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.source === filter);
  }, [items, filter]);

  const ensureFreshPendingReviewDAG = () => {
    if (!hasResetForSessionRef.current) {
      hasResetForSessionRef.current = true;
      resetDAG();
    }
  };

  const handleApprove = (item: ReviewItem) => {
    setItems((prev) => prev.map((review) => (review.id === item.id ? { ...review, status: "approved" } : review)));

    ensureFreshPendingReviewDAG();
    const flow = EXECUTION_FLOWS[item.actionId];
    const events = [
      `REVIEW_APPROVED: ${item.title}`,
      `REVIEW_EXECUTING: ${item.title}`,
      ...flow.agentSteps,
      ...flow.snapshots,
    ];

    addConfirmedAction({
      id: item.id,
      title: item.title,
      action: item.action,
      segment: item.segment,
      confidence: item.confidence,
      expectedLift: item.expectedLift,
      requestedBy: item.requestedBy,
      requestedAt: item.requestedAt,
      approvedAt: new Date().toISOString(),
      actionId: item.actionId,
      events,
    });

    const branchEvent = (event: string) => `PENDING_APPROVAL_FLOW|${item.id}|${event}`;

    emitWorkflowEvent(branchEvent(events[0]));

    const reviewExecutingTimeout = window.setTimeout(() => emitWorkflowEvent(branchEvent(events[1])), 700);
    scheduledTimeoutsRef.current.push(reviewExecutingTimeout);

    flow.agentSteps.forEach((step, index) => {
      const timeoutId = window.setTimeout(() => emitWorkflowEvent(branchEvent(step)), 1400 + index * 700);
      scheduledTimeoutsRef.current.push(timeoutId);
    });

    flow.snapshots.forEach((snapshot, index) => {
      const timeoutId = window.setTimeout(
        () => emitWorkflowEvent(branchEvent(snapshot)),
        1400 + flow.agentSteps.length * 700 + index * 500
      );
      scheduledTimeoutsRef.current.push(timeoutId);
    });

    const removeTimeout = window.setTimeout(() => {
      setItems((prev) => prev.filter((review) => review.id !== item.id));
    }, 5000);
    scheduledTimeoutsRef.current.push(removeTimeout);
  };

  const handleReject = (item: ReviewItem) => {
    setItems((prev) => prev.map((review) => (review.id === item.id ? { ...review, status: "rejected" } : review)));

    ensureFreshPendingReviewDAG();
    emitWorkflowEvent(`REVIEW_EXAMINING: ${item.title}`);
    setTimeout(() => emitWorkflowEvent(`REVIEW_REJECTED: ${item.title}`), 700);
  };

  if (!user || !hasPermissionForUser(user, "action_approve_review")) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Action Queue</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Team-submitted actions and agent-generated recommendations awaiting your approval.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Review permissions active
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">Pending</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">Approved (today)</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-2xl font-bold">{stats.approved}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardDescription className="text-xs">Dismissed (today)</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-stone-500" />
              <span className="text-2xl font-bold">{stats.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {([
          { key: "all" as FilterMode, label: "All" },
          { key: "team" as FilterMode, label: "Team Submitted" },
          { key: "agent" as FilterMode, label: "Agent NBAs" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === key
                ? "bg-stone-800 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {label}
            <span className="ml-1.5 text-[10px] opacity-70">
              ({key === "all" ? items.length : items.filter((i) => i.source === key).length})
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {item.source === "agent" && (
                    <div className="mt-0.5 rounded-md bg-stone-800 p-1.5 shrink-0">
                      <Zap className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="mt-1">{item.action}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] text-stone-500 border-stone-200">
                    {item.source === "agent" ? "Agent NBA" : "Team"}
                  </Badge>
                  {item.status === "pending" ? (
                    <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Pending</Badge>
                  ) : item.status === "approved" ? (
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">Approved</Badge>
                  ) : (
                    <Badge variant="outline" className="text-stone-700 border-stone-200 bg-stone-50">Dismissed</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div><span className="font-medium text-stone-700">Segment:</span> {item.segment}</div>
                <div><span className="font-medium text-stone-700">Confidence:</span> {item.confidence}%</div>
                <div><span className="font-medium text-stone-700">Expected Lift:</span> {item.expectedLift}</div>
                <div><span className="font-medium text-stone-700">Requested By:</span> {item.requestedBy}</div>
              </div>
              <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Agent Reasoning</p>
                <p className="text-xs text-stone-600">{item.agentReason}</p>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Requested at {new Date(item.requestedAt).toLocaleTimeString()}</p>
              {item.status === "approved" && (
                <p className="text-[11px] text-emerald-700 mt-2 font-medium">
                  Approved — moving to Confirmed Actions in 5 seconds.
                </p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={item.status !== "pending"}
                  onClick={() => handleApprove(item)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={item.status !== "pending"}
                  onClick={() => handleReject(item)}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-stone-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">No actions in this view</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {filter === "all"
                  ? "When team members or agents submit actions for review, they will appear here."
                  : filter === "team"
                    ? "No team-submitted actions are pending."
                    : "No agent-generated recommendations are pending."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
