"use client";

import { createContext, useContext } from "react";
import type { Message, ToolCall, ActivityCard } from "@/components/cdp/chat/chat-message";

export type AgentPhase = "idle" | "thinking" | "tool_call" | "streaming" | "complete" | "awaiting_approval";

export interface ChatMessagesContextValue {
  messages: Message[];
  currentPhase: AgentPhase;
  currentStep: string;
  completedSteps: string[];
}

const defaultValue: ChatMessagesContextValue = {
  messages: [],
  currentPhase: "idle",
  currentStep: "",
  completedSteps: [],
};

export const ChatMessagesContext = createContext<ChatMessagesContextValue>(defaultValue);

export function useChatMessages() {
  return useContext(ChatMessagesContext);
}
