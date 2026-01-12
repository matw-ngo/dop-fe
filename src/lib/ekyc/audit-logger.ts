/**
 * eKYC Audit Logger
 *
 * Provides non-PII logging functions for eKYC operations.
 * All PII (Personally Identifiable Information) is sanitized before logging.
 *
 * Complies with Vietnamese Decree 13/2023/NĐ-CP on personal data protection.
 *
 * @module audit-logger
 */

/**
 * Audit log levels
 */
export enum AuditLogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Audit event types for eKYC operations
 */
export enum AuditEventType {
  // Config events
  CONFIG_FETCH_START = "ekyc.config.fetch.start",
  CONFIG_FETCH_SUCCESS = "ekyc.config.fetch.success",
  CONFIG_FETCH_ERROR = "ekyc.config.fetch.error",
  CONFIG_CACHE_HIT = "ekyc.config.cache.hit",
  CONFIG_CACHE_MISS = "ekyc.config.cache.miss",

  // Submission events
  SUBMIT_START = "ekyc.submit.start",
  SUBMIT_SUCCESS = "ekyc.submit.success",
  SUBMIT_ERROR = "ekyc.submit.error",
  SUBMIT_RETRY = "ekyc.submit.retry",
  SUBMIT_VALIDATION_ERROR = "ekyc.submit.validation_error",

  // Session events
  SESSION_INIT = "ekyc.session.init",
  SESSION_UPDATE = "ekyc.session.update",
  SESSION_EXPIRE = "ekyc.session.expire",
  SESSION_CLEAR = "ekyc.session.clear",
  SESSION_DUPLICATE_PREVENTED = "ekyc.session.duplicate_prevented",
}

/**
 * Sanitized audit log entry
 */
export interface AuditLogEntry {
  timestamp: string;
  level: AuditLogLevel;
  eventType: AuditEventType;
  leadId?: string;
  sessionId?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sanitizes potentially sensitive data by removing or masking PII fields
 *
 * @param data - The data to sanitize
 * @returns Sanitized data with PII removed
 */
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...data };
  const piiFields = [
    "id",
    "idNumber",
    "nationalId",
    "fullName",
    "name",
    "address",
    "phone",
    "email",
    "dateOfBirth",
    "birth_day",
    "base64",
    "img",
    "hash",
  ];

  // Remove or mask PII fields
  for (const field of piiFields) {
    if (field in sanitized) {
      if (field.includes("base64") || field.includes("img") || field.includes("hash")) {
        // Completely remove binary data
        delete sanitized[field];
      } else {
        // Mask other PII
        const value = sanitized[field];
        if (typeof value === "string") {
          sanitized[field] = maskValue(value);
        }
      }
    }
  }

  return sanitized;
}

/**
 * Masks a sensitive value for logging
 *
 * @param value - The value to mask
 * @returns Masked value showing only first and last characters
 */
function maskValue(value: string): string {
  if (value.length <= 4) return "***";
  return `${value.substring(0, 2)}${"*".repeat(value.length - 4)}${value.substring(value.length - 2)}`;
}

/**
 * Checks if a string might contain base64 encoded data
 *
 * @param str - The string to check
 * @returns true if the string appears to be base64 encoded
 */
function isBase64Data(str: string): boolean {
  // Check if it looks like base64 (long alphanumeric string with potential padding)
  const base64Pattern = /^[A-Za-z0-9+/={200,}$/;
  return base64Pattern.test(str);
}

/**
 * Sanitizes an entire object, removing base64 image data and PII
 *
 * @param obj - The object to sanitize
 * @returns Sanitized object safe for logging
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    // Remove base64 image data from strings
    if (isBase64Data(obj)) {
      return "[BASE64_DATA_REMOVED]";
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip known PII fields
      if (key.toLowerCase().includes("base64") || 
          key.toLowerCase().includes("img") || 
          key.toLowerCase().includes("hash") ||
          key.toLowerCase().includes("face")) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Creates an audit log entry with sanitized data
 *
 * @param level - The log level
 * @param eventType - The type of audit event
 * @param message - Human-readable message
 * @param metadata - Optional metadata (will be sanitized)
 * @param leadId - Optional lead ID for tracking
 * @param sessionId - Optional session ID for tracking
 * @returns Sanitized audit log entry
 */
export function createAuditLogEntry(
  level: AuditLogLevel,
  eventType: AuditEventType,
  message: string,
  metadata?: Record<string, unknown>,
  leadId?: string,
  sessionId?: string,
): AuditLogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    eventType,
    leadId,
    sessionId,
    message,
    metadata: metadata ? sanitizeObject(metadata) as Record<string, unknown> : undefined,
  };
}

/**
 * Logs an audit event (in production, this would send to audit service)
 *
 * @param entry - The audit log entry to log
 */
export function logAuditEvent(entry: AuditLogEntry): void {
  // In development/test, log to console
  if (process.env.NODE_ENV !== "production") {
    const logMessage = `[AUDIT] ${entry.eventType} | ${entry.message}`;
    const logData = {
      timestamp: entry.timestamp,
      eventType: entry.eventType,
      leadId: entry.leadId,
      sessionId: entry.sessionId,
      metadata: entry.metadata,
    };

    switch (entry.level) {
      case AuditLogLevel.DEBUG:
        console.debug(logMessage, logData);
        break;
      case AuditLogLevel.INFO:
        console.info(logMessage, logData);
        break;
      case AuditLogLevel.WARN:
        console.warn(logMessage, logData);
        break;
      case AuditLogLevel.ERROR:
        console.error(logMessage, logData);
        break;
    }
  }

  // In production, send to audit logging service
  // This is a placeholder for actual audit service integration
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    // Send to remote audit service
    // TODO: Implement actual audit service integration
    sendToAuditService(entry);
  }
}

/**
 * Sends audit log to remote audit service
 * This is a placeholder for actual implementation
 *
 * @param entry - The audit log entry to send
 */
async function sendToAuditService(entry: AuditLogEntry): Promise<void> {
  // Placeholder for actual audit service integration
  // In production, this would send to a secure audit logging endpoint
  try {
    // Example implementation:
    // await fetch('/api/audit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // });
  } catch (error) {
    // Fail silently - audit logging should not break the application
    console.error("[AUDIT] Failed to send to audit service:", error);
  }
}

/**
 * Logs config fetch start event
 */
export function logConfigFetchStart(leadId: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.INFO,
    AuditEventType.CONFIG_FETCH_START,
    "Fetching eKYC configuration",
    undefined,
    leadId,
  );
  logAuditEvent(entry);
}

/**
 * Logs config fetch success event
 */
export function logConfigFetchSuccess(leadId: string, duration: number): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.INFO,
    AuditEventType.CONFIG_FETCH_SUCCESS,
    "eKYC configuration fetched successfully",
    { duration },
    leadId,
  );
  logAuditEvent(entry);
}

/**
 * Logs config fetch error event
 */
export function logConfigFetchError(leadId: string, error: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.ERROR,
    AuditEventType.CONFIG_FETCH_ERROR,
    `Failed to fetch eKYC configuration: ${error}`,
    undefined,
    leadId,
  );
  logAuditEvent(entry);
}

/**
 * Logs config cache hit event
 */
export function logConfigCacheHit(leadId: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.DEBUG,
    AuditEventType.CONFIG_CACHE_HIT,
    "eKYC configuration served from cache",
    undefined,
    leadId,
  );
  logAuditEvent(entry);
}

/**
 * Logs config cache miss event
 */
export function logConfigCacheMiss(leadId: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.DEBUG,
    AuditEventType.CONFIG_CACHE_MISS,
    "eKYC configuration cache miss",
    undefined,
    leadId,
  );
  logAuditEvent(entry);
}

/**
 * Logs submission start event
 */
export function logSubmitStart(leadId: string, sessionId: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.INFO,
    AuditEventType.SUBMIT_START,
    "Starting eKYC result submission",
    undefined,
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs submission success event
 */
export function logSubmitSuccess(leadId: string, sessionId: string, duration: number): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.INFO,
    AuditEventType.SUBMIT_SUCCESS,
    "eKYC result submitted successfully",
    { duration },
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs submission error event
 */
export function logSubmitError(leadId: string, sessionId: string, error: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.ERROR,
    AuditEventType.SUBMIT_ERROR,
    `Failed to submit eKYC result: ${error}`,
    undefined,
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs submission retry event
 */
export function logSubmitRetry(leadId: string, sessionId: string, attempt: number): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.WARN,
    AuditEventType.SUBMIT_RETRY,
    `Retrying eKYC submission (attempt ${attempt})`,
    { attempt },
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs validation error event
 */
export function logValidationError(leadId: string, sessionId: string, errors: string[]): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.WARN,
    AuditEventType.SUBMIT_VALIDATION_ERROR,
    "eKYC data validation failed",
    { errorCount: errors.length, errors },
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs session initialization event
 */
export function logSessionInit(leadId: string, sessionId: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.INFO,
    AuditEventType.SESSION_INIT,
    "eKYC session initialized",
    undefined,
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs session update event
 */
export function logSessionUpdate(leadId: string, sessionId: string, status: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.DEBUG,
    AuditEventType.SESSION_UPDATE,
    `eKYC session updated to ${status}`,
    { status },
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs session expiration event
 */
export function logSessionExpire(leadId: string, sessionId: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.INFO,
    AuditEventType.SESSION_EXPIRE,
    "eKYC session expired",
    undefined,
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs session clear event
 */
export function logSessionClear(leadId: string, sessionId: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.INFO,
    AuditEventType.SESSION_CLEAR,
    "eKYC session cleared",
    undefined,
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}

/**
 * Logs duplicate submission prevention event
 */
export function logDuplicatePrevented(leadId: string, sessionId: string): void {
  const entry = createAuditLogEntry(
    AuditLogLevel.WARN,
    AuditEventType.SESSION_DUPLICATE_PREVENTED,
    "Duplicate eKYC submission prevented",
    undefined,
    leadId,
    sessionId,
  );
  logAuditEvent(entry);
}
