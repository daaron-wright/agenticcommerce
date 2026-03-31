import {
  ChatPersona,
  PermissionTier,
  UserRole,
  isChatPersona,
  isPermissionTier,
  isUserRole,
} from "./auth-context";

export interface StoredUser {
  username: string;
  password: string;
  role: UserRole;
  displayName?: string;
  email?: string;
  deniedPermissions?: string[];
  defaultChatPersona?: ChatPersona;
  permissionTier?: PermissionTier;
  createdAt: string;
}

function getDefaultPersonaForRole(role: UserRole): ChatPersona {
  if (role === "marketing_admin") return "marketer";
  if (role === "service_agent") return "merchandiser";
  return "general_user";
}

function getDeniedPermissionsForTier(tier: PermissionTier): string[] | undefined {
  if (tier === "full_admin") {
    return undefined;
  }
  return ["ai_action_execute", "action_approve_review", "campaign_execute", "action_execute"];
}

function buildDefaultUsers(): StoredUser[] {
  return [
    {
      username: "superadmin",
      password: "password",
      role: "super_admin",
      displayName: "Jordan Cross",
      email: "superadmin@cdp.local",
      defaultChatPersona: "general_user",
      permissionTier: "full_admin",
      createdAt: new Date().toISOString(),
    },
    {
      username: "admin",
      password: "password",
      role: "data_admin",
      displayName: "Avery Parker",
      email: "admin@cdp.local",
      defaultChatPersona: "general_user",
      permissionTier: "full_admin",
      createdAt: new Date().toISOString(),
    },
    {
      username: "mara_marketing",
      password: "password",
      role: "marketing_admin",
      displayName: "Mara Sullivan",
      email: "marketing@cdp.local",
      defaultChatPersona: "marketer",
      permissionTier: "full_admin",
      createdAt: new Date().toISOString(),
    },
    {
      username: "logan_review",
      password: "password",
      role: "marketing_admin",
      displayName: "Logan Pierce",
      email: "logan.review@cdp.local",
      deniedPermissions: ["ai_action_execute", "action_approve_review"],
      defaultChatPersona: "marketer",
      permissionTier: "send_for_review",
      createdAt: new Date().toISOString(),
    },
    {
      username: "agent",
      password: "password",
      role: "service_agent",
      displayName: "Riley Chen",
      email: "service@cdp.local",
      defaultChatPersona: "merchandiser",
      permissionTier: "send_for_review",
      deniedPermissions: getDeniedPermissionsForTier("send_for_review"),
      createdAt: new Date().toISOString(),
    },
    {
      username: "maya_marketer_admin",
      password: "password",
      role: "marketing_admin",
      displayName: "Maya Hart",
      email: "maya.marketer@cdp.local",
      defaultChatPersona: "marketer",
      permissionTier: "full_admin",
      createdAt: new Date().toISOString(),
    },
    {
      username: "milo_marketer_review",
      password: "password",
      role: "marketing_admin",
      displayName: "Milo Grant",
      email: "milo.marketer@cdp.local",
      defaultChatPersona: "marketer",
      permissionTier: "send_for_review",
      deniedPermissions: getDeniedPermissionsForTier("send_for_review"),
      createdAt: new Date().toISOString(),
    },
    {
      username: "meredith_merch_admin",
      password: "password",
      role: "marketing_admin",
      displayName: "Meredith Fox",
      email: "meredith.merch@cdp.local",
      defaultChatPersona: "merchandiser",
      permissionTier: "full_admin",
      createdAt: new Date().toISOString(),
    },
    {
      username: "marcus_merch_review",
      password: "password",
      role: "marketing_admin",
      displayName: "Marcus Bell",
      email: "marcus.merch@cdp.local",
      defaultChatPersona: "merchandiser",
      permissionTier: "send_for_review",
      deniedPermissions: getDeniedPermissionsForTier("send_for_review"),
      createdAt: new Date().toISOString(),
    },
    {
      username: "gina_general_admin",
      password: "password",
      role: "marketing_admin",
      displayName: "Gina Cole",
      email: "gina.general@cdp.local",
      defaultChatPersona: "general_user",
      permissionTier: "full_admin",
      createdAt: new Date().toISOString(),
    },
    {
      username: "gabe_general_review",
      password: "password",
      role: "marketing_admin",
      displayName: "Gabe Stone",
      email: "gabe.general@cdp.local",
      defaultChatPersona: "general_user",
      permissionTier: "send_for_review",
      deniedPermissions: getDeniedPermissionsForTier("send_for_review"),
      createdAt: new Date().toISOString(),
    },
    {
      username: "risk_user",
      password: "password",
      role: "risk_admin",
      displayName: "Dana Operator",
      email: "operator@cdp.local",
      defaultChatPersona: "general_user",
      permissionTier: "full_admin",
      createdAt: new Date().toISOString(),
    },
    {
      username: "platform",
      password: "password",
      role: "platform_admin",
      displayName: "Platform Admin",
      email: "platform@cdp.local",
      defaultChatPersona: "general_user",
      permissionTier: "full_admin",
      createdAt: new Date().toISOString(),
    },
  ];
}

// In-memory user database
let users: StoredUser[] = buildDefaultUsers();

function mergeUsersWithDefaults(existingUsers: StoredUser[]): StoredUser[] {
  const mergedUsers = [...existingUsers];

  for (const defaultUser of buildDefaultUsers()) {
    const alreadyExists = mergedUsers.some(
      (user) => user.username.toLowerCase() === defaultUser.username.toLowerCase()
    );

    if (!alreadyExists) {
      mergedUsers.push(defaultUser);
    }
  }

  return mergedUsers;
}

// Load users from localStorage on initialization
if (typeof window !== "undefined") {
  const storedUsers = localStorage.getItem("cdp_users");
  if (storedUsers) {
    try {
      const parsedUsers = JSON.parse(storedUsers) as unknown;
      if (Array.isArray(parsedUsers)) {
        const normalizedUsers = parsedUsers
          .map((user) => normalizeStoredUser(user))
          .filter((user): user is StoredUser => user !== null);

        if (normalizedUsers.length > 0) {
          users = mergeUsersWithDefaults(normalizedUsers);
        }
        saveUsers();
      } else {
        throw new Error("Stored users payload is not an array");
      }
    } catch (error) {
      console.error("Failed to parse stored users:", error);
    }
  }
}

function saveUsers() {
  if (typeof window !== "undefined") {
    localStorage.setItem("cdp_users", JSON.stringify(users));
  }
}

function normalizeStoredUser(user: unknown): StoredUser | null {
  if (!user || typeof user !== "object") {
    return null;
  }

  const candidate = user as Partial<StoredUser>;
  if (
    typeof candidate.username !== "string" ||
    typeof candidate.password !== "string" ||
    !isUserRole(candidate.role)
  ) {
    return null;
  }

  const permissionTier =
    candidate.permissionTier && isPermissionTier(candidate.permissionTier)
      ? candidate.permissionTier
      : "full_admin";

  return {
    username: candidate.username,
    password: candidate.password,
    role: candidate.role,
    displayName:
      typeof candidate.displayName === "string" ? candidate.displayName : undefined,
    email: typeof candidate.email === "string" ? candidate.email : undefined,
    defaultChatPersona:
      candidate.defaultChatPersona && isChatPersona(candidate.defaultChatPersona)
        ? candidate.defaultChatPersona
        : getDefaultPersonaForRole(candidate.role),
    permissionTier,
    deniedPermissions: Array.isArray(candidate.deniedPermissions)
      ? candidate.deniedPermissions.filter(
          (permission): permission is string => typeof permission === "string"
        )
      : getDeniedPermissionsForTier(permissionTier),
    createdAt:
      typeof candidate.createdAt === "string"
        ? candidate.createdAt
        : new Date().toISOString(),
  };
}

export function validateUser(username: string, password: string): StoredUser | null {
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  return user ? normalizeStoredUser(user) : null;
}

export function userExists(username: string): boolean {
  return users.some((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function createUser(
  username: string,
  password: string,
  role: UserRole,
  email?: string,
  options?: { defaultChatPersona?: ChatPersona; permissionTier?: PermissionTier }
): boolean {
  if (userExists(username)) {
    return false;
  }

  const permissionTier = options?.permissionTier ?? "full_admin";

  const newUser: StoredUser = {
    username,
    password,
    role,
    email,
    defaultChatPersona: options?.defaultChatPersona ?? getDefaultPersonaForRole(role),
    permissionTier,
    deniedPermissions: getDeniedPermissionsForTier(permissionTier),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers();
  return true;
}

export function resetUsersToDefaults(): void {
  users = buildDefaultUsers();
  saveUsers();
}

export const CHAT_PERSONA_OPTIONS: { value: ChatPersona; label: string }[] = [
  { value: "marketer", label: "Marketer" },
  { value: "merchandiser", label: "Merchandiser" },
  { value: "general_user", label: "General user" },
];

export const PERMISSION_TIER_OPTIONS: { value: PermissionTier; label: string; description: string }[] = [
  {
    value: "full_admin",
    label: "Full admin",
    description: "Can execute and approve recommended actions",
  },
  {
    value: "send_for_review",
    label: "Send for review",
    description: "Can request actions but cannot execute directly",
  },
];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: "Username is required" };
  }
  
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  
  if (username.length > 15) {
    return { valid: false, error: "Username must be no more than 15 characters" };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores" };
  }
  
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }
  
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: true }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  return { valid: true };
}
