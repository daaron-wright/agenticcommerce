"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, ShieldCheck, Clock, CheckCircle2, XCircle, Zap, LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import { useWorkflowEvents } from "@/lib/workflow-event-context";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EXECUTION_FLOWS } from "@/components/cdp/chat/chat-data";
import { addConfirmedAction } from "@/lib/confirmed-actions-store";
import { ALL_ITEMS, type ReviewItem } from "@/lib/action-queue-data";

type FilterMode = "all" | "team" | "agent";
type ViewMode = "cards" | "table";

export default function PendingReviewPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { emitWorkflowEvent, resetDAG } = useWorkflowEvents();
  const [items, setItems] = useState<ReviewItem[]>(ALL_ITEMS);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
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
          <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#4CDD84' }} />
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
              <CheckCircle2 className="h-4 w-4" style={{ color: '#4CDD84' }} />
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

      {/* Filter tabs & view toggle */}
      <div className="flex items-center justify-between">
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
      <div className="flex items-center gap-1 rounded-lg border border-stone-200 p-0.5">
        <button
          onClick={() => setViewMode("cards")}
          className={cn(
            "rounded-md p-1.5 transition",
            viewMode === "cards" ? "bg-stone-800 text-white" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={cn(
            "rounded-md p-1.5 transition",
            viewMode === "table" ? "bg-stone-800 text-white" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <Table2 className="h-3.5 w-3.5" />
        </button>
      </div>
      </div>

      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30 text-left">
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Source</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Title</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Action</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Segment</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Confidence</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Expected Lift</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/20">
                      <td className="px-4 py-3">
                        {item.source === "agent" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-800 px-2 py-0.5">
                            <Zap className="h-2.5 w-2.5 text-white" />
                            <span className="text-[9px] font-semibold text-white">Agent</span>
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-stone-500 border-stone-200">Team</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-800">{item.title}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-stone-600">{item.action}</td>
                      <td className="px-4 py-3 text-stone-600">{item.segment}</td>
                      <td className="px-4 py-3 text-right font-medium text-teal-700">{item.confidence}%</td>
                      <td className="px-4 py-3 text-stone-600">{item.expectedLift}</td>
                      <td className="px-4 py-3">
                        {item.status === "pending" ? (
                          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-[10px]">Pending</Badge>
                        ) : item.status === "approved" ? (
                          <Badge variant="outline" className="border-[#4CDD84]/25 text-[10px]" style={{ color: '#4CDD84', backgroundColor: 'rgba(76,221,132,0.25)' }}>Approved</Badge>
                        ) : (
                          <Badge variant="outline" className="text-stone-700 border-stone-200 bg-stone-50 text-[10px]">Dismissed</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 border-[#4CDD84]/40 text-[#4CDD84] hover:bg-[#4CDD84]/10 hover:text-[#3bc774] text-[10px] px-2"
                            disabled={item.status !== "pending"}
                            onClick={() => handleApprove(item)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 text-[10px] px-2"
                            disabled={item.status !== "pending"}
                            onClick={() => handleReject(item)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                    <Badge variant="outline" className="border-[#4CDD84]/25" style={{ color: '#4CDD84', backgroundColor: 'rgba(76,221,132,0.25)' }}>Approved</Badge>
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
                <p className="text-[11px] mt-2 font-medium" style={{ color: '#4CDD84' }}>
                  Approved — moving to Confirmed Actions in 5 seconds.
                </p>
              )}

              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#4CDD84]/40 text-[#4CDD84] hover:bg-[#4CDD84]/10 hover:text-[#3bc774]"
                  disabled={item.status !== "pending"}
                  onClick={() => handleApprove(item)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
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

      )}

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
