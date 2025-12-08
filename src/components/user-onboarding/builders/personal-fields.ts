import { createFieldBuilderFactory } from "./base-field-builder";
import { GRID_SPANS } from "../constants/ui-themes";
import { FieldType } from "../constants/field-types";
import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";

/**
 * Create personal information field builders
 */
export function createPersonalFieldBuilders(
  t: (key: string) => string,
): Record<string, (config?: any) => RawFieldConfig> {
  const factory = createFieldBuilderFactory(t);

  return {
    [FieldType.FULL_NAME]: (config: any = {}) => {
      return factory.input(FieldType.FULL_NAME, {
        type: "text",
        autoComplete: "name",
        className: GRID_SPANS.HALF_WIDTH,
        ...config,
      });
    },

    [FieldType.EMAIL]: (config: any = {}) => {
      return factory.input(FieldType.EMAIL, {
        type: "email",
        autoComplete: "email",
        className: GRID_SPANS.HALF_WIDTH,
        ...config,
      });
    },

    [FieldType.PHONE_NUMBER]: (config: any = {}) => {
      return factory.input(FieldType.PHONE_NUMBER, {
        type: "tel",
        autoComplete: "tel",
        pattern: "[+]?[0-9]{10,15}",
        className: GRID_SPANS.SINGLE,
        ...config,
      });
    },

    [FieldType.GENDER]: (config: any = {}) => {
      return factory.select(FieldType.GENDER, {
        options: [
          { value: "male", label: t("fields.gender.options.male") },
          { value: "female", label: t("fields.gender.options.female") },
          { value: "other", label: t("fields.gender.options.other") },
          {
            value: "prefer_not_to_say",
            label: t("fields.gender.options.preferNotToSay"),
          },
        ],
        clearable: true,
        className: GRID_SPANS.SINGLE,
        ...config,
      });
    },
  };
}
