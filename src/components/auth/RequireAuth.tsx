"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getLocalizedRedirect } from "@/lib/client-utils";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireAuth({
  children,
  fallback,
  redirectTo,
}: RequireAuthProps) {
  const { isAuthenticated, isLoading, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect during initial hydration
    if (!isHydrated || isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const loginUrl = redirectTo || getLocalizedRedirect("/admin/login", pathname);
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, isHydrated, pathname, router, redirectTo]);

  // Show loading during hydration or authentication check
  if (!isHydrated || isLoading) {
    return fallback || null;
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}