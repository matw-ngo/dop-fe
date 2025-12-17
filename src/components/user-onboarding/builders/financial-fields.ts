import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";
import { FieldType } from "../constants/field-types";
import { GRID_SPANS } from "../constants/ui-themes";
import { createFieldBuilderFactory } from "./base-field-builder";

/**
 * Create financial information field builders
 */
export function createFinancialFieldBuilders(
  t: (key: string) => string,
): Record<string, (config?: any) => RawFieldConfig> {
  const factory = createFieldBuilderFactory(t);

  return {
    [FieldType.INCOME]: (config: any = {}) => {
      const field = factory.input(FieldType.INCOME, {
        type: "number",
        placeholder: t("fields.income.placeholder"),
        min: 0,
        step: 1000,
        ...config,
      });

      return factory.withGridSpan(field, "HALF_WIDTH");
    },

    [FieldType.INCOME_TYPE]: (config: any = {}) => {
      return factory.select(FieldType.INCOME_TYPE, {
        options: [
          { value: "salary", label: t("fields.incomeType.options.salary") },
          { value: "business", label: t("fields.incomeType.options.business") },
          {
            value: "freelance",
            label: t("fields.incomeType.options.freelance"),
          },
          {
            value: "investment",
            label: t("fields.incomeType.options.investment"),
          },
          { value: "rental", label: t("fields.incomeType.options.rental") },
          { value: "pension", label: t("fields.incomeType.options.pension") },
          { value: "other", label: t("fields.incomeType.options.other") },
        ],
        clearable: true,
        className: GRID_SPANS.HALF_WIDTH,
        ...config,
      });
    },

    [FieldType.CAREER_STATUS]: (config: any = {}) => {
      return factory.select(FieldType.CAREER_STATUS, {
        options: [
          {
            value: "employed",
            label: t("fields.careerStatus.options.employed"),
          },
          {
            value: "self_employed",
            label: t("fields.careerStatus.options.selfEmployed"),
          },
          {
            value: "unemployed",
            label: t("fields.careerStatus.options.unemployed"),
          },
          { value: "student", label: t("fields.careerStatus.options.student") },
          { value: "retired", label: t("fields.careerStatus.options.retired") },
          {
            value: "homemaker",
            label: t("fields.careerStatus.options.homemaker"),
          },
        ],
        clearable: true,
        className: GRID_SPANS.SINGLE,
        ...config,
      });
    },

    [FieldType.CAREER_TYPE]: (config: any = {}) => {
      return factory.select(FieldType.CAREER_TYPE, {
        options: [
          {
            value: "full_time",
            label: t("fields.careerType.options.fullTime"),
          },
          {
            value: "part_time",
            label: t("fields.careerType.options.partTime"),
          },
          { value: "contract", label: t("fields.careerType.options.contract") },
          {
            value: "temporary",
            label: t("fields.careerType.options.temporary"),
          },
          {
            value: "internship",
            label: t("fields.careerType.options.internship"),
          },
        ],
        clearable: true,
        className: GRID_SPANS.SINGLE,
        ...config,
      });
    },
  };
}
