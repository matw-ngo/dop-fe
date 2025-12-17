"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import type { z } from "zod";
import { generateZodSchema } from "@/components/renderer/builders/zod-generator";
import type { FieldConfig } from "@/components/renderer/types/data-driven-ui";
import { evaluateCondition } from "@/components/renderer/types/field-conditions";

// Global schema cache to improve performance
const schemaCache = new Map<string, z.ZodSchema<any>>();

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
  options: UseFormValidationOptions = {},
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

  // Debounce timer for validation
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Custom resolver with caching
  const resolver = useMemo(() => {
    // Return the resolver function
    return async (values: any, context: any, options: any) => {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Return a promise that resolves after debounce
      return new Promise<any>((resolve) => {
        debounceTimer.current = setTimeout(async () => {
          try {
            // Determine visible fields based on current values
            const visibleFieldNames = new Set(
              processedFields
                .filter(
                  (field) =>
                    !field.condition ||
                    evaluateCondition(field.condition as any, values),
                )
                .map((field) => field.fieldName),
            );

            // Create cache key from visible field names
            const cacheKey = Array.from(visibleFieldNames).sort().join(",");

            // Get or create cached schema
            let visibleSchema = schemaCache.get(cacheKey);
            if (!visibleSchema) {
              const visibleFields = processedFields.filter((f) =>
                visibleFieldNames.has(f.fieldName),
              );
              visibleSchema = generateZodSchema(visibleFields, t);
              schemaCache.set(cacheKey, visibleSchema);
            }

            // Validate using cached schema
            const result = await zodResolver(visibleSchema as any)(
              values,
              context,
              options,
            );
            resolve(result);
          } catch (error) {
            console.error("Validation error:", error);
            resolve({ values, errors: {} });
          }
        }, 50); // 50ms debounce
      });
    };
  }, [processedFields, t, evaluateCondition]);

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
