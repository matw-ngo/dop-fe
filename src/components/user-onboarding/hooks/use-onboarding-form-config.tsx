"use client";

import { useMemo } from "react";
import type { MultiStepFormConfig } from "@/components/renderer/types/multi-step-form";
import type { MappedFlow } from "@/mappers/flowMapper";
import { useFieldBuilders } from "./use-field-builders";
import {
  useFormCreation,
  useFormCreationWithOptions,
  useFormMetadata,
  useFormValidation,
} from "./use-form-creation";
import { useStepConfig } from "./use-step-config";

/**
 * Main hook for creating onboarding form configuration
 *
 * This hook orchestrates the creation of a multi-step form configuration
 * based on flow data from the API. It uses field builders, step configuration,
 * and form creation utilities to generate the complete form setup.
 *
 * @param flowData - Mapped flow data from API containing steps and field configurations
 * @param t - Translation function for internationalization
 * @returns Multi-step form configuration or undefined if flow data is invalid
 */
export function useOnboardingFormConfig(
  flowData: MappedFlow | undefined,
  t: (key: string) => string,
): MultiStepFormConfig | undefined {
  // Initialize field builders with translations
  const fieldBuilderMap = useFieldBuilders(t);

  // Generate step configurations from flow data
  const steps = useStepConfig(flowData, fieldBuilderMap, t);

  // Create the complete multi-step form configuration
  const formConfig = useFormCreation(flowData, steps);

  // Memoize the result to prevent unnecessary re-renders
  return useMemo(() => formConfig, [formConfig]);
}

/**
 * Extended hook with additional form options
 *
 * Use this hook when you need more control over form behavior,
 * such as custom submission handlers, step change callbacks,
 * or different storage configurations.
 *
 * @param flowData - Mapped flow data from API
 * @param t - Translation function
 * @param options - Additional form configuration options
 * @returns Enhanced multi-step form configuration
 */
export function useOnboardingFormConfigWithOptions(
  flowData: MappedFlow | undefined,
  t: (key: string) => string,
  options: {
    storageKey?: string;
    formVariant?: "onboarding" | "application" | "verification";
    animation?: "slide" | "fade" | "scale";
    initialStep?: number;
    onSubmit?: (data: any) => void | Promise<void>;
    onStepChange?: (stepIndex: number, stepData: any) => void;
    onFieldChange?: (fieldName: string, value: any, allData: any) => void;
  } = {},
): MultiStepFormConfig | undefined {
  // Initialize field builders
  const fieldBuilderMap = useFieldBuilders(t);

  // Generate step configurations
  const steps = useStepConfig(flowData, fieldBuilderMap, t);

  // Create form with custom options
  const formConfig = useFormCreationWithOptions(flowData, steps, options);

  return useMemo(() => formConfig, [formConfig]);
}

/**
 * Hook to get form metadata and validation
 *
 * Provides additional information about the form such as
 * title, description, version, and validation status.
 *
 * @param flowData - Mapped flow data from API
 * @param t - Translation function
 * @returns Form metadata and validation information
 */
export function useOnboardingFormInfo(
  flowData: MappedFlow | undefined,
  t: (key: string) => string,
) {
  const fieldBuilderMap = useFieldBuilders(t);
  const steps = useStepConfig(flowData, fieldBuilderMap, t);

  const metadata = useFormMetadata(flowData);
  const validation = useFormValidation(flowData, steps);

  return useMemo(
    () => ({
      metadata,
      validation,
      stepCount: steps.length,
      hasFields: steps.some((step) => step.fields.length > 0),
    }),
    [metadata, validation, steps],
  );
}
