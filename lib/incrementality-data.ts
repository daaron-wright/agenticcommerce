export type IncrementalityApplication =
  | "campaigns"
  | "audiences"
  | "customer_insights"
  | "identity"
  | "consent"
  | "data_quality"
  | "demand";

export type IncrementalityTemplate =
  | "geo_lift"
  | "holdout"
  | "audience_split"
  | "activation_readiness"
  | "identity_resolution"
  | "consent_journey"
  | "data_quality_impact";

export type IncrementalityStatus = "draft" | "running" | "final_results";
export type IncrementalityStage = "design" | "treatment" | "measurement" | "readout";
export type IncrementalityDomainLens = "udp" | "demand";

export interface IncrementalityMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface IncrementalityEffectPoint {
  label: string;
  effect: number;
  ci_upper: number;
  ci_lower: number;
}

export interface IncrementalityRoasPoint {
  label: string;
  roas: number;
}

export interface IncrementalityLiftPoint {
  x: number;
  lift: number;
  expected: number;
}

export interface IncrementalityGeoPoint {
  label: string;
  x: number;
  y: number;
  group: "treatment" | "control";
}

export interface IncrementalityExperiment {
  id: string;
  name: string;
  application: IncrementalityApplication;
  template: IncrementalityTemplate;
  domainLens: IncrementalityDomainLens;
  status: IncrementalityStatus;
  stage: IncrementalityStage;
  hypothesis: string;
  summary: string;
  country: string;
  scopeLabel: string;
  owner: string;
  primaryAudienceLabel?: string;
  controlAudienceLabel?: string;
  impactedCustomerScope?: string;
  primaryMetric: string;
  secondaryMetrics: IncrementalityMetric[];
  impactedEntities: string[];
  campaigns: string[];
  treatmentDesign: string;
  controlDesign: string;
  startDate: string;
  treatmentPeriod: string;
  endDate: string;
  postTreatmentPeriod: string;
  spendDuringExperiment: number;
  totalSpendPrevious: number;
  incrementalNetSales: number;
  incrementalEROAS: number;
  pValue: number | null;
  treatmentGroupSales: number;
  liftDetected: number;
  treatmentGroupCorrelation: number;
  comparisonMetrics: Array<{ name: string; value: number }>;
  effectSeries: IncrementalityEffectPoint[];
  roasSeries: IncrementalityRoasPoint[];
  liftSeries: IncrementalityLiftPoint[];
  geoPoints: IncrementalityGeoPoint[];
}

export interface IncrementalityFilterState {
  domainLens: "all" | IncrementalityDomainLens;
  application: "all" | IncrementalityApplication;
  template: "all" | IncrementalityTemplate;
  status: "all" | IncrementalityStatus;
}

export const INCREMENTALITY_APPLICATION_LABELS: Record<IncrementalityApplication, string> = {
  campaigns: "Campaigns",
  audiences: "Audiences",
  customer_insights: "Customer Insights",
  identity: "Identity",
  consent: "Consent",
  data_quality: "Data Quality",
  demand: "Demand",
};

export const INCREMENTALITY_TEMPLATE_LABELS: Record<IncrementalityTemplate, string> = {
  geo_lift: "Geo Lift",
  holdout: "Holdout / Ghost Ads",
  audience_split: "Audience Split",
  activation_readiness: "Activation Readiness",
  identity_resolution: "Identity Resolution",
  consent_journey: "Consent Journey",
  data_quality_impact: "Data Quality Impact",
};

export const INCREMENTALITY_STATUS_LABELS: Record<IncrementalityStatus, string> = {
  draft: "Draft",
  running: "Running",
  final_results: "Final results",
};

export const INCREMENTALITY_STAGE_LABELS: Record<IncrementalityStage, string> = {
  design: "Design",
  treatment: "Treatment",
  measurement: "Measurement",
  readout: "Readout",
};

export const INCREMENTALITY_DOMAIN_LABELS: Record<IncrementalityDomainLens, string> = {
  udp: "UDP",
  demand: "Demand",
};

const MONTH_LABELS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function createEffectSeries(multiplier: number, offset: number): IncrementalityEffectPoint[] {
  return MONTH_LABELS.map((label, index) => {
    const effect = Math.round((index - 1) * 220000 * multiplier + offset + (index % 2 === 0 ? 38000 : -26000));
    return {
      label,
      effect,
      ci_upper: effect + Math.round(220000 * multiplier),
      ci_lower: effect - Math.round(180000 * multiplier),
    };
  });
}

function createRoasSeries(multiplier: number, base: number): IncrementalityRoasPoint[] {
  return MONTH_LABELS.map((label, index) => ({
    label,
    roas: Math.max(0, Math.round(base + Math.sin(index * 0.9) * 65 * multiplier + index * 12)),
  }));
}

function createLiftSeries(multiplier: number, base: number): IncrementalityLiftPoint[] {
  return Array.from({ length: 20 }, (_, index) => ({
    x: index * 5,
    lift: Math.max(0, Math.round(base - index * 5.8 * multiplier + ((index % 4) - 1.5) * 6)),
    expected: 100,
  }));
}

const GEO_POINTS: IncrementalityGeoPoint[] = [
  { label: "Boston", x: 30, y: 24, group: "treatment" },
  { label: "Hartford", x: 36, y: 20, group: "control" },
  { label: "New York", x: 54, y: 40, group: "treatment" },
  { label: "Philadelphia", x: 24, y: 36, group: "control" },
  { label: "Chicago", x: 34, y: 30, group: "treatment" },
  { label: "Denver", x: 18, y: 10, group: "control" },
  { label: "Atlanta", x: 24, y: 12, group: "treatment" },
  { label: "Pittsburgh", x: 62, y: 28, group: "control" },
  { label: "Albany", x: 18, y: 34, group: "treatment" },
];

function createExperiment(config: Omit<IncrementalityExperiment, "effectSeries" | "roasSeries" | "liftSeries" | "geoPoints"> & {
  effectMultiplier: number;
  effectOffset: number;
  roasMultiplier: number;
  roasBase: number;
  liftMultiplier: number;
  liftBase: number;
}): IncrementalityExperiment {
  return {
    ...config,
    effectSeries: createEffectSeries(config.effectMultiplier, config.effectOffset),
    roasSeries: createRoasSeries(config.roasMultiplier, config.roasBase),
    liftSeries: createLiftSeries(config.liftMultiplier, config.liftBase),
    geoPoints: GEO_POINTS,
  };
}

export const INCREMENTALITY_EXPERIMENTS: IncrementalityExperiment[] = [
  createExperiment({
    id: "exp-pmax-uk",
    name: "Google Lift Test Summer '24",
    application: "campaigns",
    template: "geo_lift",
    domainLens: "demand",
    status: "final_results",
    stage: "readout",
    hypothesis: "PMAX remains undersaturated and can support more spend without eroding incremental efficiency.",
    summary: "Validated geo lift across the US Northeast market and established the strongest incremental efficiency signal in the current portfolio.",
    country: "United States",
    scopeLabel: "Google PMAX · US Northeast",
    owner: "Commercial Analytics",
    primaryMetric: "Incremental eROAS",
    secondaryMetrics: [
      { label: "Incremental eROAS", value: "314.89%", detail: "Best result in the current experiment library" },
      { label: "Incremental net sales", value: "$2.51M", detail: "Measured during treatment + post period" },
      { label: "Lift detected", value: "22.3%", detail: "Across treatment geos" },
    ],
    impactedEntities: ["US_Demand_Gen", "US_Performance_Max", "US_search_generic"],
    campaigns: ["US_Demand_Gen", "US_Performance_Max", "US_search_generic"],
    treatmentDesign: "Geo lift across 21 treatment DMAs with PMAX budget expansion.",
    controlDesign: "Matched holdout DMAs maintaining prior media mix.",
    startDate: "2024-05-01",
    treatmentPeriod: "6 weeks",
    endDate: "2024-09-15",
    postTreatmentPeriod: "3 weeks",
    spendDuringExperiment: 797983,
    totalSpendPrevious: 2751666,
    incrementalNetSales: 2512799,
    incrementalEROAS: 314.89,
    pValue: 1.0,
    treatmentGroupSales: 68.4,
    liftDetected: 22.3,
    treatmentGroupCorrelation: 0.94,
    comparisonMetrics: [
      { name: "Incremental eROAS", value: 315 },
      { name: "Platform eROAS", value: 680 },
      { name: "MTA eROAS", value: 290 },
    ],
    effectMultiplier: 1.35,
    effectOffset: 150000,
    roasMultiplier: 1.1,
    roasBase: 260,
    liftMultiplier: 1.05,
    liftBase: 205,
  }),
  createExperiment({
    id: "exp-loyalty-audience",
    name: "Loyalty Audience Readiness Holdout – UK",
    application: "audiences",
    template: "audience_split",
    domainLens: "udp",
    status: "running",
    stage: "measurement",
    hypothesis: "Refreshing the loyalty audience from consent-safe, identity-complete households improves reactivation lift versus the current audience recipe.",
    summary: "Compares the current loyalty audience against a rebuilt audience using identity and consent readiness thresholds.",
    country: "United Kingdom",
    scopeLabel: "Loyalty audience refresh",
    owner: "Audience Operations",
    primaryMetric: "Reactivation rate",
    secondaryMetrics: [
      { label: "Profiles in test", value: "182K", detail: "Split between current vs rebuilt audience logic" },
      { label: "Observed lift", value: "+8.6%", detail: "Early signal after week 2" },
      { label: "Blocked profiles removed", value: "14.3K", detail: "Due to consent or identity gaps" },
    ],
    impactedEntities: ["Loyalty reactivation audience", "SMS opt-in cohort", "Email win-back cohort"],
    campaigns: ["LOYALTY_REACTIVATION_PUSH", "LOYALTY_EMAIL_SERIES"],
    treatmentDesign: "Audience split between current audience recipe and identity-complete consent-safe recipe.",
    controlDesign: "Current audience logic remains unchanged for holdout households.",
    startDate: "2025-04-22",
    treatmentPeriod: "4 weeks",
    endDate: "2025-05-20",
    postTreatmentPeriod: "2 weeks",
    spendDuringExperiment: 142000,
    totalSpendPrevious: 520000,
    incrementalNetSales: 318000,
    incrementalEROAS: 182.4,
    pValue: null,
    treatmentGroupSales: 41.2,
    liftDetected: 8.6,
    treatmentGroupCorrelation: 0.88,
    comparisonMetrics: [
      { name: "Audience split lift", value: 182 },
      { name: "Current activation eROAS", value: 154 },
      { name: "Legacy audience benchmark", value: 130 },
    ],
    effectMultiplier: 0.92,
    effectOffset: 80000,
    roasMultiplier: 0.82,
    roasBase: 180,
    liftMultiplier: 0.88,
    liftBase: 160,
  }),
  createExperiment({
    id: "exp-identity-holdout",
    name: "Identity Merge Holdout – UK",
    application: "identity",
    template: "identity_resolution",
    domainLens: "udp",
    status: "draft",
    stage: "design",
    hypothesis: "The new household merge strategy reduces activation leakage and improves downstream audience precision versus the current merge rules.",
    summary: "Draft experiment to quantify the downstream impact of stricter identity resolution before promoting the new merge policy.",
    country: "United Kingdom",
    scopeLabel: "Identity resolution strategy",
    owner: "Identity Stewardship",
    primaryMetric: "Audience precision uplift",
    secondaryMetrics: [
      { label: "Impacted profiles", value: "1,240", detail: "Current merge exceptions in scope" },
      { label: "Projected precision lift", value: "+11.2%", detail: "Estimated on simulated holdout" },
      { label: "Activation leakage reduction", value: "-9.4%", detail: "Projected duplicate suppression" },
    ],
    impactedEntities: ["Household merge rules", "Email identifiers", "Household duplication exceptions"],
    campaigns: ["LOYALTY_REACTIVATION_PUSH"],
    treatmentDesign: "Apply revised merge strategy to treatment households before audience generation.",
    controlDesign: "Retain current merge strategy for holdout households.",
    startDate: "2025-06-03",
    treatmentPeriod: "5 weeks",
    endDate: "2025-07-08",
    postTreatmentPeriod: "2 weeks",
    spendDuringExperiment: 0,
    totalSpendPrevious: 0,
    incrementalNetSales: 0,
    incrementalEROAS: 0,
    pValue: null,
    treatmentGroupSales: 0,
    liftDetected: 0,
    treatmentGroupCorrelation: 0.81,
    comparisonMetrics: [
      { name: "Projected precision uplift", value: 112 },
      { name: "Current merge baseline", value: 100 },
      { name: "Activation leakage delta", value: 91 },
    ],
    effectMultiplier: 0.6,
    effectOffset: 20000,
    roasMultiplier: 0.54,
    roasBase: 95,
    liftMultiplier: 0.55,
    liftBase: 120,
  }),
  createExperiment({
    id: "exp-consent-journey",
    name: "Consent Journey Recovery Test – UK",
    application: "consent",
    template: "consent_journey",
    domainLens: "udp",
    status: "running",
    stage: "measurement",
    hypothesis: "A stepped consent-recovery journey with channel sequencing restores more activation-safe profiles than the current one-step refresh.",
    summary: "Measures whether the new consent journey recovers more eligible profiles without creating downstream conflict clusters.",
    country: "United Kingdom",
    scopeLabel: "Consent refresh and recovery",
    owner: "Consent Operations",
    primaryMetric: "Recovered eligible profiles",
    secondaryMetrics: [
      { label: "Recovered profiles", value: "9.4K", detail: "After first sequence wave" },
      { label: "Conflict reduction", value: "-37%", detail: "Compared with the last refresh cycle" },
      { label: "Activation-safe release", value: "84.3%", detail: "Profiles ready for governed activation" },
    ],
    impactedEntities: ["Email consent state", "SMS consent state", "Loyalty recovery cohort"],
    campaigns: ["SPRING_REFRESH_CAMPAIGN", "LOYALTY_RECOVERY_SERIES"],
    treatmentDesign: "Staggered consent sequence across email then SMS with identity validation gate.",
    controlDesign: "Single-step consent refresh email only.",
    startDate: "2025-04-10",
    treatmentPeriod: "3 weeks",
    endDate: "2025-05-01",
    postTreatmentPeriod: "1 week",
    spendDuringExperiment: 46000,
    totalSpendPrevious: 110000,
    incrementalNetSales: 214000,
    incrementalEROAS: 146.8,
    pValue: null,
    treatmentGroupSales: 36.8,
    liftDetected: 12.4,
    treatmentGroupCorrelation: 0.9,
    comparisonMetrics: [
      { name: "Recovery journey lift", value: 147 },
      { name: "Legacy consent recovery", value: 112 },
      { name: "Conflict-adjusted benchmark", value: 104 },
    ],
    effectMultiplier: 0.86,
    effectOffset: 65000,
    roasMultiplier: 0.75,
    roasBase: 160,
    liftMultiplier: 0.8,
    liftBase: 150,
  }),
  createExperiment({
    id: "exp-data-quality-impact",
    name: "Data Quality Remediation Impact – DE",
    application: "data_quality",
    template: "data_quality_impact",
    domainLens: "udp",
    status: "final_results",
    stage: "readout",
    hypothesis: "Fixing malformed identifiers and enrichment gaps before audience activation materially improves segment match quality and downstream conversion.",
    summary: "Completed remediation impact test across Germany showing meaningful lift in audience quality and activation performance.",
    country: "Germany",
    scopeLabel: "Identifier and enrichment remediation",
    owner: "Data Quality Operations",
    primaryMetric: "Match quality uplift",
    secondaryMetrics: [
      { label: "Match quality uplift", value: "+13.1%", detail: "Versus untreated cohorts" },
      { label: "Suppressed duplicates", value: "-18.4%", detail: "Lower duplicate exposure in activation" },
      { label: "Activation conversion lift", value: "+6.7%", detail: "Downstream campaign improvement" },
    ],
    impactedEntities: ["Malformed email identifiers", "Enrichment gaps", "Germany CRM cohort"],
    campaigns: ["DE_RETENTION_WAVE"],
    treatmentDesign: "Remediation rules applied before audience export and activation.",
    controlDesign: "Current remediation timing retained until after export.",
    startDate: "2025-01-08",
    treatmentPeriod: "5 weeks",
    endDate: "2025-02-12",
    postTreatmentPeriod: "2 weeks",
    spendDuringExperiment: 98000,
    totalSpendPrevious: 202000,
    incrementalNetSales: 428000,
    incrementalEROAS: 196.2,
    pValue: 2.4,
    treatmentGroupSales: 52.1,
    liftDetected: 13.1,
    treatmentGroupCorrelation: 0.92,
    comparisonMetrics: [
      { name: "Remediation impact eROAS", value: 196 },
      { name: "Pre-fix benchmark", value: 143 },
      { name: "Duplicate-adjusted baseline", value: 129 },
    ],
    effectMultiplier: 1.08,
    effectOffset: 120000,
    roasMultiplier: 0.94,
    roasBase: 210,
    liftMultiplier: 0.92,
    liftBase: 175,
  }),
  createExperiment({
    id: "exp-customer-journey",
    name: "Customer Insight Next-Step Test – Nordics",
    application: "customer_insights",
    template: "holdout",
    domainLens: "udp",
    status: "running",
    stage: "treatment",
    hypothesis: "Injecting next-best-step recommendations into customer insight workflows increases operator response speed and campaign acceptance.",
    summary: "Tests whether surfaced customer insight recommendations improve operator follow-through and activation conversion.",
    country: "Nordics",
    scopeLabel: "Insight-to-action workflow",
    owner: "Customer Intelligence",
    primaryMetric: "Operator action acceptance",
    secondaryMetrics: [
      { label: "Recommendations accepted", value: "63%", detail: "So far in the treatment group" },
      { label: "Time-to-action delta", value: "-22%", detail: "Faster than the holdout workflow" },
      { label: "Activation follow-through", value: "+7.1%", detail: "After insight handoff" },
    ],
    impactedEntities: ["High-value churn cohort", "Insight summary cards", "Operator workflow prompts"],
    campaigns: ["NORDICS_RETENTION_PUSH"],
    treatmentDesign: "Next-best-step recommendation injected into customer insight review workflow.",
    controlDesign: "Standard insight panel without recommendation overlay.",
    startDate: "2025-03-03",
    treatmentPeriod: "4 weeks",
    endDate: "2025-03-31",
    postTreatmentPeriod: "2 weeks",
    spendDuringExperiment: 72000,
    totalSpendPrevious: 145000,
    incrementalNetSales: 198000,
    incrementalEROAS: 121.5,
    pValue: null,
    treatmentGroupSales: 33.5,
    liftDetected: 7.1,
    treatmentGroupCorrelation: 0.86,
    comparisonMetrics: [
      { name: "Workflow lift", value: 122 },
      { name: "Baseline acceptance", value: 97 },
      { name: "Legacy handoff", value: 88 },
    ],
    effectMultiplier: 0.78,
    effectOffset: 55000,
    roasMultiplier: 0.7,
    roasBase: 135,
    liftMultiplier: 0.74,
    liftBase: 142,
  }),
  createExperiment({
    id: "exp-promo-forecast",
    name: "Promo Forecast Lift – Northeast DC",
    application: "demand",
    template: "geo_lift",
    domainLens: "demand",
    status: "running",
    stage: "measurement",
    hypothesis: "Promo-aware forecast adjustments reduce stockout risk and improve fill rate during localized promotional spikes.",
    summary: "Demand lens experiment measuring whether promo-aware forecast updates improve fill rate without increasing waste.",
    country: "United States",
    scopeLabel: "Northeast DC chilled promo demand",
    owner: "Demand Planning",
    primaryMetric: "Forecast accuracy uplift",
    secondaryMetrics: [
      { label: "Forecast accuracy uplift", value: "+9.2%", detail: "Compared with the baseline model" },
      { label: "Fill rate change", value: "+3.8%", detail: "Across treated categories" },
      { label: "Waste delta", value: "-1.1%", detail: "No meaningful spoilage penalty observed" },
    ],
    impactedEntities: ["Northeast DC", "Chilled promo categories", "Weekend uplift model"],
    campaigns: ["STORM_PREP_CAMPAIGN"],
    treatmentDesign: "Promo-aware forecast applied to treated categories in Northeast DC.",
    controlDesign: "Baseline forecast retained for matched categories and weeks.",
    startDate: "2025-05-05",
    treatmentPeriod: "4 weeks",
    endDate: "2025-06-02",
    postTreatmentPeriod: "1 week",
    spendDuringExperiment: 0,
    totalSpendPrevious: 0,
    incrementalNetSales: 576000,
    incrementalEROAS: 0,
    pValue: null,
    treatmentGroupSales: 59.4,
    liftDetected: 9.2,
    treatmentGroupCorrelation: 0.89,
    comparisonMetrics: [
      { name: "Forecast uplift", value: 109 },
      { name: "Baseline accuracy", value: 100 },
      { name: "Waste-adjusted score", value: 104 },
    ],
    effectMultiplier: 0.98,
    effectOffset: 97000,
    roasMultiplier: 0.45,
    roasBase: 80,
    liftMultiplier: 0.82,
    liftBase: 138,
  }),
];

export function buildIncrementalityHref(options?: {
  entry?: "udp" | "demand";
  lens?: "all" | IncrementalityDomainLens;
  application?: "all" | IncrementalityApplication;
  template?: "all" | IncrementalityTemplate;
  status?: "all" | IncrementalityStatus;
  experimentId?: string;
  create?: boolean;
}): string {
  const entry = options?.entry ?? "udp";
  const pathname =
    entry === "demand" ? "/demand/incrementality" : "/udp/incrementality";

  const params = new URLSearchParams();

  if (options?.lens && options.lens !== "all") {
    params.set("lens", options.lens);
  }
  if (options?.application && options.application !== "all") {
    params.set("application", options.application);
  }
  if (options?.template && options.template !== "all") {
    params.set("template", options.template);
  }
  if (options?.status && options.status !== "all") {
    params.set("status", options.status);
  }
  if (options?.experimentId) {
    params.set("experiment", options.experimentId);
  }
  if (options?.create) {
    params.set("create", "true");
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
