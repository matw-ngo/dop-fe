"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getLocalizedRedirect } from "@/lib/client-utils";
import {
  hasRole,
  hasPermission,
  canAccessRoute,
  canPerformAction,
  getRoleBasedRedirect,
} from "@/lib/utils/auth-guards";

/**
 * Hook for route protection with role-based access control
 */
export function useAuthGuard(requiredRole?: "admin" | "user") {
  const { user, isAuthenticated, isLoading, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const checkAccess = useCallback(() => {
    // Don't check during hydration or loading
    if (!isHydrated || isLoading) return false;

    // Check authentication
    if (!isAuthenticated || !user) {
      const loginUrl = getLocalizedRedirect("/admin/login", pathname);
      router.push(loginUrl);
      return false;
    }

    // Check role requirements
    if (requiredRole && !hasRole(user, requiredRole)) {
      const unauthorizedUrl = getLocalizedRedirect("/admin/unauthorized", pathname);
      router.push(unauthorizedUrl);
      return false;
    }

    return true;
  }, [user, isAuthenticated, isLoading, isHydrated, requiredRole, pathname, router]);

  const redirectToLogin = useCallback(() => {
    const loginUrl = getLocalizedRedirect("/admin/login", pathname);
    router.push(loginUrl);
  }, [pathname, router]);

  const redirectToUnauthorized = useCallback(() => {
    const unauthorizedUrl = getLocalizedRedirect("/admin/unauthorized", pathname);
    router.push(unauthorizedUrl);
  }, [pathname, router]);

  return {
    canAccess: checkAccess(),
    hasAccess: checkAccess(),
    redirectToLogin,
    redirectToUnauthorized,
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
  };
}

/**
 * Hook for permission-based access control
 */
export function usePermission(permission: string) {
  const { user } = useAuth();

  const hasRequiredPermission = hasPermission(user, permission);

  return {
    hasPermission: hasRequiredPermission,
    canPerform: hasRequiredPermission,
    user,
  };
}

/**
 * Hook for route-based access control
 */
export function useRouteAccess() {
  const { user } = useAuth();
  const pathname = usePathname();

  const canAccessCurrentRoute = canAccessRoute(user, pathname);

  return {
    canAccessRoute: canAccessCurrentRoute,
    user,
    pathname,
  };
}

/**
 * Hook for action-based access control
 */
export function useActionAccess() {
  const { user } = useAuth();

  const canPerform = useCallback(
    (action: string, resource: string, resourceOwnerId?: string) => {
      return canPerformAction(user, action, resource, resourceOwnerId);
    },
    [user]
  );

  return {
    canPerform,
    user,
  };
}

/**
 * Hook for role-based redirects
 */
export function useRoleRedirect() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const redirectToRoleBasedPage = useCallback(() => {
    if (!isAuthenticated || !user) {
      router.push("/admin/login");
      return;
    }

    const redirectPath = getRoleBasedRedirect(user);
    router.push(redirectPath);
  }, [user, isAuthenticated, router]);

  return {
    redirectToRoleBasedPage,
    user,
    isAuthenticated,
  };
}

/**
 * Hook for admin-specific access control
 */
export function useAdminAccess() {
  const authGuard = useAuthGuard("admin");

  const canManageUsers = authGuard.user?.role === "admin";
  const canManageFlows = authGuard.user?.role === "admin";
  const canManageLeads = authGuard.user?.role === "admin";
  const canViewAnalytics = authGuard.user?.role === "admin";
  const canManageSettings = authGuard.user?.role === "admin";

  return {
    ...authGuard,
    isAdmin: authGuard.user?.role === "admin",
    canManageUsers,
    canManageFlows,
    canManageLeads,
    canViewAnalytics,
    canManageSettings,
  };
}

/**
 * Hook for user-specific access control
 */
export function useUserAccess() {
  const authGuard = useAuthGuard("user");

  const canViewOwnApplications = !!authGuard.user;
  const canEditOwnProfile = !!authGuard.user;
  const canApplyForLoans = !!authGuard.user;
  const canApplyForCards = !!authGuard.user;

  return {
    ...authGuard,
    isUser: authGuard.user?.role === "user",
    canViewOwnApplications,
    canEditOwnProfile,
    canApplyForLoans,
    canApplyForCards,
  };
}

/**
 * Hook for feature access control
 */
export function useFeatureAccess() {
  const { user } = useAuth();

  const hasFeature = useCallback((feature: string) => {
    if (!user) return false;

    const featurePermissions: Record<string, string[]> = {
      dashboard: ["admin"],
      "flow-management": ["admin"],
      "lead-management": ["admin"],
      "user-management": ["admin"],
      analytics: ["admin"],
      settings: ["admin"],
      "loan-applications": ["admin", "user"],
      "credit-cards": ["admin", "user"],
      insurance: ["admin", "user"],
      "financial-tools": ["admin", "user"],
    };

    const requiredRoles = featurePermissions[feature];
    return requiredRoles ? requiredRoles.includes(user.role) : false;
  }, [user]);

  return {
    hasFeature,
    user,
  };
}