/**
 * Form Generation Library - Field Wrapper Component
 * 
 * Common wrapper for all field components with label, error, and help text
 */

'use client';

import type { ReactNode } from 'react';
import { cn } from '../utils/helpers';
import {
    fieldWrapperVariants,
    labelVariants,
    errorVariants,
    helpTextVariants,
    type FieldWrapperVariantsProps,
} from '../styles/variants';
import { AlertCircle } from 'lucide-react';

export interface FieldWrapperProps extends FieldWrapperVariantsProps {
    /**
     * Field ID for accessibility
     */
    id: string;

    /**
     * Field label
     */
    label?: string;

    /**
     * Required field indicator
     */
    required?: boolean;

    /**
     * Error message
     */
    error?: string;

    /**
     * Help text
     */
    help?: string;

    /**
     * Field input component
     */
    children: ReactNode;

    /**
     * Custom class name
     */
    className?: string;

    /**
     * Hide label (for accessibility, label still exists for screen readers)
     */
    hideLabel?: boolean;
}

export function FieldWrapper({
    id,
    label,
    required = false,
    error,
    help,
    children,
    className,
    hideLabel = false,
    size,
    variant,
    disabled,
}: FieldWrapperProps) {
    const hasError = !!error;

    return (
        <div
            className={cn(
                fieldWrapperVariants({ size, variant, disabled }),
                className
            )}
        >
            {/* Label */}
            {label && (
                <label
                    htmlFor={id}
                    className={cn(
                        labelVariants({ size, required, disabled }),
                        hideLabel && 'sr-only'
                    )}
                >
                    {label}
                </label>
            )}

            {/* Field Input */}
            {children}

            {/* Error Message */}
            {hasError && (
                <div
                    className={cn(
                        errorVariants({ size }),
                        'text-destructive'
                    )}
                    role="alert"
                    id={`${id}-error`}
                >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Help Text */}
            {help && !hasError && (
                <p
                    className={cn(
                        helpTextVariants({ size }),
                        'text-muted-foreground'
                    )}
                    id={`${id}-help`}
                >
                    {help}
                </p>
            )}
        </div>
    );
}
