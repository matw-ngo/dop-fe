import type React from "react";
import type { FieldComponentProps } from "@/components/form-generation";
import type { ISelectBoxOption } from "@/components/ui/select-group";
import { PurposeField } from "../ApplyLoanForm/components/PurposeField";

type PurposeFieldValue = string;

/**
 * Wrapper component to adapt PurposeField for use in DynamicFormConfig
 * Converts FieldComponentProps to PurposeFieldProps
 */
export const PurposeFieldWrapper: React.FC<
  FieldComponentProps<PurposeFieldValue>
> = ({ field, value, onChange, error, disabled }) => {
  const fieldOptions = (field.options ?? {}) as {
    options?: ISelectBoxOption[];
    placeholder?: string;
  };

  // Get options from field config or use empty array
  const options = fieldOptions.options ?? [];
  const placeholder = fieldOptions.placeholder ?? "Chọn mục đích";

  return (
    <PurposeField
      value={value ?? ""}
      onChange={onChange}
      options={options}
      label={field.label}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
    />
  );
};
