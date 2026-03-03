"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
import { DynamicLoanForm } from "@/components/loan-application/DynamicLoanForm";
import { useConsentPurpose } from "@/hooks/consent/use-consent-purpose";
import { useConsentSession } from "@/hooks/consent/use-consent-session";
import { useUserConsent } from "@/hooks/consent/use-user-consent";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useSubmitLeadInfo } from "@/hooks/features/lead/use-lead-submission";
import { useFlowStep } from "@/hooks/tenant/use-flow-step";
import { useTenant } from "@/hooks/tenant/use-tenant";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import { useConsentStore } from "@/store/use-consent-store";
import { FindingLoanScreen } from "./FindingLoanScreen";

export default function LoanInfoPage() {
  const t = useTranslations("pages.form");
  const searchParams = useSearchParams();
  const tenant = useTenant();
  const sessionId = useConsentSession();
  const openConsentModal = useConsentStore((s) => s.openConsentModal);

  // Lead state from V1 API or URL params
  const [leadId, setLeadId] = useState<string | null>(
    searchParams.get("leadId"),
  );
  const [_leadToken, setLeadToken] = useState<string | null>(
    searchParams.get("token"),
  );
  const [submittedData, setSubmittedData] = useState<Record<
    string,
    unknown
  > | null>(null);

  // Demo data state for loading demo scenarios
  const [demoData, setDemoData] = useState<Record<string, unknown> | null>(
    null,
  );

  const { mutate: createLead } = useCreateLead();
  const { mutate: submitInfo } = useSubmitLeadInfo();

  const [isFinding, setIsFinding] = useState(false);

  const submitInfoStep = useFlowStep("/submit-info");
  const consentPurposeId = submitInfoStep?.consent_purpose_id;
  const { data: consentPurposeData } = useConsentPurpose({
    consentPurposeId,
    enabled: !!consentPurposeId,
  });
  const { data: userConsent } = useUserConsent({
    sessionId: sessionId || undefined,
    enabled: !!sessionId,
  });

  const { hasConsent, isConsentValid } = useConsentStore();

  useEffect(() => {
    // Skip consent check if user already has valid consent in store
    if (hasConsent() && isConsentValid()) {
      console.log(
        "[LoanInfoPage] User already has valid consent, skipping modal",
      );
      return;
    }

    if (!sessionId || !consentPurposeId) {
      return;
    }

    const latestVersionId = consentPurposeData?.latest_version_id;
    if (!latestVersionId) {
      return;
    }

    const userVersionId = userConsent?.consent_version_id;
    const hasConsented = userConsent?.action === "grant";
    const shouldShowModal =
      !userVersionId || userVersionId !== latestVersionId || !hasConsented;

    if (shouldShowModal) {
      console.log("[LoanInfoPage] Opening consent modal", {
        reason: !userVersionId
          ? "no_consent"
          : userVersionId !== latestVersionId
            ? "outdated_version"
            : "not_granted",
      });
      openConsentModal({ consentPurposeId });
    }
  }, [
    sessionId,
    consentPurposeId,
    consentPurposeData,
    userConsent,
    openConsentModal,
    hasConsent,
    isConsentValid,
  ]);

  /**
   * Handles loading demo data into the form
   */
  const _handleLoadDemo = (
    demoId: string,
    formData: Record<string, unknown>,
  ) => {
    console.log("Loading demo scenario:", demoId);
    console.log("Demo data:", formData);
    setDemoData(formData);
  };

  /**
   * Handles wizard completion.
   */
  const handleComplete = (
    data: Record<string, unknown>,
    context?: { flowId: string; stepId: string },
  ) => {
    console.log("Wizard completed:", data);
    setSubmittedData(data);

    const flowId = context?.flowId || "00000000-0000-0000-0000-000000000000";
    const stepId = context?.stepId || "00000000-0000-0000-0000-000000000000";

    const apiPayload = mapFormDataToLeadInfo(data, flowId, stepId);

    console.log("Mapped Payload:", apiPayload);

    if (leadId) {
      console.log("Using existing leadId:", leadId);
      setIsFinding(true);

      submitInfo(
        { leadId, data: apiPayload },
        {
          onSuccess: () => console.log("Lead info submitted successfully"),
          onError: (e) => console.error("Submit info error:", e),
        },
      );
      return;
    }

    createLead(
      {
        flowId,
        tenant: tenant.uuid,
        deviceInfo: {},
        trackingParams: {},
        info: apiPayload,
      },
      {
        onSuccess: (leadData) => {
          console.log("Lead created successfully:", leadData);
          setLeadId(leadData.id);
          setLeadToken(leadData.token);
          setIsFinding(true);
        },
        onError: (error) => {
          console.error("Failed to create lead:", error);
        },
      },
    );
  };

  const handleFindingFinish = () => {
    setIsFinding(false);
  };

  // Render logic
  const renderContent = () => {
    if (isFinding) {
      return (
        <div
          className="rounded-lg border p-8 min-h-[400px] flex items-center justify-center"
          style={{
            backgroundColor: tenant.theme.colors.background,
            borderColor: tenant.theme.colors.border,
            boxShadow: "0 10px 40px rgba(1, 120, 72, 0.08)",
          }}
        >
          <FindingLoanScreen onFinish={handleFindingFinish} />
        </div>
      );
    }

    if (submittedData) {
      return (
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: tenant.theme.colors.readOnly,
            borderColor: tenant.theme.colors.border,
          }}
        >
          <h3
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ color: tenant.theme.colors.primary }}
          >
            <span className="text-2xl">✅</span>{" "}
            {t("finding_loan.success_title")}
          </h3>
          <p
            className="mb-4"
            style={{ color: tenant.theme.colors.textPrimary }}
          >
            {t("finding_loan.success_desc")}
          </p>
          <div
            className="p-4 rounded border font-mono text-xs overflow-auto max-h-96"
            style={{
              backgroundColor: tenant.theme.colors.background,
              borderColor: tenant.theme.colors.border,
              color: tenant.theme.colors.textPrimary,
            }}
          >
            {JSON.stringify(submittedData, null, 2)}
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmittedData(null);
              setIsFinding(false);
            }}
            className="mt-4 px-4 py-2 rounded transition-opacity hover:opacity-90"
            style={{
              backgroundColor: tenant.theme.colors.primary,
              color: "#ffffff",
            }}
          >
            {t("actions.back_to_form")}
          </button>
        </div>
      );
    }

    return (
      <div
        className="rounded-lg border p-8"
        style={{
          backgroundColor: tenant.theme.colors.background,
          borderColor: tenant.theme.colors.border,
          boxShadow: "0 10px 40px rgba(1, 120, 72, 0.08)",
        }}
      >
        <DynamicLoanForm
          page="/submit-info"
          initialData={demoData || undefined}
          onSubmitSuccess={handleComplete}
        />
      </div>
    );
  };

  return (
    <TenantThemeProvider>
      <div
        className="min-h-screen p-8"
        style={{ backgroundColor: tenant.theme.colors.readOnly }}
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="space-y-2">
              <h1
                className="text-4xl font-bold"
                style={{ color: tenant.theme.colors.textPrimary }}
              >
                Thông tin vay
              </h1>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </TenantThemeProvider>
  );
}
