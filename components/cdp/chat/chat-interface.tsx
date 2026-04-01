"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MdOutlineSend, MdOutlineRefresh, MdOutlineFiberManualRecord, MdOutlineTrendingUp, MdOutlineGpsFixed,
  MdOutlineShowChart, MdOutlineVerifiedUser, MdOutlineBarChart, MdOutlinePieChart, MdOutlineKeyboardArrowDown,
  MdOutlinePlayArrow, MdOutlineClose, MdOutlineMonitor, MdOutlineStorage, MdOutlinePersonSearch,
  MdOutlineGroup, MdOutlineCampaign, MdOutlineGppBad, MdOutlineWarning, MdOutlineChecklist,
  MdOutlineAutoAwesome, MdOutlineLightbulb,
} from "react-icons/md";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useArtifacts } from "@/lib/artifact-store";
import { useAuth } from "@/lib/auth-context";
import {
  GraphInstanceDialog,
  type GraphInstancePrefill,
} from "@/components/knowledge-graph/graph-instance-dialog";
import { createKnowledgeGraphInstanceHref } from "@/lib/knowledge-graph-instances";
import {
  buildIncrementalityDraftInputFromAction,
  buildIncrementalityExperimentHrefForExperiment,
  useIncrementalityExperiments,
} from "@/lib/incrementality-store";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import { buildExecutionPreviewSrc } from "./execution-preview-data";
import { ChatMessage, type Message } from "./chat-message";
import { SubwayMapBackground } from "./subway-map-bg";
import {
  CHAT_PERSONA_OPTIONS,
  WELCOME_HEADING,
  UNIFIED_DOMAIN_PROMPT_CARDS,
  getWarningActionFlow,
  getWarningActionPrompt,
  getAllNBAsForPersona,
  getNBAById,
  getNBAsByScenario,
  getExecutionFlowByActionId,
  getReviewRequestFlowByActionId,
  getScenarioFlowForPersona,
  getScenarioMetaForPersona,
  getWelcomePromptCardsForPersona,
  isWarningActionId,
  matchFlowForPersona,
  CREATE_KNOWLEDGE_GRAPH_PROMPT,
  EXECUTION_FLOWS,
  getScenarioIdFromFlow,
  getNBAIdFromFlow,
  SCENARIO_ARTIFACTS,
  EXECUTION_ARTIFACTS,
  type ChatPersona,
  type ChatFlow,
  type ScenarioId,
  type NBAAction,
  type NBAActionId,
  type NBAActionIntent,
  type SuggestedPromptCard,
  type SuggestedPromptDomain,
  type SnapshotType,
  type ReportCardType,
} from "./chat-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


let messageCounter = 0;
function nextId() {
  return `msg-${++messageCounter}-${Date.now()}`;
}

// ── Session persistence helpers ─────────────────────────────────────────────

const CHAT_STORAGE_KEY = "kyn-chat-history";
const CHAT_PERSONA_STORAGE_PREFIX = "kyn-chat-persona";

function getChatStorageKey(username?: string) {
  return username ? `${CHAT_STORAGE_KEY}:${username}` : `${CHAT_STORAGE_KEY}:guest`;
}

interface SerializedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sourceTag?: string;
  warningActionId?: string;
  snapshots?: string[];
  reportCard?: ReportCardType;
  status?: "streaming" | "complete";
  agentSteps?: string[];
  actions?: Array<{ label: string; href: string }>;
  linkedExperimentId?: string;
  linkedExperimentHref?: string;
  linkedAudienceLabel?: string;
  linkedControlLabel?: string;
  linkedScopeLabel?: string;
  executionPreview?: Message["executionPreview"];
}

function saveMessages(storageKey: string, messages: Message[]) {
  try {
    const serialized: SerializedMessage[] = messages.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
      status: "complete" as const,
      // Convert snapshots to string[] if present
      snapshots: m.snapshots ? m.snapshots.map(s => s as string) : undefined,
      reportCard: m.reportCard,
      actions: m.actions,
      linkedExperimentId: m.linkedExperimentId,
      linkedExperimentHref: m.linkedExperimentHref,
      linkedAudienceLabel: m.linkedAudienceLabel,
      linkedControlLabel: m.linkedControlLabel,
      linkedScopeLabel: m.linkedScopeLabel,
      executionPreview: m.executionPreview,
    }));
    sessionStorage.setItem(storageKey, JSON.stringify(serialized));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

function loadMessages(storageKey: string): Message[] {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: SerializedMessage[] = JSON.parse(raw);
    return parsed.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
      status: "complete" as const,
      // Convert snapshots to SnapshotType[] if present
      snapshots: m.snapshots ? m.snapshots.map(s => s as SnapshotType) : undefined,
      reportCard: m.reportCard,
      actions: m.actions,
      linkedExperimentId: m.linkedExperimentId,
      linkedExperimentHref: m.linkedExperimentHref,
      linkedAudienceLabel: m.linkedAudienceLabel,
      linkedControlLabel: m.linkedControlLabel,
      linkedScopeLabel: m.linkedScopeLabel,
      executionPreview: m.executionPreview,
    }));
  } catch {
    return [];
  }
}

/**
 * Migrate old omnis storage keys to new kyn storage keys (one-time operation)
 * Ensures backward compatibility with downloaded logs and sessions from before rebranding
 */
function migrateStorageKeys(targetChatKey: string) {
  if (typeof sessionStorage === "undefined") return;
  
  const OLD_CHAT_KEY = "omnis-chat-history";
  const LEGACY_CHAT_KEY = "kyn-chat-history";
  const OLD_PERSONA_PREFIX = "omnis-chat-persona";
  const NEW_CHAT_KEY = targetChatKey;
  const NEW_PERSONA_PREFIX = CHAT_PERSONA_STORAGE_PREFIX;
  
  // Migrate main chat history
  const legacyChatData = sessionStorage.getItem(LEGACY_CHAT_KEY);
  const oldChatData = sessionStorage.getItem(OLD_CHAT_KEY);
  if (!sessionStorage.getItem(NEW_CHAT_KEY)) {
    if (legacyChatData) {
      sessionStorage.setItem(NEW_CHAT_KEY, legacyChatData);
    } else if (oldChatData) {
      sessionStorage.setItem(NEW_CHAT_KEY, oldChatData);
    }
  }

  sessionStorage.removeItem(LEGACY_CHAT_KEY);
  sessionStorage.removeItem(OLD_CHAT_KEY);
  
  // Migrate persona profiles (they're keyed by suffix, so we need to find all)
  const keysToDelete: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(OLD_PERSONA_PREFIX)) {
      const suffix = key.substring(OLD_PERSONA_PREFIX.length);
      const newKey = NEW_PERSONA_PREFIX + suffix;
      const wasEmpty = !sessionStorage.getItem(newKey);
      if (wasEmpty) {
        const value = sessionStorage.getItem(key);
        if (value) sessionStorage.setItem(newKey, value);
      }
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => sessionStorage.removeItem(key));
}

type AgentPhase = "idle" | "thinking" | "tool_call" | "streaming" | "complete";

const SCENARIO_ICONS: Record<ScenarioId, React.ElementType> = {
  profit: MdOutlineTrendingUp,
  acquisition: MdOutlineGpsFixed,
  retention: MdOutlineShowChart,
};

const PROMPT_ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp:    MdOutlineTrendingUp,
  Target:        MdOutlineGpsFixed,
  ShieldCheck:   MdOutlineVerifiedUser,
  BarChart3:     MdOutlineBarChart,
  AiRecommend:   MdOutlineAutoAwesome,
  PieChart:      MdOutlinePieChart,
  Monitor:       MdOutlineMonitor,
  Database:      MdOutlineStorage,
  ScanFace:      MdOutlinePersonSearch,
  Users:         MdOutlineGroup,
  Megaphone:     MdOutlineCampaign,
  ShieldAlert:   MdOutlineGppBad,
  AlertTriangle: MdOutlineWarning,
  ClipboardList: MdOutlineChecklist,
};

const DOMAIN_TAG_STYLES: Record<SuggestedPromptDomain, { label: string; className: string }> = {
  platform: { label: "Platform", className: "bg-stone-700 text-white" },
  demand:   { label: "Demand",   className: "bg-stone-100 text-stone-600 border border-stone-200" },
  udp:      { label: "UDP",      className: "bg-stone-100 text-stone-600 border border-stone-200" },
  campaign: { label: "Campaign", className: "bg-stone-100 text-stone-600 border border-stone-200" },
};

function getGraphDomainFromPromptDomain(
  domain: SuggestedPromptDomain | "all",
): GraphInstancePrefill["domain"] {
  if (domain === "udp") return "udp";
  if (domain === "demand") return "demand";
  return "cross-domain";
}

function isCreateKnowledgeGraphPrompt(value: string) {
  return value.trim().toLowerCase().startsWith(CREATE_KNOWLEDGE_GRAPH_PROMPT.toLowerCase());
}

export function ChatInterface({ 
  onWorkflowEvent,
  onClearChat,
  initialMessage,
  initialWarningActionId,
  initialExecutionActionId,
  initialExecutionIntent,
  initialLaunchToken,
}: { 
  onWorkflowEvent?: (event: string) => void;
  onClearChat?: () => void;
  initialMessage?: string;
  initialWarningActionId?: string;
  initialExecutionActionId?: NBAActionId;
  initialExecutionIntent?: NBAActionIntent;
  initialLaunchToken?: number;
} = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<AgentPhase>("idle");
  const [currentStep, setCurrentStep] = useState("");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);
  const [showMorePrompts, setShowMorePrompts] = useState(false);
  const [promptDomainFilter, setPromptDomainFilter] = useState<SuggestedPromptDomain | "all">("all");
  const [isGraphDialogOpen, setIsGraphDialogOpen] = useState(false);
  const [graphPrefill, setGraphPrefill] = useState<GraphInstancePrefill | undefined>(undefined);
  const [activeNBAs, setActiveNBAs] = useState<NBAAction[]>([]);
  const [showNBACards, setShowNBACards] = useState(false);
  const [lastCompletedFlow, setLastCompletedFlow] = useState<ChatFlow | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const hasAutoFiredInitialMessageRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const lastProcessedExecutionLaunchTokenRef = useRef<number | null>(null);
  const { addArtifacts } = useArtifacts();
  const lastUserPromptRef = useRef("");
  const { user } = useAuth();
  const { createExperiment } = useIncrementalityExperiments();
  const canExecuteAI = user ? hasPermissionForUser(user, "ai_action_execute") : false;
  const [activePersona, setActivePersona] = useState<ChatPersona>("marketer");

  const personaStorageKey = user
    ? `${CHAT_PERSONA_STORAGE_PREFIX}:${user.username}`
    : `${CHAT_PERSONA_STORAGE_PREFIX}:guest`;
  const chatStorageKey = getChatStorageKey(user?.username);

  // Migrate old storage keys on first mount (one-time operation for backward compatibility)
  useEffect(() => {
    migrateStorageKeys(chatStorageKey);
  }, [chatStorageKey]);

  useEffect(() => {
    if (!user) {
      setActivePersona("marketer");
      return;
    }
    const defaultPersona = user.defaultChatPersona ?? "marketer";
    try {
      const storedPersona = sessionStorage.getItem(personaStorageKey) as ChatPersona | null;
      if (storedPersona && CHAT_PERSONA_OPTIONS.some((option) => option.value === storedPersona)) {
        setActivePersona(storedPersona);
        return;
      }
    } catch {
      // ignore storage read errors
    }
    setActivePersona(defaultPersona);
  }, [user, personaStorageKey]);

  useEffect(() => {
    setMessages(loadMessages(chatStorageKey));
  }, [chatStorageKey]);

  const handlePersonaChange = useCallback((persona: ChatPersona) => {
    setActivePersona(persona);
    setShowNBACards(false);
    setActiveNBAs([]);
    setShowScenarioPicker(false);
    try {
      sessionStorage.setItem(personaStorageKey, persona);
    } catch {
      // ignore storage write errors
    }
  }, [personaStorageKey]);

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

  // Keep ref in sync so callbacks can access latest messages without stale closure
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    const completeMessages = messages.filter((m) => m.status === "complete" && m.content);
    if (completeMessages.length > 0) {
      saveMessages(chatStorageKey, completeMessages);
    }
  }, [messages, chatStorageKey]);

  // ── Streaming simulation ────────────────────────────────────────────────

  const simulateResponse = useCallback(
    async (flow: ChatFlow) => {
      abortRef.current = false;
      setShowScenarioPicker(false);
      setShowNBACards(false);
      setActiveNBAs([]);

      setPhase("thinking");
      setCompletedSteps([]);
      await delay(600);
      if (abortRef.current) return;

      const initialNBAId = getNBAIdFromFlow(flow);
      if (initialNBAId && onWorkflowEvent) {
        onWorkflowEvent(`EXECUTION_STARTED:${initialNBAId}`);
      }

      const linkedExperiment =
        initialNBAId
          ? (() => {
              const draftInput = buildIncrementalityDraftInputFromAction(
                initialNBAId,
                user?.username || "UDP Control Tower",
              );
              return draftInput ? createExperiment(draftInput) : null;
            })()
          : null;

      // Emit agent steps as workflow events
      for (const step of flow.agentSteps) {
        setPhase("tool_call");
        setCurrentStep(step);
        if (onWorkflowEvent) onWorkflowEvent(step);
        await delay(800 + Math.random() * 400);
        if (abortRef.current) return;
        setCompletedSteps((prev) => [...prev, step]);
      }

      setPhase("streaming");
      setCurrentStep("");
      const assistantId = nextId();
      const executionPreview = initialNBAId
        ? {
            actionId: initialNBAId,
            title: getNBAById(initialNBAId)?.title ?? "Execution Preview",
            iframeSrc: buildExecutionPreviewSrc(
              initialNBAId,
              assistantId,
              linkedExperiment?.id,
            ),
          }
        : undefined;
      const experimentHref = linkedExperiment
        ? buildIncrementalityExperimentHrefForExperiment(linkedExperiment)
        : undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          snapshots: flow.snapshots,
          reportCard: flow.reportCard,
          status: "streaming",
          agentSteps: flow.agentSteps,
          actions: experimentHref
            ? [{ label: "Open experiment", href: experimentHref }]
            : undefined,
          linkedExperimentId: linkedExperiment?.id,
          linkedExperimentHref: experimentHref,
          linkedAudienceLabel: linkedExperiment?.primaryAudienceLabel,
          linkedControlLabel: linkedExperiment?.controlAudienceLabel,
          linkedScopeLabel: linkedExperiment?.impactedCustomerScope,
          executionPreview,
        },
      ]);

      // Emit snapshot events
      if (flow.snapshots && onWorkflowEvent) {
        for (const snapshot of flow.snapshots) {
          onWorkflowEvent(snapshot);
        }
      }

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
            workflowEvents: [...flow.agentSteps, ...(flow.snapshots ?? [])],
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
            workflowEvents: [...flow.agentSteps, ...(flow.snapshots ?? [])],
          })),
        );

        if (onWorkflowEvent) {
          onWorkflowEvent(`EXECUTION_COMPLETED:${nbaId}`);
        }
      }

      if (flow.offerScenarios) {
        setShowScenarioPicker(true);
      }

      // Show NBA cards if the flow requests them
      if (flow.showNBACards) {
        const nbas =
          flow.showNBACards === "all"
            ? getAllNBAsForPersona(activePersona)
            : getNBAsByScenario(flow.showNBACards, activePersona);
        setActiveNBAs(nbas);
        setShowNBACards(true);
      }
    },
    [onWorkflowEvent, addArtifacts, activePersona, createExperiment, user]
  );

  // ── LLM streaming (real API) ────────────────────────────────────────────

  const callLLMAndStream = useCallback(
    async (flow: ChatFlow, userMessage: string) => {
      // Execution and scenario flows have agent steps / snapshots — delegate to
      // simulateResponse so artifacts, NBA cards, and execution previews all work.
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
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          status: "streaming",
        },
      ]);

      // LLM path — only general Q&A reaches here (scripted flows returned early above)
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
          body: JSON.stringify({
            messages: apiMessages,
            userRole: user?.role ?? "general",
            persona: activePersona,
          }),
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
              if (parsed.error) {
                console.error("[chat] API error from server:", parsed.error);
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulated += parsed.text;
                streamSucceeded = true;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: accumulated } : m
                  )
                );
              }
            } catch (parseErr) {
              if ((parseErr as Error).message?.includes("API error")) throw parseErr;
              // skip genuinely malformed chunks
            }
          }
        }
      } catch (err) {
        console.error("[chat] API call failed:", err);
        apiError = String(err);
      }

      if (abortRef.current) return;

      if (!streamSucceeded) {
        const errorText = `⚠️ **LLM unavailable** — ${apiError || "no response received"}\n\nCheck the terminal running \`npm run dev\` for errors, and ensure OPENAI_API_KEY in \`.env.local\` is valid.`;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: errorText } : m
          )
        );
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
    },
    [user, activePersona, onWorkflowEvent, simulateResponse]
  );

  // ── Execute NBA action ──────────────────────────────────────────────────

  const handleNBAExecute = useCallback(
    (action: NBAAction) => {
      if (phase !== "idle") return;

      if (!canExecuteAI) {
        setShowNBACards(false);
        setActiveNBAs([]);

        const userMsg: Message = {
          id: nextId(),
          role: "user",
          content: `Send for review: ${action.title}`,
          timestamp: new Date(),
          status: "complete",
        };

        const flow = getReviewRequestFlowByActionId(action.id);
        if (!flow) {
          const fallbackMsg: Message = {
            id: nextId(),
            role: "assistant",
            content: "This action requires approval, but no review flow is configured yet.",
            timestamp: new Date(),
            status: "complete",
          };
          setMessages((prev) => [...prev, userMsg, fallbackMsg]);
          return;
        }

        setMessages((prev) => [...prev, userMsg]);
        lastUserPromptRef.current = `Send for review: ${action.title}`;
        if (onWorkflowEvent) onWorkflowEvent(`REVIEW_REQUESTED: ${action.title}`);
        simulateResponse(flow);
        return;
      }

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
    [phase, canExecuteAI, onWorkflowEvent, simulateResponse]
  );

  const handleNBASendForReview = useCallback(
    (action: NBAAction) => {
      if (phase !== "idle") return;

      setShowNBACards(false);
      setActiveNBAs([]);

      const userMsg: Message = {
        id: nextId(),
        role: "user",
        content: `Send for review: ${action.title}`,
        timestamp: new Date(),
        status: "complete",
      };
      const flow = getReviewRequestFlowByActionId(action.id);

      if (!flow) {
        const fallbackMsg: Message = {
          id: nextId(),
          role: "assistant",
          content: "Sent for review. A marketing admin will confirm before execution.",
          timestamp: new Date(),
          status: "complete",
        };
        setMessages((prev) => [...prev, userMsg, fallbackMsg]);
        if (onWorkflowEvent) onWorkflowEvent(`REVIEW_REQUESTED: ${action.title}`);
        return;
      }

      setMessages((prev) => [...prev, userMsg]);
      lastUserPromptRef.current = `Send for review: ${action.title}`;
      if (onWorkflowEvent) onWorkflowEvent(`REVIEW_REQUESTED: ${action.title}`);
      simulateResponse(flow);
    },
    [phase, onWorkflowEvent, simulateResponse]
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

      if (isCreateKnowledgeGraphPrompt(value)) {
        const assistantMsg: Message = {
          id: nextId(),
          role: "assistant",
          content:
            "I can save this as a reusable knowledge graph workspace. Fill in the graph details and I’ll add it to the control tower library.",
          timestamp: new Date(),
          status: "complete",
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setInput("");
        lastUserPromptRef.current = value;
        setGraphPrefill({
          domain: getGraphDomainFromPromptDomain(promptDomainFilter),
          sourcePrompt: value,
        });
        setIsGraphDialogOpen(true);
        return;
      }

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      lastUserPromptRef.current = value;

      const flow = matchFlowForPersona(value, activePersona);
      callLLMAndStream(flow, value);
    },
    [input, phase, callLLMAndStream, activePersona, promptDomainFilter]
  );

  const handleActionLaunch = useCallback(
    (
      actionId: NBAActionId,
      intent: NBAActionIntent = "execute",
      sourceTag: string = "Started from recommendation"
    ) => {
      if (phase !== "idle") return;

      setShowScenarioPicker(false);
      setShowNBACards(false);
      setActiveNBAs([]);

      const action = getNBAById(actionId);
      const actionTitle = action?.title ?? actionId;
      const wantsExecute = intent === "execute";
      const canRunExecute = wantsExecute && canExecuteAI;

      const flow = canRunExecute
        ? getExecutionFlowByActionId(actionId)
        : getReviewRequestFlowByActionId(actionId);

      const userContent = canRunExecute
        ? `Execute: ${actionTitle}`
        : `Send for review: ${actionTitle}`;

      const userMsg: Message = {
        id: nextId(),
        role: "user",
        content: userContent,
        timestamp: new Date(),
        sourceTag,
        status: "complete",
      };

      if (!flow) {
        const fallbackMsg: Message = {
          id: nextId(),
          role: "assistant",
          content: canRunExecute
            ? "I couldn't find an execution flow for this action yet."
            : "This action can't be executed directly by your role and no review flow is configured yet.",
          timestamp: new Date(),
          status: "complete",
        };
        setMessages((prev) => [...prev, userMsg, fallbackMsg]);
        return;
      }

      setMessages((prev) => [...prev, userMsg]);
      lastUserPromptRef.current = userContent;

      if (!canRunExecute && onWorkflowEvent) {
        onWorkflowEvent(`REVIEW_REQUESTED: ${actionTitle}`);
      }

      simulateResponse(flow);
    },
    [phase, canExecuteAI, onWorkflowEvent, simulateResponse]
  );

  useEffect(() => {
    if (!initialExecutionActionId) return;
    if (phase !== "idle") return;
    if (typeof initialLaunchToken !== "number") return;
    if (lastProcessedExecutionLaunchTokenRef.current === initialLaunchToken) return;

    const timer = setTimeout(() => {
      lastProcessedExecutionLaunchTokenRef.current = initialLaunchToken;
      handleActionLaunch(
        initialExecutionActionId,
        initialExecutionIntent ?? "execute"
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [
    initialExecutionActionId,
    initialExecutionIntent,
    initialLaunchToken,
    phase,
    handleActionLaunch,
  ]);

  useEffect(() => {
    if (!initialWarningActionId) return;
    if (!isWarningActionId(initialWarningActionId)) return;
    if (initialExecutionActionId) return;
    if (hasAutoFiredInitialMessageRef.current) return;
    if (phase !== "idle") return;

    const timer = setTimeout(() => {
      const flow = getWarningActionFlow(initialWarningActionId);
      const prompt = (initialMessage?.trim() || getWarningActionPrompt(initialWarningActionId)).trim();
      if (!prompt) return;

      hasAutoFiredInitialMessageRef.current = true;
      setShowScenarioPicker(false);
      setShowNBACards(false);
      setActiveNBAs([]);

      const userMsg: Message = {
        id: nextId(),
        role: "user",
        content: prompt,
        timestamp: new Date(),
        sourceTag: "Started from dashboard recommendation",
        warningActionId: initialWarningActionId,
        status: "complete",
      };

      setMessages((prev) => [...prev, userMsg]);
      lastUserPromptRef.current = prompt;
      simulateResponse(flow);
    }, 500);

    return () => clearTimeout(timer);
  }, [initialWarningActionId, initialMessage, initialExecutionActionId, phase, simulateResponse]);

  useEffect(() => {
    if (initialWarningActionId && isWarningActionId(initialWarningActionId)) return;
    if (initialExecutionActionId) return;
    if (!initialMessage) return;
    if (hasAutoFiredInitialMessageRef.current) return;
    if (messages.length > 0 || phase !== "idle") return;

    const timer = setTimeout(() => {
      hasAutoFiredInitialMessageRef.current = true;
      handleSend(initialMessage);
    }, 500);

    return () => clearTimeout(timer);
  }, [initialWarningActionId, initialExecutionActionId, initialMessage, messages.length, phase, handleSend]);

  const handleScenarioSelect = useCallback(
    (scenarioId: ScenarioId) => {
      if (phase !== "idle") return;

      setShowScenarioPicker(false);
      const scenarioMeta = getScenarioMetaForPersona(activePersona);
      const meta = scenarioMeta[scenarioId];

      const userMsg: Message = {
        id: nextId(),
        role: "user",
        content: `Run the "${meta.label}" scenario`,
        timestamp: new Date(),
        status: "complete",
      };

      setMessages((prev) => [...prev, userMsg]);
      lastUserPromptRef.current = `Run the "${meta.label}" scenario`;
      const flow = getScenarioFlowForPersona(activePersona, scenarioId);
      simulateResponse(flow);
    },
    [phase, simulateResponse, activePersona]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setShowNBACards(false);
    setActiveNBAs([]);
    try {
      sessionStorage.removeItem(chatStorageKey);
    } catch {}
    // Reset the DAG when chat is cleared
    if (onClearChat) {
      onClearChat();
    }
  }, [onClearChat, chatStorageKey]);

  const isIdle = phase === "idle";
  const showWelcome = messages.length === 0 && isIdle;

  const followUps =
    isIdle && !showScenarioPicker && !showNBACards && messages.length > 0 && lastCompletedFlow?.followUps?.length
      ? lastCompletedFlow.followUps
      : null;

  const isCrossDomainRole =
    user?.role === "super_admin" || user?.role === "platform_admin";

  const welcomePromptCards = isCrossDomainRole
    ? UNIFIED_DOMAIN_PROMPT_CARDS
    : getWelcomePromptCardsForPersona(activePersona);

  const filteredPromptCards =
    promptDomainFilter === "all"
      ? welcomePromptCards
      : welcomePromptCards.filter((c) => c.domain === promptDomainFilter);

  const visiblePrompts = showMorePrompts
    ? filteredPromptCards
    : filteredPromptCards.slice(0, 6);

  return (
    <div className="relative flex flex-col h-[calc(100vh-5.5rem)] -m-6 bg-background">
      {/* Full-panel background */}
      <SubwayMapBackground />
      {/* Agent activity + controls bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-stone-50/60 text-xs text-muted-foreground shrink-0">
        {!isIdle && (
          <>
            <MdOutlineFiberManualRecord className="h-3 w-3 text-amber-500" />
            <span>
              {phase === "thinking" && "Agent thinking..."}
              {phase === "tool_call" && "Processing..."}
              {phase === "streaming" && "Generating response..."}
              {phase === "complete" && "Complete"}
            </span>
          </>
        )}

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
                  <MdOutlineRefresh className="h-2.5 w-2.5 animate-spin" />
                  {currentStep}
                </span>
              )}
            </div>
          )}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground">Recommendation profile</span>
          <Select value={activePersona} onValueChange={(value) => handlePersonaChange(value as ChatPersona)}>
            <SelectTrigger className="h-7 w-[170px] text-[11px]">
              <SelectValue placeholder="Select profile" />
            </SelectTrigger>
            <SelectContent>
              {CHAT_PERSONA_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="h-7 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            <MdOutlineRefresh className="h-3 w-3 mr-1" />
            Clear chat
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome state */}
          {showWelcome && (
            <div className="flex flex-col items-center">
              {/* Sticky header: heading + input + filters */}
              <div className="sticky top-0 z-10 w-full flex flex-col items-center gap-4 bg-background/95 backdrop-blur-sm pt-10 pb-5">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {WELCOME_HEADING}
                </h2>

                <div className="w-full max-w-xl">
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
                      <MdOutlineSend className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Domain filter pills (cross-domain roles only) */}
                {isCrossDomainRole && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: "all", label: "All" },
                        { id: "platform", label: "Platform" },
                        { id: "demand", label: "Demand" },
                        { id: "udp", label: "UDP" },
                        { id: "campaign", label: "Campaign" },
                      ] as Array<{ id: SuggestedPromptDomain | "all"; label: string }>
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setPromptDomainFilter(opt.id);
                          setShowMorePrompts(false);
                        }}
                        className={cn(
                          "rounded-full border px-3 py-1 text-[11px] font-medium transition",
                          promptDomainFilter === opt.id
                            ? "border-stone-700 bg-stone-700 text-white"
                            : "border-stone-200 bg-white/80 text-stone-500 hover:border-stone-400 hover:text-stone-700",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground font-medium tracking-wide">
                  Suggested questions
                </p>
              </div>

              {/* Scrollable cards */}
              <div className="flex flex-col items-center gap-4 w-full pt-4 pb-10">
                <div className="grid grid-cols-3 gap-3 max-w-xl w-full">
                  {visiblePrompts.map((card) => (
                    <PromptCard
                      key={card.prompt}
                      card={card}
                      showDomainTag={promptDomainFilter === "all"}
                      onClick={() => handleSend(card.prompt)}
                    />
                  ))}
                </div>

                {filteredPromptCards.length > 6 && !showMorePrompts && (
                  <button
                    onClick={() => setShowMorePrompts(true)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    See more <MdOutlineKeyboardArrowDown className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Scenario picker */}
          {showScenarioPicker && isIdle && (
            <ScenarioPicker
              onSelect={handleScenarioSelect}
              scenarioMeta={getScenarioMetaForPersona(activePersona)}
            />
          )}

          {/* NBA action cards */}
          {showNBACards && isIdle && activeNBAs.length > 0 && (
            <NBAActionCards
              actions={activeNBAs}
              onExecute={handleNBAExecute}
              onReview={handleNBASendForReview}
              onDismiss={handleNBADismiss}
              canExecute={canExecuteAI}
            />
          )}

          {/* Agent processing indicator */}
          {(phase === "thinking" || phase === "tool_call") && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                  <MdOutlineRefresh className="h-4 w-4 animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-2xl rounded-bl-md bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MdOutlineRefresh className="h-3.5 w-3.5 animate-spin" />
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
                className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-600"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar (conversation mode — hidden on welcome) */}
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
                  ? "Ask me anything about your business..."
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
              <MdOutlineSend className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <GraphInstanceDialog
        open={isGraphDialogOpen}
        onOpenChange={setIsGraphDialogOpen}
        source="chat"
        prefill={graphPrefill}
        onCreated={(instance) => {
          setGraphPrefill(undefined);
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: "assistant",
              content: `Saved **${instance.title}** to the shared control tower graph library.`,
              timestamp: new Date(),
              status: "complete",
              actions: [
                { label: "Open saved graph", href: createKnowledgeGraphInstanceHref(instance.id) },
                { label: "Open library", href: "/dashboard/graphs" },
              ],
            },
          ]);
        }}
      />
    </div>
  );
}

// ── Prompt Card ──────────────────────────────────────────────────────────────

function PromptCard({
  card,
  showDomainTag,
  onClick,
}: {
  card: SuggestedPromptCard;
  showDomainTag?: boolean;
  onClick: () => void;
}) {
  const Icon = PROMPT_ICON_MAP[card.icon] || MdOutlineLightbulb;

  // Bold specific words in the label
  const labelParts = renderBold(card.label, card.boldWords ?? []);

  const domainTag = showDomainTag && card.domain ? DOMAIN_TAG_STYLES[card.domain] : null;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2.5 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all text-left group"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
          <Icon className="h-4 w-4 text-slate-700" />
        </div>
        {domainTag && (
          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide", domainTag.className)}>
            {domainTag.label}
          </span>
        )}
      </div>
      <p className="text-xs leading-snug text-slate-700">{labelParts}</p>
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
      <strong key={i} className="font-semibold text-slate-900">
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
  onReview,
  onDismiss,
  canExecute,
}: {
  actions: NBAAction[];
  onExecute: (action: NBAAction) => void;
  onReview: (action: NBAAction) => void;
  onDismiss: (id: NBAActionId) => void;
  canExecute: boolean;
}) {
  return (
    <div className="flex gap-3 ml-11">
      <div className="space-y-3 w-full">
        <p className="text-xs font-medium text-muted-foreground">
          {canExecute
            ? "Recommended actions — click Execute to activate:"
            : "Recommended actions — click Send for review to request execution:"}
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
                    <span className="font-medium text-slate-600">Segment:</span>{" "}
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
                {canExecute ? (
                  <button
                    onClick={() => onExecute(action)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 text-white text-[11px] font-medium hover:bg-slate-900 transition-colors"
                  >
                    <MdOutlinePlayArrow className="h-3 w-3" />
                    Execute
                  </button>
                ) : (
                  <button
                    onClick={() => onReview(action)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 text-[11px] font-medium hover:bg-red-100 hover:border-red-300 transition-colors"
                  >
                    <MdOutlineVerifiedUser className="h-3 w-3" />
                    Send for review
                  </button>
                )}
                <button
                  onClick={() => onDismiss(action.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-slate-500 text-[11px] font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <MdOutlineClose className="h-3 w-3" />
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
  scenarioMeta,
}: {
  onSelect: (id: ScenarioId) => void;
  scenarioMeta: Record<ScenarioId, { label: string; description: string; risk: string; outcome: string; budget: string }>;
}) {
  const scenarios: ScenarioId[] = ["profit", "acquisition", "retention"];

  const riskColors: Record<string, string> = {
    Medium: "bg-slate-100 text-slate-700",
    High: "bg-slate-200 text-slate-800",
    Low: "bg-slate-50 text-slate-600 border border-slate-200",
  };

  return (
    <div className="flex gap-3 ml-11">
      <div className="space-y-3 w-full">
        <p className="text-xs font-medium text-muted-foreground">
          Select a scenario to see projected impact:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {scenarios.map((id) => {
            const meta = scenarioMeta[id];
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
