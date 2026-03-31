"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Network } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import { getConfirmedActions, type ConfirmedActionRecord } from "@/lib/confirmed-actions-store";
import { useWorkflowEvents } from "@/lib/workflow-event-context";

const OPEN_DAG_EVENT = "kyn:open-dag-panel";

export default function ConfirmedActionsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { resetDAG, replayWorkflowEvents } = useWorkflowEvents();
  const [actions, setActions] = useState<ConfirmedActionRecord[]>([]);

  useEffect(() => {
    if (isAuthenticated && user && !hasPermissionForUser(user, "action_approve_review")) {
      router.replace("/analytics");
    }
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    setActions(getConfirmedActions());
  }, []);

  const totalEvents = useMemo(
    () => actions.reduce((sum, action) => sum + action.events.length, 0),
    [actions]
  );

  const handleReplay = (action: ConfirmedActionRecord) => {
    resetDAG();
    replayWorkflowEvents({
      replayId: `${action.id}-${Date.now()}`,
      events: action.events,
      title: action.title,
    });
    window.dispatchEvent(new CustomEvent(OPEN_DAG_EVENT));
  };

  if (!user || !hasPermissionForUser(user, "action_approve_review")) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Confirmed Actions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Approved actions with full stage histories ready to replay in the DAG view.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          {actions.length} confirmed
        </Badge>
      </div>

      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Stored timelines: <span className="font-semibold text-foreground">{totalEvents}</span> events across{" "}
          <span className="font-semibold text-foreground">{actions.length}</span> actions.
        </CardContent>
      </Card>

      <div className="space-y-3">
        {actions.map((action) => (
          <Card key={action.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="mt-1">{action.action}</CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                  Approved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-3">
                <div>
                  <span className="font-medium text-slate-700">Segment:</span> {action.segment}
                </div>
                <div>
                  <span className="font-medium text-slate-700">Confidence:</span> {action.confidence}%
                </div>
                <div>
                  <span className="font-medium text-slate-700">Expected Lift:</span> {action.expectedLift}
                </div>
                <div>
                  <span className="font-medium text-slate-700">Approved:</span>{" "}
                  {new Date(action.approvedAt).toLocaleString()}
                </div>
              </div>
              <Button size="sm" onClick={() => handleReplay(action)} className="gap-2">
                <Network className="h-4 w-4" />
                Open DAG Replay
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {actions.length === 0 && (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            No confirmed actions yet. Approve an item in Pending Review to build replay history.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
