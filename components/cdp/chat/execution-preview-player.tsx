"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIncrementalityExperiments } from "@/lib/incrementality-store";
import {
  getExecutionPreviewScene,
  type ExecutionPreviewField,
} from "./execution-preview-data";
import { getNBAById, type NBAActionId } from "./chat-data";
import { Activity, Bot, CheckCircle2, Loader2, Radio, Sparkles } from "lucide-react";
import {
  INCREMENTALITY_APPLICATION_LABELS,
  INCREMENTALITY_TEMPLATE_LABELS,
} from "@/lib/incrementality-data";

function fieldToneClass(field: ExecutionPreviewField, isChanged: boolean) {
  if (!isChanged) {
    return "text-slate-700";
  }

  if (field.tone === "success") return "text-emerald-700";
  if (field.tone === "warning") return "text-amber-700";
  if (field.tone === "accent") return "text-sky-700";
  return "text-slate-900";
}

const STATUS_BADGES = {
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  validating: "border-amber-200 bg-amber-50 text-amber-700",
  publishing: "border-sky-200 bg-sky-50 text-sky-700",
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
} as const;

const SCENARIO_BADGE_STYLES = {
  Treatment: "border-sky-200 bg-sky-50 text-sky-700",
  Alternate: "border-violet-200 bg-violet-50 text-violet-700",
  Control: "border-slate-200 bg-slate-50 text-slate-600",
} as const;

export function ExecutionPreviewPlayer({
  actionId,
  runId,
  experimentId,
}: {
  actionId: NBAActionId;
  runId?: string | null;
  experimentId?: string | null;
}) {
  const scene = getExecutionPreviewScene(actionId);
  const action = getNBAById(actionId);
  const { getExperiment } = useIncrementalityExperiments();
  const linkedExperiment = experimentId ? getExperiment(experimentId) : null;
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);

  useEffect(() => {
    setActiveStepIndex(0);
    setActiveScenarioIndex(0);
  }, [actionId, runId, experimentId]);

  useEffect(() => {
    if (!scene || scene.steps.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStepIndex((current) => {
        if (current >= scene.steps.length - 1) {
          window.clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, 1400);

    return () => window.clearInterval(interval);
  }, [scene, runId]);

  useEffect(() => {
    if (!scene || scene.scenarios.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveScenarioIndex((current) => (current + 1) % scene.scenarios.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [scene, runId, experimentId]);

  const currentStep = scene?.steps[Math.min(activeStepIndex, (scene?.steps.length ?? 1) - 1)];
  const activeScenario = scene?.scenarios[Math.min(activeScenarioIndex, (scene?.scenarios.length ?? 1) - 1)];

  const experimentMeta = useMemo(() => {
    const fallback = action?.experiment;
    return {
      title: linkedExperiment?.name ?? fallback?.title ?? scene?.surfaceTitle ?? "Experiment Scenario Preview",
      hypothesis: linkedExperiment?.hypothesis ?? fallback?.hypothesis ?? scene?.surfaceSubtitle ?? "",
      primaryAudienceLabel:
        linkedExperiment?.primaryAudienceLabel ?? fallback?.primaryAudienceLabel ?? "Treatment audience",
      controlAudienceLabel:
        linkedExperiment?.controlAudienceLabel ?? fallback?.controlAudienceLabel ?? "Holdout audience",
      impactedCustomerScope:
        linkedExperiment?.impactedCustomerScope ?? fallback?.impactedCustomerScope ?? "Customer scope",
      applicationLabel: fallback
        ? INCREMENTALITY_APPLICATION_LABELS[fallback.application]
        : "Experiment",
      templateLabel: fallback
        ? INCREMENTALITY_TEMPLATE_LABELS[fallback.template]
        : "Scenario preview",
    };
  }, [action, linkedExperiment, scene]);

  const completionPercent = useMemo(() => {
    if (!scene || scene.steps.length === 0) {
      return 0;
    }
    return ((activeStepIndex + 1) / scene.steps.length) * 100;
  }, [activeStepIndex, scene]);

  if (!scene || !currentStep || !activeScenario) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-500">
        No execution preview is available for this action.
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_32%),linear-gradient(180deg,#f8fafc,white)] text-slate-900">
      <div className="flex h-full flex-col p-4">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-slate-900 p-1.5 text-white">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Experiment Scenario Preview
                </p>
              </div>
              <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                {experimentMeta.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{experimentMeta.hypothesis}</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge variant="outline" className={cn("text-[10px]", STATUS_BADGES[currentStep.status])}>
                {currentStep.status}
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] text-slate-600">
                {experimentMeta.applicationLabel}
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] text-slate-600">
                {experimentMeta.templateLabel}
              </Badge>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-[10px] text-slate-600">
                Demo simulation
              </Badge>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-700"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                Treatment audience
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {experimentMeta.primaryAudienceLabel}
              </p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-700">
                Holdout cohort
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {experimentMeta.controlAudienceLabel}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Customer scope
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {experimentMeta.impactedCustomerScope}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Experiment Setup
                </p>
              </div>

              <div className="space-y-2">
                {scene.steps.map((step, index) => {
                  const isDone = index < activeStepIndex;
                  const isActive = index === activeStepIndex;

                  return (
                    <div
                      key={`${scene.actionId}-${step.label}`}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 transition-all",
                        isActive
                          ? "border-sky-200 bg-sky-50 shadow-sm"
                          : isDone
                            ? "border-emerald-200 bg-emerald-50/70"
                            : "border-slate-200 bg-white",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : isActive ? (
                            <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                          ) : (
                            <Radio className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{step.detail}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex flex-wrap gap-2">
                  {scene.scenarios.map((scenario, index) => {
                    const isActive = index === activeScenarioIndex;
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => setActiveScenarioIndex(index)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                        )}
                      >
                        {scenario.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">{activeScenario.label}</h2>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            SCENARIO_BADGE_STYLES[
                              activeScenario.badge as keyof typeof SCENARIO_BADGE_STYLES
                            ] ?? "border-slate-200 bg-slate-50 text-slate-600",
                          )}
                        >
                          {activeScenario.badge}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{activeScenario.activationPath}</p>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                      {activeScenario.audienceLabel}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Treatment difference
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {activeScenario.treatmentDifference}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Expected impact
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {activeScenario.expectedImpact}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 md:col-span-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Guardrail
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {activeScenario.guardrail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {scene.panels.map((panel) => {
                  const isFocused = currentStep.focusPanelId === panel.id;

                  return (
                    <div
                      key={panel.id}
                      className={cn(
                        "rounded-2xl border bg-white p-4 shadow-sm transition-all duration-500",
                        isFocused
                          ? "border-sky-200 ring-2 ring-sky-100"
                          : "border-slate-200",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">{panel.title}</h2>
                          <p className="mt-0.5 text-[11px] text-slate-500">{panel.subtitle}</p>
                        </div>
                        {panel.badgeValues ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              isFocused
                                ? "border-sky-200 bg-sky-50 text-sky-700"
                                : "border-slate-200 bg-slate-50 text-slate-600",
                            )}
                          >
                            {panel.badgeValues[Math.min(activeStepIndex, panel.badgeValues.length - 1)]}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-4 space-y-3">
                        {panel.fields.map((field) => {
                          const valueIndex = Math.min(activeStepIndex, field.values.length - 1);
                          const value = field.values[valueIndex];
                          const previousValue = valueIndex > 0 ? field.values[valueIndex - 1] : field.values[0];
                          const isChanged = value !== previousValue || activeStepIndex === 0;

                          return (
                            <div key={`${panel.id}-${field.label}`} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                  {field.label}
                                </span>
                                {isFocused && isChanged ? (
                                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.12)]" />
                                ) : null}
                              </div>
                              <p className={cn("mt-1 text-sm font-semibold transition-colors duration-300", fieldToneClass(field, isChanged))}>
                                {value}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-medium text-slate-700">{scene.monitoringLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
