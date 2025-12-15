/**
 * Form Generation Library - Select Field
 */

'use client';

import { useState } from 'react';
import type { FieldComponentProps, SelectFieldConfig, SelectOption } from '../types';
import { cn } from '../utils/helpers';
import { inputVariants } from '../styles/variants';
import { Check, ChevronDown } from 'lucide-react';

export function SelectField({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    readOnly,
    className,
}: FieldComponentProps<any>) {
    const selectField = field as SelectFieldConfig;
    const options = selectField.options || {};
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const choices = options.choices || [];
    const isMulti = field.type === 'multi-select';
    const searchable = options.searchable !== false;

    // Filter choices based on search query
    const filteredChoices = searchable && searchQuery
        ? choices.filter((choice) =>
            choice.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : choices;

    // Get selected labels
    const getSelectedLabel = () => {
        if (isMulti) {
            if (!value || value.length === 0) return options.placeholder || 'Select...';
            const selectedLabels = choices
                .filter((c) => value.includes(c.value))
                .map((c) => c.label);
            return selectedLabels.join(', ');
        } else {
            const selected = choices.find((c) => c.value === value);
            return selected?.label || options.placeholder || 'Select...';
        }
    };

    const handleSelect = (optionValue: any) => {
        if (isMulti) {
            const currentValues = value || [];
            const newValues = currentValues.includes(optionValue)
                ? currentValues.filter((v: any) => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValues);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    const isSelected = (optionValue: any) => {
        if (isMulti) {
            return value && value.includes(optionValue);
        }
        return value === optionValue;
    };

    return (
        <div className="relative w-full">
            {/* Selected value display */}
            <button
                type="button"
                id={field.id}
                onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
                onBlur={onBlur}
                disabled={disabled || field.disabled || readOnly || field.readOnly}
                aria-invalid={!!error}
                aria-expanded={isOpen}
                className={cn(
                    inputVariants({ state: error ? 'error' : 'default' }),
                    'flex items-center justify-between text-left',
                    className
                )}
            >
                <span className={cn(!value && 'text-muted-foreground')}>
                    {getSelectedLabel()}
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                    {/* Search */}
                    {searchable && (
                        <div className="p-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className={cn(
                                    inputVariants({ inputSize: 'sm' }),
                                    'w-full'
                                )}
                            />
                        </div>
                    )}

                    {/* Options */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredChoices.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                                No options found
                            </div>
                        ) : (
                            filteredChoices.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    disabled={option.disabled}
                                    className={cn(
                                        'flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent',
                                        isSelected(option.value) && 'bg-accent',
                                        option.disabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {isSelected(option.value) && <Check className="h-4 w-4" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

SelectField.displayName = 'SelectField';
