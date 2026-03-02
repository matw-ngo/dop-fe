"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStepMeta } from "../store/use-form-wizard-store";
import { useFormTheme } from "../themes/ThemeProvider";
import { cn } from "../utils/helpers";

interface StepErrorsProps {
  stepId: string;
  className?: string;
}

export function StepErrors({ stepId, className }: StepErrorsProps) {
  const stepMeta = useStepMeta(stepId);
  const t = useTranslations("pages.form.errors");
  const { theme } = useFormTheme();

  if (
    !stepMeta ||
    !stepMeta.errors ||
    Object.keys(stepMeta.errors).length === 0
  ) {
    return null;
  }

  const stepLevelError = stepMeta.errors._step;
  const fieldErrors = Object.entries(stepMeta.errors).filter(
    ([key]) => key !== "_step",
  );

  const alertStyle = {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.background,
    color: theme.colors.error,
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Step-level error */}
      {stepLevelError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
          style={alertStyle}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">{stepLevelError}</p>
        </div>
      )}

      {/* Field errors summary (optional) */}
      {fieldErrors.length > 0 && !stepLevelError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
          style={alertStyle}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">
            {t("summary_error", { count: fieldErrors.length })}
          </p>
        </div>
      )}
    </div>
  );
}

StepErrors.displayName = "StepErrors";
