"use client";

import { Fragment, useState, useMemo, useCallback, useRef, useEffect } from "react";
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
  AlertTriangle, Zap, FlaskConical, Database,
} from "lucide-react";
import { AiGovernanceLifecycle, DataEnrichment } from "@carbon/icons-react";
import {
  CONTROL_TOWER_ALERTS,
  CONTROL_TOWER_SUMMARY,
  type ControlTowerAlert,
  type ControlTowerSeverity,
} from "@/lib/control-tower-data";
import { buildKnowledgeGraphHref } from "@/lib/knowledge-graph-data";
import { useArtifacts, type ArtifactCategory } from "@/lib/artifact-store";
import { cn } from "@/lib/utils";
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
  "/demand/nba": Zap,
  "/demand/campaigns": Megaphone,
  "/demand/audiences": Users,
  "/demand/customers": UserSearch,
  "/demand/reports": FileText,
};

const HREF_TO_GROUP: Record<string, string> = {
  "/dashboard": "platform",
  "/dashboard/graph": "platform",
  "/dashboard/graphs": "platform",
  "/control-tower": "platform",
  "/chat": "platform",
  "/udp/dashboard": "data",
  "/udp/incrementality": "commercial",
  "/customers": "data",
  "/analytics": "data",
  "/analytics/pending-review": "data",
  "/analytics/confirmed-actions": "data",
  "/campaigns": "commercial",
  "/audiences": "commercial",
  "/mmm": "commercial",
  "/reports": "commercial",
  "/demand/dashboard": "demand",
  "/demand/mmm": "demand",
  "/demand/incrementality": "demand",
  "/demand/nba": "demand",
  "/demand/campaigns": "demand",
  "/demand/audiences": "demand",
  "/demand/customers": "demand",
  "/demand/reports": "demand",
  "/demand/analytics": "demand",
};

const GROUP_ORDER = ["platform", "data", "commercial", "demand"] as const;
type NavGroupId = (typeof GROUP_ORDER)[number];

const GROUP_META: Record<NavGroupId, { label: string; icon: React.ElementType }> = {
  platform: { label: "UDP Control Tower", icon: Monitor },
  data: { label: "Data Foundation", icon: Database },
  commercial: { label: "Commercial", icon: Megaphone },
  demand: { label: "Demand Signal", icon: BarChart3 },
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
  "/dashboard": { label: "UDP Control Tower", module: "Control Tower" },
  "/chat": { label: "UDP Control Tower", module: "Conversational AI" },
  "/udp": { label: "Unified Data Platform", module: "Customer Profiles" },
  "/campaigns": { label: "Campaign Management", module: "Campaigns" },
  "/demand": { label: "Demand Signal Engine", module: "Demand Planning" },
  "/analytics": { label: "UDP Control Tower", module: "Analytics" },
};

function resolveDataSource(pathname: string) {
  const exact = DATA_SOURCE_MAP[pathname];
  if (exact) return exact;
  for (const [prefix, source] of Object.entries(DATA_SOURCE_MAP)) {
    if (pathname.startsWith(prefix + "/")) return source;
  }
  return { label: "Unified Data Platform", module: "Platform" };
}

function ConnectionStatusBar({ pathname }: { pathname: string }) {
  const source = resolveDataSource(pathname);
  return (
    <div className="flex items-center gap-2 border-b bg-stone-50/60 px-6 py-1.5 text-xs text-muted-foreground shrink-0">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span className="font-medium text-stone-600">Connected</span>
      <span className="text-stone-300">—</span>
      <span className="text-stone-500">{source.label}</span>
      <span className="text-stone-300">·</span>
      <span className="text-stone-400">{source.module}</span>
    </div>
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
  const [activeUtilityTab, setActiveUtilityTab] = useState<"notifications" | "explainability">("explainability");
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

  const openUtilityPanel = useCallback((tab: "notifications" | "explainability") => {
    setActiveUtilityTab(tab);
    setUtilityPanelOpen(true);
  }, []);

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

    // Inject permission-gated items into "data" group if not already present
    if (hasPermissionForUser(user, "action_approve_review")) {
      if (!groups.data) groups.data = [];
      if (!groups.data.some((i) => i.href === "/analytics/pending-review")) {
        groups.data.push({ label: "Pending Review", href: "/analytics/pending-review" });
      }
      if (!groups.data.some((i) => i.href === "/analytics/confirmed-actions")) {
        groups.data.push({ label: "Confirmed Actions", href: "/analytics/confirmed-actions" });
      }
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
        <div className="p-2 flex flex-col gap-1">
          <Button
            className="w-full justify-start gap-3 rounded-md px-3 py-2 h-auto font-medium bg-red-50 text-[#cc1800] hover:bg-red-100 hover:text-[#cc1800] border border-red-200 shadow-none"
            variant="outline"
            onClick={() => openUtilityPanel("notifications")}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="flex-1 text-left">Notifications</span>
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff462d] px-1 text-[10px] font-bold text-white">
              {CONTROL_TOWER_ALERTS.length}
            </span>
          </Button>

          {hasPermissionForUser(user, "nba_view") && (
            <Button
              className="w-full justify-start gap-3 rounded-md px-3 py-2 h-auto font-medium mb-4 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-none shadow-none"
              variant="outline"
              onClick={() => openUtilityPanel("explainability")}
            >
              <AiGovernanceLifecycle size={16} />
              <span>Explainability</span>
            </Button>
          )}

          <div className="pt-2 border-t flex flex-col gap-1">
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
                  <div className="rounded-lg bg-[#3d3c3c] p-1.5">
                    <Monitor className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      UDP Control Tower
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
                    ? "Pending Review"
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
                            : "text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5"
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
          <BreadcrumbBar pathname={pathname} searchParams={searchParams} />
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
    className: "border-amber-200 bg-amber-50 text-amber-700",
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

function NotificationsPanel() {
  const [activeAlertId, setActiveAlertId] = useState(CONTROL_TOWER_ALERTS[0]?.id ?? "");

  const activeAlert =
    CONTROL_TOWER_ALERTS.find((alert) => alert.id === activeAlertId) ??
    CONTROL_TOWER_ALERTS[0] ??
    null;
  const secondaryAlerts = CONTROL_TOWER_ALERTS.filter(
    (alert) => alert.id !== activeAlert?.id,
  );

  if (!activeAlert) {
    return null;
  }

  const activeSeverity = CONTROL_TOWER_ALERT_BADGE_STYLES[activeAlert.severity];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-stone-50/80 shrink-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#ff462d]" />
          <div>
            <h2 className="text-sm font-semibold text-[#3d3c3c]">Notifications</h2>
            <p className="text-[10px] text-muted-foreground">
              Business alerts and decision support
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px]">
          {CONTROL_TOWER_ALERTS.length} active
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 bg-stone-50/50 px-4 py-4">
        <div className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-[0_6px_24px_rgba(255,70,45,0.08)]">
          <div className="border-b border-red-200 bg-[#ff462d] px-4 py-3 text-white">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{activeAlert.title}</p>
                <p className="mt-1 text-[10px] text-white/80">{activeSeverity.label}</p>
              </div>
              <Badge
                variant="outline"
                className="border-white/30 bg-white/10 text-[9px] text-white"
              >
                {activeSeverity.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 px-4 py-4">
            <div className="rounded-xl border border-red-100 bg-red-50/70 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#cc1800]">
                Overview
              </p>
              <ul className="mt-2 space-y-2">
                {activeAlert.drilldown.summary.slice(0, 3).map((line) => (
                  <li key={line} className="flex gap-2 text-[11px] text-stone-700">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff6b57]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Requiring attention
              </p>
              {activeAlert.drilldown.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#3d3c3c]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-stone-500">{item.subtitle}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 text-[9px]", activeSeverity.className)}
                  >
                    {activeSeverity.label}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-[11px] text-stone-500">
              {CONTROL_TOWER_SUMMARY.dataFreshness} · {activeAlert.timestamp}
            </div>

            <Button
              asChild
              className="w-full rounded-full bg-[#3d3c3c] text-white hover:bg-[#161616]"
            >
              <Link href="/dashboard">Resolve</Link>
            </Button>
            {activeAlert.experimentHref ? (
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full border-[#8ecfd9] bg-[#29707a]/[0.25] text-[#29707a] hover:bg-[#29707a]/[0.15] hover:text-[#163d43]"
              >
                <Link href={activeAlert.experimentHref}>Open experiment</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Other business alerts
            </p>
            <Badge variant="outline" className="text-[9px]">
              {CONTROL_TOWER_ALERTS.length} active
            </Badge>
          </div>
          <div className="mt-3 space-y-2">
            {secondaryAlerts.map((alert) => {
              const severity = CONTROL_TOWER_ALERT_BADGE_STYLES[alert.severity];
              return (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => setActiveAlertId(alert.id)}
                  className="flex w-full items-start justify-between gap-3 rounded-xl border border-stone-200 px-3 py-2 text-left transition hover:border-stone-300 hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#3d3c3c]">
                      {alert.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-stone-500">
                      {alert.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 text-[9px]", severity.className)}
                  >
                    {severity.label}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              Experiment shortcuts
            </p>
            <Badge variant="outline" className="text-[9px]">
              Shared workspace
            </Badge>
          </div>
          <div className="mt-3 space-y-2">
            <Link
              href={buildIncrementalityHref({ entry: "udp", create: true })}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs text-stone-700 transition hover:border-stone-300 hover:bg-stone-100"
            >
              <span>Launch shared experiment</span>
              <FlaskConical className="h-3.5 w-3.5 text-[#29707a]" />
            </Link>
            <Link
              href={buildIncrementalityHref({
                entry: "udp",
                lens: "udp",
                application: "identity",
              })}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs text-stone-700 transition hover:border-stone-300 hover:bg-stone-100"
            >
              <span>Identity resolution tests</span>
              <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
            </Link>
            <Link
              href={buildIncrementalityHref({
                entry: "udp",
                lens: "udp",
                application: "campaigns",
              })}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs text-stone-700 transition hover:border-stone-300 hover:bg-stone-100"
            >
              <span>Campaign lift experiments</span>
              <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplainabilityPanel() {
  const [expandedExec, setExpandedExec] = useState<string | null>(ACTIVE_EXECUTIONS[0].id);

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

      {/* Execution list */}
      <div className="flex-1 overflow-y-auto">
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
                  exec.status === "running" ? "bg-amber-100" : "bg-emerald-100"
                )}>
                  {exec.status === "running" ? (
                    <Loader2 className="h-3.5 w-3.5 text-amber-600 animate-spin" />
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
                        ? "bg-amber-100 text-amber-700"
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
                          exec.status === "running" ? "bg-amber-500" : "bg-emerald-500"
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
                          {step.status === "running" && <Loader2 className="h-3 w-3 text-amber-500 animate-spin" />}
                          {step.status === "pending" && <div className="h-3 w-3 rounded-full border border-slate-300" />}
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
        <Activity className="h-3 w-3 text-amber-500" />
        <span className="text-[10px] text-stone-600 font-medium">
          2 active agent processes | Last updated: just now
        </span>
      </div>
    </>
  );
}

function UtilityPanel({
  activeTab,
  onTabChange,
  onClose,
}: {
  activeTab: "notifications" | "explainability";
  onTabChange: (tab: "notifications" | "explainability") => void;
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
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>
      {activeTab === "notifications" ? (
        <NotificationsPanel />
      ) : (
        <ExplainabilityPanel />
      )}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <AppShellContent>{children}</AppShellContent>;
}
