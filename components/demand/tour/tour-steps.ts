export interface TourStep {
  id: string;
  route: string;
  target?: string; // CSS selector for the element to spotlight
  title: string;
  description: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "chat-welcome",
    route: "/chat",
    target: '[data-tour="chat-welcome"]',
    title: "The AI Command Center",
    description:
      "This is where it all starts. Instead of digging through dashboards and spreadsheets, your team asks a question in plain English — like 'Why is our perishable waste so high?' — and the AI agent does the rest: pulling data, running models, and delivering a diagnosis with recommended actions.",
  },
  {
    id: "chat-prompts",
    route: "/chat",
    target: '[data-tour="chat-prompts"]',
    title: "Business Scenario Prompts",
    description:
      "These cards represent the real questions your demand planners face every day. Each one kicks off a full agent workflow behind the scenes — from data ingestion through ML forecasting to actionable recommendations. Try 'Why is our perishable waste so high?' to see it in action.",
  },
  {
    id: "chat-status",
    route: "/chat",
    target: '[data-tour="chat-status"]',
    title: "Watch the Agent Work",
    description:
      "This status bar shows exactly what the agent is doing in real time — scanning waste data, identifying forecast gaps, calculating financial impact. Every step is visible and auditable, so your team always knows what's happening and why.",
  },
  {
    id: "chat-messages",
    route: "/chat",
    target: '[data-tour="chat-messages"]',
    title: "Data-Driven Diagnosis",
    description:
      "The agent delivers a structured analysis: your forecast accuracy is 76%, waste rate is 8.2%, and you're losing $2.3M annually in spoilage. It pinpoints the root cause — missing demand drivers like weather, promotions, and day-of-week effects — and quantifies exactly what fixing it would save.",
  },
  {
    id: "chat-input",
    route: "/chat",
    target: '[data-tour="chat-input"]',
    title: "Conversational Depth",
    description:
      "This isn't a one-shot report. Ask follow-ups like 'What actions should we take?' or 'Model the business impact' — the agent maintains full context and goes deeper. Your planners get an always-available analyst who knows the entire data landscape.",
  },
  {
    id: "dag-toggle",
    route: "/chat",
    target: '[data-tour="dag-toggle"]',
    title: "Agentic Workflow Pipeline",
    description:
      "This is what makes it agentic. Every question triggers an orchestrated pipeline — ingesting weather and POS signals, running ML forecasts, triaging exceptions, and generating orders. The DAG shows every step live, so stakeholders can see the full chain of evidence behind every recommendation.",
  },
  {
    id: "kpi-cards",
    route: "/demand/dashboard",
    target: '[data-tour="kpi-cards"]',
    title: "Executive KPI Dashboard",
    description:
      "The dashboard gives leadership a real-time pulse: 76% forecast accuracy, 8.2% waste rate, 91% fill rate. Each metric is clickable — tap one to see the agent's recommended actions for improving it. This is where strategy meets execution.",
  },
  {
    id: "scenario-waste",
    route: "/demand/dashboard",
    target: '[data-tour="scenario-waste"]',
    title: "Actionable Scenario Cards",
    description:
      "Each card is a modeled business strategy. 'Reduce Perishable Waste' projects a 25% waste reduction. 'Prevent Stock-Outs' targets 97.5% fill rate. Click 'Execute' and the agent runs the full workflow — adjusting forecasts, submitting orders, and activating monitoring — all in one click.",
  },
  {
    id: "reports-chart",
    route: "/reports",
    target: '[data-tour="reports-chart"]',
    title: "Forecast Accuracy Reports",
    description:
      "Reports provide the evidence layer. Forecast vs. actuals, MAPE by category, waste impact by SKU — all the numbers behind the agent's recommendations. When the agent executes an action, updated artifacts appear here automatically so your team can track results.",
  },
];
