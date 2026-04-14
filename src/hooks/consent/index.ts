/**
 * Consent hooks - Centralized exports with full TypeScript types
 */

// Re-export OpenAPI types
export type {
  ConsentRecord,
  ConsentPurpose,
  ConsentVersion,
  ConsentLog,
  DataCategory,
  ConsentListResponse,
  ConsentPurposeListResponse,
  ConsentLogListResponse,
  ConsentAction,
  ConsentStatus,
  ConsentSource,
} from "./types";

// Hooks and their types
export { useConsentPurpose } from "./use-consent-purpose";
export type {
  UseConsentPurposeParams,
  UseConsentPurposeReturn,
} from "./use-consent-purpose";

export {
  useConsentSession,
  clearConsentSessionCookie,
  isCookieSupported,
} from "./use-consent-session";

export { useUserConsent } from "./use-user-consent";
export type {
  UseUserConsentParams,
  UseUserConsentReturn,
} from "./use-user-consent";

export { useConsentGrant } from "./use-consent-grant";

export { useTermsContent } from "./use-terms-content";

export { useConsentLogs } from "./use-consent-logs";
export type {
  UseConsentLogsOptions,
  UseConsentLogsReturn,
} from "./use-consent-logs";

export { useDataCategories } from "./use-data-categories";
export type {
  UseDataCategoriesOptions,
  UseDataCategoriesReturn,
} from "./use-data-categories";
