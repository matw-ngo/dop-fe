import type React from "react";
import type { FieldComponentProps } from "@/components/form-generation";
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
  const min = (field.options?.min as number) ?? 3;
  const max = (field.options?.max as number) ?? 36;
  const step = (field.options?.step as number) ?? 1;

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
