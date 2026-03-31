"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { resetUsersToDefaults, validateUser } from "./mock-users";
import { clearClientCaches, clearClientSessionState } from "./session-reset";

export const USER_ROLES = [
  "super_admin",
  "data_admin",
  "marketing_admin",
  "service_agent",
  "risk_admin",
  "platform_admin",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const CHAT_PERSONAS = ["marketer", "merchandiser", "general_user"] as const;
export type ChatPersona = (typeof CHAT_PERSONAS)[number];

export const PERMISSION_TIERS = ["full_admin", "send_for_review"] as const;
export type PermissionTier = (typeof PERMISSION_TIERS)[number];

const DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: "Super Administrator",
  data_admin: "Data Administrator",
  marketing_admin: "Marketing Administrator",
  service_agent: "Service Agent",
  risk_admin: "Platform Operator",
  platform_admin: "Platform Administrator",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function isChatPersona(value: unknown): value is ChatPersona {
  return (
    typeof value === "string" &&
    CHAT_PERSONAS.includes(value as ChatPersona)
  );
}

export function isPermissionTier(value: unknown): value is PermissionTier {
  return (
    typeof value === "string" &&
    PERMISSION_TIERS.includes(value as PermissionTier)
  );
}

function getDefaultPersonaForRole(role: UserRole): ChatPersona {
  if (role === "marketing_admin") return "marketer";
  if (role === "service_agent") return "merchandiser";
  return "general_user";
}

export interface User {
  username: string;
  role: UserRole;
  displayName: string;
  email?: string;
  deniedPermissions?: string[];
  defaultChatPersona: ChatPersona;
  permissionTier: PermissionTier;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("cdp_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as Partial<User>;
        if (
          typeof parsedUser.username !== "string" ||
          !isUserRole(parsedUser.role)
        ) {
          throw new Error("Stored user has an invalid role or username");
        }

        const displayName =
          typeof parsedUser.displayName === "string" &&
          parsedUser.displayName.trim().length > 0
            ? parsedUser.displayName
            : DISPLAY_NAMES[parsedUser.role];

        const normalizedUser: User = {
          username: parsedUser.username,
          role: parsedUser.role,
          displayName,
          email: typeof parsedUser.email === "string" ? parsedUser.email : undefined,
          deniedPermissions: Array.isArray(parsedUser.deniedPermissions)
            ? parsedUser.deniedPermissions.filter(
                (permission): permission is string =>
                  typeof permission === "string"
              )
            : undefined,
          defaultChatPersona:
            parsedUser.defaultChatPersona &&
            isChatPersona(parsedUser.defaultChatPersona)
              ? parsedUser.defaultChatPersona
              : getDefaultPersonaForRole(parsedUser.role),
          permissionTier:
            parsedUser.permissionTier && isPermissionTier(parsedUser.permissionTier)
              ? parsedUser.permissionTier
              : "full_admin",
        };
        setUser(normalizedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("cdp_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Validate against user database
    const validatedUser = validateUser(username, password);
    
    if (validatedUser) {
      const newUser: User = {
        username: validatedUser.username,
        role: validatedUser.role,
        displayName: validatedUser.displayName || DISPLAY_NAMES[validatedUser.role],
        email: validatedUser.email,
        deniedPermissions: validatedUser.deniedPermissions,
        defaultChatPersona:
          validatedUser.defaultChatPersona ?? getDefaultPersonaForRole(validatedUser.role),
        permissionTier: validatedUser.permissionTier ?? "full_admin",
      };

      setUser(newUser);
      localStorage.setItem("cdp_user", JSON.stringify(newUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    resetUsersToDefaults();
    clearClientSessionState();
    void clearClientCaches();
    setUser(null);
    localStorage.removeItem("cdp_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
