/**
 * Phone Validation Tests
 */

import {
  validateVietnamesePhone,
  validatePhoneTyping,
  formatPhoneTyping,
  getPhoneSuggestions,
  isInternationalFormat,
  convertPhoneFormat,
  getPhoneMetadata,
  validatePhoneWithPreset,
  PHONE_VALIDATION_PRESETS
} from '../phone-validation';

describe('Phone Validation', () => {
  describe('validateVietnamesePhone', () => {
    test('should validate correct Vietnamese phone numbers', () => {
      const validNumbers = [
        '0961234567', '0901234567', '0911234567', '0921234567', '0991234567',
        '+84961234567', '+84901234567', '+84911234567', '+84921234567', '+84991234567'
      ];

      validNumbers.forEach(number => {
        const result = validateVietnamesePhone(number);
        expect(result.isValid).toBe(true);
        expect(result.isComplete).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    test('should reject invalid phone numbers', () => {
      const invalidNumbers = ['123456789', '012345678', '0801234567', '+849012345678'];

      invalidNumbers.forEach(number => {
        const result = validateVietnamesePhone(number);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    test('should handle empty input', () => {
      const result = validateVietnamesePhone('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Vui lòng nhập số điện thoại');
    });

    test('should include telco information for valid numbers', () => {
      const result = validateVietnamesePhone('0961234567');
      expect(result.telco).toBe('Viettel');
    });
  });

  describe('validatePhoneTyping', () => {
    test('should be more lenient for typing validation', () => {
      const result = validatePhoneTyping('096');
      expect(result.isValid).toBe(false); // Not complete yet
      expect(result.error).toBeUndefined(); // No error for partial input
    });

    test('should validate complete numbers', () => {
      const result = validatePhoneTyping('0961234567');
      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(true);
    });

    test('should handle empty input gracefully', () => {
      const result = validatePhoneTyping('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeUndefined();
    });

    test('should detect telco for partial valid prefixes', () => {
      const result = validatePhoneTyping('096');
      expect(result.telco).toBe('Viettel');
    });
  });

  describe('formatPhoneTyping', () => {
    test('should format local numbers as user types', () => {
      expect(formatPhoneTyping('0961234567')).toBe('0961 234 567');
      expect(formatPhoneTyping('0961234')).toBe('0961 234');
      expect(formatPhoneTyping('096')).toBe('096');
    });

    test('should format international numbers', () => {
      expect(formatPhoneTyping('+84961234567')).toBe('+84 961 234 567');
      expect(formatPhoneTyping('84961234567')).toBe('+84 961 234 567');
      expect(formatPhoneTyping('+84961')).toBe('+84 961');
    });

    test('should handle edge cases', () => {
      expect(formatPhoneTyping('')).toBe('');
      expect(formatPhoneTyping('123')).toBe('123');
    });
  });

  describe('getPhoneSuggestions', () => {
    test('should generate suggestions for partial numbers', () => {
      const suggestions = getPhoneSuggestions('096');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('096');
    });

    test('should return empty suggestions for too short input', () => {
      const suggestions = getPhoneSuggestions('09');
      expect(suggestions).toHaveLength(0);
    });

    test('should limit suggestions to 5 items', () => {
      const suggestions = getPhoneSuggestions('0');
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('isInternationalFormat', () => {
    test('should identify international format correctly', () => {
      expect(isInternationalFormat('+84961234567')).toBe(true);
      expect(isInternationalFormat('84961234567')).toBe(false);
      expect(isInternationalFormat('0961234567')).toBe(false);
    });
  });

  describe('convertPhoneFormat', () => {
    test('should convert local to international format', () => {
      const international = convertPhoneFormat('0961234567', true);
      expect(international).toBe('+84961234567');
    });

    test('should convert international to local format', () => {
      const local = convertPhoneFormat('+84961234567', false);
      expect(local).toBe('0961234567');
    });

    test('should handle 84 prefix correctly', () => {
      const local = convertPhoneFormat('84961234567', false);
      expect(local).toBe('0961234567');
    });
  });

  describe('getPhoneMetadata', () => {
    test('should return comprehensive metadata', () => {
      const metadata = getPhoneMetadata('0961234567');
      expect(metadata.phoneNumber).toBe('0961234567');
      expect(metadata.formattedNumber).toBe('0961 234 567');
      expect(metadata.internationalNumber).toBe('+84961234567');
      expect(metadata.telco).toBe('Viettel');
      expect(metadata.telcoCode).toBe('VIETTEL');
      expect(metadata.isInternational).toBe(false);
      expect(metadata.isValid).toBe(true);
    });

    test('should handle international numbers', () => {
      const metadata = getPhoneMetadata('+84961234567');
      expect(metadata.isInternational).toBe(true);
      expect(metadata.telco).toBe('Viettel');
    });

    test('should handle invalid numbers', () => {
      const metadata = getPhoneMetadata('123456789');
      expect(metadata.isValid).toBe(false);
      expect(metadata.telco).toBeUndefined();
    });
  });

  describe('validatePhoneWithPreset', () => {
    test('should use LOOSE preset for more lenient validation', () => {
      const result = validatePhoneWithPreset('096', 'LOOSE');
      expect(result.isValid).toBe(false); // Still not valid
      expect(result.phoneNumber).toBe('096');
    });

    test('should use STANDARD preset for normal validation', () => {
      const result = validatePhoneWithPreset('0961234567', 'STANDARD');
      expect(result.isValid).toBe(true);
    });

    test('should use STRICT preset for strict validation', () => {
      const result = validatePhoneWithPreset('0961234567', 'STRICT');
      expect(result.isValid).toBe(true);
      expect(result.telco).toBeDefined(); // Must have known telco
    });

    test('should reject unknown telco with STRICT preset', () => {
      const result = validatePhoneWithPreset('1234567890', 'STRICT');
      expect(result.isValid).toBe(false);
    });
  });

  describe('PHONE_VALIDATION_PRESETS', () => {
    test('should contain all required presets', () => {
      expect(PHONE_VALIDATION_PRESETS.LOOSE).toBeDefined();
      expect(PHONE_VALIDATION_PRESETS.STANDARD).toBeDefined();
      expect(PHONE_VALIDATION_PRESETS.STRICT).toBeDefined();
    });

    test('should have correct preset configurations', () => {
      expect(PHONE_VALIDATION_PRESETS.LOOSE.allowPartial).toBe(true);
      expect(PHONE_VALIDATION_PRESETS.STANDARD.allowPartial).toBe(false);
      expect(PHONE_VALIDATION_PRESETS.STRICT.allowPartial).toBe(false);

      expect(PHONE_VALIDATION_PRESETS.STRICT.requireKnownTelco).toBe(true);
      expect(PHONE_VALIDATION_PRESETS.STANDARD.requireKnownTelco).toBeUndefined();
      expect(PHONE_VALIDATION_PRESETS.LOOSE.requireKnownTelco).toBeUndefined();
    });
  });
});