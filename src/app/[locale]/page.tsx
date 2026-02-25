"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ConsentModal } from "@/components/consent/ConsentModal";
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
import { useTenantFlow } from "@/hooks/tenant/use-flow";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * Home Page
 *
 * Main landing page assembled from theme-aware components
 * Refactored for multi-tenancy and i18n
 */
export default function Home() {
  const t = useTranslations("components.layout.header.nav.products");
  const t_common = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();
  const userId = user?.id;
  const sessionId = useConsentSession();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const tenant = useTenant();

  // Fetch tenant flow to get consent purpose for index page
  const { data: flowConfig } = useTenantFlow(tenant.uuid, {
    enabled: !!tenant.uuid,
  });

  // Find the step corresponding to index page
  // Note: Assuming '/index' or '/' is the page identifier in the flow steps
  // Need to verify the exact page identifier from backend data or agreement.
  // Using '/index' as per user instruction.
  const indexStep = flowConfig?.steps?.find((step) => step.page === "/index");
  const consentPurposeId = indexStep?.consent_purpose_id;

  console.log("[Home Page] Step Data:", {
    flowConfig,
    indexStep,
    consentPurposeId,
    allSteps: flowConfig?.steps?.map((s) => ({
      page: s.page,
      consent_purpose_id: s.consent_purpose_id,
    })),
  });

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
      showConsentModal,
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

    // Only update state if it changes to avoid loops
    if (showConsentModal !== shouldShowModal) {
      console.log("[Home Page] Updating modal state:", shouldShowModal);
      setShowConsentModal(shouldShowModal);
    }
  }, [sessionId, consentPurposeData, userConsent, consentPurposeId]);

  useEffect(() => {
    const handleDataUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ consentData: any }>;
      if (customEvent.detail?.consentData?.id) {
        setShowConsentModal(false);
      }
    };

    window.addEventListener("consent:data-updated", handleDataUpdated);

    return () => {
      window.removeEventListener("consent:data-updated", handleDataUpdated);
    };
  }, []);

  const handleConsentSuccess = (_consentId: string) => {
    // Just close modal, don't redirect on homepage consent usually
    // Unless specifically required.
    // router.push("/user-onboarding");
    setShowConsentModal(false);
  };

  return (
    <TenantThemeProvider>
      <Header />
      <main className="min-h-screen pt-[60px] md:pt-[72px]">
        {showConsentModal && (
          <ConsentModal
            open={showConsentModal}
            setOpen={setShowConsentModal}
            onSuccess={handleConsentSuccess}
            stepData={indexStep} // Pass the step data which contains consent_purpose_id
          />
        )}

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
