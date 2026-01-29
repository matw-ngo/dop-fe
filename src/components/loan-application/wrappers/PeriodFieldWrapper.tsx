import type React from "react";
import {
  type FieldComponentProps,
  FieldType,
  type NumberFieldConfig,
  type SliderFieldConfig,
} from "@/components/form-generation";
import { PeriodField } from "../ApplyLoanForm/components/PeriodField";

type PeriodFieldValue = number;

/**
 * Wrapper component to adapt PeriodField for use in DynamicFormConfig
 * Converts FieldComponentProps to PeriodFieldProps
 */
export const PeriodFieldWrapper: React.FC<
  FieldComponentProps<PeriodFieldValue>
> = ({ field, value, onChange, error, disabled }) => {
  // Extract options or use defaults
  let min = 3;
  let max = 36;
  let step = 1;

  if (
    field.type === FieldType.NUMBER ||
    field.type === FieldType.CURRENCY ||
    field.type === FieldType.SLIDER
  ) {
    const opts = (field as NumberFieldConfig | SliderFieldConfig).options;
    if (opts) {
      min = opts.min ?? min;
      max = opts.max ?? max;
      step = opts.step ?? step;
    }
  }

  return (
    <PeriodField
      value={value ?? 0}
      onChange={onChange}
      label={field.label}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      error={error}
    />
  );
};
