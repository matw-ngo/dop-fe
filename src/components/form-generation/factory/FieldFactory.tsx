/**
 * Form Generation Library - Field Factory
 * 
 * Factory component for rendering appropriate field components based on type
 */

'use client';

import type { FormField, FieldComponentProps } from '../types';
import { FieldType } from '../types';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { FieldWrapper } from '../components/FieldWrapper';
import { ValidationEngine } from '../validation/ValidationEngine';
import { useFormTranslations } from '../i18n/useFormTranslations';
import { useCallback, useMemo } from 'react';

// Import built-in field components
import { TextField } from '../fields/TextField';
import { TextAreaField } from '../fields/TextAreaField';
import { NumberField } from '../fields/NumberField';
import { SelectField } from '../fields/SelectField';
import { CheckboxField } from '../fields/CheckboxField';
import { RadioField } from '../fields/RadioField';

// Register built-in components
const registry = ComponentRegistry.getInstance();

// Only register if not already registered (for HMR)
if (!registry.has(FieldType.TEXT)) {
    registry.registerBatch({
        [FieldType.TEXT]: TextField,
        [FieldType.EMAIL]: TextField,
        [FieldType.PASSWORD]: TextField,
        [FieldType.URL]: TextField,
        [FieldType.TEL]: TextField,
        [FieldType.TEXTAREA]: TextAreaField,
        [FieldType.NUMBER]: NumberField,
        [FieldType.CURRENCY]: NumberField,
        [FieldType.SELECT]: SelectField,
        [FieldType.MULTI_SELECT]: SelectField,
        [FieldType.CHECKBOX]: CheckboxField,
        [FieldType.CHECKBOX_GROUP]: CheckboxField,
        [FieldType.RADIO]: RadioField,
    });
}

// ============================================================================
// Field Factory Props
// ============================================================================

export interface FieldFactoryProps {
    /**
     * Field configuration
     */
    field: FormField;

    /**
     * Current field value
     */
    value: any;

    /**
     * Change handler
     */
    onChange: (value: any) => void;

    /**
     * Blur handler
     */
    onBlur?: () => void;

    /**
     * Form namespace for i18n
     */
    namespace?: string;

    /**
     * Custom validation error
     */
    error?: string;

    /**
     * Show wrapper (label, error, help)
     */
    showWrapper?: boolean;

    /**
     * Disabled state
     */
    disabled?: boolean;

    /**
     * Read-only state
     */
    readOnly?: boolean;
}

// ============================================================================
// Field Factory Component
// ============================================================================

export function FieldFactory({
    field,
    value,
    onChange,
    onBlur,
    namespace = 'common',
    error: externalError,
    showWrapper = true,
    disabled,
    readOnly,
}: FieldFactoryProps) {
    const { getLabel, getPlaceholder, getHelp } = useFormTranslations(namespace);

    // Get component from registry
    const FieldComponent = useMemo(() => {
        // Check if custom component is specified
        if (field.type === FieldType.CUSTOM && field.options?.componentName) {
            const customComponent = registry.get(field.options.componentName);
            if (customComponent) {
                return customComponent;
            }
        }

        // Get by field type
        const component = registry.get(field.type);

        if (!component) {
            console.warn(`No component registered for field type: ${field.type}`);
            return null;
        }

        return component;
    }, [field.type, field.options]);

    // Check if field is required
    const isRequired = useMemo(
        () => ValidationEngine.isFieldRequired(field.validation || []),
        [field.validation]
    );

    // Get translated label, placeholder, help
    const label = useMemo(() => {
        if (field.i18n?.enabled === false) {
            return field.label;
        }
        if (field.i18n?.labelKey) {
            return getLabel(field.i18n.labelKey, field.label);
        }
        return getLabel(field.id, field.label);
    }, [field, getLabel]);

    const placeholder = useMemo(() => {
        if (field.i18n?.enabled === false) {
            return field.placeholder;
        }
        if (field.i18n?.placeholderKey) {
            return getPlaceholder(field.i18n.placeholderKey, field.placeholder);
        }
        return getPlaceholder(field.id, field.placeholder);
    }, [field, getPlaceholder]);

    const help = useMemo(() => {
        if (field.i18n?.enabled === false) {
            return field.help;
        }
        if (field.i18n?.helpKey) {
            return getHelp(field.i18n.helpKey, field.help);
        }
        return getHelp(field.id, field.help);
    }, [field, getHelp]);

    // Handle blur with validation
    const handleBlur = useCallback(async () => {
        onBlur?.();
    }, [onBlur]);

    // Props for field component
    const fieldProps: FieldComponentProps = {
        field: {
            ...field,
            label,
            placeholder,
            help,
        },
        value,
        onChange,
        onBlur: handleBlur,
        error: externalError,
        disabled: disabled || field.disabled,
        readOnly: readOnly || field.readOnly,
        className: field.className,
    };

    // If no component found, render nothing
    if (!FieldComponent) {
        return (
            <div className="text-sm text-destructive">
                Field type "{field.type}" not supported. Please register a component for this type.
            </div>
        );
    }

    // Render with or without wrapper
    if (!showWrapper) {
        return <FieldComponent {...fieldProps} />;
    }

    return (
        <FieldWrapper
            id={field.id}
            label={label}
            required={isRequired}
            error={externalError}
            help={help}
            disabled={disabled || field.disabled}
            className={field.className}
        >
            <FieldComponent {...fieldProps} />
        </FieldWrapper>
    );
}

FieldFactory.displayName = 'FieldFactory';
