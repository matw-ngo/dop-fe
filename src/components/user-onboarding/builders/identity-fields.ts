import { createFieldBuilderFactory } from "./base-field-builder";
import { GRID_SPANS, LAYOUT_CONFIG } from "../constants/ui-themes";
import { FieldType } from "../constants/field-types";
import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";

/**
 * Create identity verification field builders
 */
export function createIdentityFieldBuilders(
  t: (key: string) => string,
): Record<string, (config?: any) => RawFieldConfig> {
  const factory = createFieldBuilderFactory(t);

  return {
    [FieldType.NATIONAL_ID]: (config: any = {}) => {
      return factory.input(FieldType.NATIONAL_ID, {
        type: "text",
        autoComplete: "off",
        maxLength: 50,
        className: GRID_SPANS.HALF_WIDTH,
        ...config,
      });
    },

    [FieldType.SECOND_NATIONAL_ID]: (config: any = {}) => {
      return factory.input(FieldType.SECOND_NATIONAL_ID, {
        type: "text",
        autoComplete: "off",
        maxLength: 50,
        required: false, // This field is optional
        className: GRID_SPANS.HALF_WIDTH,
        ...config,
      });
    },

    [FieldType.DATE_OF_BIRTH]: (config: any = {}) => {
      return factory.datePicker(FieldType.DATE_OF_BIRTH, {
        maxDate: new Date(), // Can't select future dates
        dateFormat: "yyyy-MM-dd",
        className: GRID_SPANS.SINGLE,
        ...config,
      });
    },

    [FieldType.LOCATION]: (config: any = {}) => {
      return factory.input(FieldType.LOCATION, {
        type: "text",
        autoComplete: "address-level1",
        layout: LAYOUT_CONFIG.SPACIOUS,
        className: GRID_SPANS.FULL_WIDTH,
        ...config,
      });
    },
  };
}
