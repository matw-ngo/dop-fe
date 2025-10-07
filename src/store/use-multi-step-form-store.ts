// Multi-step Form Store for Data-Driven UI system
// Manages global state across form steps using Zustand

import React from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { MultiStepFormState } from "@/types/data-driven-ui";

interface MultiStepFormStore extends MultiStepFormState {
  /** Get total number of steps */
  totalSteps: number;

  /** Set total number of steps */
  setTotalSteps: (total: number) => void;

  /** Go to next step */
  nextStep: () => void;

  /** Go to previous step */
  previousStep: () => void;

  /** Check if current step is the first */
  isFirstStep: () => boolean;

  /** Check if current step is the last */
  isLastStep: () => boolean;

  /** Get data for a specific step or field */
  getFieldValue: (fieldName: string) => any;
}

export const useMultiStepFormStore = create<MultiStepFormStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        currentStep: 0,
        formData: {},
        totalSteps: 1,

        // Actions
        setCurrentStep: (step: number) => {
          const { totalSteps } = get();
          if (step >= 0 && step < totalSteps) {
            set({ currentStep: step }, false, "setCurrentStep");
          }
        },

        updateFormData: (data: Record<string, any>) => {
          set(
            (state) => ({
              formData: { ...state.formData, ...data },
            }),
            false,
            "updateFormData",
          );
        },

        resetForm: () => {
          set({ currentStep: 0, formData: {} }, false, "resetForm");
        },

        setTotalSteps: (total: number) => {
          if (total > 0) {
            set({ totalSteps: total }, false, "setTotalSteps");
          }
        },

        nextStep: () => {
          const { currentStep, totalSteps } = get();
          if (currentStep < totalSteps - 1) {
            set({ currentStep: currentStep + 1 }, false, "nextStep");
          }
        },

        previousStep: () => {
          const { currentStep } = get();
          if (currentStep > 0) {
            set({ currentStep: currentStep - 1 }, false, "previousStep");
          }
        },

        isFirstStep: () => {
          return get().currentStep === 0;
        },

        isLastStep: () => {
          const { currentStep, totalSteps } = get();
          return currentStep === totalSteps - 1;
        },

        getFieldValue: (fieldName: string) => {
          return get().formData[fieldName];
        },
      }),
      {
        name: "multi-step-form-storage",
        // Optional: Only persist certain fields
        partialize: (state) => ({
          currentStep: state.currentStep,
          formData: state.formData,
          totalSteps: state.totalSteps,
        }),
      },
    ),
    {
      name: "MultiStepFormStore",
    },
  ),
);

/**
 * Hook to check if the store is hydrated (useful for SSR)
 */
export const useMultiStepFormHydrated = () => {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
};

// For convenience, export individual selectors
export const useCurrentStep = () =>
  useMultiStepFormStore((state) => state.currentStep);
export const useFormData = () =>
  useMultiStepFormStore((state) => state.formData);
export const useTotalSteps = () =>
  useMultiStepFormStore((state) => state.totalSteps);
