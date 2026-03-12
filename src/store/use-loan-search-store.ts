/**
 * Loan Search State Management Store
 *
 * Global state management for LoanSearchingScreen display across the application.
 * Uses Zustand with transient state (not persisted) as this is UI-only state.
 *
 * **Architecture:**
 * - State management: Zustand with subscribeWithSelector middleware
 * - Persistence: None (transient UI state)
 * - Cross-tab sync: Not needed (per-session UI state)
 *
 * **State:**
 * - isVisible: Whether LoanSearchingScreen is currently displayed
 * - config: Configuration including leadId, token, callbacks
 * - searchStatus: Current search status (idle/searching/completed/error)
 *
 * **Usage:**
 * Components call showLoanSearching() to display the screen globally,
 * similar to how ConsentModal works with useConsentStore.
 *
 * @module use-loan-search-store
 * @see {@link LoanSearchingScreen} - The screen component
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { components } from "@/lib/api/v1/dop";

// Type aliases from API schema
type LeadId = components["schemas"]["uuid"];
type LeadToken = string;
type ForwardResult = components["schemas"]["ForwardResult"];
/** Forward status type from API */
type ForwardStatus = ForwardResult["status"];

/**
 * Configuration for loan searching screen display
 *
 * @interface LoanSearchConfig
 * @property {string} leadId - Lead identifier for the loan search
 * @property {string} token - Auth token for API calls
 * @property {string} [redirectTo] - Route to navigate after search completes
 * @property {function} [onComplete] - Callback invoked after search completes
 * @property {function} [onError] - Callback invoked if search fails
 * @property {string} [message] - Custom message to display
 */
export interface LoanSearchConfig {
  /** Lead identifier for the loan search (UUID format) */
  leadId: LeadId;
  /** Auth token for API calls */
  token: LeadToken;
  /** Route to navigate after search completes */
  redirectTo?: string;
  /** Callback invoked after search completes */
  onComplete?: () => void;
  /** Callback invoked if search fails */
  onError?: (error: Error) => void;
  /** Custom message to display */
  message?: string;
}

/**
 * Loan search state interface
 *
 * @interface LoanSearchState
 */
export interface LoanSearchState {
  // UI State (transient - not persisted)
  /** Whether LoanSearchingScreen is currently visible */
  isVisible: boolean;
  /** Configuration for the current search session */
  config: LoanSearchConfig | null;

  // Forward status
  /** Current forward status from submit-info API (undefined while loading) */
  forwardStatus: ForwardStatus;
  /** Generic result data from API - can be ForwardResult or any other result type */
  result: unknown;
  /** Error message if search failed */
  error: string | null;

  // Loading state
  /** Loading indicator for async operations */
  isLoading: boolean;

  // Actions
  /** Show loan searching screen with configuration */
  showLoanSearching: (config: LoanSearchConfig) => void;
  /** Hide loan searching screen */
  hideLoanSearching: () => void;
  /** Set forward status */
  setForwardStatus: (status: ForwardStatus) => void;
  /** Set generic result data */
  setResult: (result: unknown) => void;
  /** Set error message */
  setError: (error: string) => void;
  /** Clear error message */
  clearError: () => void;

  // Getters
  /** Check if search screen is currently visible */
  isSearching: () => boolean;
  /** Get current lead ID */
  getLeadId: () => LeadId | null;
  /** Get current token */
  getToken: () => LeadToken | null;
}

export const useLoanSearchStore = create<LoanSearchState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isVisible: false,
    config: null,
    forwardStatus: undefined,
    result: null,
    error: null,
    isLoading: false,

    // Actions
    showLoanSearching: (config: LoanSearchConfig) => {
      console.log("[Loan Search Store] Showing loan searching screen:", {
        leadId: config.leadId,
        hasRedirectTo: !!config.redirectTo,
        hasOnComplete: !!config.onComplete,
        hasOnError: !!config.onError,
        timestamp: new Date().toISOString(),
      });

      set({
        isVisible: true,
        config,
        forwardStatus: undefined,
        result: null,
        error: null,
        isLoading: true,
      });

      // Dispatch event for components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("loan-search:started", {
            detail: {
              leadId: config.leadId,
              timestamp: new Date().toISOString(),
            },
          }),
        );
      }
    },

    hideLoanSearching: () => {
      console.log("[Loan Search Store] Hiding loan searching screen", {
        timestamp: new Date().toISOString(),
      });

      set({
        isVisible: false,
        config: null,
        forwardStatus: undefined,
        result: null,
        error: null,
        isLoading: false,
      });

      // Dispatch event for components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("loan-search:hidden", {
            detail: { timestamp: new Date().toISOString() },
          }),
        );
      }
    },

    setForwardStatus: (status: ForwardStatus) => {
      console.log("[Loan Search Store] Setting forward status:", status, {
        timestamp: new Date().toISOString(),
      });

      set({
        forwardStatus: status,
        isLoading: !status,
      });

      // Dispatch event for components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("loan-search:status-changed", {
            detail: { status, timestamp: new Date().toISOString() },
          }),
        );
      }
    },

    setResult: (result: unknown) => {
      set({ result });
    },

    setError: (error: string) => {
      console.error("[Loan Search Store] Error:", error, {
        timestamp: new Date().toISOString(),
      });

      set({
        error,
        forwardStatus: "rejected",
        isLoading: false,
      });

      // Dispatch error event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("loan-search:error", {
            detail: { error, timestamp: new Date().toISOString() },
          }),
        );
      }
    },

    clearError: () => {
      set({ error: null });
    },

    // Getters
    isSearching: () => {
      const state = get();
      return state.isVisible && !state.forwardStatus;
    },

    getLeadId: () => {
      const state = get();
      return state.config?.leadId || null;
    },

    getToken: () => {
      const state = get();
      return state.config?.token || null;
    },
  })),
);

// Export selectors for efficient subscriptions
/**
 * Selector hook for loan search visibility
 *
 * @returns {boolean} True if loan searching screen is visible
 *
 * @example
 * ```typescript
 * function SomeComponent() {
 *   const isVisible = useLoanSearchVisible();
 *   // Re-renders only when visibility changes
 * }
 * ```
 */
export const useLoanSearchVisible = () =>
  useLoanSearchStore((state) => state.isVisible);

/**
 * Selector hook for loan search config
 *
 * @returns {LoanSearchConfig | null} Current config or null if not visible
 *
 * @example
 * ```typescript
 * function SomeComponent() {
 *   const config = useLoanSearchConfig();
 *   if (config) return <div>Searching for lead: {config.leadId}</div>;
 * }
 * ```
 */
export const useLoanSearchConfig = () =>
  useLoanSearchStore((state) => state.config);

/**
 * Selector hook for forward status
 *
 * @returns {ForwardStatus} Current forward status from API
 *
 * @example
 * ```typescript
 * function StatusBadge() {
 *   const status = useForwardStatus();
 *   return <Badge>{status}</Badge>;
 * }
 * ```
 */
export const useForwardStatus = () =>
  useLoanSearchStore((state) => state.forwardStatus);

/**
 * Selector hook for search loading state
 *
 * @returns {boolean} True if search is in progress
 *
 * @example
 * ```typescript
 * function LoadingIndicator() {
 *   const isLoading = useLoanSearchLoading();
 *   return isLoading ? <Spinner /> : null;
 * }
 * ```
 */
export const useLoanSearchLoading = () =>
  useLoanSearchStore((state) => state.isLoading);

/**
 * Selector hook for search error
 *
 * @returns {string | null} Current error message or null
 *
 * @example
 * ```typescript
 * function ErrorAlert() {
 *   const error = useLoanSearchError();
 *   if (!error) return null;
 *   return <Alert variant="error">{error}</Alert>;
 * }
 * ```
 */
export const useLoanSearchError = () =>
  useLoanSearchStore((state) => state.error);

/**
 * Selector hook for search result
 *
 * @returns {unknown} Result data from API (ForwardResult or other)
 *
 * @example
 * ```typescript
 * function PartnerInfo() {
 *   const result = useLoanSearchResult<ForwardResult>();
 *   return <div>Partner: {result?.partner_name}</div>;
 * }
 * ```
 */
export const useLoanSearchResult = <T = unknown>() =>
  useLoanSearchStore((state) => state.result as T | null);
