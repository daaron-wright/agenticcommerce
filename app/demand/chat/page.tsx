"use client";

import { Suspense } from "react";
import { ChatInterface } from "@/components/demand/chat/chat-interface";

export default function DemandChatPage() {
  return (
    <Suspense>
      <ChatInterface />
    </Suspense>
  );
}
