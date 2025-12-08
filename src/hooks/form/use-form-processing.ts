"use client";

import { useMemo } from "react";
import { mergeWithDefaults } from "@/configs/DefaultFieldConfig";
import {
  isRegisteredComponent,
  type RegisteredComponent,
} from "@/components/renderer/ComponentRegistry";
import type { FieldConfig, RawFieldConfig } from "@/components/renderer/types/data-driven-ui";

interface UseFormProcessingOptions {
  defaultValues?: Record<string, any>;
}

interface UseFormProcessingResult {
  processedFields: FieldConfig[];
  computedDefaultValues: Record<string, any>;
}

/**
 * Hook that processes raw field configurations from backend
 * - Filters out unregistered components
 * - Merges with default props
 * - Computes default values for fields
 */
export function useFormProcessing(
  fields: RawFieldConfig[],
  options: UseFormProcessingOptions = {}
): UseFormProcessingResult {
  const { defaultValues = {} } = options;

  // Process and merge field configurations with defaults
  const processedFields = useMemo(() => {
    return fields
      .filter((field) => {
        // Filter out fields with unregistered components
        if (!isRegisteredComponent(field.component)) {
          console.warn(
            `Component "${field.component}" is not registered, skipping field "${field.fieldName}"`,
          );
          return false;
        }
        return true;
      })
      .map((field) => {
        // Merge with defaults
        const mergedProps = mergeWithDefaults(
          field.component as RegisteredComponent,
          field.props,
        );

        return {
          ...field,
          props: mergedProps,
        } as FieldConfig;
      });
  }, [fields]);

  // Generate default values for fields not provided
  const computedDefaultValues = useMemo(() => {
    const defaults: Record<string, any> = { ...defaultValues };

    for (const field of processedFields) {
      if (defaults[field.fieldName] === undefined) {
        // Check if field is required
        const hasRequiredRule = field.props.validations?.some(
          (v) => v.type === "required",
        );

        // Set appropriate default values based on component type
        if (field.component === "Checkbox" || field.component === "Switch") {
          defaults[field.fieldName] = false;
        } else if (field.component === "Slider") {
          defaults[field.fieldName] = field.props.defaultValue || 0;
        } else {
          // For required fields: don't set default (leave undefined)
          // For optional fields: set empty string
          defaults[field.fieldName] = hasRequiredRule ? undefined : "";
        }
      }
    }

    return defaults;
  }, [processedFields, defaultValues]);

  return {
    processedFields,
    computedDefaultValues,
  };
}