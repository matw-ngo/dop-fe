"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useOnboardingFormStore } from "@/store/use-onboarding-form-store";
import { useFlow } from "@/hooks/useFlow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { MultiStepFormRenderer } from "@/components/renderer/MultiStepFormRenderer";
import { useOnboardingFormConfig } from "../hooks/use-onboarding-form-config";

export function OnboardingForm() {
  const t = useTranslations("pages.userOnboardingPage");
  const {
    data: flowData,
    isLoading,
    isError,
    error,
  } = useFlow("localhost:3000");

  const formConfig = useOnboardingFormConfig(flowData, t);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-lg">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {t("loadError", { message: error?.message })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {formConfig ? (
        <MultiStepFormRenderer config={formConfig} />
      ) : (
        <p>{t("noConfig")}</p>
      )}
    </div>
  );
}
