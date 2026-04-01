import { UserRole } from "../auth-context";

/**
 * Permission Capabilities
 * Define all possible actions in the CDP system
 */
export type Permission =
  // Identity & Data Management
  | "identity_resolution"
  | "identity_merge"
  | "data_quality_view"
  | "data_quality_manage"
  | "duplicate_detection"
  
  // Consent & Privacy
  | "consent_management"
  | "consent_view"
  | "privacy_policy_manage"
  
  // Customer Context
  | "customer_view"
  | "customer_search"
  | "context_summary_view"
  | "customer_timeline_view"
  
  // Marketing & Campaigns
  | "campaign_create"
  | "campaign_view"
  | "campaign_execute"
  | "audience_segment"
  | "nba_view"
  | "nba_approve"
  | "ai_action_execute"        // Execute AI-generated recommended actions
  | "action_approve_review"    // Approve actions sent for review by other users
  
  // Service & Cases
  | "case_create"
  | "case_view"
  | "case_manage"
  | "case_assign"
  | "action_execute"
  | "casework_draft"
  
  // Audit & Monitoring
  | "audit_view"
  | "audit_export"
  | "workflow_monitor"
  | "agent_monitor"
  
  // System Admin
  | "user_manage"
  | "system_config"

  // Vendor Risk module
  | "risk_view"
  | "risk_manage"

  // Demand Planning module
  | "demand_view"
  | "demand_manage"

  // Control Tower
  | "control_tower_view";

const ALL_PERMISSIONS: Permission[] = [
  "identity_resolution",
  "identity_merge",
  "data_quality_view",
  "data_quality_manage",
  "duplicate_detection",
  "consent_management",
  "consent_view",
  "privacy_policy_manage",
  "customer_view",
  "customer_search",
  "context_summary_view",
  "customer_timeline_view",
  "campaign_create",
  "campaign_view",
  "campaign_execute",
  "audience_segment",
  "nba_view",
  "nba_approve",
  "ai_action_execute",
  "action_approve_review",
  "case_create",
  "case_view",
  "case_manage",
  "case_assign",
  "action_execute",
  "casework_draft",
  "audit_view",
  "audit_export",
  "workflow_monitor",
  "agent_monitor",
  "user_manage",
  "system_config",
  "risk_view",
  "risk_manage",
  "demand_view",
  "demand_manage",
  "control_tower_view",
];

// ALL_PERMISSIONS already includes risk/demand/control_tower permissions
const ALL_PLATFORM_PERMISSIONS: Permission[] = ALL_PERMISSIONS;

/**
 * Role Definitions
 * Maps each role to their allowed permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  data_admin: [
    // Identity & Data
    "identity_resolution",
    "identity_merge",
    "data_quality_view",
    "data_quality_manage",
    "duplicate_detection",
    
    // Consent (full management)
    "consent_management",
    "consent_view",
    "privacy_policy_manage",
    
    // Customer (read-only)
    "customer_view",
    "customer_search",
    "context_summary_view",
    "customer_timeline_view",
    
    // Audit (full access)
    "audit_view",
    "audit_export",
    "workflow_monitor",
    "agent_monitor",
  ],
  
  marketing_admin: [
    // Campaign Management
    "campaign_create",
    "campaign_view",
    "campaign_execute",
    "audience_segment",
    
    // Next Best Action
    "nba_view",
    "nba_approve",
    
    // AI Actions
    "ai_action_execute",      // Can execute AI-generated recommended actions
    "action_approve_review",  // Can approve actions sent for review
    
    // Customer (read-only)
    "customer_view",
    "customer_search",
    "context_summary_view",
    "customer_timeline_view",
    
    // Consent (view-only)
    "consent_view",
    
    // Audit (limited)
    "audit_view",
    "workflow_monitor",
  ],
  
  service_agent: [
    // Customer Service
    "customer_view",
    "customer_search",
    "context_summary_view",
    "customer_timeline_view",

    // Case Management
    "case_create",
    "case_view",
    "case_manage",
    "case_assign",

    // Actions
    "action_execute",
    "casework_draft",

    // Next Best Action (view recommendations)
    "nba_view",

    // Consent (view-only)
    "consent_view",

    // Audit (own actions only)
    "audit_view",
  ],

  risk_admin: ALL_PLATFORM_PERMISSIONS,

  platform_admin: ALL_PLATFORM_PERMISSIONS,
};

/**
 * Navigation Items per Role
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
}

export interface UserPermissionContext {
  role: UserRole;
  deniedPermissions?: string[];
}

export const ROLE_NAVIGATION: Record<UserRole, NavItem[]> = {
  super_admin: [
    // Control Tower
    { label: "Dashboard", href: "/dashboard", description: "Unified Control Tower" },
    { label: "Chat", href: "/chat", description: "Unified AI Workspace" },

    // UDP (data foundation)
    { label: "Customer Data", href: "/udp/dashboard", description: "Customer Data Platform" },
    { label: "Customers", href: "/customers", description: "Customer Profiles" },

    // Data & Insights
    { label: "Analytics", href: "/analytics", description: "Performance Analytics" },
    { label: "Experiments", href: "/udp/incrementality", description: "All experiments across demand + commercial" },

    // Commercial
    { label: "Campaigns", href: "/campaigns", description: "Campaign Management" },
    { label: "Audiences", href: "/audiences", description: "Segment & Target" },
    { label: "Mix Modeling", href: "/mmm", description: "Marketing Mix Modeling" },
    { label: "Reports", href: "/reports", description: "Performance Reports" },

    // Demand
    { label: "Overview", href: "/demand/dashboard", description: "Demand Planning" },
    { label: "Campaigns", href: "/demand/campaigns", description: "Demand Activation" },
    { label: "Audiences", href: "/demand/audiences", description: "Demand Segments" },
    { label: "Customers", href: "/demand/customers", description: "Demand Customer View" },
    { label: "Analytics", href: "/demand/analytics", description: "Demand Performance" },
    { label: "Drivers", href: "/demand/mmm", description: "Demand Analysis" },
    { label: "Reports", href: "/demand/reports", description: "Demand Reporting" },
  ],
  data_admin: [
    // Control Tower
    { label: "Dashboard", href: "/dashboard", description: "Unified Control Tower" },

    // UDP (data foundation)
    { label: "Customer Data", href: "/udp/dashboard", description: "Customer Data Platform" },
    { label: "Customers", href: "/customers", description: "Customer Profiles" },

    // Data & Insights
    { label: "Analytics", href: "/analytics", description: "Performance Analytics" },
    { label: "Experiments", href: "/udp/incrementality", description: "All experiments across demand + commercial" },
    { label: "Reports", href: "/reports", description: "Performance Reports" },
  ],

  marketing_admin: [
    // Control Tower
    { label: "Dashboard", href: "/dashboard", description: "Unified Control Tower" },
    { label: "Chat", href: "/chat", description: "AI Marketing Assistant" },

    // UDP (data foundation)
    { label: "Customer Data", href: "/udp/dashboard", description: "Customer Data Platform" },
    { label: "Customers", href: "/customers", description: "Customer Profiles" },

    // Data & Insights
    { label: "Analytics", href: "/analytics", description: "Performance Analytics" },
    { label: "Experiments", href: "/udp/incrementality", description: "All experiments across demand + commercial" },

    // Commercial
    { label: "Campaigns", href: "/campaigns", description: "Campaign Management" },
    { label: "Audiences", href: "/audiences", description: "Segment & Target" },
    { label: "Mix Modeling", href: "/mmm", description: "Marketing Mix Modeling" },
    { label: "Reports", href: "/reports", description: "Performance Reports" },
  ],

  service_agent: [
    // Control Tower
    { label: "Dashboard", href: "/dashboard", description: "Unified Control Tower" },
    { label: "Chat", href: "/chat", description: "Operator Workspace" },

    // UDP (data foundation)
    { label: "Customer Data", href: "/udp/dashboard", description: "Customer Data Platform" },
    { label: "Customers", href: "/customers", description: "Find Customers" },

    // Commercial
    { label: "Reports", href: "/reports", description: "Performance Reports" },
  ],

  risk_admin: [
    // Control Tower
    { label: "Dashboard", href: "/dashboard", description: "Unified Control Tower" },
    { label: "Chat", href: "/chat", description: "Unified AI Workspace" },

    // UDP (data foundation)
    { label: "Customer Data", href: "/udp/dashboard", description: "Customer Data Platform" },
    { label: "Customers", href: "/customers", description: "Customer Profiles" },

    // Data & Insights
    { label: "Analytics", href: "/analytics", description: "Performance Analytics" },
    { label: "Experiments", href: "/udp/incrementality", description: "All experiments across demand + commercial" },

    // Commercial
    { label: "Campaigns", href: "/campaigns", description: "Campaign Management" },
    { label: "Audiences", href: "/audiences", description: "Segment & Target" },
    { label: "Mix Modeling", href: "/mmm", description: "Marketing Mix Modeling" },
    { label: "Reports", href: "/reports", description: "Performance Reports" },

    // Demand
    { label: "Overview", href: "/demand/dashboard", description: "Demand Planning" },
    { label: "Campaigns", href: "/demand/campaigns", description: "Demand Activation" },
    { label: "Audiences", href: "/demand/audiences", description: "Demand Segments" },
    { label: "Customers", href: "/demand/customers", description: "Demand Customer View" },
    { label: "Analytics", href: "/demand/analytics", description: "Demand Performance" },
    { label: "Drivers", href: "/demand/mmm", description: "Demand Analysis" },
    { label: "Reports", href: "/demand/reports", description: "Demand Reporting" },
  ],

  platform_admin: [
    // Control Tower
    { label: "Dashboard", href: "/dashboard", description: "Unified Control Tower" },
    { label: "Chat", href: "/chat", description: "Unified AI Workspace" },

    // UDP (data foundation)
    { label: "Customer Data", href: "/udp/dashboard", description: "Customer Data Platform" },
    { label: "Customers", href: "/customers", description: "Customer Profiles" },

    // Data & Insights
    { label: "Analytics", href: "/analytics", description: "Performance Analytics" },
    { label: "Experiments", href: "/udp/incrementality", description: "All experiments across demand + commercial" },

    // Commercial
    { label: "Campaigns", href: "/campaigns", description: "Campaign Management" },
    { label: "Audiences", href: "/audiences", description: "Segment & Target" },
    { label: "Mix Modeling", href: "/mmm", description: "Marketing Mix Modeling" },
    { label: "Reports", href: "/reports", description: "Performance Reports" },

    // Demand
    { label: "Overview", href: "/demand/dashboard", description: "Demand Planning" },
    { label: "Campaigns", href: "/demand/campaigns", description: "Demand Activation" },
    { label: "Audiences", href: "/demand/audiences", description: "Demand Segments" },
    { label: "Customers", href: "/demand/customers", description: "Demand Customer View" },
    { label: "Analytics", href: "/demand/analytics", description: "Demand Performance" },
    { label: "Drivers", href: "/demand/mmm", description: "Demand Analysis" },
    { label: "Reports", href: "/demand/reports", description: "Demand Reporting" },
  ],
};

/**
 * Helper function to check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

/**
 * Helper function to check if a specific user has a permission,
 * allowing per-user denied permissions to override role defaults.
 */
export function hasPermissionForUser(
  user: UserPermissionContext,
  permission: Permission
): boolean {
  if (!hasPermission(user.role, permission)) {
    return false;
  }
  if (user.deniedPermissions?.includes(permission)) {
    return false;
  }
  return true;
}

/**
 * Helper function to get all permissions for a role
 */
export function getPermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] ?? [];
}

/**
 * Helper function to get navigation items for a role
 */
export function getNavigation(userRole: UserRole): NavItem[] {
  return ROLE_NAVIGATION[userRole] ?? [];
}
