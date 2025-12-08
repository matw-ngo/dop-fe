"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateZodSchema } from "@/components/renderer/builders/zod-generator";
import { evaluateCondition } from "@/components/renderer/types/field-conditions";
import type { FieldConfig } from "@/components/renderer/types/data-driven-ui";
import type { z } from "zod";

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  defaultValues?: Record<string, any>;
}

interface UseFormValidationResult {
  resolver: (values: any, context: any, options: any) => Promise<any>;
  formSchema: z.ZodSchema<any>;
  mode: "onChange" | "onBlur" | "onSubmit";
}

/**
 * Hook that creates a custom resolver for react-hook-form
 * - Only validates visible fields (based on conditions)
 * - Generates Zod schema dynamically
 * - Handles conditional field validation
 */
export function useFormValidation(
  processedFields: FieldConfig[],
  t: any,
  options: UseFormValidationOptions = {}
): UseFormValidationResult {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    defaultValues,
  } = options;

  // Generate Zod schema from field configurations (for reference, not used directly)
  const formSchema = useMemo(() => {
    return generateZodSchema(processedFields, t);
  }, [processedFields, t]);

  // Initialize react-hook-form with custom resolver that handles conditional fields
  const resolver = useMemo(async (values: any, context: any, options: any) => {
    // Custom resolver that only validates visible fields
    const visibleFieldNames = new Set(
      processedFields
        .filter(
          (field) =>
            !field.condition ||
            evaluateCondition(field.condition as any, values),
        )
        .map((field) => field.fieldName),
    );

    // Create a schema with only visible fields
    const visibleFields = processedFields.filter((f) =>
      visibleFieldNames.has(f.fieldName),
    );
    const visibleSchema = generateZodSchema(visibleFields, t);

    // Validate only visible fields
    const result = await zodResolver(visibleSchema)(values, context, options);

    return result;
  }, [processedFields, t]);

  const mode: "onChange" | "onBlur" | "onSubmit" = validateOnChange
    ? "onChange"
    : validateOnBlur
      ? "onBlur"
      : "onSubmit";

  return {
    resolver,
    formSchema,
    mode,
  };
}