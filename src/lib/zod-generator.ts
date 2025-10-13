// Zod Schema Generator for Data-Driven UI system
// Converts validation rules from backend into Zod schemas

import { z } from "zod";
import type { FieldConfig, ValidationRule } from "@/types/data-driven-ui";

/**
 * Generate a Zod schema from field configurations
 * @param fields Array of field configurations
 * @param t Translation function for error messages
 */
export function generateZodSchema(
  fields: FieldConfig[],
  t: (key: string, values?: Record<string, any>) => string,
) {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    // Determine base schema type based on component
    let fieldSchema: z.ZodTypeAny = z.string();

    // Special handling for different component types
    if (field.component === "Checkbox" || field.component === "Switch") {
      fieldSchema = z.boolean();
    } else if (field.component === "Slider") {
      fieldSchema = z.number();
    } else if (field.component === "DatePicker") {
      // Use coerce to handle string dates from localStorage
      fieldSchema = z.coerce.date();
    } else if (field.component === "DateRangePicker") {
      // Transform object with string dates to Date objects
      fieldSchema = z.object({
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      });
    } else if (field.component === "ToggleGroup") {
      // Check if it's multiple type by looking at props
      const isMultiple = field.props?.type === "multiple";
      if (isMultiple) {
        fieldSchema = z.array(z.string());
      } else {
        fieldSchema = z.string();
      }
    } else if (field.component === "Ekyc") {
      // eKYC returns an object with completion status
      fieldSchema = z
        .object({
          completed: z.boolean(),
          sessionId: z.string().optional(),
          data: z.any().optional(),
          timestamp: z.string().optional(),
        })
        .or(z.boolean());
    }

    const validations = field.props.validations || [];

    // Check if field is required
    const hasRequiredRule = validations.some(
      (rule) => rule.type === "required",
    );

    // Apply each validation rule with component context
    for (const rule of validations) {
      const message = rule.messageKey
        ? t(rule.messageKey, { value: rule.value })
        : undefined;
      fieldSchema = applyValidationRule(
        fieldSchema,
        rule,
        message,
        field.component,
      );
    }

    // Handle optional fields
    // For non-required string fields with other validations,
    // allow empty string OR validate when not empty
    if (!hasRequiredRule) {
      if (field.component === "Checkbox" || field.component === "Switch") {
        fieldSchema = fieldSchema.optional();
      } else if (field.component === "Slider") {
        fieldSchema = fieldSchema.optional();
      } else if (
        field.component === "ToggleGroup" &&
        field.props?.type === "multiple"
      ) {
        // For multiple toggle group: allow empty array OR undefined
        fieldSchema = fieldSchema.optional().or(z.array(z.string()).length(0));
      } else {
        // For strings: allow empty string OR undefined OR pass all validations
        fieldSchema = fieldSchema.optional().or(z.literal(""));
      }
    }

    schemaShape[field.fieldName] = fieldSchema;
  }

  return z.object(schemaShape);
}

/**
 * Apply a single validation rule to a Zod schema
 */
function applyValidationRule(
  schema: z.ZodTypeAny,
  rule: ValidationRule,
  message?: string,
  componentType?: string,
): z.ZodTypeAny {
  // Get the schema type name safely
  const schemaType = (schema._def as any).typeName as string | undefined;

  switch (rule.type) {
    case "required":
      // For booleans (checkbox/switch), ensure it's true
      if (
        schemaType === "ZodBoolean" ||
        componentType === "Checkbox" ||
        componentType === "Switch"
      ) {
        return (schema as z.ZodBoolean).refine((val) => val === true, {
          message,
        });
      }
      // For numbers (slider), ensure it's not undefined
      if (schemaType === "ZodNumber" || componentType === "Slider") {
        return (schema as z.ZodNumber).refine(
          (val) => val !== undefined && val !== null,
          { message },
        );
      }
      // For strings, use min(1) instead of nonempty for custom messages
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).min(1, { message });
      }
      // Fallback: just return the schema
      return schema;

    case "minLength":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).min(rule.value, { message });
      }
      return schema;

    case "maxLength":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).max(rule.value, { message });
      }
      return schema;

    case "min":
      // For numeric validations, convert to number first
      return z.coerce.number().min(rule.value, { message });

    case "max":
      return z.coerce.number().max(rule.value, { message });

    case "email":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).email({ message });
      }
      return schema;

    case "url":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).url({ message });
      }
      return schema;

    case "regex":
      if (schemaType === "ZodString") {
        const regex = new RegExp(rule.value);
        return (schema as z.ZodString).regex(regex, { message });
      }
      return schema;

    case "number":
      return z.coerce.number({ message });

    case "integer":
      return z.coerce.number().int({ message });

    case "positive":
      return z.coerce.number().positive({ message });

    case "negative":
      return z.coerce.number().negative({ message });

    case "boolean":
      return z.coerce.boolean({ message });

    case "date":
      return z.coerce.date({ message });

    case "array":
      return z.array(z.string(), { message });

    case "object":
      return z.object({}, { message });

    case "includes":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).includes(rule.value, { message });
      }
      return schema;

    case "startsWith":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).startsWith(rule.value, { message });
      }
      return schema;

    case "endsWith":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).endsWith(rule.value, { message });
      }
      return schema;

    case "uuid":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).uuid({ message });
      }
      return schema;

    case "cuid":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).cuid({ message });
      }
      return schema;

    case "length":
      if (schemaType === "ZodString") {
        return (schema as z.ZodString).length(rule.value, { message });
      }
      return schema;

    default:
      console.warn(`Unknown validation rule type: ${rule.type}`);
      return schema;
  }
}

/**
 * Generate schema for a specific field only (useful for dynamic validation)
 */
export function generateFieldSchema(
  fieldConfig: FieldConfig,
  t: (key: string, values?: Record<string, any>) => string,
) {
  return generateZodSchema([fieldConfig], t).shape[fieldConfig.fieldName];
}

/**
 * Validate a single field value against its configuration
 */
export function validateFieldValue(
  value: any,
  fieldConfig: FieldConfig,
  t: (key: string, values?: Record<string, any>) => string,
) {
  try {
    const schema = generateFieldSchema(fieldConfig, t);
    return { success: true, data: schema.parse(value), error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error:
          (error.issues && error.issues[0]?.message) || "Validation failed",
      };
    }
    return {
      success: false,
      data: null,
      error: "Unknown validation error",
    };
  }
}

/**
 * Check if a validation rule type is supported
 */
export function isValidationRuleSupported(ruleType: string): boolean {
  const supportedRules = [
    "required",
    "minLength",
    "maxLength",
    "min",
    "max",
    "email",
    "url",
    "regex",
    "number",
    "integer",
    "positive",
    "negative",
    "boolean",
    "date",
    "array",
    "object",
    "includes",
    "startsWith",
    "endsWith",
    "uuid",
    "cuid",
    "length",
  ];

  return supportedRules.includes(ruleType);
}
