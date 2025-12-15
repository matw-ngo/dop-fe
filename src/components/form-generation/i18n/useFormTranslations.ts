/**
 * Form Generation Library - i18n Integration
 * 
 * Translation utilities for form fields
 */

'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

/**
 * Translation key generators
 */
export const TranslationKeys = {
    /**
     * Get translation key for field label
     */
    getFieldLabel: (namespace: string, fieldId: string) =>
        `forms.${namespace}.${fieldId}.label`,

    /**
     * Get translation key for field placeholder
     */
    getFieldPlaceholder: (namespace: string, fieldId: string) =>
        `forms.${namespace}.${fieldId}.placeholder`,

    /**
     * Get translation key for field help text
     */
    getFieldHelp: (namespace: string, fieldId: string) =>
        `forms.${namespace}.${fieldId}.help`,

    /**
     * Get translation key for field error
     */
    getFieldError: (namespace: string, fieldId: string, errorType: string) =>
        `forms.${namespace}.${fieldId}.errors.${errorType}`,

    /**
     * Get translation key for validation message
     */
    getValidationMessage: (rule: string) => `forms.validation.${rule}`,
};

/**
 * Hook for form field translations
 * 
 * @param namespace - Form namespace (default: 'common')
 * @returns Translation helpers
 */
export function useFormTranslations(namespace: string = 'common') {
    const t = useTranslations();

    /**
     * Get translated label for a field
     */
    const getLabel = useCallback(
        (fieldId: string, fallback?: string): string => {
            const key = TranslationKeys.getFieldLabel(namespace, fieldId);
            try {
                return t(key);
            } catch {
                return fallback || fieldId;
            }
        },
        [t, namespace]
    );

    /**
     * Get translated placeholder for a field
     */
    const getPlaceholder = useCallback(
        (fieldId: string, fallback?: string): string => {
            const key = TranslationKeys.getFieldPlaceholder(namespace, fieldId);
            try {
                return t(key);
            } catch {
                return fallback || '';
            }
        },
        [t, namespace]
    );

    /**
     * Get translated help text for a field
     */
    const getHelp = useCallback(
        (fieldId: string, fallback?: string): string => {
            const key = TranslationKeys.getFieldHelp(namespace, fieldId);
            try {
                return t(key);
            } catch {
                return fallback || '';
            }
        },
        [t, namespace]
    );

    /**
     * Get translated error message
     */
    const getError = useCallback(
        (fieldId: string, errorType: string, fallback?: string, params?: Record<string, any>): string => {
            const key = TranslationKeys.getFieldError(namespace, fieldId, errorType);
            try {
                return t(key, params);
            } catch {
                // Try generic validation message
                try {
                    const genericKey = TranslationKeys.getValidationMessage(errorType);
                    return t(genericKey, params);
                } catch {
                    return fallback || `Validation failed: ${errorType}`;
                }
            }
        },
        [t, namespace]
    );

    /**
     * Get validation message
     */
    const getValidationMessage = useCallback(
        (rule: string, params?: Record<string, any>): string => {
            const key = TranslationKeys.getValidationMessage(rule);
            try {
                return t(key, params);
            } catch {
                return rule;
            }
        },
        [t]
    );

    return {
        t,
        getLabel,
        getPlaceholder,
        getHelp,
        getError,
        getValidationMessage,
    };
}

/**
 * Generate default translation structure for a form
 * 
 * Useful for documentation or initial translation file creation
 */
export function generateTranslationStructure(
    namespace: string,
    fieldIds: string[]
): Record<string, any> {
    const structure: Record<string, any> = {
        forms: {
            [namespace]: {},
            validation: {
                required: 'This field is required',
                email: 'Please enter a valid email address',
                url: 'Please enter a valid URL',
                phone: 'Please enter a valid phone number',
                minLength: 'Minimum {min} characters required',
                maxLength: 'Maximum {max} characters allowed',
                min: 'Value must be at least {min}',
                max: 'Value must be at most {max}',
                pattern: 'Invalid format',
            },
        },
    };

    fieldIds.forEach(fieldId => {
        structure.forms[namespace][fieldId] = {
            label: fieldId,
            placeholder: `Enter ${fieldId}`,
            help: '',
            errors: {
                required: `${fieldId} is required`,
            },
        };
    });

    return structure;
}
