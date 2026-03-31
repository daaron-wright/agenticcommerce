"use client";

import { useEffect, useCallback } from "react";
import { MessageSquare, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useArtifacts, type ArtifactCategory, type ChatArtifact } from "@/lib/artifact-store";
import { useWorkflowEvents } from "@/lib/workflow-event-context";
import Link from "next/link";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const OPEN_DAG_EVENT = "kyn:open-dag-panel";

export function RecentFromChat({ category }: { category: ArtifactCategory }) {
  const { getByCategory, markSeen } = useArtifacts();
  const { resetDAG, replayWorkflowEvents } = useWorkflowEvents();
  const artifacts = getByCategory(category);

  const handleArtifactClick = useCallback(
    (artifact: ChatArtifact) => {
      if (artifact.workflowEvents?.length) {
        resetDAG();
        replayWorkflowEvents({
          replayId: `${artifact.id}-${Date.now()}`,
          events: artifact.workflowEvents,
          title: artifact.title,
          targetPath: "/chat",
        });
        window.dispatchEvent(new CustomEvent(OPEN_DAG_EVENT));
      }
    },
    [resetDAG, replayWorkflowEvents],
  );

  // Mark as seen when the component mounts (user is viewing the tab)
  useEffect(() => {
    if (artifacts.some((a) => !a.seen)) {
      markSeen(category);
    }
  }, [category, artifacts, markSeen]);

  if (artifacts.length === 0) return null;

  return (
    <Card className="border border-primary/20 bg-primary/[0.02] shadow-none">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-3 w-3 text-primary" />
          </div>
          <h3 className="text-xs font-semibold text-foreground">Recent from chat</h3>
          <span className="text-[10px] text-muted-foreground">
            {artifacts.length} {artifacts.length === 1 ? "item" : "items"}
          </span>
        </div>
        <ul className="space-y-0">
          {artifacts.slice(0, 5).map((artifact) => (
            <li
              key={artifact.id}
              className="flex gap-3 py-2 border-b last:border-0 border-border/50"
            >
              <div className="mt-0.5 shrink-0">
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-semibold text-foreground">
                    {artifact.title}
                  </span>
                  {!artifact.seen && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                  {artifact.summary}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(artifact.timestamp)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <Link
                    href="/chat"
                    prefetch={false}
                    onClick={() => handleArtifactClick(artifact)}
                    className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                  >
                    View in chat <ArrowRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
                {artifact.chatPrompt && (
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 italic truncate">
                    &ldquo;{artifact.chatPrompt}&rdquo;
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        {artifacts.length > 5 && (
          <Link
            href="/chat"
            prefetch={false}
            className="block text-center text-[10px] text-primary hover:underline mt-2"
          >
            View all {artifacts.length} items in chat
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
