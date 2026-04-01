"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import { useWorkflowEvents } from "@/lib/workflow-event-context";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EXECUTION_FLOWS, type NBAActionId } from "@/components/cdp/chat/chat-data";
import { addConfirmedAction } from "@/lib/confirmed-actions-store";

type ReviewStatus = "pending" | "approved" | "rejected";

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
}

const DUMMY_REVIEWS: ReviewItem[] = [
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
  },
];

export default function PendingReviewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { emitWorkflowEvent, resetDAG } = useWorkflowEvents();
  const [items, setItems] = useState<ReviewItem[]>(DUMMY_REVIEWS);
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
          <h2 className="text-2xl font-semibold tracking-tight">Pending Review</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated actions submitted by team members awaiting your approval before execution.
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

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="mt-1">{item.action}</CardDescription>
                </div>
                {item.status === "pending" ? (
                  <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Pending</Badge>
                ) : item.status === "approved" ? (
                  <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">Approved</Badge>
                ) : (
                  <Badge variant="outline" className="text-stone-700 border-stone-200 bg-stone-50">Dismissed</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div><span className="font-medium text-stone-700">Segment:</span> {item.segment}</div>
                <div><span className="font-medium text-stone-700">Confidence:</span> {item.confidence}%</div>
                <div><span className="font-medium text-stone-700">Expected Lift:</span> {item.expectedLift}</div>
                <div><span className="font-medium text-stone-700">Requested By:</span> {item.requestedBy}</div>
              </div>
              <p className="text-xs text-stone-600 mt-3">{item.agentReason}</p>
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

      {items.length === 0 && (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-stone-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">No pending actions</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                When team members without execution permissions send AI-recommended actions for review,
                they will appear here for your approval.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
