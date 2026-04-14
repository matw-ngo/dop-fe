import type {
  FieldFormData,
  FieldListItem,
  FieldType,
  StepDetail,
} from "@/types/admin";

/**
 * Map step data to field list with proper typing
 */
export function mapStepFields(step: StepDetail): FieldListItem[] {
  return step.fields.map((field) => ({
    ...field,
    // Ensure all required fields are present
    id: field.id,
    name: field.name,
    type: field.type,
    visible: field.visible ?? true,
    required: field.required ?? false,
    label: field.label || field.name,
    placeholder: field.placeholder || "",
    validation: field.validation || {},
  }));
}

/**
 * Validate field configuration
 */
export function validateFieldConfiguration(field: Partial<FieldFormData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required field validation
  if (!field.name || field.name.trim() === "") {
    errors.push("Field name is required");
  }

  if (!field.type) {
    errors.push("Field type is required");
  }

  // Name validation
  if (field.name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
    errors.push(
      "Field name must be a valid identifier (letters, numbers, underscores, no spaces)",
    );
  }

  // Type-specific validation
  if (field.type) {
    switch (field.type) {
      case "email":
        if (field.placeholder && !isValidEmailPlaceholder(field.placeholder)) {
          errors.push("Invalid email placeholder format");
        }
        break;

      case "number":
        if (field.validation) {
          const { min, max } = field.validation;
          if (min !== undefined && max !== undefined && min >= max) {
            errors.push("Minimum value must be less than maximum value");
          }
        }
        break;

      case "text":
      case "textarea":
        if (field.validation) {
          const { min, max } = field.validation;
          if (min !== undefined && max !== undefined && min >= max) {
            errors.push("Minimum length must be less than maximum length");
          }
          if (min !== undefined && min < 0) {
            errors.push("Minimum length cannot be negative");
          }
        }
        break;

      case "select":
      case "radio":
        if (!field.label || field.label.trim() === "") {
          errors.push("Label is required for select and radio fields");
        }
        break;
    }
  }

  // Validation pattern validation
  if (field.validation?.pattern) {
    try {
      new RegExp(field.validation.pattern);
    } catch (_e) {
      errors.push("Invalid validation pattern");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate field update payload for API
 */
export function generateFieldUpdatePayload(
  field: FieldListItem,
  changes: Partial<FieldFormData>,
): Partial<FieldFormData> {
  const payload: Partial<FieldFormData> = {};

  // Only include fields that have actually changed
  if (changes.name !== undefined && changes.name !== field.name) {
    payload.name = changes.name;
  }

  if (changes.type !== undefined && changes.type !== field.type) {
    payload.type = changes.type;
  }

  if (changes.label !== undefined && changes.label !== field.label) {
    payload.label = changes.label;
  }

  if (
    changes.placeholder !== undefined &&
    changes.placeholder !== field.placeholder
  ) {
    payload.placeholder = changes.placeholder;
  }

  if (changes.visible !== undefined && changes.visible !== field.visible) {
    payload.visible = changes.visible;
  }

  if (changes.required !== undefined && changes.required !== field.required) {
    payload.required = changes.required;
  }

  // Handle validation changes
  if (changes.validation !== undefined) {
    const currentValidation = field.validation || {};
    const newValidation = changes.validation || {};

    const validationPayload = {};

    // Only include validation rules that have changed
    if (newValidation.min !== currentValidation.min) {
      (validationPayload as any).min = newValidation.min;
    }

    if (newValidation.max !== currentValidation.max) {
      (validationPayload as any).max = newValidation.max;
    }

    if (newValidation.pattern !== currentValidation.pattern) {
      (validationPayload as any).pattern = newValidation.pattern;
    }

    // Only include validation if there are actual changes
    if (Object.keys(validationPayload).length > 0) {
      payload.validation = validationPayload;
    }
  }

  return payload;
}

/**
 * Calculate field statistics
 */
export function calculateFieldStats(fields: FieldListItem[]): {
  total: number;
  visible: number;
  hidden: number;
  required: number;
  optional: number;
  byType: Record<FieldType, number>;
} {
  const stats = {
    total: fields.length,
    visible: 0,
    hidden: 0,
    required: 0,
    optional: 0,
    byType: {} as Record<FieldType, number>,
  };

  fields.forEach((field) => {
    // Visibility stats
    if (field.visible) {
      stats.visible++;
    } else {
      stats.hidden++;
    }

    // Requirement stats
    if (field.required) {
      stats.required++;
    } else {
      stats.optional++;
    }

    // Type stats
    stats.byType[field.type] = (stats.byType[field.type] || 0) + 1;
  });

  return stats;
}

/**
 * Get field type display name
 */
export function getFieldTypeDisplayName(type: FieldType): string {
  const typeNames: Record<FieldType, string> = {
    text: "Text",
    email: "Email",
    password: "Password",
    number: "Number",
    date: "Date",
    select: "Select",
    checkbox: "Checkbox",
    radio: "Radio",
    textarea: "Textarea",
    file: "File",
    ekyc: "eKYC",
    otp: "OTP",
  };

  return typeNames[type] || type;
}

/**
 * Get field type icon name
 */
export function getFieldTypeIcon(type: FieldType): string {
  const typeIcons: Record<FieldType, string> = {
    text: "Type",
    email: "Mail",
    password: "Lock",
    number: "Hash",
    date: "Calendar",
    select: "ChevronDown",
    checkbox: "CheckSquare",
    radio: "Circle",
    textarea: "FileText",
    file: "Paperclip",
    ekyc: "Camera",
    otp: "Smartphone",
  };

  return typeIcons[type] || "Type";
}

/**
 * Check if field type supports validation
 */
export function fieldTypeSupportsValidation(type: FieldType): boolean {
  const typesWithValidation: FieldType[] = [
    "text",
    "email",
    "number",
    "textarea",
  ];

  return typesWithValidation.includes(type);
}

/**
 * Check if field type supports placeholder
 */
export function fieldTypeSupportsPlaceholder(type: FieldType): boolean {
  const typesWithPlaceholder: FieldType[] = [
    "text",
    "email",
    "number",
    "textarea",
  ];

  return typesWithPlaceholder.includes(type);
}

/**
 * Get default validation for field type
 */
export function getDefaultValidationForType(
  type: FieldType,
): FieldListItem["validation"] {
  switch (type) {
    case "email":
      return {
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      };

    case "number":
      return {
        min: 0,
      };

    case "text":
    case "textarea":
      return {
        max: 255,
      };

    default:
      return {};
  }
}

/**
 * Sort fields by order and name
 */
export function sortFields(fields: FieldListItem[]): FieldListItem[] {
  return [...fields].sort((a, b) => {
    // First by any explicit order (if available)
    if (a.name !== b.name) {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });
}

/**
 * Filter fields by criteria
 */
export function filterFields(
  fields: FieldListItem[],
  criteria: {
    visible?: boolean;
    required?: boolean;
    type?: FieldType;
    search?: string;
  },
): FieldListItem[] {
  return fields.filter((field) => {
    // Visibility filter
    if (criteria.visible !== undefined && field.visible !== criteria.visible) {
      return false;
    }

    // Requirement filter
    if (
      criteria.required !== undefined &&
      field.required !== criteria.required
    ) {
      return false;
    }

    // Type filter
    if (criteria.type && field.type !== criteria.type) {
      return false;
    }

    // Search filter
    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      const searchableText = [
        field.name,
        field.label,
        field.placeholder,
        field.type,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}

// Helper functions
function isValidEmailPlaceholder(placeholder: string): boolean {
  // Basic check for email placeholder format
  const emailPlaceholders = [
    "email",
    "email address",
    "your email",
    "enter email",
  ];

  const lowerPlaceholder = placeholder.toLowerCase();
  return emailPlaceholders.some((p) => lowerPlaceholder.includes(p));
}

/**
 * Generate a unique field name based on existing fields
 */
export function generateUniqueFieldName(
  baseName: string,
  existingFields: FieldListItem[],
): string {
  let fieldName = baseName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  let counter = 1;

  // Ensure it starts with a letter
  if (/^[0-9]/.test(fieldName)) {
    fieldName = `field_${fieldName}`;
  }

  let finalName = fieldName;

  while (existingFields.some((field) => field.name === finalName)) {
    finalName = `${fieldName}_${counter}`;
    counter++;
  }

  return finalName;
}

/**
 * Create a new field with default values
 */
export function createNewField(
  type: FieldType,
  existingFields: FieldListItem[],
): FieldListItem {
  const name = generateUniqueFieldName(`new_${type}`, existingFields);

  return {
    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    visible: true,
    required: false,
    label: getFieldTypeDisplayName(type),
    placeholder: fieldTypeSupportsPlaceholder(type)
      ? `Enter ${getFieldTypeDisplayName(type).toLowerCase()}`
      : "",
    validation: getDefaultValidationForType(type),
  };
}
