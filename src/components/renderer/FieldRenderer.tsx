"use client";

// FieldRenderer component for Data-Driven UI system
// Renders individual form fields dynamically based on configuration

import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getComponent } from "@/components/renderer/ComponentRegistry";
import type { FieldConfig } from "@/types/data-driven-ui";

interface FieldRendererProps {
  fieldConfig: FieldConfig;
  /** Optional namespace for translations */
  translationNamespace?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldConfig,
  translationNamespace,
}) => {
  // Get form context from react-hook-form
  const { control } = useFormContext();

  // Setup translations - use root to handle keys with full paths
  const tRoot = useTranslations();
  const tNamespaced = useTranslations(translationNamespace);

  const { component, fieldName, props } = fieldConfig;

  // Get the actual React component from registry
  const ComponentToRender = getComponent(component);

  if (!ComponentToRender) {
    return (
      <div className="border border-destructive border-dashed p-4 rounded-md">
        <p className="text-destructive text-sm">
          Error: Component &quot;{component}&quot; is not registered.
        </p>
      </div>
    );
  }

  // Extract translatable props (ending with 'Key')
  const {
    labelKey,
    placeholderKey,
    descriptionKey,
    validations,
    ...restProps
  } = props;

  // Check if field is required
  const isRequired = validations?.some((v) => v.type === "required") || false;

  // Translate the keys to actual text, with fallbacks
  // Try root first (for full paths like 'form.field.email.label'), then namespaced, then fallback
  const label = labelKey
    ? tRoot.has(labelKey)
      ? tRoot(labelKey)
      : tNamespaced.has(labelKey)
        ? tNamespaced(labelKey)
        : props.label
    : props.label;

  const placeholder = placeholderKey
    ? tRoot.has(placeholderKey)
      ? tRoot(placeholderKey)
      : tNamespaced.has(placeholderKey)
        ? tNamespaced(placeholderKey)
        : props.placeholder
    : props.placeholder;

  const description = descriptionKey
    ? tRoot.has(descriptionKey)
      ? tRoot(descriptionKey)
      : tNamespaced.has(descriptionKey)
        ? tNamespaced(descriptionKey)
        : props.description
    : props.description;

  // Handle special component types that need custom rendering
  // These are non-form components that don't use FormField
  const renderSpecialComponent = () => {
    // Cast to any to avoid TypeScript type issues with dynamic components
    const Component = ComponentToRender as any;

    switch (component) {
      case "Button":
        // Buttons don't use FormField wrapper
        return <Component {...restProps}>{label}</Component>;

      case "Label":
        // Labels are standalone
        return <Component {...restProps}>{label}</Component>;

      case "Badge":
        // Badges are display-only
        return <Component {...restProps}>{label}</Component>;

      case "Separator":
        // Separators are layout elements
        return <Component {...restProps} />;

      case "Progress":
        return (
          <div className="space-y-2">
            {label && <FormLabel>{label}</FormLabel>}
            <Component {...restProps} />
          </div>
        );

      default:
        return null;
    }
  };

  // Check if this is a special component that needs custom rendering
  const specialComponents = [
    "Button",
    "Label",
    "Progress",
    "Badge",
    "Separator",
  ];
  if (specialComponents.includes(component)) {
    return renderSpecialComponent();
  }

  // For form field components, wrap with FormField
  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => {
        // Handle different component types
        // Cast to any to avoid TypeScript type issues with dynamic components
        const Component = ComponentToRender as any;

        const renderInput = () => {
          switch (component) {
            case "Checkbox":
            case "Switch":
              return (
                <div className="flex items-center space-x-2">
                  <Component
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    {...restProps}
                  />
                  {label && <FormLabel htmlFor={fieldName}>{label}</FormLabel>}
                </div>
              );

            case "Select":
              return (
                <Component
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  name={fieldName}
                  placeholder={placeholder}
                  options={restProps.options || []}
                  {...restProps}
                />
              );

            case "RadioGroup":
              return (
                <Component
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  name={fieldName}
                  options={restProps.options || []}
                  {...restProps}
                />
              );

            case "ToggleGroup":
              return (
                <Component
                  value={field.value || ""}
                  onChange={field.onChange}
                  name={fieldName}
                  options={restProps.options || []}
                  {...restProps}
                />
              );

            case "InputOTP":
              return (
                <Component
                  value={field.value || ""}
                  onChange={field.onChange}
                  name={fieldName}
                  {...restProps}
                />
              );

            case "DatePicker":
            case "DateRangePicker":
              return (
                <Component
                  value={field.value}
                  onChange={field.onChange}
                  name={fieldName}
                  placeholder={placeholder}
                  {...restProps}
                />
              );

            default:
              return (
                <Component
                  {...field}
                  {...restProps}
                  placeholder={placeholder}
                />
              );
          }
        };

        // Some components don't work well inside FormControl
        const needsFormControl = ![
          "Select",
          "RadioGroup",
          "DatePicker",
          "DateRangePicker",
          "ToggleGroup",
          "InputOTP",
        ].includes(component);

        return (
          <FormItem>
            {label && component !== "Checkbox" && component !== "Switch" && (
              <FormLabel>
                {label}
                {isRequired && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}

            {needsFormControl ? (
              <FormControl>{renderInput()}</FormControl>
            ) : (
              renderInput()
            )}

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default FieldRenderer;
