import { useMemo } from "react";
import type { FlowPage } from "@/constants/flow-pages";
import { useFlow } from "@/hooks/flow/use-flow";

export function useDynamicLoanStepContext(input: {
  tenantId: string;
  page: FlowPage | string;
}) {
  const { data: flowData, isLoading: isLoadingFlow } = useFlow(input.tenantId);

  const indexStep = useMemo(() => {
    if (!flowData?.steps) return null;

    const normalizePage = (value: string) =>
      value.startsWith("/") ? value : `/${value}`;
    const normalizedPage = normalizePage(input.page);

    const matchingStep = flowData.steps.find(
      (step) =>
        normalizePage(step.page) === normalizedPage ||
        (normalizedPage === "/index" && normalizePage(step.page) === "/"),
    );

    return (
      matchingStep || (normalizedPage === "/index" ? flowData.steps[0] : null)
    );
  }, [flowData, input.page]);

  const stepContext = useMemo(() => {
    if (!flowData?.steps || !indexStep) return null;

    const currentStepIndex = flowData.steps.findIndex(
      (s) => s.id === indexStep.id,
    );

    return {
      currentStepIndex: currentStepIndex >= 0 ? currentStepIndex : 0,
      totalSteps: flowData.steps.length,
    };
  }, [flowData, indexStep]);

  const isFirstStep = useMemo(() => {
    if (!flowData?.steps || !indexStep) return false;
    return flowData.steps.findIndex((s) => s.id === indexStep.id) === 0;
  }, [flowData, indexStep]);

  return {
    flowData,
    isLoadingFlow,
    indexStep,
    stepContext,
    isFirstStep,
  };
}
