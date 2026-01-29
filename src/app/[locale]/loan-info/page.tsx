"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  FormThemeProvider,
  legacyLoanTheme,
} from "@/components/form-generation/themes";
import { DynamicLoanForm } from "@/components/loan-application/DynamicLoanForm";
import { finzoneConfig } from "@/configs/tenants/finzone";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useSubmitLeadInfo } from "@/hooks/features/lead/use-lead-submission";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import { FindingLoanScreen } from "./FindingLoanScreen";

export default function LoanInfoPage() {
  const t = useTranslations("pages.form");
  const searchParams = useSearchParams();

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

  const tenantId = finzoneConfig.uuid;

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
        tenant: tenantId,
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
        <div className="rounded-lg border bg-card p-8 min-h-[400px] flex items-center justify-center">
          <FormThemeProvider theme={legacyLoanTheme}>
            <FindingLoanScreen onFinish={handleFindingFinish} />
          </FormThemeProvider>
        </div>
      );
    }

    if (submittedData) {
      return (
        <div className="rounded-lg border bg-muted p-6">
          <h3 className="font-semibold mb-4 text-green-700 flex items-center gap-2">
            <span className="text-2xl">✅</span>{" "}
            {t("finding_loan.success_title")}
          </h3>
          <p className="mb-4">{t("finding_loan.success_desc")}</p>
          <div className="bg-white p-4 rounded border font-mono text-xs overflow-auto max-h-96">
            {JSON.stringify(submittedData, null, 2)}
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmittedData(null);
              setIsFinding(false);
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            {t("actions.back_to_form")}
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card p-8">
        <DynamicLoanForm
          page="/submit-info"
          initialData={demoData || undefined}
          onSubmitSuccess={handleComplete}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Thông tin vay</h1>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
