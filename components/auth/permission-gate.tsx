"use client";

import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser, Permission } from "@/lib/permissions/roles";
import { ReactNode } from "react";

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  if (!hasPermissionForUser(user, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if current user has a specific permission
 */
export function usePermission(permission: Permission): boolean {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return false;
  }

  return hasPermissionForUser(user, permission);
}

/**
 * Hook to check if current user has any of the specified permissions
 */
export function usePermissions(permissions: Permission[]): boolean {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return false;
  }

  return permissions.some((permission) => hasPermissionForUser(user, permission));
}
