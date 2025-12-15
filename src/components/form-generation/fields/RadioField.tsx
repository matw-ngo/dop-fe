/**
 * Form Generation Library - Radio Field
 */

'use client';

import type { FieldComponentProps, RadioFieldConfig } from '../types';
import { cn } from '../utils/helpers';

export function RadioField({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    readOnly,
    className,
}: FieldComponentProps<any>) {
    const radioField = field as RadioFieldConfig;
    const options = radioField.options || {};
    const choices = options.choices || [];
    const layout = options.layout || 'vertical';

    return (
        <div
            className={cn(
                'flex gap-4',
                layout === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
                className
            )}
        >
            {choices.map((choice) => (
                <div key={choice.value} className="flex items-center gap-2">
                    <input
                        id={`${field.id}-${choice.value}`}
                        name={field.name}
                        type="radio"
                        value={choice.value}
                        checked={value === choice.value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        disabled={disabled || field.disabled || choice.disabled}
                        readOnly={readOnly || field.readOnly}
                        aria-invalid={!!error}
                        className={cn(
                            'h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2',
                            error && 'border-destructive'
                        )}
                    />
                    <label
                        htmlFor={`${field.id}-${choice.value}`}
                        className="text-sm cursor-pointer"
                    >
                        {choice.label}
                    </label>
                </div>
            ))}
        </div>
    );
}

RadioField.displayName = 'RadioField';
