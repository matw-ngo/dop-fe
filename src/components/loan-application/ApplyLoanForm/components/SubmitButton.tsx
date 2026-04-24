import { useTranslations } from "next-intl";
import type React from "react";
import { useFormTheme } from "@/components/form-generation/themes";
import { Button } from "@/components/ui";
import type { SubmitButtonProps } from "../types";

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  disabled = false,
  label,
  loadingLabel,
  onClick,
}) => {
  const t = useTranslations("features.loan-application");
  const { theme } = useFormTheme();

  return (
    <Button
      className="min-h-[44px] w-full rounded-lg whitespace-nowrap text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
      style={{ backgroundColor: theme.colors.primary }}
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
