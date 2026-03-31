import type { ArtifactCategory } from "@/lib/artifact-store";
import type { UserRole } from "@/lib/auth-context";

export type DashboardModule = "udp" | "demand";
export type DashboardView =
  | "overview"
  | "insights"
  | "activation"
  | "customers"
  | "governance"
  | "planning";

export interface DashboardTabConfig {
  id: DashboardView;
  label: string;
  description: string;
  artifactCategory?: ArtifactCategory;
  deepLinkHref?: string;
  roles: UserRole[];
}

export interface DashboardModuleConfig {
  id: DashboardModule;
  label: string;
  tabLabel: string;
  description: string;
  defaultView: DashboardView;
  deepLinkHref: string;
  roles: UserRole[];
  views: DashboardTabConfig[];
}

export interface DashboardRouteContext {
  module: DashboardModule | null;
  view: DashboardView | null;
  title: string;
  source: "control_tower" | "dashboard" | "legacy" | "graph" | null;
}

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

type SearchParamReader = {
  get(name: string): string | null;
};

const UDP_ROLES: UserRole[] = [
  "super_admin",
  "platform_admin",
  "risk_admin",
  "data_admin",
  "marketing_admin",
  "service_agent",
];

const DEMAND_ROLES: UserRole[] = ["super_admin", "platform_admin", "risk_admin"];

export const DASHBOARD_MODULE_CONFIG: Record<DashboardModule, DashboardModuleConfig> = {
  udp: {
    id: "udp",
    label: "UDP Dashboard",
    tabLabel: "UDP",
    description:
      "Customer intelligence, activation readiness, identity health, and governance in one filtered operating view.",
    defaultView: "overview",
    deepLinkHref: "/udp/dashboard",
    roles: UDP_ROLES,
    views: [
      {
        id: "overview",
        label: "Overview",
        description: "Current UDP summary and operating posture.",
        artifactCategory: "dashboard",
        deepLinkHref: "/udp/dashboard",
        roles: UDP_ROLES,
      },
      {
        id: "insights",
        label: "Insights",
        description: "Performance reporting, analytics, and MMM-style insight lenses.",
        artifactCategory: "analytics",
        deepLinkHref: "/analytics",
        roles: ["super_admin", "platform_admin", "data_admin", "marketing_admin"],
      },
      {
        id: "activation",
        label: "Activation",
        description: "Campaigns, audiences, and next-best-action execution context.",
        artifactCategory: "campaigns",
        deepLinkHref: "/campaigns",
        roles: ["super_admin", "platform_admin", "marketing_admin"],
      },
      {
        id: "customers",
        label: "Customers",
        description: "Identity, consent, customer search, and data-quality readiness.",
        artifactCategory: "customers",
        deepLinkHref: "/customers",
        roles: UDP_ROLES,
      },
      {
        id: "governance",
        label: "Governance",
        description: "Audit, workflow monitoring, and operator controls.",
        artifactCategory: "control_tower",
        deepLinkHref: "/audit",
        roles: ["super_admin", "platform_admin", "data_admin", "marketing_admin", "service_agent"],
      },
    ],
  },
  demand: {
    id: "demand",
    label: "Demand Dashboard",
    tabLabel: "Demand",
    description:
      "Forecasting, inventory pressure, and planning actions organized into a cleaner executive operating surface.",
    defaultView: "overview",
    deepLinkHref: "/demand/dashboard",
    roles: DEMAND_ROLES,
    views: [
      {
        id: "overview",
        label: "Overview",
        description: "Forecast and fulfillment summary.",
        artifactCategory: "demand_dashboard",
        deepLinkHref: "/demand/dashboard",
        roles: DEMAND_ROLES,
      },
      {
        id: "insights",
        label: "Insights",
        description: "Analytics, demand drivers, reporting, and incrementality context.",
        artifactCategory: "demand_analytics",
        deepLinkHref: "/demand/analytics",
        roles: DEMAND_ROLES,
      },
      {
        id: "planning",
        label: "Planning",
        description: "Scenario planning, forecast updates, and operator approvals.",
        artifactCategory: "nba",
        deepLinkHref: "/demand/nba",
        roles: DEMAND_ROLES,
      },
    ],
  },
};

const LEGACY_ROUTE_MAP: Array<{
  match: (pathname: string) => boolean;
  module: DashboardModule;
  view: DashboardView;
  breadcrumbs?: BreadcrumbSegment[];
}> = [
  { match: (pathname) => pathname === "/udp/dashboard", module: "udp", view: "overview" },
  {
    match: (pathname) => pathname === "/reports",
    module: "udp",
    view: "insights",
    breadcrumbs: [{ label: "Reports" }],
  },
  {
    match: (pathname) => pathname === "/analytics",
    module: "udp",
    view: "insights",
    breadcrumbs: [{ label: "Analytics" }],
  },
  {
    match: (pathname) => pathname === "/analytics/pending-review",
    module: "udp",
    view: "insights",
    breadcrumbs: [{ label: "Analytics", href: "/analytics" }, { label: "Pending Review" }],
  },
  {
    match: (pathname) => pathname === "/analytics/confirmed-actions",
    module: "udp",
    view: "insights",
    breadcrumbs: [{ label: "Analytics", href: "/analytics" }, { label: "Confirmed Actions" }],
  },
  {
    match: (pathname) => pathname === "/mmm",
    module: "udp",
    view: "insights",
    breadcrumbs: [{ label: "MMM" }],
  },
  {
    match: (pathname) => pathname === "/udp/incrementality",
    module: "udp",
    view: "insights",
    breadcrumbs: [{ label: "Incrementality" }],
  },
  {
    match: (pathname) => pathname === "/campaigns",
    module: "udp",
    view: "activation",
    breadcrumbs: [{ label: "Campaigns" }],
  },
  {
    match: (pathname) => pathname === "/audiences",
    module: "udp",
    view: "activation",
    breadcrumbs: [{ label: "Audiences" }],
  },
  {
    match: (pathname) => pathname === "/customers",
    module: "udp",
    view: "customers",
    breadcrumbs: [{ label: "Customer Insights" }],
  },
  {
    match: (pathname) => pathname === "/identity",
    module: "udp",
    view: "customers",
    breadcrumbs: [{ label: "Identity" }],
  },
  {
    match: (pathname) => pathname === "/data-quality",
    module: "udp",
    view: "customers",
    breadcrumbs: [{ label: "Data Quality" }],
  },
  {
    match: (pathname) => pathname === "/consent",
    module: "udp",
    view: "customers",
    breadcrumbs: [{ label: "Consent" }],
  },
  {
    match: (pathname) => pathname === "/audit",
    module: "udp",
    view: "governance",
    breadcrumbs: [{ label: "Audit" }],
  },
  {
    match: (pathname) => pathname === "/workflows",
    module: "udp",
    view: "governance",
    breadcrumbs: [{ label: "Workflows" }],
  },
  { match: (pathname) => pathname === "/demand/dashboard", module: "demand", view: "overview" },
  {
    match: (pathname) => pathname === "/demand/reports",
    module: "demand",
    view: "insights",
    breadcrumbs: [{ label: "Demand Reports" }],
  },
  {
    match: (pathname) => pathname === "/demand/analytics",
    module: "demand",
    view: "insights",
    breadcrumbs: [{ label: "Demand Analytics" }],
  },
  {
    match: (pathname) => pathname === "/demand/mmm",
    module: "demand",
    view: "insights",
    breadcrumbs: [{ label: "Demand Drivers" }],
  },
  {
    match: (pathname) => pathname === "/demand/incrementality",
    module: "demand",
    view: "insights",
    breadcrumbs: [{ label: "Incrementality" }],
  },
  {
    match: (pathname) => pathname === "/demand/nba",
    module: "demand",
    view: "planning",
    breadcrumbs: [{ label: "Demand Planning" }],
  },
  {
    match: (pathname) => pathname === "/demand/campaigns",
    module: "demand",
    view: "planning",
    breadcrumbs: [{ label: "Demand Campaigns" }],
  },
  {
    match: (pathname) => pathname === "/demand/audiences",
    module: "demand",
    view: "planning",
    breadcrumbs: [{ label: "Demand Audiences" }],
  },
  {
    match: (pathname) => pathname === "/demand/customers",
    module: "demand",
    view: "planning",
    breadcrumbs: [{ label: "Demand Customers" }],
  },
];

export function parseDashboardModule(value: string | null | undefined): DashboardModule | null {
  if (value === "udp" || value === "demand") {
    return value;
  }

  return null;
}

export function parseDashboardView(value: string | null | undefined): DashboardView | null {
  if (
    value === "overview" ||
    value === "insights" ||
    value === "activation" ||
    value === "customers" ||
    value === "governance" ||
    value === "planning"
  ) {
    return value;
  }

  return null;
}

export function isCrossDomainDashboardRole(role: UserRole): boolean {
  return role === "super_admin" || role === "platform_admin" || role === "risk_admin";
}

export function getDefaultDashboardModuleForRole(role: UserRole): DashboardModule | null {
  if (isCrossDomainDashboardRole(role)) {
    return null;
  }

  return "udp";
}

export function getDashboardModuleConfig(module: DashboardModule): DashboardModuleConfig {
  return DASHBOARD_MODULE_CONFIG[module];
}

export function getDashboardViewConfig(
  module: DashboardModule,
  view: DashboardView,
): DashboardTabConfig | null {
  return DASHBOARD_MODULE_CONFIG[module].views.find((candidate) => candidate.id === view) ?? null;
}

export function getAllowedDashboardModules(role: UserRole): DashboardModuleConfig[] {
  return Object.values(DASHBOARD_MODULE_CONFIG).filter((module) => module.roles.includes(role));
}

export function getAllowedDashboardViews(
  role: UserRole,
  module: DashboardModule,
): DashboardTabConfig[] {
  return DASHBOARD_MODULE_CONFIG[module].views.filter((view) => view.roles.includes(role));
}

export function buildDashboardHref(
  module?: DashboardModule | null,
  view?: DashboardView | null,
): string {
  if (!module) {
    return "/dashboard";
  }

  const params = new URLSearchParams();
  params.set("module", module);

  if (view) {
    params.set("view", view);
  }

  return `/dashboard?${params.toString()}`;
}

export function resolveDashboardContext(
  pathname: string,
  searchParams?: SearchParamReader | null,
): DashboardRouteContext {
  if (pathname === "/dashboard/graphs") {
    return {
      module: null,
      view: null,
      title: "Saved Graphs",
      source: "graph",
    };
  }

  if (pathname === "/dashboard/graph") {
    return {
      module: null,
      view: null,
      title: "Knowledge Graph",
      source: "graph",
    };
  }

  if (pathname === "/dashboard" || pathname === "/control-tower") {
    const module = parseDashboardModule(searchParams?.get("module"));
    const view = parseDashboardView(searchParams?.get("view"));

    if (!module) {
      return {
        module: null,
        view: null,
        title: "Unified Control Tower",
        source: "control_tower",
      };
    }

    const moduleConfig = getDashboardModuleConfig(module);
    const resolvedView = view ?? moduleConfig.defaultView;
    const viewConfig = getDashboardViewConfig(module, resolvedView);

    return {
      module,
      view: resolvedView,
      title: viewConfig ? `${moduleConfig.tabLabel} · ${viewConfig.label}` : moduleConfig.label,
      source: "dashboard",
    };
  }

  const matchedRoute = LEGACY_ROUTE_MAP.find((route) => route.match(pathname));
  if (matchedRoute) {
    const moduleConfig = getDashboardModuleConfig(matchedRoute.module);
    const viewConfig = getDashboardViewConfig(matchedRoute.module, matchedRoute.view);

    return {
      module: matchedRoute.module,
      view: matchedRoute.view,
      title: viewConfig ? `${moduleConfig.tabLabel} · ${viewConfig.label}` : moduleConfig.label,
      source: "legacy",
    };
  }

  return {
    module: null,
    view: null,
    title: "Dashboard",
    source: null,
  };
}

function getModuleSegment(module: DashboardModule): BreadcrumbSegment {
  const moduleConfig = getDashboardModuleConfig(module);

  return {
    label: moduleConfig.tabLabel,
    href: buildDashboardHref(module),
  };
}

function getViewSegment(module: DashboardModule, view: DashboardView): BreadcrumbSegment | null {
  const viewConfig = getDashboardViewConfig(module, view);
  if (!viewConfig) {
    return null;
  }

  return {
    label: viewConfig.label,
    href: buildDashboardHref(module, view),
  };
}

function getLegacyRoute(pathname: string) {
  return LEGACY_ROUTE_MAP.find((route) => route.match(pathname)) ?? null;
}

export function resolveBreadcrumbs(
  pathname: string,
  searchParams?: SearchParamReader | null,
): BreadcrumbSegment[] {
  if (pathname === "/dashboard/graphs") {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Saved Graphs" },
    ];
  }

  if (pathname === "/dashboard/graph") {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Knowledge Graph" },
    ];
  }

  if (pathname === "/chat") {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Chat" },
    ];
  }

  if (pathname === "/dashboard" || pathname === "/control-tower") {
    const module = parseDashboardModule(searchParams?.get("module"));
    const view = parseDashboardView(searchParams?.get("view"));

    if (!module) {
      return [{ label: "Dashboard" }];
    }

    const moduleConfig = getDashboardModuleConfig(module);
    const resolvedView = view ?? moduleConfig.defaultView;
    const viewSegment = getViewSegment(module, resolvedView);

    return [{ label: "Dashboard", href: "/dashboard" }, getModuleSegment(module), ...(viewSegment ? [viewSegment] : [])];
  }

  const matchedRoute = getLegacyRoute(pathname);
  if (matchedRoute) {
    const viewSegment = getViewSegment(matchedRoute.module, matchedRoute.view);

    return [
      { label: "Dashboard", href: "/dashboard" },
      getModuleSegment(matchedRoute.module),
      ...(viewSegment ? [viewSegment] : []),
      ...(matchedRoute.breadcrumbs ?? []),
    ];
  }

  return [{ label: "Dashboard" }];
}
