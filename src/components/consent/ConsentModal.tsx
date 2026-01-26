"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfigIds } from "@/hooks/consent/use-config-ids";
import { useConsentLogs } from "@/hooks/consent/use-consent-logs";
import { useConsentVersion } from "@/hooks/consent/use-consent-version";
import { useDataCategories } from "@/hooks/consent/use-data-categories";
import { useUserConsent } from "@/hooks/consent/use-user-consent";
import apiClient from "@/lib/api/client";
import { consentClient } from "@/lib/api/services";
import { useAuthStore } from "@/store/use-auth-store";
import { useConsentStore } from "@/store/use-consent-store";

import { ConsentForm } from "./ConsentForm";
import { ConsentHistory } from "./ConsentHistory";

interface ConsentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: (consentId: string) => void;
}

export function ConsentModal({ open, setOpen, onSuccess }: ConsentModalProps) {
  const t = useTranslations("features.consent");
  const { user } = useAuthStore();
  const userId = user?.id;

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

  const {
    data: consentVersion,
    isLoading: isLoadingVersion,
    error: versionError,
  } = useConsentVersion({ enabled: open });

  const {
    data: userConsent,
    isLoading: isLoadingUserConsent,
    refetch: refetchUserConsent,
  } = useUserConsent({
    leadId: userId,
    enabled: open && !!userId,
  });

  const { data: dataCategories, isLoading: isLoadingCategories } =
    useDataCategories({
      consentPurposeId:
        consentVersion?.consent_versions?.[0]?.consent_purpose_id,
      enabled: open,
    });

  const { data: consentLogs, isLoading: isLoadingLogs } = useConsentLogs({
    leadId: userId,
    enabled: open && !!userId,
  });

  const { data: configIds, isLoading: isLoadingConfig } = useConfigIds({
    enabled: open,
  });

  useEffect(() => {
    const handleDataUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ consentData: any }>;
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
    if (open && userId) {
      refetchUserConsent();
    }
  }, [open, userId, refetchUserConsent]);

  useEffect(() => {
    if (
      consentLogs &&
      consentLogs.consent_logs &&
      consentLogs.consent_logs.length > 0
    ) {
      setActiveTab("history");
    } else {
      setActiveTab("form");
    }
  }, [consentLogs]);

  const handleGrantConsent = async () => {
    if (
      !userId ||
      !configIds?.consent_purpose_id ||
      !configIds?.controller_id ||
      !configIds?.processor_id
    ) {
      setError("Missing required configuration");
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const result = await consentClient.POST("/consent" as any, {
        body: {
          lead_id: userId,
          consent_purpose_id: configIds.consent_purpose_id,
          controller_id: configIds.controller_id,
          processor_id: configIds.processor_id,
          action: "grant",
        },
      });

      if (result.data?.id) {
        setConsentId(result.data.id);
        setConsentStatus("agreed");
        setConsentData({
          id: result.data.id,
          controller_id: configIds.controller_id || "",
          processor_id: configIds.processor_id || "",
          lead_id: userId || "",
          consent_version_id: consentVersion?.consent_versions?.[0]?.id || "",
          source: "web",
          action: "grant",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        onSuccess?.(result.data.id);
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

  const isLoading =
    isLoadingVersion ||
    isLoadingUserConsent ||
    isLoadingCategories ||
    isLoadingLogs ||
    isLoadingConfig;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("modal.title")}</DialogTitle>
          <DialogDescription>
            {activeTab === "form"
              ? t("form.description")
              : t("history.description")}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>{t("common.loading")}</span>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4">
            {consentData && (
              <Alert>
                <AlertTitle>{t("errors.existingConsent")}</AlertTitle>
                <AlertDescription>
                  {t("errors.existingConsentDesc")}
                </AlertDescription>
              </Alert>
            )}

            <div className="border-b">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`flex-1 border-b-2 pb-2 font-medium transition-colors ${
                    activeTab === "form"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("tabs.form")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 border-b-2 pb-2 font-medium transition-colors ${
                    activeTab === "history"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("tabs.history")}
                </button>
              </div>
            </div>

            {activeTab === "form" && (
              <ConsentForm
                consentVersion={consentVersion?.consent_versions?.[0]}
                dataCategories={dataCategories}
                onGrant={handleGrantConsent}
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
}

export default ConsentModal;
