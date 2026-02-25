/**
 * Consent State Management
 * GDPR-compliant consent state management for user consent flow
 */

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import type { components } from "../lib/api/v1/consent";

type ConsentAction = components["schemas"]["ConsentAction"];

export interface ConsentRecord {
  id: string;
  lead_id: string;
  consent_version_id: string;
  source: string;
  action: ConsentAction;
  created_at: string;
  updated_at: string;
}

export interface ConsentModalConfig {
  consentPurposeId: string;
  onSuccess?: (consentId: string) => void;
}

export interface ConsentState {
  // Consent identifiers
  consentId: string | null;
  consentStatus: "pending" | "agreed" | "declined";
  consentData: ConsentRecord | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Timestamp tracking
  lastConsentDate: string | null;

  // Modal slice — separate lifecycle from consent data, not persisted
  modalIsOpen: boolean;
  modalConfig: ConsentModalConfig | null;

  // Actions
  setConsentId: (id: string) => void;
  setConsentStatus: (status: "pending" | "agreed" | "declined") => void;
  setConsentData: (data: ConsentRecord) => void;
  setError: (error: string) => void;
  clearError: () => void;
  openConsentModal: (config: ConsentModalConfig) => void;
  closeConsentModal: () => void;

  // Getters
  hasConsent: () => boolean;
  getConsentId: () => string | null;
  isConsentValid: () => boolean;
}

export const useConsentStore = create<ConsentState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        consentId: null,
        consentStatus: "pending",
        consentData: null,
        isLoading: false,
        error: null,
        lastConsentDate: null,
        modalIsOpen: false,
        modalConfig: null,

        // Actions
        setConsentId: (id: string) => {
          console.log("[Consent Store] Setting consent ID:", id);

          set({ consentId: id });

          // Dispatch event for components
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("consent:id-updated", {
                detail: { consentId: id },
              }),
            );
          }
        },

        setConsentStatus: (status: "pending" | "agreed" | "declined") => {
          console.log("[Consent Store] Setting consent status:", status);

          set({
            consentStatus: status,
            lastConsentDate: new Date().toISOString(),
          });

          // Dispatch event for components
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("consent:status-updated", {
                detail: { consentStatus: status },
              }),
            );
          }
        },

        setConsentData: (data: ConsentRecord) => {
          console.log("[Consent Store] Setting consent data:", data);

          set({
            consentData: data,
            consentId: data.id,
            consentStatus: data.action === "grant" ? "agreed" : "declined",
            lastConsentDate: data.created_at,
          });

          // Dispatch event for components
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("consent:data-updated", {
                detail: { consentData: data },
              }),
            );
          }
        },

        setError: (error: string) => {
          console.error("[Consent Store] Error:", error);

          set({ error });

          // Dispatch error event
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("consent:error", {
                detail: { error, timestamp: new Date().toISOString() },
              }),
            );
          }
        },

        clearError: () => {
          set({ error: null });
        },

        openConsentModal: (config) => {
          set({ modalIsOpen: true, modalConfig: config });
        },

        closeConsentModal: () => {
          set({ modalIsOpen: false, modalConfig: null });
        },

        // Getters
        hasConsent: () => {
          const state = get();
          return state.consentId !== null;
        },

        getConsentId: () => {
          const state = get();
          return state.consentId;
        },

        isConsentValid: () => {
          const state = get();
          return state.consentId !== null && state.consentStatus === "agreed";
        },
      }),
      {
        name: "dop_consent-store",
        storage: createJSONStorage(() => {
          if (typeof window !== "undefined") {
            // Use encrypted sessionStorage for GDPR compliance
            // TODO: Implement proper encryption/decryption for sensitive consent data
            return {
              getItem: (key) => {
                try {
                  const item = window.sessionStorage.getItem(key);
                  if (!item) return null;

                  // Decrypt stored data (TODO: implement proper encryption)
                  const encryptedData = JSON.parse(item);
                  return encryptedData.data;
                } catch (error) {
                  console.error(
                    "[Consent Store] Failed to decrypt stored data:",
                    error,
                  );
                  return null;
                }
              },
              setItem: (key, value) => {
                try {
                  // Encrypt data before storing (TODO: implement proper encryption)
                  const encryptedData = {
                    data: value,
                    timestamp: Date.now(),
                    version: "1.0",
                  };

                  window.sessionStorage.setItem(
                    key,
                    JSON.stringify(encryptedData),
                  );
                } catch (error) {
                  console.error(
                    "[Consent Store] Failed to encrypt and store data:",
                    error,
                  );
                  // Fallback to non-encrypted storage if encryption fails
                  window.sessionStorage.setItem(key, JSON.stringify(value));
                }
              },
              removeItem: (key) => {
                window.sessionStorage.removeItem(key);
              },
            };
          }
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
        // Partialize state to only persist non-sensitive data
        partialize: (state) => ({
          consentId: state.consentId,
          consentStatus: state.consentStatus,
          consentData: state.consentData,
          lastConsentDate: state.lastConsentDate,
          // Never persist error or loading states
          isLoading: false,
          error: null,
        }),
      },
    ),
  ),
);

// Export selectors for efficient subscriptions
export const useConsentId = () => useConsentStore((state) => state.consentId);
export const useConsentStatus = () =>
  useConsentStore((state) => state.consentStatus);
export const useConsentData = () =>
  useConsentStore((state) => state.consentData);
export const useConsentError = () => useConsentStore((state) => state.error);
export const useIsLoadingConsent = () =>
  useConsentStore((state) => state.isLoading);
export const useHasConsent = () =>
  useConsentStore((state) => state.hasConsent());
export const useIsConsentValid = () =>
  useConsentStore((state) => state.isConsentValid());
export const useConsentModalIsOpen = () =>
  useConsentStore((state) => state.modalIsOpen);
export const useConsentModalConfig = () =>
  useConsentStore((state) => state.modalConfig);
