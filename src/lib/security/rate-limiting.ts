/**
 * Server-Side Rate Limiting Middleware
 * Provides comprehensive rate limiting for OTP endpoints with IP and phone number tracking
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  message?: string;
  statusCode?: number;
  headers?: boolean;
  trustProxy?: boolean;
}

// Rate limit record
interface RateLimitRecord {
  attempts: number;
  resetTime: number;
  lastAttempt: number;
  blocked: boolean;
}

// In-memory store (in production, use Redis or database)
class RateLimitStore {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set(key: string, record: RateLimitRecord): void {
    this.store.set(key, record);
  }

  get(key: string): RateLimitRecord | undefined {
    const record = this.store.get(key);
    if (!record) return undefined;

    // Check if record has expired
    if (Date.now() > record.resetTime) {
      this.store.delete(key);
      return undefined;
    }

    return record;
  }

  increment(key: string, windowMs: number): RateLimitRecord {
    const now = Date.now();
    const existing = this.get(key);

    if (existing) {
      existing.attempts++;
      existing.lastAttempt = now;
      return existing;
    }

    const newRecord: RateLimitRecord = {
      attempts: 1,
      resetTime: now + windowMs,
      lastAttempt: now,
      blocked: false
    };

    this.set(key, newRecord);
    return newRecord;
  }

  block(key: string, durationMs: number): void {
    const now = Date.now();
    const existing = this.get(key);

    const record: RateLimitRecord = {
      attempts: existing?.attempts || 0,
      resetTime: now + durationMs,
      lastAttempt: now,
      blocked: true
    };

    this.set(key, record);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limit store
const rateLimitStore = new RateLimitStore();

// Extract client IP from request
function getClientIP(request: NextRequest): string {
  // Check forwarded headers for real IP when behind proxy
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to connection IP (if available)
  return request.ip || 'unknown';
}

// Generate rate limit key
function generateRateLimitKey(request: NextRequest, config: RateLimitConfig): string {
  if (config.keyGenerator) {
    return config.keyGenerator(request);
  }

  const ip = getClientIP(request);
  const pathname = request.nextUrl.pathname;
  const phoneNumber = request.nextUrl.searchParams.get('phoneNumber') || '';

  return `${ip}:${pathname}:${phoneNumber}`;
}

// Rate limiting middleware
export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimitMiddleware(request: NextRequest) {
    const key = generateRateLimitKey(request, config);
    const record = rateLimitStore.get(key);

    // Check if currently blocked
    if (record?.blocked) {
      return NextResponse.json(
        {
          success: false,
          message: config.message || 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000)
        },
        {
          status: config.statusCode || 429,
          headers: config.headers ? {
            'X-RateLimit-Limit': config.maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
            'Retry-After': Math.ceil((record.resetTime - Date.now()) / 1000).toString()
          } : undefined
        }
      );
    }

    // Check rate limit
    if (record && record.attempts >= config.maxAttempts) {
      // Implement progressive delay for repeated violations
      const violationCount = Math.floor(record.attempts / config.maxAttempts);
      const blockDuration = Math.min(config.windowMs * Math.pow(2, violationCount), 24 * 60 * 60 * 1000); // Max 24 hours

      rateLimitStore.block(key, blockDuration);

      return NextResponse.json(
        {
          success: false,
          message: config.message || 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(blockDuration / 1000),
          violationCount
        },
        {
          status: config.statusCode || 429,
          headers: config.headers ? {
            'X-RateLimit-Limit': config.maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((record.resetTime + blockDuration) / 1000).toString(),
            'Retry-After': Math.ceil(blockDuration / 1000).toString()
          } : undefined
        }
      );
    }

    // Increment counter
    const newRecord = rateLimitStore.increment(key, config.windowMs);
    const remaining = Math.max(0, config.maxAttempts - newRecord.attempts);

    // Return headers if enabled
    if (config.headers) {
      return NextResponse.json(null, {
        headers: {
          'X-RateLimit-Limit': config.maxAttempts.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(newRecord.resetTime / 1000).toString()
        }
      });
    }

    return null; // Allow request to proceed
  };
}

// Pre-configured rate limiters for OTP endpoints
export const otpRateLimiters = {
  // General OTP request rate limiting (strict)
  otpRequest: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // 5 OTP requests per 15 minutes per IP/phone
    message: 'Quá nhiều yêu cầu OTP. Vui lòng thử lại sau 15 phút.',
    statusCode: 429,
    headers: true,
    skipSuccessfulRequests: false
  }),

  // OTP verification rate limiting (more lenient)
  otpVerify: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 20, // 20 verification attempts per hour
    message: 'Quá nhiều lần xác thực. Vui lòng thử lại sau.',
    statusCode: 429,
    headers: true,
    skipSuccessfulRequests: true
  }),

  // Phone number validation rate limiting
  phoneValidation: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 30, // 30 validations per 5 minutes
    message: 'Quá nhiều yêu cầu xác thực số điện thoại.',
    statusCode: 429,
    headers: true
  }),

  // Admin OTP management rate limiting
  adminOTP: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 100, // 100 admin operations per hour
    message: 'Admin rate limit exceeded.',
    statusCode: 429,
    headers: true
  })
};

// Phone number specific rate limiting
export function createPhoneNumberRateLimiter(phoneNumber: string) {
  return createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 10, // 10 OTP requests per hour per phone number
    message: 'Số điện thoại này đã đạt giới hạn yêu cầu OTP. Vui lòng thử lại sau 1 giờ.',
    statusCode: 429,
    headers: true,
    keyGenerator: () => `phone:${phoneNumber}`
  });
}

// IP-based rate limiting for abuse prevention
export function createIPRateLimiter(ip: string) {
  return createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 50, // 50 requests per hour per IP
    message: 'IP đã đạt giới hạn yêu cầu. Vui lòng thử lại sau.',
    statusCode: 429,
    headers: true,
    keyGenerator: () => `ip:${ip}`
  });
}

// Distributed rate limiting for scaling (placeholder for Redis implementation)
export interface DistributedRateLimiterConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  keyPrefix?: string;
}

export function createDistributedRateLimiter(config: RateLimitConfig & DistributedRateLimiterConfig) {
  // This would integrate with Redis for distributed rate limiting
  // For now, fall back to in-memory implementation
  console.warn('Distributed rate limiting not implemented. Falling back to in-memory.');
  return createRateLimiter(config);
}

// Rate limiting analytics
export function getRateLimitStats(): {
  totalRecords: number;
  blockedRecords: number;
  topViolators: Array<{ key: string; attempts: number }>;
} {
  const records = Array.from((rateLimitStore as any).store.entries());
  const blocked = records.filter(([, record]: [string, RateLimitRecord]) => record.blocked);

  const topViolators = records
    .sort(([, a]: [string, RateLimitRecord], [, b]: [string, RateLimitRecord]) => b.attempts - a.attempts)
    .slice(0, 10)
    .map(([key, record]) => ({ key: key.split(':')[0] || key, attempts: record.attempts }));

  return {
    totalRecords: records.length,
    blockedRecords: blocked.length,
    topViolators
  };
}

// Cleanup function for graceful shutdown
export function cleanupRateLimiting(): void {
  rateLimitStore.destroy();
}

// Export for testing
export { RateLimitStore, rateLimitStore };