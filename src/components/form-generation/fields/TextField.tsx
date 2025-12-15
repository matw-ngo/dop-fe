/**
 * Form Generation Library - Text Input Field
 * 
 * Text, email, password, URL, and tel input component
 */

'use client';

import type { FieldComponentProps, TextFieldConfig } from '../types';
import { cn } from '../utils/helpers';
import { inputVariants } from '../styles/variants';

export function TextField({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    readOnly,
    className,
}: FieldComponentProps<string>) {
    const textField = field as TextFieldConfig;
    const options = textField.options || {};

    return (
        <div className="relative w-full">
            {/* Prefix */}
            {options.prefix && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {options.prefix}
                </div>
            )}

            {/* Input */}
            <input
                id={field.id}
                name={field.name}
                type={field.type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={field.placeholder}
                disabled={disabled || field.disabled}
                readOnly={readOnly || field.readOnly}
                maxLength={options.maxLength}
                minLength={options.minLength}
                autoComplete={options.autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
                className={cn(
                    inputVariants({
                        state: error ? 'error' : 'default',
                    }),
                    options.prefix && 'pl-10',
                    options.suffix && 'pr-10',
                    className
                )}
            />

            {/* Suffix */}
            {options.suffix && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {options.suffix}
                </div>
            )}
        </div>
    );
}

TextField.displayName = 'TextField';
