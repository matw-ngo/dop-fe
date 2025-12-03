/**
 * Vietnamese Telcos Configuration Tests
 */

import {
  VIETNAMESE_TELCOS,
  ALL_VIETNAMESE_PREFIXES,
  getTelcoByPhoneNumber,
  getTelcoByCode,
  getAllTelcos,
  getOTPSettings,
  formatPhoneNumber,
  isValidVietnamesePhoneNumber,
  sanitizePhoneNumber,
  getOTPPattern,
  TELCO_ERROR_MESSAGES
} from '../vietnamese-telcos';

describe('Vietnamese Telcos Configuration', () => {
  describe('VIETNAMESE_TELCOS', () => {
    test('should contain all major Vietnamese telcos', () => {
      const telcoCodes = Object.keys(VIETNAMESE_TELCOS);
      expect(telcoCodes).toContain('VIETTEL');
      expect(telcoCodes).toContain('MOBIFONE');
      expect(telcoCodes).toContain('VINAPHONE');
      expect(telcoCodes).toContain('VIETNAMOBILE');
      expect(telcoCodes).toContain('GTEL');
    });

    test('should have valid telco configurations', () => {
      Object.values(VIETNAMESE_TELCOS).forEach((telco) => {
        expect(telco).toHaveProperty('name');
        expect(telco).toHaveProperty('code');
        expect(telco).toHaveProperty('prefixes');
        expect(telco).toHaveProperty('otpLength');
        expect(telco).toHaveProperty('maxAttempts');
        expect(telco).toHaveProperty('resendCooldown');
        expect(telco).toHaveProperty('otpExpiry');
        expect(telco).toHaveProperty('supportsShortCode');
        expect(telco).toHaveProperty('color');
        expect(telco).toHaveProperty('displayName');

        expect([4, 6]).toContain(telco.otpLength);
        expect(telco.prefixes.length).toBeGreaterThan(0);
        expect(telco.maxAttempts).toBeGreaterThan(0);
        expect(telco.resendCooldown).toBeGreaterThan(0);
        expect(telco.otpExpiry).toBeGreaterThan(0);
        expect(typeof telco.supportsShortCode).toBe('boolean');
        expect(telco.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('ALL_VIETNAMESE_PREFIXES', () => {
    test('should contain all prefixes from all telcos', () => {
      const allPrefixes = new Set();
      Object.values(VIETNAMESE_TELCOS).forEach(telco => {
        telco.prefixes.forEach(prefix => allPrefixes.add(prefix));
      });

      ALL_VIETNAMESE_PREFIXES.forEach(prefix => {
        expect(allPrefixes.has(prefix)).toBe(true);
      });
    });

    test('should be sorted by length (longest first)', () => {
      for (let i = 1; i < ALL_VIETNAMESE_PREFIXES.length; i++) {
        expect(ALL_VIETNAMESE_PREFIXES[i-1].length).toBeGreaterThanOrEqual(
          ALL_VIETNAMESE_PREFIXES[i].length
        );
      }
    });
  });

  describe('getTelcoByPhoneNumber', () => {
    test('should detect Viettel numbers correctly', () => {
      const viettelNumbers = [
        '0321234567', '0331234567', '0341234567', '0351234567',
        '0361234567', '0371234567', '0381234567', '0391234567',
        '0961234567', '0971234567', '0981234567', '0861234567', '0811234567'
      ];

      viettelNumbers.forEach(number => {
        const telco = getTelcoByPhoneNumber(number);
        expect(telco?.code).toBe('VIETTEL');
      });
    });

    test('should detect Mobifone numbers correctly', () => {
      const mobifoneNumbers = [
        '0901234567', '0931234567', '0701234567', '0791234567',
        '01201234567', '01211234567', '01221234567', '01261234567', '01281234567',
        '0891234567'
      ];

      mobifoneNumbers.forEach(number => {
        const telco = getTelcoByPhoneNumber(number);
        expect(telco?.code).toBe('MOBIFONE');
      });
    });

    test('should detect Vinaphone numbers correctly', () => {
      const vinaphoneNumbers = [
        '0911234567', '0941234567', '0831234567', '0841234567',
        '0851234567', '0811234567', '0821234567', '0881234567', '0581234567'
      ];

      vinaphoneNumbers.forEach(number => {
        const telco = getTelcoByPhoneNumber(number);
        expect(telco?.code).toBe('VINAPHONE');
      });
    });

    test('should detect Vietnamobile numbers correctly', () => {
      const vietnamobileNumbers = ['0921234567', '0561234567', '0581234567'];

      vietnamobileNumbers.forEach(number => {
        const telco = getTelcoByPhoneNumber(number);
        expect(telco?.code).toBe('VIETNAMOBILE');
      });
    });

    test('should detect Gmobile numbers correctly', () => {
      const gmobileNumbers = ['0991234567', '0591234567'];

      gmobileNumbers.forEach(number => {
        const telco = getTelcoByPhoneNumber(number);
        expect(telco?.code).toBe('GTEL');
      });
    });

    test('should handle international format', () => {
      const telco = getTelcoByPhoneNumber('+84961234567');
      expect(telco?.code).toBe('VIETTEL');
    });

    test('should return null for invalid numbers', () => {
      const invalidNumbers = ['123456789', '012345678', '+849012345678', ''];

      invalidNumbers.forEach(number => {
        const telco = getTelcoByPhoneNumber(number);
        expect(telco).toBeNull();
      });
    });
  });

  describe('getTelcoByCode', () => {
    test('should return telco by correct code', () => {
      expect(getTelcoByCode('VIETTEL')?.code).toBe('VIETTEL');
      expect(getTelcoByCode('MOBIFONE')?.code).toBe('MOBIFONE');
      expect(getTelcoByCode('VINAPHONE')?.code).toBe('VINAPHONE');
    });

    test('should handle case insensitive codes', () => {
      expect(getTelcoByCode('viettel')?.code).toBe('VIETTEL');
      expect(getTelcoByCode('Mobifone')?.code).toBe('MOBIFONE');
    });

    test('should return null for invalid codes', () => {
      expect(getTelcoByCode('INVALID')).toBeNull();
      expect(getTelcoByCode('')).toBeNull();
    });
  });

  describe('getAllTelcos', () => {
    test('should return all telcos', () => {
      const allTelcos = getAllTelcos();
      expect(allTelcos).toHaveLength(5);
      expect(allTelcos[0].code).toBe('VIETTEL');
      expect(allTelcos[1].code).toBe('MOBIFONE');
      expect(allTelcos[2].code).toBe('VINAPHONE');
      expect(allTelcos[3].code).toBe('VIETNAMOBILE');
      expect(allTelcos[4].code).toBe('GTEL');
    });
  });

  describe('getOTPSettings', () => {
    test('should return correct OTP settings for Viettel', () => {
      const settings = getOTPSettings('0961234567');
      expect(settings.otpLength).toBe(4);
      expect(settings.maxAttempts).toBe(3);
      expect(settings.resendCooldown).toBe(60);
      expect(settings.otpExpiry).toBe(300);
      expect(settings.displayName).toBe('Viettel');
    });

    test('should return correct OTP settings for Mobifone', () => {
      const settings = getOTPSettings('0901234567');
      expect(settings.otpLength).toBe(6);
      expect(settings.maxAttempts).toBe(3);
      expect(settings.resendCooldown).toBe(90);
      expect(settings.otpExpiry).toBe(600);
      expect(settings.displayName).toBe('Mobifone');
    });

    test('should return default settings for unknown numbers', () => {
      const settings = getOTPSettings('123456789');
      expect(settings.otpLength).toBe(6);
      expect(settings.maxAttempts).toBe(3);
      expect(settings.displayName).toBe('Unknown Telco');
    });
  });

  describe('formatPhoneNumber', () => {
    test('should format local numbers correctly', () => {
      expect(formatPhoneNumber('0961234567')).toBe('0961 234 567');
      expect(formatPhoneNumber('0901234567')).toBe('0901 234 567');
      expect(formatPhoneNumber('01201234567')).toBe('0120 123 4567');
    });

    test('should format international numbers correctly', () => {
      expect(formatPhoneNumber('+84961234567')).toBe('+84 961 234 567');
      expect(formatPhoneNumber('84901234567')).toBe('+84 901 234 567');
    });

    test('should return as-is for unrecognized formats', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('')).toBe('');
    });
  });

  describe('isValidVietnamesePhoneNumber', () => {
    test('should validate correct Vietnamese numbers', () => {
      const validNumbers = [
        '0961234567', '0901234567', '0911234567', '0921234567', '0991234567',
        '+84961234567', '+84901234567', '+84911234567', '+84921234567', '+84991234567'
      ];

      validNumbers.forEach(number => {
        expect(isValidVietnamesePhoneNumber(number)).toBe(true);
      });
    });

    test('should reject invalid numbers', () => {
      const invalidNumbers = [
        '123456789', '012345678', '0801234567', '+849012345678', '1234567890123'
      ];

      invalidNumbers.forEach(number => {
        expect(isValidVietnamesePhoneNumber(number)).toBe(false);
      });
    });
  });

  describe('sanitizePhoneNumber', () => {
    test('should sanitize local numbers', () => {
      expect(sanitizePhoneNumber('0961234567')).toBe('0961234567');
      expect(sanitizePhoneNumber('090-123-4567')).toBe('0901234567');
    });

    test('should convert international to local format', () => {
      expect(sanitizePhoneNumber('+84961234567')).toBe('0961234567');
      expect(sanitizePhoneNumber('84901234567')).toBe('0901234567');
    });

    test('should handle edge cases', () => {
      expect(sanitizePhoneNumber('')).toBe('');
      expect(sanitizePhoneNumber('123')).toBe('123');
    });
  });

  describe('getOTPPattern', () => {
    test('should return correct pattern for 4-digit OTP', () => {
      const pattern = getOTPPattern('0961234567'); // Viettel - 4 digits
      expect(pattern.toString()).toBe('/^\\d{4}$/');
    });

    test('should return correct pattern for 6-digit OTP', () => {
      const pattern = getOTPPattern('0901234567'); // Mobifone - 6 digits
      expect(pattern.toString()).toBe('/^\\d{6}$/');
    });

    test('should return default pattern for unknown numbers', () => {
      const pattern = getOTPPattern('123456789');
      expect(pattern.toString()).toBe('/^\\d{6}$/');
    });
  });

  describe('TELCO_ERROR_MESSAGES', () => {
    test('should contain all required error messages', () => {
      expect(TELCO_ERROR_MESSAGES.INVALID_PHONE).toBeDefined();
      expect(TELCO_ERROR_MESSAGES.UNSUPPORTED_TELCO).toBeDefined();
      expect(TELCO_ERROR_MESSAGES.INVALID_OTP_LENGTH).toBeDefined();
      expect(TELCO_ERROR_MESSAGES.OTP_EXPIRED).toBeDefined();
      expect(TELCO_ERROR_MESSAGES.MAX_ATTEMPTS_EXCEEDED).toBeDefined();
      expect(TELCO_ERROR_MESSAGES.RESEND_COOLDOWN).toBeDefined();
      expect(TELCO_ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(TELCO_ERROR_MESSAGES.INVALID_OTP).toBeDefined();
      expect(TELCO_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED).toBeDefined();
    });

    test('should have Vietnamese error messages', () => {
      Object.values(TELCO_ERROR_MESSAGES).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });
});