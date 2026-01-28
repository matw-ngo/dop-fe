import { useTranslations } from "next-intl";
import type React from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { Slider } from "@/components/ui";
import { LOAN_PERIOD } from "../constants";
import type { PeriodFieldProps } from "../types";

export const PeriodField: React.FC<PeriodFieldProps> = ({
  value,
  onChange,
  label,
  min = LOAN_PERIOD.MIN,
  max = LOAN_PERIOD.MAX,
  step = LOAN_PERIOD.STEP,
  disabled = false,
  error,
}) => {
  const t = useTranslations("features.loan-application");
  const { theme } = useFormTheme();

  const borderColor = theme.colors.border || "#bfd1cc";
  const labelColor = theme.colors.textSecondary || "#4d7e70";
  const valueColor = theme.colors.textPrimary || "#073126";
  const errorColor = theme.colors.error || "#ff7474";
  const placeholderColor = theme.colors.placeholder || "#A3A3A3";

  return (
    <div
      className="relative mb-[34px] rounded-lg border bg-white px-4 pt-2 pb-[9px]"
      style={{ borderColor: error ? errorColor : borderColor }}
    >
      <label
        className="text-xs font-normal leading-4"
        style={{ color: labelColor }}
      >
        {label}: {error && <span style={{ color: errorColor }}>({error})</span>}
      </label>
      <div
        className="mt-0.5 mb-0.5 text-xl font-semibold leading-[30px]"
        style={{ color: valueColor }}
      >
        {value === 0 ? (
          <span
            className="font-medium text-sm leading-[30px] mb-0.5"
            style={{ color: placeholderColor }}
          >
            {t("loanPeriod.placeholder")}
          </span>
        ) : (
          <>
            {value}
            <span
              className="text-sm leading-5 ml-1"
              style={{ color: labelColor }}
            >
              {t("loanPeriod.unit")}
            </span>
          </>
        )}
      </div>
      <div className="absolute bottom-[-9px] left-4 w-[calc(100%-32px)]">
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          thumbImg="/images/calendar.png"
          onValueChange={(vals) => {
            onChange(vals[0]);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
