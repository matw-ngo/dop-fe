/**
 * Phone Validation Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePhoneValidation } from '../use-phone-validation';

// Mock the telco utilities
jest.mock('@/lib/telcos/phone-validation', () => ({
  validateVietnamesePhone: jest.fn(),
  validatePhoneTyping: jest.fn(),
  getPhoneSuggestions: jest.fn(),
  getPhoneMetadata: jest.fn(),
  PHONE_VALIDATION_PRESETS: {
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
  }
}));

jest.mock('@/lib/telcos/telco-detector', () => ({
  detectTelco: jest.fn(),
  recordUserCorrection: jest.fn(),
  recordSuccessfulDetection: jest.fn()
}));

jest.mock('@/lib/utils/debounce', () => ({
  debounce: (fn: Function) => fn // Return function directly for testing
}));

import { validateVietnamesePhone, validatePhoneTyping, getPhoneSuggestions, getPhoneMetadata } from '@/lib/telcos/phone-validation';
import { detectTelco, recordUserCorrection } from '@/lib/telcos/telco-detector';

const mockValidateVietnamesePhone = validateVietnamesePhone as jest.MockedFunction<typeof validateVietnamesePhone>;
const mockValidatePhoneTyping = validatePhoneTyping as jest.MockedFunction<typeof validatePhoneTyping>;
const mockGetPhoneSuggestions = getPhoneSuggestions as jest.MockedFunction<typeof getPhoneSuggestions>;
const mockGetPhoneMetadata = getPhoneMetadata as jest.MockedFunction<typeof getPhoneMetadata>;
const mockDetectTelco = detectTelco as jest.MockedFunction<typeof detectTelco>;

describe('usePhoneValidation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockValidatePhoneTyping.mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '',
      formattedNumber: '',
      telco: undefined,
      error: undefined,
      suggestion: undefined
    });

    mockValidateVietnamesePhone.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '0961234567',
      formattedNumber: '0961 234 567',
      telco: 'Viettel',
      error: undefined,
      suggestion: undefined
    });

    mockGetPhoneSuggestions.mockReturnValue([]);
    mockGetPhoneMetadata.mockReturnValue({
      phoneNumber: '0961234567',
      formattedNumber: '0961 234 567',
      internationalNumber: '+84961234567',
      telco: 'Viettel',
      telcoCode: 'VIETTEL',
      isInternational: false,
      isValid: true
    });
    mockDetectTelco.mockReturnValue({
      telco: { code: 'VIETTEL', name: 'Viettel' },
      confidence: 0.98,
      phoneNumber: '0961234567',
      detectionMethod: 'prefix'
    });
  });

  test('initializes with default state', () => {
    const { result } = renderHook(() => usePhoneValidation());

    expect(result.current.phoneNumber).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isTouched).toBe(false);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.suggestions).toEqual([]);
  });

  test('initializes with initial phone number', () => {
    const { result } = renderHook(() => usePhoneValidation({
      phoneNumber: '0961234567'
    }));

    expect(result.current.phoneNumber).toBe('0961234567');
  });

  test('sets phone number and triggers validation', async () => {
    const onValidationChange = jest.fn();
    const onTelcoChange = jest.fn();
    const onSuggestionsChange = jest.fn();

    const { result } = renderHook(() => usePhoneValidation({
      onValidationChange,
      onTelcoChange,
      onSuggestionsChange
    }));

    mockValidatePhoneTyping.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '0961234567',
      formattedNumber: '0961 234 567',
      telco: 'Viettel'
    });

    mockGetPhoneSuggestions.mockReturnValue(['0961234567', '0962345678']);

    await act(async () => {
      result.current.setPhoneNumber('0961234567');
    });

    expect(mockValidatePhoneTyping).toHaveBeenCalledWith('0961234567');
    expect(mockGetPhoneSuggestions).toHaveBeenCalledWith('0961234567');
    expect(result.current.phoneNumber).toBe('0961234567');
    expect(result.current.isValid).toBe(true);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.suggestions).toEqual(['0961234567', '0962345678']);

    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalled();
      expect(onTelcoChange).toHaveBeenCalled();
      expect(onSuggestionsChange).toHaveBeenCalled();
    });
  });

  test('handles validation for typing', () => {
    const { result } = renderHook(() => usePhoneValidation());

    mockValidatePhoneTyping.mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '096',
      formattedNumber: '096',
      telco: 'Viettel',
      error: undefined
    });

    const validationResult = result.current.validateTyping('096');

    expect(mockValidatePhoneTyping).toHaveBeenCalledWith('096');
    expect(validationResult.phoneNumber).toBe('096');
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.telco).toBe('Viettel');
  });

  test('formats phone number', () => {
    const { result } = renderHook(() => usePhoneValidation());

    const formatted = result.current.formatPhoneNumber('0961234567');

    expect(mockGetPhoneMetadata).toHaveBeenCalledWith('0961234567');
    expect(formatted).toBe('0961 234 567');
  });

  test('sanitizes phone number', () => {
    const { result } = renderHook(() => usePhoneValidation());

    const sanitized = result.current.sanitizePhoneNumber('096-123-4567');

    expect(mockGetPhoneMetadata).toHaveBeenCalledWith('096-123-4567');
    expect(sanitized).toBe('0961234567');
  });

  test('validates phone number manually', () => {
    const onValidationChange = jest.fn();
    const { result } = renderHook(() => usePhoneValidation({
      onValidationChange
    }));

    mockValidateVietnamesePhone.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '0961234567',
      formattedNumber: '0961 234 567',
      telco: 'Viettel'
    });

    act(() => {
      result.current.setPhoneNumber('0961234567');
    });

    const validationResult = result.current.validate();

    expect(mockValidateVietnamesePhone).toHaveBeenCalledWith('0961234567');
    expect(validationResult.isValid).toBe(true);
    expect(result.current.isValid).toBe(true);
    expect(onValidationChange).toHaveBeenCalledWith(validationResult);
  });

  test('records user correction', () => {
    const { result } = renderHook(() => usePhoneValidation({
      enableLearning: true
    }));

    act(() => {
      result.current.setPhoneNumber('0961234567');
      // Mock telco detection result
      mockDetectTelco.mockReturnValue({
        telco: { code: 'VIETTEL', name: 'Viettel' },
        confidence: 0.98,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix'
      });
    });

    act(() => {
      result.current.recordCorrection('MOBIFONE');
    });

    expect(mockRecordUserCorrection).toHaveBeenCalledWith(
      '0961234567',
      'MOBIFONE',
      'VIETTEL'
    );
  });

  test('gets validation status', () => {
    const { result } = renderHook(() => usePhoneValidation());

    // Default status
    expect(result.current.getValidationStatus()).toBe('idle');

    // Touched but empty
    act(() => {
      result.current.touch();
    });
    expect(result.current.getValidationStatus()).toBe('idle');

    // Touched with content
    act(() => {
      result.current.setPhoneNumber('0961234567');
    });
    expect(result.current.getValidationStatus()).toBe('idle'); // Still pending validation

    // Valid and complete
    mockValidatePhoneTyping.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '0961234567',
      formattedNumber: '0961 234 567',
      telco: 'Viettel'
    });

    act(() => {
      result.current.setPhoneNumber('0961234567');
    });
    expect(result.current.getValidationStatus()).toBe('valid');
  });

  test('checks if phone is from specific telco', () => {
    const { result } = renderHook(() => usePhoneValidation());

    act(() => {
      result.current.setPhoneNumber('0961234567');
    });

    expect(result.current.isFromTelco('VIETTEL')).toBe(true);
    expect(result.current.isFromTelco('MOBIFONE')).toBe(false);
  });

  test('gets telco info', () => {
    const { result } = renderHook(() => usePhoneValidation());

    const telcoInfo = result.current.getTelcoInfo('0961234567');

    expect(mockDetectTelco).toHaveBeenCalledWith('0961234567');
    expect(telcoInfo?.code).toBe('VIETTEL');
  });

  test('auto-corrects phone numbers', () => {
    const { result } = renderHook(() => usePhoneValidation());

    expect(result.current.autoCorrect('84961234567')).toBe('+84961234567');
    expect(result.current.autoCorrect('01234567890')).toBe('01234567890');
  });

  test('resets state', () => {
    const { result } = renderHook(() => usePhoneValidation());

    // Set some state
    act(() => {
      result.current.setPhoneNumber('0961234567');
      result.current.touch();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.phoneNumber).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.isTouched).toBe(false);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('clears errors', () => {
    mockValidatePhoneTyping.mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '123',
      formattedNumber: '123',
      telco: undefined,
      error: 'Invalid phone'
    });

    const { result } = renderHook(() => usePhoneValidation());

    act(() => {
      result.current.setPhoneNumber('123');
    });

    expect(result.current.error).toBe('Invalid phone');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  test('uses different validation presets', () => {
    const { result: looseResult } = renderHook(() => usePhoneValidation({
      preset: 'LOOSE'
    }));

    const { result: strictResult } = renderHook(() => usePhoneValidation({
      preset: 'STRICT'
    }));

    // Should allow partial validation in loose mode
    mockValidatePhoneTyping.mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '096',
      formattedNumber: '096'
    });

    act(() => {
      looseResult.current.setPhoneNumber('096');
    });

    expect(looseResult.current.isValid).toBe(false);

    // Strict mode should require known telco
    mockValidateVietnamesePhone.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '1234567890', // Unknown telco
      formattedNumber: '123 456 7890',
      telco: undefined
    });

    act(() => {
      strictResult.current.setPhoneNumber('1234567890');
      strictResult.current.validate();
    });

    expect(strictResult.current.isValid).toBe(false);
  });

  test('applies custom validation rules', () => {
    const customValidation = jest.fn().mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '123',
      formattedNumber: '123',
      error: 'Custom validation failed'
    });

    const { result } = renderHook(() => usePhoneValidation({
      customValidation
    }));

    act(() => {
      result.current.setPhoneNumber('123');
    });

    expect(customValidation).toHaveBeenCalledWith('123');
  });

  test('applies length constraints', () => {
    const { result } = renderHook(() => usePhoneValidation({
      minLength: 8,
      maxLength: 12
    }));

    mockValidatePhoneTyping.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '1234567', // Too short
      formattedNumber: '1234567'
    });

    act(() => {
      result.current.setPhoneNumber('1234567');
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('Số điện thoại phải có ít nhất 8 số');
  });

  test('handles international format restrictions', () => {
    const { result } = renderHook(() => usePhoneValidation({
      allowInternational: false
    }));

    mockValidatePhoneTyping.mockReturnValue({
      isValid: true,
      isComplete: true,
      phoneNumber: '+84961234567', // International format
      formattedNumber: '+84 961 234 567'
    });

    act(() => {
      result.current.setPhoneNumber('+84961234567');
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe('Không hỗ trợ định dạng quốc tế');
  });

  test('computes derived values correctly', () => {
    const { result } = renderHook(() => usePhoneValidation());

    // Initial state
    expect(result.current.hasError).toBe(false);
    expect(result.current.hasWarning).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.canSubmit).toBe(false);

    // Set error
    mockValidatePhoneTyping.mockReturnValue({
      isValid: false,
      isComplete: false,
      phoneNumber: '123',
      formattedNumber: '123',
      error: 'Invalid phone'
    });

    act(() => {
      result.current.setPhoneNumber('123');
    });

    expect(result.current.hasError).toBe(true);
  });
});