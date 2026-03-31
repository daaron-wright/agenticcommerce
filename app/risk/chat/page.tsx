"use client";

import { ChatInterface } from "@/components/risk/chat/chat-interface";
import { ExecutionProvider } from "@/lib/risk/execution-store";

export default function RiskChatPage() {
  return (
    <ExecutionProvider>
      <ChatInterface />
    </ExecutionProvider>
  );
}
