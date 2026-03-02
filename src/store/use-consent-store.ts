/**
 * Consent State Management Store
 *
 * GDPR-compliant consent state management for user consent flow.
 * Uses Zustand with cookie-based persistence for cross-tab synchronization
 * and automatic 30-day expiry management.
 *
 * **Architecture:**
 * - State management: Zustand with subscribeWithSelector middleware
 * - Persistence: Cookie storage via custom adapter
 * - Cross-tab sync: Automatic via cookie storage events
 * - Migration: Backward compatible with sessionStorage format
 *
 * **Cookie Configuration:**
 * - Name: `dop_consent_state`
 * - Max-Age: 2592000 seconds (30 days)
 * - Secure: true (HTTPS only)
 * - SameSite: Lax (CSRF protection)
 * - HttpOnly: false (JavaScript access required)
 * - Path: / (available across entire application)
 *
 * **Persisted State:**
 * - consentId: Unique consent record identifier
 * - consentStatus: User's consent decision (pending/agreed/declined)
 * - consentData: Full consent record from API
 * - lastConsentDate: ISO 8601 timestamp of last consent action
 *
 * **Transient State (not persisted):**
 * - isLoading: Loading indicator for async operations
 * - error: Error message from failed operations
 * - modalIsOpen: Consent modal visibility state
 * - modalConfig: Modal configuration and callbacks
 *
 * **Events Dispatched:**
 * - `consent:id-updated` - When consent ID changes
 * - `consent:status-updated` - When consent status changes
 * - `consent:data-updated` - When consent data is set
 * - `consent:error` - When errors occur (cookie failures, API errors)
 *
 * @module use-consent-store
 * @see {@link useConsentSession} - Session ID management
 * @see {@link clearAllConsentCookies} - GDPR data deletion utility
 */

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { setCookie, getCookie, deleteCookie } from "../lib/utils/cookie";
import type { components } from "../lib/api/v1/consent";

type ConsentAction = components["schemas"]["ConsentAction"];

/**
 * Consent record structure from API
 *
 * Represents a user's consent decision stored in the backend.
 * Includes audit trail with creation and update timestamps.
 *
 * @interface ConsentRecord
 * @property {string} id - Unique consent record identifier
 * @property {string} lead_id - Associated lead/user identifier
 * @property {string} consent_version_id - Version of consent terms accepted
 * @property {string} source - Origin of consent (e.g., "web", "mobile")
 * @property {ConsentAction} action - User's decision ("grant" or "decline")
 * @property {string} created_at - ISO 8601 timestamp of record creation
 * @property {string} updated_at - ISO 8601 timestamp of last update
 */
export interface ConsentRecord {
  id: string;
  lead_id: string;
  consent_version_id: string;
  source: string;
  action: ConsentAction;
  created_at: string;
  updated_at: string;
}

/**
 * Configuration for consent modal display
 *
 * @interface ConsentModalConfig
 * @property {string} consentPurposeId - Purpose identifier for consent request
 * @property {function} [onSuccess] - Callback invoked after successful consent submission
 */
export interface ConsentModalConfig {
  consentPurposeId: string;
  onSuccess?: (consentId: string) => void;
}

/**
 * Consent state interface
 *
 * Defines the complete state shape for consent management including
 * persisted consent data, transient UI state, actions, and getters.
 *
 * @interface ConsentState
 */
export interface ConsentState {
  // Consent identifiers
  /** Unique consent record identifier from API */
  consentId: string | null;
  /** User's consent decision status */
  consentStatus: "pending" | "agreed" | "declined";
  /** Full consent record from API */
  consentData: ConsentRecord | null;

  // Loading and error states
  /** Loading indicator for async operations */
  isLoading: boolean;
  /** Error message from failed operations */
  error: string | null;

  // Timestamp tracking
  /** ISO 8601 timestamp of last consent action */
  lastConsentDate: string | null;

  // Modal slice — separate lifecycle from consent data, not persisted
  /** Consent modal visibility state */
  modalIsOpen: boolean;
  /** Modal configuration and callbacks */
  modalConfig: ConsentModalConfig | null;

  // Actions
  /** Set the consent ID */
  setConsentId: (id: string) => void;
  /** Update consent status and timestamp */
  setConsentStatus: (status: "pending" | "agreed" | "declined") => void;
  /** Set full consent data from API response */
  setConsentData: (data: ConsentRecord) => void;
  /** Set error message */
  setError: (error: string) => void;
  /** Clear error message */
  clearError: () => void;
  /** Open consent modal with configuration */
  openConsentModal: (config: ConsentModalConfig) => void;
  /** Close consent modal */
  closeConsentModal: () => void;

  // Getters
  /** Check if user has provided consent (any status) */
  hasConsent: () => boolean;
  /** Get current consent ID */
  getConsentId: () => string | null;
  /** Check if consent is valid (agreed status) */
  isConsentValid: () => boolean;
}

/**
 * Custom cookie storage adapter for Zustand persist middleware
 *
 * Provides cookie-based persistence with automatic expiry, cross-tab synchronization,
 * and backward compatibility with sessionStorage format.
 *
 * **Features:**
 * - Cookie name: "dop_consent_state"
 * - 30-day expiry (2592000 seconds)
 * - Secure=true (HTTPS only)
 * - SameSite=Lax (allows navigation from external sites)
 * - HttpOnly=false (JavaScript access required)
 * - JSON compression: Removes whitespace to minimize cookie size
 * - Migration: Automatically migrates from legacy sessionStorage format
 * - Error handling: Falls back to in-memory storage on cookie failures
 * - Size monitoring: Warns when cookie exceeds 3KB limit
 *
 * **Storage Interface:**
 * Implements the Zustand storage interface with getItem, setItem, and removeItem methods.
 *
 * **Migration Logic:**
 * On first read, checks for legacy sessionStorage data in "dop_consent-store" key.
 * If found, parses the encrypted format, extracts persisted fields, migrates to cookie,
 * and cleans up sessionStorage.
 *
 * **Error Handling:**
 * Cookie read/write failures dispatch "consent:error" custom events and fall back
 * to Zustand's default in-memory storage.
 *
 * @private
 * @internal
 */
const cookieStorageAdapter = {
  getItem: (name: string): string | null => {
    try {
      const cookieValue = getCookie(name);

      // If cookie exists, use it
      if (cookieValue) {
        console.info("[Consent Store] Retrieved consent state from cookie", {
          timestamp: new Date().toISOString(),
          sizeInBytes: new Blob([cookieValue]).size,
        });
        return cookieValue;
      }

      // Otherwise, attempt migration from sessionStorage
      if (typeof sessionStorage !== "undefined") {
        try {
          const legacyData = sessionStorage.getItem("dop_consent-store");

          if (legacyData) {
            console.info(
              "[Consent Store] Migrating from sessionStorage to cookie",
              {
                source: "sessionStorage",
                destination: "cookie",
                timestamp: new Date().toISOString(),
              },
            );

            // Parse legacy encrypted format (data, timestamp, version)
            const parsed = JSON.parse(legacyData);

            if (parsed.data) {
              const consentState = JSON.parse(parsed.data);

              // Extract persisted fields only
              if (consentState.state) {
                const migratedState = {
                  consentId: consentState.state.consentId,
                  consentStatus: consentState.state.consentStatus,
                  consentData: consentState.state.consentData,
                  lastConsentDate: consentState.state.lastConsentDate,
                };

                const migratedValue = JSON.stringify({ state: migratedState });

                // Store in cookie using setCookie directly
                setCookie(name, migratedValue, {
                  maxAge: 2592000,
                  secure: true,
                  sameSite: "Lax",
                  path: "/",
                });

                // Clean up sessionStorage
                if (typeof sessionStorage !== "undefined") {
                  sessionStorage.removeItem("dop_consent-store");
                }

                console.info(
                  "[Consent Store] Successfully migrated consent state from sessionStorage",
                  {
                    source: "sessionStorage",
                    destination: "cookie",
                    timestamp: new Date().toISOString(),
                    sizeInBytes: new Blob([migratedValue]).size,
                  },
                );

                return migratedValue;
              }
            }
          }
        } catch (error) {
          console.error(
            "[Consent Store] Migration from sessionStorage failed:",
            error,
            {
              timestamp: new Date().toISOString(),
            },
          );
          // Clean up corrupted data
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.removeItem("dop_consent-store");
          }
        }
      }

      return null;
    } catch (error) {
      console.error("[Consent Store] Failed to read cookie:", error, {
        timestamp: new Date().toISOString(),
      });

      // Dispatch error event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("consent:error", {
            detail: {
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to read cookie",
              cookieName: name,
              timestamp: new Date().toISOString(),
              fallbackActive: true,
            },
          }),
        );
      }

      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      // Compress JSON by removing whitespace
      // The value is already JSON string from Zustand, so we parse and re-stringify
      let compressedValue = value;
      try {
        const parsed = JSON.parse(value);
        compressedValue = JSON.stringify(parsed); // No spacing, no indentation
      } catch (error) {
        // If parsing fails, use original value
        console.warn(
          "[Consent Store] Failed to compress JSON, using original value",
          {
            timestamp: new Date().toISOString(),
          },
        );
      }

      // Monitor cookie size
      const sizeInBytes = new Blob([compressedValue]).size;
      const sizeInKB = sizeInBytes / 1024;

      if (sizeInKB > 3) {
        console.warn(
          `[Consent Store] Cookie size (${sizeInKB.toFixed(2)}KB) exceeds 3KB limit`,
          {
            actualSize: sizeInBytes,
            limit: 3072, // 3KB in bytes
            recommendation: "Consider reducing consentData payload",
            timestamp: new Date().toISOString(),
          },
        );
      }

      const success = setCookie(name, compressedValue, {
        maxAge: 2592000, // 30 days in seconds
        secure: true,
        sameSite: "Lax",
        path: "/",
      });

      if (!success) {
        throw new Error("Cookie write failed");
      }

      console.info(
        "[Consent Store] Successfully wrote consent state to cookie",
        {
          sizeInBytes,
          sizeInKB: sizeInKB.toFixed(2),
          timestamp: new Date().toISOString(),
        },
      );
    } catch (error) {
      console.error("[Consent Store] Failed to write cookie:", error, {
        timestamp: new Date().toISOString(),
        fallbackActive: true,
      });
      console.warn("[Consent Store] Falling back to in-memory storage", {
        timestamp: new Date().toISOString(),
      });

      // Dispatch error event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("consent:error", {
            detail: {
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to write cookie",
              cookieName: name,
              timestamp: new Date().toISOString(),
              fallbackActive: true,
            },
          }),
        );
      }

      // Note: Zustand will automatically fall back to in-memory storage
      // when the storage adapter throws or fails
    }
  },
  removeItem: (name: string): void => {
    try {
      deleteCookie(name, "/");
      console.info("[Consent Store] Removed consent state cookie", {
        cookieName: name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Consent Store] Failed to delete cookie:", error, {
        cookieName: name,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

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
        name: "dop_consent_state",
        storage: createJSONStorage(() => cookieStorageAdapter),
        // Partialize state to only persist consent-related data
        partialize: (state) => ({
          consentId: state.consentId,
          consentStatus: state.consentStatus,
          consentData: state.consentData,
          lastConsentDate: state.lastConsentDate,
          // Never persist modal state, error, or loading states
        }),
      },
    ),
  ),
);

// Export selectors for efficient subscriptions
/**
 * Selector hook for consent ID
 *
 * Subscribes only to consentId changes, avoiding unnecessary re-renders.
 *
 * @returns {string | null} Current consent ID or null if not set
 *
 * @example
 * ```typescript
 * function ConsentDisplay() {
 *   const consentId = useConsentId();
 *   return <div>Consent ID: {consentId || 'Not set'}</div>;
 * }
 * ```
 */
export const useConsentId = () => useConsentStore((state) => state.consentId);

/**
 * Selector hook for consent status
 *
 * Subscribes only to consentStatus changes.
 *
 * @returns {'pending' | 'agreed' | 'declined'} Current consent status
 *
 * @example
 * ```typescript
 * function ConsentBadge() {
 *   const status = useConsentStatus();
 *   return <Badge variant={status === 'agreed' ? 'success' : 'warning'}>{status}</Badge>;
 * }
 * ```
 */
export const useConsentStatus = () =>
  useConsentStore((state) => state.consentStatus);

/**
 * Selector hook for consent data
 *
 * Subscribes only to consentData changes.
 *
 * @returns {ConsentRecord | null} Full consent record or null if not set
 *
 * @example
 * ```typescript
 * function ConsentDetails() {
 *   const data = useConsentData();
 *   if (!data) return null;
 *   return <div>Consent granted at: {data.created_at}</div>;
 * }
 * ```
 */
export const useConsentData = () =>
  useConsentStore((state) => state.consentData);

/**
 * Selector hook for consent error
 *
 * Subscribes only to error changes.
 *
 * @returns {string | null} Current error message or null if no error
 *
 * @example
 * ```typescript
 * function ConsentErrorAlert() {
 *   const error = useConsentError();
 *   if (!error) return null;
 *   return <Alert variant="error">{error}</Alert>;
 * }
 * ```
 */
export const useConsentError = () => useConsentStore((state) => state.error);

/**
 * Selector hook for loading state
 *
 * Subscribes only to isLoading changes.
 *
 * @returns {boolean} True if consent operation is in progress
 *
 * @example
 * ```typescript
 * function ConsentButton() {
 *   const isLoading = useIsLoadingConsent();
 *   return <Button disabled={isLoading}>Submit Consent</Button>;
 * }
 * ```
 */
export const useIsLoadingConsent = () =>
  useConsentStore((state) => state.isLoading);

/**
 * Selector hook for consent existence check
 *
 * Subscribes to hasConsent getter, which checks if consentId is set.
 *
 * @returns {boolean} True if user has provided consent (any status)
 *
 * @example
 * ```typescript
 * function ConsentGate({ children }) {
 *   const hasConsent = useHasConsent();
 *   if (!hasConsent) return <ConsentModal />;
 *   return children;
 * }
 * ```
 */
export const useHasConsent = () =>
  useConsentStore((state) => state.hasConsent());

/**
 * Selector hook for consent validity check
 *
 * Subscribes to isConsentValid getter, which checks if consent is agreed.
 *
 * @returns {boolean} True if consent is valid (agreed status)
 *
 * @example
 * ```typescript
 * function ProtectedFeature() {
 *   const isValid = useIsConsentValid();
 *   if (!isValid) return <div>Consent required</div>;
 *   return <FeatureContent />;
 * }
 * ```
 */
export const useIsConsentValid = () =>
  useConsentStore((state) => state.isConsentValid());

/**
 * Selector hook for consent modal visibility
 *
 * Subscribes only to modalIsOpen changes.
 *
 * @returns {boolean} True if consent modal is open
 *
 * @example
 * ```typescript
 * function ConsentModalContainer() {
 *   const isOpen = useConsentModalIsOpen();
 *   return <Modal open={isOpen}><ConsentForm /></Modal>;
 * }
 * ```
 */
export const useConsentModalIsOpen = () =>
  useConsentStore((state) => state.modalIsOpen);

/**
 * Selector hook for consent modal configuration
 *
 * Subscribes only to modalConfig changes.
 *
 * @returns {ConsentModalConfig | null} Modal configuration or null if not set
 *
 * @example
 * ```typescript
 * function ConsentModal() {
 *   const config = useConsentModalConfig();
 *   if (!config) return null;
 *   return <ConsentForm purposeId={config.consentPurposeId} />;
 * }
 * ```
 */
export const useConsentModalConfig = () =>
  useConsentStore((state) => state.modalConfig);

/**
 * Utility function to manually clear all consent cookies
 *
 * Removes both the consent state cookie and session ID cookie.
 * Used for GDPR data deletion requests and explicit consent revocation.
 * Completes within 100ms as per GDPR requirements.
 *
 * **Cookies Cleared:**
 * - `dop_consent_state` - Consent state and decision
 * - `consent_session_id` - Session identifier
 *
 * **Use Cases:**
 * - GDPR "right to be forgotten" requests
 * - User-initiated consent revocation
 * - Account deletion flows
 * - Testing and development
 *
 * **Performance:**
 * Deletion completes synchronously within 100ms, meeting GDPR requirements
 * for timely data deletion.
 *
 * @example
 * ```typescript
 * // Handle GDPR data deletion request
 * function handleDeleteConsent() {
 *   clearAllConsentCookies();
 *   console.log('All consent data cleared');
 *   // Optionally redirect or show confirmation
 * }
 *
 * // Revoke consent on user action
 * function handleRevokeConsent() {
 *   clearAllConsentCookies();
 *   useConsentStore.setState({ consentStatus: 'pending' });
 * }
 *
 * // Clear consent in tests
 * beforeEach(() => {
 *   clearAllConsentCookies();
 * });
 * ```
 *
 * @see {@link clearConsentSessionCookie} - Clear only session cookie
 * @see {@link useConsentStore} - Consent state management
 */
export function clearAllConsentCookies(): void {
  if (typeof document === "undefined") {
    return; // SSR compatibility
  }

  try {
    const startTime = performance.now();

    // Clear consent state cookie
    deleteCookie("dop_consent_state", "/");

    // Clear session ID cookie (if it exists)
    deleteCookie("consent_session_id", "/");

    const duration = performance.now() - startTime;

    console.info("[Consent Store] All consent cookies cleared", {
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      cookiesCleared: ["dop_consent_state", "consent_session_id"],
    });
  } catch (error) {
    console.error("[Consent Store] Failed to clear consent cookies:", error, {
      timestamp: new Date().toISOString(),
    });
  }
}
