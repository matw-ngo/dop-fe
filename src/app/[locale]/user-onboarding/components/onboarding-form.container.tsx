"use client";

import { useFlow } from "@/hooks/useFlow";
import { OnboardingForm } from "./onboarding-form";

export function OnboardingFormContainer() {
  const { data, isLoading, isError, error, refetch } =
    useFlow("localhost:3000");

  return (
    <OnboardingForm
      flowData={data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      refetch={refetch}
    />
  );
}
