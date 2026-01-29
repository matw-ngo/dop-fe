import type React from "react";
import {
  type FieldComponentProps,
  FieldType,
  type NumberFieldConfig,
  type SliderFieldConfig,
} from "@/components/form-generation";
import { AmountField } from "../ApplyLoanForm/components/AmountField";

type AmountFieldValue = number;

/**
 * Wrapper component to adapt AmountField for use in DynamicFormConfig
 * Converts FieldComponentProps to AmountFieldProps
 */
export const AmountFieldWrapper: React.FC<
  FieldComponentProps<AmountFieldValue>
> = ({ field, value, onChange, error, disabled }) => {
  // Extract options or use defaults
  let min = 5;
  let max = 90;
  let step = 5;

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
    <AmountField
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
