"use client";

import { useFlow } from "@/hooks/flow/use-flow";
import { OnboardingForm } from "./onboarding-form";

interface OnboardingFormContainerProps {
  domain?: string;
}

export function OnboardingFormContainer({
  domain,
}: OnboardingFormContainerProps) {
  const flowDomain =
    domain ?? process.env.NEXT_PUBLIC_FLOW_DOMAIN ?? "localhost:3000";
  const { data, isLoading, isError, error, refetch } = useFlow(flowDomain);
  console.log("data", data);
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
