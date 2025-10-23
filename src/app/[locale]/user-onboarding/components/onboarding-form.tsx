"use client";

import { useTranslations } from "next-intl";
import { Loader2, RotateCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { MultiStepFormRenderer } from "@/components/renderer/MultiStepFormRenderer";
import { useOnboardingFormConfig } from "../hooks/use-onboarding-form-config";
import type { MappedFlow } from "@/mappers/flowMapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
  const t = useTranslations("pages.userOnboardingPage");
  const tCommon = useTranslations("common");
  const formConfig = useOnboardingFormConfig(flowData, t);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
        <div className="flex justify-end pt-4">
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-lg">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>{tCommon("error")}</AlertTitle>
          <AlertDescription>
            {t("loadError", { message: error?.message || "Unknown error" })}
          </AlertDescription>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => refetch()}>
              <RotateCw className="mr-2 h-4 w-4" />
              {tCommon("retry")}
            </Button>
          </div>
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
