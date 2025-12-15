import type React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { CSS_CLASSES } from "../constants";
import type { SubmitButtonProps } from "../types";

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  disabled = false,
  label,
  loadingLabel,
  onClick,
}) => {
  const t = useTranslations("features.loan-application");

  return (
    <Button
      className={CSS_CLASSES.SUBMIT_BUTTON}
      disabled={disabled || isSubmitting}
      type="button"
      onClick={onClick}
    >
      {isSubmitting
        ? loadingLabel || t("submit.processing")
        : label || t("submit.button")}
    </Button>
  );
};
