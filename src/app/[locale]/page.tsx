"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { IntroductionSection } from "@/components/home/IntroductionSection";
import { LoanProductPanel } from "@/components/home/LoanProductPanel";
import { ProductTabs } from "@/components/home/ProductTabs";
import { StatsSection } from "@/components/home/StatsSection";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
import { useConsentSession } from "@/hooks/consent/use-consent-session";
import { useConsentPurpose } from "@/hooks/consent/use-consent-purpose";
import { useUserConsent } from "@/hooks/consent/use-user-consent";
import { useFlowStep } from "@/hooks/tenant/use-flow-step";
import { useConsentStore } from "@/store/use-consent-store";

/**
 * Home Page
 *
 * Main landing page assembled from theme-aware components
 * Refactored for multi-tenancy and i18n
 */
export default function Home() {
  const t = useTranslations("components.layout.header.nav.products");
  const t_common = useTranslations("common");
  const sessionId = useConsentSession();
  const openConsentModal = useConsentStore((s) => s.openConsentModal);

  const indexStep = useFlowStep("/index");
  const consentPurposeId = indexStep?.consent_purpose_id;

  // Fetch the active consent purpose for the website based on purpose ID from flow
  const { data: consentPurposeData } = useConsentPurpose({
    consentPurposeId: consentPurposeId,
    enabled: !!consentPurposeId,
  });

  // Check consent status for the current session
  const { data: userConsent } = useUserConsent({
    sessionId: sessionId || undefined,
    enabled: !!sessionId,
  });

  useEffect(() => {
    console.log("[Home Page] Consent Modal Debug:", {
      sessionId,
      consentPurposeId,
      consentPurposeData,
      userConsent,
    });

    // If no session ID yet (initializing), wait
    if (!sessionId) {
      console.log("[Home Page] No session ID yet, waiting...");
      return;
    }

    // Wait for flow and consent purpose to be resolved
    if (!consentPurposeId) {
      console.log("[Home Page] No consent purpose ID, waiting...");
      return;
    }

    const latestVersionId = consentPurposeData?.latest_version_id;

    if (!latestVersionId) {
      console.log("[Home Page] No consent version available, waiting...");
      return;
    }

    // Check if user has already consented to this version in this session
    const userVersionId = userConsent?.consent_version_id;
    const hasConsented = userConsent?.action === "grant"; // Explicitly check for grant action

    console.log("[Home Page] Consent check:", {
      latestVersionId,
      userVersionId,
      hasConsented,
      userConsentAction: userConsent?.action,
    });

    // Show modal if:
    // 1. No consent record found for this session
    // 2. OR Consent record exists but version is outdated
    // 3. OR Consent record exists but action is not 'grant' (e.g. revoked?)

    const shouldShowModal =
      !userVersionId || userVersionId !== latestVersionId || !hasConsented;

    console.log("[Home Page] Modal decision:", {
      shouldShowModal,
      reason: !userVersionId
        ? "No consent record"
        : userVersionId !== latestVersionId
          ? "Version outdated"
          : !hasConsented
            ? "Not granted"
            : "Already consented",
    });

    if (shouldShowModal && consentPurposeId) {
      console.log("[Home Page] Opening consent modal");
      openConsentModal({ consentPurposeId });
    }
  }, [
    sessionId,
    consentPurposeData,
    userConsent,
    consentPurposeId,
    openConsentModal,
  ]);

  return (
    <TenantThemeProvider>
      <Header />
      <main className="min-h-screen pt-[60px] md:pt-[72px]">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Product Tabs Section */}
        <ProductTabs defaultTab={0}>
          {/* Loan Tab */}
          <LoanProductPanel />

          {/* Credit Card Tab - Placeholder */}
          <div className="p-8 text-center text-gray-500">
            <h3 className="text-2xl font-bold mb-4">{t("creditCard")}</h3>
            <p>{t_common("updatingContent")}</p>
          </div>

          {/* Insurance Tab - Placeholder */}
          <div className="p-8 text-center text-gray-500">
            <h3 className="text-2xl font-bold mb-4">{t("insurance")}</h3>
            <p>{t_common("updatingContent")}</p>
          </div>

          {/* Securities Tab - Disabled */}
          <div className="p-8 text-center text-gray-500">
            <h3 className="text-2xl font-bold mb-4">{t("securities")}</h3>
            <p>{t_common("comingSoon")}</p>
          </div>
        </ProductTabs>

        {/* Introduction Section */}
        <IntroductionSection />

        {/* Stats Section */}
        <StatsSection />
      </main>
      <Footer />
    </TenantThemeProvider>
  );
}
