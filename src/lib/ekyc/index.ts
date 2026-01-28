/**
 * eKYC Library - Main exports
 */

// Hooks
export { useEkycConfig } from "../../hooks/features/ekyc/use-config";
export type {
  UseEkycSdkOptions,
  UseEkycSdkReturn,
} from "../../hooks/features/ekyc/use-sdk";
// React integration
export { useEkycSdk } from "../../hooks/features/ekyc/use-sdk";
export { useSubmitEkycResult } from "../../hooks/features/ekyc/use-submit-result";
// Audit Logging
export {
  type AuditEventType,
  type AuditLogEntry,
  type AuditLogLevel,
  logConfigFetchError,
  logConfigFetchStart,
  logConfigFetchSuccess,
  logDuplicatePrevented,
  logSessionClear,
  logSessionExpire,
  logSessionInit,
  logSessionUpdate,
  logSubmitError,
  logSubmitRetry,
  logSubmitStart,
  logSubmitSuccess,
  logValidationError,
} from "./audit-logger";
export type { EkycCredentials, EkycEnvironmentConfig } from "./config-manager";
export { EkycConfigManager } from "./config-manager";
// API Integration
export {
  extractEkycSummary,
  isEkycResponseValid,
  mapEkycResponseToApiRequest,
} from "./ekyc-api-mapper";
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

// Session Management
export {
  canSubmit,
  cleanupExpiredSessions,
  clearSession,
  expireSession,
  getAllActiveSessions,
  getSession,
  getSessionStats,
  incrementSubmissionAttempts,
  initSession,
  isSessionExpired,
  markSubmitted,
  updateSessionStatus,
} from "./session-manager";
// Types
export * from "./types";
// Validation
export {
  formatValidationErrors,
  formatValidationWarnings,
  getBase64Size,
  isBase64TooLarge,
  isValidBase64,
  type ValidationError,
  type ValidationResult,
  validateEkycResult,
} from "./validators";
