import React from "react";
import { getComponent } from "../ComponentRegistry";
import { getComponentClassification } from "../utils/field-utils";

export interface ComponentResolution {
  Component: React.ComponentType<any> | null;
  classification: {
    isSpecial: boolean;
    needsFormControl: boolean;
    eventHandler: string | undefined;
    isValid: boolean;
  };
  error?: string;
}

/**
 * Hook to resolve and validate a component from the ComponentRegistry
 * Provides memoization to prevent repeated lookups and improves performance
 */
export function useComponentResolution(
  componentName: string,
): ComponentResolution {
  const resolution = React.useMemo(() => {
    // Get component classification first
    const classification = getComponentClassification(componentName);

    // If component is not valid, return error state
    if (!classification.isValid) {
      return {
        Component: null,
        classification,
        error: `Component "${componentName}" is not a valid component type`,
      };
    }

    // Resolve component from registry
    const Component = getComponent(componentName);

    if (!Component) {
      return {
        Component: null,
        classification,
        error: `Component "${componentName}" not found in registry`,
      };
    }

    return {
      Component,
      classification,
      error: undefined,
    };
  }, [componentName]);

  return resolution;
}
