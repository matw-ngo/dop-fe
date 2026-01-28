"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { StepWizard } from "@/components/form-generation";
import {
  FormThemeProvider,
  legacyLoanTheme,
} from "@/components/form-generation/themes";
import { finzoneConfig } from "@/configs/tenants/finzone";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useSubmitLeadInfo } from "@/hooks/features/lead/use-lead-submission";
import { useFlow } from "@/hooks/flow/use-flow";
import { buildFormConfigFromFlow } from "@/lib/builders/flow-form-builder";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import { FindingLoanScreen } from "./FindingLoanScreen";
import "@/lib/builders/register-flow-components";

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

  const { mutate: createLead, isPending: isCreatingLead } = useCreateLead();
  const { mutate: submitInfo, isPending: isSubmitting } = useSubmitLeadInfo();

  const [isFinding, setIsFinding] = useState(false);

  // Fetch flow configuration dynamically from tenant config
  const tenantId = finzoneConfig.uuid;
  const { data: flowData, isLoading: isFlowLoading } = useFlow(tenantId);

  // Build form config from flow data
  const dynamicFormConfig = useMemo(() => {
    if (!flowData) return null;
    return buildFormConfigFromFlow(flowData);
  }, [flowData]);

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
  const handleComplete = (data: Record<string, unknown>) => {
    console.log("Wizard completed:", data);
    setSubmittedData(data);

    // In a real application, flowId and stepId would come from the context or props
    const flowId = flowData?.id || "00000000-0000-0000-0000-000000000000";
    // Get the current step ID from the last step in the flow
    const stepId =
      flowData?.steps[flowData.steps.length - 1]?.id ||
      "00000000-0000-0000-0000-000000000000";

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

  // Render loading state while fetching flow
  if (isFlowLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Thông tin vay</h1>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-8 min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-muted-foreground">Đang tải cấu hình...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state if flow fails to load
  if (!flowData || !dynamicFormConfig) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Thông tin vay</h1>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-8 min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-destructive">Không thể tải cấu hình form</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
          >
            {t("finding_loan.retry")}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-8">
          <FormThemeProvider theme={legacyLoanTheme}>
            <StepWizard
              config={dynamicFormConfig}
              initialData={demoData ?? undefined}
              onComplete={handleComplete}
            />
          </FormThemeProvider>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{flowData.name}</h1>
            {flowData.description && (
              <p className="text-muted-foreground">{flowData.description}</p>
            )}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
