import { CheckCircle } from "lucide-react";
import { useMemo } from "react";
import { createConfirmationField } from "@/components/renderer/builders/field-builder";
import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";
import type { MappedFlow, MappedStep } from "@/mappers/flowMapper";
import { FIELD_VARIANTS, LAYOUT_CONFIG } from "../constants/ui-themes";
import { generateFieldsForStep, sortFields } from "../utils/field-generation";
import { getStepMetadata, getStepNavigation } from "../utils/step-helpers";

interface GeneratedStepConfig {
  id: string;
  title: string;
  description?: string;
  icon?: any;
  fields: RawFieldConfig[];
  validation?: any;
  navigation?: any;
}

/**
 * Hook to generate step configurations
 *
 * @param flowData - Mapped flow data from API
 * @param fieldBuilderMap - Map of field builders
 * @param t - Translation function
 * @returns Array of generated step configurations
 */
export function useStepConfig(
  flowData: MappedFlow | undefined,
  fieldBuilderMap: Record<string, (config?: any) => RawFieldConfig>,
  t: (key: string) => string,
): GeneratedStepConfig[] {
  return useMemo(() => {
    if (!flowData?.steps) return [];

    const steps: GeneratedStepConfig[] = [];
    const totalSteps = flowData.steps.length;

    // Generate configuration for each step in the flow
    flowData.steps.forEach((step, index) => {
      const fields = generateFieldsForStep(step, fieldBuilderMap);
      const sortedFields = sortFields(fields);
      const metadata = getStepMetadata(step, t);
      const navigation = getStepNavigation(step, t, totalSteps, index);

      // Only include step if it has fields OR if it's a special step (eKYC, OTP)
      const hasFields = sortedFields.length > 0;
      const isSpecialStep = step.useEkyc || step.sendOtp;

      if (hasFields || isSpecialStep) {
        const stepConfig: GeneratedStepConfig = {
          id: step.id,
          title: metadata.title,
          description: metadata.description,
          icon: metadata.icon,
          fields: sortedFields,
          validation: {
            validateAll: true,
          },
          navigation: {
            nextText: navigation.nextText,
            previousText: navigation.previousText,
            showSkip: navigation.showSkip,
          },
        };

        steps.push(stepConfig);
      }
    });

    // Add confirmation step
    const confirmationStep = createConfirmationStep(t, steps.length);
    steps.push(confirmationStep);

    return steps;
  }, [flowData, fieldBuilderMap, t]);
}

/**
 * Create the confirmation step configuration
 */
function createConfirmationStep(
  t: (key: string) => string,
  _stepIndex: number,
): GeneratedStepConfig {
  const confirmationField = createConfirmationField("confirmation", {
    leftIcon: CheckCircle,
    variant: FIELD_VARIANTS.LARGE,
    layout: LAYOUT_CONFIG.SPACIOUS,
    className: "col-span-1 lg:col-span-4",
    confirmationType: "success",
    message: t("confirmation.message"),
  });

  return {
    id: "confirmation",
    title: t("confirmation.title"),
    description: t("confirmation.description"),
    icon: CheckCircle,
    fields: [confirmationField],
    navigation: {
      nextText: t("confirmation.submitButton"),
      showSkip: false,
    },
  };
}

/**
 * Hook to get step metadata for a specific step
 *
 * @param step - Mapped step data
 * @param t - Translation function
 * @returns Step metadata
 */
export function useStepMetadata(step: MappedStep, t: (key: string) => string) {
  return useMemo(() => {
    return getStepMetadata(step, t);
  }, [step, t]);
}

/**
 * Hook to get total estimated time for all steps
 *
 * @param flowData - Mapped flow data
 * @returns Total estimated time in seconds
 */
export function useEstimatedTime(flowData: MappedFlow | undefined): number {
  return useMemo(() => {
    if (!flowData?.steps) return 0;

    return flowData.steps.reduce((total, step) => {
      const visibleFields = Object.values(step.fields).filter((f) => f.visible);
      return total + visibleFields.length * 15; // 15 seconds per field
    }, 0);
  }, [flowData]);
}

/**
 * Hook to check if all steps are valid
 *
 * @param flowData - Mapped flow data
 * @returns Whether all steps have valid configuration
 */
export function useStepValidation(flowData: MappedFlow | undefined): boolean {
  return useMemo(() => {
    if (!flowData?.steps) return false;

    return flowData.steps.every((step) => {
      return (
        step.id &&
        step.page &&
        step.fields &&
        Object.keys(step.fields).length > 0
      );
    });
  }, [flowData]);
}
