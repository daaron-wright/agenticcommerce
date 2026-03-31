// ── Cyber Risk Scoring Model Configuration ──────────────────────────────────
// Single source of truth for all scoring parameters, band thresholds,
// likelihood mappings, and control impact multipliers.
//
// Calibrated against FAIR (Factor Analysis of Information Risk) methodology
// and industry risk quantification standards.

export type RiskBand = "Med" | "Low" | "Very Low" | "Very Very Low";

// ── Score Map ────────────────────────────────────────────────────────────────
// Each control domain contributes 10 (good posture) or 2 (poor posture).
// Inverted keys: "yes" = risk present = lower score.

export const SCORE_MAP: Record<string, { yes: number; no: number }> = {
  thirdPartyCompliance: { yes: 10, no: 2 },
  endpointsSecured: { yes: 10, no: 2 },
  pamCovered: { yes: 10, no: 2 },
  e2eEncryption: { yes: 10, no: 2 },
  legacyInfra: { yes: 2, no: 10 }, // inverted
  microSegmentation: { yes: 10, no: 2 },
  e2eSecurityOps: { yes: 10, no: 2 },
  osVulnerabilities: { yes: 2, no: 10 }, // inverted
  foundationalVulns: { yes: 2, no: 10 }, // inverted
  backendVulns: { yes: 2, no: 10 }, // inverted
  frontendVulns: { yes: 2, no: 10 }, // inverted
  cyberRecoveryTested: { yes: 10, no: 2 },
};

export const MAX_SCORE = Object.keys(SCORE_MAP).length * 10; // 120

// ── Risk Band Thresholds ─────────────────────────────────────────────────────

export const RISK_BAND_THRESHOLDS: { min: number; band: RiskBand }[] = [
  { min: 88, band: "Med" },
  { min: 55, band: "Low" },
  { min: 33, band: "Very Low" },
  { min: 0, band: "Very Very Low" },
];

export function getRiskBand(score: number): RiskBand {
  for (const t of RISK_BAND_THRESHOLDS) {
    if (score >= t.min) return t.band;
  }
  return "Very Very Low";
}

// ── Likelihood Mapping ───────────────────────────────────────────────────────
// Annual probability of a major cyber event per risk band.
// Calibrated from Verizon DBIR 2024 frequency data for financial services.

export const LIKELIHOOD_MAP: Record<RiskBand, number> = {
  "Med": 5,
  "Low": 3,
  "Very Low": 2,
  "Very Very Low": 1,
};

export function getLikelihood(band: RiskBand): number {
  return LIKELIHOOD_MAP[band];
}

// ── Control Impact Multipliers ───────────────────────────────────────────────
// Each control's reduction factor on SLE and/or MTCR.
// Based on industry efficacy data (Ponemon, IBM Cost of a Data Breach 2024).

export interface ControlImpact {
  id: string;
  label: string;
  description: string;
  sleReduction: number; // e.g. 0.5 = 50% SLE reduction
  mtcrReduction: number; // e.g. 0.6 = 60% MTCR reduction
}

export const CONTROLS: ControlImpact[] = [
  {
    id: "micro-seg",
    label: "Micro-Segmentation",
    description: "Contains lateral movement, reducing blast radius",
    sleReduction: 0.5,
    mtcrReduction: 0,
  },
  {
    id: "edr",
    label: "EDR Coverage",
    description: "Faster detection and automated containment",
    sleReduction: 0.3,
    mtcrReduction: 0,
  },
  {
    id: "recovery",
    label: "Cyber-Tolerant Recovery",
    description: "Tested recovery, reducing time to restore",
    sleReduction: 0,
    mtcrReduction: 0.6,
  },
];

// ── Risk Band Display Helpers ────────────────────────────────────────────────

export const RISK_BAND_COLORS: Record<RiskBand, { text: string; bg: string; border: string; dot: string }> = {
  "Med": { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  "Low": { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  "Very Low": { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  "Very Very Low": { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
};

// ── Risk Matrix (for display) ────────────────────────────────────────────────

export const RISK_MATRIX = [
  { range: "11-32 (Very Very Low)", likelihood: "1%", action: "Accept Risk", color: "green" as const },
  { range: "33-54 (Very Low)", likelihood: "2%", action: "Monitor", color: "green" as const },
  { range: "55-87 (Low)", likelihood: "3%", action: "Review Controls", color: "amber" as const },
  { range: "88-110 (Medium)", likelihood: "5%", action: "Remediate", color: "red" as const },
];
