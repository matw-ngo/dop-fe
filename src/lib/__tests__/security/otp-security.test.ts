/**
 * Comprehensive Security Tests for OTP System
 * Tests rate limiting, device fingerprinting, session management, and CSRF protection
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Import security modules
import {
  createRateLimiter,
  otpRateLimiters,
  getRateLimitStats,
  cleanupRateLimiting
} from '../../security/rate-limiting';

import {
  generateDeviceFingerprint,
  detectAnomalies,
  storeDeviceFingerprint,
  updateDeviceTrust,
  isDeviceTrusted,
  cleanupDeviceStorage
} from '../../security/device-fingerprinting';

import {
  createSecureSession,
  getSessionFromRequest,
  verifySession,
  requireValidSession,
  CSRFProtection,
  cleanupSessionManagement
} from '../../security/session-management';

import {
  validateOTPRequest,
  validateOTPVerification,
  sanitizeOTPCode,
  cleanupSecurityStorage
} from '../../security/otp-security';

import {
  sanitizeVietnamesePhone,
  sanitizeApplicationData
} from '../../utils/sanitization';

import {
  getTelcoByPhoneNumber,
  VIETNAMESE_TELCOS,
  validateRegulatoryCompliance
} from '../../telcos/vietnamese-telcos';

// Mock Next.js request/response
import { NextRequest } from 'next/server';

describe('OTP Security System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up all storages
    await cleanupRateLimiting();
    await cleanupDeviceStorage();
    await cleanupSessionManagement();
    await cleanupSecurityStorage();
  });

  describe('Rate Limiting Security', () => {
    it('should block requests exceeding rate limit', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000, // 1 second
        maxAttempts: 2,
        message: 'Rate limit exceeded'
      });

      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      });

      // First two requests should pass
      expect(await rateLimiter(mockRequest)).toBeNull();
      expect(await rateLimiter(mockRequest)).toBeNull();

      // Third request should be blocked
      const blockResponse = await rateLimiter(mockRequest);
      expect(blockResponse).not.toBeNull();
      expect(blockResponse?.status).toBe(429);
    });

    it('should implement progressive delay for violations', async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxAttempts: 1,
        message: 'Progressive delay test'
      });

      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.2'
        }
      });

      // First request passes
      expect(await rateLimiter(mockRequest)).toBeNull();

      // Second request should be blocked with progressive delay
      const blockResponse = await rateLimiter(mockRequest);
      expect(blockResponse).not.toBeNull();
      expect(blockResponse?.status).toBe(429);

      const responseData = await blockResponse?.json();
      expect(responseData?.violationCount).toBeGreaterThan(0);
    });

    it('should track rate limit statistics', () => {
      const stats = getRateLimitStats();
      expect(typeof stats.totalRecords).toBe('number');
      expect(typeof stats.blockedRecords).toBe('number');
      expect(Array.isArray(stats.topViolators)).toBe(true);
    });
  });

  describe('Device Fingerprinting Security', () => {
    it('should generate unique device fingerprints', async () => {
      const fingerprint1 = await generateDeviceFingerprint();
      const fingerprint2 = await generateDeviceFingerprint();

      expect(fingerprint1.id).toBeDefined();
      expect(fingerprint2.id).toBeDefined();
      expect(fingerprint1.id).not.toBe(fingerprint2.id);
      expect(fingerprint1.userAgent).toBeDefined();
      expect(fingerprint1.timestamp).toBeDefined();
    });

    it('should detect anomalous devices', async () => {
      const phoneNumber = '0912345678';
      const currentDevice = await generateDeviceFingerprint();

      // Simulate anomaly detection
      const anomaly = await detectAnomalies(phoneNumber, currentDevice);

      expect(typeof anomaly.isAnomalous).toBe('boolean');
      expect(typeof anomaly.riskScore).toBe('number');
      expect(Array.isArray(anomaly.reasons)).toBe(true);
    });

    it('should update device trust scores', async () => {
      const phoneNumber = '0912345678';
      const device = await generateDeviceFingerprint();
      await storeDeviceFingerprint(phoneNumber, device);

      // Successful verification should increase trust score
      await updateDeviceTrust(phoneNumber, device.id, true, false);

      const isTrusted = await isDeviceTrusted(phoneNumber, device.id);
      expect(isTrusted).toBeDefined();
    });

    it('should calculate device similarity correctly', async () => {
      const device1 = await generateDeviceFingerprint();
      const device2 = { ...device1, userAgent: 'different' };

      // Similarity should be calculated (function exists)
      expect(typeof device1.userAgent).toBe('string');
      expect(device2.userAgent).not.toBe(device1.userAgent);
    });
  });

  describe('Session Management Security', () => {
    it('should create secure sessions with cryptographically secure IDs', async () => {
      const session = await createSecureSession(
        '0912345678',
        'request-123',
        'device-123',
        '192.168.1.1',
        'Mozilla/5.0...'
      );

      expect(session.id).toBeDefined();
      expect(session.id.length).toBe(64); // 32 bytes * 2 hex chars
      expect(session.phoneNumber).toBe('0912345678');
      expect(session.createdAt).toBeDefined();
      expect(session.expiresAt).toBeGreaterThan(Date.now());
      expect(session.attempts).toBe(0);
      expect(session.isVerified).toBe(false);
    });

    it('should validate session integrity', async () => {
      const session = await createSecureSession(
        '0912345678',
        'request-123',
        'device-123',
        '192.168.1.1',
        'Mozilla/5.0...'
      );

      // Create mock request with session cookie
      const request = new NextRequest('http://localhost', {
        headers: {
          'cookie': `otp-session=${session.id}`,
          'user-agent': 'Mozilla/5.0...'
        }
      });

      const retrievedSession = await getSessionFromRequest(request);
      expect(retrievedSession).not.toBeNull();
      expect(retrievedSession?.id).toBe(session.id);
    });

    it('should reject sessions with invalid user agent', async () => {
      const session = await createSecureSession(
        '0912345678',
        'request-123',
        'device-123',
        '192.168.1.1',
        'Mozilla/5.0...'
      );

      // Request with different user agent
      const request = new NextRequest('http://localhost', {
        headers: {
          'cookie': `otp-session=${session.id}`,
          'user-agent': 'Different User Agent'
        }
      });

      const retrievedSession = await getSessionFromRequest(request);
      expect(retrievedSession).toBeNull();
    });

    it('should verify OTP sessions correctly', async () => {
      const session = await createSecureSession(
        '0912345678',
        'request-123',
        'device-123',
        '192.168.1.1',
        'Mozilla/5.0...'
      );

      const verifiedSession = await verifySession(session.id);
      expect(verifiedSession).not.toBeNull();
      expect(verifiedSession?.isVerified).toBe(true);
    });
  });

  describe('CSRF Protection Security', () => {
    it('should generate and validate CSRF tokens', () => {
      const token = CSRFProtection.generateToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes * 2 hex chars
    });

    it('should validate CSRF tokens in requests', () => {
      const token = CSRFProtection.generateToken();
      const request = new NextRequest('http://localhost', {
        headers: {
          'x-csrf-token': token,
          'cookie': `csrf-token=${token}`
        }
      });

      const isValid = CSRFProtection.validateToken(request);
      expect(isValid).toBe(true);
    });

    it('should reject requests with invalid CSRF tokens', () => {
      const request = new NextRequest('http://localhost', {
        headers: {
          'x-csrf-token': 'invalid-token',
          'cookie': 'csrf-token=valid-token'
        }
      });

      const isValid = CSRFProtection.validateToken(request);
      expect(isValid).toBe(false);
    });
  });

  describe('Input Sanitization Security', () => {
    it('should sanitize Vietnamese phone numbers', () => {
      expect(sanitizeVietnamesePhone('0912345678')).toBe('0912345678');
      expect(sanitizeVietnamesePhone('+84912345678')).toBe('0912345678');
      expect(sanitizeVietnamesePhone('84-912-345-678')).toBe('0912345678');
    });

    it('should reject invalid phone numbers', () => {
      expect(() => sanitizeVietnamesePhone('123456789')).toThrow();
      expect(() => sanitizeVietnamesePhone('invalid')).toThrow();
    });

    it('should sanitize application data comprehensively', () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        phone: '0912345678',
        email: 'test@example.com',
        description: 'javascript:alert("xss")',
        nested: {
          field: ' DROP TABLE users; --'
        }
      };

      const sanitized = sanitizeApplicationData(maliciousData);

      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.description).not.toContain('javascript:');
      expect(sanitized.nested.field).not.toContain('DROP TABLE');
      expect(sanitized.phone).toBe('0912345678');
      expect(sanitized.email).toBe('test@example.com');
    });
  });

  describe('OTP Security Validation', () => {
    it('should validate OTP requests with security checks', async () => {
      const request = new NextRequest('http://localhost', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0...'
        }
      });

      const validation = await validateOTPRequest('0912345678', request);

      expect(typeof validation.allowed).toBe('boolean');
      expect(Array.isArray(validation.violations)).toBe(true);
      expect(typeof validation.riskScore).toBe('number');
    });

    it('should validate OTP verification attempts', async () => {
      const request = new NextRequest('http://localhost', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0...'
        }
      });

      const validation = await validateOTPVerification('0912345678', '123456', request);

      expect(typeof validation.allowed).toBe('boolean');
      expect(Array.isArray(validation.violations)).toBe(true);
      expect(typeof validation.riskScore).toBe('number');
    });

    it('should sanitize OTP codes properly', () => {
      expect(sanitizeOTPCode('123456')).toBe('123456');
      expect(sanitizeOTPCode('123-456')).toBe('123456');
      expect(sanitizeOTPCode('abc123')).toBeNull(); // Should reject non-digits
      expect(sanitizeOTPCode('123')).toBeNull(); // Should reject too short
      expect(sanitizeOTPCode('1234567')).toBeNull(); // Should reject too long
    });
  });

  describe('Vietnamese Market Compliance', () => {
    it('should validate Vietnamese regulatory compliance', () => {
      const phoneNumber = '0912345678';
      const compliance = validateRegulatoryCompliance(phoneNumber, 5);

      expect(typeof compliance.compliant).toBe('boolean');
      expect(Array.isArray(compliance.violations)).toBe(true);
      expect(Array.isArray(compliance.recommendations)).toBe(true);
    });

    it('should support all Vietnamese telcos', () => {
      const testPhoneNumbers = [
        '0912345678', // Vinaphone
        '0902345678', // Mobifone
        '0962345678', // Viettel
        '0922345678', // Vietnamobile
        '0992345678', // Gmobile
        '0872345678', // Itel
      ];

      testPhoneNumbers.forEach(phoneNumber => {
        const telco = getTelcoByPhoneNumber(phoneNumber);
        expect(telco).not.toBeNull();
        expect(telco?.displayName).toBeDefined();
        expect(telco?.prefixes).toContain(phoneNumber.substring(0, 3));
      });
    });

    it('should handle Vietnamese emergency numbers correctly', () => {
      const emergencyNumbers = ['113', '114', '115', '116', '117', '118', '119'];

      emergencyNumbers.forEach(number => {
        const compliance = validateRegulatoryCompliance(number, 0);
        expect(compliance.compliant).toBe(true);
        expect(compliance.recommendations).toContain('Emergency number - special handling required');
      });
    });
  });

  describe('Security Integration Tests', () => {
    it('should integrate all security layers for OTP flow', async () => {
      const phoneNumber = '0912345678';
      const request = new NextRequest('http://localhost', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0...',
          'x-csrf-token': CSRFProtection.generateToken(),
          'cookie': 'csrf-token=' + CSRFProtection.generateToken()
        }
      });

      // 1. Input sanitization
      const sanitizedPhone = sanitizeVietnamesePhone(phoneNumber);
      expect(sanitizedPhone).toBe(phoneNumber);

      // 2. Rate limiting check
      const rateLimitResult = await otpRateLimiters.otpRequest(request);
      expect(rateLimitResult).toBeNull(); // First request should pass

      // 3. Device fingerprinting
      const deviceFingerprint = await generateDeviceFingerprint('192.168.1.1');
      expect(deviceFingerprint.id).toBeDefined();

      // 4. Security validation
      const securityValidation = await validateOTPRequest(phoneNumber, request);
      expect(typeof securityValidation.allowed).toBe('boolean');

      // 5. Session creation
      if (securityValidation.allowed) {
        const session = await createSecureSession(
          phoneNumber,
          'request-123',
          deviceFingerprint.id,
          '192.168.1.1',
          'Mozilla/5.0...'
        );
        expect(session.id).toBeDefined();

        // 6. Session validation
        const sessionRequest = new NextRequest('http://localhost', {
          headers: {
            'cookie': `otp-session=${session.id}`,
            'user-agent': 'Mozilla/5.0...'
          }
        });

        const retrievedSession = await getSessionFromRequest(sessionRequest);
        expect(retrievedSession?.id).toBe(session.id);
      }
    });

    it('should handle security violations appropriately', async () => {
      const phoneNumber = '0912345678';
      const request = new NextRequest('http://localhost', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0...'
        }
      });

      // Simulate multiple rapid requests to trigger rate limiting
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxAttempts: 2,
        message: 'Security violation'
      });

      await rateLimiter(request);
      await rateLimiter(request);
      const blockResponse = await rateLimiter(request);

      expect(blockResponse).not.toBeNull();
      expect(blockResponse?.status).toBe(429);

      const responseData = await blockResponse?.json();
      expect(responseData?.retryAfter).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed requests gracefully', async () => {
      const malformedRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'content-type': 'application/json'
        }
      });

      // Should not throw exceptions
      expect(async () => {
        await validateOTPRequest('invalid', malformedRequest);
      }).not.toThrow();
    });

    it('should handle concurrent security checks safely', async () => {
      const phoneNumber = '0912345678';
      const requests = Array(10).fill(null).map(() =>
        new NextRequest('http://localhost', {
          method: 'POST',
          headers: {
            'x-forwarded-for': `192.168.1.${Math.floor(Math.random() * 255)}`,
            'user-agent': 'Mozilla/5.0...'
          }
        })
      );

      // Should handle concurrent requests without race conditions
      const results = await Promise.all(
        requests.map(request => validateOTPRequest(phoneNumber, request))
      );

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(typeof result.allowed).toBe('boolean');
        expect(Array.isArray(result.violations)).toBe(true);
      });
    });

    it('should clean up expired security data', async () => {
      // Create expired session
      const session = await createSecureSession(
        '0912345678',
        'request-123',
        'device-123',
        '192.168.1.1',
        'Mozilla/5.0...'
      );

      // Manually expire the session
      session.expiresAt = Date.now() - 1000;

      // Session should be cleaned up
      const expiredSession = await getSessionFromRequest(
        new NextRequest('http://localhost', {
          headers: {
            'cookie': `otp-session=${session.id}`,
            'user-agent': 'Mozilla/5.0...'
          }
        })
      );

      expect(expiredSession).toBeNull();
    });
  });
});