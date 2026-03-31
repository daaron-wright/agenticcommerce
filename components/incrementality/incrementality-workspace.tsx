"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Download,
  FlaskConical,
  Info,
  Plus,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePageBreadcrumbs } from "@/lib/page-breadcrumbs";
import { useIncrementalityExperiments } from "@/lib/incrementality-store";
import {
  INCREMENTALITY_APPLICATION_LABELS,
  INCREMENTALITY_DOMAIN_LABELS,
  INCREMENTALITY_STAGE_LABELS,
  INCREMENTALITY_STATUS_LABELS,
  INCREMENTALITY_TEMPLATE_LABELS,
  buildIncrementalityHref,
  type IncrementalityApplication,
  type IncrementalityDomainLens,
  type IncrementalityExperiment,
  type IncrementalityFilterState,
  type IncrementalityStatus,
  type IncrementalityTemplate,
} from "@/lib/incrementality-data";

type MetricOption =
  | "gross_sales"
  | "net_sales"
  | "net_gross_profit_2"
  | "new_customer_count";

const metricLabels: Record<MetricOption, string> = {
  gross_sales: "Gross sales",
  net_sales: "Net sales",
  net_gross_profit_2: "Net gross profit 2",
  new_customer_count: "New customer count",
};

const STATUS_BADGES: Record<
  IncrementalityStatus,
  { className: string; dotClassName: string; label: string }
> = {
  draft: {
    className: "border-slate-200 bg-slate-50 text-slate-500",
    dotClassName: "text-slate-300",
    label: INCREMENTALITY_STATUS_LABELS.draft,
  },
  running: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dotClassName: "fill-amber-500 text-amber-500",
    label: INCREMENTALITY_STATUS_LABELS.running,
  },
  final_results: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "text-emerald-600",
    label: INCREMENTALITY_STATUS_LABELS.final_results,
  },
};

const APPLICATION_OPTIONS = Object.entries(INCREMENTALITY_APPLICATION_LABELS) as Array<
  [IncrementalityApplication, string]
>;
const TEMPLATE_OPTIONS = Object.entries(INCREMENTALITY_TEMPLATE_LABELS) as Array<
  [IncrementalityTemplate, string]
>;

function parseDomainLens(value: string | null, fallback: "all" | IncrementalityDomainLens) {
  if (value === "udp" || value === "demand" || value === "all") {
    return value;
  }
  return fallback;
}

function parseApplication(value: string | null) {
  if (value && value in INCREMENTALITY_APPLICATION_LABELS) {
    return value as IncrementalityApplication;
  }
  return "all";
}

function parseTemplate(value: string | null) {
  if (value && value in INCREMENTALITY_TEMPLATE_LABELS) {
    return value as IncrementalityTemplate;
  }
  return "all";
}

function parseStatus(value: string | null) {
  if (value === "draft" || value === "running" || value === "final_results" || value === "all") {
    return value;
  }
  return "all";
}

function WorkspaceMetricStrip({
  experiments,
}: {
  experiments: IncrementalityExperiment[];
}) {
  const activeCount = experiments.filter((experiment) => experiment.status === "running").length;
  const reviewCount = experiments.filter((experiment) => experiment.status !== "draft").length;
  const strongestLift = experiments
    .filter((experiment) => experiment.liftDetected > 0)
    .sort((left, right) => right.liftDetected - left.liftDetected)[0];
  const applicationsCovered = new Set(experiments.map((experiment) => experiment.application)).size;

  const metrics = [
    {
      label: "Active Experiments",
      value: `${activeCount}`,
      detail: "Currently measuring live treatment and holdout cohorts",
    },
    {
      label: "Awaiting Readout",
      value: `${reviewCount}`,
      detail: "Running or final-result experiments available to operators",
    },
    {
      label: "Best Recent Lift",
      value: strongestLift ? `${strongestLift.liftDetected.toFixed(1)}%` : "—",
      detail: strongestLift ? strongestLift.name : "No completed readouts yet",
    },
    {
      label: "Applications Covered",
      value: `${applicationsCovered}`,
      detail: "Campaigns, audiences, identity, consent, customer, quality, demand",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border border-slate-200 bg-white/90 shadow-none">
          <CardContent className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {metric.value}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{metric.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ExperimentFilters({
  filters,
  onFiltersChange,
}: {
  filters: IncrementalityFilterState;
  onFiltersChange: (next: IncrementalityFilterState) => void;
}) {
  return (
    <Card className="border border-slate-200 bg-white/90 shadow-none">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "udp", "demand"] as const).map((lens) => (
              <button
                key={lens}
                type="button"
                onClick={() => onFiltersChange({ ...filters, domainLens: lens })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  filters.domainLens === lens
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900",
                )}
              >
                {lens === "all" ? "All lenses" : `${INCREMENTALITY_DOMAIN_LABELS[lens]} lens`}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            <Select
              value={filters.application}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  application: value as IncrementalityFilterState["application"],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All applications</SelectItem>
                {APPLICATION_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.template}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  template: value as IncrementalityFilterState["template"],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All templates</SelectItem>
                {TEMPLATE_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value as IncrementalityFilterState["status"],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="final_results">Final results</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExperimentList({
  experiments,
  onSelect,
  onCreate,
  breadcrumbBaseHref,
}: {
  experiments: IncrementalityExperiment[];
  onSelect: (experiment: IncrementalityExperiment) => void;
  onCreate: () => void;
  breadcrumbBaseHref: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Experiment library</h2>
          <p className="text-sm text-slate-500">
            Shared experiment program across UDP applications, activation, and demand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={breadcrumbBaseHref}>
              Refresh view
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button size="sm" className="rounded-full text-xs gap-1.5" onClick={onCreate}>
            <Plus className="h-3.5 w-3.5" />
            New experiment
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {experiments.map((experiment) => {
          const statusMeta = STATUS_BADGES[experiment.status];
          return (
            <Card
              key={experiment.id}
              className="cursor-pointer border border-slate-200 bg-white/90 shadow-none transition hover:border-slate-300 hover:shadow-sm"
              onClick={() => onSelect(experiment)}
            >
              <CardContent className="px-4 py-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-xl bg-slate-900 p-2 text-white">
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {experiment.name}
                        </p>
                        <Badge variant="outline" className={cn("text-[9px]", statusMeta.className)}>
                          {statusMeta.label}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">
                          {INCREMENTALITY_APPLICATION_LABELS[experiment.application]}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">
                          {INCREMENTALITY_TEMPLATE_LABELS[experiment.template]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {experiment.scopeLabel} · {experiment.country} · {INCREMENTALITY_DOMAIN_LABELS[experiment.domainLens]} lens
                      </p>
                      <p className="mt-2 text-[11px] leading-snug text-slate-600">
                        {experiment.summary}
                      </p>
                      {experiment.primaryAudienceLabel || experiment.controlAudienceLabel ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {experiment.primaryAudienceLabel ? (
                            <Badge variant="outline" className="text-[9px]">
                              Treatment: {experiment.primaryAudienceLabel}
                            </Badge>
                          ) : null}
                          {experiment.controlAudienceLabel ? (
                            <Badge variant="outline" className="text-[9px]">
                              Holdout: {experiment.controlAudienceLabel}
                            </Badge>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">
                        {experiment.incrementalEROAS > 0
                          ? `${experiment.incrementalEROAS.toFixed(0)}%`
                          : "—"}
                      </p>
                      <p className="text-[10px] text-slate-500">Inc. eROAS</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">
                        {experiment.liftDetected > 0 ? `${experiment.liftDetected.toFixed(1)}%` : "—"}
                      </p>
                      <p className="text-[10px] text-slate-500">Lift</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExperimentDetail({
  experiment,
  onBack,
}: {
  experiment: IncrementalityExperiment;
  onBack: () => void;
}) {
  const [metric, setMetric] = useState<MetricOption>("net_sales");
  const [activeTab, setActiveTab] = useState<"charts" | "statistics">("charts");
  const statusMeta = STATUS_BADGES[experiment.status];

  return (
    <div className="flex gap-0 min-h-0">
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={onBack}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Back to experiments
            </button>
            <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
              {experiment.name}
            </span>
          </div>
          <Button size="sm" className="bg-slate-800 hover:bg-slate-900 text-white text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export readout
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
          <p>{experiment.hypothesis}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("charts")}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs transition-colors",
              activeTab === "charts" ? "bg-foreground text-background" : "hover:bg-muted border-border",
            )}
          >
            Geo & Trend Charts
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs transition-colors",
              activeTab === "statistics" ? "bg-foreground text-background" : "hover:bg-muted border-border",
            )}
          >
            Experiment Statistics
          </button>
        </div>

        {activeTab === "charts" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-normal text-muted-foreground">
                    Cumulative causal effect
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={experiment.effectSeries} margin={{ top: 10, right: 10, bottom: 20, left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                      <YAxis
                        tickFormatter={(value: number) => (value === 0 ? "0" : `${(value / 1000000).toFixed(1)}M`)}
                        label={{ value: "Cumulative effect", angle: -90, position: "insideLeft", offset: 20, fontSize: 9 }}
                        tick={{ fontSize: 9 }}
                      />
                      <Tooltip
                        contentStyle={{ fontSize: 10 }}
                        formatter={((value: number | string) =>
                          typeof value === "number"
                            ? value.toLocaleString("en-GB")
                            : String(value)
                        ) as any}
                      />
                      <Area type="monotone" dataKey="ci_upper" stroke="none" fill="#47556920" fillOpacity={0.3} name="CI upper" legendType="none" />
                      <Area type="monotone" dataKey="ci_lower" stroke="none" fill="#ffffff" fillOpacity={1} name="CI lower" legendType="none" />
                      <Line type="monotone" dataKey="effect" stroke="#475569" strokeWidth={2} dot={false} name="Causal effect" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-normal text-muted-foreground">
                    Incremental return trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={experiment.roasSeries} margin={{ top: 10, right: 10, bottom: 20, left: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} />
                      <YAxis tickFormatter={(value: number) => `${value}%`} tick={{ fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 10 }}
                        formatter={((value: number | string) =>
                          `${typeof value === "number" ? value.toFixed(0) : String(value)}%`
                        ) as any}
                      />
                      <Line type="monotone" dataKey="roas" stroke="#475569" strokeWidth={2} dot={false} name="ROAS" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Treatment geography and entity split</CardTitle>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-3 w-3 rounded-full bg-slate-800" />
                      Treatment
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-3 w-3 rounded-full bg-slate-400" />
                      Control
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Treatment
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {experiment.treatmentDesign}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Control
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {experiment.controlDesign}
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs text-slate-700 hover:underline">
                      <Download className="h-3 w-3" />
                      Download design file
                    </button>
                  </div>

                  <div className="relative overflow-hidden rounded-lg bg-slate-50" style={{ height: 220 }}>
                    <svg viewBox="0 0 100 70" className="h-full w-full">
                      <rect x="5" y="5" width="90" height="55" rx="2" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="0.3" />
                      {Array.from({ length: 10 }, (_, col) =>
                        Array.from({ length: 6 }, (_, row) => {
                          const x = 8 + col * 8.5;
                          const y = 7 + row * 8.5;
                          const isTreatment = (col + row) % 3 === 0;

                          return (
                            <rect
                              key={`${col}-${row}`}
                              x={x}
                              y={y}
                              width={7.5}
                              height={7.5}
                              rx={0.5}
                              fill={isTreatment ? "#1e293b" : "#94a3b8"}
                              opacity={0.68 + (((col + 1) * (row + 1)) % 3) * 0.08}
                            />
                          );
                        }),
                      )}
                      {experiment.geoPoints.map((point) => (
                        <circle
                          key={point.label}
                          cx={point.x}
                          cy={point.y}
                          r={1.2}
                          fill={point.group === "treatment" ? "#0f172a" : "#64748b"}
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Experiment statistics</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Metric:</span>
                    <Select value={metric} onValueChange={(value) => setMetric(value as MetricOption)}>
                      <SelectTrigger className="h-7 w-[160px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(metricLabels) as [MetricOption, string][]).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-xs">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-x-12 gap-y-3 lg:grid-cols-2">
                  <div className="space-y-3">
                    {[
                      { label: "Spend during experiment", value: `£${experiment.spendDuringExperiment.toLocaleString("en-GB")}` },
                      { label: "Total spend previous period", value: `£${experiment.totalSpendPrevious.toLocaleString("en-GB")}` },
                      { label: "Incremental net sales", value: `£${experiment.incrementalNetSales.toLocaleString("en-GB")}` },
                      { label: "Incremental eROAS", value: experiment.incrementalEROAS > 0 ? `${experiment.incrementalEROAS.toFixed(2)}%` : "—" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {row.label}
                        </div>
                        <span className="text-sm font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Treatment group proportion of net sales", value: `${experiment.treatmentGroupSales}%` },
                      { label: "Lift detected due to marketing", value: experiment.liftDetected > 0 ? `${experiment.liftDetected}%` : "—" },
                      { label: "Treatment group correlation", value: experiment.treatmentGroupCorrelation.toFixed(2) },
                      { label: "P-value", value: experiment.pValue != null ? `${experiment.pValue.toFixed(2)}%` : "—" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {row.label}
                        </div>
                        <span className="text-sm font-semibold">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Comparison benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={experiment.comparisonMetrics} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={140} />
                    <Tooltip
                      contentStyle={{ fontSize: 10 }}
                      formatter={((value: number | string) =>
                        typeof value === "number" ? value.toFixed(0) : String(value)
                      ) as any}
                    />
                    <Bar dataKey="value" fill="#475569" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Lift analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={experiment.liftSeries} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="x"
                      tickFormatter={(value: number) => `${value}%`}
                      label={{ value: "Treatment intensity", position: "insideBottom", offset: -10, fontSize: 9 }}
                      tick={{ fontSize: 9 }}
                    />
                    <YAxis
                      tickFormatter={(value: number) => `${value}%`}
                      label={{ value: "Observed lift", angle: -90, position: "insideLeft", fontSize: 9 }}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 10 }}
                      formatter={((value: number | string) =>
                        `${typeof value === "number" ? value.toFixed(1) : String(value)}%`
                      ) as any}
                    />
                    <Line type="monotone" dataKey="lift" stroke="#475569" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="ml-4 w-72 flex-shrink-0 space-y-3 border-l pl-4 text-xs">
        <h3 className="pt-8 text-sm font-semibold">Experiment details</h3>
        {[
          { label: "Status", value: statusMeta.label, status: true },
          { label: "Stage", value: INCREMENTALITY_STAGE_LABELS[experiment.stage] },
          { label: "Application", value: INCREMENTALITY_APPLICATION_LABELS[experiment.application] },
          { label: "Template", value: INCREMENTALITY_TEMPLATE_LABELS[experiment.template] },
          { label: "Lens", value: INCREMENTALITY_DOMAIN_LABELS[experiment.domainLens] },
          { label: "Owner", value: experiment.owner },
          { label: "Treatment audience", value: experiment.primaryAudienceLabel },
          { label: "Holdout cohort", value: experiment.controlAudienceLabel },
          { label: "Customer scope", value: experiment.impactedCustomerScope },
        ].map((row) => (
          <div key={row.label} className="flex justify-between gap-3 border-b pb-2">
            <span className="text-muted-foreground">{row.label}</span>
            {row.status ? (
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <CheckCircle2 className="h-3 w-3" />
                {row.value}
              </span>
            ) : (
              <span className="text-right font-medium">{row.value ?? "—"}</span>
            )}
          </div>
        ))}
        <div className="border-b pb-2">
          <span className="mb-1 block text-muted-foreground">Impacted entities</span>
          <div className="space-y-1">
            {experiment.impactedEntities.map((entity) => (
              <div key={entity} className="truncate font-medium">
                {entity}
              </div>
            ))}
          </div>
        </div>
        {[
          { label: "Country", value: experiment.country },
          { label: "Start date", value: experiment.startDate },
          { label: "Treatment period", value: experiment.treatmentPeriod },
          { label: "End date", value: experiment.endDate },
          { label: "Post-treatment", value: experiment.postTreatmentPeriod },
        ].map((row) => (
          <div key={row.label} className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewExperimentDialog({
  open,
  onOpenChange,
  initialLens,
  initialApplication,
  initialTemplate,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLens: IncrementalityDomainLens;
  initialApplication: IncrementalityApplication;
  initialTemplate: IncrementalityTemplate;
  onCreate: (input: {
    title: string;
    application: IncrementalityApplication;
    template: IncrementalityTemplate;
    domainLens: IncrementalityDomainLens;
    hypothesis: string;
    scopeLabel: string;
    primaryAudienceLabel: string;
    controlAudienceLabel: string;
    impactedCustomerScope: string;
    treatmentDesign: string;
    controlDesign: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [application, setApplication] = useState<IncrementalityApplication>(initialApplication);
  const [template, setTemplate] = useState<IncrementalityTemplate>(initialTemplate);
  const [domainLens, setDomainLens] = useState<IncrementalityDomainLens>(initialLens);
  const [hypothesis, setHypothesis] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setApplication(initialApplication);
    setTemplate(initialTemplate);
    setDomainLens(initialLens);
  }, [initialApplication, initialLens, initialTemplate, open]);

  const handleCreate = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    onCreate(
      {
        title: trimmedTitle,
        application,
        template,
        domainLens,
        hypothesis:
          hypothesis.trim() ||
          `Measure whether the ${INCREMENTALITY_TEMPLATE_LABELS[template].toLowerCase()} improves ${INCREMENTALITY_APPLICATION_LABELS[application].toLowerCase()} outcomes.`,
        scopeLabel: `${INCREMENTALITY_APPLICATION_LABELS[application]} · operator draft`,
        primaryAudienceLabel: `${INCREMENTALITY_APPLICATION_LABELS[application]} treatment audience`,
        controlAudienceLabel: `${INCREMENTALITY_APPLICATION_LABELS[application]} holdout cohort`,
        impactedCustomerScope: `Eligible ${INCREMENTALITY_APPLICATION_LABELS[application].toLowerCase()} customer scope`,
        treatmentDesign: `Treatment applies the ${INCREMENTALITY_TEMPLATE_LABELS[template].toLowerCase()} variant to the selected ${INCREMENTALITY_APPLICATION_LABELS[application].toLowerCase()} audience.`,
        controlDesign: "Holdout preserves the current production experience until readout is complete.",
      },
    );
    setTitle("");
    setHypothesis("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Launch new experiment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Experiment title</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Identity Merge Holdout – UK"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Application</label>
              <Select value={application} onValueChange={(value) => setApplication(value as IncrementalityApplication)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Template</label>
              <Select value={template} onValueChange={(value) => setTemplate(value as IncrementalityTemplate)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Lens</label>
              <Select value={domainLens} onValueChange={(value) => setDomainLens(value as IncrementalityDomainLens)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="demand">Demand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Hypothesis</label>
            <Textarea
              value={hypothesis}
              onChange={(event) => setHypothesis(event.target.value)}
              placeholder="State the specific lift or readiness question this experiment should answer."
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            This creates a demo-ready draft experiment in the shared workspace. Operators can review the design, treatment/control split, and early visualizations before promoting it into execution.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create experiment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function IncrementalityWorkspace({
  title,
  description,
  breadcrumbBaseHref,
  defaultLens = "all",
  showControlTowerEntry = false,
}: {
  title: string;
  description: string;
  breadcrumbBaseHref: string;
  defaultLens?: "all" | IncrementalityDomainLens;
  showControlTowerEntry?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedExperiment, setSelectedExperiment] = useState<IncrementalityExperiment | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { experiments, createExperiment } = useIncrementalityExperiments();

  const [filters, setFilters] = useState<IncrementalityFilterState>(() => ({
    domainLens: parseDomainLens(searchParams.get("lens"), defaultLens),
    application: parseApplication(searchParams.get("application")),
    template: parseTemplate(searchParams.get("template")),
    status: parseStatus(searchParams.get("status")),
  }));

  useEffect(() => {
    setFilters({
      domainLens: parseDomainLens(searchParams.get("lens"), defaultLens),
      application: parseApplication(searchParams.get("application")),
      template: parseTemplate(searchParams.get("template")),
      status: parseStatus(searchParams.get("status")),
    });
  }, [defaultLens, searchParams]);

  useEffect(() => {
    const experimentId = searchParams.get("experiment");
    if (!experimentId) {
      return;
    }

    const matched = experiments.find((experiment) => experiment.id === experimentId);
    if (matched) {
      setSelectedExperiment(matched);
    }
  }, [experiments, searchParams]);

  useEffect(() => {
    setCreateOpen(searchParams.get("create") === "true");
  }, [searchParams]);

  const filteredExperiments = useMemo(
    () =>
      experiments.filter((experiment) => {
        if (filters.domainLens !== "all" && experiment.domainLens !== filters.domainLens) {
          return false;
        }
        if (filters.application !== "all" && experiment.application !== filters.application) {
          return false;
        }
        if (filters.template !== "all" && experiment.template !== filters.template) {
          return false;
        }
        if (filters.status !== "all" && experiment.status !== filters.status) {
          return false;
        }
        return true;
      }),
    [experiments, filters],
  );

  const newExperimentLens =
    filters.domainLens === "all" ? "udp" : filters.domainLens;
  const newExperimentApplication =
    filters.application === "all" ? "campaigns" : filters.application;
  const newExperimentTemplate =
    filters.template === "all" ? "geo_lift" : filters.template;

  const breadcrumbOverride = useMemo(() => {
    if (!selectedExperiment) {
      return null;
    }

    return {
      replaceCurrent: true,
      items: [
        { label: "Incrementality", href: pathname || breadcrumbBaseHref },
        { label: selectedExperiment.name },
      ],
    };
  }, [breadcrumbBaseHref, pathname, selectedExperiment]);

  usePageBreadcrumbs(breadcrumbOverride);

  return (
    <>
      <div className="space-y-6">
        <Card className="border border-slate-200 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Shared Experiment Workspace
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {showControlTowerEntry ? (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/dashboard">
                      Control tower
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={buildIncrementalityHref({ entry: "udp", create: true })}>
                    Launch from UDP
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button className="rounded-full bg-slate-900 hover:bg-slate-950" onClick={() => setCreateOpen(true)}>
                  <Sparkles className="mr-1 h-4 w-4" />
                  New experiment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <WorkspaceMetricStrip experiments={filteredExperiments} />

        <ExperimentFilters filters={filters} onFiltersChange={setFilters} />

        {selectedExperiment ? (
          <ExperimentDetail experiment={selectedExperiment} onBack={() => setSelectedExperiment(null)} />
        ) : (
          <ExperimentList
            experiments={filteredExperiments}
            onSelect={setSelectedExperiment}
            onCreate={() => setCreateOpen(true)}
            breadcrumbBaseHref={breadcrumbBaseHref}
          />
        )}
      </div>

      <NewExperimentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialLens={newExperimentLens}
        initialApplication={newExperimentApplication}
        initialTemplate={newExperimentTemplate}
        onCreate={(input) => {
          const experiment = createExperiment({
            ...input,
            owner: "UDP Control Tower",
            summary: `${INCREMENTALITY_TEMPLATE_LABELS[input.template]} experiment for ${INCREMENTALITY_APPLICATION_LABELS[input.application].toLowerCase()} created from the shared control-tower workspace.`,
            primaryMetric: "Primary lift metric",
            impactedEntities: [
              input.primaryAudienceLabel,
              input.controlAudienceLabel,
              input.impactedCustomerScope,
            ],
            campaigns: ["Shared experiment template"],
          });
          setSelectedExperiment(experiment);
        }}
      />
    </>
  );
}
