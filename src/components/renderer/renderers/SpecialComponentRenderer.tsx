import React from "react";
import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { SpecialComponentType } from "../constants/field-components";

interface SpecialComponentRendererProps {
  component: SpecialComponentType;
  ComponentToRender: React.ComponentType<any>;
  componentProps: Record<string, any>;
  containerClasses: string;
  fieldClassName?: string;
  fieldStyle?: React.CSSProperties;
  label?: string;
}

/**
 * Renders special components that don't use FormField wrapper
 * These include: Button, Label, Badge, Separator, Progress, Confirmation
 */
export const SpecialComponentRenderer: React.FC<
  SpecialComponentRendererProps
> = ({
  component,
  ComponentToRender,
  componentProps,
  containerClasses,
  fieldClassName,
  fieldStyle,
  label,
}) => {
  const Component = ComponentToRender;

  switch (component) {
    case "Button":
    case "Label":
    case "Badge":
      return (
        <div
          className={cn(containerClasses, fieldClassName)}
          style={fieldStyle}
        >
          <Component {...componentProps}>{label}</Component>
        </div>
      );

    case "Separator":
    case "Confirmation":
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

    default:
      // This should never happen with proper type checking
      console.warn(`Unknown special component: ${component}`);
      return null;
  }
};
