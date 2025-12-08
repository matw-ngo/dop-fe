import { useMemo } from "react";
import { multiStepForm } from "@/components/renderer/builders/multi-step-form-builder";
import type { MappedFlow } from "@/mappers/flowMapper";
import type { MultiStepFormConfig } from "@/components/renderer/types/multi-step-form";
import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";

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
 * Hook to create the multi-step form configuration
 *
 * @param flowData - Mapped flow data from API
 * @param steps - Generated step configurations
 * @param onSubmit - Form submission handler
 * @returns Complete multi-step form configuration
 */
export function useFormCreation(
  flowData: MappedFlow | undefined,
  steps: GeneratedStepConfig[],
  onSubmit?: (data: any) => void | Promise<void>,
): MultiStepFormConfig | undefined {
  return useMemo(() => {
    if (!flowData || !steps.length) return undefined;

    // Create the multi-step form builder
    const builder = multiStepForm();

    // Add all steps to the form
    steps.forEach((step) => {
      builder.addStep(step.id, step.title, step.fields, {
        description: step.description,
      });
    });

    // Configure form behavior
    const formConfig = builder
      .setInitialStep(0)
      .allowBackNavigation(true)
      .showProgress(true)
      .setProgressStyle("steps")
      .persistData(true, "user-onboarding-data")
      .onComplete(onSubmit || (() => {}))
      .setFormVariant({
        size: "md",
        color: "primary",
        variant: "onboarding",
      })
      .setStepTransitionAnimation({
        type: "slide",
        direction: "right",
        duration: 300,
      })
      .build();

    return formConfig;
  }, [flowData, steps, onSubmit]);
}

/**
 * Hook to create form with custom configuration
 *
 * @param flowData - Mapped flow data
 * @param steps - Generated step configurations
 * @param options - Additional form configuration options
 * @returns Complete multi-step form configuration
 */
export function useFormCreationWithOptions(
  flowData: MappedFlow | undefined,
  steps: GeneratedStepConfig[],
  options: {
    storageKey?: string;
    formVariant?: "onboarding" | "application" | "verification";
    animation?: "slide" | "fade" | "scale";
    initialStep?: number;
    onSubmit?: (data: any) => void | Promise<void>;
    onStepChange?: (fromStep: number, toStep: number) => void;
  } = {},
): MultiStepFormConfig | undefined {
  return useMemo(() => {
    if (!flowData || !steps.length) return undefined;

    const builder = multiStepForm();

    // Add all steps with enhanced configuration
    steps.forEach((step) => {
      builder.addStep(step.id, step.title, step.fields, {
        description: step.description,
      });
    });

    // Configure animation type
    const animationConfig =
      options.animation === "fade"
        ? { type: "fade", duration: 300 }
        : options.animation === "scale"
          ? { type: "scale", duration: 200 }
          : { type: "slide", direction: "right", duration: 300 };

    // Build form with custom options
    const formConfig = builder
      .setInitialStep(options.initialStep || 0)
      .allowBackNavigation(true)
      .showProgress(true)
      .setProgressStyle("steps")
      .persistData(true, options.storageKey || "user-onboarding-data")
      .onComplete(options.onSubmit || (() => {}))
      .onStepChange(options.onStepChange || (() => {}))
      .setFormVariant({
        size: "md",
        color: "primary",
        variant: options.formVariant || "onboarding",
      })
      .setStepTransitionAnimation(animationConfig)
      .build();

    return formConfig;
  }, [flowData, steps, options]);
}

/**
 * Hook to get form metadata
 *
 * @param flowData - Mapped flow data
 * @returns Form metadata object
 */
export function useFormMetadata(flowData: MappedFlow | undefined) {
  return useMemo(() => {
    if (!flowData) return null;

    return {
      id: flowData.id,
      title: flowData.name, // MappedFlow uses 'name' not 'title'
      description: flowData.description,
      version: "1.0.0", // Default version since it's not in MappedFlow
      createdAt: flowData.createdAt || new Date(),
      updatedAt: flowData.updatedAt || new Date(),
    };
  }, [flowData]);
}

/**
 * Hook to check if form configuration is valid
 *
 * @param flowData - Mapped flow data
 * @param steps - Generated step configurations
 * @returns Validation result with errors
 */
export function useFormValidation(
  flowData: MappedFlow | undefined,
  steps: GeneratedStepConfig[],
): { isValid: boolean; errors: string[] } {
  return useMemo(() => {
    const errors: string[] = [];

    if (!flowData) {
      errors.push("Flow data is required");
    } else {
      if (!flowData.id) errors.push("Flow must have an ID");
      if (!flowData.name) errors.push("Flow must have a name");
      if (!Array.isArray(flowData.steps))
        errors.push("Flow must have steps array");
    }

    if (!steps.length) {
      errors.push("At least one step is required");
    } else {
      steps.forEach((step, index) => {
        if (!step.id) errors.push(`Step ${index + 1} must have an ID`);
        if (!step.title) errors.push(`Step ${index + 1} must have a title`);
        if (!Array.isArray(step.fields))
          errors.push(`Step ${index + 1} must have fields array`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [flowData, steps]);
}
