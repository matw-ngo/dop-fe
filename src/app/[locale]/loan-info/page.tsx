"use client";

import { useState } from "react";
import { StepWizard } from "@/components/form-generation";
import {
  FormThemeProvider,
  legacyLoanTheme,
} from "@/components/form-generation/themes";
import { FindingLoanScreen } from "./FindingLoanScreen";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useSubmitLeadInfo } from "@/hooks/features/lead/use-lead-submission";
import { mapFormDataToLeadInfo } from "@/mappers/leadMapper";
import { loanFormWizardConfig } from "@/configs/forms/loan-form-config";
import { DemoLoader } from "./components/DemoLoader";

export default function LoanInfoPage() {
  const t = useTranslations("pages.form");
  const searchParams = useSearchParams();

  // Lead state from V1 API or URL params
  const [leadId, setLeadId] = useState<string | null>(
    searchParams.get("leadId"),
  );
  const [leadToken, setLeadToken] = useState<string | null>(
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

  /**
   * Handles loading demo data into the form
   *
   * @param demoId - The ID of the selected demo scenario
   * @param formData - The form data to load into the wizard
   */
  const handleLoadDemo = (
    demoId: string,
    formData: Record<string, unknown>,
  ) => {
    console.log("Loading demo scenario:", demoId);
    console.log("Demo data:", formData);
    setDemoData(formData);
    // Note: The wizard will re-render with the new demoData as initialData
  };

  /**
   * Handles wizard completion.
   *
   * Flow:
   * 1. Create lead via POST /leads (if not already created)
   * 2. Store leadId and token from response
   * 3. Show finding loan screen
   * 4. Submit lead info via POST /leads/{id}/submit-info
   *
   * @remarks
   * Lead creation timing: Called at the END of wizard completion.
   * Alternative: You can call createLead earlier (e.g., after step 1 or 2) to capture leads sooner.
   * If you change the timing, update the JSDoc in both this function and `use-create-lead.ts`.
   */
  const handleComplete = (data: Record<string, unknown>) => {
    console.log("Wizard completed:", data);
    setSubmittedData(data);

    // MAPPING DATA
    // In a real application, flowId and stepId would come from the context or props
    const flowId = "00000000-0000-0000-0000-000000000000";
    const stepId = "00000000-0000-0000-0000-000000000000";

    const apiPayload = mapFormDataToLeadInfo(data, flowId, stepId);

    console.log("Mapped Payload:", apiPayload);

    // If we already have a leadId (e.g. from previous step/URL), use it directly
    if (leadId) {
      console.log("Using existing leadId:", leadId);
      setIsFinding(true);

      // Submit info for the existing lead
      submitInfo(
        { leadId, data: apiPayload },
        {
          onSuccess: () => console.log("Lead info submitted successfully"),
          onError: (e) => console.error("Submit info error:", e),
        },
      );
      return;
    }

    // Otherwise, create a new lead
    createLead(
      {
        flowId,
        // FIXME: Hard-coded tenantId - should be replaced with dynamic tenant lookup
        tenant: "11111111-1111-1111-1111-111111111111",
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

          // Submit additional info if needed logic can go here
        },
        onError: (error) => {
          console.error("Failed to create lead:", error);
          // TODO: Show error
        },
      },
    );
  };

  const handleFindingFinish = () => {
    setIsFinding(false);
    // Here we stay on the page showing results (submittedData is already set)
    // Or we could scroll to results.
    // Logic:
    // If finding, show FindingScreen.
    // If submittedData & !finding, show Results.
    // If neither, show Form.
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
        {/* Demo Loader - Only visible when no submitted data and not finding */}
        {/* {!isFinding && !submittedData && (
          <DemoLoader onLoadDemo={handleLoadDemo} />
        )} */}

        <div className="rounded-lg border bg-card p-8">
          <FormThemeProvider theme={legacyLoanTheme}>
            <StepWizard
              config={loanFormWizardConfig}
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
            <h1 className="text-4xl font-bold">Thông tin vay</h1>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
