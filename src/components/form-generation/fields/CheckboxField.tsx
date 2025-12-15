/**
 * Form Generation Library - Checkbox Field
 */

'use client';

import type { FieldComponentProps, CheckboxFieldConfig } from '../types';
import { cn } from '../utils/helpers';

export function CheckboxField({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    readOnly,
    className,
}: FieldComponentProps<boolean | any[]>) {
    const checkboxField = field as CheckboxFieldConfig;
    const options = checkboxField.options || {};
    const isGroup = field.type === 'checkbox-group';
    const choices = options.choices || [];

    // Single checkbox
    if (!isGroup) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <input
                    id={field.id}
                    name={field.name}
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    onBlur={onBlur}
                    disabled={disabled || field.disabled}
                    readOnly={readOnly || field.readOnly}
                    aria-invalid={!!error}
                    className={cn(
                        'h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        error && 'border-destructive'
                    )}
                />
                {options.checkboxLabel && (
                    <label htmlFor={field.id} className="text-sm">
                        {options.checkboxLabel}
                    </label>
                )}
            </div>
        );
    }

    // Checkbox group
    const selectedValues = (value as any[]) || [];

    const handleToggle = (optionValue: any) => {
        const newValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((v) => v !== optionValue)
            : [...selectedValues, optionValue];
        onChange(newValues);
    };

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {choices.map((choice) => (
                <div key={choice.value} className="flex items-center gap-2">
                    <input
                        id={`${field.id}-${choice.value}`}
                        type="checkbox"
                        checked={selectedValues.includes(choice.value)}
                        onChange={() => handleToggle(choice.value)}
                        onBlur={onBlur}
                        disabled={disabled || field.disabled || choice.disabled}
                        readOnly={readOnly || field.readOnly}
                        className={cn(
                            'h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2',
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

CheckboxField.displayName = 'CheckboxField';
