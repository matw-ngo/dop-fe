"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
import { DynamicLoanForm } from "@/components/loan-application/DynamicLoanForm";
import { useFlow } from "@/hooks/flow/use-flow";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { useAuthStore } from "@/store/use-auth-store";
import {
  useLoanSearchStore,
  useLoanSearchVisible,
  useLoanSearchLoading,
  useMatchedProducts,
} from "@/store/use-loan-search-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";
import { LoanSearchingScreen } from "@/components/loan-application/LoanSearching";
import { LoadingSkeleton } from "./LoadingSkeleton";
import {
  checkAuthGuard,
  checkNavigationSecurity,
  handleRedirectLoop,
  validateStep,
} from "./validation";
import type { ValidationResult } from "./types";

/**
 * Dynamic catch-all route handler for API-defined form steps
 * Intercepts undefined routes under [locale]/[...slug] and validates user access
 */
export default function DynamicStepPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("features.loan-application.navigation");
  const tenant = useTenant();

  // Extract and normalize page identifier from slug
  // Must call all hooks before any conditional returns
  const page = useMemo(() => {
    const slug = params.slug as string[] | undefined;
    if (!slug || slug.length === 0) {
      return null;
    }

    // Construct page identifier from slug segments
    const rawPage = `/${slug.join("/")}`;

    // Apply page normalization:
    // - Ensure path starts with /
    // - Treat /index and / as equivalent
    const normalized = rawPage.startsWith("/") ? rawPage : `/${rawPage}`;
    return normalized === "/index" ? "/" : normalized;
  }, [params.slug]);

  // Fetch flow configuration (must call all hooks before any conditional returns)
  const { data: flowData, isLoading, error } = useFlow(tenant.uuid);

  // Stores
  const authStore = useAuthStore();
  const wizardStore = useFormWizardStore();
  const loanSearchStore = useLoanSearchStore();
  const isLoanSearching = useLoanSearchVisible();
  const isLoanSearchLoading = useLoanSearchLoading();
  const matchedProducts = useMatchedProducts();

  // Validation state
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  // Detect OTP step when flow data loads (Req 7.2)
  useEffect(() => {
    if (flowData?.steps) {
      wizardStore.detectOTPStep();
    }
  }, [flowData, wizardStore]);

  // Run validation pipeline when flow data loads
  useEffect(() => {
    if (!flowData || isLoading || !page) return;

    // 1. Check redirect loop
    const loopCheck = handleRedirectLoop(page);
    if (loopCheck.shouldBreak) {
      setValidationResult({
        isValid: false,
        redirectTo: "/",
        message: t("errors.redirectLoop"),
        clearState: true, // Signal to clear state before redirect
      });
      return;
    }

    // 2. Auth guard
    const authCheck = checkAuthGuard(authStore);
    if (!authCheck.isValid) {
      setValidationResult({
        isValid: false,
        redirectTo: "/",
        message: authCheck.message,
        clearState: authCheck.shouldClearSession, // Only clear if corruption detected
      });
      return;
    }

    // 3. Step validation
    const stepCheck = validateStep(page, flowData, wizardStore);
    if (!stepCheck.isValid) {
      setValidationResult({
        isValid: false,
        redirectTo: stepCheck.redirectTo || "/",
        message: stepCheck.messageKey ? t(stepCheck.messageKey) : undefined,
      });
      return;
    }

    // 4. Navigation security
    const navCheck = checkNavigationSecurity(
      page,
      flowData,
      authStore,
      wizardStore,
    );
    if (!navCheck.isValid) {
      setValidationResult({
        isValid: false,
        redirectTo: navCheck.redirectTo,
        message: navCheck.message,
      });
      return;
    }

    // All checks passed
    setValidationResult({ isValid: true });

    // Reset redirect counter on successful load
    sessionStorage.removeItem("dop_redirect_counter");
  }, [flowData, isLoading, page, authStore, wizardStore, t]);

  // Navigate to loan-result page when search animation completes and products are available
  useEffect(() => {
    if (isLoanSearching && !isLoanSearchLoading && matchedProducts.length > 0) {
      router.push("/loan-result");
    }
  }, [isLoanSearching, isLoanSearchLoading, matchedProducts, router]);

  // Handle loan search errors
  useEffect(() => {
    if (!loanSearchStore.isVisible) return;

    // Handle error (rejected or exhausted)
    if (
      (loanSearchStore.forwardStatus === "rejected" ||
        loanSearchStore.forwardStatus === "exhausted") &&
      loanSearchStore.error
    ) {
      toast.error(loanSearchStore.error);

      const config = loanSearchStore.config;
      if (config?.onError) {
        config.onError(new Error(loanSearchStore.error));
      }

      loanSearchStore.hideLoanSearching();
    }
  }, [loanSearchStore]);

  useEffect(() => {
    if (!validationResult) return;

    if (!validationResult.isValid && validationResult.redirectTo) {
      // Clear state if needed (for redirect loop or session corruption)
      if (validationResult.clearState) {
        authStore.clearVerificationSession();
        wizardStore.resetWizard();
        // Don't increment counter when breaking loop - it was already removed
      } else {
        // Increment redirect counter for normal validation failures
        const counterData = JSON.parse(
          sessionStorage.getItem("dop_redirect_counter") ||
            '{"count":0,"timestamp":0}',
        );
        sessionStorage.setItem(
          "dop_redirect_counter",
          JSON.stringify({
            count: counterData.count + 1,
            timestamp: Date.now(),
          }),
        );
      }

      // Show toast and redirect
      if (validationResult.message) {
        toast.error(validationResult.message);
      }
      router.push(validationResult.redirectTo);
    }
  }, [validationResult, router, authStore, wizardStore]);

  // Return 404 for empty/invalid slugs (after all hooks)
  if (!page) {
    notFound();
  }

  // Render content based on state
  const renderContent = () => {
    // Loan searching screen
    if (isLoanSearching) {
      return (
        <div
          data-testid="loan-searching-screen"
          className="rounded-lg border p-8 min-h-[400px] flex items-center justify-center"
          style={{
            backgroundColor: tenant.theme.colors.background,
            borderColor: tenant.theme.colors.border,
            boxShadow: "0 10px 40px rgba(1, 120, 72, 0.08)",
          }}
        >
          <LoanSearchingScreen message={loanSearchStore.config?.message} />
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div
          className="rounded-lg border p-8"
          style={{
            backgroundColor: tenant.theme.colors.background,
            borderColor: tenant.theme.colors.border,
          }}
        >
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">{t("errors.loadFailed")}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded transition-opacity hover:opacity-90"
              style={{
                backgroundColor: tenant.theme.colors.primary,
                color: "#ffffff",
              }}
              type="button"
            >
              {t("actions.retry")}
            </button>
          </div>
        </div>
      );
    }

    // Loading state
    if (isLoading || !validationResult) {
      return <LoadingSkeleton />;
    }

    // Form state
    if (validationResult.isValid) {
      return (
        <div
          data-testid="dynamic-step-page"
          className="rounded-lg border p-8"
          style={{
            backgroundColor: tenant.theme.colors.background,
            borderColor: tenant.theme.colors.border,
            boxShadow: "0 10px 40px rgba(1, 120, 72, 0.08)",
          }}
        >
          <DynamicLoanForm page={page} />
        </div>
      );
    }

    // Redirecting state
    return <LoadingSkeleton />;
  };

  return (
    <TenantThemeProvider>
      <div
        className="min-h-screen p-8"
        style={{ backgroundColor: tenant.theme.colors.readOnly }}
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {/* TODO: fix in future - replace hardcoded title with dynamic step title from flow config */}
          {!isLoanSearching && (
            <div className="space-y-2">
              <h1
                className="text-4xl font-bold"
                style={{ color: tenant.theme.colors.textPrimary }}
              >
                Thông tin vay
              </h1>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </TenantThemeProvider>
  );
}
