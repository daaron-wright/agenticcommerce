"use client";

import Link from "next/link";
import { createContext, useContext, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Ai } from "@carbon/icons-react";
import { SnapshotCard } from "./snapshot-card";
import { CommercialReviewCard } from "./commercial-review-card";
import { ExecutionPreviewCard } from "./execution-preview-card";
import type { NBAActionId, ReportCardType, SnapshotType } from "./chat-data";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sourceTag?: string;
  warningActionId?: string;
  snapshots?: SnapshotType[];
  reportCard?: ReportCardType;
  status?: "streaming" | "complete";
  agentSteps?: string[];
  actions?: Array<{ label: string; href: string }>;
  linkedExperimentId?: string;
  linkedExperimentHref?: string;
  linkedAudienceLabel?: string;
  linkedControlLabel?: string;
  linkedScopeLabel?: string;
  executionPreview?: {
    actionId: NBAActionId;
    title: string;
    iframeSrc: string;
  };
}

// ── Highlight hover context ──────────────────────────────────────────────────

interface HighlightCtx {
  hoveredSnapshot: SnapshotType | null;
  hoveredBoldIdx: number | null;
  boldToSnapshot: Map<number, SnapshotType>;
  snapshotToBolds: Map<SnapshotType, number[]>;
  setHoveredSnapshot: (t: SnapshotType | null) => void;
  setHoveredBoldIdx: (i: number | null) => void;
}

export const HighlightContext = createContext<HighlightCtx>({
  hoveredSnapshot: null,
  hoveredBoldIdx: null,
  boldToSnapshot: new Map(),
  snapshotToBolds: new Map(),
  setHoveredSnapshot: () => {},
  setHoveredBoldIdx: () => {},
});

// ── Keyword → snapshot type mapping ──────────────────────────────────────────

const KEYWORD_SNAPSHOT_RULES: [RegExp, SnapshotType][] = [
  // Scenario-specific (must come first — more specific)
  [/maximize short-term profit/i, "scenario-profit"],
  [/aggressive customer acquisition/i, "scenario-acquisition"],
  [/defend high-value segment/i, "scenario-retention"],
  // Execution
  [/executed successfully/i, "nba-execution"],
  // Tab-level
  [/campaign|pmax|facebook awareness|tiktok|ad sets|email sequence|retargeting|creative assets/i, "campaigns"],
  [/mmm|marketing mix|channel|saturation|undersaturated|diminishing returns|budget change|north of england|strongest market|market/i, "mmm"],
  [/audience|segment|at-risk|high-ltv|prospect|loyalist/i, "audiences"],
  [/customer|ltv|purchase gap|churn|brand advocates/i, "customers"],
  [/analytics|trend|session|conversion rate|anomal|mobile traffic|gross sales/i, "analytics"],
  [/report|spend|return|roas.*blended|weekly commercial review|cac|paid channel/i, "reports"],
  [/revenue|roas|dashboard|overview|month-over-month/i, "dashboard"],
  [/current.*(state|trajectory)/i, "current-state"],
];

function matchBoldToSnapshot(boldText: string, availableSnapshots: SnapshotType[]): SnapshotType | null {
  for (const [regex, snapshotType] of KEYWORD_SNAPSHOT_RULES) {
    if (regex.test(boldText) && availableSnapshots.includes(snapshotType)) {
      return snapshotType;
    }
  }
  return null;
}

function buildMappings(content: string, snapshots: SnapshotType[]) {
  const boldToSnapshot = new Map<number, SnapshotType>();
  const snapshotToBolds = new Map<SnapshotType, number[]>();

  // Extract bold phrases in order
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  let boldIdx = 0;
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      const text = part.slice(2, -2);
      const matched = matchBoldToSnapshot(text, snapshots);
      if (matched) {
        boldToSnapshot.set(boldIdx, matched);
        const existing = snapshotToBolds.get(matched) || [];
        existing.push(boldIdx);
        snapshotToBolds.set(matched, existing);
      }
      boldIdx++;
    }
  }

  return { boldToSnapshot, snapshotToBolds };
}

// ── Render markdown with interactive highlights ──────────────────────────────

function InteractiveBold({ text, index }: { text: string; index: number }) {
  const { hoveredSnapshot, hoveredBoldIdx, boldToSnapshot, setHoveredBoldIdx } =
    useContext(HighlightContext);

  const mySnapshot = boldToSnapshot.get(index);
  const isDirectHover = hoveredBoldIdx === index;

  // Highlight if: this bold's snapshot is being hovered from the card side,
  // OR if another bold text maps to the same snapshot and is hovered
  const isLinked =
    mySnapshot != null &&
    (hoveredSnapshot === mySnapshot ||
      (hoveredBoldIdx !== null &&
        hoveredBoldIdx !== index &&
        boldToSnapshot.get(hoveredBoldIdx) === mySnapshot));

  const isActive = isDirectHover || isLinked;
  const hasMapping = mySnapshot != null;

  return (
    <strong
      className={cn(
        "font-semibold transition-all duration-200 rounded-sm",
        hasMapping && "cursor-pointer",
        isActive
          ? "bg-slate-700/10 text-slate-900 ring-1 ring-slate-400/30 px-0.5 -mx-0.5"
          : ""
      )}
      onMouseEnter={() => hasMapping && setHoveredBoldIdx(index)}
      onMouseLeave={() => hasMapping && setHoveredBoldIdx(null)}
    >
      {text}
    </strong>
  );
}

function renderMarkdownInteractive(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  let boldIdx = 0;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const idx = boldIdx++;
      return <InteractiveBold key={i} text={part.slice(2, -2)} index={idx} />;
    }
    return part;
  });
}

// ── ChatMessage ──────────────────────────────────────────────────────────────

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";

  const [hoveredSnapshot, setHoveredSnapshot] = useState<SnapshotType | null>(null);
  const [hoveredBoldIdx, setHoveredBoldIdx] = useState<number | null>(null);

  const { boldToSnapshot, snapshotToBolds } = useMemo(() => {
    if (!message.snapshots || message.snapshots.length === 0) {
      return { boldToSnapshot: new Map<number, SnapshotType>(), snapshotToBolds: new Map<SnapshotType, number[]>() };
    }
    return buildMappings(message.content, message.snapshots);
  }, [message.content, message.snapshots]);

  const ctxValue = useMemo<HighlightCtx>(
    () => ({
      hoveredSnapshot,
      hoveredBoldIdx,
      boldToSnapshot,
      snapshotToBolds,
      setHoveredSnapshot,
      setHoveredBoldIdx,
    }),
    [hoveredSnapshot, hoveredBoldIdx, boldToSnapshot, snapshotToBolds]
  );

  const hasSnapshots = message.snapshots && message.snapshots.length > 0 && message.status === "complete";

  return (
    <HighlightContext.Provider value={ctxValue}>
      <div
        className={cn(
          "flex gap-3 w-full",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        {/* Avatar - assistant only */}
        {!isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
              <Ai size={16} />
            </div>
          </div>
        )}

        <div
          className={cn(
            "max-w-[75%] space-y-3",
            isUser ? "items-end" : "items-start"
          )}
        >
          {/* Message bubble */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "bg-slate-800 text-white rounded-br-md"
                : "bg-slate-100 text-slate-900 rounded-bl-md border border-slate-200"
            )}
          >
            <p className="whitespace-pre-wrap">
              {hasSnapshots
                ? renderMarkdownInteractive(message.content)
                : renderMarkdownPlain(message.content)}
              {isStreaming && (
                <span className="inline-block w-[2px] h-4 bg-slate-500 ml-0.5 align-middle animate-pulse" />
              )}
            </p>
          </div>

          {/* Snapshot cards */}
          {message.status === "complete" && message.reportCard === "weekly-commercial-review" && (
            <CommercialReviewCard />
          )}

          {message.executionPreview && !isUser && (
            <ExecutionPreviewCard
              title={message.executionPreview.title}
              iframeSrc={message.executionPreview.iframeSrc}
            />
          )}

          {!isUser && message.linkedExperimentHref ? (
            <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Experiment-Backed Launch
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Draft A/B experiment created for this execution.
                  </p>
                </div>
                <Link
                  href={message.linkedExperimentHref}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Open experiment
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {message.linkedAudienceLabel ? (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
                    Treatment: {message.linkedAudienceLabel}
                  </span>
                ) : null}
                {message.linkedControlLabel ? (
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700">
                    Holdout: {message.linkedControlLabel}
                  </span>
                ) : null}
                {message.linkedScopeLabel ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                    Scope: {message.linkedScopeLabel}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {hasSnapshots && (
            <div className="space-y-2 w-full">
              {message.snapshots!.map((type) => (
                <SnapshotCard key={type} type={type} />
              ))}
            </div>
          )}

          {message.actions && message.actions.length > 0 && message.status === "complete" && (
            <div className="flex flex-wrap gap-2">
              {message.actions.map((action) => (
                <Link
                  key={`${message.id}-${action.href}-${action.label}`}
                  href={action.href}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div
            className={cn(
              "px-1 flex items-center gap-2",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            {isUser && message.sourceTag ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {message.sourceTag}
              </span>
            ) : null}
            <p className="text-[10px] text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Avatar - user only */}
        {isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="h-8 w-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </HighlightContext.Provider>
  );
}

// Plain markdown for messages without snapshots (user messages, streaming, etc.)
function renderMarkdownPlain(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
