/**
 * Client-Side OTP Security Utilities
 * Frontend security features for OTP verification system
 */

// ============================================================================
// CLIENT-SIDE RATE LIMITING
// ============================================================================

interface RateLimitState {
  lastRequestTime: number;
  requestCount: number;
  windowStart: number;
}

interface ClientRateLimitConfig {
  maxRequests: number;
  windowMs: number;
  cooldownMs?: number;
}

export function createClientRateLimiter(config: ClientRateLimitConfig) {
  const state = new Map<string, RateLimitState>();

  return {
    isAllowed: (
      key: string,
    ): { allowed: boolean; remaining: number; retryAfter?: number } => {
      const now = Date.now();
      const existing = state.get(key);

      if (!existing) {
        state.set(key, {
          lastRequestTime: now,
          requestCount: 1,
          windowStart: now,
        });
        return { allowed: true, remaining: config.maxRequests - 1 };
      }

      if (now - existing.windowStart > config.windowMs) {
        existing.windowStart = now;
        existing.requestCount = 1;
        existing.lastRequestTime = now;
        return { allowed: true, remaining: config.maxRequests - 1 };
      }

      if (existing.requestCount >= config.maxRequests) {
        const retryAfter = config.cooldownMs
          ? Math.ceil(config.cooldownMs / 1000)
          : Math.ceil((config.windowMs - (now - existing.windowStart)) / 1000);
        return { allowed: false, remaining: 0, retryAfter };
      }

      existing.requestCount++;
      existing.lastRequestTime = now;
      return {
        allowed: true,
        remaining: config.maxRequests - existing.requestCount,
      };
    },

    reset: (key: string): void => {
      state.delete(key);
    },

    getStats: (key: string): RateLimitState | undefined => {
      return state.get(key);
    },
  };
}

export const otpClientRateLimiters = {
  otpRequest: createClientRateLimiter({
    maxRequests: 3,
    windowMs: 60 * 1000,
    cooldownMs: 30 * 1000,
  }),

  otpVerify: createClientRateLimiter({
    maxRequests: 5,
    windowMs: 5 * 60 * 1000,
  }),

  otpResend: createClientRateLimiter({
    maxRequests: 3,
    windowMs: 10 * 60 * 1000,
  }),
};

// ============================================================================
// OTP SANITIZATION
// ============================================================================

export function sanitizeClientOTP(
  otpCode: string,
  minLength = 4,
  maxLength = 6,
): string | null {
  const sanitized = otpCode.replace(/[^0-9]/g, "");
  if (sanitized.length < minLength || sanitized.length > maxLength) {
    return null;
  }
  return sanitized;
}

export function validatePhoneNumber(phoneNumber: string): {
  isValid: boolean;
  sanitized?: string;
  error?: string;
} {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return { isValid: false, error: "Phone number is required" };
  }

  const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
  const vietnamesePhoneRegex = /^(0[1-9]\d{8,9}|84[1-9]\d{8,9})$/;

  if (!vietnamesePhoneRegex.test(digitsOnly)) {
    return { isValid: false, error: "Invalid Vietnamese phone number format" };
  }

  let normalized = digitsOnly;
  if (digitsOnly.startsWith("84")) {
    normalized = `0${digitsOnly.slice(2)}`;
  }

  return { isValid: true, sanitized: normalized };
}

// ============================================================================
// SECURITY EVENT LOGGING
// ============================================================================

export enum ClientSecurityEventType {
  OTP_REQUEST = "otp_request",
  OTP_VERIFY_ATTEMPT = "otp_verify_attempt",
  OTP_VERIFY_SUCCESS = "otp_verify_success",
  OTP_VERIFY_FAILURE = "otp_verify_failure",
  RESEND_REQUEST = "resend_request",
  RATE_LIMIT_TRIGGERED = "rate_limit_triggered",
  INPUT_ERROR = "input_error",
}

interface SecurityEvent {
  type: ClientSecurityEventType;
  phoneNumber?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class ClientSecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly maxEvents: number;
  private readonly phoneMask: string = "***";

  constructor(maxEvents = 100) {
    this.maxEvents = maxEvents;
  }

  log(event: SecurityEvent): void {
    const maskedEvent = event.phoneNumber
      ? {
          ...event,
          phoneNumber: this.maskPhone(event.phoneNumber),
        }
      : event;

    this.events.push(maskedEvent);

    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  private maskPhone(phone: string): string {
    if (phone.length <= 4) return this.phoneMask;
    return phone.slice(0, -4).replace(/[0-9]/g, "*") + phone.slice(-4);
  }

  getEvents(): SecurityEvent[] {
    return [...this.events];
  }

  getRecentEvents(types?: ClientSecurityEventType[]): SecurityEvent[] {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    return this.events
      .filter((e) => e.timestamp > oneDayAgo)
      .filter((e) => !types || types.includes(e.type));
  }

  clear(): void {
    this.events = [];
  }

  getStats(): {
    totalEvents: number;
    eventCounts: Record<string, number>;
    recentFailures: number;
  } {
    const eventCounts: Record<string, number> = {};
    let recentFailures = 0;
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const event of this.events) {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;

      if (
        event.timestamp > oneHourAgo &&
        event.type === ClientSecurityEventType.OTP_VERIFY_FAILURE
      ) {
        recentFailures++;
      }
    }

    return {
      totalEvents: this.events.length,
      eventCounts,
      recentFailures,
    };
  }
}

export const securityLogger = new ClientSecurityLogger();

// ============================================================================
// ATTEMPT TRACKING
// ============================================================================

interface AttemptRecord {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

export function createAttemptTracker(
  maxAttempts = 5,
  lockoutMs = 15 * 60 * 1000,
) {
  const attempts = new Map<string, AttemptRecord>();

  return {
    recordAttempt(identifier: string): {
      allowed: boolean;
      attemptsRemaining: number;
      locked?: boolean;
    } {
      const now = Date.now();
      const existing = attempts.get(identifier);

      if (existing?.lockedUntil && now < existing.lockedUntil) {
        return {
          allowed: false,
          attemptsRemaining: 0,
          locked: true,
        };
      }

      if (existing?.lockedUntil && now >= existing.lockedUntil) {
        attempts.delete(identifier);
      }

      const newCount = (existing?.count || 0) + 1;

      if (newCount >= maxAttempts) {
        attempts.set(identifier, {
          count: newCount,
          lastAttempt: now,
          lockedUntil: now + lockoutMs,
        });

        return {
          allowed: false,
          attemptsRemaining: 0,
          locked: true,
        };
      }

      attempts.set(identifier, {
        count: newCount,
        lastAttempt: now,
      });

      return {
        allowed: true,
        attemptsRemaining: maxAttempts - newCount,
      };
    },

    reset(identifier: string): void {
      attempts.delete(identifier);
    },

    getAttempts(identifier: string): AttemptRecord | undefined {
      return attempts.get(identifier);
    },
  };
}

export const attemptTracker = createAttemptTracker(5, 15 * 60 * 1000);

// ============================================================================
// REACT HOOK
// ============================================================================

import { useCallback, useRef } from "react";

export function useOTPSecurity() {
  const requestLimiter = useRef(otpClientRateLimiters.otpRequest).current;
  const verifyLimiter = useRef(otpClientRateLimiters.otpVerify).current;
  const _resendLimiter = useRef(otpClientRateLimiters.otpResend).current;
  const verifyAttempts = useRef(attemptTracker).current;

  const checkRequestAllowed = useCallback(
    (phoneNumber: string) => {
      return requestLimiter.isAllowed(phoneNumber);
    },
    [requestLimiter],
  );

  const checkVerifyAllowed = useCallback(
    (phoneNumber: string) => {
      return verifyLimiter.isAllowed(phoneNumber);
    },
    [verifyLimiter],
  );

  const recordVerifyAttempt = useCallback(
    (phoneNumber: string) => {
      return verifyAttempts.recordAttempt(phoneNumber);
    },
    [verifyAttempts],
  );

  const resetVerifyAttempts = useCallback(
    (phoneNumber: string) => {
      verifyAttempts.reset(phoneNumber);
    },
    [verifyAttempts],
  );

  const sanitizeOTP = useCallback((otp: string) => {
    return sanitizeClientOTP(otp);
  }, []);

  const validatePhone = useCallback((phone: string) => {
    return validatePhoneNumber(phone);
  }, []);

  const logSecurityEvent = useCallback(
    (
      type: ClientSecurityEventType,
      phoneNumber?: string,
      metadata?: Record<string, unknown>,
    ) => {
      securityLogger.log({
        type,
        phoneNumber,
        timestamp: Date.now(),
        metadata,
      });
    },
    [],
  );

  const getSecurityStats = useCallback(() => {
    return securityLogger.getStats();
  }, []);

  return {
    checkRequestAllowed,
    checkVerifyAllowed,
    recordVerifyAttempt,
    resetVerifyAttempts,
    sanitizeOTP,
    validatePhone,
    logSecurityEvent,
    getSecurityStats,
  };
}
