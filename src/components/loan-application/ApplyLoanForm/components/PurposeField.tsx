import type React from "react";
import { SelectGroup } from "@/components/ui";
import type { PurposeFieldProps } from "../types";

export const PurposeField: React.FC<PurposeFieldProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
  error,
}) => {
  return (
    <div className="relative mb-0">
      <SelectGroup
        label={label}
        options={options}
        value={value}
        onChange={(newValue) => onChange(String(newValue))}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
      />
    </div>
  );
};
