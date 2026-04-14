"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/feedback/error-state";
import { FormSkeleton } from "@/components/feedback/form-skeleton";
import { MultiStepFormRenderer } from "@/components/renderer/MultiStepFormRenderer";
import type { MappedFlow } from "@/mappers/flowMapper";
import { registerConsentField } from "../fields/register-consent-field";
import { useOnboardingFormConfig } from "../hooks/use-onboarding-form-config";

// Register consent field component
registerConsentField();

// import { LoanApplicationForm } from "@/components/features/loan/LoanApplicationForm"; // TODO: Implement LoanApplicationForm component

interface OnboardingFormProps {
  flowData: MappedFlow | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function OnboardingForm({
  flowData,
  isLoading,
  isError,
  error,
  refetch,
}: OnboardingFormProps) {
  const tPage = useTranslations("pages.onboarding");
  const tError = useTranslations("components.errorState");
  const tCommon = useTranslations("common");
  const formConfig = useOnboardingFormConfig(flowData, tPage);

  if (isLoading) {
    return <FormSkeleton fields={["input", "input", "select", "input"]} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={tPage("loadErrorTitle")}
        message={error?.message || "An unknown error occurred."}
        onRetry={refetch}
        t={(key) => tError(key) || tCommon(key)}
      />
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border">
      {formConfig ? (
        <>
          {/* Check if this is a loan application flow */}
          {flowData?.name?.toLowerCase().includes("vay") ||
          flowData?.name?.toLowerCase().includes("loan") ? (
            // TODO: Implement LoanApplicationForm component
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">
                Loan application form is not yet implemented.
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                Please use the general form for now.
              </p>
              <MultiStepFormRenderer config={formConfig} />
            </div>
          ) : (
            <MultiStepFormRenderer config={formConfig} />
          )}
        </>
      ) : (
        <p>{tPage("noConfig")}</p>
      )}
    </div>
  );
}
