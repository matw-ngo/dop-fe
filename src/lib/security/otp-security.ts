// @ts-nocheck
/**
 * OTP Security Utilities
 * Enhanced security features for OTP verification system
 */

import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { sanitizeVietnamesePhone } from "@/lib/utils/sanitization";
import {
  detectAnomalies,
  generateDeviceFingerprint,
} from "./device-fingerprinting";
import {
  createSecureSession,
  getSessionFromRequest,
} from "./session-management";

// Security configuration
export interface SecurityConfig {
  maxOTPRequests: number;
  otpRequestWindow: number; // minutes
  maxVerificationAttempts: number;
  verificationWindow: number; // minutes
  accountLockoutDuration: number; // minutes
  enableDeviceFingerprinting: boolean;
  enableAnomalyDetection: boolean;
  enableRateLimiting: boolean;
  trustScoreThreshold: number;
  anomalyThreshold: number;
}

// Security event types
export enum SecurityEventType {
  OTP_REQUEST = "otp_request",
  OTP_VERIFY = "otp_verify",
  RESEND_OTP = "resend_otp",
  ANOMALY_DETECTED = "anomaly_detected",
  ACCOUNT_LOCKED = "account_locked",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  DEVICE_TRUST_UPDATE = "device_trust_update",
}

// Security event
export interface SecurityEvent {
  type: SecurityEventType;
  phoneNumber: string;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
  riskScore?: number;
}

// Security violation levels
export enum ViolationLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Security violation
export interface SecurityViolation {
  phoneNumber: string;
  ipAddress: string;
  deviceId?: string;
  level: ViolationLevel;
  reason: string;
  timestamp: number;
  count: number;
  action: "block" | "warn" | "monitor";
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxOTPRequests: 5,
  otpRequestWindow: 15, // 15 minutes
  maxVerificationAttempts: 3,
  verificationWindow: 10, // 10 minutes
  accountLockoutDuration: 60, // 60 minutes
  enableDeviceFingerprinting: true,
  enableAnomalyDetection: true,
  enableRateLimiting: true,
  trustScoreThreshold: 30,
  anomalyThreshold: 40,
};

// In-memory security events storage (in production, use database)
class SecurityEventStorage {
  private events: SecurityEvent[] = [];
  private violations: Map<string, SecurityViolation> = new Map();
  private blockedIPs: Map<string, number> = new Map();
  private blockedPhones: Map<string, number> = new Map();

  addEvent(event: SecurityEvent): void {
    this.events.push(event);

    // Keep only last 24 hours of events
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.events = this.events.filter((e) => e.timestamp > twentyFourHoursAgo);
  }

  getEvents(phoneNumber: string, timeWindow: number): SecurityEvent[] {
    const cutoff = Date.now() - timeWindow * 60 * 1000;
    return this.events.filter(
      (e) => e.phoneNumber === phoneNumber && e.timestamp > cutoff,
    );
  }

  getIPEvents(ipAddress: string, timeWindow: number): SecurityEvent[] {
    const cutoff = Date.now() - timeWindow * 60 * 1000;
    return this.events.filter(
      (e) => e.ipAddress === ipAddress && e.timestamp > cutoff,
    );
  }

  addViolation(violation: SecurityViolation): void {
    const key = `${violation.phoneNumber}:${violation.ipAddress}:${violation.reason}`;
    const existing = this.violations.get(key);

    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
      existing.level = this.calculateViolationLevel(existing.count);
    } else {
      this.violations.set(key, violation);
    }
  }

  getViolations(phoneNumber: string): SecurityViolation[] {
    return Array.from(this.violations.values()).filter(
      (v) => v.phoneNumber === phoneNumber,
    );
  }

  blockIP(ipAddress: string, duration: number): void {
    this.blockedIPs.set(ipAddress, Date.now() + duration);
  }

  blockPhone(phoneNumber: string, duration: number): void {
    this.blockedPhones.set(phoneNumber, Date.now() + duration);
  }

  isIPBlocked(ipAddress: string): boolean {
    const blockedUntil = this.blockedIPs.get(ipAddress);
    if (!blockedUntil) return false;

    if (Date.now() > blockedUntil) {
      this.blockedIPs.delete(ipAddress);
      return false;
    }

    return true;
  }

  isPhoneBlocked(phoneNumber: string): boolean {
    const blockedUntil = this.blockedPhones.get(phoneNumber);
    if (!blockedUntil) return false;

    if (Date.now() > blockedUntil) {
      this.blockedPhones.delete(phoneNumber);
      return false;
    }

    return true;
  }

  private calculateViolationLevel(count: number): ViolationLevel {
    if (count >= 10) return ViolationLevel.CRITICAL;
    if (count >= 7) return ViolationLevel.HIGH;
    if (count >= 4) return ViolationLevel.MEDIUM;
    return ViolationLevel.LOW;
  }

  cleanup(): void {
    const now = Date.now();

    // Clean up expired blocks
    for (const [ip, blockedUntil] of this.blockedIPs.entries()) {
      if (now > blockedUntil) {
        this.blockedIPs.delete(ip);
      }
    }

    for (const [phone, blockedUntil] of this.blockedPhones.entries()) {
      if (now > blockedUntil) {
        this.blockedPhones.delete(phone);
      }
    }
  }
}

// Global security event storage
const securityEventStorage = new SecurityEventStorage();

// Enhanced phone number validation with security checks
export async function validatePhoneNumberWithSecurity(
  phoneNumber: string,
  request: NextRequest,
): Promise<{
  isValid: boolean;
  sanitizedPhone?: string;
  violations: SecurityViolation[];
  riskScore: number;
}> {
  const violations: SecurityViolation[] = [];
  let riskScore = 0;
  const ipAddress = getClientIP(request);
  const _userAgent = request.headers.get("user-agent") || "unknown";

  try {
    // Basic sanitization and validation
    const sanitizedPhone = sanitizeVietnamesePhone(phoneNumber);

    // Check if phone number is blocked
    if (securityEventStorage.isPhoneBlocked(sanitizedPhone)) {
      violations.push({
        phoneNumber: sanitizedPhone,
        ipAddress,
        level: ViolationLevel.HIGH,
        reason: "Phone number is temporarily blocked",
        timestamp: Date.now(),
        count: 1,
        action: "block",
      });
      riskScore += 50;
    }

    // Check if IP is blocked
    if (securityEventStorage.isIPBlocked(ipAddress)) {
      violations.push({
        phoneNumber: sanitizedPhone,
        ipAddress,
        level: ViolationLevel.HIGH,
        reason: "IP address is temporarily blocked",
        timestamp: Date.now(),
        count: 1,
        action: "block",
      });
      riskScore += 40;
    }

    // Check for rapid OTP requests
    const recentOTPRequests = securityEventStorage
      .getEvents(sanitizedPhone, DEFAULT_SECURITY_CONFIG.otpRequestWindow)
      .filter((e) => e.type === SecurityEventType.OTP_REQUEST);

    if (recentOTPRequests.length >= DEFAULT_SECURITY_CONFIG.maxOTPRequests) {
      violations.push({
        phoneNumber: sanitizedPhone,
        ipAddress,
        level: ViolationLevel.MEDIUM,
        reason: "Too many OTP requests in time window",
        timestamp: Date.now(),
        count: recentOTPRequests.length,
        action: "block",
      });
      riskScore += 30;
    }

    // Check IP-based request patterns
    const recentIPRequests = securityEventStorage
      .getIPEvents(ipAddress, DEFAULT_SECURITY_CONFIG.otpRequestWindow)
      .filter((e) => e.type === SecurityEventType.OTP_REQUEST);

    if (recentIPRequests.length >= DEFAULT_SECURITY_CONFIG.maxOTPRequests * 2) {
      violations.push({
        phoneNumber: sanitizedPhone,
        ipAddress,
        level: ViolationLevel.MEDIUM,
        reason: "IP address making too many OTP requests",
        timestamp: Date.now(),
        count: recentIPRequests.length,
        action: "block",
      });
      riskScore += 25;
    }

    // Check existing violations for this phone number
    const existingViolations =
      securityEventStorage.getViolations(sanitizedPhone);
    const highRiskViolations = existingViolations.filter(
      (v) =>
        v.level === ViolationLevel.HIGH || v.level === ViolationLevel.CRITICAL,
    );

    if (highRiskViolations.length > 0) {
      violations.push(...highRiskViolations);
      riskScore += highRiskViolations.length * 20;
    }

    return {
      isValid: violations.length === 0,
      sanitizedPhone,
      violations,
      riskScore: Math.min(100, riskScore),
    };
  } catch (_error) {
    violations.push({
      phoneNumber,
      ipAddress,
      level: ViolationLevel.MEDIUM,
      reason: "Phone number validation failed",
      timestamp: Date.now(),
      count: 1,
      action: "monitor",
    });
    riskScore += 15;

    return {
      isValid: false,
      violations,
      riskScore,
    };
  }
}

// Enhanced OTP request validation
export async function validateOTPRequest(
  phoneNumber: string,
  request: NextRequest,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
): Promise<{
  allowed: boolean;
  session?: any;
  violations: SecurityViolation[];
  riskScore: number;
  anomaly?: any;
}> {
  const violations: SecurityViolation[] = [];
  let riskScore = 0;
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Validate phone number with security checks
  const phoneValidation = await validatePhoneNumberWithSecurity(
    phoneNumber,
    request,
  );
  violations.push(...phoneValidation.violations);
  riskScore += phoneValidation.riskScore;

  if (!phoneValidation.isValid || !phoneValidation.sanitizedPhone) {
    return {
      allowed: false,
      violations,
      riskScore: Math.min(100, riskScore),
    };
  }

  // Device fingerprinting and anomaly detection
  let deviceFingerprint;
  let anomaly;

  if (config.enableDeviceFingerprinting) {
    deviceFingerprint = await generateDeviceFingerprint(ipAddress);

    if (config.enableAnomalyDetection) {
      anomaly = await detectAnomalies(
        phoneValidation.sanitizedPhone,
        deviceFingerprint,
      );
      if (anomaly.isAnomalous) {
        violations.push({
          phoneNumber: phoneValidation.sanitizedPhone,
          ipAddress,
          deviceId: deviceFingerprint.id,
          level:
            anomaly.riskScore > 60
              ? ViolationLevel.HIGH
              : ViolationLevel.MEDIUM,
          reason: `Anomalous device detected: ${anomaly.reasons.join(", ")}`,
          timestamp: Date.now(),
          count: 1,
          action: "monitor",
        });
        riskScore += anomaly.riskScore;
      }
    }
  }

  // Check existing session
  const existingSession = await getSessionFromRequest(request);
  if (existingSession) {
    // Check if there's already an active session
    const activeSessions = await getActiveSessions(
      phoneValidation.sanitizedPhone,
    );
    if (activeSessions.length > 0) {
      violations.push({
        phoneNumber: phoneValidation.sanitizedPhone,
        ipAddress,
        deviceId: deviceFingerprint?.id,
        level: ViolationLevel.LOW,
        reason: "Multiple sessions detected",
        timestamp: Date.now(),
        count: activeSessions.length,
        action: "monitor",
      });
      riskScore += 10;
    }
  }

  // Create security event
  const securityEvent: SecurityEvent = {
    type: SecurityEventType.OTP_REQUEST,
    phoneNumber: phoneValidation.sanitizedPhone,
    ipAddress,
    userAgent,
    deviceId: deviceFingerprint?.id,
    timestamp: Date.now(),
    metadata: {
      violations: violations.length,
      riskScore,
      anomalyDetected: !!anomaly?.isAnomalous,
    },
  };

  securityEventStorage.addEvent(securityEvent);

  // Log violations
  if (violations.length > 0) {
    for (const violation of violations) {
      securityEventStorage.addViolation(violation);
    }
  }

  // Determine if request should be allowed
  const allowed =
    riskScore < config.anomalyThreshold &&
    violations.filter((v) => v.action === "block").length === 0;

  if (!allowed && violations.length > 0) {
    // Apply blocking based on violations
    for (const violation of violations) {
      if (violation.action === "block") {
        if (
          violation.level === ViolationLevel.HIGH ||
          violation.level === ViolationLevel.CRITICAL
        ) {
          securityEventStorage.blockIP(
            ipAddress,
            config.accountLockoutDuration * 60 * 1000,
          );
          securityEventStorage.blockPhone(
            phoneValidation.sanitizedPhone,
            config.accountLockoutDuration * 60 * 1000,
          );
        }
      }
    }
  }

  // Create session if allowed
  let session;
  if (allowed) {
    session = await createSecureSession(
      phoneValidation.sanitizedPhone,
      crypto.randomUUID(),
      deviceFingerprint?.id || "unknown",
      ipAddress,
      userAgent,
    );
  }

  return {
    allowed,
    session,
    violations,
    riskScore: Math.min(100, riskScore),
    anomaly,
  };
}

// Enhanced OTP verification validation
export async function validateOTPVerification(
  phoneNumber: string,
  otpCode: string,
  request: NextRequest,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG,
): Promise<{
  allowed: boolean;
  session?: any;
  violations: SecurityViolation[];
  riskScore: number;
}> {
  const violations: SecurityViolation[] = [];
  let riskScore = 0;
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Get session from request
  const session = await getSessionFromRequest(request);
  if (!session) {
    violations.push({
      phoneNumber,
      ipAddress,
      level: ViolationLevel.MEDIUM,
      reason: "No valid session found for OTP verification",
      timestamp: Date.now(),
      count: 1,
      action: "block",
    });
    riskScore += 30;
    return {
      allowed: false,
      violations,
      riskScore,
    };
  }

  // Validate phone number matches session
  if (session.phoneNumber !== phoneNumber) {
    violations.push({
      phoneNumber,
      ipAddress,
      level: ViolationLevel.HIGH,
      reason: "Phone number mismatch in OTP verification",
      timestamp: Date.now(),
      count: 1,
      action: "block",
    });
    riskScore += 40;
  }

  // Check session lock status
  if (session.isLocked) {
    violations.push({
      phoneNumber,
      ipAddress,
      level: ViolationLevel.HIGH,
      reason: "Session is locked due to previous violations",
      timestamp: Date.now(),
      count: 1,
      action: "block",
    });
    riskScore += 35;
  }

  // Check verification attempts
  if (session.attempts >= config.maxVerificationAttempts) {
    violations.push({
      phoneNumber,
      ipAddress,
      level: ViolationLevel.HIGH,
      reason: "Maximum verification attempts exceeded",
      timestamp: Date.now(),
      count: session.attempts,
      action: "block",
    });
    riskScore += 45;
  }

  // Sanitize OTP code
  const sanitizedOTP = sanitizeOTPCode(otpCode);
  if (!sanitizedOTP) {
    violations.push({
      phoneNumber,
      ipAddress,
      level: ViolationLevel.MEDIUM,
      reason: "Invalid OTP code format",
      timestamp: Date.now(),
      count: 1,
      action: "monitor",
    });
    riskScore += 15;
  }

  // Create security event
  const securityEvent: SecurityEvent = {
    type: SecurityEventType.OTP_VERIFY,
    phoneNumber,
    ipAddress,
    userAgent,
    deviceId: session.deviceId,
    timestamp: Date.now(),
    metadata: {
      sessionId: session.id,
      attempts: session.attempts,
      violations: violations.length,
      riskScore,
    },
  };

  securityEventStorage.addEvent(securityEvent);

  const allowed = violations.length === 0;

  return {
    allowed,
    session,
    violations,
    riskScore: Math.min(100, riskScore),
  };
}

// Sanitize OTP code
export function sanitizeOTPCode(otpCode: string): string | null {
  // Remove non-digit characters
  const sanitized = otpCode.replace(/[^0-9]/g, "");

  // Validate length (4-6 digits)
  if (sanitized.length < 4 || sanitized.length > 6) {
    return null;
  }

  return sanitized;
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return request.ip || "unknown";
}

// Get active sessions (import from session management)
async function getActiveSessions(_phoneNumber: string): Promise<any[]> {
  // This would be implemented in session management
  // For now, return empty array
  return [];
}

// Get security statistics
export function getSecurityStatistics(): {
  totalEvents: number;
  totalViolations: number;
  blockedIPs: number;
  blockedPhones: number;
  topViolations: Array<{ reason: string; count: number }>;
} {
  return {
    totalEvents: 0, // Would be calculated from securityEventStorage
    totalViolations: 0,
    blockedIPs: 0,
    blockedPhones: 0,
    topViolations: [],
  };
}

// Cleanup security storage
export function cleanupSecurityStorage(): void {
  securityEventStorage.cleanup();
}

// Export storage for testing
export { SecurityEventStorage, securityEventStorage };
