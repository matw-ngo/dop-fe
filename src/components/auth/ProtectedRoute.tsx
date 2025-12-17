"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import { getLocalizedRedirect } from "@/lib/client-utils";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole = "admin",
  fallback = <ProtectedRouteSkeleton />,
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isHydrated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect during initial hydration
    if (!isHydrated || isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      const loginUrl =
        redirectTo || getLocalizedRedirect("/admin/login", pathname);
      router.push(loginUrl);
      return;
    }

    // Check role requirements
    if (requiredRole && user?.role !== requiredRole) {
      const unauthorizedUrl = getLocalizedRedirect(
        "/admin/unauthorized",
        pathname,
      );
      router.push(unauthorizedUrl);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    isHydrated,
    user,
    requiredRole,
    pathname,
    router,
    redirectTo,
  ]);

  // Show loading during hydration or authentication check
  if (!isHydrated || isLoading) {
    return fallback;
  }

  // Check if user is authenticated and has required role
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return fallback;
  }

  return <>{children}</>;
}

function ProtectedRouteSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar skeleton */}
        <div className="w-64 border-r bg-card p-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>

            {/* Content area skeleton */}
            <div className="bg-card p-6 rounded-lg border">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
