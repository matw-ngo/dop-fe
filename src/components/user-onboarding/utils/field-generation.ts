import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";
import type { MappedStep } from "@/mappers/flowMapper";
import { FieldType } from "../constants/field-types";
import type { FieldValidation } from "../types/field-config";

/**
 * Generate fields for a given step using the field builder map
 */
export function generateFieldsForStep(
  step: MappedStep,
  fieldBuilderMap: Record<string, (config?: any) => RawFieldConfig>,
): RawFieldConfig[] {
  const fields: RawFieldConfig[] = [];

  for (const [fieldName, config] of Object.entries(step.fields)) {
    if (config.visible) {
      const builder = fieldBuilderMap[fieldName];
      if (builder) {
        // Build the field with proper configuration
        const fieldConfig = builder({
          required: config.required,
          disabled: config.disabled || false,
        });

        fields.push(fieldConfig);
      } else {
        console.warn(`No field builder found for: ${fieldName}`);
      }
    }
  }

  return fields;
}

/**
 * Create validation rules for a field
 */
function _createValidations(fieldName: string, config: any): FieldValidation[] {
  const validations: FieldValidation[] = [];

  // Add required validation if field is required
  if (config.required) {
    validations.push({
      type: "required",
      messageKey: "form.errors.required",
    });
  }

  // Add field-specific validations
  switch (fieldName) {
    case FieldType.EMAIL:
      validations.push({
        type: "email",
        messageKey: "form.errors.email",
      });
      break;

    case FieldType.PHONE_NUMBER:
      validations.push({
        type: "pattern",
        messageKey: "form.errors.phone",
        value: "[+]?[0-9]{10,15}",
      });
      break;

    case FieldType.NATIONAL_ID:
    case FieldType.SECOND_NATIONAL_ID:
      validations.push({
        type: "minLength",
        messageKey: "form.errors.minLength",
        value: 5,
      });
      validations.push({
        type: "maxLength",
        messageKey: "form.errors.maxLength",
        value: 50,
      });
      break;

    case FieldType.DATE_OF_BIRTH:
      // Date validation is handled by the date picker component
      // But we can add custom validation if needed
      break;

    case FieldType.INCOME:
      validations.push({
        type: "custom",
        messageKey: "form.errors.positiveNumber",
      });
      break;

    case FieldType.FULL_NAME:
      validations.push({
        type: "minLength",
        messageKey: "form.errors.minLength",
        value: 2,
      });
      validations.push({
        type: "maxLength",
        messageKey: "form.errors.maxLength",
        value: 100,
      });
      break;
  }

  return validations;
}

/**
 * Filter fields based on dependencies and conditions
 */
export function filterFields(
  fields: RawFieldConfig[],
  formData: Record<string, any>,
): RawFieldConfig[] {
  return fields.filter((field) => {
    // Check if field should be shown based on form data
    if (field.fieldName === FieldType.HAVING_LOAN) {
      // Always show having loan field
      return true;
    }

    if (field.fieldName === FieldType.CREDIT_STATUS) {
      // Only show credit status if user has loans
      return formData[FieldType.HAVING_LOAN] === "yes";
    }

    // Default: show field
    return true;
  });
}

/**
 * Sort fields by priority and order
 */
export function sortFields(fields: RawFieldConfig[]): RawFieldConfig[] {
  const priorityOrder: Record<string, number> = {
    [FieldType.FULL_NAME]: 1,
    [FieldType.EMAIL]: 2,
    [FieldType.PHONE_NUMBER]: 3,
    [FieldType.DATE_OF_BIRTH]: 4,
    [FieldType.NATIONAL_ID]: 5,
    [FieldType.GENDER]: 6,
    [FieldType.LOCATION]: 7,
    [FieldType.INCOME]: 8,
    [FieldType.INCOME_TYPE]: 9,
    [FieldType.CAREER_STATUS]: 10,
    [FieldType.CAREER_TYPE]: 11,
    [FieldType.HAVING_LOAN]: 12,
    [FieldType.CREDIT_STATUS]: 13,
    [FieldType.PURPOSE]: 14,
    [FieldType.SECOND_NATIONAL_ID]: 15,
    [FieldType.EKYC_VERIFICATION]: 100, // Always last
  };

  return fields.sort((a, b) => {
    const priorityA = priorityOrder[a.fieldName] || 999;
    const priorityB = priorityOrder[b.fieldName] || 999;

    return priorityA - priorityB;
  });
}

/**
 * Group fields by category for better organization
 */
export function groupFieldsByCategory(
  fields: RawFieldConfig[],
): Record<string, RawFieldConfig[]> {
  const groups: Record<string, RawFieldConfig[]> = {
    personal: [],
    identity: [],
    financial: [],
    loan: [],
    other: [],
  };

  fields.forEach((field) => {
    const fieldName = field.fieldName as FieldType;

    // Personal information
    if (
      [
        FieldType.FULL_NAME,
        FieldType.EMAIL,
        FieldType.PHONE_NUMBER,
        FieldType.GENDER,
      ].includes(fieldName)
    ) {
      groups.personal.push(field);
    }
    // Identity verification
    else if (
      [
        FieldType.NATIONAL_ID,
        FieldType.SECOND_NATIONAL_ID,
        FieldType.DATE_OF_BIRTH,
        FieldType.LOCATION,
      ].includes(fieldName)
    ) {
      groups.identity.push(field);
    }
    // Financial information
    else if (
      [
        FieldType.INCOME,
        FieldType.INCOME_TYPE,
        FieldType.CAREER_STATUS,
        FieldType.CAREER_TYPE,
      ].includes(fieldName)
    ) {
      groups.financial.push(field);
    }
    // Loan information
    else if (
      [
        FieldType.HAVING_LOAN,
        FieldType.CREDIT_STATUS,
        FieldType.PURPOSE,
      ].includes(fieldName)
    ) {
      groups.loan.push(field);
    }
    // Special or other fields
    else {
      groups.other.push(field);
    }
  });

  return groups;
}

/**
 * Validate all fields in a step
 */
export function validateStepFields(
  fields: RawFieldConfig[],
  formData: Record<string, any>,
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  fields.forEach((field) => {
    const value = formData[field.fieldName];

    // Check required fields
    if (field.props?.required && (!value || value === "")) {
      errors[field.fieldName] = "Trường này là bắt buộc";
      isValid = false;
    }

    // Check other validations
    if (value && field.props?.validations) {
      field.props.validations.forEach((validation) => {
        switch (validation.type) {
          case "email": {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[field.fieldName] =
                validation.messageKey || "Email không hợp lệ";
              isValid = false;
            }
            break;
          }

          case "minLength":
            if (value.length < (validation.value as number)) {
              errors[field.fieldName] =
                validation.messageKey || "Độ dài tối thiểu không đủ";
              isValid = false;
            }
            break;

          case "maxLength":
            if (value.length > (validation.value as number)) {
              errors[field.fieldName] =
                validation.messageKey || "Độ dài vượt quá giới hạn";
              isValid = false;
            }
            break;

          case "pattern": {
            const regex = new RegExp(validation.value as string);
            if (!regex.test(value)) {
              errors[field.fieldName] =
                validation.messageKey || "Định dạng không hợp lệ";
              isValid = false;
            }
            break;
          }
        }
      });
    }
  });

  return { isValid, errors };
}
