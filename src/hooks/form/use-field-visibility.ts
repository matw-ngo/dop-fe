"use client";

import { useCallback, useMemo } from "react";
import type { FieldConfig } from "@/components/renderer/types/data-driven-ui";
import { evaluateCondition } from "@/components/renderer/types/field-conditions";

interface UseFieldVisibilityResult {
  visibleFieldNames: Set<string>;
  visibleFields: FieldConfig[];
  shouldRenderField: (field: FieldConfig) => boolean;
}

/**
 * Hook that manages field visibility based on conditions
 * - Determines which fields should be visible
 * - Provides utility functions for checking visibility
 * - Handles complex condition evaluation
 */
export function useFieldVisibility(
  processedFields: FieldConfig[],
  watchedValues: Record<string, any>,
): UseFieldVisibilityResult {
  // Get list of currently visible field names (updated when form values change)
  const visibleFieldNames = useMemo(() => {
    return new Set(
      processedFields
        .filter(
          (field) =>
            !field.condition ||
            evaluateCondition(field.condition as any, watchedValues),
        )
        .map((field) => field.fieldName),
    );
  }, [processedFields, watchedValues]);

  // Check if a field should be rendered based on its condition
  const shouldRenderField = useCallback(
    (field: FieldConfig): boolean => {
      if (!field.condition) return true;

      // Use enhanced condition evaluation
      try {
        return evaluateCondition(field.condition as any, watchedValues);
      } catch (error) {
        console.error("Error evaluating field condition:", error);
        return true; // Show field if evaluation fails
      }
    },
    [watchedValues],
  );

  // Get list of visible fields
  const visibleFields = useMemo(() => {
    return processedFields.filter(shouldRenderField);
  }, [processedFields, shouldRenderField]);

  return {
    visibleFieldNames,
    visibleFields,
    shouldRenderField,
  };
}
