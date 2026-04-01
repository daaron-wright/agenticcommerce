"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send, Loader2, CircleDot, TrendingUp, TrendingDown, Target, Activity,
  ShieldCheck, Tag, BarChart3, PieChart, ChevronDown,
  Play, X, RefreshCw, Zap, CloudSun, Workflow,
} from "lucide-react";
import {
  AiRecommend as CarbonAiRecommend,
  Idea as CarbonIdea,
} from "@carbon/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useArtifacts } from "@/lib/artifact-store";
import { useExplainability } from "@/lib/demand/explainability-store";
import { useDAGSession } from "@/lib/demand/dag-session-store";
import { ChatMessage, type Message } from "./chat-message";

import dynamic from "next/dynamic";
const SubwayMapBackground = dynamic(
  () => import("./subway-map-bg").then((m) => ({ default: m.SubwayMapBackground })),
  { ssr: false }
);
import {
  WELCOME_HEADING,
  WELCOME_PROMPT_CARDS,
  matchFlow,
  SCENARIO_FLOWS,
  SCENARIO_META,
  ALL_NBA_ACTIONS,
  EXECUTION_FLOWS,
  getNBAsByScenario,
  getScenarioIdFromFlow,
  getNBAIdFromFlow,
  SCENARIO_ARTIFACTS,
  EXECUTION_ARTIFACTS,
  type ChatFlow,
  type ScenarioId,
  type NBAAction,
  type NBAActionId,
  type SuggestedPromptCard,
} from "./chat-data";

// Wrap Carbon icons so they accept className like lucide icons
function AiRecommend({ className }: { className?: string }) {
  return <CarbonAiRecommend size={16} className={className} />;
}
function IdeaIcon({ className }: { className?: string }) {
  return <CarbonIdea size={16} className={className} />;
}

let messageCounter = 0;
function nextId() {
  return `msg-${++messageCounter}-${Date.now()}`;
}

// ── Session persistence helpers ─────────────────────────────────────────────

const CHAT_STORAGE_KEY = "omnis-chat-history";

interface SerializedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  snapshots?: string[];
  status?: "streaming" | "complete";
  agentSteps?: string[];
}

function saveMessages(messages: Message[]) {
  try {
    const serialized: SerializedMessage[] = messages.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
      status: "complete" as const,
    }));
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

function loadMessages(): Message[] {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: SerializedMessage[] = JSON.parse(raw);
    return parsed.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
      status: "complete" as const,
    }));
  } catch {
    return [];
  }
}

type AgentPhase = "idle" | "thinking" | "tool_call" | "streaming" | "complete";

const SCENARIO_ICONS: Record<ScenarioId, React.ElementType> = {
  "waste-reduction": TrendingDown,
  "stockout-prevention": ShieldCheck,
  "promotion-planning": Tag,
};

const PROMPT_ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp,
  Target,
  ShieldCheck,
  BarChart3,
  AiRecommend,
  PieChart,
  CloudSun,
  Zap,
  Workflow,
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<AgentPhase>("idle");
  const [currentStep, setCurrentStep] = useState("");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);
  const [showMorePrompts, setShowMorePrompts] = useState(false);
  const [activeNBAs, setActiveNBAs] = useState<NBAAction[]>([]);
  const [showNBACards, setShowNBACards] = useState(false);
  const [lastCompletedFlow, setLastCompletedFlow] = useState<ChatFlow | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const { addArtifacts } = useArtifacts();
  const { addExecution, updateExecution, updateStep } = useExplainability();
  const { addFlowToDAG } = useDAGSession();
  const lastUserPromptRef = useRef("");
  const execCounterRef = useRef(0);
  const promptHandledRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, phase, currentStep, showScenarioPicker, showNBACards, scrollToBottom]);

  // ── Auto-send from query param ──────────────────────────────────────────

  const searchParams = useSearchParams();

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !promptHandledRef.current) {
      promptHandledRef.current = true;
      // Clear the query param from URL without navigation
      window.history.replaceState({}, "", window.location.pathname);
      // Small delay to let component mount fully
      const timer = setTimeout(() => handleSend(prompt), 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    const completeMessages = messages.filter((m) => m.status === "complete" && m.content);
    if (completeMessages.length > 0) {
      saveMessages(completeMessages);
    }
  }, [messages]);

  // ── Streaming simulation ────────────────────────────────────────────────

  const simulateResponse = useCallback(
    async (flow: ChatFlow) => {
      abortRef.current = false;
      setShowScenarioPicker(false);
      setShowNBACards(false);
      setActiveNBAs([]);

      // Create explainability execution record
      const execId = `exec-${++execCounterRef.current}-${Date.now()}`;
      const explMeta = flow.explainability;
      if (explMeta) {
        addExecution({
          id: execId,
          chatMessageId: "",
          chatPrompt: lastUserPromptRef.current,
          title: explMeta.title,
          status: "running",
          startedAt: new Date(),
          steps: flow.agentSteps.map((s) => ({ label: s, status: "pending", duration: "\u2014" })),
          reasoning: explMeta.reasoning,
          confidence: explMeta.confidence,
          model: explMeta.model,
        });
      }

      setPhase("thinking");
      setCompletedSteps([]);
      await delay(600);
      if (abortRef.current) return;

      for (let i = 0; i < flow.agentSteps.length; i++) {
        const step = flow.agentSteps[i];
        setPhase("tool_call");
        setCurrentStep(step);
        if (explMeta) {
          updateStep(execId, i, { status: "running" });
        }
        const stepStart = Date.now();
        await delay(800 + Math.random() * 400);
        if (abortRef.current) return;
        setCompletedSteps((prev) => [...prev, step]);
        if (explMeta) {
          const elapsed = ((Date.now() - stepStart) / 1000).toFixed(1);
          updateStep(execId, i, { status: "done", duration: `${elapsed}s` });
        }
      }

      setPhase("streaming");
      setCurrentStep("");
      const assistantId = nextId();

      // Link execution to assistant message
      if (explMeta) {
        updateExecution(execId, { chatMessageId: assistantId });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          snapshots: flow.snapshots,
          status: "streaming",
          agentSteps: flow.agentSteps,
        },
      ]);

      const text = flow.response;
      for (let i = 0; i <= text.length; i++) {
        if (abortRef.current) return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: text.slice(0, i) } : m
          )
        );
        const char = text[i];
        const speed =
          char === " " ? 8 : char === "." || char === "," ? 40 : 14;
        await delay(speed);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, status: "complete" } : m
        )
      );
      setPhase("complete");
      setCompletedSteps([]);

      // Mark explainability execution as done
      if (explMeta) {
        updateExecution(execId, { status: "done" });
      }

      // Add this flow to the evolving DAG in the right sidebar
      addFlowToDAG(flow, lastUserPromptRef.current);

      await delay(300);
      setPhase("idle");

      setLastCompletedFlow(flow);

      // Log artifacts only for scenario flows and execution flows
      const scenarioId = getScenarioIdFromFlow(flow);
      const nbaId = getNBAIdFromFlow(flow);

      if (scenarioId) {
        const defs = SCENARIO_ARTIFACTS[scenarioId];
        addArtifacts(
          defs.map((d) => ({
            category: d.category,
            title: d.title,
            summary: d.summary,
            metric: d.metric,
            chatMessageId: assistantId,
            chatPrompt: lastUserPromptRef.current,
          })),
        );
      } else if (nbaId) {
        const defs = EXECUTION_ARTIFACTS[nbaId];
        addArtifacts(
          defs.map((d) => ({
            category: d.category,
            title: d.title,
            summary: d.summary,
            metric: d.metric,
            chatMessageId: assistantId,
            chatPrompt: lastUserPromptRef.current,
          })),
        );
      }

      if (flow.offerScenarios) {
        setShowScenarioPicker(true);
      }

      // Show NBA cards if the flow requests them
      if (flow.showNBACards) {
        const nbas =
          flow.showNBACards === "all"
            ? ALL_NBA_ACTIONS
            : getNBAsByScenario(flow.showNBACards);
        setActiveNBAs(nbas);
        setShowNBACards(true);
      }
    },
    []
  );

  // Sync messagesRef so LLM callbacks always see the latest messages
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // ── LLM streaming (real API) ──────────────────────────────────────────────
  const callLLMAndStream = useCallback(
    async (flow: ChatFlow, userMessage: string) => {
      // Execution and scenario flows stay scripted
      const isScriptedFlow = flow.agentSteps.length > 0 || (flow.snapshots?.length ?? 0) > 0;
      if (isScriptedFlow) {
        simulateResponse(flow);
        return;
      }

      abortRef.current = false;
      setShowScenarioPicker(false);
      setShowNBACards(false);
      setActiveNBAs([]);

      setPhase("thinking");
      setCompletedSteps([]);
      await delay(600);
      if (abortRef.current) return;

      setPhase("streaming");
      const assistantId = nextId();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date(), status: "streaming" },
      ]);

      const history = messagesRef.current
        .filter((m) => m.status === "complete" && m.content?.trim())
        .map((m) => ({ role: m.role, content: m.content }));
      const apiMessages = [...history, { role: "user" as const, content: userMessage }];

      let streamSucceeded = false;
      let apiError = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, userRole: "general", persona: "merchandiser" }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`API responded with ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || abortRef.current) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) { console.error("[demand-chat] API error:", parsed.error); throw new Error(parsed.error); }
              if (parsed.text) {
                accumulated += parsed.text;
                streamSucceeded = true;
                setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m));
              }
            } catch (parseErr) {
              if ((parseErr as Error).message?.includes("API error")) throw parseErr;
            }
          }
        }
      } catch (err) {
        console.error("[demand-chat] API call failed:", err);
        apiError = String(err);
      }

      if (abortRef.current) return;

      if (!streamSucceeded) {
        const errorText = `⚠️ **LLM unavailable** — ${apiError || "no response received"}`;
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: errorText } : m));
      }

      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, status: "complete" } : m));
      setPhase("complete");
      setCompletedSteps([]);
      await delay(300);
      setPhase("idle");
      setLastCompletedFlow(flow);
    },
    [simulateResponse]
  );


  // ── Execute NBA action ──────────────────────────────────────────────────

  const handleNBAExecute = useCallback(
    (action: NBAAction) => {
      if (phase !== "idle") return;

      setShowNBACards(false);
      setActiveNBAs([]);

      const userMsg: Message = {
        id: nextId(),
        role: "user",
        content: `Execute: ${action.title}`,
        timestamp: new Date(),
        status: "complete",
      };

      setMessages((prev) => [...prev, userMsg]);
      lastUserPromptRef.current = `Execute: ${action.title}`;
      const flow = EXECUTION_FLOWS[action.id];
      simulateResponse(flow);
    },
    [phase, simulateResponse]
  );

  const handleNBADismiss = useCallback((actionId: NBAActionId) => {
    setActiveNBAs((prev) => {
      const next = prev.filter((a) => a.id !== actionId);
      if (next.length === 0) setShowNBACards(false);
      return next;
    });
  }, []);

  // ── Send message ────────────────────────────────────────────────────────

  const handleSend = useCallback(
    (text?: string) => {
      const value = (text ?? input).trim();
      if (!value || phase !== "idle") return;

      setShowScenarioPicker(false);
      setShowNBACards(false);
      setActiveNBAs([]);

      const userMsg: Message = {
        id: nextId(),
        role: "user",
        content: value,
        timestamp: new Date(),
        status: "complete",
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      lastUserPromptRef.current = value;

      const flow = matchFlow(value);
      callLLMAndStream(flow, value);
    },
    [input, phase, simulateResponse, callLLMAndStream]
  );

  const handleScenarioSelect = useCallback(
    (scenarioId: ScenarioId) => {
      if (phase !== "idle") return;

      setShowScenarioPicker(false);
      const meta = SCENARIO_META[scenarioId];

      const userMsg: Message = {
        id: nextId(),
        role: "user",
        content: `Run the "${meta.label}" scenario`,
        timestamp: new Date(),
        status: "complete",
      };

      setMessages((prev) => [...prev, userMsg]);
      lastUserPromptRef.current = `Run the "${meta.label}" scenario`;
      const flow = SCENARIO_FLOWS[scenarioId];
      simulateResponse(flow);
    },
    [phase, simulateResponse]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = useCallback(() => {
    setMessages([]);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {}
  }, []);

  const isIdle = phase === "idle";
  const showWelcome = messages.length === 0 && isIdle;

  const followUps =
    isIdle && !showScenarioPicker && !showNBACards && messages.length > 0 && lastCompletedFlow?.followUps?.length
      ? lastCompletedFlow.followUps
      : null;

  const visiblePrompts = showMorePrompts
    ? WELCOME_PROMPT_CARDS
    : WELCOME_PROMPT_CARDS.slice(0, 6);

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] -m-6 bg-background">
      {/* Full-panel background */}
      <SubwayMapBackground />
      {/* Status bar */}
      <div data-tour="chat-status" className="flex items-center gap-2 px-4 py-2 border-b bg-stone-50/60 text-xs text-muted-foreground shrink-0">
        <CircleDot
          className={cn(
            "h-3 w-3",
            isIdle ? "text-emerald-500" : "text-amber-500"
          )}
        />
        <span>
          {phase === "idle" && "Connected — Ready"}
          {phase === "thinking" && "Agent thinking..."}
          {phase === "tool_call" && "Processing..."}
          {phase === "streaming" && "Generating response..."}
          {phase === "complete" && "Complete"}
        </span>

        {(phase === "tool_call" || phase === "streaming") &&
          (completedSteps.length > 0 || currentStep) && (
            <div className="flex items-center gap-1.5 ml-2 overflow-x-auto">
              {completedSteps.map((step, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-200 text-[10px] font-medium text-stone-600 whitespace-nowrap"
                >
                  <span className="text-emerald-500">✓</span> {step}
                </span>
              ))}
              {currentStep && phase === "tool_call" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-700 text-[10px] font-medium text-white whitespace-nowrap">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  {currentStep}
                </span>
              )}
            </div>
          )}

        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="ml-auto h-7 text-[10px] text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Clear chat
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div data-tour="chat-messages" ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome state — redesigned */}
          {showWelcome && (
            <div data-tour="chat-welcome" className="relative flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              {/* Heading */}
              <h2 className="relative z-10 text-2xl font-semibold tracking-tight text-stone-800">
                {WELCOME_HEADING}
              </h2>

              {/* Input bar (positioned above prompts like reference) */}
              <div className="relative z-10 w-full max-w-xl">
                <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-stone-300 focus-within:border-stone-300 transition-all">
                  <span className="text-stone-400 text-sm">+</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything"
                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                      input.trim()
                        ? "bg-stone-700 text-white hover:bg-stone-800"
                        : "bg-stone-200 text-stone-400"
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Suggested questions label */}
              <p className="relative z-10 text-xs text-muted-foreground font-medium tracking-wide">
                Suggested questions
              </p>

              {/* Prompt cards grid */}
              <div data-tour="chat-prompts" className="relative z-10 grid grid-cols-3 gap-3 max-w-xl w-full">
                {visiblePrompts.map((card) => (
                  <PromptCard
                    key={card.prompt}
                    card={card}
                    onClick={() => handleSend(card.prompt)}
                  />
                ))}
              </div>

              {/* See more toggle */}
              {WELCOME_PROMPT_CARDS.length > 6 && !showMorePrompts && (
                <button
                  onClick={() => setShowMorePrompts(true)}
                  className="relative z-10 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  See more <ChevronDown className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Scenario picker */}
          {showScenarioPicker && isIdle && (
            <ScenarioPicker onSelect={handleScenarioSelect} />
          )}

          {/* NBA action cards */}
          {showNBACards && isIdle && activeNBAs.length > 0 && (
            <NBAActionCards
              actions={activeNBAs}
              onExecute={handleNBAExecute}
              onDismiss={handleNBADismiss}
            />
          )}

          {/* Agent processing indicator */}
          {(phase === "thinking" || phase === "tool_call") && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-lg bg-stone-700 text-white flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-2xl rounded-bl-md bg-stone-100 border border-stone-200 px-4 py-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {phase === "thinking"
                      ? "Analyzing your request..."
                      : currentStep || "Processing..."}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up suggestions */}
      {followUps && (
        <div className="px-4 pb-1 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-1.5">
            {followUps.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-colors text-stone-600"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar (conversation mode — hidden on welcome) */}
      {!showWelcome && (
        <div data-tour="chat-input" className="border-t bg-card px-4 py-3 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isIdle
                  ? "Ask me anything about your marketing..."
                  : "Waiting for response..."
              }
              disabled={!isIdle}
              className="flex-1 rounded-lg border border-stone-200 bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!isIdle || !input.trim()}
              className="h-10 w-10 rounded-lg bg-stone-700 hover:bg-stone-800 text-white shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Prompt Card ──────────────────────────────────────────────────────────────

function PromptCard({
  card,
  onClick,
}: {
  card: SuggestedPromptCard;
  onClick: () => void;
}) {
  const Icon = PROMPT_ICON_MAP[card.icon] || IdeaIcon;

  // Bold specific words in the label
  const labelParts = renderBold(card.label, card.boldWords ?? []);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm transition-all text-left group"
    >
      <div className="p-1.5 rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors">
        <Icon className="h-4 w-4 text-stone-700" />
      </div>
      <p className="text-xs leading-snug text-stone-700">{labelParts}</p>
    </button>
  );
}

function renderBold(text: string, boldWords: string[]) {
  if (!boldWords.length) return text;

  // Build a regex that matches any of the bold phrases (case-insensitive)
  const escaped = boldWords.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const isBold = boldWords.some(
      (w) => w.toLowerCase() === part.toLowerCase()
    );
    return isBold ? (
      <strong key={i} className="font-semibold text-stone-800">
        {part}
      </strong>
    ) : (
      part
    );
  });
}

// ── NBA Action Cards ─────────────────────────────────────────────────────────

function NBAActionCards({
  actions,
  onExecute,
  onDismiss,
}: {
  actions: NBAAction[];
  onExecute: (action: NBAAction) => void;
  onDismiss: (id: NBAActionId) => void;
}) {
  return (
    <div className="flex gap-3 ml-11">
      <div className="space-y-3 w-full">
        <p className="text-xs font-medium text-muted-foreground">
          Recommended actions — click Execute to activate:
        </p>
        <div className="space-y-2">
          {actions.map((action) => (
            <div
              key={action.id}
              className="p-3.5 rounded-lg border border-stone-200 bg-white hover:border-stone-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-stone-700">
                      {action.title}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {action.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">
                    <span className="font-medium text-stone-600">Segment:</span>{" "}
                    {action.segment}
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-1.5">
                    <span className="font-medium text-stone-600">Action:</span>{" "}
                    {action.action} &middot;{" "}
                    <span className="font-semibold text-emerald-700">
                      {action.expectedLift}
                    </span>
                  </p>
                  <p className="text-[10px] text-stone-500 leading-snug">
                    {action.agentReason}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-stone-100">
                <button
                  onClick={() => onExecute(action)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-700 text-white text-[11px] font-medium hover:bg-stone-800 transition-colors"
                >
                  <Play className="h-3 w-3" />
                  Execute
                </button>
                <button
                  onClick={() => onDismiss(action.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-200 text-stone-500 text-[11px] font-medium hover:bg-stone-50 hover:border-stone-300 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Scenario Picker ──────────────────────────────────────────────────────────

function ScenarioPicker({
  onSelect,
}: {
  onSelect: (id: ScenarioId) => void;
}) {
  const scenarios: ScenarioId[] = ["waste-reduction", "stockout-prevention", "promotion-planning"];

  const riskColors: Record<string, string> = {
    Medium: "bg-stone-100 text-stone-700",
    High: "bg-stone-200 text-stone-700",
    Low: "bg-stone-50 text-stone-600 border border-stone-200",
  };

  return (
    <div className="flex gap-3 ml-11">
      <div className="space-y-3 w-full">
        <p className="text-xs font-medium text-muted-foreground">
          Select a scenario to see projected impact:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {scenarios.map((id) => {
            const meta = SCENARIO_META[id];
            const Icon = SCENARIO_ICONS[id];
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="text-left p-3 rounded-lg border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-md bg-stone-100 group-hover:bg-stone-200 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-stone-700" />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                      riskColors[meta.risk]
                    )}
                  >
                    {meta.risk} risk
                  </span>
                </div>
                <p className="text-xs font-semibold text-stone-700 mb-1">
                  {meta.label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug mb-2">
                  {meta.description}
                </p>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-stone-500">
                    Outcome:{" "}
                    <span className="font-semibold text-stone-700">
                      {meta.outcome}
                    </span>
                  </span>
                  <span className="text-stone-500">
                    Budget:{" "}
                    <span className="font-semibold text-stone-700">
                      {meta.budget}
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
