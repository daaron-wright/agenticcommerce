export interface DemoStage {
  id: string;
  route: string;
  target?: string; // CSS selector to highlight (data-demo attribute)
  title: string;
  narration: string;
  uiAction?: string; // key into the actions map in the narrator
}

export const DEMO_STAGES: DemoStage[] = [
  {
    id: "welcome",
    route: "/dashboard",
    target: '[data-demo="hero-banner"]',
    title: "Welcome to the Control Tower",
    narration:
      "Welcome to the Control Tower — the single business-facing dashboard for customer data readiness, demand-informed decisions, and approval workflows. Everything your team needs to sense, decide, and act is unified here.",
  },
  {
    id: "kpi-overview",
    route: "/dashboard",
    target: '[data-demo="kpi-metrics"]',
    title: "Live KPI Overview",
    narration:
      "These live KPIs show the operational pulse — forecast accuracy, alert counts, approval queues, and activation readiness — all updated in real time. Each metric links directly to the underlying data so you can drill in with a single click.",
  },
  {
    id: "needs-attention",
    route: "/dashboard",
    target: '[data-demo="needs-attention"]',
    title: "What Needs Attention Now",
    narration:
      "The system surfaces what needs action now — critical alerts, pending approvals, and declining metrics — so decision-makers focus on what matters. Severity badges and AI confidence scores help prioritize every item.",
  },
  {
    id: "alerts-tab",
    route: "/dashboard",
    target: '[data-demo="alerts-panel"]',
    title: "Alerts Channel",
    narration:
      "The Alerts channel triages operational risk. Each alert shows severity, timeline, AI recommendations, and projected outcomes. Resolving an alert updates the entire dashboard — watch the KPIs shift in real time as you take action.",
    uiAction: "openAlerts",
  },
  {
    id: "approvals-tab",
    route: "/dashboard",
    target: '[data-demo="approvals-panel"]',
    title: "Approvals Queue",
    narration:
      "The Approvals queue shows pending decisions with AI confidence scores and business impact reasoning. Approve, reject, or set conditions — each action flows through the governance pipeline with a full audit trail.",
    uiAction: "openApprovals",
  },
  {
    id: "reach-demand",
    route: "/dashboard",
    target: '[data-demo="reach-panel"]',
    title: "Reach & Demand Signals",
    narration:
      "Reach shows store coverage and delivery route status. Demand shows surge velocity and emergency reorder triggers. Together they connect fulfillment pressure to replenishment decisions — giving planners a unified view of supply-and-demand tension.",
    uiAction: "openReach",
  },
  {
    id: "campaign-tab",
    route: "/dashboard",
    target: '[data-demo="campaign-panel"]',
    title: "Campaign & Channel Mix",
    narration:
      "Campaign shows the active communication mix and AI-recommended channel reallocation. Apply the recommendation to shift spend from underperforming channels to high-impact ones — all governed by the same approval pipeline.",
    uiAction: "openCampaign",
  },
  {
    id: "chat-intro",
    route: "/chat",
    target: '[data-tour="chat-welcome"]',
    title: "AI Chat Workspace",
    narration:
      "The AI Chat workspace is the command center. Ask business questions in plain language, and the agentic system pulls data, runs models, and delivers structured recommendations with next-best-action cards. It's like having a senior analyst available around the clock.",
  },
  {
    id: "chat-agent",
    route: "/chat",
    target: '[data-tour="chat-prompts"]',
    title: "Agentic Processing",
    narration:
      "Watch the agent work in real time — each tool call, data retrieval, and analysis step is visible and auditable. Human-in-the-loop approval gates ensure control over production changes. Nothing goes live without your say-so.",
  },
  {
    id: "action-board",
    route: "/dashboard",
    target: '[data-demo="action-board"]',
    title: "Action Board & Outcomes",
    narration:
      "The Action Board is where decisions become outcomes. Every action is tracked — approved, conditional, or rejected — with a full audit trail and the ability to save findings as knowledge graphs or launch experiments. This closes the loop from insight to impact.",
    uiAction: "scrollToActions",
  },
];
