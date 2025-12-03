/**
 * Vietnamese phone number validation utilities
 * Provides comprehensive validation for Vietnamese mobile numbers across all carriers
 */

import {
  ALL_VIETNAMESE_PREFIXES,
  isValidVietnamesePhoneNumber,
  sanitizePhoneNumber,
  formatPhoneNumber,
  getTelcoByPhoneNumber
} from './vietnamese-telcos';

export interface PhoneValidationResult {
  isValid: boolean;
  isComplete: boolean;
  phoneNumber: string;
  formattedNumber: string;
  telco?: string;
  error?: string;
  suggestion?: string;
}

export interface PhoneValidationRule {
  test: (phone: string) => boolean;
  message: string;
  suggestion?: string;
}

/**
 * Vietnamese phone number validation rules
 */
const VIETNAMESE_PHONE_RULES: PhoneValidationRule[] = [
  {
    test: (phone) => phone.length >= 9,
    message: 'Số điện thoại quá ngắn',
    suggestion: 'Số điện thoại Việt Nam có 10-11 số'
  },
  {
    test: (phone) => phone.length <= 11,
    message: 'Số điện thoại quá dài',
    suggestion: 'Số điện thoại Việt Nam có 10-11 số'
  },
  {
    test: (phone) => /^(\+84|0|84)/.test(phone),
    message: 'Số điện thoại phải bắt đầu bằng +84, 84, hoặc 0',
    suggestion: 'Ví dụ: 0912345678, +84912345678, hoặc 84912345678'
  },
  {
    test: (phone) => {
      const cleanPhone = phone.replace(/\D/g, '');
      return ALL_VIETNAMESE_PREFIXES.some(prefix => {
        if (cleanPhone.startsWith('84')) {
          return cleanPhone.startsWith('84' + prefix.slice(1));
        }
        return cleanPhone.startsWith(prefix);
      });
    },
    message: 'Đầu số điện thoại không hợp lệ',
    suggestion: 'Vui lòng sử dụng đầu số của các nhà mạng Việt Nam (09x, 03x, 05x, 07x, 08x)'
  },
  {
    test: (phone) => {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.startsWith('84')) {
        return cleanPhone.length === 11;
      }
      return cleanPhone.length === 10;
    },
    message: 'Độ dài số điện thoại không hợp lệ',
    suggestion: 'Số điện thoại Việt Nam có 10 số (đầu số 0) hoặc 11 số (đầu số +84)'
  }
];

/**
 * Validate Vietnamese phone number format
 */
export const validateVietnamesePhone = (input: string): PhoneValidationResult => {
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      isComplete: false,
      phoneNumber: '',
      formattedNumber: '',
      error: 'Vui lòng nhập số điện thoại'
    };
  }

  const sanitized = sanitizePhoneNumber(input);
  const cleanPhone = input.replace(/\D/g, '');

  // Basic validation checks
  for (const rule of VIETNAMESE_PHONE_RULES) {
    if (!rule.test(cleanPhone)) {
      return {
        isValid: false,
        isComplete: false,
        phoneNumber: sanitized,
        formattedNumber: formatPhoneNumber(sanitized),
        error: rule.message,
        suggestion: rule.suggestion
      };
    }
  }

  // Check if it's a valid Vietnamese number
  const isValid = isValidVietnamesePhoneNumber(sanitized);
  const telco = getTelcoByPhoneNumber(sanitized);

  if (!isValid) {
    return {
      isValid: false,
      isComplete: false,
      phoneNumber: sanitized,
      formattedNumber: formatPhoneNumber(sanitized),
      error: 'Số điện thoại không thuộc nhà mạng Việt Nam',
      suggestion: 'Vui lòng kiểm tra lại số điện thoại'
    };
  }

  return {
    isValid: true,
    isComplete: sanitized.length >= 10,
    phoneNumber: sanitized,
    formattedNumber: formatPhoneNumber(sanitized),
    telco: telco?.name
  };
};

/**
 * Real-time phone validation as user types
 */
export const validatePhoneTyping = (input: string): PhoneValidationResult => {
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      isComplete: false,
      phoneNumber: '',
      formattedNumber: '',
      error: undefined
    };
  }

  const sanitized = sanitizePhoneNumber(input);
  const cleanPhone = input.replace(/\D/g, '');

  // For typing validation, we're more lenient
  if (cleanPhone.length < 3) {
    return {
      isValid: false,
      isComplete: false,
      phoneNumber: sanitized,
      formattedNumber: formatPhoneNumber(sanitized),
      error: undefined
    };
  }

  // Check if prefix matches any Vietnamese telco
  const hasValidPrefix = ALL_VIETNAMESE_PREFIXES.some(prefix => {
    if (cleanPhone.startsWith('84')) {
      return cleanPhone.startsWith('84' + prefix.slice(1));
    }
    return cleanPhone.startsWith(prefix);
  });

  if (!hasValidPrefix && cleanPhone.length >= 3) {
    return {
      isValid: false,
      isComplete: false,
      phoneNumber: sanitized,
      formattedNumber: formatPhoneNumber(sanitized),
      error: 'Đầu số không hợp lệ',
      suggestion: 'Ví dụ: 09x, 03x, 05x, 07x, 08x'
    };
  }

  const isValid = cleanPhone.length === 10 ||
    (cleanPhone.startsWith('84') && cleanPhone.length === 11);

  const telco = getTelcoByPhoneNumber(sanitized);

  return {
    isValid: isValid,
    isComplete: isValid,
    phoneNumber: sanitized,
    formattedNumber: formatPhoneNumber(sanitized),
    telco: telco?.name
  };
};

/**
 * Format phone number as user types
 */
export const formatPhoneTyping = (input: string): string => {
  const clean = input.replace(/\D/g, '');

  if (clean.startsWith('84')) {
    if (clean.length <= 2) return '+84';
    if (clean.length <= 5) return `+84 ${clean.slice(2)}`;
    if (clean.length <= 8) return `+84 ${clean.slice(2, 5)} ${clean.slice(5)}`;
    return `+84 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 11)}`;
  } else {
    if (clean.length <= 4) return clean;
    if (clean.length <= 7) return `${clean.slice(0, 4)} ${clean.slice(4)}`;
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 10)}`;
  }
};

/**
 * Get phone number input suggestions
 */
export const getPhoneSuggestions = (partialPhone: string): string[] => {
  const clean = partialPhone.replace(/\D/g, '');

  if (clean.length < 3) return [];

  const suggestions: string[] = [];

  // Generate suggestions based on telco prefixes
  ALL_VIETNAMESE_PREFIXES.forEach(prefix => {
    if (prefix.startsWith(clean) || clean.startsWith(prefix)) {
      // Add examples for this prefix
      const exampleNumber = `${prefix}123456`;
      suggestions.push(formatPhoneNumber(exampleNumber));
    }
  });

  return [...new Set(suggestions)].slice(0, 5); // Return up to 5 unique suggestions
};

/**
 * Check if phone number format is international
 */
export const isInternationalFormat = (phoneNumber: string): boolean => {
  const clean = phoneNumber.replace(/\D/g, '');
  return clean.startsWith('84') && !phoneNumber.startsWith('0');
};

/**
 * Convert phone number between formats
 */
export const convertPhoneFormat = (phoneNumber: string, toInternational: boolean = true): string => {
  const clean = phoneNumber.replace(/\D/g, '');

  if (toInternational && clean.startsWith('0')) {
    return `+84${clean.slice(1)}`;
  } else if (!toInternational && clean.startsWith('84')) {
    return `0${clean.slice(2)}`;
  }

  return phoneNumber;
};

/**
 * Extract phone number metadata
 */
export const getPhoneMetadata = (phoneNumber: string) => {
  const clean = phoneNumber.replace(/\D/g, '');
  const telco = getTelcoByPhoneNumber(phoneNumber);

  return {
    phoneNumber: sanitizePhoneNumber(phoneNumber),
    formattedNumber: formatPhoneNumber(phoneNumber),
    internationalNumber: convertPhoneFormat(phoneNumber, true),
    localNumber: convertPhoneFormat(phoneNumber, false),
    telco: telco?.name,
    telcoCode: telco?.code,
    isInternational: isInternationalFormat(phoneNumber),
    isValid: isValidVietnamesePhoneNumber(phoneNumber),
    length: clean.length,
    countryCode: clean.startsWith('84') ? '+84' : '+84',
    prefix: telco ? ALL_VIETNAMESE_PREFIXES.find(p => clean.includes(p)) : undefined
  };
};

/**
 * Phone validation presets for different use cases
 */
export const PHONE_VALIDATION_PRESETS = {
  LOOSE: {
    allowPartial: true,
    minLength: 3,
    maxLength: 15,
    requireVietnamese: false
  },
  STANDARD: {
    allowPartial: false,
    minLength: 10,
    maxLength: 11,
    requireVietnamese: true
  },
  STRICT: {
    allowPartial: false,
    minLength: 10,
    maxLength: 11,
    requireVietnamese: true,
    requireKnownTelco: true
  }
};

/**
 * Validate with preset configuration
 */
export const validatePhoneWithPreset = (
  input: string,
  preset: keyof typeof PHONE_VALIDATION_PRESETS = 'STANDARD'
): PhoneValidationResult => {
  const config = PHONE_VALIDATION_PRESETS[preset];
  const result = validateVietnamesePhone(input);

  if (config.allowPartial) {
    const typingResult = validatePhoneTyping(input);
    return {
      ...typingResult,
      isValid: typingResult.phoneNumber.length >= config.minLength && typingResult.phoneNumber.length <= config.maxLength
    };
  }

  return {
    ...result,
    isValid: result.isValid &&
      result.phoneNumber.length >= config.minLength &&
      result.phoneNumber.length <= config.maxLength &&
      (!config.requireVietnamese || isValidVietnamesePhoneNumber(result.phoneNumber)) &&
      (!config.requireKnownTelco || !!result.telco)
  };
};

export default {
  validateVietnamesePhone,
  validatePhoneTyping,
  formatPhoneTyping,
  getPhoneSuggestions,
  isInternationalFormat,
  convertPhoneFormat,
  getPhoneMetadata,
  validatePhoneWithPreset,
  PHONE_VALIDATION_PRESETS
};