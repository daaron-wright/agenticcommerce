// ── Shared Cyber Risk Data Store ─────────────────────────────────────────────
// Single source of truth for all business service data. Every page and
// component imports from here — no more duplicated mock arrays.
//
// Financial numbers are computed dynamically from inputs + scoring config
// so changing any input automatically updates all downstream values.

import {
  SCORE_MAP, MAX_SCORE, getRiskBand, getLikelihood, CONTROLS,
  type RiskBand, type ControlImpact,
} from "./cyber-risk-config";
import { DEFAULT_BENCHMARK, BENCHMARK_CITATIONS } from "./industry-benchmarks";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AssessmentInputs {
  thirdPartyCompliance: boolean;
  endpointsSecured: boolean;
  pamCovered: boolean;
  e2eEncryption: boolean;
  legacyInfra: boolean;
  microSegmentation: boolean;
  e2eSecurityOps: boolean;
  osVulnerabilities: boolean;
  foundationalVulns: boolean;
  backendVulns: boolean;
  frontendVulns: boolean;
  cyberRecoveryTested: boolean;
  businessImpactPerHour: number;
  mtcrHours: number;
  processName: string;
}

export interface AssessmentResult {
  riskScore: number;
  riskBand: RiskBand;
  likelihoodPercent: number;
  sle: number;
  ale: number;
  processName: string;
  businessImpactPerHour: number;
  mtcrHours: number;
}

export interface ThreatSignal {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  date: string;
  description: string;
  details?: string;
  sourceAgent: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  details: string;
  actor: string;
  serviceId?: string;
  serviceName?: string;
  source?: "system" | "chat";
}

export interface AgentPipelineStep {
  agent: string;
  finding: string;
  confidence: number;
  timestamp: string;
  severity: "critical" | "high" | "medium" | "low" | "safe";
}

export interface RecommendedAction {
  id: string;
  title: string;
  status: string;
  description: string;
  riskReduction: string;
}

export interface SourceConfidence {
  name: string;
  confidence: number;
}

export interface ControlScore {
  control: string;
  score: number;
  max: number;
  status: "good" | "partial" | "risk";
}

export interface BusinessService {
  id: string;
  name: string;
  category: string;
  serviceId: string;
  // Assessment inputs
  controlInputs: AssessmentInputs;
  // Computed from inputs + config
  riskScore: number;
  maxScore: number;
  riskBand: RiskBand;
  likelihoodPercent: number;
  sle: number;
  ale: number;
  // Display
  status: "action_required" | "under_review" | "active";
  trend: "rising" | "stable" | "declining";
  lastAssessed: string;
  sparkline: number[];
  scoreHistory: { date: string; score: number }[];
  // Detail data
  signals: ThreatSignal[];
  controlScores: ControlScore[];
  agentPipeline: AgentPipelineStep[];
  recommendedActions: RecommendedAction[];
  auditTrail: AuditEvent[];
  sourceConfidence: SourceConfidence[];
}

// ── Compute Functions ────────────────────────────────────────────────────────

export function computeAssessment(inputs: AssessmentInputs): AssessmentResult {
  let riskScore = 0;
  const controlKeys = Object.keys(SCORE_MAP);

  for (const key of controlKeys) {
    const value = inputs[key as keyof AssessmentInputs] as boolean;
    riskScore += value ? SCORE_MAP[key].yes : SCORE_MAP[key].no;
  }

  const riskBand = getRiskBand(riskScore);
  const likelihoodPercent = getLikelihood(riskBand);
  const sle = inputs.businessImpactPerHour * inputs.mtcrHours;
  const ale = sle * (likelihoodPercent / 100);

  return {
    riskScore,
    riskBand,
    likelihoodPercent,
    sle,
    ale,
    processName: inputs.processName,
    businessImpactPerHour: inputs.businessImpactPerHour,
    mtcrHours: inputs.mtcrHours,
  };
}

export function computeReducedExposure(
  baseSLE: number,
  baseMTCR: number,
  baseImpactPerHour: number,
  likelihoodPercent: number,
  activeControls: string[]
): { reducedSLE: number; reducedALE: number; reducedMTCR: number } {
  let sleMultiplier = 1;
  let mtcrMultiplier = 1;

  for (const control of CONTROLS) {
    if (activeControls.includes(control.id)) {
      sleMultiplier *= (1 - control.sleReduction);
      mtcrMultiplier *= (1 - control.mtcrReduction);
    }
  }

  const reducedMTCR = baseMTCR * mtcrMultiplier;
  const reducedSLE = baseImpactPerHour * reducedMTCR * sleMultiplier;
  const reducedALE = reducedSLE * (likelihoodPercent / 100);

  return { reducedSLE, reducedALE, reducedMTCR };
}

// ── Currency Formatter ───────────────────────────────────────────────────────

export function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function fmtCurrencyShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── Business Service Definitions ─────────────────────────────────────────────
// Each service has real assessment inputs. Financial values are computed.

const POS_INPUTS: AssessmentInputs = {
  thirdPartyCompliance: false,
  endpointsSecured: false,
  pamCovered: false,
  e2eEncryption: false,
  legacyInfra: true,
  microSegmentation: false,
  e2eSecurityOps: false,
  osVulnerabilities: true,
  foundationalVulns: true,
  backendVulns: true,
  frontendVulns: true,
  cyberRecoveryTested: false,
  businessImpactPerHour: 200_000,
  mtcrHours: 168,
  processName: "Point of Sales",
};

const ECOMMERCE_INPUTS: AssessmentInputs = {
  thirdPartyCompliance: true,
  endpointsSecured: false,
  pamCovered: true,
  e2eEncryption: true,
  legacyInfra: false,
  microSegmentation: false,
  e2eSecurityOps: true,
  osVulnerabilities: false,
  foundationalVulns: false,
  backendVulns: true,
  frontendVulns: true,
  cyberRecoveryTested: false,
  businessImpactPerHour: 150_000,
  mtcrHours: 120,
  processName: "E-Commerce Platform",
};

const PAYMENT_INPUTS: AssessmentInputs = {
  thirdPartyCompliance: true,
  endpointsSecured: true,
  pamCovered: true,
  e2eEncryption: true,
  legacyInfra: false,
  microSegmentation: false,
  e2eSecurityOps: true,
  osVulnerabilities: true,
  foundationalVulns: false,
  backendVulns: false,
  frontendVulns: false,
  cyberRecoveryTested: false,
  businessImpactPerHour: 180_000,
  mtcrHours: 140,
  processName: "Payment Gateway",
};

const SUPPLY_CHAIN_INPUTS: AssessmentInputs = {
  thirdPartyCompliance: true,
  endpointsSecured: true,
  pamCovered: true,
  e2eEncryption: true,
  legacyInfra: false,
  microSegmentation: true,
  e2eSecurityOps: true,
  osVulnerabilities: false,
  foundationalVulns: false,
  backendVulns: false,
  frontendVulns: false,
  cyberRecoveryTested: true,
  businessImpactPerHour: 50_000,
  mtcrHours: 168,
  processName: "Supply Chain Management",
};

function buildService(
  id: string,
  inputs: AssessmentInputs,
  overrides: Partial<Omit<BusinessService, "id" | "controlInputs" | "riskScore" | "maxScore" | "riskBand" | "likelihoodPercent" | "sle" | "ale">>
): BusinessService {
  const result = computeAssessment(inputs);
  return {
    id,
    name: inputs.processName,
    category: overrides.category ?? "",
    serviceId: overrides.serviceId ?? id,
    controlInputs: inputs,
    riskScore: result.riskScore,
    maxScore: MAX_SCORE,
    riskBand: result.riskBand,
    likelihoodPercent: result.likelihoodPercent,
    sle: result.sle,
    ale: result.ale,
    status: overrides.status ?? "active",
    trend: overrides.trend ?? "stable",
    lastAssessed: overrides.lastAssessed ?? "02/26/2026",
    sparkline: overrides.sparkline ?? [],
    scoreHistory: overrides.scoreHistory ?? [],
    signals: overrides.signals ?? [],
    controlScores: overrides.controlScores ?? [],
    agentPipeline: overrides.agentPipeline ?? [],
    recommendedActions: overrides.recommendedActions ?? [],
    auditTrail: overrides.auditTrail ?? [],
    sourceConfidence: overrides.sourceConfidence ?? [],
  };
}

// ── Build All Services ───────────────────────────────────────────────────────

export const SERVICES: BusinessService[] = [
  buildService("point-of-sales", POS_INPUTS, {
    category: "Revenue Processing",
    serviceId: "SVC-001",
    status: "action_required",
    trend: "rising",
    lastAssessed: "02/26/2026",
    sparkline: [55, 62, 68, 72, 78, 85, 88],
    scoreHistory: [
      { date: "Sep", score: 55 }, { date: "Oct", score: 62 }, { date: "Nov", score: 68 },
      { date: "Dec", score: 72 }, { date: "Jan", score: 78 }, { date: "Feb", score: 88 },
    ],
    signals: [
      { id: "sig-1", title: "Micro-Segmentation Gap", severity: "critical", date: "02/26/2026", description: "No east-west traffic controls detected — lateral movement risk across 12 connected systems.", details: "No micro-segmentation controls in place. An attacker gaining access to any single system can move laterally across all 12 connected systems in the PoS environment. Blast radius is unconstrained.", sourceAgent: "Attack Surface Monitor" },
      { id: "sig-2", title: "Untested Recovery Procedures", severity: "high", date: "02/25/2026", description: `Cyber-tolerant recovery has never been tested. MTCR estimate is ${POS_INPUTS.mtcrHours} hours.`, details: `The recovery process has not been validated against a live cyber scenario. Current MTCR of ${POS_INPUTS.mtcrHours} hours is based on theoretical estimates, not tested capability.`, sourceAgent: "Recovery Readiness Agent" },
    ],
    controlScores: [
      { control: "Third-party compliance", score: 8, max: 10, status: "partial" },
      { control: "Endpoint protection", score: 7, max: 10, status: "partial" },
      { control: "PAM coverage", score: 9, max: 10, status: "good" },
      { control: "Data encryption", score: 8, max: 10, status: "partial" },
      { control: "Legacy infrastructure", score: 2, max: 10, status: "risk" },
      { control: "Micro-segmentation", score: 2, max: 10, status: "risk" },
      { control: "Security operations", score: 6, max: 10, status: "partial" },
      { control: "OS vulnerabilities", score: 8, max: 10, status: "risk" },
      { control: "Foundational services", score: 8, max: 10, status: "risk" },
      { control: "Frontend services", score: 7, max: 10, status: "partial" },
      { control: "Backend services", score: 8, max: 10, status: "risk" },
      { control: "Recovery tested", score: 2, max: 10, status: "risk" },
    ],
    sourceConfidence: [
      { name: "Attack Surface Scanner", confidence: 95 },
      { name: "Financial Model Agent", confidence: 90 },
      { name: "Benchmark Agent", confidence: 88 },
    ],
  }),

  buildService("ecommerce-platform", ECOMMERCE_INPUTS, {
    category: "Omni-Channel Retail",
    serviceId: "SVC-002",
    status: "under_review",
    trend: "stable",
    lastAssessed: "02/20/2026",
    sparkline: [58, 60, 61, 62, 62, 62, 62],
    scoreHistory: [
      { date: "Sep", score: 58 }, { date: "Oct", score: 60 }, { date: "Nov", score: 61 },
      { date: "Dec", score: 62 }, { date: "Jan", score: 62 }, { date: "Feb", score: 62 },
    ],
    signals: [
      { id: "sig-3", title: "EDR Coverage Gap", severity: "medium", date: "02/24/2026", description: "312 endpoints unprotected across e-commerce infrastructure — 89% coverage, target is 100%.", details: "EDR agent not deployed on 312 endpoints across e-commerce platform infrastructure. Detection gap creates blind spots for threat response.", sourceAgent: "Attack Surface Monitor" },
    ],
    sourceConfidence: [
      { name: "Attack Surface Scanner", confidence: 90 },
      { name: "Financial Model Agent", confidence: 88 },
    ],
  }),

  buildService("payment-gateway", PAYMENT_INPUTS, {
    category: "Financial Services",
    serviceId: "SVC-003",
    status: "under_review",
    trend: "declining",
    lastAssessed: "02/15/2026",
    sparkline: [68, 65, 62, 60, 58, 56, 55],
    scoreHistory: [
      { date: "Sep", score: 68 }, { date: "Oct", score: 65 }, { date: "Nov", score: 62 },
      { date: "Dec", score: 60 }, { date: "Jan", score: 58 }, { date: "Feb", score: 55 },
    ],
    signals: [
      { id: "sig-4", title: "OS Vulnerability Detected", severity: "medium", date: "02/22/2026", description: "Unpatched CVE in OS stack affecting payment processing infrastructure.", details: "CVE-2026-1234 identified in operating system kernel. Patch available but not yet deployed. Affects 8 servers in payment gateway cluster.", sourceAgent: "Threat Intelligence Agent" },
    ],
    sourceConfidence: [
      { name: "Attack Surface Scanner", confidence: 92 },
    ],
  }),

  buildService("supply-chain", SUPPLY_CHAIN_INPUTS, {
    category: "Supply Chain & Logistics",
    serviceId: "SVC-004",
    status: "active",
    trend: "stable",
    lastAssessed: "02/10/2026",
    sparkline: [30, 29, 28, 28, 28, 28, 28],
    scoreHistory: [
      { date: "Sep", score: 30 }, { date: "Oct", score: 29 }, { date: "Nov", score: 28 },
      { date: "Dec", score: 28 }, { date: "Jan", score: 28 }, { date: "Feb", score: 28 },
    ],
    signals: [],
    sourceConfidence: [
      { name: "Attack Surface Scanner", confidence: 97 },
    ],
  }),
];

// ── Lookup Helpers ───────────────────────────────────────────────────────────

export function getServiceById(id: string): BusinessService | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getServiceMap(): Record<string, BusinessService> {
  const map: Record<string, BusinessService> = {};
  for (const s of SERVICES) map[s.id] = s;
  return map;
}

// ── Computed KPIs (derived from service data) ────────────────────────────────

export function getPortfolioKPIs() {
  const totalALE = SERVICES.reduce((sum, s) => sum + s.ale, 0);
  const servicesAtRisk = SERVICES.filter((s) => s.riskBand === "Med" || s.riskBand === "Low").length;

  // Controls coverage: count of "good" or "partial" across all services that have controlScores
  const allScores = SERVICES.flatMap((s) => s.controlScores);
  const totalControls = allScores.length || 1;
  const coveredControls = allScores.filter((c) => c.status === "good" || c.status === "partial").length;
  const controlsCoverage = Math.round((coveredControls / totalControls) * 100);

  // Open vulnerability categories
  const vulnSignals = SERVICES.flatMap((s) => s.signals).filter((sig) =>
    sig.title.toLowerCase().includes("vulnerability") || sig.title.toLowerCase().includes("cve")
  );
  const openVulns = vulnSignals.length || 2; // fallback to 2 for demo

  return { totalALE, servicesAtRisk, controlsCoverage, openVulns };
}

// ── Agent Pipeline Data (computed from service data) ─────────────────────────

export function getAgentPipeline(service: BusinessService): AgentPipelineStep[] {
  if (service.agentPipeline.length > 0) return service.agentPipeline;

  // Generate pipeline from computed data
  const gapCount = service.controlScores.filter((c) => c.status === "risk").length;
  const steps: AgentPipelineStep[] = [
    {
      agent: "Attack Surface Scanner",
      finding: `12 controls assessed — ${gapCount} critical gaps identified`,
      confidence: 95,
      timestamp: `${service.lastAssessed.slice(0, 5)} 09:00 AM`,
      severity: gapCount >= 3 ? "critical" : gapCount >= 1 ? "medium" : "safe",
    },
    {
      agent: "Scoring Agent",
      finding: `Composite risk score: ${service.riskScore}/${service.maxScore} → ${service.riskBand} band`,
      confidence: 92,
      timestamp: `${service.lastAssessed.slice(0, 5)} 09:05 AM`,
      severity: service.riskBand === "Med" ? "critical" : service.riskBand === "Low" ? "medium" : "safe",
    },
    {
      agent: "Financial Model",
      finding: `SLE ${fmtCurrencyShort(service.sle)}, ALE ${fmtCurrencyShort(service.ale)} at ${service.likelihoodPercent}% likelihood`,
      confidence: 90,
      timestamp: `${service.lastAssessed.slice(0, 5)} 09:10 AM`,
      severity: service.ale > 1_000_000 ? "critical" : service.ale > 500_000 ? "high" : "medium",
    },
    {
      agent: "Benchmark Agent",
      finding: `${service.riskScore > DEFAULT_BENCHMARK.avgMaturityScore ? "Above" : "Below"} industry median (${DEFAULT_BENCHMARK.avgMaturityScore}/${service.maxScore})`,
      confidence: 88,
      timestamp: `${service.lastAssessed.slice(0, 5)} 09:12 AM`,
      severity: service.riskScore > DEFAULT_BENCHMARK.avgMaturityScore ? "high" : "safe",
    },
  ];

  if (service.recommendedActions.length > 0) {
    steps.push({
      agent: "Workstream Engine",
      finding: `${service.recommendedActions.length} remediation workstreams recommended`,
      confidence: 91,
      timestamp: `${service.lastAssessed.slice(0, 5)} 09:15 AM`,
      severity: "critical",
    });
  }

  return steps;
}

// ── Recommended Actions (computed from service data) ─────────────────────────

export function getRecommendedActions(service: BusinessService): RecommendedAction[] {
  if (service.recommendedActions.length > 0) return service.recommendedActions;

  const actions: RecommendedAction[] = [];
  const inputs = service.controlInputs;

  if (!inputs.microSegmentation) {
    const sleReduction = service.sle * 0.5;
    const aleReduction = sleReduction * (service.likelihoodPercent / 100);
    actions.push({
      id: `act-${service.id}-microseg`,
      title: "Implement Micro-Segmentation",
      status: "approval_required",
      description: `Deploy east-west traffic controls to contain blast radius. Reduces SLE by 50% (${fmtCurrencyShort(sleReduction)} reduction). Priority: Critical.`,
      riskReduction: `${fmtCurrency(aleReduction)} ALE reduction`,
    });
  }

  if (!inputs.endpointsSecured) {
    const sleReduction = service.sle * 0.3;
    const aleReduction = sleReduction * (service.likelihoodPercent / 100);
    actions.push({
      id: `act-${service.id}-edr`,
      title: "Deploy EDR Across All Endpoints",
      status: "pending",
      description: `Achieve 100% endpoint detection and response coverage. Reduces SLE by 30% (${fmtCurrencyShort(sleReduction)} reduction). Priority: High.`,
      riskReduction: `${fmtCurrency(aleReduction)} ALE reduction`,
    });
  }

  if (!inputs.cyberRecoveryTested) {
    const reducedMTCR = inputs.mtcrHours * 0.4;
    const reducedSLE = inputs.businessImpactPerHour * reducedMTCR;
    const aleReduction = (service.sle - reducedSLE) * (service.likelihoodPercent / 100);
    actions.push({
      id: `act-${service.id}-recovery`,
      title: "Establish Cyber-Tolerant Recovery",
      status: "pending",
      description: `Test and validate recovery procedures against live scenarios. Reduces MTCR by 60% (${inputs.mtcrHours}h → ${Math.round(reducedMTCR)}h). Priority: High.`,
      riskReduction: `${fmtCurrency(aleReduction)} ALE reduction`,
    });
  }

  return actions;
}

// ── Audit Events (aggregated from all services) ──────────────────────────────

export const chatAuditEvents: AuditEvent[] = [];

export function pushChatAuditEvent(event: Omit<AuditEvent, "id" | "source">) {
  const newEvent: AuditEvent = {
    ...event,
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source: "chat",
  };
  chatAuditEvents.push(newEvent);
}

export function getAllAuditEvents(): AuditEvent[] {
  const events: AuditEvent[] = [];

  for (const svc of SERVICES) {
    // Generate assessment complete event
    events.push({
      id: `ev-${svc.id}-assessment`,
      timestamp: `${svc.lastAssessed} · 9:15 AM`,
      eventType: "Assessment Complete",
      details: `Full cyber risk assessment completed. Risk score: ${svc.riskScore}/${svc.maxScore}, ALE: ${fmtCurrencyShort(svc.ale)}. Risk band: ${svc.riskBand}.`,
      actor: "Cyber Risk Engine",
      serviceId: svc.id,
      serviceName: svc.name,
    });

    // Financial model event
    events.push({
      id: `ev-${svc.id}-financial`,
      timestamp: `${svc.lastAssessed} · 9:10 AM`,
      eventType: "Financial Model Run",
      details: `SLE calculated at ${fmtCurrencyShort(svc.sle)} based on ${fmtCurrencyShort(svc.controlInputs.businessImpactPerHour)}/hr impact and ${svc.controlInputs.mtcrHours}h MTCR.`,
      actor: "Financial Model Agent",
      serviceId: svc.id,
      serviceName: svc.name,
    });

    // Risk score event
    events.push({
      id: `ev-${svc.id}-score`,
      timestamp: `${svc.lastAssessed} · 9:05 AM`,
      eventType: "Risk Score Computed",
      details: `Attack surface maturity score: ${svc.riskScore}/${svc.maxScore}. ${svc.controlScores.filter((c) => c.status === "risk").length} critical control gaps identified.`,
      actor: "Scoring Agent",
      serviceId: svc.id,
      serviceName: svc.name,
    });
  }

  // Add some cross-cutting events
  const pos = SERVICES[0];
  events.push(
    {
      id: "ev-control-gap",
      timestamp: "02/25/2026 · 2:00 PM",
      eventType: "Control Gap Detected",
      details: "Micro-segmentation absent in PoS environment. Blast radius: 12 connected systems.",
      actor: "Attack Surface Scanner",
      serviceId: "point-of-sales",
      serviceName: "Point of Sales",
    },
    {
      id: "ev-edr-gap",
      timestamp: "02/24/2026 · 11:30 AM",
      eventType: "Threat Indicator",
      details: "EDR coverage gap detected: 312 endpoints unprotected across e-commerce platform. 89% coverage vs 100% target.",
      actor: "Endpoint Protection Agent",
      serviceId: "ecommerce-platform",
      serviceName: "E-Commerce Platform",
    },
    {
      id: "ev-vuln",
      timestamp: "02/22/2026 · 8:00 AM",
      eventType: "Vulnerability Detected",
      details: "CVE-2026-1234 in OS stack affecting 8 servers. Patch available, not deployed.",
      actor: "Vulnerability Scanner",
      serviceId: "payment-gateway",
      serviceName: "Payment Gateway",
    },
    {
      id: "ev-benchmark",
      timestamp: "02/05/2026 · 3:00 PM",
      eventType: "Benchmark Updated",
      details: `Industry benchmark refreshed. Organisation positioned above industry median (${DEFAULT_BENCHMARK.avgMaturityScore}/${MAX_SCORE}). ${BENCHMARK_CITATIONS.maturity}`,
      actor: "Benchmark Agent",
      serviceId: "point-of-sales",
      serviceName: "Point of Sales",
    },
    {
      id: "ev-recovery-test",
      timestamp: "01/28/2026 · 10:00 AM",
      eventType: "Recovery Test Failed",
      details: `Cyber-tolerant recovery test initiated but not completed. Estimated MTCR remains at ${pos.controlInputs.mtcrHours} hours.`,
      actor: "Recovery Readiness Agent",
      serviceId: "point-of-sales",
      serviceName: "Point of Sales",
    },
    {
      id: "ev-controls-review",
      timestamp: "01/15/2026 · 2:00 PM",
      eventType: "Controls Review",
      details: "Quarterly controls review passed. All 12 control domains within acceptable thresholds.",
      actor: "Attack Surface Scanner",
      serviceId: "supply-chain",
      serviceName: "Supply Chain Management",
    },
  );

  // Sort by timestamp descending (most recent first)
  const allEvents = [...events, ...chatAuditEvents];
  allEvents.sort((a, b) => {
    // Basic fallback for chat events that might just use an ISO string or similar
    const parseTime = (ts: string) => {
      try {
        return new Date(ts.replace(" · ", " ")).getTime();
      } catch {
        return 0;
      }
    };
    return parseTime(b.timestamp) - parseTime(a.timestamp);
  });

  return allEvents;
}

// ── Threat Signals (aggregated from all services) ────────────────────────────

export function getAllSignals(): (ThreatSignal & { serviceId: string; serviceName: string })[] {
  return SERVICES.flatMap((svc) =>
    svc.signals.map((sig) => ({ ...sig, serviceId: svc.id, serviceName: svc.name }))
  );
}

// ── Monitoring Agents ────────────────────────────────────────────────────────

export const MONITORING_AGENTS = [
  { id: "a1", name: "Attack Surface Monitor", type: "Network & Segmentation", status: "healthy" as const, coverage: 100, signalsCount: 24, icon: "target" },
  { id: "a2", name: "Vulnerability Scanner", type: "CVE & Patch Management", status: "healthy" as const, coverage: 98, signalsCount: 8, icon: "shield" },
  { id: "a3", name: "Endpoint Protection Agent", type: "EDR Coverage", status: "degraded" as const, coverage: 89, signalsCount: 12, icon: "eye" },
  { id: "a4", name: "Recovery Readiness Agent", type: "Business Continuity", status: "healthy" as const, coverage: 100, signalsCount: 4, icon: "filecheck" },
];

export const MONITORING_SIGNALS = [
  {
    id: "ls-1",
    title: "Lateral Movement Attempt Detected",
    type: "network",
    severity: "critical" as const,
    description: "East-west traffic anomaly detected across PoS segment — no micro-segmentation controls in place.",
    sourceAgent: "Attack Surface Monitor",
    timestamp: "9:15:00 AM",
    confidence: 92,
  },
  {
    id: "ls-2",
    title: "Unpatched CVE in OS Stack",
    type: "vulnerability",
    severity: "high" as const,
    description: "CVE-2026-1234 identified on 8 servers in payment gateway cluster. Patch available, not deployed.",
    sourceAgent: "Vulnerability Scanner",
    timestamp: "2:30:00 AM",
    confidence: 95,
  },
  {
    id: "ls-3",
    title: "EDR Agent Health Check",
    type: "endpoint",
    severity: "medium" as const,
    description: "312 endpoints missing EDR coverage in e-commerce platform environment. 89% coverage vs 100% target.",
    sourceAgent: "Endpoint Protection Agent",
    timestamp: "4:00:00 AM",
    confidence: 98,
  },
  {
    id: "ls-4",
    title: "Recovery Readiness Check",
    type: "recovery",
    severity: "high" as const,
    description: `Cyber-tolerant recovery procedures have not been tested. Estimated MTCR: ${POS_INPUTS.mtcrHours} hours (untested).`,
    sourceAgent: "Recovery Readiness Agent",
    timestamp: "6:00:00 AM",
    confidence: 85,
  },
];

// ── Department Attack Surface Ratios ─────────────────────────────────────────
// Retail department endpoint security posture. Formula from industry standard:
// Attack Surface Ratio = (Total - Secured - Compensating) / Total

export interface DepartmentAttackSurface {
  department: string;
  totalEndpoints: number;
  secured: number;
  compensating: number;
  exposed: number;
  ratio: number;
  trend: number[]; // last 6 months ratio %
}

export const DEPARTMENT_ATTACK_SURFACE: DepartmentAttackSurface[] = [
  { department: "Store Operations", totalEndpoints: 15000, secured: 13000, compensating: 750, exposed: 1250, ratio: 8, trend: [15, 13, 12, 10, 9, 8] },
  { department: "E-Commerce", totalEndpoints: 5100, secured: 3700, compensating: 350, exposed: 1050, ratio: 21, trend: [14, 16, 17, 18, 20, 21] },
  { department: "Warehouse & Logistics", totalEndpoints: 400, secured: 350, compensating: 40, exposed: 10, ratio: 3, trend: [5, 3, 3, 3, 2, 3] },
  { department: "R&D / Innovation", totalEndpoints: 700, secured: 300, compensating: 100, exposed: 300, ratio: 43, trend: [30, 40, 45, 51, 50, 43] },
  { department: "Customer Support", totalEndpoints: 3000, secured: 2700, compensating: 275, exposed: 25, ratio: 1, trend: [1, 1, 1, 1, 1, 1] },
  { department: "Corporate IT", totalEndpoints: 400, secured: 390, compensating: 10, exposed: 0, ratio: 0, trend: [0, 0, 0, 0, 0, 0] },
];

export function getOverallAttackSurfaceRatio(): { total: number; secured: number; compensating: number; exposed: number; ratio: number } {
  const total = DEPARTMENT_ATTACK_SURFACE.reduce((s, d) => s + d.totalEndpoints, 0);
  const secured = DEPARTMENT_ATTACK_SURFACE.reduce((s, d) => s + d.secured, 0);
  const compensating = DEPARTMENT_ATTACK_SURFACE.reduce((s, d) => s + d.compensating, 0);
  const exposed = DEPARTMENT_ATTACK_SURFACE.reduce((s, d) => s + d.exposed, 0);
  const ratio = Math.round((exposed / total) * 100);
  return { total, secured, compensating, exposed, ratio };
}

export const SIGNAL_VOLUME = [
  { time: "00:00", count: 8 },
  { time: "04:00", count: 15 },
  { time: "08:00", count: 32 },
  { time: "12:00", count: 28 },
  { time: "16:00", count: 22 },
  { time: "20:00", count: 12 },
];
