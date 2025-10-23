"use client";

import { useTranslations } from "next-intl";
import { MultiStepFormRenderer } from "@/components/renderer/MultiStepFormRenderer";
import { useOnboardingFormConfig } from "../hooks/use-onboarding-form-config";
import type { MappedFlow } from "@/mappers/flowMapper";
import { FormSkeleton } from "@/components/organisms/form-skeleton";
import { ErrorState } from "@/components/organisms/error-state";

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
  const tPage = useTranslations("pages.userOnboardingPage");
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
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {formConfig ? (
        <MultiStepFormRenderer config={formConfig} />
      ) : (
        <p>{tPage("noConfig")}</p>
      )}
    </div>
  );
}
