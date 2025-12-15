/**
 * Form Generation Library - Number Input Field
 */

'use client';

import type { FieldComponentProps, NumberFieldConfig } from '../types';
import { cn, formatCurrency, parseCurrency } from '../utils/helpers';
import { inputVariants } from '../styles/variants';

export function NumberField({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    readOnly,
    className,
}: FieldComponentProps<number>) {
    const numberField = field as NumberFieldConfig;
    const options = numberField.options || {};
    const isCurrency = field.type === 'currency';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCurrency) {
            const numericValue = parseCurrency(e.target.value);
            onChange(numericValue);
        } else {
            const numericValue = parseFloat(e.target.value) || 0;
            onChange(numericValue);
        }
    };

    const displayValue = isCurrency && value
        ? formatCurrency(value, options.currency, 'vi-VN')
        : value?.toString() || '';

    return (
        <div className="relative w-full">
            {/* Currency symbol prefix */}
            {isCurrency && options.showSymbol && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {options.currency === 'VND' ? '₫' : options.currency === 'USD' ? '$' : '€'}
                </div>
            )}

            <input
                id={field.id}
                name={field.name}
                type={isCurrency ? 'text' : 'number'}
                value={displayValue}
                onChange={handleChange}
                onBlur={onBlur}
                placeholder={field.placeholder}
                disabled={disabled || field.disabled}
                readOnly={readOnly || field.readOnly}
                min={options.min}
                max={options.max}
                step={options.step}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
                className={cn(
                    inputVariants({
                        state: error ? 'error' : 'default',
                    }),
                    isCurrency && options.showSymbol && 'pl-8',
                    className
                )}
            />
        </div>
    );
}

NumberField.displayName = 'NumberField';
