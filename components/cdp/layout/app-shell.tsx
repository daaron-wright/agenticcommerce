"use client";

import { Fragment, useState, useMemo, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getNavigation, getPermissions, hasPermissionForUser } from "@/lib/permissions/roles";
import {
  buildDashboardHref,
  getAllowedDashboardModules,
  resolveBreadcrumbs,
  resolveDashboardContext,
} from "@/lib/dashboard-ia";
import { buildIncrementalityHref } from "@/lib/incrementality-data";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  LogOut, Menu, Home, Briefcase, LayoutDashboard,
  ChevronsLeft, ChevronsRight, PieChart, Users,
  Megaphone, TrendingUp, BarChart3, FileText, ScanFace,
  ShieldCheck, Lock, ClipboardList, Activity, Clock, UserSearch,
  Network, MessageSquare, X, CheckCircle2,
  Loader2, ChevronRight, ChevronDown, Monitor,
  AlertTriangle, Zap, FlaskConical, Database, Sparkles,
  MapPin, User, Headphones,
} from "lucide-react";
import { AiGovernanceLifecycle, DataEnrichment } from "@carbon/icons-react";
import { AIRecommendationsPanel } from "@/components/dashboard/ai-recommendations-panel";
import {
  CONTROL_TOWER_ALERTS,
  CONTROL_TOWER_ACTIONS,
  CONTROL_TOWER_SUMMARY,
  type ControlTowerAlert,
  type ControlTowerSeverity,
} from "@/lib/control-tower-data";
import { useActionEffects } from "@/lib/action-effects-store";
import { buildKnowledgeGraphHref } from "@/lib/knowledge-graph-data";
import { useArtifacts, type ArtifactCategory } from "@/lib/artifact-store";
import { cn } from "@/lib/utils";
import { BannerControlsContext, useBannerControls } from "@/lib/banner-controls-context";
import { useChatMessages } from "@/lib/chat-messages-context";
import { DemoNarratorProvider, useDemoNarrator } from "@/components/demo/demo-narrator";
import { ToolCallCard, ActivityCardView } from "@/components/cdp/chat/chat-message";
import { DAGVisualization } from "@/components/dag";
import { getUserJourneyState } from "@/lib/journey-state";
import { useWorkflowEvents } from "@/lib/workflow-event-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PageBreadcrumbProvider,
  usePageBreadcrumbState,
} from "@/lib/page-breadcrumbs";

const ICON_MAP: Record<string, React.ElementType> = {
  // CDP/UDP module
  "/chat": MessageSquare,
  "/dashboard": Monitor,
  "/dashboard/graph": Network,
  "/dashboard/graphs": Network,
  "/udp/dashboard": Home,
  "/udp/incrementality": FlaskConical,
  "/identity": ScanFace,
  "/data-quality": ShieldCheck,
  "/consent": Lock,
  "/audit": ClipboardList,
  "/workflows": Activity,
  "/reports": FileText,
  "/mmm": BarChart3,
  "/incrementality": TrendingUp,
  "/campaigns": Megaphone,
  "/audiences": Users,
  "/customers": UserSearch,
  "/analytics": PieChart,
  "/analytics/pending-review": ClipboardList,
  "/analytics/confirmed-actions": CheckCircle2,
  "/cases": Briefcase,
  "/actions": Activity,
  "/activity": Clock,
  // Control Tower
  "/control-tower": Monitor,
  // Demand Planning module
  "/demand/dashboard": LayoutDashboard,
  "/demand/mmm": BarChart3,
  "/demand/analytics": PieChart,
  "/demand/incrementality": FlaskConical,
  "/demand/campaigns": Megaphone,
  "/demand/audiences": Users,
  "/demand/customers": UserSearch,
  "/demand/reports": FileText,
};

const HREF_TO_GROUP: Record<string, string> = {
  // Control Tower
  "/dashboard": "platform",
  "/control-tower": "platform",
  "/chat": "platform",
  "/analytics/pending-review": "platform",
  "/analytics/confirmed-actions": "platform",
  // Unified Data (data foundation + insights)
  "/udp/dashboard": "data",
  "/customers": "data",
  "/dashboard/graph": "data",
  "/dashboard/graphs": "data",
  "/analytics": "data",
  "/udp/incrementality": "data",
  // Commercial
  "/campaigns": "commercial",
  "/audiences": "commercial",
  "/mmm": "commercial",
  "/reports": "commercial",
  // Demand
  "/demand/dashboard": "demand",
  "/demand/mmm": "demand",
  "/demand/incrementality": "demand",
  "/demand/campaigns": "demand",
  "/demand/audiences": "demand",
  "/demand/customers": "demand",
  "/demand/reports": "demand",
  "/demand/analytics": "demand",
};

const GROUP_ORDER = ["platform", "data", "commercial", "demand"] as const;
type NavGroupId = (typeof GROUP_ORDER)[number];

const GROUP_META: Record<NavGroupId, { label: string; icon: React.ElementType }> = {
  platform: { label: "Control Tower", icon: Monitor },
  data: { label: "Unified Data", icon: Database },
  commercial: { label: "Commercial", icon: Megaphone },
  demand: { label: "Demand", icon: BarChart3 },
};

function BreadcrumbBar({
  pathname,
  searchParams,
}: {
  pathname: string;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const { override } = usePageBreadcrumbState();

  const items = useMemo(() => {
    const base = resolveBreadcrumbs(pathname, searchParams);

    if (!override || override.items.length === 0) {
      return base;
    }

    if (override.replaceCurrent && base.length > 0) {
      return [...base.slice(0, -1), ...override.items];
    }

    return [...base, ...override.items];
  }, [override, pathname, searchParams]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList className="text-xs sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${item.href ?? index}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-[#3d3c3c]">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href ?? "#"} prefetch={false}>
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const DATA_SOURCE_MAP: Record<string, { label: string; module: string }> = {
  "/dashboard": { label: "Control Tower", module: "Control Tower" },
  "/chat": { label: "Control Tower", module: "Conversational AI" },
  "/udp": { label: "Unified Data Platform", module: "Customer Profiles" },
  "/campaigns": { label: "Campaign Management", module: "Campaigns" },
  "/demand": { label: "Demand Signal Engine", module: "Demand Planning" },
  "/analytics": { label: "Control Tower", module: "Analytics" },
};

function resolveDataSource(pathname: string) {
  const exact = DATA_SOURCE_MAP[pathname];
  if (exact) return exact;
  for (const [prefix, source] of Object.entries(DATA_SOURCE_MAP)) {
    if (pathname.startsWith(prefix + "/")) return source;
  }
  return { label: "Unified Data Platform", module: "Platform" };
}

function ConnectionStatusBadges() {
  let summary: { criticalAlerts: number; highAlerts: number; totalAlerts: number; dataFreshness: string };
  try {
    const effects = useActionEffects();
    const adj = effects.getAdjustedSummary();
    summary = adj;
  } catch {
    summary = CONTROL_TOWER_SUMMARY;
  }
  return (
    <>
      <span className="inline-flex items-center gap-1 rounded-full bg-[#ff462d]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff462d]">
        {summary.criticalAlerts} critical
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
        {summary.highAlerts} high
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
        {summary.totalAlerts} alerts
      </span>
      <span className="text-stone-300">&middot;</span>
      <span className="text-[10px] text-stone-400">{summary.dataFreshness}</span>
    </>
  );
}

function ConnectionStatusBar({ pathname }: { pathname: string }) {
  const source = resolveDataSource(pathname);
  const { bannerControls } = useBannerControls();
  return (
    <div className="flex items-center gap-2 border-b bg-stone-50/60 px-6 py-1.5 text-xs text-muted-foreground shrink-0">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span className="font-medium text-stone-600">Connected</span>
      <span className="text-stone-300">—</span>
      <span className="text-stone-500">{source.label}</span>
      <span className="text-stone-300">·</span>
      <span className="text-stone-400">{source.module}</span>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {pathname.startsWith("/chat") && bannerControls}
        <ConnectionStatusBadges />
      </div>
    </div>
  );
}

function DemoToggleButton() {
  const { showButton, toggleDemoButton } = useDemoNarrator();
  return (
    <button
      onClick={toggleDemoButton}
      className={cn(
        "flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors",
        showButton
          ? "text-foreground bg-secondary/50"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
      )}
      title={showButton ? "Hide demo narrator" : "Show demo narrator"}
    >
      <Headphones className="h-4 w-4 shrink-0" />
      <span>{showButton ? "Demo On" : "Demo Off"}</span>
    </button>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [utilityPanelOpen, setUtilityPanelOpen] = useState(false);
  const [activeUtilityTab, setActiveUtilityTab] = useState<"notifications" | "explainability" | "recommendations">("explainability");
  const [bannerControls, setBannerControls] = useState<React.ReactNode>(null);
  const { getUnseenCount, clearArtifacts } = useArtifacts();
  const { setWorkflowEventHandler, setResetDAGHandler, clearWorkflowSession } = useWorkflowEvents();

  const HREF_TO_CATEGORY: Record<string, ArtifactCategory> = {
    // CDP/UDP module
    "/dashboard": "control_tower",
    "/dashboard/graph": "control_tower",
    "/dashboard/graphs": "control_tower",
    "/udp/dashboard": "dashboard",
    "/udp/incrementality": "incrementality",
    "/reports": "reports",
    "/mmm": "mmm",
    "/campaigns": "campaigns",
    "/audiences": "audiences",
    "/customers": "customers",
    "/analytics": "analytics",
    // Control Tower
    "/control-tower": "control_tower",
    // Demand Planning module
    "/demand/dashboard": "demand_dashboard",
    "/demand/analytics": "demand_analytics",
    "/demand/mmm": "demand_mmm",
    "/demand/incrementality": "incrementality",
    "/demand/nba": "nba",
    "/demand/campaigns": "campaigns",
    "/demand/audiences": "audiences",
    "/demand/customers": "customers",
    "/demand/reports": "reports",
  };
  const [dagPanelWidth, setDagPanelWidth] = useState(620);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = dagPanelWidth;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }, [dagPanelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(Math.max(startWidth.current + delta, 300), 900);
      setDagPanelWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const openUtilityPanel = useCallback((tab: "notifications" | "explainability" | "recommendations") => {
    setActiveUtilityTab(tab);
    setUtilityPanelOpen(true);
  }, []);

  // Demo narrator event listeners
  useEffect(() => {
    const handleOpenUtility = (e: Event) => {
      const tab = (e as CustomEvent).detail as "notifications" | "explainability" | "recommendations";
      openUtilityPanel(tab);
    };
    const handleCloseUtility = () => setUtilityPanelOpen(false);
    window.addEventListener("demo:open-utility", handleOpenUtility);
    window.addEventListener("demo:close-utility", handleCloseUtility);
    return () => {
      window.removeEventListener("demo:open-utility", handleOpenUtility);
      window.removeEventListener("demo:close-utility", handleCloseUtility);
    };
  }, [openUtilityPanel]);

  useEffect(() => {
    const openDAGPanel = () => setRightSidebarOpen(true);
    window.addEventListener("kyn:open-dag-panel", openDAGPanel);
    return () => {
      window.removeEventListener("kyn:open-dag-panel", openDAGPanel);
    };
  }, []);

  const journeyState = user ? getUserJourneyState(user.username) : "discovery";

  const dashboardContext = resolveDashboardContext(pathname, searchParams);
  const activeModule = dashboardContext.module;
  const allowedModules = user ? getAllowedDashboardModules(user.role) : [];
  const isControlTowerView = pathname === "/dashboard" && !searchParams.get("module");

  const dagProps = useMemo(() => {
    if (!user) return {};
    // Use pathname to determine which DAG to show
    if (pathname.startsWith("/dashboard") || pathname === "/udp/dashboard" || pathname === "/demand/dashboard") return { isDashboardUseCase: true };
    if (pathname === "/reports" || pathname === "/demand/reports") return { isReportsUseCase: true };
    if (pathname === "/mmm" || pathname === "/demand/mmm") return { isMMMUseCase: true };
    if (user.role === "super_admin" || user.role === "platform_admin") return { isMarketingPersonaUseCase: true };
    if (user.role === "marketing_admin") return { isMarketingPersonaUseCase: true };
    if (user.role === "data_admin") return { isDataAdminUseCase: true };
    if (user.role === "service_agent") return { isServiceAdminUseCase: true };
    if (user.role === "risk_admin") return { isMarketingPersonaUseCase: true };
    return {};
  }, [user, pathname]);

  const permissionList = useMemo(
    () => {
      if (!user) return [];
      const userPermissionContext = {
        role: user.role,
        deniedPermissions: user.deniedPermissions,
      };
      return getPermissions(user.role).map((permission) => ({
        permission,
        label: permission.replace(/_/g, " "),
        allowed: hasPermissionForUser(userPermissionContext, permission),
      }));
    },
    [user]
  );
  const userInitials = useMemo(() => {
    if (!user) return "US";
    const name = user.displayName || user.username || "User";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user]);
  const userRoleLabel = useMemo(() => {
    if (!user) return "";
    if (user.role === "risk_admin") {
      return "business operator";
    }
    return user.role.replace(/_/g, " ");
  }, [user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const navigation = getNavigation(user.role);

  // Build grouped nav items
  const groupedNavItems = useMemo(() => {
    const groups: Partial<Record<NavGroupId, Array<{ label: string; href: string }>>> = {};

    for (const item of navigation) {
      const itemPath = item.href.split("?")[0];
      const groupId = HREF_TO_GROUP[itemPath] as NavGroupId | undefined;
      if (!groupId) continue;
      if (!groups[groupId]) groups[groupId] = [];
      groups[groupId]!.push({ label: item.label, href: item.href });
    }

    // Inject permission-gated items into "platform" group (Control Tower)
    if (hasPermissionForUser(user, "action_approve_review")) {
      if (!groups.platform) groups.platform = [];
      if (!groups.platform.some((i) => i.href === "/analytics/pending-review")) {
        groups.platform.push({ label: "Quick Actions", href: "/analytics/pending-review" });
      }
    }

    // Inject Knowledge Graph into "data" group (Unified Data)
    if (!groups.data) groups.data = [];
    if (!groups.data.some((i) => i.href.startsWith("/dashboard/graph?"))) {
      groups.data.push({ label: "Knowledge Graph", href: "/dashboard/graph?preset=full-graph&center=graph-control-tower" });
    }

    return groups;
  }, [navigation, user]);

  // Determine active group from pathname
  const activeGroupId = useMemo(() => {
    const pathKey = pathname.split("?")[0];
    return (HREF_TO_GROUP[pathKey] as NavGroupId | undefined) ?? "platform";
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Set<NavGroupId>>(
    () => new Set([activeGroupId]),
  );

  const toggleGroup = useCallback((id: NavGroupId) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Auto-open group when pathname changes
  useEffect(() => {
    setOpenGroups((current) => {
      if (current.has(activeGroupId)) return current;
      return new Set([...current, activeGroupId]);
    });
  }, [activeGroupId]);

  const handleLogout = () => {
    clearArtifacts();
    clearWorkflowSession();
    logout();
    router.push("/");
  };

  return (
    <BannerControlsContext.Provider value={{ bannerControls, setBannerControls }}>
    <PageBreadcrumbProvider>
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F2c4b1a359c734bf79d309232cb824265?format=webp&width=800&height=1200"
              alt="Kyndryl"
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="space-y-0.5">
            {GROUP_ORDER.map((groupId) => {
              const items = groupedNavItems[groupId];
              if (!items || items.length === 0) return null;

              const GroupIcon = GROUP_META[groupId].icon;
              const isOpen = openGroups.has(groupId);
              const isGroupActive = activeGroupId === groupId;

              return (
                <div key={groupId}>
                  {/* Group heading */}
                  <button
                    onClick={() => toggleGroup(groupId)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors",
                      isGroupActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <GroupIcon className={cn("h-4 w-4 shrink-0", isGroupActive && "text-primary")} strokeWidth={isGroupActive ? 2.5 : 2} />
                    <span className="flex-1 text-[11px] font-semibold uppercase tracking-widest">
                      {GROUP_META[groupId].label}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Group items */}
                  {isOpen && (
                    <ul className="mb-1 ml-3 space-y-0.5 border-l border-border/50 pl-3">
                      {items.map((item) => {
                        const itemPath = item.href.split("?")[0];
                        const isDashboardItem = itemPath === "/dashboard";
                        const isActive = isDashboardItem
                          ? pathname === "/dashboard" ||
                            pathname === "/control-tower" ||
                            pathname.startsWith("/dashboard/") ||
                            dashboardContext.source === "legacy"
                          : pathname === itemPath;
                        const Icon = ICON_MAP[itemPath] || LayoutDashboard;

                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              prefetch={false}
                              className={cn(
                                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                                isActive
                                  ? "bg-secondary font-medium text-secondary-foreground"
                                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                              )}
                            >
                              <Icon
                                className="h-3.5 w-3.5 shrink-0"
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                              <span className="flex-1">{item.label}</span>
                              {HREF_TO_CATEGORY[itemPath] &&
                                getUnseenCount(HREF_TO_CATEGORY[itemPath]) > 0 && (
                                  <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                                    {getUnseenCount(HREF_TO_CATEGORY[itemPath])}
                                  </span>
                                )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-2 flex flex-col gap-0.5">
          <div className="flex items-center gap-1 mb-3">
            <button
              onClick={() => openUtilityPanel("notifications")}
              className="relative flex-1 flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              title="Notifications"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[10px] font-medium">Alerts</span>
              {CONTROL_TOWER_ALERTS.length > 0 && (
                <span className="absolute top-1 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff462d] px-1 text-[8px] font-bold text-white">
                  {CONTROL_TOWER_ALERTS.length}
                </span>
              )}
            </button>
            {hasPermissionForUser(user, "nba_view") && (
              <button
                onClick={() => openUtilityPanel("explainability")}
                className="flex-1 flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                title="Explainability"
              >
                <AiGovernanceLifecycle size={16} />
                <span className="text-[10px] font-medium">Explain</span>
              </button>
            )}
            <button
              onClick={() => openUtilityPanel("recommendations")}
              className="flex-1 flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              title="AI Recommendations"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-medium">AI Recs</span>
            </button>
          </div>

          <div className="pt-2 border-t flex flex-col gap-1">
            <DemoToggleButton />
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              <ChevronsLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </button>
            <div className="mt-4 px-3 mb-2">
              <div className="text-xs text-muted-foreground mb-1">
                {user.displayName}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          {isControlTowerView ? (
            <>
              {/* Control Tower identity */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Control Tower
                    </p>
                    <p className="text-sm font-semibold leading-none text-foreground">
                      Business decision dashboard
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold">
                  {pathname === "/analytics/pending-review"
                    ? "Quick Actions"
                    : pathname === "/analytics/confirmed-actions"
                      ? "Confirmed Actions"
                      : dashboardContext.title !== "Dashboard"
                        ? dashboardContext.title
                        : navigation.find((item) => item.href.split("?")[0] === pathname)?.label || "Dashboard"}
                </h1>
              </div>

            </>
          )}

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3d3c3c] text-xs font-semibold text-white shadow-sm"
                  aria-label="User menu"
                >
                  {userInitials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Signed in as</DropdownMenuLabel>
                <div className="px-2 pb-2 text-sm">
                  <div className="font-semibold text-foreground">{user.displayName}</div>
                  <div className="text-xs text-muted-foreground">@{user.username}</div>
                  <div className="text-xs text-muted-foreground">Role: {userRoleLabel}</div>
                  {user.email && (
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Permissions</DropdownMenuLabel>
                <div className="px-2 pb-2 max-h-40 overflow-y-auto">
                  {permissionList.map((item) => (
                    <div key={item.permission} className="flex items-center justify-between text-xs py-1">
                      <span className="capitalize text-foreground">{item.label}</span>
                      <span
                        className={
                          item.allowed
                            ? "text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5"
                            : "text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5"
                        }
                      >
                        {item.allowed ? "allowed" : "denied"}
                      </span>
                    </div>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-xs">
                  Reset cache and log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Connection status bar */}
        <ConnectionStatusBar pathname={pathname} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </main>
      </div>

      {/* Utility Panel (slide-out) */}
      {utilityPanelOpen && (
        <div className="fixed inset-0 z-[70]" onClick={() => setUtilityPanelOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div
            className="absolute right-0 top-0 bottom-0 w-[480px] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <UtilityPanel
              activeTab={activeUtilityTab}
              onTabChange={setActiveUtilityTab}
              onClose={() => setUtilityPanelOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Right Sidebar (DAG Panel) */}
      <div
        className={cn(
          "flex flex-col border-l bg-card relative shrink-0 z-50 shadow-2xl",
          !rightSidebarOpen && "w-0 transition-all duration-300"
        )}
        style={rightSidebarOpen ? { width: dagPanelWidth } : undefined}
      >
        {/* Drag Handle */}
        {rightSidebarOpen && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize z-[60] group hover:bg-stone-400/40 active:bg-stone-400/60 transition-colors"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-stone-300 group-hover:bg-stone-500 transition-colors" />
          </div>
        )}
        {/* Toggle Tab */}
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className={cn(
            "absolute bottom-6 -left-10 flex h-10 w-10 items-center justify-center rounded-md border shadow-sm transition-colors z-50",
            rightSidebarOpen
              ? "bg-secondary text-secondary-foreground border-border"
              : "bg-card text-muted-foreground hover:bg-secondary/50 hover:text-foreground border-border"
          )}
          title="View Agent Workflow (DAG)"
        >
          <Network className="h-4 w-4 shrink-0" strokeWidth={rightSidebarOpen ? 2.5 : 2} />
        </button>

        {/* Content */}
        <div className="flex h-full flex-col overflow-hidden bg-background" style={{ width: dagPanelWidth }}>
          <div className="flex h-16 items-center justify-between border-b px-4 shrink-0 bg-stone-50/50">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <DataEnrichment size={16} className="text-[#3d3c3c]" /> Agentic Workflow Pipeline
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Live monitoring of autonomous pipelines
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setRightSidebarOpen(false)}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 w-full relative min-h-0 bg-stone-50/50">
            {rightSidebarOpen && (
              <DAGVisualization
                messageId={`${user?.role ?? "guest"}-${journeyState}-persistent-dag`}
                setWorkflowEventHandler={setWorkflowEventHandler}
                setResetDAGHandler={setResetDAGHandler}
                {...dagProps}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    </PageBreadcrumbProvider>
    </BannerControlsContext.Provider>
  );
}

// ── Explainability Panel ─────────────────────────────────────────────────────

const ACTIVE_EXECUTIONS = [
  {
    id: "exec-1",
    title: "PMAX Budget Optimization",
    status: "running" as const,
    startedAt: "2 min ago",
    steps: [
      { label: "Ingesting cross-channel spend data", status: "done" as const, duration: "1.2s" },
      { label: "Running MMM saturation curve analysis", status: "done" as const, duration: "3.8s" },
      { label: "Computing optimal budget allocation", status: "running" as const, duration: "—" },
      { label: "Validating against guardrails", status: "pending" as const, duration: "—" },
      { label: "Generating recommendation", status: "pending" as const, duration: "—" },
    ],
    reasoning: [
      { factor: "Channel saturation curves", weight: 32, insight: "Google PMAX is operating at 68% saturation — significant headroom remains before diminishing returns." },
      { factor: "Historical ROAS trends", weight: 28, insight: "PMAX ROAS has been stable at 3.2x–3.4x over 6 weeks, indicating consistent performance." },
      { factor: "Audience response rates", weight: 22, insight: "High-intent shopper segment shows 4.1% CTR — 2x above channel average." },
      { factor: "Competitive pressure index", weight: 18, insight: "Competitor CPC bids down 8% this week — window of opportunity for efficient spend." },
    ],
    confidence: 88,
    model: "MMM Attribution v2.4",
  },
  {
    id: "exec-2",
    title: "Churn Risk Scoring",
    status: "done" as const,
    startedAt: "8 min ago",
    steps: [
      { label: "Loading customer purchase history", status: "done" as const, duration: "0.8s" },
      { label: "Computing recency-frequency features", status: "done" as const, duration: "2.1s" },
      { label: "Running churn prediction model", status: "done" as const, duration: "4.5s" },
      { label: "Segmenting at-risk customers", status: "done" as const, duration: "1.3s" },
      { label: "Generating win-back recommendations", status: "done" as const, duration: "0.9s" },
    ],
    reasoning: [
      { factor: "Purchase gap analysis", weight: 38, insight: "512 customers exceed 38-day gap threshold — 2.4x their normal purchase cycle." },
      { factor: "LTV concentration", weight: 30, insight: "At-risk segment represents 42% of total revenue despite being only 4% of customer base." },
      { factor: "Channel affinity scoring", weight: 20, insight: "Email + retargeting combo shows 3.2x higher recovery rate vs. single-channel approach." },
      { factor: "Seasonal adjustment", weight: 12, insight: "Current period historically shows 15% higher churn — intervention timing is optimal." },
    ],
    confidence: 94,
    model: "Churn Prediction v3.1",
  },
];

const CONTROL_TOWER_ALERT_BADGE_STYLES: Record<
  ControlTowerSeverity,
  { className: string; label: string }
> = {
  critical: {
    className: "border-red-200 bg-red-50 text-[#cc1800]",
    label: "Critical",
  },
  high: {
    className: "border-sky-200 bg-sky-50 text-sky-700",
    label: "High Priority",
  },
  medium: {
    className: "border-stone-200 bg-stone-100 text-stone-700",
    label: "Medium",
  },
  info: {
    className: "border-stone-200 bg-stone-50 text-stone-600",
    label: "Info",
  },
};

// ── Notifications Panel — 6-tab channel ─────────────────────────────────────

type ChannelTab = "profile" | "alerts" | "approvals" | "reach" | "demand" | "campaign";

const CHANNEL_TABS: { id: ChannelTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "approvals", label: "Approvals", icon: ClipboardList },
  { id: "reach", label: "Reach", icon: MapPin },
  { id: "demand", label: "Demand", icon: TrendingUp },
  { id: "campaign", label: "Campaign", icon: Megaphone },
];

const PROJECTED_OUTCOMES: Record<string, { label: string; before: string; after: string; note?: string }[]> = {
  "alert-demand-stockout": [
    { label: "Ordering Cut-off Risk", before: "Critical", after: "Resolved" },
    { label: "Revenue at Risk", before: "$847,200", after: "$106,140", note: "87% reduction in revenue exposure" },
    { label: "Inventory Coverage (2-day)", before: "38% Below", after: "12% Above", note: "Coverage restored to target levels" },
    { label: "Cold-Chain Compliance", before: "Moderate Risk", after: "Verified" },
  ],
  "alert-coldchain-risk": [
    { label: "Cold-Chain Status", before: "At Risk", after: "Protected" },
    { label: "Product Waste Risk", before: "$76K exposed", after: "$4K residual", note: "95% waste risk reduction" },
    { label: "Generator Coverage", before: "18h remaining", after: "72h secured" },
  ],
  "alert-lastmile-constraint": [
    { label: "On-Time Delivery", before: "68.2%", after: "82.4%" },
    { label: "Delay Cost", before: "$145K", after: "$38K", note: "74% cost reduction" },
    { label: "Affected Orders", before: "3,400", after: "850", note: "75% recovery via rerouting + pickup" },
  ],
};

const SEVERITY_DOT: Record<ControlTowerSeverity, string> = {
  critical: "bg-[#ff462d]",
  high: "bg-emerald-500",
  medium: "bg-stone-400",
  info: "bg-stone-300",
};

function NotificationsPanel() {
  const { user } = useAuth();
  const effects = useActionEffects();
  const { resolvedAlerts, approvedActions, reachRedirectActive, demandReorderSubmitted, campaignApplied } = effects;
  const [channelTab, setChannelTab] = useState<ChannelTab>("alerts");
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Demo narrator event listener for switching channel tabs
  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const tab = (e as CustomEvent).detail as ChannelTab;
      setChannelTab(tab);
    };
    window.addEventListener("demo:switch-channel", handleSwitch);
    return () => window.removeEventListener("demo:switch-channel", handleSwitch);
  }, []);

  const unresolvedAlertCount = CONTROL_TOWER_ALERTS.length - Object.keys(resolvedAlerts).length;
  const pendingApprovalCount = CONTROL_TOWER_ACTIONS.length - Object.keys(approvedActions).length;

  const tabBadge = (tab: ChannelTab): number | null => {
    if (tab === "alerts" && unresolvedAlertCount > 0) return unresolvedAlertCount;
    if (tab === "approvals" && pendingApprovalCount > 0) return pendingApprovalCount;
    return null;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Tab strip */}
      <div className="flex items-center gap-0.5 border-b bg-stone-50/80 px-2 py-1.5 shrink-0 overflow-x-auto">
        {CHANNEL_TABS.map((tab) => {
          const Icon = tab.icon;
          const badge = tabBadge(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setChannelTab(tab.id)}
              className={cn(
                "relative flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition whitespace-nowrap",
                channelTab === tab.id
                  ? "bg-[#3d3c3c] text-white"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-700",
              )}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
              {badge !== null && (
                <span className="ml-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#ff462d] px-0.5 text-[8px] font-bold text-white">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-stone-50/50">
        {channelTab === "profile" && <ProfileTab user={user} onNavigate={setChannelTab} unresolvedAlerts={unresolvedAlertCount} pendingApprovals={pendingApprovalCount} />}
        {channelTab === "alerts" && (
          <AlertsTab
            resolvedAlerts={resolvedAlerts}
            expandedAlertId={expandedAlertId}
            onToggleExpand={(id) => setExpandedAlertId(expandedAlertId === id ? null : id)}
            onResolve={(id, type) => {
              effects.resolveAlert(id, type);
              toast.success(`Alert resolved — ${type}`, { description: CONTROL_TOWER_ALERTS.find((a) => a.id === id)?.title });
            }}
          />
        )}
        {channelTab === "approvals" && (
          <ApprovalsTab
            approvedActions={approvedActions}
            onAction={(id, type) => {
              effects.approveAction(id, type);
              toast.success(`Action ${type}`, { description: CONTROL_TOWER_ACTIONS.find((a) => a.id === id)?.title });
            }}
          />
        )}
        {channelTab === "reach" && (
          <ReachTab
            redirectActive={reachRedirectActive}
            onApproveRedirect={() => {
              effects.activateReachRedirect();
              toast.success("Redirect activated", { description: "3,400 orders redirected to in-store pickup at 26 open stores" });
            }}
          />
        )}
        {channelTab === "demand" && (
          <DemandTab
            reorderSubmitted={demandReorderSubmitted}
            onTriggerReorder={() => {
              effects.submitDemandReorder();
              toast.success("Emergency reorder submitted", { description: "47 SKUs queued for emergency replenishment" });
            }}
          />
        )}
        {channelTab === "campaign" && (
          <CampaignTab
            applied={campaignApplied}
            onApply={() => {
              effects.applyCampaign();
              toast.success("Channel reallocation applied", { description: "8% shifted from In-Store Signage to Push Notifications" });
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Profile Tab ──────────────────────────────────────────────────────────── */

function ProfileTab({ user, onNavigate, unresolvedAlerts, pendingApprovals }: {
  user: ReturnType<typeof useAuth>["user"];
  onNavigate: (tab: ChannelTab) => void;
  unresolvedAlerts: number;
  pendingApprovals: number;
}) {
  return (
    <div className="space-y-3 px-4 py-4">
      {/* User card */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3d3c3c] text-xs font-bold text-white">
            {(user?.displayName || "U").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3d3c3c]">{user?.displayName || "User"}</p>
            <p className="text-[10px] text-stone-500">{user?.role?.replace(/_/g, " ") || "Operator"} · {user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* AI Situation Summary */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">Your Situation Summary</p>
        </div>
        <ul className="space-y-2">
          <li className="flex gap-2 text-[11px] text-stone-700">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff462d] shrink-0" />
            <span>{unresolvedAlerts} alerts assigned — {CONTROL_TOWER_ALERTS.filter(a => a.severity === "critical").length} critical, {CONTROL_TOWER_ALERTS.filter(a => a.severity === "high").length} high, {CONTROL_TOWER_ALERTS.filter(a => a.severity === "medium").length} medium</span>
          </li>
          <li className="flex gap-2 text-[11px] text-stone-700">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{pendingApprovals} approvals pending — {CONTROL_TOWER_ACTIONS.filter(a => a.severity === "critical").length} due within 2 hours</span>
          </li>
          <li className="flex gap-2 text-[11px] text-stone-700">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff462d] shrink-0" />
            <span>Revenue exposure: $2.4M if no action by 2:00 PM</span>
          </li>
        </ul>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-700">
          <Sparkles className="h-3 w-3" />
          <span>AI Agent has pre-triaged alerts and ranked approvals by urgency</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate("alerts")}
          className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-center text-xs font-semibold text-[#3d3c3c] hover:bg-stone-50 transition"
        >
          View Alerts
        </button>
        <button
          onClick={() => onNavigate("approvals")}
          className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-center text-xs font-semibold text-[#3d3c3c] hover:bg-stone-50 transition"
        >
          View Approvals
        </button>
      </div>
    </div>
  );
}

/* ── Alerts Tab ───────────────────────────────────────────────────────────── */

function AlertsTab({ resolvedAlerts, expandedAlertId, onToggleExpand, onResolve }: {
  resolvedAlerts: Record<string, string>;
  expandedAlertId: string | null;
  onToggleExpand: (id: string) => void;
  onResolve: (id: string, type: "approved" | "conditional" | "rejected") => void;
}) {
  return (
    <div className="space-y-3 px-4 py-4" data-demo="alerts-panel">
      {CONTROL_TOWER_ALERTS.map((alert) => {
        const isResolved = !!resolvedAlerts[alert.id];
        const isExpanded = expandedAlertId === alert.id;
        const severity = CONTROL_TOWER_ALERT_BADGE_STYLES[alert.severity];
        const outcomes = PROJECTED_OUTCOMES[alert.id] || [];

        if (isResolved) {
          return (
            <div key={alert.id} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-800">{alert.title}</p>
                <Badge variant="outline" className="ml-auto text-[9px] border-emerald-300 bg-emerald-100 text-emerald-700">
                  {resolvedAlerts[alert.id]}
                </Badge>
              </div>
              {outcomes.length > 0 && (
                <div className="mt-2 space-y-1">
                  {outcomes.slice(0, 2).map((o) => (
                    <div key={o.label} className="flex items-center gap-2 text-[10px] text-emerald-700">
                      <span className="text-stone-500">{o.label}:</span>
                      <span className="line-through text-stone-400">{o.before}</span>
                      <ChevronRight className="h-2.5 w-2.5 text-stone-400" />
                      <span className="font-semibold">{o.after}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={alert.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            {/* Alert header */}
            <div className={cn("px-4 py-3", alert.severity === "critical" ? "bg-[#ff462d] text-white" : alert.severity === "high" ? "bg-emerald-500 text-white" : "bg-stone-100")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className={cn("mt-1 text-[10px]", alert.severity === "critical" || alert.severity === "high" ? "text-white/80" : "text-stone-500")}>{severity.label}</p>
                </div>
                <Badge variant="outline" className={cn("shrink-0 text-[9px]", alert.severity === "critical" || alert.severity === "high" ? "border-white/30 bg-white/10 text-white" : severity.className)}>
                  {severity.label}
                </Badge>
              </div>
            </div>

            {/* Summary bullets */}
            <div className="px-4 py-3 space-y-3">
              <ul className="space-y-1.5">
                {alert.drilldown.summary.slice(0, 2).map((line) => (
                  <li key={line} className="flex gap-2 text-[11px] text-stone-700">
                    <span className={cn("mt-1 h-1.5 w-1.5 rounded-full shrink-0", SEVERITY_DOT[alert.severity])} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              {/* Incident timeline */}
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">Timeline</p>
                <div className="relative ml-2 border-l border-stone-200 pl-3 space-y-1.5">
                  {alert.drilldown.auditTrail.slice(0, 3).map((entry, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px]">
                      <span className={cn("absolute -left-[3px] mt-1 h-1.5 w-1.5 rounded-full", i === 0 ? SEVERITY_DOT[alert.severity] : "bg-stone-300")} style={{ position: "relative", left: "-15.5px" }} />
                      <div className="-ml-3">
                        <span className="font-semibold text-stone-600">{entry.time}</span>
                        <span className="text-stone-400"> · </span>
                        <span className="text-stone-500">{entry.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolve button */}
              <button
                onClick={() => onToggleExpand(alert.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-xs font-semibold transition",
                  isExpanded ? "bg-stone-100 text-stone-700" : "bg-[#3d3c3c] text-white hover:bg-[#161616]",
                )}
              >
                {isExpanded ? "Collapse" : "Resolve"}
              </button>

              {/* Expanded resolve area */}
              {isExpanded && (
                <div className="space-y-3 pt-1">
                  {/* AI recommendation */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-[10px] font-semibold text-emerald-800">AI Agent Recommendation</span>
                      <Badge variant="outline" className="ml-auto text-[9px] border-emerald-300 bg-emerald-100 text-emerald-700">94% confidence</Badge>
                    </div>
                    <p className="text-[11px] text-stone-700">
                      {alert.severity === "critical"
                        ? "Approve emergency reorder — projected to reduce revenue exposure by 87% and restore inventory coverage above target."
                        : alert.severity === "high"
                          ? "Approve with cold-chain conditions — fuel resupply confirmed, temperature monitoring elevated."
                          : "Approve rerouting plan — recovers 40% of affected deliveries through cleared highways and in-store pickup."}
                    </p>
                  </div>

                  {/* Projected outcomes */}
                  {outcomes.length > 0 && (
                    <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-2">Projected Outcome Improvements</p>
                      <div className="space-y-2">
                        {outcomes.map((o) => (
                          <div key={o.label}>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-stone-600">{o.label}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-stone-400">{o.before}</span>
                                <ChevronRight className="h-2.5 w-2.5 text-stone-400" />
                                <span className="font-bold text-[#3d3c3c]">{o.after}</span>
                              </div>
                            </div>
                            {o.note && <p className="text-[9px] text-stone-400 mt-0.5">{o.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onResolve(alert.id, "approved")}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      Approve Resolution
                    </button>
                    <button
                      onClick={() => onResolve(alert.id, "conditional")}
                      className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                    >
                      Set Conditions
                    </button>
                    <button
                      onClick={() => onResolve(alert.id, "rejected")}
                      className="rounded-lg border border-stone-300 bg-white px-2 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-50 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Approvals Tab ────────────────────────────────────────────────────────── */

function ApprovalsTab({ approvedActions, onAction }: {
  approvedActions: Record<string, "approved" | "rejected">;
  onAction: (id: string, type: "approved" | "rejected") => void;
}) {
  return (
    <div className="space-y-3 px-4 py-4" data-demo="approvals-panel">
      {CONTROL_TOWER_ACTIONS.map((action) => {
        const isDone = !!approvedActions[action.id];
        const severity = CONTROL_TOWER_ALERT_BADGE_STYLES[action.severity];
        const aiConfidence = action.severity === "critical" ? 96 : action.severity === "high" ? 89 : 82;
        const aiReasoning = action.severity === "critical"
          ? "47 SKUs will stock out within 18 hours without this reorder"
          : action.severity === "high"
            ? "Cold-chain integrity degrades within 6 hours without conditional transport"
            : "Rerouting through cleared highways recovers 40% of affected deliveries";

        if (isDone) {
          return (
            <div key={action.id} className={cn(
              "rounded-xl border p-3",
              approvedActions[action.id] === "approved"
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-stone-200 bg-stone-50",
            )}>
              <div className="flex items-center gap-2">
                {approvedActions[action.id] === "approved" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4 text-stone-400" />
                )}
                <p className={cn("text-xs font-semibold", approvedActions[action.id] === "approved" ? "text-emerald-800" : "text-stone-500")}>{action.title}</p>
              </div>
              <Badge variant="outline" className={cn("mt-1 text-[9px]", approvedActions[action.id] === "approved" ? "border-emerald-300 text-emerald-700" : "border-stone-300 text-stone-500")}>
                {approvedActions[action.id]}
              </Badge>
            </div>
          );
        }

        return (
          <div key={action.id} className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="outline" className={cn("text-[9px]", severity.className)}>{severity.label}</Badge>
                  <span className={cn(
                    "flex items-center gap-1 text-[9px] font-semibold",
                    action.severity === "critical" ? "text-[#ff462d]" : "text-emerald-600",
                  )}>
                    {action.severity === "critical" && <span className="h-1.5 w-1.5 rounded-full bg-[#ff462d] animate-pulse" />}
                    {action.dueLabel}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#3d3c3c]">{action.title}</p>
              </div>
            </div>
            <p className="text-[11px] text-stone-600">{action.impact}</p>

            {/* AI confidence */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden max-w-[100px]">
                <div className="h-full bg-[#29707a] rounded-full" style={{ width: `${aiConfidence}%` }} />
              </div>
              <span className="text-[10px] font-semibold text-stone-500">{aiConfidence}% confidence</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 rounded-md px-2 py-1">
              <Sparkles className="h-3 w-3 text-emerald-500" />
              <span>{aiReasoning}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onAction(action.id, "approved")}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                {action.primaryAction.label}
              </button>
              <button
                onClick={() => onAction(action.id, "rejected")}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-50 transition"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Reach Tab ────────────────────────────────────────────────────────────── */

function ReachTab({ redirectActive, onApproveRedirect }: { redirectActive: boolean; onApproveRedirect: () => void }) {
  return (
    <div className="space-y-3 px-4 py-4" data-demo="reach-panel">
      {/* Store Coverage */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">Store Coverage Summary</p>
        <div className="space-y-2">
          {[
            { zone: "Zone A — Closing", count: 8, color: "bg-[#ff462d]", pct: 6 },
            { zone: "Zone B — Reduced Hours", count: 15, color: "bg-emerald-500", pct: 11 },
            { zone: "Zone C — Normal", count: 119, color: "bg-emerald-500", pct: 83 },
          ].map((z) => (
            <div key={z.zone}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-stone-700 font-medium">{z.zone}</span>
                <span className="text-stone-500">{z.count} stores</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", z.color)} style={{ width: `${z.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Route Status */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">Delivery Route Status</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-red-50 p-2">
            <p className="text-lg font-bold text-[#ff462d]">12</p>
            <p className="text-[9px] text-stone-500">Closed</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <p className="text-lg font-bold text-emerald-600">2</p>
            <p className="text-[9px] text-stone-500">Clear</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-2">
            <p className="text-lg font-bold text-emerald-600">4</p>
            <p className="text-[9px] text-stone-500">Restricted</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-stone-600">On-Time Delivery</span>
          <span className="font-bold text-[#ff462d]">68.2% <TrendingUp className="inline h-3 w-3 rotate-180" /></span>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <p className="text-[10px] font-semibold text-emerald-800">AI Agent Recommendation</p>
        </div>
        <p className="text-[11px] text-stone-700 mb-1">Redirect 3,400 orders to in-store pickup at 26 open Zone B stores</p>
        <p className="text-[10px] text-stone-500 mb-3">Estimated 60% customer acceptance rate</p>
        {redirectActive ? (
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Redirect Active
          </div>
        ) : (
          <button
            onClick={onApproveRedirect}
            className="w-full rounded-lg bg-[#3d3c3c] px-3 py-2 text-xs font-semibold text-white hover:bg-[#161616] transition"
          >
            Approve Redirect
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Demand Tab ───────────────────────────────────────────────────────────── */

const DEMAND_SURGE_ITEMS = [
  { category: "Water", velocity: "4.2x", hoursToZero: 8, color: "bg-[#ff462d]" },
  { category: "Batteries", velocity: "3.8x", hoursToZero: 12, color: "bg-[#ff462d]" },
  { category: "First Aid", velocity: "2.6x", hoursToZero: 14, color: "bg-emerald-500" },
  { category: "Ready Meals", velocity: "2.4x", hoursToZero: 18, color: "bg-emerald-500" },
  { category: "Pet Food", velocity: "1.9x", hoursToZero: 22, color: "bg-emerald-400" },
];

function DemandTab({ reorderSubmitted, onTriggerReorder }: { reorderSubmitted: boolean; onTriggerReorder: () => void }) {
  return (
    <div className="space-y-3 px-4 py-4">
      {/* Surge Velocity */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">Demand Surge Velocity</p>
        <div className="space-y-2">
          {DEMAND_SURGE_ITEMS.map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <span className={cn("h-2 w-2 rounded-full shrink-0", item.color)} />
              <span className="text-xs font-medium text-stone-700 flex-1">{item.category}</span>
              <span className="text-xs font-bold text-[#3d3c3c]">{item.velocity}</span>
              <span className="text-[10px] text-stone-400">baseline</span>
              <span className={cn(
                "text-[10px] font-semibold",
                item.hoursToZero <= 12 ? "text-[#ff462d]" : item.hoursToZero <= 18 ? "text-emerald-600" : "text-yellow-600",
              )}>
                {item.hoursToZero}h to zero
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Threshold Alert */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <p className="text-[10px] font-semibold text-emerald-800">AI Agent Threshold Alert</p>
        </div>
        <ul className="space-y-1.5">
          <li className="text-[11px] text-stone-700 flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff462d] shrink-0" />47 SKUs crossed emergency reorder threshold</li>
          <li className="text-[11px] text-stone-700 flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Demand accelerating 8-12% per hour — peak in 4-6 hours</li>
          <li className="text-[11px] text-stone-700 flex gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Fill rate: 78.4% and declining</li>
        </ul>
      </div>

      {/* Reorder Action */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        {reorderSubmitted ? (
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Emergency Reorder Submitted
            <Badge variant="outline" className="ml-auto text-[9px] border-emerald-300 text-emerald-700">47 SKUs queued</Badge>
          </div>
        ) : (
          <button
            onClick={onTriggerReorder}
            className="w-full rounded-lg bg-[#ff462d] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#e63e28] transition"
          >
            Trigger Emergency Reorder
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Campaign Tab ─────────────────────────────────────────────────────────── */

const CAMPAIGN_CHANNELS_DEFAULT = [
  { label: "Push Notifications", pct: 38, spend: "$190K", color: "bg-[#3f7f89]" },
  { label: "App Alerts", pct: 24, spend: "$120K", color: "bg-[#f28c82]" },
  { label: "Email / CRM", pct: 18, spend: "$90K", color: "bg-[#8a9bcf]" },
  { label: "SMS Alerts", pct: 12, spend: "$60K", color: "bg-[#92c6c0]" },
  { label: "In-Store Signage", pct: 8, spend: "$40K", color: "bg-[#d6b37a]" },
];

const CAMPAIGN_CHANNELS_OPTIMIZED = [
  { label: "Push Notifications", pct: 46, spend: "$230K", color: "bg-[#3f7f89]" },
  { label: "App Alerts", pct: 24, spend: "$120K", color: "bg-[#f28c82]" },
  { label: "Email / CRM", pct: 18, spend: "$90K", color: "bg-[#8a9bcf]" },
  { label: "SMS Alerts", pct: 12, spend: "$60K", color: "bg-[#92c6c0]" },
  { label: "In-Store Signage", pct: 0, spend: "$0", color: "bg-[#d6b37a]" },
];

function CampaignTab({ applied, onApply }: { applied: boolean; onApply: () => void }) {
  const channels = applied ? CAMPAIGN_CHANNELS_OPTIMIZED : CAMPAIGN_CHANNELS_DEFAULT;
  return (
    <div className="space-y-3 px-4 py-4" data-demo="campaign-panel">
      {/* Channel Mix */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-3">Active Storm Communications</p>
        <div className="space-y-2">
          {channels.map((ch) => (
            <div key={ch.label}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-stone-700 font-medium">{ch.label}</span>
                <span className="text-stone-500">{ch.pct}% · {ch.spend}</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", ch.color)} style={{ width: `${ch.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-500">
          482 stores · 2.1M customers in notification radius
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <p className="text-[10px] font-semibold text-emerald-800">AI Agent Recommendation</p>
        </div>
        <p className="text-[11px] text-stone-700 mb-1">Shift 8% from In-Store Signage to Push Notifications</p>
        <p className="text-[10px] text-stone-500 mb-1">Reason: 8 stores closing — signage reach drops to zero in storm zone</p>
        <p className="text-[10px] text-stone-500 mb-3">Projected impact: +12% message reach in storm zone</p>
        {applied ? (
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Recommendation Applied
          </div>
        ) : (
          <button
            onClick={onApply}
            className="w-full rounded-lg bg-[#3d3c3c] px-3 py-2 text-xs font-semibold text-white hover:bg-[#161616] transition"
          >
            Apply Recommendation
          </button>
        )}
      </div>
    </div>
  );
}

function ExplainabilityPanel() {
  const [expandedExec, setExpandedExec] = useState<string | null>(ACTIVE_EXECUTIONS[0].id);
  const [expandedMsgId, setExpandedMsgId] = useState<string | null>(null);
  const { messages, currentPhase, currentStep, completedSteps } = useChatMessages();

  // Gather assistant messages that have toolCalls or activityCard (most recent first)
  const messagesWithSteps = useMemo(() => {
    return [...messages]
      .filter((m) => m.role === "assistant" && (m.toolCalls?.length || m.activityCard))
      .reverse();
  }, [messages]);

  const isAgentWorking = currentPhase !== "idle" && currentPhase !== "complete";
  const activeProcessCount = ACTIVE_EXECUTIONS.filter((e) => e.status === "running").length + (isAgentWorking ? 1 : 0);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-stone-50/80 shrink-0">
        <div className="flex items-center gap-2">
          <AiGovernanceLifecycle size={18} className="text-[#3d3c3c]" />
          <div>
            <h2 className="text-sm font-semibold text-[#3d3c3c]">Agent Explainability</h2>
            <p className="text-[10px] text-muted-foreground">Live execution reasoning and decision trace</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Live agent progress */}
        {isAgentWorking && (
          <div className="border-b">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-emerald-100">
                  <Loader2 className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#3d3c3c]">Agent Processing</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {currentPhase === "thinking" ? "Thinking" :
                       currentPhase === "tool_call" ? "Running Tool" :
                       currentPhase === "streaming" ? "Streaming" :
                       currentPhase === "awaiting_approval" ? "Awaiting Approval" : "Active"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1 ml-1">
                <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Live Pipeline</p>
                {completedSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span className="text-stone-700">{step}</span>
                  </div>
                ))}
                {currentStep && currentPhase === "tool_call" && (
                  <div className="flex items-center gap-2 text-xs py-0.5">
                    <Loader2 className="h-3 w-3 text-emerald-500 animate-spin shrink-0" />
                    <span className="text-stone-700 font-medium">{currentStep}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Historical chat agent steps */}
        {messagesWithSteps.length > 0 && (
          <div className="border-b">
            <div className="px-4 py-2">
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Chat Agent History</p>
            </div>
            {messagesWithSteps.map((msg) => {
              const isExpanded = expandedMsgId === msg.id;
              const stepCount = (msg.toolCalls?.length ?? 0) + (msg.activityCard?.items.length ?? 0);
              const preview = msg.content.slice(0, 60) + (msg.content.length > 60 ? "..." : "");
              return (
                <div key={msg.id} className="border-t border-stone-100">
                  <button
                    onClick={() => setExpandedMsgId(isExpanded ? null : msg.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors text-left"
                  >
                    <div className="h-6 w-6 rounded-md flex items-center justify-center shrink-0 bg-emerald-100">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] text-stone-700 truncate block">{preview}</span>
                      <span className="text-[10px] text-muted-foreground">{stepCount} step{stepCount !== 1 ? "s" : ""}</span>
                    </div>
                    <ChevronRight className={cn(
                      "h-3.5 w-3.5 text-stone-400 transition-transform shrink-0",
                      isExpanded && "rotate-90"
                    )} />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2">
                      {msg.activityCard && (
                        <ActivityCardView card={msg.activityCard} />
                      )}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="space-y-1.5">
                          {msg.toolCalls.map((tc) => (
                            <ToolCallCard key={tc.id} toolCall={tc} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Static executions */}
        {ACTIVE_EXECUTIONS.map((exec) => {
          const isExpanded = expandedExec === exec.id;
          const doneSteps = exec.steps.filter((s) => s.status === "done").length;
          const totalSteps = exec.steps.length;
          const progressPct = Math.round((doneSteps / totalSteps) * 100);

          return (
            <div key={exec.id} className="border-b">
              {/* Execution header */}
              <button
                onClick={() => setExpandedExec(isExpanded ? null : exec.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
              >
                <div className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                  exec.status === "running" ? "bg-emerald-100" : "bg-emerald-100"
                )}>
                  {exec.status === "running" ? (
                    <Loader2 className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#3d3c3c] truncate">{exec.title}</span>
                    <span className={cn(
                      "text-[9px] font-semibold px-1.5 py-0.5 rounded-full",
                      exec.status === "running"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}>
                      {exec.status === "running" ? "Running" : "Complete"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          exec.status === "running" ? "bg-emerald-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{doneSteps}/{totalSteps} steps</span>
                    <span className="text-[10px] text-muted-foreground">| {exec.startedAt}</span>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 text-stone-400 transition-transform shrink-0",
                  isExpanded && "rotate-90"
                )} />
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Execution steps */}
                  <div className="space-y-1 ml-1">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2">Execution Pipeline</p>
                    {exec.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs py-1">
                        <div className="shrink-0">
                          {step.status === "done" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                          {step.status === "running" && <Loader2 className="h-3 w-3 text-emerald-500 animate-spin" />}
                          {step.status === "pending" && <div className="h-3 w-3 rounded-full border border-stone-300" />}
                        </div>
                        <span className={cn(
                          "flex-1",
                          step.status === "pending" ? "text-stone-400" : "text-stone-700"
                        )}>
                          {step.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{step.duration}</span>
                      </div>
                    ))}
                  </div>

                  {/* Model info */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-lg">
                    <div className="relative h-10 w-10 shrink-0">
                      <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke={exec.confidence >= 90 ? "#00af41" : "#3d3c3c"}
                          strokeWidth="3"
                          strokeDasharray={`${exec.confidence} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {exec.confidence}%
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#3d3c3c]">Model Confidence</p>
                      <p className="text-[10px] text-muted-foreground">{exec.model}</p>
                    </div>
                  </div>

                  {/* Reasoning factors */}
                  <div className="space-y-2 ml-1">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Decision Factors</p>
                    {exec.reasoning.map((r, i) => (
                      <div key={i} className="rounded-lg border border-stone-100 p-2.5 bg-white">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-[#3d3c3c]">{r.factor}</span>
                          <span className="text-[10px] font-semibold text-stone-500">{r.weight}% weight</span>
                        </div>
                        <div className="h-1 bg-stone-100 rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-[#29707a] rounded-full" style={{ width: `${r.weight}%` }} />
                        </div>
                        <p className="text-[10px] text-stone-500 leading-snug">{r.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t bg-stone-50/80 shrink-0">
        <Activity className="h-3 w-3 text-emerald-500" />
        <span className="text-[10px] text-stone-600 font-medium">
          {activeProcessCount} active agent process{activeProcessCount !== 1 ? "es" : ""} | Last updated: just now
        </span>
      </div>
    </>
  );
}

function RecommendationsTabPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-stone-50/80 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <div>
            <h2 className="text-sm font-semibold text-[#3d3c3c]">AI Recommendations</h2>
            <p className="text-[10px] text-muted-foreground">Actionable insights from your data</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AIRecommendationsPanel />
      </div>
    </div>
  );
}

function UtilityPanel({
  activeTab,
  onTabChange,
  onClose,
}: {
  activeTab: "notifications" | "explainability" | "recommendations";
  onTabChange: (tab: "notifications" | "explainability" | "recommendations") => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b bg-white px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTabChange("notifications")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              activeTab === "notifications"
                ? "bg-red-50 text-[#cc1800]"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800",
            )}
          >
            Notifications
          </button>
          <button
            type="button"
            onClick={() => onTabChange("explainability")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              activeTab === "explainability"
                ? "bg-[#3d3c3c] text-white"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800",
            )}
          >
            Explainability
          </button>
          <button
            type="button"
            onClick={() => onTabChange("recommendations")}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              activeTab === "recommendations"
                ? "bg-emerald-100 text-emerald-800"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-800",
            )}
          >
            AI Recs
          </button>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>
      {activeTab === "notifications" ? (
        <NotificationsPanel />
      ) : activeTab === "explainability" ? (
        <ExplainabilityPanel />
      ) : (
        <RecommendationsTabPanel />
      )}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DemoNarratorProvider>
      <AppShellContent>{children}</AppShellContent>
    </DemoNarratorProvider>
  );
}
