import React from "react";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "../types/data-driven-ui";
import type { ComponentVariant, LayoutProps } from "../types/ui-theme";
import {
  generateAnimationClasses,
  generateLayoutClasses,
  generateVariantClasses,
} from "../utils/field-styling";

export interface FieldStyling {
  containerClasses: string;
  layoutClasses: string;
  variantClasses: string;
  fieldClassName?: string;
  fieldStyle?: React.CSSProperties;
  fieldVariant?: ComponentVariant;
}

/**
 * Hook to generate all CSS classes and styles for the field
 *
 * Handles layout, variant, and animation configurations with proper priority:
 * - props.className/style > configClassName/Style > className/style prop
 * Note: Responsive design is now handled directly through Tailwind classes in the className prop
 */
export function useFieldStyling(
  fieldConfig: FieldConfig,
  variant?: ComponentVariant,
  layout?: LayoutProps | string,
  className?: string,
  style?: React.CSSProperties,
): FieldStyling {
  const { props, className: configClassName, style: configStyle } = fieldConfig;
  const {
    variant: configVariant,
    layout: configLayout,
    className: propsClassName,
    style: propsStyle,
    animation: configAnimation,
  } = props;

  // Field-level configs take priority over form-level configs
  const fieldVariant = configVariant || variant;
  const fieldLayout = configLayout || layout;
  const fieldClassName = propsClassName || configClassName || className;
  const fieldStyle = propsStyle || configStyle || style;

  // Generate CSS classes with memoization
  const layoutClasses = React.useMemo(
    () => generateLayoutClasses(fieldLayout),
    [fieldLayout],
  );

  const variantClasses = React.useMemo(
    () => generateVariantClasses(fieldVariant),
    [fieldVariant],
  );

  const animationClasses = React.useMemo(
    () => generateAnimationClasses(configAnimation),
    [configAnimation],
  );

  const containerClasses = cn(
    "field-container",
    layoutClasses,
    variantClasses,
    animationClasses,
  );

  return {
    containerClasses,
    layoutClasses,
    variantClasses,
    fieldClassName,
    fieldStyle,
    fieldVariant,
  };
}
