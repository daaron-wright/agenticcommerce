"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ChatInterface } from "@/components/cdp/chat/chat-interface";
import { isNBAActionId, type NBAActionId, type NBAActionIntent } from "@/components/cdp/chat/chat-data";
import { useWorkflowEvents } from "@/lib/workflow-event-context";
import { ExecutionProvider } from "@/lib/risk/execution-store";

const RiskChatInterface = dynamic(
  () => import("@/components/risk/chat/chat-interface").then((m) => ({ default: m.ChatInterface })),
  { ssr: false }
);

const DemandChatInterface = dynamic(
  () => import("@/components/demand/chat/chat-interface").then((m) => ({ default: m.ChatInterface })),
  { ssr: false }
);

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageRouter />
    </Suspense>
  );
}

function ChatPageRouter() {
  const searchParams = useSearchParams();
  const module = searchParams.get("module");

  if (module === "risk") {
    return (
      <ExecutionProvider>
        <RiskChatInterface />
      </ExecutionProvider>
    );
  }

  if (module === "demand") {
    return <DemandChatInterface />;
  }

  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const { emitWorkflowEvent, resetDAG } = useWorkflowEvents();
  const searchParams = useSearchParams();
  const router = useRouter();

  const promptFromQuery = searchParams.get("prompt");
  const warningActionIdFromQuery = searchParams.get("warningActionId");
  const executionActionIdFromQuery = searchParams.get("actionId");
  const executionIntentFromQuery = searchParams.get("intent");
  const [startupPrompt, setStartupPrompt] = useState<string | undefined>(undefined);
  const [startupWarningActionId, setStartupWarningActionId] = useState<string | undefined>(undefined);
  const [startupExecutionActionId, setStartupExecutionActionId] = useState<NBAActionId | undefined>(undefined);
  const [startupExecutionIntent, setStartupExecutionIntent] = useState<NBAActionIntent | undefined>(undefined);
  const [startupLaunchToken, setStartupLaunchToken] = useState(0);

  useEffect(() => {
    const hasExecutionAction = executionActionIdFromQuery && isNBAActionId(executionActionIdFromQuery);
    const hasLaunchQuery = Boolean(promptFromQuery || warningActionIdFromQuery || hasExecutionAction);

    if (!hasLaunchQuery) {
      return;
    }

    if (promptFromQuery) {
      setStartupPrompt(promptFromQuery);
    } else {
      setStartupPrompt(undefined);
    }

    if (warningActionIdFromQuery) {
      setStartupWarningActionId(warningActionIdFromQuery);
    } else {
      setStartupWarningActionId(undefined);
    }

    if (hasExecutionAction) {
      setStartupExecutionActionId(executionActionIdFromQuery);
      setStartupExecutionIntent(executionIntentFromQuery === "review" ? "review" : "execute");
    } else {
      setStartupExecutionActionId(undefined);
      setStartupExecutionIntent(undefined);
    }

    setStartupLaunchToken((value) => value + 1);
  }, [promptFromQuery, warningActionIdFromQuery, executionActionIdFromQuery, executionIntentFromQuery]);

  useEffect(() => {
    if (promptFromQuery || warningActionIdFromQuery || executionActionIdFromQuery) {
      router.replace("/chat");
    }
  }, [promptFromQuery, warningActionIdFromQuery, executionActionIdFromQuery, router]);

  return (
    <ChatInterface
      onWorkflowEvent={emitWorkflowEvent}
      onClearChat={resetDAG}
      initialMessage={startupPrompt}
      initialWarningActionId={startupWarningActionId}
      initialExecutionActionId={startupExecutionActionId}
      initialExecutionIntent={startupExecutionIntent}
      initialLaunchToken={startupLaunchToken}
    />
  );
}
