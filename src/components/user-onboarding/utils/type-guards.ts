import type { MappedFlow, MappedStep } from "@/mappers/flowMapper";
import { FieldType } from "../constants/field-types";
import type { FieldConfig, FieldValidation } from "../types/field-config";

/**
 * Type guard to check if a value is a valid FieldType
 */
export function isFieldType(value: string): value is FieldType {
  return Object.values(FieldType).includes(value as FieldType);
}

/**
 * Type guard to check if a value is a valid MappedFlow
 */
export function isMappedFlow(value: any): value is MappedFlow {
  return (
    value &&
    typeof value === "object" &&
    Array.isArray(value.steps) &&
    value.id &&
    value.title
  );
}

/**
 * Type guard to check if a value is a valid MappedStep
 */
export function isMappedStep(value: any): value is MappedStep {
  return (
    value &&
    typeof value === "object" &&
    value.id &&
    value.title &&
    typeof value.fields === "object"
  );
}

/**
 * Type guard to check if a field configuration is valid
 */
export function isValidFieldConfig(value: any): value is FieldConfig {
  return (
    value &&
    typeof value === "object" &&
    typeof value.name === "string" &&
    typeof value.label === "string" &&
    value.type &&
    value.variant &&
    value.animation
  );
}

/**
 * Type guard to check if a validation rule is valid
 */
export function isValidFieldValidation(value: any): value is FieldValidation {
  return (
    value &&
    typeof value === "object" &&
    typeof value.type === "string" &&
    typeof value.messageKey === "string"
  );
}

/**
 * Safe field property access with type checking
 */
export function safeGetFieldProperty<T>(
  obj: any,
  propertyPath: string,
  defaultValue: T,
): T {
  try {
    const properties = propertyPath.split(".");
    let current = obj;

    for (const prop of properties) {
      if (current && typeof current === "object" && prop in current) {
        current = current[prop];
      } else {
        return defaultValue;
      }
    }

    return current !== undefined ? current : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Check if a field is visible in a step
 */
export function isFieldVisible(step: MappedStep, fieldName: string): boolean {
  return safeGetFieldProperty(step, `fields.${fieldName}.visible`, false);
}

/**
 * Check if a field is required in a step
 */
export function isFieldRequired(step: MappedStep, fieldName: string): boolean {
  return safeGetFieldProperty(step, `fields.${fieldName}.required`, false);
}

/**
 * Check if a field is disabled in a step
 */
export function isFieldDisabled(step: MappedStep, fieldName: string): boolean {
  return safeGetFieldProperty(step, `fields.${fieldName}.disabled`, false);
}

/**
 * Type guard for form data values
 */
export function isValidFormDataValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

/**
 * Runtime type checking for field configurations
 */
export function validateFieldConfiguration(config: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config) {
    errors.push("Field configuration is null or undefined");
    return { isValid: false, errors };
  }

  // Check required properties
  if (!config.name || typeof config.name !== "string") {
    errors.push("Field must have a valid 'name' property");
  }

  if (!config.label || typeof config.label !== "string") {
    errors.push("Field must have a valid 'label' property");
  }

  if (!config.type || !isFieldType(config.type)) {
    errors.push(`Field must have a valid 'type' property`);
  }

  // Check variant
  if (!config.variant) {
    errors.push("Field must have a 'variant' property");
  } else if (
    !config.variant.size ||
    !config.variant.color ||
    !config.variant.variant
  ) {
    errors.push("Field variant must have size, color, and variant properties");
  }

  // Check animation
  if (!config.animation) {
    errors.push("Field must have an 'animation' property");
  } else if (!config.animation.type || !config.animation.duration) {
    errors.push("Field animation must have type and duration properties");
  }

  // Check layout
  if (!config.layout) {
    errors.push("Field must have a 'layout' property");
  } else if (!config.layout.display || !config.layout.padding) {
    errors.push("Field layout must have display and padding properties");
  }

  // Check className
  if (!config.className || typeof config.className !== "string") {
    errors.push("Field must have a valid 'className' property");
  }

  // Field-specific validations
  if (config.type === FieldType.EMAIL && config.type !== "email") {
    errors.push("Email field must have type 'email'");
  }

  if (config.type === FieldType.DATE_OF_BIRTH && config.type !== "date") {
    errors.push("Date of birth field must have type 'date'");
  }

  if (config.type === FieldType.INCOME && config.type !== "number") {
    errors.push("Income field must have type 'number'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Type guard for step metadata
 */
export function isValidStepMetadata(value: any): boolean {
  return (
    value &&
    typeof value === "object" &&
    typeof value.title === "string" &&
    typeof value.category === "string"
  );
}

/**
 * Safe array access with type checking
 */
export function safeArrayAccess<T>(
  arr: any,
  index: number,
  defaultValue: T,
): T {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue;
  }
  return arr[index] ?? defaultValue;
}

/**
 * Safe number conversion
 */
export function safeNumberConversion(value: any, defaultValue = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = parseFloat(value);
    return Number.isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}
