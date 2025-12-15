/**
 * Form Generation Library - Validation Engine
 * 
 * Type-safe validation system for form fields
 */

import {
    type AnyValidationRule,
    type ValidationRule,
    ValidationRuleType,
} from '../types';
import {
    isEmpty,
    isValidEmail,
    isValidUrl,
    isValidPhone,
    isValidDate,
} from '../utils/helpers';

// ============================================================================
// Validation Result
// ============================================================================

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

// ============================================================================
// Built-in Validators
// ============================================================================

export class Validators {
    /**
     * Required field validator
     */
    static required(value: any, rule: AnyValidationRule): ValidationResult {
        const valid = !isEmpty(value);
        return {
            valid,
            error: valid ? undefined : rule.message || 'This field is required',
        };
    }

    /**
     * Minimum length validator
     */
    static minLength(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const length = String(value).length;
        const min = rule.value;
        const valid = length >= min;

        return {
            valid,
            error: valid
                ? undefined
                : rule.message || `Minimum ${min} characters required`,
        };
    }

    /**
     * Maximum length validator
     */
    static maxLength(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const length = String(value).length;
        const max = rule.value;
        const valid = length <= max;

        return {
            valid,
            error: valid
                ? undefined
                : rule.message || `Maximum ${max} characters allowed`,
        };
    }

    /**
     * Minimum value validator
     */
    static min(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const numValue = Number(value);
        const min = rule.value;
        const valid = !isNaN(numValue) && numValue >= min;

        return {
            valid,
            error: valid ? undefined : rule.message || `Value must be at least ${min}`,
        };
    }

    /**
     * Maximum value validator
     */
    static max(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const numValue = Number(value);
        const max = rule.value;
        const valid = !isNaN(numValue) && numValue <= max;

        return {
            valid,
            error: valid ? undefined : rule.message || `Value must be at most ${max}`,
        };
    }

    /**
     * Pattern (regex) validator
     */
    static pattern(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const pattern =
            typeof rule.value === 'string' ? new RegExp(rule.value) : rule.value;
        const valid = pattern.test(String(value));

        return {
            valid,
            error: valid ? undefined : rule.message || 'Invalid format',
        };
    }

    /**
     * Email validator
     */
    static email(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const valid = isValidEmail(String(value));

        return {
            valid,
            error: valid
                ? undefined
                : rule.message || 'Please enter a valid email address',
        };
    }

    /**
     * URL validator
     */
    static url(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const valid = isValidUrl(String(value));

        return {
            valid,
            error: valid ? undefined : rule.message || 'Please enter a valid URL',
        };
    }

    /**
     * Phone number validator
     */
    static phone(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const valid = isValidPhone(String(value));

        return {
            valid,
            error: valid
                ? undefined
                : rule.message || 'Please enter a valid phone number',
        };
    }

    /**
     * Minimum date validator
     */
    static minDate(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const date = new Date(value);
        const minDate = new Date(rule.value);

        if (!isValidDate(date)) {
            return { valid: false, error: 'Invalid date' };
        }

        const valid = date >= minDate;

        return {
            valid,
            error: valid
                ? undefined
                : rule.message || `Date must be after ${minDate.toLocaleDateString()}`,
        };
    }

    /**
     * Maximum date validator
     */
    static maxDate(value: any, rule: AnyValidationRule): ValidationResult {
        if (isEmpty(value)) return { valid: true };

        const date = new Date(value);
        const maxDate = new Date(rule.value);

        if (!isValidDate(date)) {
            return { valid: false, error: 'Invalid date' };
        }

        const valid = date <= maxDate;

        return {
            valid,
            error: valid
                ? undefined
                : rule.message || `Date must be before ${maxDate.toLocaleDateString()}`,
        };
    }

    /**
     * Custom validator
     */
    static async custom(
        value: any,
        rule: AnyValidationRule
    ): Promise<ValidationResult> {
        // Type guard for custom rule
        if (!('validator' in rule) || typeof rule.validator !== 'function') {
            return { valid: true };
        }

        try {
            const valid = await Promise.resolve(rule.validator(value));
            return {
                valid,
                error: valid ? undefined : rule.message || 'Validation failed',
            };
        } catch (error) {
            return {
                valid: false,
                error: rule.message || 'Validation error occurred',
            };
        }
    }
}

// ============================================================================
// Validation Engine
// ============================================================================

export class ValidationEngine {
    /**
     * Validate a single field value against rules
     */
    static async validateField(
        value: any,
        rules: AnyValidationRule[]
    ): Promise<ValidationResult> {
        if (!rules || rules.length === 0) {
            return { valid: true };
        }

        // Run validators in sequence
        for (const rule of rules) {
            const result = await this.runValidator(value, rule);
            if (!result.valid) {
                return result;
            }
        }

        return { valid: true };
    }

    /**
     * Run a single validator
     */
    private static async runValidator(
        value: any,
        rule: AnyValidationRule
    ): Promise<ValidationResult> {
        switch (rule.type) {
            case ValidationRuleType.REQUIRED:
                return Validators.required(value, rule);

            case ValidationRuleType.MIN_LENGTH:
                return Validators.minLength(value, rule);

            case ValidationRuleType.MAX_LENGTH:
                return Validators.maxLength(value, rule);

            case ValidationRuleType.MIN:
                return Validators.min(value, rule);

            case ValidationRuleType.MAX:
                return Validators.max(value, rule);

            case ValidationRuleType.PATTERN:
                return Validators.pattern(value, rule);

            case ValidationRuleType.EMAIL:
                return Validators.email(value, rule);

            case ValidationRuleType.URL:
                return Validators.url(value, rule);

            case ValidationRuleType.PHONE:
                return Validators.phone(value, rule);

            case ValidationRuleType.MIN_DATE:
                return Validators.minDate(value, rule);

            case ValidationRuleType.MAX_DATE:
                return Validators.maxDate(value, rule);

            case ValidationRuleType.CUSTOM:
                return await Validators.custom(value, rule);

            default:
                return { valid: true };
        }
    }

    /**
     * Validate entire form data
     */
    static async validateForm(
        formData: Record<string, any>,
        fieldRules: Record<string, AnyValidationRule[]>
    ): Promise<Record<string, string>> {
        const errors: Record<string, string> = {};

        // Validate each field
        await Promise.all(
            Object.entries(fieldRules).map(async ([fieldName, rules]) => {
                const value = formData[fieldName];
                const result = await this.validateField(value, rules);

                if (!result.valid && result.error) {
                    errors[fieldName] = result.error;
                }
            })
        );

        return errors;
    }

    /**
     * Check if field has required rule
     */
    static isFieldRequired(rules: AnyValidationRule[]): boolean {
        return rules.some(rule => rule.type === ValidationRuleType.REQUIRED);
    }
}

/**
 * Create a custom validator
 */
export function createValidator(
    validator: (value: any) => boolean | Promise<boolean>,
    message?: string
): AnyValidationRule {
    return {
        type: ValidationRuleType.CUSTOM,
        validator,
        message,
    };
}
