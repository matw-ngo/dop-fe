"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { getLocalizedRedirect } from "@/lib/client-utils";
import type { User } from "@/store/use-auth-store";
import { useTranslations } from "next-intl";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: User["role"];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/admin/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isHydrated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("admin.auth.protectedRoute");

  useEffect(() => {
    // Only check authentication after both loading and hydration are complete
    if (!isLoading && isHydrated) {
      if (!isAuthenticated) {
        // Create localized redirect URL
        const localizedRedirect = getLocalizedRedirect(redirectTo, pathname);
        router.push(localizedRedirect);
      } else if (requiredRole && user?.role !== requiredRole) {
        // Redirect to unauthorized page or dashboard with locale
        const localizedAdminPath = getLocalizedRedirect("/admin", pathname);
        router.push(localizedAdminPath);
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    isHydrated,
    user,
    requiredRole,
    redirectTo,
    router,
    pathname,
  ]);

  // Show loading state while checking authentication or during hydration
  if (isLoading || !isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">{t("checkingAuth")}</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the useEffect will handle redirection
  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("accessDenied.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("accessDenied.message")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
