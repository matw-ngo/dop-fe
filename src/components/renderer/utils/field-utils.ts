import type { ComponentVariant } from "../types/ui-theme";
import {
  SPECIAL_COMPONENTS,
  FORM_CONTROL_EXCLUDED,
  COMPONENT_EVENT_HANDLERS,
  type SpecialComponentType,
  type FormControlExcludedType,
} from "../constants/field-components";

/**
 * Utility functions for field component classification and handling
 */

/**
 * Checks if a component is a special component that doesn't use FormField
 */
export function isSpecialComponent(
  componentType: string,
): componentType is SpecialComponentType {
  return SPECIAL_COMPONENTS.includes(componentType as SpecialComponentType);
}

/**
 * Checks if a component should be excluded from FormControl wrapper
 */
export function needsFormControl(componentType: string): boolean {
  return !FORM_CONTROL_EXCLUDED.includes(
    componentType as FormControlExcludedType,
  );
}

/**
 * Gets the appropriate event handler name for a component type
 */
export function getComponentEventHandler(
  componentType: string,
): string | undefined {
  return COMPONENT_EVENT_HANDLERS[
    componentType as keyof typeof COMPONENT_EVENT_HANDLERS
  ];
}

/**
 * Merges variant props with component props
 * Variant props are only applied if not already defined in component props
 */
export function mergeComponentProps(
  restProps: Record<string, any>,
  fieldVariant?: ComponentVariant,
): Record<string, any> {
  const merged: Record<string, any> = { ...restProps };

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
}

/**
 * Validates if a component name is allowed to be rendered
 * Provides additional security by checking against known component lists
 */
export function isValidComponentName(componentName: string): boolean {
  // Check if it's a special component
  if (isSpecialComponent(componentName)) return true;

  // Check if it's a form control component
  if (!needsFormControl(componentName)) return true;

  // Check if it needs form control
  if (needsFormControl(componentName)) return true;

  // Component must be in at least one of the lists to be valid
  return false;
}

/**
 * Gets component classification for rendering decisions
 */
export function getComponentClassification(componentType: string) {
  return {
    isSpecial: isSpecialComponent(componentType),
    needsFormControl: needsFormControl(componentType),
    eventHandler: getComponentEventHandler(componentType),
    isValid: isValidComponentName(componentType),
  };
}
