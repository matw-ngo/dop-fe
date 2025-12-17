import type React from "react";
import {
  type Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { getComponentEventHandler } from "../utils/field-utils";

interface FormComponentRendererProps {
  fieldName: string;
  Component: React.ComponentType<any>;
  componentType: string;
  componentProps: Record<string, any>;
  formControl: Control<any>;
  label?: string;
  placeholder?: string;
  description?: string;
  containerClasses?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Renders form components with proper react-hook-form integration
 * Handles different component types and their specific requirements
 */
export const FormComponentRenderer: React.FC<FormComponentRendererProps> = ({
  fieldName,
  Component,
  componentType,
  componentProps,
  formControl,
  label,
  placeholder,
  description,
  containerClasses,
  className,
  style,
  disabled = false,
  required = false,
}) => {
  // Get the appropriate event handler for this component type
  const eventHandlerName = getComponentEventHandler(componentType);

  // Determine if component needs FormControl wrapper
  const needsFormControl = ![
    "Select",
    "RadioGroup",
    "DatePicker",
    "DateRangePicker",
    "ToggleGroup",
    "InputOTP",
  ].includes(componentType);

  const renderComponent = (field: any) => {
    const commonProps = {
      ...componentProps,
      disabled: disabled || componentProps.disabled,
      placeholder: placeholder || componentProps.placeholder,
      // className: cn(className, componentProps.className),
      style: { ...style, ...componentProps.style },
    };

    // Components that use onValueChange instead of onChange
    if (["Select", "RadioGroup", "ToggleGroup"].includes(componentType)) {
      return (
        <Component
          {...commonProps}
          value={field.value}
          onValueChange={field.onChange}
        />
      );
    }

    // Date pickers might need special handling
    if (["DatePicker", "DateRangePicker"].includes(componentType)) {
      return (
        <Component
          {...commonProps}
          value={field.value}
          onChange={field.onChange}
        />
      );
    }

    // Default case for most form components
    return <Component {...commonProps} {...field} />;
  };

  if (needsFormControl) {
    return (
      <FormField
        control={formControl}
        name={fieldName}
        render={({ field }) => (
          <FormItem className={cn(containerClasses, className)}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            <FormControl>{renderComponent(field)}</FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Components that don't work well inside FormControl
  return (
    <FormField
      control={formControl}
      name={fieldName}
      render={({ field }) => (
        <FormItem className={cn(containerClasses, className)}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          {renderComponent(field)}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
