"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type CSSProperties, memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { finzoneTheme } from "@/configs/themes/finzone-theme";
import { useConsentPurpose } from "@/hooks/consent/use-consent-purpose";
import { useConsentSession } from "@/hooks/consent/use-consent-session";
import { useUserConsent } from "@/hooks/consent/use-user-consent";
import { consentClient } from "@/lib/api/services";
import { useAuthStore } from "@/store/use-auth-store";
import { type ConsentRecord, useConsentStore } from "@/store/use-consent-store";

import { ConsentForm, ConsentTermsContent } from "./ConsentForm";

interface ConsentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: (consentId: string) => void;
  stepData?: {
    consent_purpose_id?: string;
  };
}

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

  const {
    setConsentId,
    setConsentStatus,
    setConsentData,
    setError,
    clearError,
  } = useConsentStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const consentThemeStyles = {
    "--consent-bg": finzoneTheme.colors.background,
    "--consent-fg": finzoneTheme.colors.textPrimary,
    "--consent-muted": finzoneTheme.colors.textSecondary,
    "--consent-border": finzoneTheme.colors.border,
    "--consent-surface": finzoneTheme.colors.readOnly,
    "--consent-primary": finzoneTheme.colors.primary,
    "--consent-primary-hover": `${finzoneTheme.colors.primary}e6`, // 90% opacity
    "--consent-error": finzoneTheme.colors.error,
    "--consent-backdrop": finzoneTheme.colors.textPrimary,
  } as CSSProperties;

  // Get Consent Purpose based on step data
  const { data: consentPurpose, isLoading: isLoadingPurpose } =
    useConsentPurpose({
      consentPurposeId: stepData?.consent_purpose_id,
      enabled: open && !!stepData?.consent_purpose_id,
    });

  // Check current status based on Session ID
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

    setIsSubmitting(true);
    clearError();

    try {
      const result = await consentClient.POST("/consent", {
        body: {
          tenant_id: "00000000-0000-0000-0000-000000000000", // FIXME: Get real tenant ID
          lead_id: userId,
          consent_version_id: consentPurpose.latest_version_id,
          session_id: sessionId,
          source: "web",
        },
      });

      if (result.data?.id) {
        const newConsentId = result.data.id;

        // Log the GRANT action
        await consentClient.POST("/consent-log", {
          body: {
            tenant_id: "00000000-0000-0000-0000-000000000000", // FIXME
            consent_id: newConsentId,
            action: "grant",
            action_by: "user",
            source: "web",
          },
        });

        setConsentId(newConsentId);
        setConsentStatus("agreed");
        setConsentData({
          id: newConsentId,
          lead_id: userId || "",
          consent_version_id: consentPurpose.latest_version_id,
          source: "web",
          action: "grant",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Close all modals
        setShowTermsModal(false);
        setOpen(false);
        onSuccess?.(newConsentId);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to grant consent",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingPurpose || isLoadingUserConsent;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // When closing dialog, reset terms modal state
          setShowTermsModal(false);
        }
        setOpen(isOpen);
      }}
    >
      <DialogPortal>
        <DialogOverlay
          style={consentThemeStyles}
          className="bg-[var(--consent-backdrop)]/86"
        />
        {!showTermsModal ? (
          // Main Consent Form - Bottom positioned
          <DialogPrimitive.Content
            style={consentThemeStyles}
            className="!fixed !top-auto !bottom-8 !left-1/2 !z-50 !grid !w-[calc(100%-2rem)] !max-w-[800px] !-translate-x-1/2 !translate-y-0 !gap-0 rounded-lg border-[var(--consent-border)] bg-[var(--consent-bg)] p-0 text-[var(--consent-fg)] shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-8 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-8 sm:!w-[calc(100%-4rem)]"
          >
            {/* Hidden title for accessibility */}
            <div className="sr-only">
              <DialogTitle>{t("form.title")}</DialogTitle>
            </div>

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
              />
            )}
          </DialogPrimitive.Content>
        ) : (
          // Terms Detail Modal - Centered
          <DialogPrimitive.Content
            style={consentThemeStyles}
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg border-[var(--consent-border)] bg-[var(--consent-bg)] text-[var(--consent-fg)]"
          >
            <DialogPrimitive.Close
              onClick={() => setShowTermsModal(false)}
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none text-[var(--consent-muted)] hover:text-[var(--consent-fg)]"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Close</title>
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            <div className="sr-only">
              <DialogTitle>{t("form.termsModal.title")}</DialogTitle>
            </div>

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
          </DialogPrimitive.Content>
        )}
      </DialogPortal>
    </Dialog>
  );
});

export default ConsentModal;
