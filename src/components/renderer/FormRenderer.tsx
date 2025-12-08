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
import type { FieldConfig, RawFieldConfig } from "./types/data-driven-ui";
import type {
  ComponentVariant,
  ResponsiveValue,
  LayoutProps,
} from "./types/ui-theme";
import {
  evaluateCondition,
  isComplexCondition,
  evaluateRule,
} from "./types/field-conditions";
import { useMultipleAsyncOptions } from "@/hooks/form/use-async-options";
import { generateZodSchema } from "@/components/renderer/builders/zod-generator";
import { getResponsiveClasses } from "@/components/renderer/constants/responsive-classnames";
import { cn } from "@/lib/utils";

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

  // Generate responsive classes for the form
  const formResponsiveClasses = React.useMemo(() => {
    if (!responsive) return "";

    const classes: string[] = [];

    if (responsive.form) {
      classes.push(getResponsiveClasses(responsive.form, (val) => String(val)));
    }

    return classes.join(" ");
  }, [responsive]);

  // Generate layout classes for the form
  const formLayoutClasses = React.useMemo(() => {
    if (!layout) return "";

    // If layout is a string, just return it
    if (typeof layout === "string") {
      return layout;
    }

    const classes: string[] = [];

    if (layout.display) {
      classes.push(layout.display);
    }

    if (layout.justify) {
      classes.push(`justify-${layout.justify}`);
    }

    if (layout.align) {
      classes.push(`items-${layout.align}`);
    }

    if (layout.direction) {
      classes.push(`flex-${layout.direction}`);
    }

    if (layout.gap) {
      classes.push(`gap-${String(layout.gap)}`);
    }

    if (layout.padding) {
      classes.push(String(layout.padding));
    }

    if (layout.margin) {
      classes.push(String(layout.margin));
    }

    return classes.join(" ");
  }, [layout]);

  // Generate variant classes for the form
  const formVariantClasses = React.useMemo(() => {
    if (!variant) return "";

    const classes: string[] = [];

    if (variant.size) {
      classes.push(`form-${variant.size}`);
    }

    if (variant.color) {
      classes.push(`form-${variant.color}`);
    }

    if (variant.variant) {
      classes.push(`form-${variant.variant}`);
    }

    return classes.join(" ");
  }, [variant]);

  // Check if we're using grid layout
  const isGridLayout = layout === "grid";

  // Combine all form CSS classes
  const formClasses = cn(
    // Only use space-y for non-grid layouts
    !isGridLayout && "space-y-6",
    // Add grid classes for grid layout
    isGridLayout &&
      "grid gap-4 w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    formResponsiveClasses,
    formLayoutClasses,
    formVariantClasses,
    className,
  );

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
