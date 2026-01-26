"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useConfigIds from "@/hooks/consent/use-config-ids";
import useConsentLogs from "@/hooks/consent/use-consent-logs";
import useConsentVersion from "@/hooks/consent/use-consent-version";
import useDataCategories from "@/hooks/consent/use-data-categories";
import useUserConsent from "@/hooks/consent/use-user-consent";
import apiClient from "@/lib/api/client";
import { useAuthStore } from "@/store/use-auth-store";
import {
  useConsentError,
  useConsentStore,
  useIsConsentValid,
} from "@/store/use-consent-store";

interface ConsentFormProps {
  consentPurposeId?: string;
}

export function ConsentForm({ consentPurposeId }: ConsentFormProps = {}) {
  const t = useTranslations("features.consent");
  const queryClient = useQueryClient();
  const consentStore = useConsentStore();

  const userId = useAuthStore((state) => state.user?.id);
  const isConsentValid = useIsConsentValid();
  const consentError = useConsentError();

  const { data: consentVersionData, isLoading: isLoadingVersion } =
    useConsentVersion({
      consentPurposeId,
    });

  const { data: dataCategories, isLoading: isLoadingCategories } =
    useDataCategories({
      consentPurposeId,
    });

  const { data: userConsent, isLoading: isLoadingUserConsent } = useUserConsent(
    {
      leadId: userId,
    },
  );

  const { data: configIds, isLoading: isLoadingConfig } = useConfigIds({});

  const { data: consentLogs } = useConsentLogs({
    leadId: userId,
  });

  const [agreedToAll, setAgreedToAll] = React.useState(false);

  const isLoading =
    isLoadingVersion ||
    isLoadingCategories ||
    isLoadingUserConsent ||
    isLoadingConfig;

  const latestVersion =
    consentVersionData?.consent_versions &&
    consentVersionData.consent_versions.length > 0
      ? consentVersionData.consent_versions[0]
      : null;

  const grantConsentMutation = useMutation({
    mutationFn: async () => {
      if (
        !userId ||
        !configIds?.controller_id ||
        !configIds?.processor_id ||
        !configIds?.consent_purpose_id ||
        !latestVersion?.id
      ) {
        throw new Error(t("errors.general"));
      }

      consentStore.clearError();

      const consentResponse = await apiClient.POST("/consent" as any, {
        body: {
          lead_id: userId,
          consent_purpose_id: configIds.consent_purpose_id,
          controller_id: configIds.controller_id,
          processor_id: configIds.processor_id,
          consent_version_id: latestVersion.id,
          action: "grant",
        },
      });

      if (!consentResponse.data?.id) {
        throw new Error(t("errors.consentFailed"));
      }

      const consentId = consentResponse.data.id;

      if (dataCategories && dataCategories.length > 0) {
        for (const category of dataCategories) {
          if (category.id) {
            await apiClient.POST("/consent-data-category" as any, {
              body: {
                consent_id: consentId,
                data_category_id: category.id,
              },
            });
          }
        }
      }

      await apiClient.POST("/consent-log" as any, {
        body: {
          consent_id: consentId,
          action: "grant",
          details: `User granted consent to version ${latestVersion.version}`,
        },
      });

      return consentResponse.data;
    },
    onSuccess: (data) => {
      consentStore.setConsentId(data.id);
      consentStore.setConsentStatus("agreed");
      consentStore.setConsentData({
        id: data.id,
        controller_id: data.controller_id || configIds?.controller_id || "",
        processor_id: data.processor_id || configIds?.processor_id || "",
        lead_id: data.lead_id || userId || "",
        consent_version_id: data.consent_version_id || "",
        source: data.source || "web-client",
        action: "grant",
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      });

      queryClient.invalidateQueries({
        queryKey: ["user-consent", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["consent-logs", userId],
      });
    },
    onError: (error: Error) => {
      consentStore.setError(error.message);
    },
  });

  const handleGrantConsent = () => {
    if (!agreedToAll || isConsentValid) {
      return;
    }

    grantConsentMutation.mutate();
  };

  const handleCheckboxChange = (checked: boolean) => {
    setAgreedToAll(checked);
    consentStore.clearError();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("form.title")}</DialogTitle>
        <DialogDescription>
          {t("form.consentVersion.label")}:{" "}
          {latestVersion?.version ? `v${latestVersion.version}` : "-"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {consentError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{consentError}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : latestVersion ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold">
                      {t("form.consentVersion.label")} v{latestVersion.version}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {latestVersion.effective_date
                        ? new Date(
                            latestVersion.effective_date,
                          ).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  {latestVersion.content && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-muted-foreground">
                        {latestVersion.content}
                      </p>
                    </div>
                  )}
                  {latestVersion.document_url && (
                    <a
                      href={latestVersion.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View full document →
                    </a>
                  )}
                </div>
              </div>
            </div>

            {dataCategories && dataCategories.length > 0 && (
              <div className="rounded-lg border bg-card p-4">
                <h4 className="mb-2 text-sm font-medium">
                  Data Categories ({dataCategories.length})
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {dataCategories.map((category) => (
                    <li key={category.id} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>
                        {category.name}
                        {category.description && ` - ${category.description}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
              <Checkbox
                id="agree-all"
                checked={agreedToAll}
                onCheckedChange={handleCheckboxChange}
                disabled={
                  isConsentValid || grantConsentMutation.isPending || isLoading
                }
                className="mt-1"
              />
              <label
                htmlFor="agree-all"
                className="flex-1 cursor-pointer text-sm font-medium"
              >
                {t("form.agreeAll.label")}
              </label>
            </div>

            <Button
              onClick={handleGrantConsent}
              disabled={
                !agreedToAll ||
                isConsentValid ||
                grantConsentMutation.isPending ||
                isLoading
              }
              className="w-full"
              loading={grantConsentMutation.isPending}
            >
              {grantConsentMutation.isPending
                ? t("form.grant.loading")
                : isConsentValid
                  ? "Consented"
                  : t("form.grant.button")}
            </Button>

            {isConsentValid && (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
                <p className="text-sm text-green-900 dark:text-green-100">
                  You have already consented to this version.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No consent version available.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default ConsentForm;
