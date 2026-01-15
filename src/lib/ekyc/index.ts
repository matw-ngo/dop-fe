/**
 * eKYC Library - Main exports
 */

export type {
  UseEkycSdkOptions,
  UseEkycSdkReturn,
} from "../../hooks/features/ekyc/use-sdk";
// React integration
export { useEkycSdk } from "../../hooks/features/ekyc/use-sdk";
export type { EkycCredentials, EkycEnvironmentConfig } from "./config-manager";
export { EkycConfigManager } from "./config-manager";
export type {
  CaptureImageStyle,
  EkycSdkConfig,
  ListChooseStyle,
  MobileStyle,
  ResultDefaultStyle,
} from "./sdk-config";
export {
  createDefaultEkycConfig,
  EkycConfigBuilder,
} from "./sdk-config";
export type { EkycEventHandlers, EkycResult } from "./sdk-events";
export { EkycEventManager } from "./sdk-events";
export type { SdkAssets } from "./sdk-loader";
// Core SDK functionality
export { EkycSdkLoader } from "./sdk-loader";
export type { EkycSdkManagerOptions } from "./sdk-manager";
export { EkycSdkManager } from "./sdk-manager";
// Types
export * from "./types";

// API Integration
export {
  mapEkycResponseToApiRequest,
  isEkycResponseValid,
  extractEkycSummary,
} from "./ekyc-api-mapper";

// Hooks
export { useEkycConfig } from "../../hooks/features/ekyc/use-ekyc-config";
export { useSubmitEkycResult } from "../../hooks/features/ekyc/use-submit-ekyc-result";

// Session Management
export {
  initSession,
  getSession,
  updateSessionStatus,
  incrementSubmissionAttempts,
  markSubmitted,
  canSubmit,
  isSessionExpired,
  expireSession,
  clearSession,
  getAllActiveSessions,
  cleanupExpiredSessions,
  getSessionStats,
} from "./session-manager";

// Validation
export {
  isValidBase64,
  getBase64Size,
  isBase64TooLarge,
  validateEkycResult,
  formatValidationErrors,
  formatValidationWarnings,
  type ValidationResult,
  type ValidationError,
} from "./validators";

// Audit Logging
export {
  logConfigFetchStart,
  logConfigFetchSuccess,
  logConfigFetchError,
  logSubmitStart,
  logSubmitSuccess,
  logSubmitError,
  logSubmitRetry,
  logValidationError,
  logSessionInit,
  logSessionUpdate,
  logSessionExpire,
  logSessionClear,
  logDuplicatePrevented,
  type AuditLogEntry,
  type AuditLogLevel,
  type AuditEventType,
} from "./audit-logger";
