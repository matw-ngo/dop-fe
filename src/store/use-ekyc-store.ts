import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EkycFullResult,
  OnboardingFormData,
  mapEkycToFormData,
  isEkycResultValid,
} from "@/lib/ekyc/ekyc-data-mapper";

interface EkycState {
  // Status
  status: "idle" | "running" | "success" | "error";

  // Raw eKYC result from SDK
  rawResult: EkycFullResult | null;

  // Mapped form data (ready to use in form)
  formData: Partial<OnboardingFormData> | null;

  // Error message
  error: string | null;

  // Timestamp of completion
  completedAt: string | null;

  // Actions
  start: () => void;
  setResult: (result: EkycFullResult) => void;
  setError: (error: string) => void;
  reset: () => void;

  // Getters
  isValid: () => boolean;
}

export const useEkycStore = create<EkycState>()(
  persist(
    (set, get) => ({
      status: "idle",
      rawResult: null,
      formData: null,
      error: null,
      completedAt: null,

      start: () => {
        console.log("[eKYC Store] Starting eKYC process...");
        set({
          status: "running",
          rawResult: null,
          formData: null,
          error: null,
          completedAt: null,
        });
      },

      setResult: (result: EkycFullResult) => {
        console.log("[eKYC Store] Received result:", result);

        // Validate result
        const valid = isEkycResultValid(result);

        if (!valid) {
          console.error("[eKYC Store] Invalid eKYC result");
          set({
            status: "error",
            error: "Invalid eKYC result",
            rawResult: result,
            formData: null,
            completedAt: null,
          });
          return;
        }

        // Map to form data
        const mapped = mapEkycToFormData(result);
        console.log("[eKYC Store] Mapped form data:", mapped);

        set({
          status: "success",
          rawResult: result,
          formData: mapped,
          error: null,
          completedAt: new Date().toISOString(),
        });

        // Dispatch custom event for components to listen
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ekyc:completed", {
              detail: {
                result,
                formData: mapped,
                completedAt: new Date().toISOString(),
              },
            }),
          );
        }
      },

      setError: (error: string) => {
        console.error("[eKYC Store] Error:", error);
        set({
          status: "error",
          error,
          rawResult: null,
          formData: null,
          completedAt: null,
        });
      },

      reset: () => {
        console.log("[eKYC Store] Resetting store...");
        set({
          status: "idle",
          rawResult: null,
          formData: null,
          error: null,
          completedAt: null,
        });
      },

      isValid: () => {
        const state = get();
        return state.status === "success" && state.rawResult !== null;
      },
    }),
    {
      name: "ekyc-storage",
      // Only persist result, not status (so it doesn't auto-show as completed on reload)
      partialize: (state) => ({
        rawResult: state.rawResult,
        formData: state.formData,
        completedAt: state.completedAt,
      }),
    },
  ),
);
