"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Database, Sparkles } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CONTROL_TOWER_ACTIONS,
  CONTROL_TOWER_ALERTS,
  CONTROL_TOWER_DOMAIN_SUMMARIES,
  CONTROL_TOWER_WIDGETS,
  type ControlTowerDomain,
} from "@/lib/control-tower-data";
import {
  buildDashboardHref,
  getDashboardModuleConfig,
  getDashboardViewConfig,
  type DashboardModule,
  type DashboardView,
} from "@/lib/dashboard-ia";
import { ecommerceDashboardData } from "@/lib/dashboard/mock-ecommerce";
import { buildKnowledgeGraphHref } from "@/lib/knowledge-graph-data";

const DOMAIN_ICONS: Record<DashboardModule, React.ElementType> = {
  udp: Database,
  demand: BarChart3,
};

const DOMAIN_TOWER_MAP: Record<DashboardModule, ControlTowerDomain> = {
  udp: "udp",
  demand: "demand",
};

function MetricGrid({
  metrics,
}: {
  metrics: Array<{ label: string; value: string; detail: string }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border border-stone-200 bg-white/90 shadow-none">
          <CardContent className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#3d3c3c]">
              {metric.value}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">{metric.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ListCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ title: string; detail: string; tone?: "default" | "warning" | "critical" }>;
}) {
  return (
    <Card className="border border-stone-200 bg-white/90 shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#3d3c3c]">{title}</CardTitle>
        <p className="text-sm text-stone-500">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={`${title}-${item.title}`}
            className={cn(
              "rounded-2xl border px-4 py-3",
              item.tone === "critical"
                ? "border-rose-200 bg-rose-50/70"
                : item.tone === "warning"
                  ? "border-amber-200 bg-amber-50/70"
                  : "border-stone-200 bg-stone-50/70",
            )}
          >
            <p className="text-sm font-semibold text-[#3d3c3c]">{item.title}</p>
            <p className="mt-1 text-[11px] leading-snug text-stone-600">{item.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LinkCard({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <Card className="border border-stone-200 bg-white/90 shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[#3d3c3c]">{title}</CardTitle>
        <p className="text-sm text-stone-500">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Button key={link.href} asChild variant="outline" className="rounded-full">
            <Link href={link.href}>
              {link.label}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function buildModuleMetrics(module: DashboardModule, view: DashboardView) {
  const towerSummary = CONTROL_TOWER_DOMAIN_SUMMARIES.find(
    (summary) => summary.domain === DOMAIN_TOWER_MAP[module],
  );

  if (module === "udp" && towerSummary) {
    if (view === "insights") {
      return ecommerceDashboardData.kpis.slice(0, 4).map((metric) => ({
        label: metric.label,
        value: metric.value,
        detail: `${metric.delta} ${metric.subtext}`,
      }));
    }

    if (view === "activation") {
      return [
        { label: "Active Campaigns", value: "12", detail: "4 currently pacing above plan" },
        { label: "Ready Audiences", value: "8", detail: "Consent-safe and activation-ready" },
        { label: "NBA Approvals", value: "3", detail: "Awaiting marketing operator action" },
        { label: "Re-consent Rate", value: "84.3%", detail: "Healthy recovery across paused segments" },
      ];
    }

    if (view === "customers") {
      return [
        { label: "Identity Match Rate", value: "94.2%", detail: "Cross-channel household resolution" },
        { label: "Consent Coverage", value: "87.6%", detail: "Ready for governed activation" },
        { label: "Open Exceptions", value: "14", detail: "3 need operator review today" },
        { label: "Timeline Completeness", value: "96.1%", detail: "Customer journey evidence available" },
      ];
    }

    if (view === "governance") {
      return [
        { label: "Audit Exports", value: "11", detail: "Generated in the last 7 days" },
        { label: "Workflow Health", value: "92%", detail: "Operator-supervised agent completion" },
        { label: "Policy Breaches", value: "2", detail: "Both routed for review" },
        { label: "Agent Coverage", value: "6", detail: "Monitoring identity and activation controls" },
      ];
    }

    return towerSummary.kpis.map((metric) => ({
      label: metric.label,
      value: metric.value,
      detail: metric.trendLabel ?? "Within expected range",
    }));
  }

  if (module === "demand" && towerSummary) {
    if (view === "planning") {
      return [
        { label: "Urgent Approvals", value: "3", detail: "Reorder and allocation actions queued" },
        { label: "DCs Under Pressure", value: "2", detail: "Manchester and Bristol below target cover" },
        { label: "Forecast Shift", value: "+15%", detail: "Fresh and promo-led categories adjusted" },
        { label: "Revenue at Risk", value: "£576K", detail: "If stockouts are not mitigated today" },
      ];
    }

    if (view === "insights") {
      return [
        { label: "Promo Lift", value: "+12.8%", detail: "Weather and promo stacking effect" },
        { label: "Waste Rate", value: "8.3%", detail: "Improving toward 6% target" },
        { label: "Fill Rate", value: "91.2%", detail: "Up 0.8% this week" },
        { label: "Signal Freshness", value: "<15 min", detail: "Demand sensing feed latency" },
      ];
    }

    return towerSummary.kpis.map((metric) => ({
      label: metric.label,
      value: metric.value,
      detail: metric.trendLabel ?? "Within expected range",
    }));
  }

  return [];
}

function buildContentCards(module: DashboardModule, view: DashboardView) {
  const domain = DOMAIN_TOWER_MAP[module];
  const domainAlerts = CONTROL_TOWER_ALERTS.filter((alert) => alert.domain === domain);
  const domainActions = CONTROL_TOWER_ACTIONS.filter((action) => action.domain === domain);
  const domainWidgets = CONTROL_TOWER_WIDGETS.filter((widget) => widget.domain === domain);
  const demandForecastWidget = CONTROL_TOWER_WIDGETS.find((widget) => widget.id === "demand-forecast");
  const identityWidget = CONTROL_TOWER_WIDGETS.find((widget) => widget.id === "identity-exceptions");

  if (module === "udp" && view === "overview") {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ListCard
          title="UDP Operating Focus"
          description="The key readiness dimensions currently driving customer activation and data trust."
          items={(domainWidgets[0]?.rows ?? []).map((row) => ({
            title: `${row.label} · ${row.value ?? "tracking"}`,
            detail: row.meta ?? "Active operator metric",
            tone: row.status === "critical" ? "critical" : row.status === "attention" ? "warning" : "default",
          }))}
        />
        <ListCard
          title="Current UDP Queue"
          description="Cross-domain work that should route back into the deeper UDP drill-in pages."
          items={[...domainAlerts.slice(0, 2), ...domainActions.slice(0, 2)].map((item) => ({
            title: item.title,
            detail: "description" in item ? item.description : item.summary,
            tone: item.severity === "critical" ? "critical" : item.severity === "high" ? "warning" : "default",
          }))}
        />
      </div>
    );
  }

  if (module === "udp" && view === "insights") {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <ListCard
          title="Channel Performance"
          description="Commercial reads and experiment candidates surfaced in one operator view instead of scattered sidebar hops."
          items={ecommerceDashboardData.channels.slice(0, 5).map((channel) => ({
            title: `${channel.channel} · ${channel.conversionRate.toFixed(2)}% CVR`,
            detail: `${channel.orders.toLocaleString()} orders · £${channel.revenue.toLocaleString()} revenue`,
          }))}
        />
        <LinkCard
          title="Insight Drill-ins"
          description="Open reporting, analytics, MMM, and the shared experiment workspace when you want deeper readouts."
          links={[
            { label: "UDP incrementality", href: "/udp/incrementality" },
            { label: "Analytics", href: "/analytics" },
            { label: "Reports", href: "/reports" },
            { label: "MMM", href: "/mmm" },
          ]}
        />
      </div>
    );
  }

  if (module === "udp" && view === "activation") {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <ListCard
          title="Activation Priorities"
          description="Campaign and audience work now grouped into one top-level dashboard bucket."
          items={[
            {
              title: "Consent refresh campaign",
              detail: "Recover paused audience reach before the next promotional wave begins.",
              tone: "warning",
            },
            {
              title: "High-LTV win-back journey",
              detail: "Launch a governed reactivation path for slipping repeat-customer cohorts.",
            },
            {
              title: "Audience suppression review",
              detail: "Resolve malformed audience overlap before broad campaign release.",
            },
          ]}
        />
        <LinkCard
          title="Activation Drill-ins"
          description="Use these links when you want the full specialized page rather than the summary bucket."
          links={[
            { label: "Open campaigns", href: "/campaigns" },
            { label: "Open audiences", href: "/audiences" },
            { label: "Open chat workspace", href: "/chat" },
          ]}
        />
      </div>
    );
  }

  if (module === "udp" && view === "customers") {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <ListCard
          title="Identity And Consent"
          description="Customer-state issues that matter most to governed orchestration."
          items={(identityWidget?.rows ?? []).map((row) => ({
            title: `${row.label} · ${row.value ?? "tracking"}`,
            detail: row.meta ?? "Customer data workflow",
            tone: row.status === "critical" ? "critical" : row.status === "attention" ? "warning" : "default",
          }))}
        />
        <LinkCard
          title="Customer Drill-ins"
          description="Open the existing detailed pages only when you need record-level inspection."
          links={[
            { label: "Customer insights", href: "/customers" },
            { label: "Identity resolution", href: "/identity" },
            { label: "Consent management", href: "/consent" },
            { label: "Data quality", href: "/data-quality" },
          ]}
        />
      </div>
    );
  }

  if (module === "udp" && view === "governance") {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <ListCard
          title="Governance Queue"
          description="Operator approvals, workflow exceptions, and governed AI actions."
          items={domainActions.slice(0, 4).map((action) => ({
            title: `${action.title} · ${action.state.replace(/_/g, " ")}`,
            detail: action.impact,
            tone: action.severity === "critical" ? "critical" : action.severity === "high" ? "warning" : "default",
          }))}
        />
        <LinkCard
          title="Audit And Workflow Drill-ins"
          description="Jump into the specialized governance pages when you need the full timeline."
          links={[
            { label: "Audit trail", href: "/audit" },
            { label: "Workflow monitor", href: "/workflows" },
            { label: "Control tower", href: buildDashboardHref() },
          ]}
        />
      </div>
    );
  }

  if (module === "demand" && view === "overview") {
    return (
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ListCard
          title="Forecast And Inventory Focus"
          description="The demand chain summary operators need before opening a specialist planning page."
          items={(demandForecastWidget?.rows ?? []).map((row) => ({
            title: `${row.label} · ${row.value ?? "tracking"}`,
            detail: row.meta ?? "Demand planning signal",
            tone: row.status === "critical" ? "critical" : row.status === "attention" ? "warning" : "default",
          }))}
        />
        <ListCard
          title="Urgent Demand Alerts"
          description="Top items routed into the control tower from the planning workflow."
          items={domainAlerts.slice(0, 3).map((alert) => ({
            title: alert.title,
            detail: alert.description,
            tone: alert.severity === "critical" ? "critical" : "warning",
          }))}
        />
      </div>
    );
  }

  if (module === "demand" && view === "insights") {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <ListCard
          title="Demand Drivers"
          description="Cross-functional signals and experiment readouts currently moving the forecast more than baseline seasonality."
          items={[
            {
              title: "Weather-driven uplift",
              detail: "Fresh and chilled demand is running ahead of baseline in heatwave-affected regions.",
            },
            {
              title: "Promo stacking pressure",
              detail: "Weekend promotional activity is amplifying category volatility and pulling inventory forward.",
              tone: "warning",
            },
            {
              title: "Regional fill-rate variance",
              detail: "Manchester remains below target because replenishment lead times widened this week.",
              tone: "warning",
            },
          ]}
        />
        <LinkCard
          title="Insight Drill-ins"
          description="Open the shared experiment and analytics workspaces when you need more depth."
          links={[
            { label: "Demand analytics", href: "/demand/analytics" },
            { label: "Demand reports", href: "/demand/reports" },
            { label: "Demand drivers", href: "/demand/mmm" },
            { label: "Demand incrementality", href: "/demand/incrementality" },
          ]}
        />
      </div>
    );
  }

  if (module === "demand" && view === "planning") {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <ListCard
          title="Planning Actions"
          description="Approvals and planning moves consolidated into one dashboard bucket."
          items={domainActions.slice(0, 4).map((action) => ({
            title: action.title,
            detail: action.summary,
            tone: action.severity === "critical" ? "critical" : "warning",
          }))}
        />
        <LinkCard
          title="Planning Drill-ins"
          description="Use the full planning pages for step-by-step operator execution."
          links={[
            { label: "Demand dashboard", href: "/demand/dashboard" },
            { label: "Planning approvals", href: "/demand/nba" },
            { label: "Open graph chain", href: buildKnowledgeGraphHref({ graphPreset: "demand-chain", graphScopeId: "demand-stockout-chain", graphCenterNodeId: "graph-demand-alert" }) },
          ]}
        />
      </div>
    );
  }

  return null;
}

export function DashboardModuleSurface({
  module,
  view,
}: {
  module: DashboardModule;
  view: DashboardView;
}) {
  const moduleConfig = getDashboardModuleConfig(module);
  const viewConfig = getDashboardViewConfig(module, view);
  const moduleIcon = DOMAIN_ICONS[module];
  const towerSummary = CONTROL_TOWER_DOMAIN_SUMMARIES.find(
    (summary) => summary.domain === DOMAIN_TOWER_MAP[module],
  );
  const Icon = moduleIcon;
  const metrics = buildModuleMetrics(module, view);
  const content = buildContentCards(module, view);

  return (
    <div className="space-y-6">
      <Card className="border border-stone-200 bg-white/90 shadow-none">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-stone-100 p-3">
              <Icon className="h-5 w-5 text-[#3d3c3c]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-stone-200 bg-stone-50 text-[10px] uppercase tracking-wide text-stone-600">
                  {moduleConfig.tabLabel}
                </Badge>
                {viewConfig ? (
                  <Badge variant="outline" className="border-stone-200 bg-white text-[10px] text-stone-500">
                    {viewConfig.label}
                  </Badge>
                ) : null}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#3d3c3c]">
                {viewConfig?.label ?? moduleConfig.label}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-stone-500">
                {viewConfig?.description ?? moduleConfig.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {towerSummary?.graphPreset || towerSummary?.graphScopeId || towerSummary?.graphCenterNodeId ? (
              <Button asChild variant="outline" className="rounded-full">
                <Link
                  href={buildKnowledgeGraphHref({
                    graphPreset: towerSummary.graphPreset,
                    graphScopeId: towerSummary.graphScopeId,
                    graphCenterNodeId: towerSummary.graphCenterNodeId,
                  })}
                >
                  Explore graph
                </Link>
              </Button>
            ) : null}
            <Button asChild className="rounded-full bg-stone-700 hover:bg-stone-800">
              <Link href={viewConfig?.deepLinkHref ?? moduleConfig.deepLinkHref}>
                Open full page
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <MetricGrid metrics={metrics} />

      {content}

      {viewConfig?.artifactCategory ? <RecentFromChat category={viewConfig.artifactCategory} /> : null}

      <Card className="border border-dashed border-stone-200 bg-stone-50/80 shadow-none">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <Sparkles className="h-4 w-4 text-stone-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3d3c3c]">
                Need the cross-domain view again?
              </p>
              <p className="text-[11px] text-stone-500">
                Return to the operator control tower any time to coordinate actions across UDP, commercial activation, and demand planning.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={buildDashboardHref()}>Return to control tower</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
