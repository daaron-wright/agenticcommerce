"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INCREMENTALITY_APPLICATION_LABELS,
  INCREMENTALITY_EXPERIMENTS,
  INCREMENTALITY_TEMPLATE_LABELS,
  buildIncrementalityHref,
  type IncrementalityApplication,
  type IncrementalityDomainLens,
  type IncrementalityExperiment,
  type IncrementalityMetric,
  type IncrementalityStatus,
  type IncrementalityTemplate,
} from "@/lib/incrementality-data";
import { getNBAById, type NBAActionId } from "@/components/cdp/chat/chat-data";

const STORAGE_KEY = "kyn-incrementality-experiments";

export interface CreateIncrementalityExperimentInput {
  title: string;
  application: IncrementalityApplication;
  template: IncrementalityTemplate;
  domainLens: IncrementalityDomainLens;
  hypothesis: string;
  summary?: string;
  country?: string;
  scopeLabel?: string;
  owner?: string;
  primaryAudienceLabel?: string;
  controlAudienceLabel?: string;
  impactedCustomerScope?: string;
  primaryMetric?: string;
  secondaryMetrics?: IncrementalityMetric[];
  impactedEntities?: string[];
  campaigns?: string[];
  treatmentDesign?: string;
  controlDesign?: string;
}

interface IncrementalityExperimentStore {
  experiments: IncrementalityExperiment[];
  isHydrated: boolean;
  createExperiment: (input: CreateIncrementalityExperimentInput) => IncrementalityExperiment;
  getExperiment: (experimentId: string) => IncrementalityExperiment | null;
}

const IncrementalityExperimentContext = createContext<IncrementalityExperimentStore | null>(null);

function nextExperimentId(application: IncrementalityApplication, title: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `exp-${application}-${slug}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadExperimentsFromStorage() {
  if (typeof window === "undefined") {
    return INCREMENTALITY_EXPERIMENTS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INCREMENTALITY_EXPERIMENTS));
    return INCREMENTALITY_EXPERIMENTS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Incrementality experiments are not an array");
    }

    const sanitized = parsed.filter(
      (item): item is IncrementalityExperiment =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.application === "string" &&
            typeof item.template === "string" &&
            typeof item.domainLens === "string",
        ),
    );

    return sanitized.length > 0 ? sanitized : INCREMENTALITY_EXPERIMENTS;
  } catch (error) {
    console.error("Failed to load incrementality experiments:", error);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INCREMENTALITY_EXPERIMENTS));
    return INCREMENTALITY_EXPERIMENTS;
  }
}

function persistExperiments(experiments: IncrementalityExperiment[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments));
}

export function buildDraftIncrementalityExperiment(
  input: CreateIncrementalityExperimentInput,
): IncrementalityExperiment {
  const applicationLabel = INCREMENTALITY_APPLICATION_LABELS[input.application];
  const templateLabel = INCREMENTALITY_TEMPLATE_LABELS[input.template];
  const seed = input.title.length + applicationLabel.length + templateLabel.length;

  return {
    id: nextExperimentId(input.application, input.title),
    name: input.title,
    application: input.application,
    template: input.template,
    domainLens: input.domainLens,
    status: "draft",
    stage: "design",
    hypothesis: input.hypothesis,
    summary:
      input.summary ??
      `${templateLabel} experiment for ${applicationLabel.toLowerCase()} created from the shared UDP experiment workspace.`,
    country: input.country ?? "United Kingdom",
    scopeLabel: input.scopeLabel ?? `${applicationLabel} · operator draft`,
    owner: input.owner ?? "Control Tower",
    primaryAudienceLabel:
      input.primaryAudienceLabel ?? `${applicationLabel} treatment audience`,
    controlAudienceLabel:
      input.controlAudienceLabel ?? `${applicationLabel} holdout audience`,
    impactedCustomerScope:
      input.impactedCustomerScope ?? `Eligible ${applicationLabel.toLowerCase()} customer cohort`,
    primaryMetric: input.primaryMetric ?? "Incremental lift",
    secondaryMetrics:
      input.secondaryMetrics ??
      [
        { label: "Projected lift", value: `+${(seed % 9) + 6}.2%`, detail: "Initial planning estimate" },
        { label: "Impacted entities", value: `${(seed % 4) + 2}`, detail: "Cohorts, campaigns, or governed workflows in scope" },
        { label: "Readiness confidence", value: `${74 + (seed % 11)}%`, detail: "Template fit based on current UDP state" },
      ],
    impactedEntities:
      input.impactedEntities ??
      [
        input.primaryAudienceLabel ?? `${applicationLabel} treatment audience`,
        input.controlAudienceLabel ?? `${applicationLabel} holdout cohort`,
        "Shared experiment workspace",
      ],
    campaigns: input.campaigns ?? ["Scenario comparison draft"],
    treatmentDesign:
      input.treatmentDesign ??
      `Treatment applies the ${templateLabel.toLowerCase()} variant to ${input.primaryAudienceLabel?.toLowerCase() ?? "the selected audience"}.`,
    controlDesign:
      input.controlDesign ??
      `Holdout preserves the current production experience for ${input.controlAudienceLabel?.toLowerCase() ?? "the control cohort"}.`,
    startDate: "2025-06-10",
    treatmentPeriod: "4 weeks",
    endDate: "2025-07-08",
    postTreatmentPeriod: "2 weeks",
    spendDuringExperiment: 0,
    totalSpendPrevious: 0,
    incrementalNetSales: 0,
    incrementalEROAS: 0,
    pValue: null,
    treatmentGroupSales: 0,
    liftDetected: 0,
    treatmentGroupCorrelation: 0.84,
    comparisonMetrics: [
      { name: "Projected uplift", value: 108 + (seed % 15) },
      { name: "Current baseline", value: 100 },
      { name: "Guardrail threshold", value: 94 },
    ],
    effectSeries: Array.from({ length: 6 }, (_, index) => ({
      label: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][index],
      effect: Math.round((index - 1) * (22000 + seed * 80)),
      ci_upper: Math.round((index - 1) * (22000 + seed * 80)) + 48000,
      ci_lower: Math.round((index - 1) * (22000 + seed * 80)) - 42000,
    })),
    roasSeries: Array.from({ length: 6 }, (_, index) => ({
      label: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][index],
      roas: Math.max(0, Math.round(90 + Math.sin(index * 0.7) * 24 + seed / 4)),
    })),
    liftSeries: Array.from({ length: 20 }, (_, index) => ({
      x: index * 5,
      lift: Math.max(0, 140 - index * 4 + ((index % 4) - 1) * 5),
      expected: 100,
    })),
    geoPoints: [
      { label: "Boston", x: 30, y: 24, group: "treatment" },
      { label: "Hartford", x: 36, y: 20, group: "control" },
      { label: "New York", x: 54, y: 40, group: "treatment" },
      { label: "Philadelphia", x: 24, y: 36, group: "control" },
    ],
  };
}

export function buildIncrementalityDraftInputFromAction(
  actionId: NBAActionId,
  createdBy: string,
): CreateIncrementalityExperimentInput | null {
  const action = getNBAById(actionId);
  if (!action) {
    return null;
  }

  const config = action.experiment;
  return {
    title: config.title,
    application: config.application,
    template: config.template,
    domainLens: config.domainLens,
    hypothesis: config.hypothesis,
    owner: createdBy,
    primaryAudienceLabel: config.primaryAudienceLabel,
    controlAudienceLabel: config.controlAudienceLabel,
    impactedCustomerScope: config.impactedCustomerScope,
    scopeLabel: config.scopeLabel,
    summary: `${action.title} is being prepared as an experiment-backed launch for ${config.primaryAudienceLabel.toLowerCase()} with a matched holdout cohort for comparison.`,
    primaryMetric: config.primaryMetric,
    impactedEntities: [
      config.primaryAudienceLabel,
      config.controlAudienceLabel,
      config.impactedCustomerScope,
    ],
    campaigns: [action.title],
    treatmentDesign: config.treatmentDesign,
    controlDesign: config.controlDesign,
  };
}

export function buildIncrementalityExperimentHrefForExperiment(
  experiment: Pick<
    IncrementalityExperiment,
    "id" | "application" | "template" | "domainLens"
  >,
) {
  return buildIncrementalityHref({
    entry: experiment.domainLens === "demand" ? "demand" : "udp",
    lens: experiment.domainLens,
    application: experiment.application,
    template: experiment.template,
    experimentId: experiment.id,
  });
}

export function IncrementalityExperimentProvider({ children }: { children: ReactNode }) {
  const [experiments, setExperiments] = useState<IncrementalityExperiment[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadExperimentsFromStorage();
    setExperiments(loaded);
    setIsHydrated(true);
  }, []);

  const createExperiment = useCallback((input: CreateIncrementalityExperimentInput) => {
    const experiment = buildDraftIncrementalityExperiment(input);
    setExperiments((current) => {
      const next = [experiment, ...current];
      persistExperiments(next);
      return next;
    });
    return experiment;
  }, []);

  const getExperiment = useCallback(
    (experimentId: string) =>
      experiments.find((experiment) => experiment.id === experimentId) ?? null,
    [experiments],
  );

  const value = useMemo<IncrementalityExperimentStore>(
    () => ({
      experiments,
      isHydrated,
      createExperiment,
      getExperiment,
    }),
    [createExperiment, experiments, getExperiment, isHydrated],
  );

  return (
    <IncrementalityExperimentContext.Provider value={value}>
      {children}
    </IncrementalityExperimentContext.Provider>
  );
}

export function useIncrementalityExperiments() {
  const context = useContext(IncrementalityExperimentContext);
  if (!context) {
    throw new Error("useIncrementalityExperiments must be used within IncrementalityExperimentProvider");
  }
  return context;
}
