/**
 * Vietnamese Phone Input Component
 * Comprehensive phone number input with Vietnamese telco detection and validation
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, AlertCircle, Check, Globe, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  validateVietnamesePhone,
  validatePhoneTyping,
  formatPhoneTyping,
  getPhoneSuggestions,
  getPhoneMetadata,
  TELCO_ERROR_MESSAGES
} from '@/lib/telcos/phone-validation';
import { detectTelco, getRecommendation } from '@/lib/telcos/telco-detector';
import { VIETNAMESE_TELCOS } from '@/lib/telcos/vietnamese-telcos';

export interface PhoneInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onChange?: (value: string, isValid: boolean, metadata?: any) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  showTelcoBadge?: boolean;
  showSuggestions?: boolean;
  showValidation?: boolean;
  allowInternational?: boolean;
  validationMode?: 'realtime' | 'onblur' | 'manual';
  className?: string;
  inputClassName?: string;
  onTelcoDetected?: (telco: any) => void;
  onValidationComplete?: (result: any) => void;
}

export const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  ({
    value = '',
    onChange,
    placeholder = 'Nhập số điện thoại (ví dụ: 0912345678)',
    label = 'Số điện thoại',
    disabled = false,
    required = false,
    error,
    showTelcoBadge = true,
    showSuggestions = true,
    showValidation = true,
    allowInternational = true,
    validationMode = 'realtime',
    className,
    inputClassName,
    onTelcoDetected,
    onValidationComplete,
    ...props
  }, ref) => {
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [telcoInfo, setTelcoInfo] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestionsList, setShowSuggestionsList] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Update telco detection when value changes
    useEffect(() => {
      if (inputValue && inputValue.length >= 3) {
        const metadata = getPhoneMetadata(inputValue);
        setTelcoInfo(metadata);

        if (metadata.telco) {
          const telco = VIETNAMESE_TELCOS[metadata.telcoCode || ''];
          onTelcoDetected?.(telco);
        } else {
          onTelcoDetected?.(null);
        }
      } else {
        setTelcoInfo(null);
        onTelcoDetected?.(null);
      }
    }, [inputValue, onTelcoDetected]);

    // Handle validation based on mode
    useEffect(() => {
      if (!inputValue) {
        setValidationResult(null);
        return;
      }

      const validate = () => {
        const result = validationMode === 'realtime'
          ? validatePhoneTyping(inputValue)
          : validateVietnamesePhone(inputValue);

        setValidationResult(result);
        onValidationComplete?.(result);

        if (onChange) {
          onChange(inputValue, result.isValid, telcoInfo);
        }
      };

      if (validationMode === 'realtime') {
        validate();
      } else if (validationMode === 'onblur' && !isFocused) {
        validate();
      }
    }, [inputValue, validationMode, isFocused, onChange, onValidationComplete, telcoInfo]);

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Allow only digits and basic formatting characters
      const sanitized = newValue.replace(/[^\d+\s-]/g, '');
      const formatted = formatPhoneTyping(sanitized);

      setInputValue(formatted);

      // Generate suggestions if enabled
      if (showSuggestions && sanitized.length >= 3) {
        const newSuggestions = getPhoneSuggestions(sanitized);
        setSuggestions(newSuggestions);
        setShowSuggestionsList(newSuggestions.length > 0);
      } else {
        setShowSuggestionsList(false);
      }
    }, [showSuggestions]);

    // Handle focus
    const handleFocus = useCallback(() => {
      setIsFocused(true);
      if (showSuggestions && suggestions.length > 0) {
        setShowSuggestionsList(true);
      }
    }, [showSuggestions, suggestions.length]);

    // Handle blur
    const handleBlur = useCallback(() => {
      setIsFocused(false);
      setShowSuggestionsList(false);

      if (validationMode === 'onblur') {
        const result = validateVietnamesePhone(inputValue);
        setValidationResult(result);
        onValidationComplete?.(result);

        if (onChange) {
          onChange(inputValue, result.isValid, telcoInfo);
        }
      }
    }, [validationMode, inputValue, onChange, onValidationComplete, telcoInfo]);

    // Handle suggestion click
    const handleSuggestionClick = useCallback((suggestion: string) => {
      setInputValue(suggestion);
      setShowSuggestionsList(false);
      inputRef.current?.focus();

      if (validationMode !== 'manual') {
        const result = validateVietnamesePhone(suggestion);
        setValidationResult(result);
        onValidationComplete?.(result);

        if (onChange) {
          onChange(suggestion, result.isValid, telcoInfo);
        }
      }
    }, [validationMode, onChange, onValidationComplete, telcoInfo]);

    // Handle format toggle
    const toggleFormat = useCallback(() => {
      if (!telcoInfo) return;

      const current = inputValue;
      if (current.startsWith('+84')) {
        // Convert to local format
        const local = current.replace(/^\+84/, '0');
        setInputValue(local);
      } else if (current.startsWith('0')) {
        // Convert to international format
        const international = current.replace(/^0/, '+84');
        setInputValue(international);
      }
    }, [inputValue, telcoInfo]);

    // Get validation status
    const getValidationStatus = () => {
      if (!validationResult) return 'idle';
      if (validationResult.isValid && validationResult.isComplete) return 'valid';
      if (validationResult.error) return 'error';
      return 'warning';
    };

    // Get telco color
    const getTelcoColor = () => {
      return telcoInfo?.telcoCode
        ? VIETNAMESE_TELCOS[telcoInfo.telcoCode]?.color || '#666666'
        : '#666666';
    };

    const validationStatus = getValidationStatus();

    return (
      <div ref={ref} className={cn('relative space-y-2', className)} {...props}>
        {/* Label */}
        {label && (
          <Label htmlFor="phone-input" className={cn(
            'text-sm font-medium flex items-center gap-2',
            required && 'after:content-["*"] after:text-destructive after:ml-1'
          )}>
            <Phone className="h-4 w-4" />
            {label}
            {allowInternational && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Globe className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Hỗ trợ cả định dạng quốc tế (+84)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
        )}

        {/* Input Container */}
        <div className="relative">
          <Input
            id="phone-input"
            ref={inputRef}
            type="tel"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pr-20 transition-colors',
              validationStatus === 'valid' && 'border-green-500 focus:border-green-500',
              validationStatus === 'error' && 'border-destructive focus:border-destructive',
              validationStatus === 'warning' && 'border-yellow-500 focus:border-yellow-500',
              inputClassName
            )}
          />

          {/* Input Actions */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Validation Status */}
            {showValidation && validationResult && (
              <div className="flex items-center gap-1">
                {validationStatus === 'valid' && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {validationStatus === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            )}

            {/* Format Toggle */}
            {telcoInfo && allowInternational && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={toggleFormat}
                    >
                      <Globe className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {inputValue.startsWith('+84') ? 'Chuyển sang địa phương' : 'Chuyển sang quốc tế'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Suggestions List */}
          {showSuggestionsList && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg"
            >
              <div className="p-1">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-mono">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Telco Badge */}
        {showTelcoBadge && telcoInfo?.telco && (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
              style={{
                backgroundColor: `${getTelcoColor()}20`,
                borderColor: getTelcoColor(),
                color: getTelcoColor()
              }}
            >
              <Shield className="h-3 w-3" />
              {telcoInfo.telco}
              {telcoInfo.isInternational && (
                <Globe className="h-3 w-3 ml-1" />
              )}
            </Badge>

            <span className="text-xs text-muted-foreground">
              {getRecommendation({
                telco: VIETNAMESE_TELCOS[telcoInfo.telcoCode],
                confidence: 0.9,
                phoneNumber: telcoInfo.phoneNumber,
                detectionMethod: 'prefix'
              })}
            </span>
          </div>
        )}

        {/* Validation Messages */}
        {error && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {validationResult?.error && !error && showValidation && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationResult.error}
              {validationResult.suggestion && (
                <span className="block mt-1 text-muted-foreground">
                  Gợi ý: {validationResult.suggestion}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {validationResult?.isValid && validationResult?.isComplete && showValidation && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>Số điện thoại hợp lệ</span>
          </div>
        )}

        {/* Input Format Help */}
        {isFocused && !validationResult?.isComplete && (
          <div className="text-xs text-muted-foreground">
            <p>Hỗ trợ các định dạng:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Địa phương: 0912345678, 0321234567</li>
              <li>Quốc tế: +84912345678, +84321234567</li>
              <li>Các nhà mạng: Viettel, Mobifone, Vinaphone, Vietnamobile, Gmobile</li>
            </ul>
          </div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;