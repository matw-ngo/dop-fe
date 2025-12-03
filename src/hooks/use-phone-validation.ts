/**
 * Phone Validation Hook
 * Comprehensive Vietnamese phone number validation with telco detection
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from '@/lib/utils/debounce';

import {
  validateVietnamesePhone,
  validatePhoneTyping,
  getPhoneSuggestions,
  getPhoneMetadata,
  PhoneValidationResult,
  PHONE_VALIDATION_PRESETS
} from '@/lib/telcos/phone-validation';
import { detectTelco, recordUserCorrection, recordSuccessfulDetection } from '@/lib/telcos/telco-detector';
import { getTelcoByPhoneNumber } from '@/lib/telcos/vietnamese-telcos';

export interface UsePhoneValidationOptions {
  preset?: keyof typeof PHONE_VALIDATION_PRESETS;
  debounceMs?: number;
  enableSuggestions?: boolean;
  enableLearning?: boolean;
  minLength?: number;
  maxLength?: number;
  allowInternational?: boolean;
  requireVietnamese?: boolean;
  customValidation?: (phone: string) => PhoneValidationResult;
  onValidationChange?: (result: PhoneValidationResult) => void;
  onTelcoChange?: (telco: any) => void;
  onSuggestionsChange?: (suggestions: string[]) => void;
}

export interface PhoneValidationState {
  phoneNumber: string;
  validation: PhoneValidationResult | null;
  suggestions: string[];
  telco: any;
  metadata: any;
  isValidating: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  isComplete: boolean;
  error: string | null;
  warning: string | null;
  suggestion: string | null;
}

export const usePhoneValidation = (options: UsePhoneValidationOptions = {}) => {
  const {
    preset = 'STANDARD',
    debounceMs = 300,
    enableSuggestions = true,
    enableLearning = true,
    minLength,
    maxLength,
    allowInternational = true,
    requireVietnamese = true,
    customValidation,
    onValidationChange,
    onTelcoChange,
    onSuggestionsChange
  } = options;

  // State
  const [state, setState] = useState<PhoneValidationState>({
    phoneNumber: '',
    validation: null,
    suggestions: [],
    telco: null,
    metadata: null,
    isValidating: false,
    isTouched: false,
    isDirty: false,
    isValid: false,
    isComplete: false,
    error: null,
    warning: null,
    suggestion: null
  });

  // Refs
  const lastValidatedRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Validate phone number
  const validatePhone = useCallback((phoneNumber: string): PhoneValidationResult => {
    // Use custom validation if provided
    if (customValidation) {
      return customValidation(phoneNumber);
    }

    // Use preset validation
    const config = PHONE_VALIDATION_PRESETS[preset];

    // Apply preset overrides
    const result = validateVietnamesePhone(phoneNumber);

    // Apply additional validation rules
    if (minLength && result.phoneNumber.length < minLength) {
      return {
        ...result,
        isValid: false,
        error: `Số điện thoại phải có ít nhất ${minLength} số`,
        suggestion: `Vui lòng nhập ${minLength} số trở lên`
      };
    }

    if (maxLength && result.phoneNumber.length > maxLength) {
      return {
        ...result,
        isValid: false,
        error: `Số điện thoại không được vượt quá ${maxLength} số`,
        suggestion: `Vui lòng nhập không quá ${maxLength} số`
      };
    }

    if (!allowInternational && result.phoneNumber.startsWith('84')) {
      return {
        ...result,
        isValid: false,
        error: 'Không hỗ trợ định dạng quốc tế',
        suggestion: 'Vui lòng sử dụng định dạng địa phương (bắt đầu bằng 0)'
      };
    }

    if (requireVietnamese && result.phoneNumber && !result.telco) {
      return {
        ...result,
        isValid: false,
        error: 'Số điện thoại không thuộc nhà mạng Việt Nam',
        suggestion: 'Vui lòng sử dụng số điện thoại của các nhà mạng Việt Nam'
      };
    }

    return result;
  }, [preset, customValidation, minLength, maxLength, allowInternational, requireVietnamese]);

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((phoneNumber: string) => {
      if (phoneNumber === lastValidatedRef.current) return;

      setState(prev => ({ ...prev, isValidating: true }));

      try {
        const validation = validatePhone(phoneNumber);
        const telco = detectTelco(phoneNumber);
        const metadata = getPhoneMetadata(phoneNumber);

        // Generate suggestions
        let suggestions: string[] = [];
        if (enableSuggestions && phoneNumber.length >= 3 && !validation.isValid) {
          suggestions = getPhoneSuggestions(phoneNumber);
        }

        setState(prev => ({
          ...prev,
          validation,
          telco,
          metadata,
          suggestions,
          isValidating: false,
          isValid: validation.isValid,
          isComplete: validation.isComplete,
          error: validation.error || null,
          warning: validation.error && !validation.isValid ? null : null,
          suggestion: validation.suggestion || null
        }));

        // Callbacks
        onValidationChange?.(validation);
        onTelcoChange?.(telco.telco);
        onSuggestionsChange?.(suggestions);

        lastValidatedRef.current = phoneNumber;

        // Record successful detection for learning
        if (enableLearning && validation.isValid && telco.telco) {
          recordSuccessfulDetection(phoneNumber, telco.telco.code);
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isValidating: false,
          error: 'Lỗi xác thực số điện thoại'
        }));
      }
    }, debounceMs),
    [validatePhone, enableSuggestions, enableLearning, debounceMs, onValidationChange, onTelcoChange, onSuggestionsChange]
  );

  // Handle phone number change
  const setPhoneNumber = useCallback((phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    setState(prev => ({
      ...prev,
      phoneNumber,
      isDirty: true,
      // Clear error if phone is being cleared
      error: cleanPhone.length === 0 ? null : prev.error
    }));

    // Trigger validation
    debouncedValidate(phoneNumber);
  }, [debouncedValidate]);

  // Real-time validation for typing
  const validateTyping = useCallback((phoneNumber: string): PhoneValidationResult => {
    return validatePhoneTyping(phoneNumber);
  }, []);

  // Format phone number
  const formatPhoneNumber = useCallback((phoneNumber: string): string => {
    return getPhoneMetadata(phoneNumber).formattedNumber;
  }, []);

  // Sanitize phone number
  const sanitizePhoneNumber = useCallback((phoneNumber: string): string => {
    return getPhoneMetadata(phoneNumber).phoneNumber;
  }, []);

  // Validate manually (not debounced)
  const validate = useCallback((): PhoneValidationResult => {
    const validation = validatePhone(state.phoneNumber);

    setState(prev => ({
      ...prev,
      validation,
      isValid: validation.isValid,
      isComplete: validation.isComplete,
      error: validation.error || null,
      suggestion: validation.suggestion || null
    }));

    onValidationChange?.(validation);

    return validation;
  }, [state.phoneNumber, validatePhone, onValidationChange]);

  // Record user correction (for learning)
  const recordCorrection = useCallback((correctTelco: string) => {
    if (enableLearning && state.telco?.telco && state.phoneNumber) {
      recordUserCorrection(
        state.phoneNumber,
        correctTelco,
        state.telco.telco.code
      );
    }
  }, [state.telco, state.phoneNumber, enableLearning]);

  // Reset validation state
  const reset = useCallback(() => {
    setState({
      phoneNumber: '',
      validation: null,
      suggestions: [],
      telco: null,
      metadata: null,
      isValidating: false,
      isTouched: false,
      isDirty: false,
      isValid: false,
      isComplete: false,
      error: null,
      warning: null,
      suggestion: null
    });

    lastValidatedRef.current = '';
  }, []);

  // Mark as touched
  const touch = useCallback(() => {
    setState(prev => ({ ...prev, isTouched: true }));
  }, []);

  // Clear errors
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, warning: null }));
  }, []);

  // Get validation status for UI
  const getValidationStatus = useCallback((): 'idle' | 'valid' | 'invalid' | 'warning' => {
    if (!state.isTouched || state.phoneNumber.length === 0) return 'idle';
    if (state.isValid && state.isComplete) return 'valid';
    if (state.error) return 'invalid';
    if (state.warning) return 'warning';
    if (state.phoneNumber.length > 0 && !state.isValid) return 'invalid';
    return 'idle';
  }, [state]);

  // Check if phone number is from specific telco
  const isFromTelco = useCallback((telcoCode: string): boolean => {
    return state.telco?.telco?.code === telcoCode.toUpperCase();
  }, [state.telco]);

  // Get telco info by phone number
  const getTelcoInfo = useCallback((phoneNumber: string) => {
    return getTelcoByPhoneNumber(phoneNumber);
  }, []);

  // Auto-correct common mistakes
  const autoCorrect = useCallback((phoneNumber: string): string => {
    let corrected = phoneNumber;

    // Common corrections
    if (corrected.startsWith('84') && !corrected.startsWith('+84')) {
      corrected = '+84' + corrected.slice(2);
    } else if (corrected.startsWith('0') && corrected.length === 11 && corrected.startsWith('01')) {
      // Convert old 11-digit numbers to 10-digit
      const newPrefix = corrected.slice(0, 2) + corrected[3];
      corrected = newPrefix + corrected.slice(4);
    }

    return corrected;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    setPhoneNumber,
    validate,
    validateTyping,
    formatPhoneNumber,
    sanitizePhoneNumber,
    reset,
    touch,
    clearError,
    recordCorrection,

    // Utilities
    getValidationStatus,
    isFromTelco,
    getTelcoInfo,
    autoCorrect,

    // Computed values
    hasError: !!state.error,
    hasWarning: !!state.warning,
    isProcessing: state.isValidating || state.phoneNumber !== lastValidatedRef.current,
    canSubmit: state.isValid && state.isComplete && !state.hasError
  };
};

export default usePhoneValidation;