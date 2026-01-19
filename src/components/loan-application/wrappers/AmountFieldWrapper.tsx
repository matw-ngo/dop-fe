import type React from "react";
import type { FieldComponentProps } from "@/components/form-generation";
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
  const min = (field.options?.min as number) ?? 5;
  const max = (field.options?.max as number) ?? 90;
  const step = (field.options?.step as number) ?? 5;

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
