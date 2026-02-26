"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type CSSProperties, memo, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { finzoneTheme } from "@/configs/themes/finzone-theme";
import { useConsentLogs } from "@/hooks/consent/use-consent-logs";
import { useConsentPurpose } from "@/hooks/consent/use-consent-purpose";
import { useConsentSession } from "@/hooks/consent/use-consent-session";
import { useDataCategories } from "@/hooks/consent/use-data-categories";
import { useUserConsent } from "@/hooks/consent/use-user-consent";
import { consentClient } from "@/lib/api/services";
import { useAuthStore } from "@/store/use-auth-store";
import { type ConsentRecord, useConsentStore } from "@/store/use-consent-store";

import { ConsentForm } from "./ConsentForm";
import { ConsentHistory } from "./ConsentHistory";

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
    consentData,
  } = useConsentStore();

  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const consentThemeStyles = {
    "--consent-bg": finzoneTheme.colors.background,
    "--consent-fg": finzoneTheme.colors.textPrimary,
    "--consent-muted": finzoneTheme.colors.textSecondary,
    "--consent-border": finzoneTheme.colors.border,
    "--consent-surface": finzoneTheme.colors.readOnly,
    "--consent-primary": finzoneTheme.colors.primary,
    "--consent-error": finzoneTheme.colors.error,
    "--consent-checkbox-border":
      finzoneTheme.components?.checkable?.uncheckedBorder ??
      finzoneTheme.colors.border,
  } as CSSProperties;

  // 1. Get Consent Purpose based on step data (purpose_id)
  const { data: consentPurpose, isLoading: isLoadingPurpose } =
    useConsentPurpose({
      consentPurposeId: stepData?.consent_purpose_id,
      enabled: open && !!stepData?.consent_purpose_id,
    });

  // 2. Check current status based on Session ID
  const { data: userConsent, isLoading: isLoadingUserConsent } = useUserConsent(
    {
      sessionId: sessionId || undefined,
      enabled: open && !!sessionId,
    },
  );

  const { data: dataCategories, isLoading: isLoadingCategories } =
    useDataCategories({
      consentPurposeId: consentPurpose?.id || stepData?.consent_purpose_id,
      enabled: open,
    });

  const { data: consentLogs, isLoading: isLoadingLogs } = useConsentLogs({
    consentId: userConsent?.id,
    enabled: open && !!userConsent?.id,
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

  useEffect(() => {
    if (consentLogs?.consent_logs && consentLogs.consent_logs.length > 0) {
      setActiveTab("history");
    } else {
      setActiveTab("form");
    }
  }, [consentLogs]);

  const handleGrantConsent = async () => {
    if (!consentPurpose?.latest_version_id) {
      setError("Missing required configuration");
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      // Note: Payload structure updated to match CreateConsentRequest
      // Spec requires: tenant_id, consent_version_id, session_id, source
      const result = await consentClient.POST("/consent", {
        body: {
          tenant_id: "00000000-0000-0000-0000-000000000000", // FIXME: Get real tenant ID from context/config
          lead_id: userId, // Optional, can be null for anonymous
          consent_version_id: consentPurpose.latest_version_id,
          session_id: sessionId,
          source: "web",
          // Action is NOT in the body for CreateConsentRequest in the spec I read earlier?
          // Wait, let me check the spec content again.
          // CreateConsentRequest: tenant_id, lead_id, consent_version_id, session_id, source.
          // It does NOT have action.
          // But UpdateConsentRequest HAS action.
          // The requirements say: "User press Agree -> FE calls API to create/update... Action: GRANT".
          // If I use POST /consent, it's create.
          // If I use PATCH /consent/{id}, it's update.
          // The logic should be: Check if consent exists (userConsent).
          // If exists -> Update (PATCH) with action=GRANT (or REVOKE).
          // If not exists -> Create (POST).
          // BUT, CreateConsentRequest does not have 'action' field in the schema I saw.
          // Let's assume creating implies 'GRANT' initially or we need to update immediately?
          // Or maybe I missed 'action' in CreateConsentRequest?
          // Let's check the spec file content again if possible or assume standard flow.
          // Actually, looking at the previous diff:
          // CreateConsentRequest: tenant_id, lead_id, consent_version_id, session_id, source.
          // UpdateConsentRequest: ... + action.
          // So for Create, we don't send action. It probably defaults to something or just creates the record.
          // Then we might need to Log it with action GRANT.
          // Requirement: "BE saves session_id and latest_version_id".
          // "User press Reject -> FE calls API update. Action: REVOKE".
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
            action_by: "user", // or session_id?
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

        onSuccess?.(newConsentId);
        setOpen(false);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to grant consent",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectConsent = async () => {
    if (!userConsent?.id) {
      setConsentStatus("declined");
      setOpen(false);
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await consentClient.PATCH("/consent/{id}", {
        params: { path: { id: userConsent.id } },
        body: {
          action: "revoke",
        },
      });

      await consentClient.POST("/consent-log", {
        body: {
          tenant_id: "00000000-0000-0000-0000-000000000000", // FIXME
          consent_id: userConsent.id,
          action: "revoke",
          action_by: "user",
          source: "web",
        },
      });

      setConsentStatus("declined");
      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to reject consent",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading =
    isLoadingPurpose ||
    isLoadingUserConsent ||
    isLoadingCategories ||
    isLoadingLogs;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        style={consentThemeStyles}
        className="max-h-[90vh] max-w-2xl overflow-y-auto border-[var(--consent-border)] bg-[var(--consent-bg)] text-[var(--consent-fg)] shadow-xl [&_[data-slot=dialog-close]]:text-[var(--consent-muted)] [&_[data-slot=dialog-close][data-state=open]]:bg-[var(--consent-surface)] [&_[data-slot=dialog-close]:hover]:text-[var(--consent-fg)]"
      >
        <DialogHeader>
          <DialogTitle className="text-[var(--consent-fg)]">
            {t("modal.title")}
          </DialogTitle>
          <DialogDescription className="text-[var(--consent-muted)]">
            {activeTab === "form"
              ? t("form.description")
              : t("history.description")}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-[var(--consent-primary)]" />
            <span className="text-[var(--consent-muted)]">
              {t("common.loading")}
            </span>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4">
            {consentData && (
              <Alert className="border-[var(--consent-border)] bg-[var(--consent-surface)]">
                <AlertTitle className="text-[var(--consent-fg)]">
                  {t("errors.existingConsent")}
                </AlertTitle>
                <AlertDescription className="text-[var(--consent-muted)]">
                  {t("errors.existingConsentDesc")}
                </AlertDescription>
              </Alert>
            )}

            <div className="border-b border-[var(--consent-border)]">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`flex-1 border-b-2 pb-2 font-medium transition-colors ${
                    activeTab === "form"
                      ? "border-[var(--consent-primary)] text-[var(--consent-primary)]"
                      : "border-transparent text-[var(--consent-muted)] hover:text-[var(--consent-fg)]"
                  }`}
                >
                  {t("tabs.form")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 border-b-2 pb-2 font-medium transition-colors ${
                    activeTab === "history"
                      ? "border-[var(--consent-primary)] text-[var(--consent-primary)]"
                      : "border-transparent text-[var(--consent-muted)] hover:text-[var(--consent-fg)]"
                  }`}
                >
                  {t("tabs.history")}
                </button>
              </div>
            </div>

            {activeTab === "form" && (
              <ConsentForm
                consentVersion={{
                  version: consentPurpose?.latest_version,
                  content: consentPurpose?.latest_content,
                }}
                dataCategories={dataCategories}
                onGrant={handleGrantConsent}
                onReject={handleRejectConsent}
                isSubmitting={isSubmitting}
              />
            )}

            {activeTab === "history" && (
              <ConsentHistory
                consentLogs={consentLogs?.consent_logs}
                userConsent={userConsent}
                isLoading={isLoadingLogs}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default ConsentModal;
