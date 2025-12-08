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
import type { FieldConfig } from "./types/data-driven-ui";
import type {
  ComponentVariant,
  ResponsiveValue,
  LayoutProps,
} from "./types/ui-theme";
import { cn } from "@/lib/utils";

interface FieldRendererProps {
  fieldConfig: FieldConfig;
  /** Optional namespace for translations */
  translationNamespace?: string;
  /** UI customization properties for this field */
  variant?: ComponentVariant;
  responsive?: {
    container?: ResponsiveValue<string>;
    fields?: ResponsiveValue<string>;
  };
  layout?: LayoutProps | string;
  className?: string;
  style?: React.CSSProperties;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldConfig,
  translationNamespace,
  variant,
  responsive,
  layout,
  className,
  style,
}) => {
  // Get form context from react-hook-form
  const { control } = useFormContext();

  // Setup translations - use root to handle keys with full paths
  const tRoot = useTranslations();
  const tNamespaced = useTranslations(translationNamespace);

  const {
    component,
    fieldName,
    props,
    className: configClassName,
    style: configStyle,
  } = fieldConfig;

  // Extract properties from props that are actually used for UI customization
  const {
    variant: configVariant,
    responsive: configResponsive,
    layout: configLayout,
    className: propsClassName,
    style: propsStyle,
  } = props;
  console.log("fieldConfig", fieldConfig);
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

  // Apply UI customizations from fieldConfig (passed through from MultiStepFormRenderer)
  // Field-level configs take priority over form-level configs
  const fieldVariant = configVariant || variant;
  const fieldResponsive = configResponsive || responsive;
  const fieldLayout = configLayout || layout;
  // Priority: props.className > configClassName > className prop
  const fieldClassName = propsClassName || configClassName || className;
  // Priority: props.style > configStyle > style prop
  const fieldStyle = propsStyle || configStyle || style;

  // Generate responsive classes
  const responsiveClasses = React.useMemo(() => {
    if (!fieldResponsive) return "";

    // Handle the new responsive structure with breakpoint-specific values
    const classes: string[] = [];

    Object.entries(fieldResponsive).forEach(([breakpoint, value]) => {
      if (typeof value === "string") {
        // For breakpoints like 'initial', 'md', 'lg', etc.
        if (breakpoint === "initial") {
          classes.push(value);
        } else {
          classes.push(`${breakpoint}:${value}`);
        }
      }
    });

    return classes.join(" ");
  }, [fieldResponsive]);

  // Generate layout classes
  const layoutClasses = React.useMemo(() => {
    if (!fieldLayout) return "";

    // If layout is a string, just return it
    if (typeof fieldLayout === "string") {
      return fieldLayout;
    }

    const classes: string[] = [];

    if (fieldLayout.display) {
      classes.push(fieldLayout.display);
    }

    if (fieldLayout.justify) {
      classes.push(`justify-${fieldLayout.justify}`);
    }

    if (fieldLayout.align) {
      classes.push(`items-${fieldLayout.align}`);
    }

    if (fieldLayout.direction) {
      classes.push(`flex-${fieldLayout.direction}`);
    }

    if (fieldLayout.gap) {
      classes.push(`gap-${String(fieldLayout.gap)}`);
    }

    if (fieldLayout.padding) {
      classes.push(String(fieldLayout.padding));
    }

    if (fieldLayout.margin) {
      classes.push(String(fieldLayout.margin));
    }

    return classes.join(" ");
  }, [fieldLayout]);

  // Generate variant classes
  const variantClasses = React.useMemo(() => {
    if (!fieldVariant) return "";

    const classes: string[] = [];

    if (fieldVariant.size) {
      classes.push(`variant-${fieldVariant.size}`);
    }

    if (fieldVariant.color) {
      classes.push(`variant-${fieldVariant.color}`);
    }

    if (fieldVariant.variant) {
      classes.push(`variant-${fieldVariant.variant}`);
    }

    return classes.join(" ");
  }, [fieldVariant]);

  // Combine all CSS classes (excluding fieldClassName which will be applied to FormItem)
  const containerClasses = cn(
    "field-container",
    responsiveClasses,
    layoutClasses,
    variantClasses,
  );

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

    // Merge variant props with component props
    const componentProps = React.useMemo(() => {
      const merged: any = { ...restProps };

      // Apply variant properties to the component
      if (fieldVariant) {
        if (fieldVariant.size && !merged.size) {
          merged.size = fieldVariant.size;
        }
        if (fieldVariant.color && !merged.color) {
          merged.color = fieldVariant.color;
        }
        if (fieldVariant.variant && !merged.variant) {
          merged.variant = fieldVariant.variant;
        }
      }

      return merged;
    }, [fieldVariant, restProps]);

    switch (component) {
      case "Button":
        // Buttons don't use FormField wrapper
        return (
          <div
            className={cn(containerClasses, fieldClassName)}
            style={fieldStyle}
          >
            <Component {...componentProps}>{label}</Component>
          </div>
        );

      case "Label":
        // Labels are standalone
        return (
          <div
            className={cn(containerClasses, fieldClassName)}
            style={fieldStyle}
          >
            <Component {...componentProps}>{label}</Component>
          </div>
        );

      case "Badge":
        // Badges are display-only
        return (
          <div
            className={cn(containerClasses, fieldClassName)}
            style={fieldStyle}
          >
            <Component {...componentProps}>{label}</Component>
          </div>
        );

      case "Separator":
        // Separators are layout elements
        return (
          <div
            className={cn(containerClasses, fieldClassName)}
            style={fieldStyle}
          >
            <Component {...componentProps} />
          </div>
        );

      case "Progress":
        return (
          <div
            className={cn("space-y-2", containerClasses, fieldClassName)}
            style={fieldStyle}
          >
            {label && <FormLabel>{label}</FormLabel>}
            <Component {...componentProps} />
          </div>
        );

      case "Confirmation":
        // Confirmation component needs form data and additional props
        return (
          <div
            className={cn(containerClasses, fieldClassName)}
            style={fieldStyle}
          >
            <Component {...componentProps} />
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
    "Confirmation",
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

        // Merge variant props with component props
        const componentProps = React.useMemo(() => {
          const merged: any = { ...restProps };

          // Apply variant properties to the component
          if (fieldVariant) {
            if (fieldVariant.size && !merged.size) {
              merged.size = fieldVariant.size;
            }
            if (fieldVariant.color && !merged.color) {
              merged.color = fieldVariant.color;
            }
            if (fieldVariant.variant && !merged.variant) {
              merged.variant = fieldVariant.variant;
            }
          }

          return merged;
        }, [fieldVariant, restProps]);

        const renderInput = () => {
          switch (component) {
            case "Checkbox":
            case "Switch":
              return (
                <div
                  className={cn(
                    "flex items-center space-x-2",
                    containerClasses,
                    fieldClassName,
                  )}
                >
                  <Component
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    {...componentProps}
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
                  options={componentProps.options || []}
                  {...componentProps}
                />
              );

            case "RadioGroup":
              return (
                <Component
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  name={fieldName}
                  options={componentProps.options || []}
                  {...componentProps}
                />
              );

            case "ToggleGroup":
              return (
                <Component
                  value={field.value || ""}
                  onChange={field.onChange}
                  name={fieldName}
                  options={componentProps.options || []}
                  {...componentProps}
                />
              );

            case "InputOTP":
              return (
                <Component
                  value={field.value || ""}
                  onChange={field.onChange}
                  name={fieldName}
                  {...componentProps}
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
                  {...componentProps}
                />
              );

            default:
              return (
                <Component
                  {...field}
                  {...componentProps}
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
          <FormItem
            className={cn(containerClasses, fieldClassName)}
            style={fieldStyle}
          >
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
