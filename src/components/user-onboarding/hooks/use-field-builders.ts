import { useMemo } from "react";
import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";
import { createFieldBuilderRegistry } from "../builders/field-registry";

/**
 * Hook to initialize and manage field builders
 *
 * @param t - Translation function
 * @returns Field builder map with all field builders
 */
export function useFieldBuilders(
  t: (key: string) => string,
): Record<string, (config?: any) => RawFieldConfig> {
  const fieldBuilders = useMemo(() => {
    return createFieldBuilderRegistry(t);
  }, [t]);

  return fieldBuilders;
}

/**
 * Hook to get a specific field builder
 *
 * @param t - Translation function
 * @param fieldType - Type of field to get builder for
 * @returns Field builder function for the specified type
 */
export function useFieldBuilder(
  t: (key: string) => string,
  fieldType: string,
): ((config?: any) => RawFieldConfig) | undefined {
  const fieldBuilders = useFieldBuilders(t);

  return useMemo(() => {
    return fieldBuilders[fieldType];
  }, [fieldBuilders, fieldType]);
}
