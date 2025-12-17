"use client";

// FieldRenderer component for Data-Driven UI system
// Renders individual form fields dynamically based on configuration

import React from "react";
import { useFormContext } from "react-hook-form";
import { useComponentResolution } from "./hooks/useComponentResolution";
import { useFieldStyling } from "./hooks/useFieldStyling";

// Import extracted utilities and hooks
import { useFieldTranslations } from "./hooks/useFieldTranslations";
import { FormComponentRenderer } from "./renderers/FormComponentRenderer";
import { SpecialComponentRenderer } from "./renderers/SpecialComponentRenderer";
import type { FieldConfig } from "./types/data-driven-ui";
import type { ComponentVariant, LayoutProps } from "./types/ui-theme";
import { mergeComponentProps } from "./utils/field-utils";

// ============================================================================
// TYPES
// ============================================================================

interface FieldRendererProps {
  fieldConfig: FieldConfig;
  /** Optional namespace for translations */
  translationNamespace?: string;
  /** UI customization properties for this field */
  variant?: ComponentVariant;
  layout?: LayoutProps | string;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Renders a single field based on configuration
 * Handles component resolution, styling, and form integration
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
  fieldConfig,
  translationNamespace,
  variant,
  layout,
  className,
  style,
}) => {
  // Get form context for react-hook-form integration
  const form = useFormContext();

  // Resolve component with memoization
  const { Component, classification, error } = useComponentResolution(
    fieldConfig.component,
  );

  // Handle component resolution errors
  if (error || !Component) {
    console.error(`FieldRenderer Error: ${error}`);
    return (
      <div className="field-error p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-700 font-medium">
          Component Error: "{fieldConfig.component}" is not available
        </p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  // Extract translations with fallback logic
  const translations = useFieldTranslations(
    fieldConfig.props,
    translationNamespace,
  );

  // Generate all styling classes and configurations
  const styling = useFieldStyling(
    fieldConfig,
    variant,
    layout,
    className,
    style,
  );

  // Merge component props with field configuration
  const mergedProps = React.useMemo(
    () => mergeComponentProps(fieldConfig.props, styling.fieldVariant),
    [fieldConfig.props, styling.fieldVariant],
  );

  // Render special components (Button, Label, Badge, etc.)
  if (classification.isSpecial) {
    return (
      <SpecialComponentRenderer
        component={fieldConfig.component as any}
        ComponentToRender={Component}
        componentProps={mergedProps}
        containerClasses={styling.containerClasses}
        fieldClassName={styling.fieldClassName}
        fieldStyle={styling.fieldStyle}
        label={translations.label}
      />
    );
  }

  // Render form components with react-hook-form integration
  return (
    <FormComponentRenderer
      fieldName={fieldConfig.fieldName}
      Component={Component}
      componentType={fieldConfig.component}
      componentProps={mergedProps}
      formControl={form.control}
      label={translations.label}
      placeholder={translations.placeholder}
      description={translations.description}
      containerClasses={styling.containerClasses}
      className={styling.fieldClassName}
      style={styling.fieldStyle}
      disabled={fieldConfig.props.disabled}
      required={fieldConfig.props.required}
    />
  );
};

// Export as default for backward compatibility
export default FieldRenderer;
