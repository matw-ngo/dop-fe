"use client";

// FormRenderer component for Data-Driven UI system
// Orchestrates rendering of complete forms with validation and state management

import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Form } from "@/components/ui/form";
import { FieldRenderer } from "@/components/renderer/FieldRenderer";
import { mergeWithDefaults } from "@/configs/DefaultFieldConfig";
import {
  isRegisteredComponent,
  type RegisteredComponent,
} from "@/components/renderer/ComponentRegistry";
import type { FieldConfig, RawFieldConfig } from "@/types/data-driven-ui";
import {
  evaluateCondition,
  isComplexCondition,
  evaluateRule,
} from "@/types/field-conditions";
import { useMultipleAsyncOptions } from "@/hooks/form/use-async-options";
import { generateZodSchema } from "@/lib/builders/zod-generator";

interface FormRendererProps {
  /** Raw field configurations from backend */
  fields: RawFieldConfig[];

  /** Form submission handler */
  onSubmit: (data: Record<string, any>) => void | Promise<void>;

  /** Optional default values for form fields */
  defaultValues?: Record<string, any>;

  /** Optional translation namespace */
  translationNamespace?: string;

  /** Optional className for form container */
  className?: string;

  /** Optional custom form actions (buttons, etc.) */
  formActions?: React.ReactNode;

  /** Should validate on change (default: false) */
  validateOnChange?: boolean;

  /** Should validate on blur (default: true) */
  validateOnBlur?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  fields,
  onSubmit,
  defaultValues = {},
  translationNamespace,
  className = "",
  formActions,
  validateOnChange = false,
  validateOnBlur = true,
}) => {
  // Use root namespace to avoid duplication when keys already include namespace
  const tRaw = useTranslations();

  // Safe translation wrapper that doesn't throw
  const t = React.useMemo(() => {
    const safeFn = (key: string, values?: Record<string, any>) => {
      try {
        return tRaw(key, values);
      } catch (error) {
        // Return key as fallback for missing translations
        return key;
      }
    };
    // Add has method for checking key existence
    (safeFn as any).has = (key: string) => {
      try {
        return tRaw.has ? tRaw.has(key) : false;
      } catch {
        return false;
      }
    };
    return safeFn;
  }, [tRaw]);

  // Process and merge field configurations with defaults
  const processedFields = React.useMemo(() => {
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
  const computedDefaultValues = React.useMemo(() => {
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

  // Generate Zod schema from field configurations (for reference, not used directly)
  const formSchema = React.useMemo(() => {
    return generateZodSchema(processedFields, t);
  }, [processedFields, t]);

  // Initialize react-hook-form with custom resolver that handles conditional fields
  const form = useForm({
    resolver: async (values, context, options) => {
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
    },
    defaultValues: computedDefaultValues,
    mode: validateOnChange
      ? "onChange"
      : validateOnBlur
        ? "onBlur"
        : "onSubmit",
    reValidateMode: "onChange",
    // Don't validate on mount
    shouldUnregister: false,
  });

  // Watch all form values for conditional rendering and async options
  const watchedValues = form.watch();

  // Get list of currently visible field names (updated when form values change)
  const visibleFieldNames = React.useMemo(() => {
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

  // Extract fields with async options
  const asyncOptionsConfigs = React.useMemo(() => {
    const configs: Record<string, any> = {};

    for (const field of processedFields) {
      const optionsFetcher = field.props.optionsFetcher;
      if (!optionsFetcher) continue;

      const {
        fetcher,
        transform,
        cacheKey,
        cacheDuration,
        dependsOn = [],
      } = optionsFetcher;

      // Wrap fetcher to pass current form values
      const wrappedFetcher = async () => {
        // Check if dependencies are satisfied
        for (const dep of dependsOn) {
          if (!watchedValues[dep]) {
            return [];
          }
        }
        return fetcher(watchedValues);
      };

      configs[field.fieldName] = {
        fetcher: wrappedFetcher,
        transform,
        cacheKey,
        cacheDuration,
        dependencies: dependsOn.map((dep) => watchedValues[dep]),
        fetchOnMount:
          dependsOn.length === 0 ||
          dependsOn.every((dep) => watchedValues[dep]),
      };
    }

    return configs;
  }, [processedFields, watchedValues]);

  // Fetch async options
  const asyncOptionsState = useMultipleAsyncOptions(asyncOptionsConfigs);

  // Merge async options into processed fields
  const fieldsWithAsyncOptions = React.useMemo(() => {
    return processedFields.map((field) => {
      const asyncState = asyncOptionsState[field.fieldName];
      if (!asyncState) return field;

      return {
        ...field,
        props: {
          ...field.props,
          options: asyncState.options,
          disabled: field.props.disabled || asyncState.isLoading,
          placeholder: asyncState.isLoading
            ? "Loading..."
            : asyncState.error
              ? "Error loading options"
              : field.props.placeholder,
        },
      };
    });
  }, [processedFields, asyncOptionsState]);

  // Check if a field should be rendered based on its condition
  const shouldRenderField = (field: FieldConfig): boolean => {
    if (!field.condition) return true;

    // Use enhanced condition evaluation
    try {
      return evaluateCondition(field.condition as any, watchedValues);
    } catch (error) {
      console.error("Error evaluating field condition:", error);
      return true; // Show field if evaluation fails
    }
  };

  // Filter fields based on conditions
  const visibleFields = React.useMemo(() => {
    return fieldsWithAsyncOptions.filter(shouldRenderField);
  }, [fieldsWithAsyncOptions, watchedValues]);

  // Handle form submission with conditional validation
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Filter out data from hidden fields before submission
      const visibleData: Record<string, any> = {};
      for (const fieldName in data) {
        if (visibleFieldNames.has(fieldName)) {
          visibleData[fieldName] = data[fieldName];
        }
      }

      await onSubmit(visibleData);
    } catch (error) {
      console.error("Form submission error:", error);
      // You can add custom error handling here
    }
  });

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
          {visibleFields.map((field) => (
            <FieldRenderer
              key={field.fieldName}
              fieldConfig={field}
              translationNamespace={translationNamespace}
            />
          ))}

          {formActions && (
            <div className="flex justify-end gap-4">{formActions}</div>
          )}
        </form>
      </Form>
    </FormProvider>
  );
};

export default FormRenderer;
