import type React from "react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui";
import { CSS_CLASSES, LOAN_AMOUNT } from "../constants";
import type { AmountFieldProps } from "../types";

export const AmountField: React.FC<AmountFieldProps> = ({
  value,
  onChange,
  label,
  min = LOAN_AMOUNT.MIN,
  max = LOAN_AMOUNT.MAX,
  step = LOAN_AMOUNT.STEP,
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
            {t("expectedAmount.placeholder")}
          </span>
        ) : (
          <>
            {value}.000.000
            <span className={CSS_CLASSES.FIELD_SUBTEXT}>
              {t("expectedAmount.currency")}
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
