/**
 * Form Generation Library - Text Area Field
 */

'use client';

import { useEffect, useRef } from 'react';
import type { FieldComponentProps, TextAreaFieldConfig } from '../types';
import { cn } from '../utils/helpers';
import { inputVariants } from '../styles/variants';

export function TextAreaField({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    readOnly,
    className,
}: FieldComponentProps<string>) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textAreaField = field as TextAreaFieldConfig;
    const options = textAreaField.options || {};

    // Auto-resize functionality
    useEffect(() => {
        if (options.autoResize && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value, options.autoResize]);

    const currentLength = value?.length || 0;
    const maxLength = options.maxLength;
    const showCount = options.showCount && maxLength;

    return (
        <div className="relative w-full">
            <textarea
                ref={textareaRef}
                id={field.id}
                name={field.name}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={field.placeholder}
                disabled={disabled || field.disabled}
                readOnly={readOnly || field.readOnly}
                rows={options.rows || 3}
                maxLength={maxLength}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
                className={cn(
                    inputVariants({
                        state: error ? 'error' : 'default',
                    }),
                    'resize-none',
                    options.autoResize && 'overflow-hidden',
                    className
                )}
            />

            {/* Character count */}
            {showCount && (
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {currentLength}/{maxLength}
                </div>
            )}
        </div>
    );
}

TextAreaField.displayName = 'TextAreaField';
