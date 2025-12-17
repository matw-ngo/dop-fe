import { useTranslations } from "next-intl";
import type React from "react";
import { Slider } from "@/components/ui";
import { CSS_CLASSES, LOAN_PERIOD } from "../constants";
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

  return (
    <div className={CSS_CLASSES.FIELD_WRAPPER}>
      <label className={CSS_CLASSES.FIELD_LABEL}>
        {label}: {error && <span className="text-red-500">({error})</span>}
      </label>
      <div className={CSS_CLASSES.FIELD_VALUE}>
        {value === 0 ? (
          <span className={CSS_CLASSES.FIELD_PLACEHOLDER}>
            {t("loanPeriod.placeholder")}
          </span>
        ) : (
          <>
            {value}
            <span className={CSS_CLASSES.FIELD_SUBTEXT}>
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
          onValueChange={(vals) => {
            onChange(vals[0]);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
