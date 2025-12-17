// Barrel export for the renderer system
// Provides a single entry point for all renderer components and utilities

// Constants
export {
  COMPONENT_EVENT_HANDLERS,
  FORM_CONTROL_EXCLUDED,
  FORM_CONTROL_REQUIRED,
  type FormControlExcludedType,
  type FormControlRequiredType,
  SPECIAL_COMPONENTS,
  type SpecialComponentType,
} from "./constants/field-components";
// Main components
export { default as FieldRenderer } from "./FieldRenderer";
export { useComponentResolution } from "./hooks/useComponentResolution";
export { useFieldStyling } from "./hooks/useFieldStyling";
// Hooks
export { useFieldTranslations } from "./hooks/useFieldTranslations";
export { FormComponentRenderer } from "./renderers/FormComponentRenderer";
// Renderers
export { SpecialComponentRenderer } from "./renderers/SpecialComponentRenderer";
// Re-export types for convenience
export type {
  FieldCondition,
  FieldConfig,
  FieldProps,
} from "./types/data-driven-ui";
export type {
  ComponentVariant,
  LayoutProps,
} from "./types/ui-theme";
export {
  combineFieldClasses,
  generateAnimationClasses,
  generateLayoutClasses,
  generateVariantClasses,
} from "./utils/field-styling";
// Utilities
export {
  getComponentClassification,
  getComponentEventHandler,
  isSpecialComponent,
  isValidComponentName,
  mergeComponentProps,
  needsFormControl,
} from "./utils/field-utils";
