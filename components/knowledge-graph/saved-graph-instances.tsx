"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createKnowledgeGraphInstanceHref,
  useKnowledgeGraphInstances,
  type KnowledgeGraphInstance,
} from "@/lib/knowledge-graph-instances";
import { KNOWLEDGE_GRAPH_DOMAIN_LABELS } from "@/lib/knowledge-graph-data";
import { cn } from "@/lib/utils";
import { ArrowRight, Network, Trash2 } from "lucide-react";

const DOMAIN_BADGE_STYLES = {
  udp: "border-stone-200 bg-stone-50 text-stone-700",
  demand: "border-teal-200 bg-teal-50 text-teal-700",
  risk: "border-rose-200 bg-rose-50 text-rose-700",
  "cross-domain": "border-violet-200 bg-violet-50 text-violet-700",
} as const;

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function GraphInstanceRow({
  instance,
  showDelete,
  onDelete,
}: {
  instance: KnowledgeGraphInstance;
  showDelete?: boolean;
  onDelete?: (instanceId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px]", DOMAIN_BADGE_STYLES[instance.domain])}>
              {KNOWLEDGE_GRAPH_DOMAIN_LABELS[instance.domain]}
            </Badge>
            <Badge variant="outline" className="border-stone-200 bg-stone-50 text-[10px] text-stone-600">
              {instance.source === "chat" ? "Created in chat" : "Created from control tower"}
            </Badge>
            <span className="text-[10px] text-stone-400">Updated {timeAgo(instance.updatedAt)}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-stone-900">{instance.title}</p>
          <p className="mt-1 text-[11px] leading-snug text-stone-500">{instance.description || "No description provided."}</p>
          <p className="mt-2 text-[11px] text-stone-400">
            Created by {instance.createdBy}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button asChild size="sm" className="rounded-full bg-stone-900 px-3 text-[11px] hover:bg-stone-950">
            <Link href={createKnowledgeGraphInstanceHref(instance.id)}>
              Open graph
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full px-3 text-[11px]">
            <Link href="/dashboard/graphs">Open library</Link>
          </Button>
          {showDelete && onDelete ? (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full px-3 text-[11px] text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => onDelete(instance.id)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function isVisibleDemoGraphInstance(instance: KnowledgeGraphInstance) {
  return instance.domain !== "risk";
}

export function SavedGraphInstancesWidget({
  onCreateRequest,
}: {
  onCreateRequest: () => void;
}) {
  const { instances, isHydrated } = useKnowledgeGraphInstances();
  const recentInstances = useMemo(
    () => instances.filter(isVisibleDemoGraphInstance).slice(0, 4),
    [instances],
  );

  return (
    <Card className="border border-stone-200 bg-white/95 shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-stone-900">Saved Graphs</CardTitle>
            <p className="mt-1 text-sm text-stone-500">
              Shared graph workspaces created from the control tower or chat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full" onClick={onCreateRequest}>
              Create graph
            </Button>
            <Button asChild className="rounded-full bg-stone-900 hover:bg-stone-950">
              <Link href="/dashboard/graphs">View all</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isHydrated ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-6 text-sm text-stone-500">
            Loading saved graph workspaces...
          </div>
        ) : recentInstances.length > 0 ? (
          recentInstances.map((instance) => <GraphInstanceRow key={instance.id} instance={instance} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-6 text-center">
            <Network className="mx-auto h-6 w-6 text-stone-400" />
            <p className="mt-2 text-sm font-semibold text-stone-900">No saved graph workspaces yet</p>
            <p className="mt-1 text-[11px] text-stone-500">
              Create one from the control tower or from chat and it will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SavedGraphLibrary({
  onCreateRequest,
}: {
  onCreateRequest: () => void;
}) {
  const { instances, isHydrated, deleteInstance } = useKnowledgeGraphInstances();
  const visibleInstances = useMemo(
    () => instances.filter(isVisibleDemoGraphInstance),
    [instances],
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-16">
      <Card className="border border-stone-200 bg-white/95 shadow-none">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
              Control Tower
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
              Saved Graph Library
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-stone-500">
              Reopen shared graph investigations created from chat or from the control tower.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard">Back to control tower</Link>
            </Button>
            <Button className="rounded-full bg-stone-900 hover:bg-stone-950" onClick={onCreateRequest}>
              Create graph workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border border-stone-200 bg-white/95 shadow-none">
          <CardContent className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Total workspaces
            </p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{visibleInstances.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-stone-200 bg-white/95 shadow-none">
          <CardContent className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Chat-created
            </p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">
              {visibleInstances.filter((instance) => instance.source === "chat").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-stone-200 bg-white/95 shadow-none">
          <CardContent className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Control-tower-created
            </p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">
              {visibleInstances.filter((instance) => instance.source === "control_tower").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {!isHydrated ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-6 text-sm text-stone-500">
            Loading saved graph workspaces...
          </div>
        ) : visibleInstances.length > 0 ? (
          visibleInstances.map((instance) => (
            <GraphInstanceRow
              key={instance.id}
              instance={instance}
              showDelete
              onDelete={deleteInstance}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 px-4 py-8 text-center">
            <Network className="mx-auto h-6 w-6 text-stone-400" />
            <p className="mt-2 text-sm font-semibold text-stone-900">No saved graph workspaces</p>
            <p className="mt-1 text-[11px] text-stone-500">
              Create a graph from the control tower or use the guided chat flow to start the library.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
