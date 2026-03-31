import OpenAI from "openai";
import { NextRequest } from "next/server";
import { getDemoContext } from "@/lib/llm-context";

const SYSTEM_PROMPT = `You are an AI assistant embedded in KYN, a unified retail analytics and customer data platform used by a UK retail business.

The platform covers three primary domains:

**UDP / CDP (Unified Data Platform)**
Customer profiles, identity graph, audience segmentation, LTV scoring, consent management, duplicate detection, data quality monitoring.
Key metrics: 8 customer segments, identity resolution across channels, consent compliance tracking.

**Demand Planning**
Forecast accuracy (currently 76%), perishable waste reduction (target -25%), fill rates by region (88–93%), promo lift analysis, SKU-level planning, demand sensing with weather/event signals.
Categories: Dairy, Bakery, Produce, Deli. Regions: Northeast, Southeast, Midwest, West.

**Campaign Management**
Paid channel performance: Google PMAX, Facebook, TikTok, Snapchat. KPIs: ROAS, CAC, gross sales, impressions, conversions. Weekly commercial review aligned to Monday trading summaries. AI-managed campaigns and audience activation.

You help retail analysts, marketers, demand planners, and platform operators understand their data and make decisions. Be concise, direct, and data-driven. Use markdown formatting (bullet points, bold, headers) when it improves clarity. Suggest practical next steps and actions. Keep responses focused and actionable — this is a live business operations tool.`;

function buildSystemPrompt(userRole: string, persona: string): string {
  const roleContext: Record<string, string> = {
    super_admin: "Full platform access across all modules.",
    platform_admin: "Full platform access across all modules.",
    marketing_admin: "Focused on campaigns, audiences, and customer insights.",
    data_admin: "Focused on data quality, identity resolution, and consent management.",
    service_agent: "Focused on customer service cases and customer lookup.",
    risk_admin: "Aligned to the shared platform-operator experience across UDP, commercial, and demand planning.",
  };

  const personaContext: Record<string, string> = {
    marketer: "Marketing perspective — campaign performance, audience targeting, ROAS optimisation.",
    merchandiser: "Merchandising perspective — product performance, inventory, demand planning.",
    general_user: "General business perspective — overall platform health and cross-domain insights.",
  };

  return `${SYSTEM_PROMPT}

Current user role: ${userRole}${roleContext[userRole] ? ` — ${roleContext[userRole]}` : ""}
Active perspective: ${persona}${personaContext[persona] ? ` — ${personaContext[persona]}` : ""}

---

## LIVE PLATFORM DATA
The following is the actual data currently shown across all dashboards. Use these exact figures when answering questions.

${getDemoContext()}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured. Add it to .env.local to enable live AI responses." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { messages, userRole, persona } = body as {
    messages: Array<{ role: string; content: string }>;
    userRole: string;
    persona: string;
  };

  const client = new OpenAI({ apiKey });

  const chatMessages = messages
    .filter((m) => m.content?.trim() && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  if (chatMessages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  if (chatMessages[chatMessages.length - 1].role !== "user") {
    return Response.json({ error: "Last message must be from user" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 1024,
          stream: true,
          messages: [
            { role: "system", content: buildSystemPrompt(userRole ?? "general", persona ?? "marketer") },
            ...chatMessages,
          ],
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
