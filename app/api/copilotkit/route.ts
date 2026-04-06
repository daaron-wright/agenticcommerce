import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getDemoContext } from "@/lib/llm-context";

const SYSTEM_PROMPT = `You are an AI assistant embedded in KYN, a unified retail analytics and customer data platform used by a retail business.

The platform covers three primary domains:

**Control Tower / UDP (Unified Data Platform)**
Customer profiles, identity graph, audience segmentation, LTV scoring, consent management, duplicate detection, data quality monitoring. Key metrics: 8 customer segments, identity resolution across channels, consent compliance tracking.

**Demand Planning**
Forecast accuracy (currently 76%), perishable waste reduction (target -25%), fill rates by region (88–93%), promo lift analysis, SKU-level planning, demand sensing with weather/event signals.

**Campaign Management**
Paid channel performance: Google PMAX, Facebook, TikTok, Snapchat. KPIs: ROAS, CAC, gross sales, impressions, conversions. Weekly commercial review aligned to Monday trading summaries. AI-managed campaigns and audience activation.

You help retail analysts, marketers, demand planners, and platform operators understand their data and make decisions. Be concise, direct, and data-driven. Use markdown formatting (bullet points, bold, headers) when it improves clarity. Suggest practical next steps and actions. Keep responses focused and actionable — this is a live business operations tool.

When you decide an action should be taken (resolving an alert, running a forecast, approving a workflow, etc.), use the appropriate tool/action. Always explain the expected impact before executing.

## LIVE PLATFORM DATA
${getDemoContext()}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const openai = new OpenAI({ apiKey });
  const serviceAdapter = new OpenAIAdapter({ openai, model: "gpt-4o" });

  const runtime = new CopilotRuntime({
    actions: [
      {
        name: "resolveAlert",
        description:
          "Resolve a control tower alert. Use this when the user wants to resolve, address, or dismiss an active alert. This triggers the resolution workflow and updates the dashboard KPIs.",
        parameters: [
          {
            name: "alertId",
            type: "string",
            description: "The ID or title of the alert to resolve (e.g. 'Emergency Demand Surge', 'Cold-Chain Integrity Risk', 'Last-Mile Delivery Constraint')",
            required: true,
          },
          {
            name: "action",
            type: "string",
            description: "The resolution action to take (e.g. 'approve_reorder', 'reroute_shipments', 'activate_backup_suppliers')",
            required: true,
          },
        ],
        handler: async ({ alertId, action }: { alertId: string; action: string }) => {
          return {
            status: "resolved",
            alertId,
            action,
            impact: "Alert resolved. Dashboard KPIs will update to reflect the resolution. Revenue at risk reduced by estimated 87%.",
            timestamp: new Date().toISOString(),
          };
        },
      },
      {
        name: "runDemandForecast",
        description:
          "Run a demand forecast analysis for specific categories, regions, or SKUs. Use this when the user asks about demand planning, forecasting, or inventory projections.",
        parameters: [
          {
            name: "scope",
            type: "string",
            description: "What to forecast: a category (e.g. 'Dairy', 'Bakery'), region (e.g. 'Northeast'), or 'all'",
            required: true,
          },
          {
            name: "horizon",
            type: "string",
            description: "Forecast horizon: '7d', '14d', '30d', or '13w'",
            required: false,
          },
        ],
        handler: async ({ scope, horizon }: { scope: string; horizon?: string }) => {
          return {
            status: "complete",
            scope,
            horizon: horizon || "14d",
            forecastAccuracy: "87.3%",
            demandChange: "+12% vs prior period",
            atRiskSKUs: 6,
            recommendation: "Increase safety stock for storm-affected categories. Approve emergency reorder for 15 critical SKUs.",
            timestamp: new Date().toISOString(),
          };
        },
      },
      {
        name: "approveWorkflow",
        description:
          "Submit a workflow for approval or approve a pending workflow. Use this when the user wants to approve, reject, or escalate a pending action that requires human authorization.",
        parameters: [
          {
            name: "workflowId",
            type: "string",
            description: "The workflow or action to approve (e.g. 'emergency_reorder', 'price_cap_enforcement', 'cold_chain_reroute')",
            required: true,
          },
          {
            name: "decision",
            type: "string",
            description: "'approve', 'reject', or 'escalate'",
            required: true,
          },
        ],
        handler: async ({ workflowId, decision }: { workflowId: string; decision: string }) => {
          return {
            status: decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "escalated",
            workflowId,
            message:
              decision === "approve"
                ? "Workflow approved and executing. Changes will be deployed to production systems."
                : decision === "reject"
                  ? "Workflow rejected. No changes will be made."
                  : "Workflow escalated to senior management for review.",
            timestamp: new Date().toISOString(),
          };
        },
      },
      {
        name: "investigateSignal",
        description:
          "Investigate a specific signal, metric anomaly, or data pattern. Use this when the user wants to drill into a specific area — alerts, demand signals, campaign performance, customer segments, etc.",
        parameters: [
          {
            name: "domain",
            type: "string",
            description: "The domain to investigate: 'alerts', 'demand', 'campaign', 'customers', 'inventory', 'operations'",
            required: true,
          },
          {
            name: "query",
            type: "string",
            description: "What specifically to investigate",
            required: true,
          },
        ],
        handler: async ({ domain, query }: { domain: string; query: string }) => {
          return {
            status: "complete",
            domain,
            query,
            findings: `Investigation of ${domain} for "${query}" complete. Key findings have been analyzed from the live platform data.`,
            timestamp: new Date().toISOString(),
          };
        },
      },
      {
        name: "generateReport",
        description:
          "Generate a summary report or briefing. Use this when the user asks for a report, summary, briefing, or executive overview of platform performance.",
        parameters: [
          {
            name: "reportType",
            type: "string",
            description: "Type of report: 'executive_summary', 'weekly_commercial', 'demand_forecast', 'campaign_performance', 'incident_report'",
            required: true,
          },
          {
            name: "period",
            type: "string",
            description: "Time period for the report: 'today', 'this_week', 'last_7d', 'last_30d', 'qtd'",
            required: false,
          },
        ],
        handler: async ({ reportType, period }: { reportType: string; period?: string }) => {
          return {
            status: "generated",
            reportType,
            period: period || "last_7d",
            message: `${reportType.replace(/_/g, " ")} report generated for ${period || "last 7 days"}.`,
            timestamp: new Date().toISOString(),
          };
        },
      },
    ],
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
}
