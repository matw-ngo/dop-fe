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
import { useConsentVersion } from "@/hooks/consent/use-consent-version";
import { useUserConsent } from "@/hooks/consent/use-user-consent";
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
  const [showConsentModal, setShowConsentModal] = useState(false);

  const { data: consentVersionData } = useConsentVersion({
    enabled: !!userId,
  });

  const { data: userConsent } = useUserConsent({
    leadId: userId,
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) {
      setShowConsentModal(false);
      return;
    }

    const latestVersionId = consentVersionData?.consent_versions?.[0]?.id;
    const userVersionId = userConsent?.consent_version_id;

    const shouldShowModal = !userVersionId || userVersionId !== latestVersionId;
    setShowConsentModal(shouldShowModal);
  }, [userId, consentVersionData, userConsent]);

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
    router.push("/user-onboarding");
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
