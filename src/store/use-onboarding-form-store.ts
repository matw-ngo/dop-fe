/**
 * Onboarding Form Store
 * Specialized store for onboarding flow with eKYC integration
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface OnboardingFormData {
  // Identity fields (auto-filled by eKYC)
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  idNumber?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  nationality?: string;
  ethnicity?: string;
  religion?: string;

  // Address fields (auto-filled by eKYC)
  permanentAddress?: string;
  currentAddress?: string;

  // Contact fields
  email?: string;
  phoneNumber?: string;

  // Additional fields
  occupation?: string;

  // Verification status
  ekycVerified?: boolean;

  // Any other custom fields
  [key: string]: any;
}

interface OnboardingFormStore {
  // Form data
  formData: OnboardingFormData;

  // eKYC verification status
  ekycVerified: boolean;

  // Actions
  setFormData: (data: Partial<OnboardingFormData>) => void;
  updateField: (fieldName: string, value: any) => void;
  setEkycVerified: (verified: boolean) => void;
  resetForm: () => void;
  getFieldValue: (fieldName: string) => any;
}

export const useOnboardingFormStore = create<OnboardingFormStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        formData: {},
        ekycVerified: false,

        // Set multiple form fields at once (useful for eKYC autofill)
        setFormData: (data: Partial<OnboardingFormData>) => {
          set(
            (state) => ({
              formData: { ...state.formData, ...data },
            }),
            false,
            "setFormData",
          );
        },

        // Update a single field
        updateField: (fieldName: string, value: any) => {
          set(
            (state) => ({
              formData: { ...state.formData, [fieldName]: value },
            }),
            false,
            "updateField",
          );
        },

        // Set eKYC verification status
        setEkycVerified: (verified: boolean) => {
          set(
            (state) => ({
              ekycVerified: verified,
              formData: { ...state.formData, ekycVerified: verified },
            }),
            false,
            "setEkycVerified",
          );
        },

        // Reset form
        resetForm: () => {
          set(
            {
              formData: {},
              ekycVerified: false,
            },
            false,
            "resetForm",
          );
        },

        // Get a specific field value
        getFieldValue: (fieldName: string) => {
          return get().formData[fieldName];
        },
      }),
      {
        name: "onboarding-form-storage",
        partialize: (state) => ({
          formData: state.formData,
          ekycVerified: state.ekycVerified,
        }),
      },
    ),
    {
      name: "OnboardingFormStore",
    },
  ),
);

// Convenience selectors
export const useOnboardingFormData = () =>
  useOnboardingFormStore((state) => state.formData);

export const useOnboardingEkycVerified = () =>
  useOnboardingFormStore((state) => state.ekycVerified);
