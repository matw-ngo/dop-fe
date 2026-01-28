import {
  FIELD_CATEGORY_MAP,
  FieldCategory,
  FieldType,
  STEP_PATTERNS,
} from "@/components/user-onboarding/constants/field-types";
import type {
  GeneratedStepConfig,
  MappedFlow,
} from "@/components/user-onboarding/types/field-config";
import { getFieldLabel } from "./fieldLabelMapper";

export interface GroupedField {
  type: FieldType;
  value: any;
  label: string;
  category: FieldCategory;
  order: number;
}

/**
 * Groups form data by field categories for intelligent display
 * Supports all 14 field types and maintains proper ordering
 */
export function groupFieldsByCategory(
  formData: Record<string, any>,
  fieldConfig?: GeneratedStepConfig[],
  flowData?: MappedFlow,
  t?: (key: string) => string,
): Record<FieldCategory, GroupedField[]> {
  const groups: Record<FieldCategory, GroupedField[]> = {
    [FieldCategory.PERSONAL]: [],
    [FieldCategory.IDENTITY]: [],
    [FieldCategory.FINANCIAL]: [],
    [FieldCategory.LOAN]: [],
    [FieldCategory.VERIFICATION]: [],
  };

  // Get all field types that should be displayed
  const fieldTypes = getRelevantFieldTypes(formData, fieldConfig, flowData);

  // Process each field type
  fieldTypes.forEach((fieldType) => {
    const value = formData[fieldType];

    // Skip empty fields (but allow 0 for numeric fields)
    if (value === undefined || value === null || value === "") {
      return;
    }

    const category = FIELD_CATEGORY_MAP[fieldType];
    const order = getFieldOrder(fieldType);

    groups[category].push({
      type: fieldType,
      value,
      label: t ? getFieldLabel(fieldType, t) : fieldType,
      category,
      order,
    });
  });

  // Sort fields within each category by their order
  Object.keys(groups).forEach((category) => {
    groups[category as FieldCategory].sort((a, b) => a.order - b.order);
  });

  return groups;
}

/**
 * Determines which field types are relevant for the current flow
 */
function getRelevantFieldTypes(
  formData: Record<string, any>,
  fieldConfig?: GeneratedStepConfig[],
  _flowData?: MappedFlow,
): FieldType[] {
  // Start with all possible field types
  let relevantFields: FieldType[] = Object.values(FieldType);

  // If we have field config, filter based on that
  if (fieldConfig && fieldConfig.length > 0) {
    const configFields = new Set<FieldType>();

    fieldConfig.forEach((step) => {
      step.fields.forEach((field) => {
        // Extract field type from field name or configuration
        if (
          field.name &&
          Object.values(FieldType).includes(field.name as FieldType)
        ) {
          configFields.add(field.name as FieldType);
        }
      });
    });

    // Only include fields that are in the configuration
    relevantFields = relevantFields.filter((field) => configFields.has(field));
  }

  // Always include fields that have values in form data
  const dataFields = Object.keys(formData).filter(
    (key) =>
      Object.values(FieldType).includes(key as FieldType) &&
      formData[key] !== undefined &&
      formData[key] !== null &&
      formData[key] !== "",
  ) as FieldType[];

  // Combine both sets, remove duplicates
  const allFields = new Set([...relevantFields, ...dataFields]);

  return Array.from(allFields);
}

/**
 * Gets the display order for a field type based on STEP_PATTERNS
 */
function getFieldOrder(fieldType: FieldType): number {
  // Look through step patterns to find the field order
  for (const pattern of Object.values(STEP_PATTERNS)) {
    const index = pattern.fields.indexOf(fieldType);
    if (index !== -1) {
      // Add step offset to maintain step-based ordering
      const stepOrder = Object.keys(STEP_PATTERNS).indexOf(
        Object.keys(STEP_PATTERNS).find(
          (key) => STEP_PATTERNS[key as keyof typeof STEP_PATTERNS] === pattern,
        )!,
      );
      return stepOrder * 100 + index;
    }
  }

  // Default order if not found in patterns
  return 999;
}

/**
 * Calculates completion percentage based on expected fields
 */
export function calculateCompletionPercentage(
  formData: Record<string, any>,
  fieldConfig?: GeneratedStepConfig[],
  flowData?: MappedFlow,
): number {
  const expectedFields = getRelevantFieldTypes(formData, fieldConfig, flowData);
  const filledFields = expectedFields.filter((fieldType) => {
    const value = formData[fieldType];
    return value !== undefined && value !== null && value !== "";
  });

  if (expectedFields.length === 0) return 100;

  return Math.round((filledFields.length / expectedFields.length) * 100);
}
