"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type CSSProperties, memo, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFormTheme } from "@/components/form-generation/themes";
import { useConsentPurpose } from "@/hooks/consent/use-consent-purpose";
import { useConsentSession } from "@/hooks/consent/use-consent-session";
import { useUserConsent } from "@/hooks/consent/use-user-consent";
import { useConsentGrant } from "@/hooks/consent/use-consent-grant";
import { useAuthStore } from "@/store/use-auth-store";
import { type ConsentRecord, useConsentStore } from "@/store/use-consent-store";

import { ConsentForm, ConsentTermsContent } from "./ConsentForm";
import { ConsentDialog, ConsentDialogClose } from "./ConsentDialog";

interface ConsentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: (consentId: string) => void;
  stepData?: {
    consent_purpose_id?: string;
  };
}

/**
 * Smart consent modal - orchestrates consent flow with business logic
 * Uses composable ConsentDialog, ConsentForm, and ConsentTermsContent
 */
export const ConsentModal = memo(function ConsentModal({
  open,
  setOpen,
  onSuccess,
  stepData,
}: ConsentModalProps) {
  const t = useTranslations("features.consent");
  const { user } = useAuthStore();
  const userId = user?.id;
  const sessionId = useConsentSession();

  const { setConsentData, setError } = useConsentStore();
  const { grantConsent, isSubmitting } = useConsentGrant();

  const [showTermsModal, setShowTermsModal] = useState(false);

  const { theme } = useFormTheme();

  const consentThemeStyles = useMemo(
    () =>
      ({
        "--consent-bg": theme.colors.background,
        "--consent-fg": theme.colors.textPrimary || "#0f172a",
        "--consent-muted": theme.colors.textSecondary || "#64748b",
        "--consent-border": theme.colors.border,
        "--consent-surface": theme.colors.readOnly,
        "--consent-primary": theme.colors.primary,
        "--consent-primary-hover": `${theme.colors.primary}e6`,
        "--consent-error": theme.colors.error,
        "--consent-backdrop": theme.colors.textPrimary || "#0f172a",
      }) as CSSProperties,
    [theme],
  );

  const { data: consentPurpose, isLoading: isLoadingPurpose } =
    useConsentPurpose({
      consentPurposeId: stepData?.consent_purpose_id,
      enabled: open && !!stepData?.consent_purpose_id,
    });

  const { isLoading: isLoadingUserConsent } = useUserConsent({
    sessionId: sessionId || undefined,
    enabled: open && !!sessionId,
  });

  useEffect(() => {
    const handleDataUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ consentData?: ConsentRecord }>;
      if (customEvent.detail?.consentData) {
        setConsentData(customEvent.detail.consentData);
      }
    };

    const handleError = (event: Event) => {
      const customEvent = event as CustomEvent<{ error: string }>;
      if (customEvent.detail?.error) {
        setError(customEvent.detail.error);
      }
    };

    window.addEventListener("consent:data-updated", handleDataUpdated);
    window.addEventListener("consent:error", handleError);

    return () => {
      window.removeEventListener("consent:data-updated", handleDataUpdated);
      window.removeEventListener("consent:error", handleError);
    };
  }, [setConsentData, setError]);

  const handleViewTerms = () => {
    setShowTermsModal(true);
  };

  const handleGrantConsent = async () => {
    if (!consentPurpose?.latest_version_id) {
      setError("Missing required configuration");
      return;
    }

    const result = await grantConsent({
      userId,
      consentVersionId: consentPurpose.latest_version_id,
      sessionId,
    });

    if (result) {
      setShowTermsModal(false);
      setOpen(false);
      onSuccess?.(result.consentId);
    }
  };

  const isLoading = isLoadingPurpose || isLoadingUserConsent;

  return (
    <>
      {/* Main Consent Form Dialog */}
      <ConsentDialog
        open={open && !showTermsModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(false);
          }
        }}
        title={t("form.title")}
        variant="bottom"
        themeStyles={consentThemeStyles}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-[var(--consent-primary)]" />
            <span className="text-[var(--consent-muted)]">
              {t("common.loading")}
            </span>
          </div>
        ) : (
          <ConsentForm
            consentVersion={{
              version: consentPurpose?.latest_version,
              content: consentPurpose?.latest_content,
            }}
            onGrant={handleGrantConsent}
            isSubmitting={isSubmitting}
            onViewTerms={handleViewTerms}
            className="p-6 md:p-8"
          />
        )}
      </ConsentDialog>

      {/* Terms Detail Modal */}
      <ConsentDialog
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        title={t("form.termsModal.title")}
        variant="center"
        themeStyles={consentThemeStyles}
      >
        <ConsentDialogClose onClose={() => setShowTermsModal(false)} />

        <ConsentTermsContent
          consentVersion={{
            version: consentPurpose?.latest_version,
            content: consentPurpose?.latest_content,
          }}
        />

        <div className="flex justify-center pt-5">
          <Button
            onClick={handleGrantConsent}
            disabled={isSubmitting}
            loading={isSubmitting}
            size="lg"
            className="h-14 w-[295px] rounded-lg bg-[var(--consent-primary)] text-base font-semibold leading-6 text-white transition-colors hover:bg-[var(--consent-primary-hover)]"
          >
            {isSubmitting ? t("form.loading") : t("form.continueButton")}
          </Button>
        </div>
      </ConsentDialog>
    </>
  );
});

export default ConsentModal;
