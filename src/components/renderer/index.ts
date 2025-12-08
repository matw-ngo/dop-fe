// Barrel export for the renderer system
// Provides a single entry point for all renderer components and utilities

// Main components
export { default as FieldRenderer } from "./FieldRenderer";

// Hooks
export { useFieldTranslations } from "./hooks/useFieldTranslations";
export { useFieldStyling } from "./hooks/useFieldStyling";
export { useComponentResolution } from "./hooks/useComponentResolution";

// Renderers
export { SpecialComponentRenderer } from "./renderers/SpecialComponentRenderer";
export { FormComponentRenderer } from "./renderers/FormComponentRenderer";

// Utilities
export {
  isSpecialComponent,
  needsFormControl,
  getComponentEventHandler,
  mergeComponentProps,
  isValidComponentName,
  getComponentClassification,
} from "./utils/field-utils";

export {
  generateLayoutClasses,
  generateVariantClasses,
  combineFieldClasses,
  generateAnimationClasses,
} from "./utils/field-styling";

// Constants
export {
  SPECIAL_COMPONENTS,
  FORM_CONTROL_EXCLUDED,
  FORM_CONTROL_REQUIRED,
  COMPONENT_EVENT_HANDLERS,
  type SpecialComponentType,
  type FormControlExcludedType,
  type FormControlRequiredType,
} from "./constants/field-components";

// Re-export types for convenience
export type {
  FieldConfig,
  FieldProps,
  FieldCondition,
} from "./types/data-driven-ui";

export type {
  ComponentVariant,
  LayoutProps,
} from "./types/ui-theme";
