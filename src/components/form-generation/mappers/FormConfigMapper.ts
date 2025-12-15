/**
 * Form Generation Library - Form Config Mapper
 * 
 * Transforms backend API responses to typed form configurations
 */

import {
    type DynamicFormConfig,
    type FormField,
    type FormSection,
    type AnyValidationRule,
    type SelectOption,
    FieldType,
    ValidationRuleType,
    LayoutType,
} from '../types';

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Expected API field structure (flexible)
 */
export interface ApiField {
    id: string;
    name: string;
    type: string;
    label?: string;
    placeholder?: string;
    help?: string;
    defaultValue?: any;
    disabled?: boolean;
    readOnly?: boolean;
    validation?: ApiValidation[];
    dependencies?: any[];
    layout?: any;
    i18n?: any;
    className?: string;
    style?: any;
    options?: any;
}

/**
 * Expected API validation structure
 */
export interface ApiValidation {
    type: string;
    value?: any;
    message?: string;
}

/**
 * Expected API section structure
 */
export interface ApiSection {
    id: string;
    title?: string;
    description?: string;
    fields: ApiField[];
    layout?: string;
    columns?: number;
    gap?: string | number;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    className?: string;
}

/**
 * Expected API response structure
 */
export interface ApiFormConfig {
    id?: string;
    fields?: ApiField[];
    sections?: ApiSection[];
    layout?: any;
    i18n?: {
        namespace?: string;
        locale?: string;
    };
    submitButton?: any;
}

// ============================================================================
// Mapper Class
// ============================================================================

export class FormConfigMapper {
    /**
     * Map API response to DynamicFormConfig
     * 
     * @param apiResponse - Backend API response
     * @returns Typed DynamicFormConfig
     */
    public static mapApiToFormConfig(
        apiResponse: ApiFormConfig
    ): DynamicFormConfig {
        const config: DynamicFormConfig = {
            id: apiResponse.id,
        };

        // Map fields
        if (apiResponse.fields && apiResponse.fields.length > 0) {
            config.fields = apiResponse.fields.map(field =>
                this.mapApiField(field)
            );
        }

        // Map sections
        if (apiResponse.sections && apiResponse.sections.length > 0) {
            config.sections = apiResponse.sections.map(section =>
                this.mapApiSection(section)
            );
        }

        // Map layout
        if (apiResponse.layout) {
            config.layout = {
                type: this.mapLayoutType(apiResponse.layout.type),
                columns: apiResponse.layout.columns,
                gap: apiResponse.layout.gap,
            };
        }

        // Map i18n
        if (apiResponse.i18n) {
            config.i18n = {
                namespace: apiResponse.i18n.namespace || 'forms',
                locale: apiResponse.i18n.locale,
            };
        }

        // Map submit button
        if (apiResponse.submitButton) {
            config.submitButton = {
                label: apiResponse.submitButton.label,
                disabled: apiResponse.submitButton.disabled,
                className: apiResponse.submitButton.className,
                position: apiResponse.submitButton.position || 'right',
            };
        }

        return config;
    }

    /**
     * Map API field to FormField
     */
    private static mapApiField(apiField: ApiField): FormField {
        const field: FormField = {
            id: apiField.id,
            name: apiField.name,
            type: this.mapFieldType(apiField.type),
            label: apiField.label,
            placeholder: apiField.placeholder,
            help: apiField.help,
            defaultValue: apiField.defaultValue,
            disabled: apiField.disabled,
            readOnly: apiField.readOnly,
            className: apiField.className,
            style: apiField.style,
        };

        // Map validation
        if (apiField.validation && apiField.validation.length > 0) {
            field.validation = apiField.validation.map(v =>
                this.mapValidationRule(v)
            );
        }

        // Map dependencies
        if (apiField.dependencies) {
            field.dependencies = apiField.dependencies.map(dep => ({
                conditions: dep.conditions || [],
                action: dep.action,
                logic: dep.logic || 'and',
            }));
        }

        // Map layout
        if (apiField.layout) {
            field.layout = {
                colSpan: apiField.layout.colSpan,
                rowSpan: apiField.layout.rowSpan,
                order: apiField.layout.order,
                width: apiField.layout.width,
                hidden: apiField.layout.hidden,
            };
        }

        // Map i18n
        if (apiField.i18n) {
            field.i18n = {
                labelKey: apiField.i18n.labelKey,
                placeholderKey: apiField.i18n.placeholderKey,
                helpKey: apiField.i18n.helpKey,
                namespace: apiField.i18n.namespace,
                enabled: apiField.i18n.enabled !== false,
            };
        }

        // Map field-specific options
        if (apiField.options) {
            field.options = this.mapFieldOptions(apiField.type, apiField.options);
        }

        return field;
    }

    /**
     * Map API section to FormSection
     */
    private static mapApiSection(apiSection: ApiSection): FormSection {
        return {
            id: apiSection.id,
            title: apiSection.title,
            description: apiSection.description,
            fields: apiSection.fields.map(field => this.mapApiField(field)),
            layout: this.mapLayoutType(apiSection.layout),
            columns: apiSection.columns,
            gap: apiSection.gap,
            collapsible: apiSection.collapsible,
            defaultCollapsed: apiSection.defaultCollapsed,
            className: apiSection.className,
        };
    }

    /**
     * Map string field type to FieldType enum
     */
    private static mapFieldType(type: string): FieldType {
        const typeMap: Record<string, FieldType> = {
            text: FieldType.TEXT,
            email: FieldType.EMAIL,
            password: FieldType.PASSWORD,
            url: FieldType.URL,
            tel: FieldType.TEL,
            textarea: FieldType.TEXTAREA,
            'rich-text': FieldType.RICH_TEXT,
            number: FieldType.NUMBER,
            currency: FieldType.CURRENCY,
            date: FieldType.DATE,
            datetime: FieldType.DATETIME,
            time: FieldType.TIME,
            'date-range': FieldType.DATE_RANGE,
            select: FieldType.SELECT,
            'multi-select': FieldType.MULTI_SELECT,
            radio: FieldType.RADIO,
            checkbox: FieldType.CHECKBOX,
            'checkbox-group': FieldType.CHECKBOX_GROUP,
            switch: FieldType.SWITCH,
            file: FieldType.FILE,
            'file-upload': FieldType.FILE_UPLOAD,
            'image-upload': FieldType.IMAGE_UPLOAD,
            slider: FieldType.SLIDER,
            rating: FieldType.RATING,
            color: FieldType.COLOR,
            custom: FieldType.CUSTOM,
        };

        return typeMap[type.toLowerCase()] || (type as FieldType);
    }

    /**
     * Map API validation to ValidationRule
     */
    private static mapValidationRule(
        apiValidation: ApiValidation
    ): AnyValidationRule {
        const ruleTypeMap: Record<string, ValidationRuleType> = {
            required: ValidationRuleType.REQUIRED,
            minLength: ValidationRuleType.MIN_LENGTH,
            maxLength: ValidationRuleType.MAX_LENGTH,
            min: ValidationRuleType.MIN,
            max: ValidationRuleType.MAX,
            pattern: ValidationRuleType.PATTERN,
            email: ValidationRuleType.EMAIL,
            url: ValidationRuleType.URL,
            phone: ValidationRuleType.PHONE,
            minDate: ValidationRuleType.MIN_DATE,
            maxDate: ValidationRuleType.MAX_DATE,
            custom: ValidationRuleType.CUSTOM,
        };

        const type = ruleTypeMap[apiValidation.type] || (apiValidation.type as ValidationRuleType);

        return {
            type,
            value: apiValidation.value,
            message: apiValidation.message,
        } as AnyValidationRule;
    }

    /**
     * Map layout type string to LayoutType enum
     */
    private static mapLayoutType(type?: string): LayoutType | undefined {
        if (!type) return undefined;

        const layoutMap: Record<string, LayoutType> = {
            grid: LayoutType.GRID,
            flex: LayoutType.FLEX,
            inline: LayoutType.INLINE,
            stack: LayoutType.STACK,
        };

        return layoutMap[type.toLowerCase()];
    }

    /**
     * Map field-specific options based on field type
     */
    private static mapFieldOptions(type: string, options: any): any {
        // For select/multi-select, ensure choices are properly formatted
        if (
            type === 'select' ||
            type === 'multi-select' ||
            type === 'radio' ||
            type === 'checkbox-group'
        ) {
            if (options.choices) {
                options.choices = this.mapSelectOptions(options.choices);
            }
        }

        // For date fields, convert string dates to Date objects if needed
        if (type === 'date' || type === 'datetime' || type === 'date-range') {
            if (options.minDate && typeof options.minDate === 'string') {
                options.minDate = new Date(options.minDate);
            }
            if (options.maxDate && typeof options.maxDate === 'string') {
                options.maxDate = new Date(options.maxDate);
            }
        }

        return options;
    }

    /**
     * Map select options to SelectOption format
     */
    private static mapSelectOptions(choices: any[]): SelectOption[] {
        return choices.map(choice => {
            // If choice is already in correct format
            if (typeof choice === 'object' && 'label' in choice && 'value' in choice) {
                return choice as SelectOption;
            }

            // If choice is a simple string/number
            return {
                label: String(choice),
                value: choice,
            };
        });
    }

    /**
     * Validate API response structure
     * 
     * @param apiResponse - API response to validate
     * @throws Error if validation fails
     */
    public static validateApiResponse(apiResponse: any): void {
        if (!apiResponse || typeof apiResponse !== 'object') {
            throw new Error('Invalid API response: must be an object');
        }

        // Must have either fields or sections
        if (!apiResponse.fields && !apiResponse.sections) {
            throw new Error(
                'Invalid API response: must contain either fields or sections'
            );
        }

        // Validate fields if present
        if (apiResponse.fields) {
            if (!Array.isArray(apiResponse.fields)) {
                throw new Error('Invalid API response: fields must be an array');
            }

            apiResponse.fields.forEach((field: any, index: number) => {
                if (!field.id || !field.name || !field.type) {
                    throw new Error(
                        `Invalid field at index ${index}: must have id, name, and type`
                    );
                }
            });
        }

        // Validate sections if present
        if (apiResponse.sections) {
            if (!Array.isArray(apiResponse.sections)) {
                throw new Error('Invalid API response: sections must be an array');
            }

            apiResponse.sections.forEach((section: any, index: number) => {
                if (!section.id || !section.fields) {
                    throw new Error(
                        `Invalid section at index ${index}: must have id and fields`
                    );
                }
            });
        }
    }
}
