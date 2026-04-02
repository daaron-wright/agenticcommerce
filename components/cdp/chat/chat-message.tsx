"use client";

import Link from "next/link";
import { createContext, useContext, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { User, ThumbsUp, ThumbsDown, Wrench, ChevronDown, ChevronRight, Check, Loader2, ArrowRight, Activity } from "lucide-react";
import { Ai } from "@carbon/icons-react";
import { SnapshotCard } from "./snapshot-card";
import { CommercialReviewCard } from "./commercial-review-card";
import { ExecutionPreviewCard } from "./execution-preview-card";
import type { NBAActionId, ReportCardType, SnapshotType } from "./chat-data";

// ── Tool Call types ──────────────────────────────────────────────────────────

export interface ToolCall {
  id: string;
  name: string;
  args: string;
  result?: string;
  status: "running" | "complete";
}

// ── Activity Card types ──────────────────────────────────────────────────────

export interface ActivityCard {
  type: "PLAN" | "SEARCH" | "ANALYZE" | "EXECUTE" | "SYNC";
  title: string;
  items: Array<{ label: string; status: "pending" | "done" | "active" }>;
}

// ── State Sync Event types ───────────────────────────────────────────────────

export interface StateSyncEvent {
  target: string;
  field: string;
  before: string;
  after: string;
}

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
  toolCalls?: ToolCall[];
  activityCard?: ActivityCard;
  stateSyncEvents?: StateSyncEvent[];
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
          ? "bg-stone-700/10 text-stone-800 ring-1 ring-stone-400/30 px-0.5 -mx-0.5"
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

// ── Feedback Row ─────────────────────────────────────────────────────────────

function FeedbackRow() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 mt-1">
        <Check className="h-3 w-3" />
        Feedback recorded
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            setFeedback("up");
            if (!showInput) setSubmitted(true);
          }}
          className={cn(
            "p-1 rounded transition-colors",
            feedback === "up"
              ? "text-emerald-600 bg-emerald-50"
              : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
          )}
          title="Helpful"
        >
          <ThumbsUp className="h-3 w-3" />
        </button>
        <button
          onClick={() => {
            setFeedback("down");
            setShowInput(true);
          }}
          className={cn(
            "p-1 rounded transition-colors",
            feedback === "down"
              ? "text-red-500 bg-red-50"
              : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
          )}
          title="Not helpful"
        >
          <ThumbsDown className="h-3 w-3" />
        </button>
      </div>
      {showInput && (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="What could be improved?"
            className="flex-1 text-[10px] rounded border border-stone-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-stone-300"
            autoFocus
          />
          <button
            onClick={() => setSubmitted(true)}
            className="text-[10px] px-2 py-1 rounded bg-stone-700 text-white hover:bg-stone-800 transition-colors"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tool Call Card ───────────────────────────────────────────────────────────

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = toolCall.status === "running";

  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-stone-50 transition-colors"
      >
        <div className={cn(
          "p-1 rounded",
          isRunning ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
        )}>
          {isRunning ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Wrench className="h-3 w-3" />
          )}
        </div>
        <span className="text-[11px] font-medium text-stone-700 flex-1">
          {toolCall.name}
        </span>
        <span className={cn(
          "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
          isRunning
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700"
        )}>
          {isRunning ? "Running" : "Complete"}
        </span>
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-stone-400" />
        ) : (
          <ChevronRight className="h-3 w-3 text-stone-400" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-stone-100 px-3 py-2 space-y-1.5">
          <div>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">Args</span>
            <pre className="text-[10px] text-stone-600 mt-0.5 whitespace-pre-wrap font-mono bg-stone-50 rounded p-1.5">
              {toolCall.args}
            </pre>
          </div>
          {toolCall.result && (
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400">Result</span>
              <pre className="text-[10px] text-stone-600 mt-0.5 whitespace-pre-wrap font-mono bg-stone-50 rounded p-1.5">
                {toolCall.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Activity Card ────────────────────────────────────────────────────────────

const ACTIVITY_TYPE_COLORS: Record<ActivityCard["type"], { bg: string; text: string; icon: string }> = {
  PLAN:    { bg: "bg-blue-50",    text: "text-blue-700",    icon: "text-blue-500" },
  SEARCH:  { bg: "bg-violet-50",  text: "text-violet-700",  icon: "text-violet-500" },
  ANALYZE: { bg: "bg-amber-50",   text: "text-amber-700",   icon: "text-amber-500" },
  EXECUTE: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
  SYNC:    { bg: "bg-sky-50",     text: "text-sky-700",     icon: "text-sky-500" },
};

function ActivityCardView({ card }: { card: ActivityCard }) {
  const style = ACTIVITY_TYPE_COLORS[card.type];

  return (
    <div className={cn("rounded-lg border px-3 py-2.5", style.bg, "border-stone-200")}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className={cn("h-3.5 w-3.5", style.icon)} />
        <span className={cn("text-[11px] font-semibold", style.text)}>
          {card.title}
        </span>
        <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full", style.bg, style.text)}>
          {card.type}
        </span>
      </div>
      <div className="space-y-1 ml-1">
        {card.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            {item.status === "done" ? (
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
            ) : item.status === "active" ? (
              <Loader2 className="h-3 w-3 text-amber-500 animate-spin shrink-0" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-stone-300 shrink-0" />
            )}
            <span className={cn(
              item.status === "done" ? "text-stone-500 line-through" :
              item.status === "active" ? "text-stone-700 font-medium" :
              "text-stone-400"
            )}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── State Sync Events ────────────────────────────────────────────────────────

function StateSyncView({ events }: { events: StateSyncEvent[] }) {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50/50 px-3 py-2.5">
      <div className="flex items-center gap-2 mb-2">
        <ArrowRight className="h-3.5 w-3.5 text-sky-500" />
        <span className="text-[11px] font-semibold text-sky-700">State Updated</span>
      </div>
      <div className="space-y-1.5">
        {events.map((evt, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <span className="text-stone-500 font-medium shrink-0">{evt.target}</span>
            <span className="text-stone-400">&middot;</span>
            <span className="text-stone-600">{evt.field}:</span>
            <span className="text-red-500 line-through">{evt.before}</span>
            <ArrowRight className="h-2.5 w-2.5 text-stone-400 shrink-0" />
            <span className="text-emerald-600 font-semibold">{evt.after}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ChatMessage ──────────────────────────────────────────────────────────────

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isComplete = message.status === "complete";

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
            <div className="h-8 w-8 rounded-lg bg-stone-700 text-white flex items-center justify-center">
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
          {/* Inline tool call cards (before the message bubble) */}
          {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
            <div className="space-y-1.5 w-full">
              {message.toolCalls.map((tc) => (
                <ToolCallCard key={tc.id} toolCall={tc} />
              ))}
            </div>
          )}

          {/* Message bubble */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "bg-stone-700 text-white rounded-br-md"
                : "bg-stone-100 text-stone-800 rounded-bl-md border border-stone-200"
            )}
          >
            <p className="whitespace-pre-wrap">
              {hasSnapshots
                ? renderMarkdownInteractive(message.content)
                : renderMarkdownPlain(message.content)}
              {isStreaming && (
                <span className="inline-block w-[2px] h-4 bg-stone-500 ml-0.5 align-middle animate-pulse" />
              )}
            </p>
          </div>

          {/* Activity card */}
          {!isUser && message.activityCard && isComplete && (
            <ActivityCardView card={message.activityCard} />
          )}

          {/* State sync events */}
          {!isUser && message.stateSyncEvents && message.stateSyncEvents.length > 0 && isComplete && (
            <StateSyncView events={message.stateSyncEvents} />
          )}

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
            <div className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Experiment-Backed Launch
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-800">
                    Draft A/B experiment created for this execution.
                  </p>
                </div>
                <Link
                  href={message.linkedExperimentHref}
                  className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-medium text-stone-700 transition hover:border-stone-300 hover:text-stone-800"
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
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-medium text-stone-600">
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
                  className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 transition hover:border-stone-300 hover:text-stone-800"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}

          {/* Timestamp + feedback */}
          <div
            className={cn(
              "px-1 flex items-center gap-2",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            {isUser && message.sourceTag ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
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

          {/* Feedback row for completed assistant messages */}
          {!isUser && isComplete && (
            <div className="px-1">
              <FeedbackRow />
            </div>
          )}
        </div>

        {/* Avatar - user only */}
        {isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="h-8 w-8 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center">
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
