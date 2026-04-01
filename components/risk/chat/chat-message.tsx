"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Ai } from "@carbon/icons-react";
import { SnapshotCard } from "./snapshot-card";
import type { SnapshotType } from "./chat-data";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  snapshots?: SnapshotType[];
  status?: "streaming" | "complete";
  agentSteps?: string[];
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
  [/implement micro.segmentation/i, "scenario-micro-seg"],
  [/deploy edr/i, "scenario-edr"],
  [/cyber.tolerant recovery/i, "scenario-recovery"],
  // Financial snapshots
  [/single loss expectancy|annualised loss|financial risk summary/i, "financial-summary"],
  [/industry.*benchmark|gartner|industry median/i, "risk-benchmark"],
  [/attack.*anatomy|blast radius|before.*after|without controls|with controls/i, "attack-anatomy"],
  // Execution
  [/initiated successfully|executed successfully/i, "nba-execution"],
  // Tab-level
  [/business service|risk band|likelihood|risk score|attack surface/i, "vendors"],
  [/audit|immutable|logged|assessment.*log|recorded/i, "audit"],
  [/monitor|signal|agent|threat.*intelligence|pipeline/i, "monitoring"],
  [/setting|threshold|config/i, "settings"],
  [/dashboard|overview|total ale|services at risk|controls coverage/i, "dashboard"],
  [/current.*(state|posture|risk posture)/i, "current-state"],
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
  const { hoveredSnapshot, hoveredBoldIdx, boldToSnapshot, snapshotToBolds, setHoveredBoldIdx } =
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

          {/* Snapshot cards */}
          {hasSnapshots && (
            <div className="space-y-2 w-full">
              {message.snapshots!.map((type) => (
                <SnapshotCard key={type} type={type} />
              ))}
            </div>
          )}

          {/* Timestamp */}
          <p
            className={cn(
              "text-[10px] text-muted-foreground px-1",
              isUser ? "text-right" : "text-left"
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
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
