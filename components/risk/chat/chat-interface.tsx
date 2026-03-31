"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Send, Loader2, CircleDot, TrendingUp, Target, Activity,
  ShieldCheck, BarChart3, PieChart, ChevronDown,
  Play, X, RotateCcw, Shield, Zap, RefreshCw,
} from "lucide-react";
import {
  AiRecommend as CarbonAiRecommend,
  Idea as CarbonIdea,
} from "@carbon/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useArtifacts } from "@/lib/artifact-store";
import { ChatMessage, type Message } from "./chat-message";
import type { SnapshotType } from "./chat-data";
import { SubwayMapBackground } from "./subway-map-bg";
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
  NEW_FLOW_ARTIFACTS,
  getNewFlowId,
  FOUNDATIONAL_SCENARIO_META,
  FOUNDATIONAL_SCENARIO_FLOWS,
  FOUNDATIONAL_SCENARIO_ARTIFACTS,
  getFoundationalScenarioIdFromFlow,
  computeAssessment,
  computeReducedExposure,
  CONTROLS,
  fmtCurrency,
  SERVICES,
  type ChatFlow,
  type ScenarioId,
  type FoundationalScenarioId,
  type NBAAction,
  type NBAActionId,
  type SuggestedPromptCard,
  type AssessmentInputs,
  type AssessmentResult,
} from "./chat-data";
import { pushChatAuditEvent } from "@/lib/risk/cyber-risk-data";
import { useExecutions, type ReasoningFactor } from "@/lib/risk/execution-store";

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
  snapshots?: SnapshotType[];
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
  "micro-seg": Shield,
  edr: Zap,
  recovery: RefreshCw,
};

const PROMPT_ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp,
  Target,
  ShieldCheck,
  BarChart3,
  AiRecommend,
  PieChart,
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
  const [showAssessmentCard, setShowAssessmentCard] = useState(false);
  const [showControlsPanel, setShowControlsPanel] = useState(false);
  const [showFoundationalScenarios, setShowFoundationalScenarios] = useState(false);
  const [showFoundationalExposureTable, setShowFoundationalExposureTable] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [lastCompletedFlow, setLastCompletedFlow] = useState<ChatFlow | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const { addArtifacts } = useArtifacts();
  const { startExecution, updateStep, completeExecution, clearExecutions } = useExecutions();
  const lastUserPromptRef = useRef("");
  const currentExecIdRef = useRef<string | null>(null);

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
  }, [messages, phase, currentStep, showScenarioPicker, showNBACards, showAssessmentCard, showControlsPanel, showFoundationalScenarios, showFoundationalExposureTable, scrollToBottom]);

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
      setShowAssessmentCard(false);
      setShowControlsPanel(false);
      setShowFoundationalScenarios(false);
      setShowFoundationalExposureTable(false);
      setActiveNBAs([]);

      setPhase("thinking");
      setCompletedSteps([]);

      // Derive a readable title from the first agent step or the user prompt
      const execTitle = lastUserPromptRef.current || flow.agentSteps[0]?.split(" \u2014 ")[0] || "Agent Execution";
      const execId = startExecution({
        title: execTitle,
        status: "running",
        startedAt: "just now",
        steps: flow.agentSteps.map((s) => ({ label: s, status: "pending" as const, duration: "\u2014" })),
        reasoning: [],
        confidence: 0,
        model: "",
      });
      currentExecIdRef.current = execId;

      await delay(600);
      if (abortRef.current) return;

      for (let si = 0; si < flow.agentSteps.length; si++) {
        const step = flow.agentSteps[si];
        setPhase("tool_call");
        setCurrentStep(step);
        updateStep(execId, si, { status: "running" });
        const stepStart = performance.now();
        await delay(800 + Math.random() * 400);
        if (abortRef.current) return;
        const elapsed = ((performance.now() - stepStart) / 1000).toFixed(1);
        updateStep(execId, si, { status: "done", duration: `${elapsed}s` });
        setCompletedSteps((prev) => [...prev, step]);
      }

      setPhase("streaming");
      setCurrentStep("");
      const assistantId = nextId();

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
      await delay(300);
      setPhase("idle");

      setLastCompletedFlow(flow);

      // Complete the execution in the explainability panel
      if (currentExecIdRef.current) {
        const reasoning = buildReasoningForFlow(flow);
        completeExecution(currentExecIdRef.current, reasoning.factors, reasoning.confidence, reasoning.model);
        currentExecIdRef.current = null;
      }

      // Log artifacts only for scenario flows and execution flows
      const scenarioId = getScenarioIdFromFlow(flow);
      const nbaId = getNBAIdFromFlow(flow);

      const now = new Date();
      const formattedTimestamp = `${now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} · ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;

      // Check for foundational scenario artifacts
      const foundationalScenarioId = getFoundationalScenarioIdFromFlow(flow);
      // Check for new flow artifacts (attack surface, foundational services, incident prep)
      const newFlowId = getNewFlowId(flow);

      if (foundationalScenarioId) {
        const defs = FOUNDATIONAL_SCENARIO_ARTIFACTS[foundationalScenarioId];
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

        const meta = FOUNDATIONAL_SCENARIO_META[foundationalScenarioId];
        pushChatAuditEvent({
          timestamp: formattedTimestamp,
          eventType: "Foundational Scenario",
          details: `Explored foundational attack scenario: ${meta.label}. ${meta.description}`,
          actor: "Cyber Risk Agent",
          serviceName: "Global",
        });
      } else if (newFlowId) {
        const defs = NEW_FLOW_ARTIFACTS[newFlowId];
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

        const flowLabels: Record<string, string> = {
          "attack-surface": "Attack Surface Ratio Analysis",
          "foundational-services": "Foundational Services Assessment",
          "incident-preparation": "Incident Preparation Review",
        };
        pushChatAuditEvent({
          timestamp: formattedTimestamp,
          eventType: "Chat Analysis",
          details: `Completed: ${flowLabels[newFlowId]}. Insights logged to dashboard.`,
          actor: "Cyber Risk Agent",
          serviceName: "Global",
        });
      } else if (scenarioId) {
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

        const meta = SCENARIO_META[scenarioId];
        if (meta) {
          pushChatAuditEvent({
            timestamp: formattedTimestamp,
            eventType: "Scenario Exploration",
            details: `Explored scenario: ${meta.label}. ${meta.description}`,
            actor: "Cyber Risk Agent",
            serviceName: "Global",
          });
        }
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

        const action = ALL_NBA_ACTIONS.find(a => a.id === nbaId);
        if (action) {
          pushChatAuditEvent({
            timestamp: formattedTimestamp,
            eventType: "Workstream Execution",
            details: `Initiated execution: ${action.title}. Expected outcome: ${action.expectedLift}.`,
            actor: "Cyber Risk Agent",
            serviceName: action.segment || "Global",
          });
        }
      }

      if (flow.offerScenarios) {
        setShowScenarioPicker(true);
      }

      // Show foundational exposure table if requested
      if (flow.showFoundationalExposureTable) {
        setShowFoundationalExposureTable(true);
      }

      // Show foundational scenario picker if requested
      if (flow.showFoundationalScenarios) {
        setShowFoundationalScenarios(true);
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

      // Show assessment card if requested
      if (flow.showAssessmentCard) {
        setShowAssessmentCard(true);
      }

      // Show controls panel if requested
      if (flow.showControlsPanel) {
        setShowControlsPanel(true);
      }
    },
    []
  );

  // ── Handle assessment submission ────────────────────────────────────────

  const handleAssessmentSubmit = useCallback(
    (result: AssessmentResult) => {
      setShowAssessmentCard(false);
      setAssessmentResult(result);

      // Create a user message summarising the submission
      const userMsg: Message = {
        id: nextId(),
        role: "user",
        content: `Assessment submitted for ${result.processName}: Impact $${result.businessImpactPerHour.toLocaleString()}/hr, MTCR ${result.mtcrHours}h`,
        timestamp: new Date(),
        status: "complete",
      };
      setMessages((prev) => [...prev, userMsg]);
      lastUserPromptRef.current = `Assessment for ${result.processName}`;

      // Build a dynamic response flow with the computed results
      const fmtCurrency = (n: number) => "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

      const now = new Date();
      const formattedTimestamp = `${now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} · ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;

      pushChatAuditEvent({
        timestamp: formattedTimestamp,
        eventType: "Custom Assessment",
        details: `Ran custom assessment for ${result.processName}. SLE: ${fmtCurrency(result.sle)}, ALE: ${fmtCurrency(result.ale)}. Risk score: ${result.riskScore}.`,
        actor: "Cyber Risk Agent",
        serviceName: result.processName,
      });

      const resultFlow: ChatFlow = {
        triggers: [],
        agentSteps: [
          "Scoring Agent — computing attack surface maturity score",
          "Benchmark Agent — comparing against Gartner industry benchmarks",
          "Financial Model — calculating loss expectancy",
          "Risk Engine — producing executive summary",
        ],
        response:
          `Here's your **cyber financial risk summary** for **${result.processName}**:\n\n` +
          `• **Risk Score**: ${result.riskScore}/120 — placing you in the **${result.riskBand}** risk band\n` +
          `• **Likelihood of Attack**: **${result.likelihoodPercent}%** annualised probability\n` +
          `• **Business Impact**: **${fmtCurrency(result.businessImpactPerHour)}/hour**\n` +
          `• **MTCR**: **${result.mtcrHours} hours**\n\n` +
          `This produces two key numbers:\n` +
          `• **Single Loss Expectancy**: **${fmtCurrency(result.sle)}** — the cost of one major cyber event\n` +
          `• **Annualised Loss Expectancy**: **${fmtCurrency(result.ale)}** — your expected annual cyber loss\n\n` +
          `Your organisation sits **above the industry median** for financial exposure in the **${result.riskBand}** band.`,
        snapshots: ["financial-summary", "risk-benchmark"],
        followUps: [
          "How can I reduce this risk?",
          "Show me what an attack looks like",
          "What workstreams reduce our cyber risk?",
          "Run a new assessment",
        ],
      };

      simulateResponse(resultFlow);
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
      setShowAssessmentCard(false);
      setShowControlsPanel(false);
      setShowFoundationalScenarios(false);
      setShowFoundationalExposureTable(false);
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
      simulateResponse(flow);
    },
    [input, phase, simulateResponse]
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

  const handleClearChat = useCallback(() => {
    if (phase !== "idle") return;
    abortRef.current = true;
    setMessages([]);
    setInput("");
    setPhase("idle");
    setCurrentStep("");
    setCompletedSteps([]);
    setShowScenarioPicker(false);
    setShowNBACards(false);
    setShowAssessmentCard(false);
    setShowControlsPanel(false);
    setShowFoundationalScenarios(false);
    setShowFoundationalExposureTable(false);
    setActiveNBAs([]);
    setLastCompletedFlow(null);
    setShowMorePrompts(false);
    setAssessmentResult(null);
    clearExecutions();
    try { sessionStorage.removeItem(CHAT_STORAGE_KEY); } catch {}
  }, [phase, clearExecutions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isIdle = phase === "idle";
  const showWelcome = messages.length === 0 && isIdle;

  const followUps =
    isIdle && !showScenarioPicker && !showNBACards && !showAssessmentCard && !showControlsPanel && !showFoundationalScenarios && !showFoundationalExposureTable && messages.length > 0 && lastCompletedFlow?.followUps?.length
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
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-slate-50/60 text-xs text-muted-foreground shrink-0">
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

        {messages.length > 0 && isIdle && (
          <button
            onClick={handleClearChat}
            className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Clear chat
          </button>
        )}

        {(phase === "tool_call" || phase === "streaming") &&
          (completedSteps.length > 0 || currentStep) && (
            <div className="flex items-center gap-1.5 ml-2 overflow-x-auto">
              {completedSteps.map((step, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-[10px] font-medium text-slate-600 whitespace-nowrap"
                >
                  <span className="text-emerald-500">{"\u2713"}</span> {step}
                </span>
              ))}
              {currentStep && phase === "tool_call" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-medium text-white whitespace-nowrap">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  {currentStep}
                </span>
              )}
            </div>
          )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome state */}
          {showWelcome && (
            <div className="relative flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              <h2 className="relative z-10 text-2xl font-semibold tracking-tight text-slate-900">
                {WELCOME_HEADING}
              </h2>

              <div className="relative z-10 w-full max-w-xl">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-slate-300 focus-within:border-slate-300 transition-all">
                  <span className="text-slate-400 text-sm">+</span>
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
                        ? "bg-slate-800 text-white hover:bg-slate-900"
                        : "bg-slate-200 text-slate-400"
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="relative z-10 text-xs text-muted-foreground font-medium tracking-wide">
                Suggested questions
              </p>

              <div className="relative z-10 grid grid-cols-3 gap-3 max-w-xl w-full">
                {visiblePrompts.map((card) => (
                  <PromptCard
                    key={card.prompt}
                    card={card}
                    onClick={() => handleSend(card.prompt)}
                  />
                ))}
              </div>

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

          {/* Cyber Assessment Card */}
          {showAssessmentCard && isIdle && (
            <CyberAssessmentCard onSubmit={handleAssessmentSubmit} />
          )}

          {/* Controls Panel */}
          {showControlsPanel && isIdle && assessmentResult && (
            <ControlsPanel assessment={assessmentResult} />
          )}

          {/* Foundational Exposure Table */}
          {showFoundationalExposureTable && isIdle && (
            <FoundationalExposureTable />
          )}

          {/* Foundational scenario picker */}
          {showFoundationalScenarios && isIdle && (
            <FoundationalScenarioPicker onSelect={(id) => {
              if (phase !== "idle") return;
              setShowFoundationalScenarios(false);
              const meta = FOUNDATIONAL_SCENARIO_META[id];
              const userMsg: Message = {
                id: nextId(),
                role: "user",
                content: `Simulate: ${meta.label}`,
                timestamp: new Date(),
                status: "complete",
              };
              setMessages((prev) => [...prev, userMsg]);
              lastUserPromptRef.current = `Simulate: ${meta.label}`;
              const flow = FOUNDATIONAL_SCENARIO_FLOWS[id];
              simulateResponse(flow);
            }} />
          )}

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
                <div className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
              <div className="space-y-1.5 flex-1 max-w-md">
                {completedSteps.map((step, i) => {
                  const parts = step.split(" \u2014 ");
                  const agentName = parts.length > 1 ? parts[0] : null;
                  const finding = parts.length > 1 ? parts.slice(1).join(" \u2014 ") : step;
                  return (
                    <div key={i} className="flex items-start gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-emerald-500 mt-0.5 shrink-0">{"\u2713"}</span>
                      <div className="min-w-0">
                        {agentName && (
                          <span className="text-[10px] font-semibold text-slate-700">{agentName}</span>
                        )}
                        <p className="text-[10px] text-slate-500 leading-snug">{finding}</p>
                      </div>
                    </div>
                  );
                })}
                <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    <span className="text-[11px]">
                      {phase === "thinking"
                        ? "Analysing your request..."
                        : currentStep || "Processing..."}
                    </span>
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
                className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-600"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar (conversation mode) */}
      {!showWelcome && (
        <div className="border-t bg-card px-4 py-3 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isIdle
                  ? "Ask me anything about cyber risk..."
                  : "Waiting for response..."
              }
              disabled={!isIdle}
              className="flex-1 rounded-lg border border-slate-200 bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!isIdle || !input.trim()}
              className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-slate-900 text-white shrink-0"
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
  const labelParts = renderBold(card.label, card.boldWords ?? []);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all text-left group"
    >
      <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
        <Icon className="h-4 w-4 text-slate-700" />
      </div>
      <p className="text-xs leading-snug text-slate-700">{labelParts}</p>
    </button>
  );
}

function renderBold(text: string, boldWords: string[]) {
  if (!boldWords.length) return text;
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
      <strong key={i} className="font-semibold text-slate-900">
        {part}
      </strong>
    ) : (
      part
    );
  });
}

// ── Cyber Assessment Card ────────────────────────────────────────────────────

const CONTROL_QUESTIONS: { key: keyof AssessmentInputs; label: string; inverted?: boolean }[] = [
  { key: "thirdPartyCompliance", label: "Third parties adhere to security policies?" },
  { key: "endpointsSecured", label: "All endpoints fully secured and protected?" },
  { key: "pamCovered", label: "PAM covered with modern protection?" },
  { key: "e2eEncryption", label: "End-to-end encryption for all PII/sensitive data?" },
  { key: "legacyInfra", label: "Legacy infrastructure present in landscape?", inverted: true },
  { key: "microSegmentation", label: "Core systems protected with micro-segmentation?" },
  { key: "e2eSecurityOps", label: "End-to-end security operations monitoring all platforms?" },
  { key: "osVulnerabilities", label: "Vulnerabilities exist in OS stack?", inverted: true },
  { key: "foundationalVulns", label: "Vulnerabilities in foundational services?", inverted: true },
  { key: "backendVulns", label: "Vulnerabilities in backend services?", inverted: true },
  { key: "frontendVulns", label: "Vulnerabilities in frontend services?", inverted: true },
  { key: "cyberRecoveryTested", label: "Cyber-tolerant recovery tested?" },
];

function CyberAssessmentCard({ onSubmit }: { onSubmit: (result: AssessmentResult) => void }) {
  // Default inputs from the primary service's actual data
  const primaryService = SERVICES[0];
  const [inputs, setInputs] = useState<AssessmentInputs>(
    primaryService
      ? { ...primaryService.controlInputs }
      : {
          thirdPartyCompliance: false,
          endpointsSecured: false,
          pamCovered: false,
          e2eEncryption: false,
          legacyInfra: true,
          microSegmentation: false,
          e2eSecurityOps: false,
          osVulnerabilities: true,
          foundationalVulns: true,
          backendVulns: true,
          frontendVulns: true,
          cyberRecoveryTested: false,
          businessImpactPerHour: 200000,
          mtcrHours: 168,
          processName: "Point of Sales",
        }
  );

  const toggleControl = (key: keyof AssessmentInputs) => {
    setInputs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSubmit = () => {
    const result = computeAssessment(inputs);
    onSubmit(result);
  };

  return (
    <div className="flex gap-3 ml-11">
      <Card className="border border-slate-200 shadow-none overflow-hidden w-full">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-xs font-semibold text-slate-700">Cyber Risk Assessment</span>
            </div>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              Attack Surface Proxy
            </Badge>
          </div>

          {/* Business context inputs */}
          <div className="px-4 py-3 border-b bg-white">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Business Context</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-600 font-medium block mb-1">Critical Business Process</label>
                <input
                  type="text"
                  value={inputs.processName}
                  onChange={(e) => setInputs((prev) => ({ ...prev, processName: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-medium block mb-1">Business Impact ($/hour)</label>
                <input
                  type="number"
                  value={inputs.businessImpactPerHour}
                  onChange={(e) => setInputs((prev) => ({ ...prev, businessImpactPerHour: Number(e.target.value) || 0 }))}
                  className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-medium block mb-1">Estimated MTCR (hours)</label>
                <input
                  type="number"
                  value={inputs.mtcrHours}
                  onChange={(e) => setInputs((prev) => ({ ...prev, mtcrHours: Number(e.target.value) || 0 }))}
                  className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Control questions */}
          <div className="px-4 py-3 bg-white">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Attack Surface Controls</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {CONTROL_QUESTIONS.map(({ key, label, inverted }) => (
                <button
                  key={key}
                  onClick={() => toggleControl(key)}
                  className="flex items-center gap-2 text-left py-1 group"
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      (inputs[key as keyof typeof inputs] as boolean)
                        ? inverted
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 group-hover:border-slate-400"
                    )}
                  >
                    {(inputs[key as keyof typeof inputs] as boolean) && (
                      <span className="text-[8px] font-bold">{"\u2713"}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 leading-snug">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="px-4 py-3 border-t bg-slate-50/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              Inputs compared against Gartner industry benchmarks
            </span>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-800 text-white text-xs font-medium hover:bg-slate-900 transition-colors"
            >
              <Play className="h-3 w-3" />
              Run Assessment
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Controls Panel ───────────────────────────────────────────────────────────

function ControlsPanel({ assessment }: { assessment: AssessmentResult }) {
  const [activeControls, setActiveControls] = useState<string[]>([]);

  const toggleControl = (id: string) => {
    setActiveControls((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const reduced = computeReducedExposure(
    assessment.sle,
    assessment.mtcrHours,
    assessment.businessImpactPerHour,
    assessment.likelihoodPercent,
    activeControls
  );

  const fmtCurrency = (n: number) => "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const sleReductionPct = assessment.sle > 0 ? Math.round((1 - reduced.reducedSLE / assessment.sle) * 100) : 0;
  const aleReductionPct = assessment.ale > 0 ? Math.round((1 - reduced.reducedALE / assessment.ale) * 100) : 0;

  return (
    <div className="flex gap-3 ml-11">
      <Card className="border border-slate-200 shadow-none overflow-hidden w-full">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-xs font-semibold text-slate-700">Interactive Controls Panel</span>
            </div>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              Real-time
            </Badge>
          </div>

          {/* Controls toggles */}
          <div className="px-4 py-3 space-y-2 bg-white">
            {CONTROLS.map((control) => {
              const isActive = activeControls.includes(control.id);
              return (
                <button
                  key={control.id}
                  onClick={() => toggleControl(control.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    isActive
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "h-5 w-9 rounded-full relative transition-colors shrink-0",
                      isActive ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                        isActive ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">{control.label}</span>
                      {control.sleReduction > 0 && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          SLE -{Math.round(control.sleReduction * 100)}%
                        </span>
                      )}
                      {control.mtcrReduction > 0 && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          MTCR -{Math.round(control.mtcrReduction * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{control.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Financial comparison */}
          <div className="px-4 py-3 border-t bg-slate-50/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 mb-1">Single Loss Expectancy</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through">{fmtCurrency(assessment.sle)}</span>
                  <span className="text-sm font-bold text-slate-800">{fmtCurrency(reduced.reducedSLE)}</span>
                </div>
                {sleReductionPct > 0 && (
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${100 - sleReductionPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">-{sleReductionPct}% reduction</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 mb-1">Annualised Loss Expectancy</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through">{fmtCurrency(assessment.ale)}</span>
                  <span className="text-sm font-bold text-slate-800">{fmtCurrency(reduced.reducedALE)}</span>
                </div>
                {aleReductionPct > 0 && (
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${100 - aleReductionPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">-{aleReductionPct}% reduction</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
          Recommended workstreams — click Execute to activate:
        </p>
        <div className="space-y-2">
          {actions.map((action) => (
            <div
              key={action.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-800">
                      {action.title}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {action.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">
                    <span className="font-medium text-slate-600">Focus:</span>{" "}
                    {action.segment}
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-1.5">
                    <span className="font-medium text-slate-600">Action:</span>{" "}
                    {action.action} &middot;{" "}
                    <span className="font-semibold text-emerald-700">
                      {action.expectedLift}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    {action.agentReason}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => onExecute(action)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium hover:bg-slate-900 transition-colors"
                >
                  <Play className="h-3 w-3" />
                  Explore
                </button>
                <button
                  onClick={() => onDismiss(action.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-slate-500 text-[11px] font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
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

// ── Foundational Exposure Table ──────────────────────────────────────────────

const EXPOSURE_ROWS = [
  {
    service: "Identity",
    serviceDetail: "Entra, AD, IAM",
    backup: "Partial \u2014 no cyber-tolerant backup",
    backupColor: "bg-red-100",
    lastTest: "Never tested",
    testColor: "bg-red-100",
    level: "Unprotected",
    levelColor: "bg-red-500",
    rowBg: "bg-red-50",
    borderColor: "border-red-500",
  },
  {
    service: "Network",
    serviceDetail: "DNS, DHCP, SD-WAN",
    backup: "Standard backup only",
    backupColor: "bg-amber-100",
    lastTest: "14 months ago",
    testColor: "bg-amber-100",
    level: "Basic",
    levelColor: "bg-amber-500",
    rowBg: "bg-amber-50",
    borderColor: "border-amber-500",
  },
  {
    service: "Encryption",
    serviceDetail: "PKI, certificates",
    backup: "Manual backup",
    backupColor: "bg-yellow-100",
    lastTest: "8 months ago",
    testColor: "bg-yellow-100",
    level: "Moderate",
    levelColor: "bg-teal-500",
    rowBg: "bg-teal-50",
    borderColor: "border-teal-500",
  },
];

const COLOR_KEY = [
  { label: "Unprotected", color: "bg-red-500" },
  { label: "Basic", color: "bg-amber-500" },
  { label: "Moderate", color: "bg-teal-500" },
  { label: "Protected", color: "bg-emerald-500" },
];

function FoundationalExposureTable() {
  return (
    <div className="flex gap-3 ml-11">
      <Card className="border border-slate-200 shadow-none overflow-hidden w-full">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-700">Foundational Service Exposure</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              Risk Matrix
            </Badge>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-0 px-4 py-2 border-b bg-slate-50/30">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Service Category</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Backup Status</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[100px]">Last Recovery Test</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[90px] text-right">Protection Level</span>
          </div>

          {/* Data rows */}
          <div className="divide-y divide-slate-100">
            {EXPOSURE_ROWS.map((row) => (
              <div
                key={row.service}
                className={cn(
                  "grid grid-cols-[1fr_1fr_auto_auto] gap-0 items-center border-l-4",
                  row.rowBg,
                  row.borderColor
                )}
              >
                <div className="px-4 py-2.5">
                  <span className="text-xs font-semibold text-slate-800">{row.service}</span>
                  <span className="text-[10px] text-slate-500 ml-1">({row.serviceDetail})</span>
                </div>
                <div className="px-3 py-2.5">
                  <span className={cn("text-[11px] text-slate-700 px-2 py-1 rounded", row.backupColor)}>
                    {row.backup}
                  </span>
                </div>
                <div className="px-3 py-2.5 min-w-[100px]">
                  <span className={cn("text-[11px] text-slate-700 px-2 py-1 rounded", row.testColor)}>
                    {row.lastTest}
                  </span>
                </div>
                <div className="px-4 py-2.5 min-w-[90px] flex justify-end">
                  <span className={cn(
                    "text-[10px] font-semibold text-white px-2.5 py-1 rounded-full",
                    row.levelColor
                  )}>
                    {row.level}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Color key */}
          <div className="px-4 py-2.5 border-t bg-slate-50/50 flex items-center gap-4">
            <span className="text-[10px] font-semibold text-slate-500">Color Key:</span>
            {COLOR_KEY.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={cn("w-4 h-2.5 rounded-sm", item.color)} />
                <span className="text-[10px] text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Foundational Scenario Picker ─────────────────────────────────────────────

const FOUNDATIONAL_SCENARIO_ICONS: Record<FoundationalScenarioId, React.ElementType> = {
  "identity-loss": Shield,
  "network-loss": Zap,
  "encryption-loss": RefreshCw,
  "combined-loss": Target,
};

function FoundationalScenarioPicker({
  onSelect,
}: {
  onSelect: (id: FoundationalScenarioId) => void;
}) {
  const scenarios: FoundationalScenarioId[] = [
    "identity-loss",
    "network-loss",
    "encryption-loss",
    "combined-loss",
  ];

  const severityColors: Record<string, string> = {
    Critical: "bg-red-100 text-red-700",
    High: "bg-orange-100 text-orange-700",
    Catastrophic: "bg-red-200 text-red-800",
  };

  return (
    <div className="flex gap-3 ml-11">
      <div className="space-y-3 w-full">
        <p className="text-xs font-medium text-muted-foreground">
          Select an attack scenario to see the projected impact on your retail operations:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {scenarios.map((id) => {
            const meta = FOUNDATIONAL_SCENARIO_META[id];
            const Icon = FOUNDATIONAL_SCENARIO_ICONS[id];
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="text-left p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-slate-700" />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                      severityColors[meta.severity] || "bg-slate-100 text-slate-700"
                    )}
                  >
                    {meta.severity}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mb-1">
                  {meta.label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {meta.description}
                </p>
              </button>
            );
          })}
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
  const scenarios: ScenarioId[] = ["micro-seg", "edr", "recovery"];

  const riskColors: Record<string, string> = {
    Medium: "bg-slate-100 text-slate-700",
    High: "bg-slate-200 text-slate-800",
    Low: "bg-slate-50 text-slate-600 border border-slate-200",
  };

  return (
    <div className="flex gap-3 ml-11">
      <div className="space-y-3 w-full">
        <p className="text-xs font-medium text-muted-foreground">
          Select a control scenario to see projected impact:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {scenarios.map((id) => {
            const meta = SCENARIO_META[id];
            const Icon = SCENARIO_ICONS[id];
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="text-left p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-slate-700" />
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
                <p className="text-xs font-semibold text-slate-800 mb-1">
                  {meta.label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug mb-2">
                  {meta.description}
                </p>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-slate-500">
                    Outcome:{" "}
                    <span className="font-semibold text-slate-800">
                      {meta.outcome}
                    </span>
                  </span>
                  <span className="text-slate-500">
                    Budget:{" "}
                    <span className="font-semibold text-slate-800">
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

function buildReasoningForFlow(flow: ChatFlow): { factors: ReasoningFactor[]; confidence: number; model: string } {
  // Match flow content to produce contextual reasoning factors
  const r = flow.response;

  if (flow.showAssessmentCard) {
    return {
      factors: [
        { factor: "Assessment Framework", weight: 40, insight: "Initialising cyber risk model with Gartner industry benchmarks for retail sector comparison." },
        { factor: "Attack Surface Proxy", weight: 35, insight: "Control questionnaire maps to risk score using weighted inputs across 12 security dimensions." },
        { factor: "Financial Calibration", weight: 25, insight: "Loss expectancy calculator calibrated for retail sector using business impact per hour and MTCR." },
      ],
      confidence: 94,
      model: "Cyber Risk Assessment Framework v2.1",
    };
  }

  if (r.includes("attack surface ratio")) {
    return {
      factors: [
        { factor: "Endpoint Inventory", weight: 30, insight: "Scanned 24,600 endpoints across 6 retail departments. Coverage validated against asset management database." },
        { factor: "Secured vs Exposed", weight: 35, insight: "Computed ratio using formula: (Total − Secured − Compensating) / Total. Best practice target is <1%." },
        { factor: "Trend Analysis", weight: 20, insight: "6-month trend shows Store Operations improving (15% → 8%), E-Commerce worsening (14% → 21%)." },
        { factor: "Risk Prioritisation", weight: 15, insight: "R&D (43%) and E-Commerce (21%) flagged as highest-risk departments requiring immediate attention." },
      ],
      confidence: 92,
      model: "Attack Surface Analytics v1.3",
    };
  }

  if (r.includes("foundational service exposure")) {
    return {
      factors: [
        { factor: "Backup Assessment", weight: 30, insight: "Identity services have no cyber-tolerant backup. Network and Encryption have standard/manual backups only." },
        { factor: "Recovery Test History", weight: 35, insight: "Identity services have never been tested for recovery. Network last tested 14 months ago." },
        { factor: "Protection Level Scoring", weight: 20, insight: "Protection levels scored across backup completeness, test recency, and automation maturity." },
        { factor: "Dependency Mapping", weight: 15, insight: "All retail operations depend on Identity services — single point of failure across the estate." },
      ],
      confidence: 89,
      model: "Foundational Services Risk Engine v1.2",
    };
  }

  if (r.includes("Loss of Identity Services")) {
    return {
      factors: [
        { factor: "Authentication Dependency", weight: 35, insight: "All 15,000 PoS terminals, e-commerce, and supply chain systems require identity authentication to function." },
        { factor: "Recovery Complexity", weight: 30, insight: "Identity is the hardest service to cleanly recover — MTCR estimated at 168–240 hours due to trust chain rebuild." },
        { factor: "Financial Projection", weight: 20, insight: "Revenue impact of $200,000/hour across all channels produces SLE of $33.6M–$48M." },
        { factor: "Blast Radius Analysis", weight: 15, insight: "Without micro-segmentation, identity compromise enables lateral movement to all connected systems." },
      ],
      confidence: 91,
      model: "Foundational Attack Simulator v1.0",
    };
  }

  if (r.includes("Loss of Network Services")) {
    return {
      factors: [
        { factor: "Connectivity Mapping", weight: 35, insight: "Store-to-HQ, distribution centre, and e-commerce connectivity all depend on DNS/DHCP/SD-WAN services." },
        { factor: "Offline Capability", weight: 25, insight: "Some stores can process cash/offline transactions, reducing revenue impact to $150,000/hour vs full $200,000." },
        { factor: "Recovery Timeline", weight: 25, insight: "Network restoration estimated at 72–120 hours. Supply chain backlog of 3–5 days expected." },
        { factor: "Financial Projection", weight: 15, insight: "SLE range of $10.8M–$18M — lower than identity loss due to partial offline capability." },
      ],
      confidence: 88,
      model: "Foundational Attack Simulator v1.0",
    };
  }

  if (r.includes("Loss of Encryption Services")) {
    return {
      factors: [
        { factor: "PCI-DSS Compliance", weight: 35, insight: "Encryption compromise triggers immediate PCI-DSS compliance breach — all card transactions must halt." },
        { factor: "Data Exposure", weight: 25, insight: "Customer PII, payment card data, and supply chain communications potentially exposed in transit." },
        { factor: "Regulatory Impact", weight: 25, insight: "PCI-DSS fines up to $500K/month plus potential GDPR penalties and mandatory breach notification costs of $2M–$5M." },
        { factor: "Recovery Timeline", weight: 15, insight: "Certificate reissuance and rotation estimated at 48–96 hours. Fastest foundational recovery scenario." },
      ],
      confidence: 90,
      model: "Foundational Attack Simulator v1.0",
    };
  }

  if (r.includes("Combined Loss of Identity + Network")) {
    return {
      factors: [
        { factor: "Cascading Failure", weight: 35, insight: "Identity must be recovered before network can be trusted — creating cascading delay in recovery timeline." },
        { factor: "Total Shutdown", weight: 25, insight: "Zero revenue across all channels. Every PoS, e-commerce, supply chain, and corporate system offline simultaneously." },
        { factor: "Financial Projection", weight: 25, insight: "SLE of $84M–$126M with MTCR of 240–360 hours. Market capitalisation impact potentially $200M+." },
        { factor: "Attack Pattern Match", weight: 15, insight: "This scenario matches Scattered Spider-style attacks that simultaneously target identity and network infrastructure." },
      ],
      confidence: 87,
      model: "Foundational Attack Simulator v1.0",
    };
  }

  if (r.includes("preparing for and recovering from")) {
    return {
      factors: [
        { factor: "BIA Readiness", weight: 30, insight: "Business Impact Analysis identifies minimum viable company — which stores and systems must be operational first." },
        { factor: "Recovery Testing", weight: 30, insight: "Regular testing in Isolated Recovery Environment is the key to reducing actual recovery time." },
        { factor: "Automation Potential", weight: 20, insight: "Automating recovery actions within Cyber Technical Recovery Plans reduces human error and speeds recovery." },
        { factor: "Change Management", weight: 20, insight: "BAU change processes must update recovery plans when infrastructure changes to prevent plan drift." },
      ],
      confidence: 93,
      model: "Recovery Readiness Engine v1.1",
    };
  }

  if (r.includes("Single Loss Expectancy") && r.includes("Annualised Loss Expectancy")) {
    return {
      factors: [
        { factor: "Attack Surface Maturity", weight: 35, insight: "Controls score of 88/120 places organisation in Medium risk band. Key gaps: micro-segmentation and recovery testing." },
        { factor: "Financial Impact Model", weight: 28, insight: "Business impact of $200,000/hr with 168h MTCR produces SLE of $33.6M — above industry median." },
        { factor: "Benchmark Comparison", weight: 22, insight: "Organisation positioned above Gartner industry median for financial exposure in the Medium band." },
        { factor: "Control Effectiveness", weight: 15, insight: "Three key controls identified that could reduce ALE by up to 86% if fully implemented." },
      ],
      confidence: 91,
      model: "Cyber Risk Financial Model v2.1",
    };
  }

  if (flow.showControlsPanel || r.includes("materially reduce")) {
    return {
      factors: [
        { factor: "Micro-segmentation Impact", weight: 40, insight: "Reduces blast radius by 50%, cutting SLE from $33.6M to $16.8M through lateral movement containment." },
        { factor: "EDR Coverage Impact", weight: 25, insight: "Full EDR coverage reduces detection time from 72h to 4h, decreasing SLE by 30%." },
        { factor: "Recovery Programme", weight: 20, insight: "Tested cyber-tolerant recovery reduces MTCR from 168h to 67h, directly reducing financial exposure." },
        { factor: "Combined Effect", weight: 15, insight: "All three controls together reduce ALE from $1.68M to approximately $235K — an 86% reduction." },
      ],
      confidence: 96,
      model: "Control Impact Engine v1.4",
    };
  }

  if (r.includes("cyber attack") && r.includes("blast radius")) {
    return {
      factors: [
        { factor: "Attack Propagation", weight: 35, insight: "Without controls, lateral movement spans 12 connected systems. With micro-segmentation, contained to 1 segment." },
        { factor: "Detection Speed", weight: 25, insight: "EDR reduces detection from 72 hours to 4 hours, limiting attacker dwell time significantly." },
        { factor: "Recovery Speed", weight: 25, insight: "Tested recovery brings systems back in 67 hours instead of 168, cutting outage duration by 60%." },
        { factor: "Financial Delta", weight: 15, insight: "Total impact drops from $33.6M to $4.7M when all three controls are in place." },
      ],
      confidence: 94,
      model: "Threat Simulation Engine v1.2",
    };
  }

  if (flow.showNBACards) {
    return {
      factors: [
        { factor: "Risk Ranking", weight: 35, insight: "Controls ranked by financial impact — micro-segmentation delivers highest SLE reduction at 50%." },
        { factor: "Confidence Scoring", weight: 25, insight: "Each workstream scored against industry validation data. Micro-segmentation at 92%, EDR at 88%, Recovery at 85%." },
        { factor: "Investment Mapping", weight: 25, insight: "Each workstream mapped to measurable risk reduction with clear before/after financial projections." },
        { factor: "Execution Readiness", weight: 15, insight: "All workstreams can be initiated immediately with existing infrastructure and vendor relationships." },
      ],
      confidence: 90,
      model: "Next Best Action Engine v1.3",
    };
  }

  if (flow.offerScenarios) {
    return {
      factors: [
        { factor: "Risk Aggregation", weight: 30, insight: "Combined cyber risk metrics place organisation in Medium risk band with ALE of $1,680,000." },
        { factor: "Posture Evaluation", weight: 30, insight: "Primary gaps identified in attack surface controls and recovery capabilities across retail estate." },
        { factor: "Scenario Modelling", weight: 25, insight: "Three strategic scenarios prepared with measurable risk-reward tradeoffs for executive decision-making." },
        { factor: "Control Projections", weight: 15, insight: "Each scenario shows specific control investment mapped to projected financial risk reduction." },
      ],
      confidence: 89,
      model: "Strategic Scenario Engine v1.1",
    };
  }

  // Default reasoning for any other flow
  return {
    factors: [
      { factor: "Knowledge Base", weight: 40, insight: "Response generated from cyber risk knowledge base covering retail-specific threat landscape and controls." },
      { factor: "Context Analysis", weight: 35, insight: "User query analysed against available assessment data and current security posture." },
      { factor: "Industry Alignment", weight: 25, insight: "Recommendations aligned with retail sector best practices and Gartner benchmarks." },
    ],
    confidence: 85,
    model: "Cyber Risk Agent v2.0",
  };
}
