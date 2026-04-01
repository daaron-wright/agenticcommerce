"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  KNOWLEDGE_GRAPH_DOMAIN_LABELS,
  KNOWLEDGE_GRAPH_NODE_TYPE_LABELS,
  type KnowledgeGraphNode,
} from "@/lib/knowledge-graph-data";
import { ArrowRight, Route } from "lucide-react";

export function KnowledgeGraphNodeInspector({
  node,
  relatedNodes,
  onSelectNode,
}: {
  node: KnowledgeGraphNode | null;
  relatedNodes: KnowledgeGraphNode[];
  onSelectNode: (nodeId: string) => void;
}) {
  if (!node) {
    return (
      <Card className="rounded-[24px] border border-stone-200 bg-white/95 shadow-none">
        <CardContent className="flex min-h-[280px] items-center justify-center p-6 text-center">
          <div className="max-w-sm space-y-2">
            <p className="text-sm font-semibold text-stone-900">Select a node to inspect it</p>
            <p className="text-sm text-stone-500">
              The inspector will show the node summary, attributes, connected context, and deep
              links back into the relevant module.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[24px] border border-stone-200 bg-white/95 shadow-none">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {KNOWLEDGE_GRAPH_DOMAIN_LABELS[node.domain]}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {KNOWLEDGE_GRAPH_NODE_TYPE_LABELS[node.type]}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-lg font-semibold text-stone-900">{node.label}</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">{node.summary}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Key attributes
          </p>
          <div className="mt-3 space-y-2">
            {node.attributes.map((attribute) => (
              <div
                key={`${node.id}-${attribute.label}`}
                className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50/80 px-3 py-2.5"
              >
                <span className="text-xs text-stone-500">{attribute.label}</span>
                <span className="text-xs font-semibold text-stone-800">{attribute.value}</span>
              </div>
            ))}
          </div>
        </div>

        {relatedNodes.length > 0 ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Connected context
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedNodes.slice(0, 8).map((relatedNode) => (
                <button
                  key={relatedNode.id}
                  onClick={() => onSelectNode(relatedNode.id)}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
                >
                  {relatedNode.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {node.suggestedActions && node.suggestedActions.length > 0 ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Suggested next actions
            </p>
            <div className="mt-3 space-y-2">
              {node.suggestedActions.map((action) => (
                <Link
                  key={`${node.id}-${action.label}`}
                  href={action.href}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-4 w-4 text-stone-400" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            <Route className="h-3.5 w-3.5" />
            Module drilldown
          </div>
          <p className="mt-2 text-sm text-stone-600">
            Route from this graph explanation back into the operational surface where the action is
            taken.
          </p>
          <Button asChild className="mt-3 h-9 rounded-full bg-stone-900 px-4 text-xs hover:bg-stone-950">
            <Link href={node.routeHref}>{node.routeLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
