/**
 * Hook to auto-fill form fields from eKYC result
 *
 * Usage:
 * ```tsx
 * const { formData, isReady, ekycResult } = useEkycAutofill();
 *
 * // In your form:
 * useEffect(() => {
 *   if (isReady && formData) {
 *     // Fill form with eKYC data
 *     form.setValue('fullName', formData.fullName);
 *     form.setValue('dateOfBirth', formData.dateOfBirth);
 *     // ... etc
 *   }
 * }, [isReady, formData]);
 * ```
 */

import { useEffect, useState } from "react";
import { useEkycStore } from "@/store/use-ekyc-store";
import type { OnboardingFormData } from "@/lib/ekyc/ekyc-data-mapper";

export interface UseEkycAutofillReturn {
  /** Mapped form data from eKYC */
  formData: Partial<OnboardingFormData> | null;

  /** Is eKYC completed and data ready? */
  isReady: boolean;

  /** Raw eKYC result */
  ekycResult: any | null;

  /** Completed timestamp */
  completedAt: string | null;

  /** Clear eKYC data */
  clear: () => void;

  /** Manually trigger autofill */
  autofill: (setValue: (field: string, value: any) => void) => void;
}

export function useEkycAutofill(): UseEkycAutofillReturn {
  const { status, rawResult, formData, completedAt, isValid, reset } =
    useEkycStore();

  const [isReady, setIsReady] = useState(false);

  // Check if data is ready
  useEffect(() => {
    setIsReady(status === "success" && formData !== null && isValid());
  }, [status, formData, isValid]);

  // Log when data is ready
  useEffect(() => {
    if (isReady) {
      console.log(
        "[useEkycAutofill] eKYC data is ready for autofill:",
        formData,
      );
    }
  }, [isReady, formData]);

  /**
   * Auto-fill form fields
   * Pass in form.setValue function from react-hook-form
   */
  const autofill = (setValue: (field: string, value: any) => void) => {
    if (!isReady || !formData) {
      console.warn("[useEkycAutofill] Data not ready for autofill");
      return;
    }

    console.log("[useEkycAutofill] Auto-filling form with:", formData);

    // Fill each field if it exists in formData
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        console.log(`[useEkycAutofill] Setting ${key} =`, value);
        setValue(key, value);
      }
    });

    console.log("[useEkycAutofill] Autofill complete");
  };

  return {
    formData,
    isReady,
    ekycResult: rawResult,
    completedAt,
    clear: reset,
    autofill,
  };
}
