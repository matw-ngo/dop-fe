import { createFieldBuilderFactory } from "./base-field-builder";
import { GRID_SPANS, LAYOUT_CONFIG } from "../constants/ui-themes";
import { FieldType } from "../constants/field-types";
import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";

/**
 * Create loan information field builders
 */
export function createLoanFieldBuilders(
  t: (key: string) => string,
): Record<string, (config?: any) => RawFieldConfig> {
  const factory = createFieldBuilderFactory(t);

  return {
    [FieldType.HAVING_LOAN]: (config: any = {}) => {
      return factory.select(FieldType.HAVING_LOAN, {
        options: [
          { value: "yes", label: t("fields.havingLoan.options.yes") },
          { value: "no", label: t("fields.havingLoan.options.no") },
        ],
        clearable: true,
        className: GRID_SPANS.SINGLE,
        ...config,
      });
    },

    [FieldType.CREDIT_STATUS]: (config: any = {}) => {
      return factory.select(FieldType.CREDIT_STATUS, {
        options: [
          {
            value: "excellent",
            label: t("fields.creditStatus.options.excellent"),
          },
          { value: "good", label: t("fields.creditStatus.options.good") },
          { value: "fair", label: t("fields.creditStatus.options.fair") },
          { value: "poor", label: t("fields.creditStatus.options.poor") },
          {
            value: "no_credit",
            label: t("fields.creditStatus.options.noCredit"),
          },
        ],
        clearable: true,
        className: GRID_SPANS.SINGLE,
        ...config,
      });
    },

    [FieldType.PURPOSE]: (config: any = {}) => {
      return factory.input(FieldType.PURPOSE, {
        type: "text",
        layout: LAYOUT_CONFIG.SPACIOUS,
        className: GRID_SPANS.FULL_WIDTH,
        ...config,
      });
    },
  };
}
