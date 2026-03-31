export type SnapshotType =
  | "dashboard"
  | "vendors"
  | "audit"
  | "monitoring"
  | "settings"
  | "current-state"
  | "financial-summary"
  | "risk-benchmark"
  | "attack-anatomy"
  | "scenario-micro-seg"
  | "scenario-edr"
  | "scenario-recovery"
  | "nba-execution";

export type ScenarioId = "micro-seg" | "edr" | "recovery";

export type FoundationalScenarioId = "identity-loss" | "network-loss" | "encryption-loss" | "combined-loss";

export type NBAActionId = "impl-micro-seg" | "deploy-edr" | "establish-recovery";

export interface NBAAction {
  id: NBAActionId;
  title: string;
  segment: string;
  action: string;
  expectedLift: string;
  confidence: number;
  agentReason: string;
}

export interface ChatFlow {
  triggers: string[];
  agentSteps: string[];
  response: string;
  snapshots: SnapshotType[];
  followUps: string[];
  offerScenarios?: boolean;
  showNBACards?: "all" | ScenarioId;
  showAssessmentCard?: boolean;
  showControlsPanel?: boolean;
  showFoundationalScenarios?: boolean;
  showFoundationalExposureTable?: boolean;
}

export const FOUNDATIONAL_SCENARIO_META: Record<
  FoundationalScenarioId,
  { label: string; description: string; icon: string; severity: string }
> = {
  "identity-loss": {
    label: "Loss of Identity Services",
    description: "Microsoft Entra / AD / IAM compromised — authentication and access control down across all retail systems.",
    icon: "Shield",
    severity: "Critical",
  },
  "network-loss": {
    label: "Loss of Network Services",
    description: "DNS, DHCP, site connectivity down — stores disconnected from HQ, e-commerce offline.",
    icon: "Zap",
    severity: "Critical",
  },
  "encryption-loss": {
    label: "Loss of Encryption Services",
    description: "Cryptographic services compromised — payment card data and customer PII exposed.",
    icon: "RefreshCw",
    severity: "High",
  },
  "combined-loss": {
    label: "Combined: Identity + Network",
    description: "Worst case — both identity and connectivity lost simultaneously across the entire retail estate.",
    icon: "Target",
    severity: "Catastrophic",
  },
};

export const SCENARIO_META: Record<
  ScenarioId,
  { label: string; description: string; risk: string; outcome: string; budget: string }
> = {
  "micro-seg": {
    label: "Implement Micro-Segmentation",
    description: "Deploy network micro-segmentation to contain lateral movement and reduce blast radius by up to 50%.",
    risk: "Low",
    outcome: "Blast Radius -50%",
    budget: "Infrastructure Investment",
  },
  edr: {
    label: "Deploy EDR Across All Endpoints",
    description: "Extend endpoint detection and response coverage to 100% of assets for faster threat detection.",
    risk: "Low",
    outcome: "Detection Speed +70%",
    budget: "Security Tooling",
  },
  recovery: {
    label: "Cyber-Tolerant Recovery Program",
    description: "Establish and test cyber-tolerant recovery capabilities to reduce mean time to recovery by 60%.",
    risk: "Medium",
    outcome: "MTCR -60%",
    budget: "Recovery Programme",
  },
};

// ── Welcome prompt cards ────────────────────────────────────────────────────

export interface SuggestedPromptCard {
  icon: string;
  label: string;
  boldWords?: string[];
  prompt: string;
}

export const WELCOME_PROMPT_CARDS: SuggestedPromptCard[] = [
  {
    icon: "ShieldCheck",
    label: "Run a cyber risk assessment for our Point of Sales system",
    boldWords: ["cyber risk assessment", "Point of Sales"],
    prompt: "Run a cyber risk assessment for Point of Sales",
  },
  {
    icon: "BarChart3",
    label: "What's our attack surface ratio across retail departments?",
    boldWords: ["attack surface ratio", "retail departments"],
    prompt: "What is our attack surface ratio across departments?",
  },
  {
    icon: "Target",
    label: "How can we reduce our financial exposure from a cyber attack?",
    boldWords: ["reduce", "financial exposure", "cyber attack"],
    prompt: "How can I reduce this risk?",
  },
  {
    icon: "TrendingUp",
    label: "Which foundational services are at risk if we're attacked?",
    boldWords: ["foundational services", "risk", "attacked"],
    prompt: "Which foundational services are at risk?",
  },
  {
    icon: "PieChart",
    label: "How do we prepare for a cyber incident?",
    boldWords: ["prepare", "cyber incident"],
    prompt: "How do we prepare for a cyber incident?",
  },
  {
    icon: "AiRecommend",
    label: "What workstreams should we invest in to reduce cyber risk?",
    boldWords: ["workstreams", "invest", "reduce cyber risk"],
    prompt: "What workstreams reduce our cyber risk?",
  },
];

export const WELCOME_HEADING = "Quantify your cyber financial exposure";

// ── Next Best Actions ───────────────────────────────────────────────────────

export const ALL_NBA_ACTIONS: NBAAction[] = [
  {
    id: "impl-micro-seg",
    title: "Implement Micro-Segmentation",
    segment: "Attack Surface Reduction",
    action: "Deploy micro-segmentation across critical business services",
    expectedLift: "SLE reduced by 50%",
    confidence: 92,
    agentReason: "Micro-segmentation contains lateral movement during a breach, reducing the blast radius by up to 50%. This directly reduces Single Loss Expectancy by limiting the number of systems affected in an incident.",
  },
  {
    id: "deploy-edr",
    title: "Deploy EDR Across All Endpoints",
    segment: "Detection & Response",
    action: "Extend EDR coverage to 100% of endpoints",
    expectedLift: "SLE reduced by 30%",
    confidence: 88,
    agentReason: "Full EDR coverage enables faster detection and automated containment, reducing dwell time from days to hours. This decreases incident impact by approximately 30% based on industry benchmarks.",
  },
  {
    id: "establish-recovery",
    title: "Establish Cyber-Tolerant Recovery",
    segment: "Recovery & Resilience",
    action: "Implement and test cyber-tolerant recovery programme",
    expectedLift: "MTCR reduced by 60%",
    confidence: 85,
    agentReason: "Tested cyber-tolerant recovery reduces Mean Time to Cyber Recovery from 168 hours to approximately 67 hours. This directly reduces outage duration and associated financial losses.",
  },
];

export const SCENARIO_NBAS: Record<ScenarioId, NBAActionId[]> = {
  "micro-seg": ["impl-micro-seg", "deploy-edr"],
  edr: ["deploy-edr", "establish-recovery"],
  recovery: ["establish-recovery", "impl-micro-seg"],
};

export const EXECUTION_FLOWS: Record<NBAActionId, ChatFlow> = {
  "impl-micro-seg": {
    triggers: [],
    agentSteps: [
      "Architecture Agent — mapping network topology and critical segments",
      "Risk Model — calculating blast radius reduction factors",
      "Policy Engine — generating segmentation policy rules",
      "Financial Model — projecting updated loss expectancy",
    ],
    response:
      "The micro-segmentation workstream has been **initiated successfully**. Here's the implementation plan:\n\n• **Network Assessment**: Critical business services mapped across 12 network segments\n• **Segmentation Policy**: 47 micro-segmentation rules generated for east-west traffic control\n• **Blast Radius Impact**: Expected **50% reduction** in lateral movement exposure\n• **Financial Impact**: Single Loss Expectancy projected to decrease from **$33.6M to $16.8M**\n\nThe agent will track implementation progress and re-assess risk scores as segments are deployed.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show the updated financial model",
      "Execute another workstream",
      "View the assessment history",
      "Show the risk dashboard",
    ],
  },
  "deploy-edr": {
    triggers: [],
    agentSteps: [
      "Asset Discovery Agent — inventorying all endpoints (2,847 found)",
      "Coverage Analyser — identifying 312 unprotected endpoints",
      "Risk Model — modelling detection speed improvement",
      "Financial Model — projecting updated loss expectancy",
    ],
    response:
      "The EDR deployment workstream has been **initiated successfully**. Here's the implementation plan:\n\n• **Endpoint Inventory**: 2,847 endpoints identified, 312 currently unprotected\n• **Deployment Plan**: Phased rollout across 4 business units over 6 weeks\n• **Detection Improvement**: Mean detection time expected to improve from **72h to 4h**\n• **Financial Impact**: Single Loss Expectancy projected to decrease by **30%** through faster containment\n\nThe agent will monitor deployment progress and validate coverage milestones.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show the updated financial model",
      "Execute another workstream",
      "What is the current endpoint coverage?",
      "Show the risk dashboard",
    ],
  },
  "establish-recovery": {
    triggers: [],
    agentSteps: [
      "Recovery Agent — assessing current backup and recovery capabilities",
      "Testing Agent — evaluating last cyber recovery test results",
      "Risk Model — modelling MTCR reduction scenarios",
      "Financial Model — projecting updated loss expectancy",
    ],
    response:
      "The cyber-tolerant recovery workstream has been **initiated successfully**. Here's the implementation plan:\n\n• **Current State**: Recovery capabilities exist but have not been tested against cyber scenarios\n• **Programme Design**: Quarterly cyber recovery testing with automated failover validation\n• **MTCR Improvement**: Expected reduction from **168 hours to 67 hours** (60% improvement)\n• **Financial Impact**: Annualised Loss Expectancy projected to decrease by **60%** through reduced outage duration\n\nThe agent will schedule the first recovery test and establish baseline metrics.",
    snapshots: ["nba-execution"],
    followUps: [
      "Show the updated financial model",
      "Execute another workstream",
      "When was the last recovery test?",
      "Show the risk dashboard",
    ],
  },
};

export function getNBAsByScenario(scenarioId: ScenarioId): NBAAction[] {
  const ids = SCENARIO_NBAS[scenarioId];
  return ALL_NBA_ACTIONS.filter((a) => ids.includes(a.id));
}

export function getNBAById(id: NBAActionId): NBAAction | undefined {
  return ALL_NBA_ACTIONS.find((a) => a.id === id);
}

// ── Scenario response flows ─────────────────────────────────────────────────

export const SCENARIO_FLOWS: Record<ScenarioId, ChatFlow> = {
  "micro-seg": {
    triggers: [],
    agentSteps: [
      "Analysing current network segmentation posture",
      "Modelling blast radius reduction with micro-segmentation",
      "Computing financial impact on SLE and ALE",
      "Generating implementation roadmap",
    ],
    response:
      "Here's the impact analysis for **Implement Micro-Segmentation**. Your current network has minimal east-west traffic controls, meaning a breach in one segment can propagate across **12 connected systems**. Micro-segmentation would contain lateral movement to the initial breach point, reducing **blast radius by 50%** and cutting your Single Loss Expectancy from **$33.6M to $16.8M**. The agent recommends prioritising this as the highest-impact control.",
    snapshots: ["current-state", "scenario-micro-seg"],
    followUps: [],
    showNBACards: "micro-seg" as ScenarioId,
  },
  edr: {
    triggers: [],
    agentSteps: [
      "Assessing current endpoint detection coverage",
      "Modelling detection and response time improvements",
      "Computing financial impact on incident containment",
      "Generating deployment schedule",
    ],
    response:
      "Here's the impact analysis for **Deploy EDR Across All Endpoints**. Current endpoint coverage is at **89%**, leaving **312 endpoints** unmonitored. Full EDR deployment would reduce mean detection time from **72 hours to 4 hours**, enabling faster containment. This translates to a **30% reduction in Single Loss Expectancy** through reduced dwell time and faster incident response.",
    snapshots: ["current-state", "scenario-edr"],
    followUps: [],
    showNBACards: "edr" as ScenarioId,
  },
  recovery: {
    triggers: [],
    agentSteps: [
      "Evaluating current cyber recovery capabilities",
      "Modelling MTCR reduction with tested recovery",
      "Computing financial impact on outage duration",
      "Designing recovery testing programme",
    ],
    response:
      "Here's the impact analysis for **Cyber-Tolerant Recovery Programme**. Your organisation has backup infrastructure but it has **never been tested against a cyber attack scenario**. Establishing and testing cyber-tolerant recovery would reduce MTCR from **168 hours to 67 hours** — a 60% improvement. This directly reduces your **Annualised Loss Expectancy by 60%** by cutting the duration of business disruption.",
    snapshots: ["current-state", "scenario-recovery"],
    followUps: [],
    showNBACards: "recovery" as ScenarioId,
  },
};

// ── Standard conversation flows ─────────────────────────────────────────────

export const CHAT_FLOWS: ChatFlow[] = [
  // ── Cyber risk assessment triggers (Step 1) ─────────────────────────────
  {
    triggers: ["cyber risk assessment", "risk assessment", "assess", "point of sales", "critical business", "quantify", "exposure"],
    agentSteps: [
      "Assessment Framework — initialising cyber risk model",
      "Benchmark Agent — loading Gartner industry benchmarks",
      "Risk Engine — preparing attack surface questionnaire",
      "Financial Model — calibrating loss expectancy calculator",
    ],
    response:
      "I'll run a **dynamic cyber risk assessment** for your critical business services. To quantify your financial exposure, I need to understand your **attack surface maturity** through a short set of questions about your environment.\n\nThese inputs will be compared against **Gartner industry benchmarks** to position your organisation relative to peers and produce two numbers that matter to executives: your **Single Loss Expectancy** and **Annualised Loss Expectancy**.\n\nPlease complete the assessment below:",
    snapshots: [],
    followUps: [],
    showAssessmentCard: true,
  },
  // ── Attack Surface Ratio triggers ──────────────────────────────────────
  {
    triggers: ["attack surface", "ratio", "endpoints", "departments", "exposure by department", "department risk"],
    agentSteps: [
      "Endpoint Inventory Agent — scanning all retail departments",
      "Coverage Analyser — calculating secured vs exposed endpoints",
      "Attack Surface Engine — computing ratio per department",
      "Risk Model — identifying highest-risk retail units",
    ],
    response:
      "Here's your **attack surface ratio** broken down by retail department:\n\n" +
      "| Department | Total Endpoints | Secured | Compensating | Exposed | Ratio |\n" +
      "|---|---|---|---|---|---|\n" +
      "| Store Operations | 15,000 | 13,000 | 750 | 1,250 | **8%** |\n" +
      "| E-Commerce | 5,100 | 3,700 | 350 | 1,050 | **21%** |\n" +
      "| Warehouse & Logistics | 400 | 350 | 40 | 10 | **3%** |\n" +
      "| R&D / Innovation | 700 | 300 | 100 | 300 | **43%** |\n" +
      "| Customer Support | 3,000 | 2,700 | 275 | 25 | **1%** |\n" +
      "| Corporate IT | 400 | 390 | 10 | 0 | **0%** |\n" +
      "| **Overall** | **24,600** | **20,440** | **1,525** | **2,635** | **11%** |\n\n" +
      "**Formula:** Attack Surface Ratio = (Total − Secured − Compensating) / Total\n\n" +
      "**Key findings:**\n" +
      "1. **E-Commerce** and **R&D / Innovation** are driving the greatest risk — R&D has a 43% attack surface ratio due to unsecured bring-your-own devices and unprotected legacy test environments\n" +
      "2. **Store Operations** is trending down (from 15% to 8% over 6 months) as legacy PoS terminals are replaced\n" +
      "3. **E-Commerce** is trending upward (14% → 21%) driven by unsecured tablets used in new omni-channel sales initiatives\n\n" +
      "Best practice is **<1%** across all departments. Endpoints that cannot be secured should be protected with **compensating controls** including micro-segmentation and intrusion detection systems.",
    snapshots: ["dashboard"],
    followUps: [
      "Which foundational services are at risk?",
      "How can I reduce this risk?",
      "How do we prepare for a cyber incident?",
      "What workstreams reduce our cyber risk?",
    ],
  },
  // ── Foundational Services definitions (educational) ────────────────────
  {
    triggers: ["what are foundational", "define foundational", "foundational services definition", "foundational services and what is the risk"],
    agentSteps: [
      "Infrastructure Agent — mapping foundational service dependencies",
      "Identity Services Agent — assessing Microsoft Entra, AD, IAM/PAM posture",
      "Network Agent — evaluating DNS, DHCP, and site connectivity",
      "Encryption Agent — reviewing cryptographic data protection",
    ],
    response:
      "**Without Foundational Services, none of your critical retail applications or services will work.** If your organisation loses access or integrity of these services, store operations, e-commerce, and payment processing will be **completely offline** until they are recovered.\n\n" +
      "### What are Foundational Services?\n\n" +
      "**a. Digital Identity Services**\nMicrosoft Entra, Active Directory, IAM & PAM solutions (OKTA, CyberArk), MFA providers. These control who can access your PoS systems, e-commerce platforms, and supply chain applications.\n\n" +
      "**b. Network Services**\nDNS, DHCP, site-to-site connectivity, SD-WAN. These keep your stores connected to HQ, distribution centres linked to inventory systems, and customers connected to your online platforms.\n\n" +
      "**c. Encryption Services**\nTechnologies and processes using cryptographic algorithms to protect payment card data, customer PII, and supply chain communications.\n\n" +
      "### Why this is SIGNIFICANT for retail\n\n" +
      "1. Most retail organisations **do not backup** their foundational services in a cyber-tolerant way — in fact, Microsoft Entra does not have a native backup\n" +
      "2. Most retailers **do not test recovery** of their foundational services for a cyber incident\n" +
      "3. A single attack on identity services can take **every store, every PoS terminal, every e-commerce transaction offline simultaneously**",
    snapshots: [],
    followUps: [
      "Which foundational services are at risk?",
      "How do we prepare for a cyber incident?",
      "What is our attack surface ratio across departments?",
      "Run a cyber risk assessment for Point of Sales",
    ],
  },
  // ── Foundational Services at risk (actionable + scenario picker) ────────
  {
    triggers: ["foundational services", "foundational", "services at risk", "foundational risk", "what services are impacted"],
    agentSteps: [
      "Infrastructure Agent — scanning foundational service exposure",
      "Backup Agent — checking cyber-tolerant backup status",
      "Recovery Agent — reviewing last recovery test dates",
      "Risk Model — computing service-level risk scores",
    ],
    response:
      "Here's the current **foundational service exposure** across your retail estate:\n\n" +
      "**Key risk:** Your Identity services have **no cyber-tolerant backup** and have **never been tested for recovery** after a cyber attack. If compromised, every PoS terminal, e-commerce platform, and supply chain connection will go offline simultaneously.\n\n" +
      "Select a scenario below to see what happens to your retail operations if specific foundational services are attacked:",
    snapshots: [],
    followUps: [],
    showFoundationalScenarios: true,
    showFoundationalExposureTable: true,
  },
  // ── Incident Preparation & Recovery triggers ──────────────────────────
  {
    triggers: ["prepare", "incident", "recovery plan", "what do we need", "get ready", "business continuity"],
    agentSteps: [
      "Recovery Agent — assessing current preparedness posture",
      "BIA Agent — evaluating business impact analysis readiness",
      "Testing Agent — reviewing recovery test history",
      "Automation Agent — identifying recovery automation opportunities",
    ],
    response:
      "Here's a structured approach to **preparing for and recovering from a cyber incident** across your retail operations:\n\n" +
      "### Preparation\n" +
      "- **Identify BIA / MVC** — map your minimum viable company: which stores, distribution centres, and e-commerce systems must be operational first?\n" +
      "- **Identify supporting infrastructure** — map the foundational services (Identity, Network, Encryption) that underpin each critical retail process\n" +
      "- **Develop Cyber Technical Recovery Plans** — documented, step-by-step recovery procedures for each foundational service\n\n" +
      "### Get Ready Actions\n" +
      "1. **Deploy cyber-tolerant protection** for foundational services, starting with Identity (Microsoft Entra, AD, IAM)\n" +
      "2. **TEST backups** — verify your backup data is complete and uncorrupted\n" +
      "3. **TEST recovery** — simulate restoring services in an Isolated Recovery Environment (IRE)\n" +
      "4. **Then TEST again every quarter** — regular testing is the key to ongoing success\n\n" +
      "### What Recovery Requires\n" +
      "1. **Cyber-tolerant backup** of all foundational services\n" +
      "2. **Cyber Technical Recovery Plan** with steps to follow and test criteria to validate service integrity\n" +
      "3. **Isolated Recovery Environment (IRE)** — you can only simulate recovery without affecting store operations with a dedicated test environment\n" +
      "4. **Automation** — add automation techniques to perform recovery actions within your Cyber Technical Recovery Plan\n" +
      "5. **Change management** — ensure BAU change processes also update your recovery plans when infrastructure changes\n\n" +
      "The risk matrix below shows how your current posture maps to likelihood of attack:\n\n" +
      "| Risk Level | Score Range | Likelihood | Recommended Action |\n" +
      "|---|---|---|---|\n" +
      "| Medium | 88-110 | 5% | Remediate immediately |\n" +
      "| Low | 55-87 | 3% | Review controls |\n" +
      "| Very Low | 33-54 | 2% | Monitor |\n" +
      "| Very Very Low | 11-32 | 1% | Accept risk |",
    snapshots: ["dashboard"],
    followUps: [
      "Which foundational services are at risk?",
      "What is our attack surface ratio across departments?",
      "What workstreams reduce our cyber risk?",
      "How can I reduce this risk?",
    ],
  },
  // ── Annualised loss expectancy triggers (Step 2) ────────────────────────
  {
    triggers: ["annualised loss", "loss expectancy", "financial exposure", "financial risk", "how much"],
    agentSteps: [
      "Scoring Agent — computing attack surface maturity score",
      "Benchmark Agent — comparing against Gartner industry benchmarks",
      "Financial Model — calculating loss expectancy",
      "Risk Engine — producing executive summary",
    ],
    response:
      "Based on your retail organisation's profile, here's your **cyber financial risk summary**:\n\n• **Risk Band**: Medium — your controls score places you in the **88-110 range**\n• **Likelihood of Attack**: **5%** annualised probability based on attack surface maturity\n• **Business Impact**: **$200,000/hour** across your critical retail processes (PoS, e-commerce, payments)\n• **MTCR**: Estimated **168 hours** (24 days) for full cyber recovery\n\nThis produces two key numbers:\n• **Single Loss Expectancy**: **$33,600,000** — the cost of one major cyber event (excluding internal recovery costs and data loss)\n• **Annualised Loss Expectancy**: **$1,680,000** — your expected annual cyber loss\n\n**Cyber Business Risk Formula:** \"Business Financial Impact $\" × \"MTCR hours\" × \"Likelihood %\" = Annualised Lost Expectancy ($)\n\nIf this is **$1M for 1 critical retail process**, how many critical processes do you have? 10 ($10M)? 20 ($20M)?\n\nYour organisation sits **above the industry median** for financial exposure. The assessment identified gaps in micro-segmentation, endpoint coverage, and recovery testing as the primary drivers.",
    snapshots: ["financial-summary", "risk-benchmark"],
    followUps: [
      "How can I reduce this risk?",
      "What is our attack surface ratio across departments?",
      "What workstreams reduce our cyber risk?",
      "Run a new assessment",
    ],
  },
  // ── Risk reduction triggers (Step 3) ────────────────────────────────────
  {
    triggers: ["reduce", "how can i reduce", "reduce this risk", "lower", "improve", "mitigate"],
    agentSteps: [
      "Controls Library Agent — loading attack surface controls",
      "Risk Model — modelling impact reduction factors",
      "Financial Model — calculating before/after exposure",
      "Benchmark Agent — comparing against best-in-class controls",
    ],
    response:
      "Here's how you can **materially reduce your financial exposure**. I've identified **3 key controls** that directly impact your loss expectancy numbers. Each has a known **impact reduction factor** validated against industry data.\n\nUse the **interactive controls panel** below to see how each control changes your financial numbers in real-time. Toggle controls on to see the impact:\n\n• **Micro-Segmentation** — reduces blast radius, cutting SLE by up to **50%**\n• **EDR Coverage** — faster detection, reducing SLE by up to **30%**\n• **Cyber-Tolerant Recovery** — tested recovery, reducing MTCR by up to **60%**\n\nThe key insight: combining all three controls reduces your **Annualised Loss Expectancy from $1,680,000 to approximately $235,200** — an **86% reduction**.",
    snapshots: [],
    followUps: [
      "Show me what an attack looks like",
      "What workstreams should we invest in?",
      "Run a new assessment",
    ],
    showControlsPanel: true,
  },
  // ── Attack visualisation triggers (Step 4) ──────────────────────────────
  {
    triggers: ["attack", "what does", "looks like", "show me", "blast radius", "visualise", "consequences"],
    agentSteps: [
      "Threat Model — simulating attack propagation path",
      "Network Agent — mapping lateral movement vectors",
      "Impact Agent — calculating system-by-system exposure",
      "Financial Model — overlaying financial impact on attack path",
    ],
    response:
      "Here's what a **cyber attack** looks like against your current infrastructure — and what changes when controls are in place.\n\n**Without controls**: An attacker compromising one endpoint can move laterally across **12 connected systems** within hours. With no micro-segmentation, the entire network becomes the **blast radius**. Recovery takes **168 hours**, costing **$33.6M** in business disruption.\n\n**With controls**: Micro-segmentation **contains the breach to 1 segment**. EDR detects the intrusion in **4 hours instead of 72**. Tested recovery brings systems back in **67 hours instead of 168**. Total impact drops from **$33.6M to $4.7M**.\n\nThe visuals below show the attack anatomy before and after controls are applied, with financial deltas overlaid.",
    snapshots: ["attack-anatomy"],
    followUps: [
      "What workstreams should we invest in?",
      "How can I reduce this risk?",
      "Run a new assessment",
      "Show the risk dashboard",
    ],
  },
  // ── Workstream / action triggers (Step 5) ───────────────────────────────
  {
    triggers: ["workstream", "invest", "action", "what should", "next best", "recommend", "execute another"],
    agentSteps: [
      "Risk Engine — ranking controls by financial impact",
      "Scoring Agent — computing confidence scores for each workstream",
      "Financial Model — mapping each workstream to measurable risk reduction",
      "Next Best Action — generating executive recommendations",
    ],
    response:
      "Based on your cyber risk assessment, the AI has identified **3 concrete workstreams** — each directly mapped to a **measurable reduction in financial risk**. These are ordered by impact and can be **executed directly** from the cards below.\n\nThe focus is on **decision-making** and **investment prioritisation** — each workstream shows exactly how much financial risk it removes.",
    snapshots: [],
    followUps: [],
    showNBACards: "all",
  },
  // ── Scenario / strategic options ────────────────────────────────────────
  {
    triggers: [
      "scenario", "scenarios", "what can we do", "options",
      "strategies", "strategic", "propose",
    ],
    agentSteps: [
      "Aggregating cyber risk metrics",
      "Evaluating current security posture",
      "Computing control impact projections",
      "Preparing strategic recommendations",
    ],
    response:
      "Based on your cyber risk assessment, your organisation has a **Medium risk band** with an **Annualised Loss Expectancy of $1,680,000**. The primary gaps are in **attack surface controls** and **recovery capabilities**.\n\nI've identified **3 strategic scenarios** for reducing your financial exposure. Each shows a different control investment with measurable risk-reward tradeoffs. Select a scenario below to see the detailed impact analysis.",
    snapshots: ["current-state"],
    followUps: [],
    offerScenarios: true,
  },
  // ── Monitoring / agent status ───────────────────────────────────────────
  {
    triggers: ["monitoring", "what is the ai monitoring", "agent status", "pipeline status", "threat intelligence"],
    agentSteps: [
      "Querying threat intelligence dashboard",
      "Checking active security assessment agents",
      "Summarising threat indicators",
    ],
    response:
      "Here's what the **cyber risk AI** is actively monitoring:\n\n• **Threat Intelligence Agent** — Tracking emerging threat vectors and vulnerability disclosures across critical infrastructure\n• **Attack Surface Monitor** — Continuously assessing endpoint coverage, segmentation gaps, and configuration drift\n• **Recovery Readiness Agent** — Monitoring backup integrity and recovery test schedules\n• **Compliance Agent** — Tracking regulatory requirements and security certification status\n\n**2 critical indicators** require attention: unpatched vulnerabilities in the OS stack and untested recovery procedures.",
    snapshots: ["monitoring"],
    followUps: [
      "What workstreams reduce our cyber risk?",
      "Run a new assessment",
      "Show the risk dashboard",
    ],
  },
  // ── Dashboard / overview ────────────────────────────────────────────────
  {
    triggers: ["dashboard", "overview", "summary", "status", "portfolio", "how are we doing"],
    agentSteps: [
      "Aggregating cyber risk portfolio metrics",
      "Computing financial exposure distribution",
      "Building executive summary",
    ],
    response:
      "Here's your **cyber risk dashboard** overview. You have **4 critical retail services** assessed with a combined **Annualised Loss Expectancy of $4.2M**. Risk distribution: **1 Medium** (Point of Sales), **2 Low** (E-Commerce, Payments), **1 Very Low** (Supply Chain Management).\n\nKey metrics: **Total ALE: $4.2M**, **3 services above risk tolerance**, controls coverage at **72%**, **overall attack surface ratio at 11%**, and **2 open vulnerability categories**. The highest-priority item is the **Point of Sales** service requiring micro-segmentation and recovery testing.",
    snapshots: ["dashboard"],
    followUps: [
      "What is our attack surface ratio across departments?",
      "Run a cyber risk assessment for Point of Sales",
      "Which foundational services are at risk?",
      "View assessment history",
    ],
  },
  // ── Audit / assessment history ──────────────────────────────────────────
  {
    triggers: ["audit", "audit trail", "history", "timeline", "assessment history", "what happened"],
    agentSteps: [
      "Querying assessment history",
      "Filtering relevant events",
      "Formatting timeline",
    ],
    response:
      "Here's a summary of recent **assessment events**. In the last 30 days, the system has logged **8 events**:\n\n• **2 risk assessments completed** — Point of Sales (Medium risk), E-Commerce Platform (Low risk)\n• **3 control evaluations** — Micro-segmentation gap identified, EDR coverage at 89%, Recovery untested\n• **1 financial model update** — Combined ALE recalculated to $4.2M after new assessment inputs\n• **2 benchmark comparisons** — Organisation positioned above industry median for financial exposure\n\nAll assessments are recorded in the immutable assessment log for compliance and audit purposes.",
    snapshots: ["audit"],
    followUps: [
      "Run a new assessment",
      "What workstreams reduce our cyber risk?",
      "Show the risk dashboard",
    ],
  },
];

export const DEFAULT_FLOW: ChatFlow = {
  triggers: [],
  agentSteps: [
    "Processing your request",
    "Searching cyber risk knowledge base",
    "Preparing response",
  ],
  response:
    "I can help with that! I'm your **retail cyber risk** assistant. You can ask me to:\n\n• **Run a cyber risk assessment** — quantify your financial exposure across PoS, e-commerce, and supply chain\n• **Check attack surface ratio** — see endpoint exposure broken down by retail department\n• **Assess foundational services** — understand which identity, network, and encryption services are at risk\n• **Prepare for incidents** — get a structured recovery and preparation plan\n• **Calculate loss expectancy** — produce Single Loss and Annualised Loss Expectancy numbers\n• **Prioritise workstreams** — get actionable investment recommendations mapped to risk reduction",
  snapshots: [],
  followUps: [
    "Run a cyber risk assessment for Point of Sales",
    "What is our attack surface ratio across departments?",
    "Which foundational services are at risk?",
    "How do we prepare for a cyber incident?",
  ],
};

// ── Artifact mappings ────────────────────────────────────────────────────────

import type { ArtifactCategory } from "@/lib/artifact-store";

export interface ScenarioArtifactDef {
  category: ArtifactCategory;
  title: string;
  summary: string;
  metric?: string;
}

export const SCENARIO_ARTIFACTS: Record<ScenarioId, ScenarioArtifactDef[]> = {
  "micro-seg": [
    { category: "dashboard", title: "Micro-segmentation impact modelled", summary: "Blast radius reduction of 50%, SLE decrease from $33.6M to $16.8M.", metric: "SLE -50%" },
    { category: "vendors", title: "Network segmentation assessment", summary: "12 connected segments identified, micro-segmentation policy rules generated." },
  ],
  edr: [
    { category: "dashboard", title: "EDR deployment impact modelled", summary: "Detection time improvement from 72h to 4h, SLE reduction of 30%.", metric: "SLE -30%" },
    { category: "monitoring", title: "Endpoint coverage analysis", summary: "312 unprotected endpoints identified, phased deployment plan generated." },
  ],
  recovery: [
    { category: "dashboard", title: "Recovery programme impact modelled", summary: "MTCR reduction from 168h to 67h, ALE reduction of 60%.", metric: "ALE -60%" },
    { category: "vendors", title: "Recovery readiness assessment", summary: "Current recovery capabilities assessed, quarterly testing schedule proposed." },
  ],
};

// ── New Flow Artifact Definitions ────────────────────────────────────────────

export type NewFlowId = "attack-surface" | "foundational-services" | "incident-preparation";

export const NEW_FLOW_ARTIFACTS: Record<NewFlowId, ScenarioArtifactDef[]> = {
  "attack-surface": [
    { category: "dashboard", title: "Attack Surface Ratio Analysis", summary: "Overall ratio: 11%. E-Commerce (21%) and R&D (43%) driving greatest risk. 2,635 exposed endpoints across 24,600 total.", metric: "11% overall" },
    { category: "monitoring", title: "Department endpoint scan completed", summary: "6 retail departments scanned. Store Operations trending down, E-Commerce trending up." },
  ],
  "foundational-services": [
    { category: "dashboard", title: "Foundational Services Risk Assessment", summary: "Identity, Network, and Encryption services mapped. Most retail foundational services lack cyber-tolerant backup.", metric: "3 categories" },
    { category: "audit", title: "Foundational services review logged", summary: "Assessment of Digital Identity, Network, and Encryption service posture recorded." },
  ],
  "incident-preparation": [
    { category: "dashboard", title: "Incident Preparation Readiness", summary: "Recovery plan gaps identified. Quarterly testing schedule recommended. IRE deployment advised.", metric: "Action needed" },
    { category: "audit", title: "Preparation assessment logged", summary: "BIA/MVC mapping, recovery testing, and automation gaps documented." },
  ],
};

export const EXECUTION_ARTIFACTS: Record<NBAActionId, ScenarioArtifactDef[]> = {
  "impl-micro-seg": [
    { category: "vendors", title: "Micro-segmentation initiated", summary: "47 segmentation rules generated across 12 network segments.", metric: "SLE -50%" },
    { category: "audit", title: "Workstream logged", summary: "Micro-segmentation workstream recorded in assessment audit trail." },
  ],
  "deploy-edr": [
    { category: "vendors", title: "EDR deployment initiated", summary: "Phased rollout to 312 unprotected endpoints across 4 business units.", metric: "Detection +70%" },
    { category: "audit", title: "Workstream logged", summary: "EDR deployment workstream recorded in assessment audit trail." },
  ],
  "establish-recovery": [
    { category: "vendors", title: "Recovery programme initiated", summary: "Quarterly cyber recovery testing schedule established.", metric: "MTCR -60%" },
    { category: "monitoring", title: "Recovery testing activated", summary: "Agent monitoring recovery test scheduling and baseline metrics." },
  ],
};

// ── Foundational Attack Scenario Flows ───────────────────────────────────────

export const FOUNDATIONAL_SCENARIO_FLOWS: Record<FoundationalScenarioId, ChatFlow> = {
  "identity-loss": {
    triggers: [],
    agentSteps: [
      "Identity Agent — simulating Microsoft Entra / AD compromise",
      "Retail Impact Agent — mapping authentication dependencies",
      "Financial Model — projecting revenue loss per hour",
      "Recovery Agent — estimating clean recovery timeline",
    ],
    response:
      "### Scenario: Loss of Identity Services\n\n" +
      "If your Identity services (Microsoft Entra, AD, IAM) are compromised, here's what happens to your retail operations **immediately**:\n\n" +
      "**Systems that go offline:**\n" +
      "- All **15,000 PoS terminals** — staff cannot authenticate, no transactions possible\n" +
      "- **E-commerce platform** — customer login, checkout, and account management all fail\n" +
      "- **Supply chain portals** — vendor access to ordering and inventory systems cut off\n" +
      "- **Corporate systems** — email, HR, finance applications inaccessible\n" +
      "- **Warehouse management** — picking, packing, and dispatch systems locked out\n\n" +
      "**Financial impact:**\n" +
      "- Revenue loss: **$200,000/hour** across all retail channels\n" +
      "- Estimated MTCR: **168–240 hours** (identity is the hardest service to cleanly recover)\n" +
      "- **Single Loss Expectancy: $33.6M – $48M**\n" +
      "- Customer trust impact: potential **15–20% drop** in repeat purchase rate\n\n" +
      "**What would have reduced the blast radius:**\n" +
      "1. Cyber-tolerant backup of Entra/AD (not just standard backup)\n" +
      "2. Tested recovery in an Isolated Recovery Environment\n" +
      "3. Break-glass accounts with offline MFA for emergency access\n" +
      "4. Micro-segmentation to prevent lateral movement from identity compromise",
    snapshots: ["dashboard"],
    followUps: [
      "What if we also lose network services?",
      "How do we prepare for a cyber incident?",
      "What workstreams reduce our cyber risk?",
      "Run a cyber risk assessment for Point of Sales",
    ],
  },
  "network-loss": {
    triggers: [],
    agentSteps: [
      "Network Agent — simulating DNS/DHCP/connectivity failure",
      "Store Operations Agent — mapping store-to-HQ dependencies",
      "Financial Model — projecting store-level revenue impact",
      "Recovery Agent — estimating network restoration timeline",
    ],
    response:
      "### Scenario: Loss of Network Services\n\n" +
      "If your Network services (DNS, DHCP, SD-WAN) are compromised, here's the impact on your retail operations:\n\n" +
      "**Systems that go offline:**\n" +
      "- **Store-to-HQ connectivity** — all stores operating in offline mode (limited to cached data)\n" +
      "- **E-commerce platform** — DNS resolution fails, customers cannot reach your website\n" +
      "- **Inventory management** — real-time stock visibility lost across all locations\n" +
      "- **Distribution centre links** — automated replenishment and dispatch systems disconnected\n" +
      "- **Payment processing** — card transactions may fail if terminals cannot reach payment gateways\n\n" +
      "**Financial impact:**\n" +
      "- Revenue loss: **$150,000/hour** (some stores can process cash/offline transactions)\n" +
      "- Estimated MTCR: **72–120 hours** for full network restoration\n" +
      "- **Single Loss Expectancy: $10.8M – $18M**\n" +
      "- Supply chain disruption: **3–5 day** backlog in distribution\n\n" +
      "**What would have reduced the blast radius:**\n" +
      "1. Redundant DNS with out-of-band management\n" +
      "2. Store-level offline processing capabilities for PoS\n" +
      "3. Network micro-segmentation to contain the compromise\n" +
      "4. Tested network recovery procedures with documented failover steps",
    snapshots: ["dashboard"],
    followUps: [
      "What if we lose identity services too?",
      "How do we prepare for a cyber incident?",
      "What workstreams reduce our cyber risk?",
      "Which foundational services are at risk?",
    ],
  },
  "encryption-loss": {
    triggers: [],
    agentSteps: [
      "Encryption Agent — simulating PKI/certificate compromise",
      "Compliance Agent — assessing PCI-DSS and data protection exposure",
      "Financial Model — projecting regulatory and breach costs",
      "Recovery Agent — estimating certificate reissuance timeline",
    ],
    response:
      "### Scenario: Loss of Encryption Services\n\n" +
      "If your Encryption services (PKI, TLS certificates, key management) are compromised, here's what happens:\n\n" +
      "**Immediate exposure:**\n" +
      "- **Payment card data** — PCI-DSS compliance breached, all card transactions must halt\n" +
      "- **Customer PII** — names, addresses, purchase history potentially exposed\n" +
      "- **Inter-store communications** — data in transit between stores and HQ readable by attackers\n" +
      "- **E-commerce SSL** — browsers will flag your site as insecure, customers cannot checkout\n" +
      "- **API integrations** — third-party vendor connections (logistics, payments) fail certificate validation\n\n" +
      "**Financial impact:**\n" +
      "- Revenue loss: **$180,000/hour** (card payments halt, e-commerce down)\n" +
      "- Estimated MTCR: **48–96 hours** for certificate reissuance and rotation\n" +
      "- **Single Loss Expectancy: $8.6M – $17.3M**\n" +
      "- Regulatory exposure: **PCI-DSS fines up to $500K/month** plus potential GDPR penalties\n" +
      "- Mandatory breach notification costs: **$2M–$5M** (customer notification, credit monitoring)\n\n" +
      "**What would have reduced the blast radius:**\n" +
      "1. Hardware Security Modules (HSMs) for key protection\n" +
      "2. Automated certificate rotation and monitoring\n" +
      "3. Separate encryption domains per business unit\n" +
      "4. Offline root CA with tested reissuance procedures",
    snapshots: ["dashboard"],
    followUps: [
      "What if we lose identity services too?",
      "How do we prepare for a cyber incident?",
      "What workstreams reduce our cyber risk?",
      "Run a cyber risk assessment for Point of Sales",
    ],
  },
  "combined-loss": {
    triggers: [],
    agentSteps: [
      "Combined Scenario Agent — simulating simultaneous identity + network attack",
      "Retail Operations Agent — mapping total operational shutdown",
      "Financial Model — projecting worst-case revenue and recovery costs",
      "Recovery Agent — estimating cascading recovery dependencies",
    ],
    response:
      "### Scenario: Combined Loss of Identity + Network Services\n\n" +
      "This is the **worst-case scenario**. If both Identity and Network services are compromised simultaneously — which is exactly what a Scattered Spider-style attack targets — here's the full impact:\n\n" +
      "**Total operational shutdown:**\n" +
      "- **Every PoS terminal** across all stores — offline, no authentication, no connectivity\n" +
      "- **E-commerce platform** — completely inaccessible (no DNS + no auth)\n" +
      "- **All supply chain systems** — disconnected and locked out\n" +
      "- **Warehouse and distribution** — manual operations only, no system access\n" +
      "- **Corporate IT** — email, finance, HR, and management systems all down\n" +
      "- **Customer data** — uncertain integrity, potential exfiltration\n\n" +
      "**Financial impact:**\n" +
      "- Revenue loss: **$350,000/hour** — effectively zero revenue across all channels\n" +
      "- Estimated MTCR: **240–360 hours** (10–15 days) — identity must be recovered before network can be trusted\n" +
      "- **Single Loss Expectancy: $84M – $126M**\n" +
      "- Brand and market impact: potential **$200M+** in market capitalisation loss\n" +
      "- Customer churn: estimated **25–30%** of online customers switch to competitors\n\n" +
      "**Critical recovery dependencies:**\n" +
      "1. Identity services **must** be recovered first — you cannot trust the network until you know who has access\n" +
      "2. Network recovery depends on verified identity — creating a cascading delay\n" +
      "3. Every system must be validated before reconnection — no shortcuts\n\n" +
      "**What would have prevented this:**\n" +
      "1. Cyber-tolerant backups of both identity AND network services\n" +
      "2. Isolated Recovery Environment with pre-staged infrastructure\n" +
      "3. Quarterly combined recovery testing\n" +
      "4. Micro-segmentation + EDR to detect and contain before both services are lost",
    snapshots: ["dashboard"],
    followUps: [
      "How do we prepare for a cyber incident?",
      "What workstreams reduce our cyber risk?",
      "What is our attack surface ratio across departments?",
      "Run a cyber risk assessment for Point of Sales",
    ],
  },
};

// ── Foundational Scenario Artifacts ─────────────────────────────────────────

export const FOUNDATIONAL_SCENARIO_ARTIFACTS: Record<FoundationalScenarioId, ScenarioArtifactDef[]> = {
  "identity-loss": [
    { category: "dashboard", title: "Identity Loss Scenario Modelled", summary: "All 15,000 PoS terminals offline. SLE $33.6M–$48M. MTCR 168–240 hours.", metric: "SLE $48M" },
    { category: "audit", title: "Foundational scenario explored", summary: "Identity services compromise impact analysis completed." },
  ],
  "network-loss": [
    { category: "dashboard", title: "Network Loss Scenario Modelled", summary: "Stores disconnected, e-commerce offline. SLE $10.8M–$18M. MTCR 72–120 hours.", metric: "SLE $18M" },
    { category: "audit", title: "Foundational scenario explored", summary: "Network services compromise impact analysis completed." },
  ],
  "encryption-loss": [
    { category: "dashboard", title: "Encryption Loss Scenario Modelled", summary: "PCI-DSS breach, card transactions halted. SLE $8.6M–$17.3M. Regulatory fines up to $500K/month.", metric: "SLE $17.3M" },
    { category: "audit", title: "Foundational scenario explored", summary: "Encryption services compromise impact analysis completed." },
  ],
  "combined-loss": [
    { category: "dashboard", title: "Combined Attack Scenario Modelled", summary: "Total operational shutdown. SLE $84M–$126M. MTCR 240–360 hours. Worst-case scenario.", metric: "SLE $126M" },
    { category: "audit", title: "Foundational scenario explored", summary: "Combined identity + network compromise impact analysis completed." },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getFoundationalScenarioIdFromFlow(flow: ChatFlow): FoundationalScenarioId | null {
  for (const [id, scenarioFlow] of Object.entries(FOUNDATIONAL_SCENARIO_FLOWS)) {
    if (flow.response === scenarioFlow.response) return id as FoundationalScenarioId;
  }
  return null;
}

export function getScenarioIdFromFlow(flow: ChatFlow): ScenarioId | null {
  for (const [id, scenarioFlow] of Object.entries(SCENARIO_FLOWS)) {
    if (flow.response === scenarioFlow.response) return id as ScenarioId;
  }
  return null;
}

export function getNBAIdFromFlow(flow: ChatFlow): NBAActionId | null {
  for (const [id, execFlow] of Object.entries(EXECUTION_FLOWS)) {
    if (flow.response === execFlow.response) return id as NBAActionId;
  }
  return null;
}

export function matchFlow(input: string): ChatFlow {
  const lower = input.toLowerCase().trim();
  // Check for specific multi-word triggers first to avoid ambiguity
  const sortedFlows = [...CHAT_FLOWS].sort((a, b) => {
    const aMaxLen = Math.max(...a.triggers.map(t => t.length));
    const bMaxLen = Math.max(...b.triggers.map(t => t.length));
    return bMaxLen - aMaxLen;
  });
  for (const flow of sortedFlows) {
    if (flow.triggers.some((t) => lower.includes(t))) {
      return flow;
    }
  }
  return DEFAULT_FLOW;
}

export function getNewFlowId(flow: ChatFlow): NewFlowId | null {
  // Match by checking if the response contains unique identifiers for each flow
  if (flow.response.includes("attack surface ratio")) return "attack-surface";
  if (flow.response.includes("What are Foundational Services")) return "foundational-services";
  if (flow.response.includes("foundational service exposure")) return "foundational-services";
  if (flow.response.includes("preparing for and recovering from")) return "incident-preparation";
  return null;
}

// ── Scoring & Financial Model (re-exported from shared data layer) ───────────
// All scoring logic, types, and control impacts are defined in the shared
// data store to ensure a single source of truth across the entire app.

export { computeAssessment, computeReducedExposure, fmtCurrency, fmtCurrencyShort, SERVICES, getServiceById, getPortfolioKPIs } from "@/lib/risk/cyber-risk-data";
export type { AssessmentInputs, AssessmentResult } from "@/lib/risk/cyber-risk-data";
export type { RiskBand, ControlImpact } from "@/lib/risk/cyber-risk-config";
export { CONTROLS, SCORE_MAP, MAX_SCORE, getRiskBand, getLikelihood } from "@/lib/risk/cyber-risk-config";
export { DEFAULT_BENCHMARK, getBenchmarkComparison, BENCHMARK_CITATIONS } from "@/lib/risk/industry-benchmarks";
export type { BenchmarkComparison } from "@/lib/risk/industry-benchmarks";
