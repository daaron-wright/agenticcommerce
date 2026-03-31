import type { Edge, Node } from "reactflow";

// Professional, muted color palette for different node types
import { colors } from "./colors";

// Modify the createNodePosition function to use much larger spacing
const createNodePosition = (x: number, y: number) => {
  // Add very slight randomization for more natural appearance
  // but keep it minimal to prevent overlaps
  const jitterX = Math.random() * 10 - 5;
  const jitterY = Math.random() * 10 - 5;

  return {
    x: x + jitterX,
    y: y + jitterY,
  };
};

// Update node positions with much more spacing
// Nodes organized in a much more spread out, non-linear layout with careful positioning
export const initialNodes: Node[] = [
  // Intent Parsing
  {
    id: "Q0",
    type: "custom",
    position: createNodePosition(100, 500),
    data: {
      label: "Parse User Query",
      color: colors.intent,
      description:
        "Extract intents, entities, timeframe, urgency from minister's prompt.",
      details: [
        "Tool: nlu.parse",
        "Async: false",
        "Outputs: intent_schema, key_phrases",
      ],
      metrics: {
        Priority: "high",
        Retries: "3",
      },
      processingTime: 2, // in seconds
      processingState: "idle", // idle, processing, completed, error
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The user query to process",
          },
          parameters: {
            type: "object",
            properties: {
              maxResults: { type: "number", default: 10 },
              includeMetadata: { type: "boolean", default: true },
              filters: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "When the query was submitted",
          },
        },
        required: ["query"],
      },
      outputSchema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                score: { type: "number" },
                content: { type: "string" },
              },
            },
          },
          metadata: {
            type: "object",
            properties: {
              totalResults: { type: "number" },
              processingTime: { type: "number" },
              confidence: { type: "number" },
            },
          },
          status: { type: "string", enum: ["success", "partial", "failed"] },
        },
        required: ["results", "status"],
      },
      logs: [
        {
          timestamp: "2025-04-30T14:32:15Z",
          level: "INFO",
          message: "Starting intent parsing",
        },
        {
          timestamp: "2025-04-30T14:32:16Z",
          level: "INFO",
          message: "Tokenizing input query",
        },
        {
          timestamp: "2025-04-30T14:32:17Z",
          level: "INFO",
          message: "Applying NLU model",
        },
        {
          timestamp: "2025-04-30T14:32:18Z",
          level: "WARN",
          message: "Low confidence on entity extraction",
        },
        {
          timestamp: "2025-04-30T14:32:19Z",
          level: "INFO",
          message: "Intent identified: information_request",
        },
        {
          timestamp: "2025-04-30T14:32:20Z",
          level: "INFO",
          message: "Extracting key phrases",
        },
        {
          timestamp: "2025-04-30T14:32:21Z",
          level: "INFO",
          message: "Intent parsing completed",
        },
      ],
      config: {
        version: "2.1.0",
        model: "nlu-parser-v3",
        timeout: "5s",
        retries: 2,
        confidence_threshold: 0.75,
        lastModified: "2025-04-15T10:23:42Z",
      },
    },
  },

  // Data Ingestion - First parallel branch (Cloud Node)
  {
    id: "D1",
    type: "cloud",
    position: createNodePosition(600, 100),
    data: {
      label: "Fetch Epidemiological Data",
      color: colors.cloud,
      description:
        "Pull latest measles case counts by emirate and district from cloud data warehouse.",
      details: [
        "Tool: data.fetch_api",
        "Sources: MoH, WHO, DHIS2",
        "Window: P30D",
        "Schedule: */15 * * * *",
      ],
      metrics: {
        Async: "true",
        Output: "cases_tbl",
      },
      processingTime: 5,
      processingState: "idle",
      inputSchema: {
        type: "object",
        properties: {
          startDate: { type: "string", format: "date" },
          endDate: { type: "string", format: "date" },
          regions: { type: "array", items: { type: "string" } },
        },
        required: ["startDate", "endDate"],
      },
      outputSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            region: { type: "string" },
            date: { type: "string", format: "date" },
            cases: { type: "number" },
          },
        },
      },
      logs: [
        {
          timestamp: "2025-04-30T14:32:25Z",
          level: "INFO",
          message: "Fetching data from MoH",
        },
        {
          timestamp: "2025-04-30T14:32:27Z",
          level: "INFO",
          message: "Fetching data from WHO",
        },
        {
          timestamp: "2025-04-30T14:32:29Z",
          level: "INFO",
          message: "Data aggregation complete",
        },
      ],
      config: {
        apiEndpoint: "https://moh.gov/api/epidemiological_data",
        retries: 3,
        timeout: "10s",
      },
    },
  },

  // Data Ingestion - Second parallel branch (On-Prem Node)
  {
    id: "S1",
    type: "onprem",
    position: createNodePosition(600, 900),
    data: {
      label: "Stream Social Chatter",
      color: colors.onprem,
      description:
        "Real-time scrape of keywords across social platforms from on-prem servers.",
      details: [
        "Tool: social.stream",
        "Keywords: measles, rash, vaccination, MMR",
        "Languages: ar, en, ur",
        "Schedule: realtime",
        "Concurrency group: stream",
      ],
      metrics: {
        Async: "true",
        Output: "raw_posts",
      },
      processingTime: 3,
      processingState: "idle",
      inputSchema: {
        type: "object",
        properties: {
          keywords: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
        },
        required: ["keywords", "languages"],
      },
      outputSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            platform: { type: "string" },
            text: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            location: { type: "string" },
          },
        },
      },
      logs: [
        {
          timestamp: "2025-04-30T14:32:35Z",
          level: "INFO",
          message: "Starting social media stream",
        },
        {
          timestamp: "2025-04-30T14:32:36Z",
          level: "INFO",
          message: "Connecting to Twitter API",
        },
        {
          timestamp: "2025-04-30T14:32:37Z",
          level: "INFO",
          message: "Filtering posts by keywords",
        },
      ],
      config: {
        platforms: ["Twitter", "Facebook", "Instagram"],
        rateLimit: 100,
      },
    },
  },

  // Pre-Processing - Upper branch
  {
    id: "G1",
    type: "custom",
    position: createNodePosition(1100, 700),
    data: {
      label: "Geocode Chatter",
      color: colors.processing,
      description: "Convert raw social posts into GeoJSON points.",
      details: ["Tool: geo.enrich", "Depends on: S1", "Async: true"],
      metrics: {
        Output: "posts_geo",
        Retries: "3",
      },
      processingTime: 4,
      processingState: "idle",
    },
  },

  // Pre-Processing - Joins two branches
  {
    id: "C1",
    type: "custom",
    position: createNodePosition(1100, 350),
    data: {
      label: "Compute Chatter Case Latency",
      color: colors.processing,
      description:
        "Calculate lag/lead between chatter spikes and case reports.",
      details: ["Tool: stats.timeseries", "Depends on: G1, D1", "Async: true"],
      metrics: {
        Output: "latency_metrics",
        Priority: "high",
      },
      processingTime: 6,
      processingState: "idle",
    },
  },

  // Risk Visualization (Cloud Node)
  {
    id: "V1",
    type: "cloud",
    position: createNodePosition(1600, 100),
    data: {
      label: "Generate Risk Map",
      color: colors.cloud,
      description:
        "Create animated heat-map of cases and chatter intensity using cloud compute.",
      details: ["Tool: viz.map", "Depends on: G1, D1, C1", "Async: true"],
      metrics: {
        Output: "risk_map_url",
        Priority: "high",
      },
      processingTime: 8,
      processingState: "idle",
    },
  },

  // Lead Detection - Separate branch from S1
  {
    id: "L0",
    type: "custom",
    position: createNodePosition(1100, 1100),
    data: {
      label: "Detect Potential Leads",
      color: colors.detection,
      description:
        "Cluster social posts to surface emerging health-risk topics.",
      details: [
        "Tool: nlp.cluster",
        "Depends on: S1",
        "Dynamic spawn: LEAD_INVESTIGATION template",
        "Max children: 25",
      ],
      metrics: {
        Output: "leads_summary",
        Async: "true",
      },
      processingTime: 7,
      processingState: "idle",
    },
  },

  // Template Node - Connected to L0
  {
    id: "TEMPLATE",
    type: "custom",
    position: createNodePosition(1600, 1100),
    data: {
      label: "Lead Investigation Template",
      color: colors.template,
      description: "Deep-dive analysis of potential misinformation clusters.",
      details: [
        "Tool: nlp.lead_investigate",
        "Inputs: cluster_payload",
        "Outputs: lead_report_{{cluster_id}}",
        "On success: append to leads_summary",
      ],
      metrics: {
        "Max instances": "25",
        Async: "true",
      },
      processingTime: 4,
      processingState: "idle",
    },
  },

  // Vaccine Hesitancy - Depends on G1 and D1 (On-Prem Node)
  {
    id: "VHX",
    type: "onprem",
    position: createNodePosition(1600, 350),
    data: {
      label: "Compare Hesitancy vs Vax Rates",
      color: colors.onprem,
      description:
        "Overlay vaccine-hesitant chatter with vaccination-rate registry from on-prem database.",
      details: [
        "Tool: stats.compare_regions",
        "Depends on: G1, D1",
        "Async: true",
      ],
      metrics: {
        Output: "hesitancy_hotspots",
        Priority: "high",
      },
      processingTime: 5,
      processingState: "idle",
    },
  },

  // Sentiment & Topics - Depends on S1
  {
    id: "NLP1",
    type: "custom",
    position: createNodePosition(1600, 700),
    data: {
      label: "Sentiment and Topic Model",
      color: colors.analysis,
      description: "Real-time sentiment, fear, and misinformation tagging.",
      details: ["Tool: nlp.sentiment_topic", "Depends on: S1", "Async: true"],
      metrics: {
        Outputs: "sentiment_dash, top_topics, misinformation_score",
        Priority: "high",
      },
      processingTime: 6,
      processingState: "idle",
    },
  },

  // Communication Design - Depends on VHX, NLP1, C1
  {
    id: "CM1",
    type: "custom",
    position: createNodePosition(2100, 450),
    data: {
      label: "Generate Localised Messages",
      color: colors.communication,
      description: "Draft hyper-local public-health messages for hotspots.",
      details: [
        "Tool: comms.generate",
        "Style guide: MoH-Arabic-EN-2024",
        "Depends on: VHX, NLP1, latency_metrics",
        "Requires approval: MoH_Comms_Director (2h timeout)",
      ],
      metrics: {
        Output: "draft_messages",
        Async: "true",
      },
      processingTime: 9,
      processingState: "idle",
    },
  },

  // FAQ Portal Suggestion - Depends on NLP1
  {
    id: "FAQ0",
    type: "custom",
    position: createNodePosition(2100, 800),
    data: {
      label: "Offer FAQ Portal",
      color: colors.communication,
      description: "Auto-scaffold a FAQ microsite when misinformation spikes.",
      details: [
        "Tool: webgen.scaffold",
        "Depends on: NLP1",
        "Condition: NLP1.misinformation_score > 0.6",
        "Async: true",
      ],
      metrics: {
        Output: "faq_site_stub",
        Priority: "high",
      },
      processingTime: 7,
      processingState: "idle",
    },
  },

  // Ministerial Brief - Depends on multiple nodes
  {
    id: "BR1",
    type: "custom",
    position: createNodePosition(2600, 500),
    data: {
      label: "Compile Ministerial Brief",
      color: colors.output,
      description: "Summarise insights, impacts, and recommended actions.",
      details: [
        "Tool: doc.generate",
        "Depends on: V1, leads_summary, hesitancy_hotspots, top_topics, draft_messages",
        "Impact tags: Early_detection, Optimised_resource_allocation, Public_trust, Vaccination_uptake, Economic_resilience",
        "Async: false",
      ],
      metrics: {
        Output: "brief_pdf",
        Priority: "high",
      },
      processingTime: 10,
      processingState: "idle",
    },
  },

  // DAG Completion Hook
  {
    id: "COMPLETE",
    type: "custom",
    position: createNodePosition(3100, 500),
    data: {
      label: "DAG Completion Hook",
      color: colors.completion,
      description:
        "Actions to take when the entire workflow completes successfully.",
      details: [
        "Notify: Minister_of_Health, Public_Comms_Team",
        "Deliverables: brief_pdf, risk_map_url, draft_messages, faq_site_stub",
      ],
      metrics: {
        Type: "on_complete",
        Priority: "high",
      },
      processingTime: 2,
      processingState: "idle",
    },
  },
];

// Create edges based on the exact dependencies in the JSON
export const initialEdges: Edge[] = [
  // Q0 has no dependencies

  // D1 and S1 have no explicit dependencies, but logically follow Q0
  {
    id: "e-q0-d1",
    source: "Q0",
    target: "D1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-q0-s1",
    source: "Q0",
    target: "S1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // G1 depends on S1
  {
    id: "e-s1-g1",
    source: "S1",
    target: "G1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // C1 depends on G1 and D1
  {
    id: "e-g1-c1",
    source: "G1",
    target: "C1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-d1-c1",
    source: "D1",
    target: "C1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // V1 depends on G1, D1, and C1
  {
    id: "e-g1-v1",
    source: "G1",
    target: "V1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-d1-v1",
    source: "D1",
    target: "V1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-c1-v1",
    source: "C1",
    target: "V1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // L0 depends on S1
  {
    id: "e-s1-l0",
    source: "S1",
    target: "L0",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // L0 spawns TEMPLATE instances (dashed line to indicate template relationship)
  {
    id: "e-l0-template",
    source: "L0",
    target: "TEMPLATE",
    animated: false,
    style: {
      stroke: "#718096",
      strokeWidth: 1.5,
      opacity: 0.7,
      strokeDasharray: "5,5",
    },
  },

  // VHX depends on G1 and D1
  {
    id: "e-g1-vhx",
    source: "G1",
    target: "VHX",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-d1-vhx",
    source: "D1",
    target: "VHX",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // NLP1 depends on S1
  {
    id: "e-s1-nlp1",
    source: "S1",
    target: "NLP1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // CM1 depends on VHX, NLP1, and latency_metrics (from C1)
  {
    id: "e-vhx-cm1",
    source: "VHX",
    target: "CM1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-nlp1-cm1",
    source: "NLP1",
    target: "CM1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-c1-cm1",
    source: "C1",
    target: "CM1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // FAQ0 depends on NLP1
  {
    id: "e-nlp1-faq0",
    source: "NLP1",
    target: "FAQ0",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // BR1 depends on V1, leads_summary (from L0), hesitancy_hotspots (from VHX),
  // top_topics (from NLP1), and draft_messages (from CM1)
  {
    id: "e-v1-br1",
    source: "V1",
    target: "BR1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-l0-br1",
    source: "L0",
    target: "BR1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-vhx-br1",
    source: "VHX",
    target: "BR1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-nlp1-br1",
    source: "NLP1",
    target: "BR1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-cm1-br1",
    source: "CM1",
    target: "BR1",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },

  // COMPLETE depends on BR1 (solid line) and optionally on FAQ0 (dashed line)
  {
    id: "e-br1-complete",
    source: "BR1",
    target: "COMPLETE",
    animated: false,
    style: { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "e-faq0-complete",
    source: "FAQ0",
    target: "COMPLETE",
    animated: false,
    style: {
      stroke: "#718096",
      strokeWidth: 1.5,
      opacity: 0.7,
      strokeDasharray: "5,5",
    },
  },
];

// Function to get node dependencies
export const getNodeDependencies = (nodeId: string): string[] => {
  return initialEdges
    .filter((edge) => edge.target === nodeId)
    .map((edge) => edge.source);
};

// Function to get dependent nodes
export const getDependentNodes = (nodeId: string): string[] => {
  return initialEdges
    .filter((edge) => edge.source === nodeId)
    .map((edge) => edge.target);
};
