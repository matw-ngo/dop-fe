"use client";

// Custom hook for managing multi-step form state
// Handles navigation, validation, and data persistence

import { useState, useCallback, useEffect } from "react";
import type {
  MultiStepFormConfig,
  MultiStepFormState,
  MultiStepFormActions,
  StepConfig,
} from "@/types/multi-step-form";

interface UseMultiStepFormReturn {
  state: MultiStepFormState;
  actions: MultiStepFormActions;
  currentStepConfig: StepConfig;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
}

export function useMultiStepForm(
  config: MultiStepFormConfig,
): UseMultiStepFormReturn {
  const {
    steps,
    initialStep = 0,
    persistData = false,
    persistKey = "multi-step-form-data",
    onStepComplete,
    onComplete,
    onStepChange,
  } = config;

  // Initialize state
  const [state, setState] = useState<MultiStepFormState>(() => {
    // Load persisted data if enabled
    let initialData = {};
    if (persistData && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          initialData = JSON.parse(saved);
        }
      } catch (error) {
        console.error("Failed to load persisted form data:", error);
      }
    }

    return {
      currentStep: initialStep,
      formData: initialData,
      stepValidation: {},
      completedSteps: new Set<number>(),
      isSubmitting: false,
    };
  });

  const currentStepConfig = steps[state.currentStep];
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === steps.length - 1;
  const progress = ((state.currentStep + 1) / steps.length) * 100;

  // Helper to filter out sensitive data before saving to localStorage
  const getDataForPersistence = useCallback((data: Record<string, any>) => {
    const filteredData = { ...data };

    // Remove eKYC data (sensitive and shouldn't be persisted)
    // eKYC fields typically end with 'Verification' or contain 'ekyc'
    Object.keys(filteredData).forEach((key) => {
      if (
        key.toLowerCase().includes("ekyc") ||
        (key.toLowerCase().includes("verification") &&
          typeof filteredData[key] === "object" &&
          filteredData[key]?.sessionId)
      ) {
        delete filteredData[key];
      }
    });

    return filteredData;
  }, []);

  // Save to localStorage when data changes (excluding sensitive data)
  useEffect(() => {
    if (persistData && typeof window !== "undefined") {
      try {
        const dataToSave = getDataForPersistence(state.formData);
        localStorage.setItem(persistKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to persist form data:", error);
      }
    }
  }, [state.formData, persistData, persistKey, getDataForPersistence]);

  // Update step data
  const updateStepData = useCallback((data: Record<string, any>) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...data,
      },
    }));
  }, []);

  // Navigate to next step
  const goToNextStep = useCallback(async (): Promise<boolean> => {
    if (isLastStep) {
      // Submit the form
      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onComplete?.(state.formData);

        // Mark last step as complete
        setState((prev) => ({
          ...prev,
          completedSteps: new Set([...prev.completedSteps, prev.currentStep]),
          isSubmitting: false,
        }));

        return true;
      } catch (error) {
        console.error("Form submission failed:", error);
        setState((prev) => ({ ...prev, isSubmitting: false }));
        return false;
      }
    }

    // Run step validation if provided
    if (currentStepConfig.stepValidation?.validate) {
      try {
        const result = await currentStepConfig.stepValidation.validate(
          state.formData,
        );
        if (result !== true) {
          console.error("Step validation failed:", result);
          return false;
        }
      } catch (error) {
        console.error("Step validation error:", error);
        return false;
      }
    }

    // Notify step completion
    await onStepComplete?.(currentStepConfig.id, state.formData);

    // Move to next step
    const nextStep = state.currentStep + 1;
    onStepChange?.(state.currentStep, nextStep);

    setState((prev) => ({
      ...prev,
      currentStep: nextStep,
      completedSteps: new Set([...prev.completedSteps, prev.currentStep]),
    }));

    return true;
  }, [
    isLastStep,
    currentStepConfig,
    state,
    onComplete,
    onStepComplete,
    onStepChange,
  ]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep && config.allowBackNavigation !== false) {
      const prevStep = state.currentStep - 1;
      onStepChange?.(state.currentStep, prevStep);

      setState((prev) => ({
        ...prev,
        currentStep: prevStep,
      }));
    }
  }, [
    isFirstStep,
    state.currentStep,
    config.allowBackNavigation,
    onStepChange,
  ]);

  // Jump to specific step
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        // Only allow jumping to completed steps or next immediate step
        if (
          state.completedSteps.has(stepIndex) ||
          stepIndex === state.currentStep + 1
        ) {
          onStepChange?.(state.currentStep, stepIndex);

          setState((prev) => ({
            ...prev,
            currentStep: stepIndex,
          }));
        }
      }
    },
    [steps.length, state.completedSteps, state.currentStep, onStepChange],
  );

  // Mark current step as complete
  const completeCurrentStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completedSteps: new Set([...prev.completedSteps, prev.currentStep]),
    }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    if (persistData && typeof window !== "undefined") {
      try {
        localStorage.removeItem(persistKey);
      } catch (error) {
        console.error("Failed to clear persisted form data:", error);
      }
    }

    setState({
      currentStep: initialStep,
      formData: {},
      stepValidation: {},
      completedSteps: new Set<number>(),
      isSubmitting: false,
    });
  }, [persistData, persistKey, initialStep]);

  // Save form data manually
  const saveFormData = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(persistKey, JSON.stringify(state.formData));
      } catch (error) {
        console.error("Failed to save form data:", error);
      }
    }
  }, [state.formData, persistKey]);

  // Load form data manually
  const loadFormData = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          const data = JSON.parse(saved);
          setState((prev) => ({
            ...prev,
            formData: data,
          }));
        }
      } catch (error) {
        console.error("Failed to load form data:", error);
      }
    }
  }, [persistKey]);

  const actions: MultiStepFormActions = {
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateStepData,
    completeCurrentStep,
    resetForm,
    saveFormData,
    loadFormData,
  };

  return {
    state,
    actions,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    progress,
  };
}
