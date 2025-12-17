"use client";

// FormRenderer component for Data-Driven UI system
// Orchestrates rendering of complete forms with validation and state management

import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FieldRenderer } from "@/components/renderer/FieldRenderer";
import { Form } from "@/components/ui/form";
import { useMultipleAsyncOptions } from "@/hooks/form/use-async-options";
import { useFieldVisibility } from "@/hooks/form/use-field-visibility";
import { useFormProcessing } from "@/hooks/form/use-form-processing";
import { useFormValidation } from "@/hooks/form/use-form-validation";
import { useSafeTranslations } from "@/hooks/ui/use-safe-translations";
import { cn } from "@/lib/utils";
import type { RawFieldConfig } from "./types/data-driven-ui";
import type {
  ComponentVariant,
  LayoutProps,
  ResponsiveValue,
} from "./types/ui-theme";
import { useFormClassNames } from "./utils/form-class-names";

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

  /** UI customization properties for the form */
  variant?: ComponentVariant;
  responsive?: {
    form?: ResponsiveValue<string>;
    fields?: ResponsiveValue<string>;
  };
  layout?: LayoutProps | "grid" | "flex" | "block";
  style?: React.CSSProperties;
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
  variant,
  responsive,
  layout = "grid",
  style,
}) => {
  // Use safe translations that won't throw errors
  const t = useSafeTranslations();

  // Process field configurations and compute default values
  const { processedFields, computedDefaultValues } = useFormProcessing(fields, {
    defaultValues,
  });

  // Setup form validation with conditional field support
  const { resolver, mode } = useFormValidation(processedFields, t, {
    validateOnChange,
    validateOnBlur,
    defaultValues: computedDefaultValues,
  });

  // Initialize react-hook-form
  const form = useForm({
    resolver,
    defaultValues: computedDefaultValues,
    mode,
    reValidateMode: mode,
    // Don't validate on mount
    shouldUnregister: false,
  });

  // Watch all form values for conditional rendering and async options
  const watchedValues = form.watch();

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

  // Determine field visibility based on conditions
  const { visibleFields, visibleFieldNames } = useFieldVisibility(
    fieldsWithAsyncOptions,
    watchedValues,
  );

  // Clear errors for hidden fields
  React.useEffect(() => {
    processedFields.forEach((field) => {
      if (!visibleFieldNames.has(field.fieldName)) {
        form.clearErrors(field.fieldName);
      }
    });
  }, [visibleFieldNames, form, processedFields]);

  // Generate form CSS classes
  const { formClasses } = useFormClassNames({
    className,
    variant,
    responsive,
    layout,
  });

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

  // Check if we're using grid layout
  const isGridLayout = layout === "grid";

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={handleSubmit} className={formClasses} style={style}>
          {visibleFields.map((field) => (
            <FieldRenderer
              key={field.fieldName}
              fieldConfig={field}
              translationNamespace={translationNamespace}
              variant={variant} // Pass form-level variant as default
              layout={layout} // Pass form-level layout as default
            />
          ))}

          {formActions && (
            <div
              className={cn(
                "flex justify-end gap-4",
                isGridLayout
                  ? "col-span-full md:col-span-full lg:col-span-full"
                  : "mt-6",
                // Only check justify if layout is an object
                typeof layout === "object" &&
                  layout?.justify === "center" &&
                  "justify-center",
                typeof layout === "object" &&
                  layout?.justify === "start" &&
                  "justify-start",
                typeof layout === "object" &&
                  layout?.justify === "between" &&
                  "justify-between",
              )}
            >
              {formActions}
            </div>
          )}
        </form>
      </Form>
    </FormProvider>
  );
};

export default FormRenderer;
