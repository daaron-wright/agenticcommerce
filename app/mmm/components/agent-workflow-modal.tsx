"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DAGVisualization } from "@/components/dag";
import { useAuth } from "@/lib/auth-context";
import { getUserJourneyState } from "@/lib/journey-state";
import { useMemo } from "react";

interface AgentWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentWorkflowModal({ open, onOpenChange }: AgentWorkflowModalProps) {
  const { user } = useAuth();
  const journeyState = user ? getUserJourneyState(user.username) : "discovery";

  const dagProps = useMemo(() => {
    if (!user) return {};
    if (user.role === "super_admin") {
      return { isMarketingPersonaUseCase: true };
    }
    if (user.role === "marketing_admin") {
      return { isMarketingPersonaUseCase: true };
    }
    if (user.role === "data_admin") {
      return { isDataAdminUseCase: true };
    }
    if (user.role === "service_agent") {
      return { isServiceAdminUseCase: true };
    }
    return {};
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full md:max-w-6xl h-[85vh] flex flex-col p-6">
        <DialogHeader className="shrink-0 mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">Agentic MMM Workflow Pipeline</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Role-aware DAG view based on current journey state: {journeyState}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 w-full relative min-h-0 overflow-hidden rounded-lg">
          <DAGVisualization messageId={`${user?.role ?? "guest"}-${journeyState}-mmm-modal`} {...dagProps} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
