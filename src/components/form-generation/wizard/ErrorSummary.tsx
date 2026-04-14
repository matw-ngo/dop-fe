"use client";

import { AlertCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useFormWizardStore } from "../store/use-form-wizard-store";
import { cn } from "../utils/helpers";

interface ErrorSummaryProps {
  position?: "top" | "bottom" | "sticky-top" | "sticky-bottom";
  clickable?: boolean;
  maxErrors?: number;
  showFieldLabels?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorSummary({
  position = "top",
  clickable = true,
  maxErrors = 5,
  showFieldLabels = true,
  onDismiss,
  className,
}: ErrorSummaryProps) {
  const t = useTranslations("pages.form.errors");
  const { currentStep, steps, stepMeta } = useFormWizardStore();

  const currentStepConfig = steps[currentStep];
  if (!currentStepConfig) return null;

  const meta = stepMeta[currentStepConfig.id];
  if (!meta || !meta.errors || Object.keys(meta.errors).length === 0) {
    return null;
  }

  // Collect all field errors (exclude _step error)
  const errors = Object.entries(meta.errors)
    .filter(([key]) => key !== "_step")
    .map(([fieldName, error]) => {
      // Find field config to get label
      const field = currentStepConfig.fields.find((f) => f.name === fieldName);

      return {
        fieldId: field?.id || fieldName,
        fieldName: fieldName,
        fieldLabel: field?.label || fieldName,
        error: error as string,
      };
    });

  if (errors.length === 0) return null;

  const displayErrors = errors.slice(0, maxErrors);
  const remainingCount = errors.length - maxErrors;

  const handleErrorClick = (fieldId: string) => {
    if (!clickable) return;

    // Find field element and scroll to it
    const fieldElement = document.getElementById(fieldId);
    if (fieldElement) {
      fieldElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Focus the field
      const input = fieldElement.querySelector("input, textarea, select");
      if (input instanceof HTMLElement) {
        input.focus();
      }
    }
  };

  const positionClasses = {
    top: "mb-6",
    bottom: "mt-6",
    "sticky-top": "sticky top-0 z-20 mb-6",
    "sticky-bottom": "sticky bottom-0 z-20 mt-6",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 p-4",
        positionClasses[position],
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            {t("validationFailed", { count: errors.length })}
          </h3>

          <ul className="space-y-1.5">
            {displayErrors.map((error, index) => (
              <li key={`${error.fieldId}-${index}`}>
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => handleErrorClick(error.fieldId)}
                    className="text-sm text-red-700 hover:text-red-900 hover:underline text-left transition-colors"
                  >
                    {showFieldLabels && (
                      <span className="font-medium">{error.fieldLabel}: </span>
                    )}
                    {error.error}
                  </button>
                ) : (
                  <span className="text-sm text-red-700">
                    {showFieldLabels && (
                      <span className="font-medium">{error.fieldLabel}: </span>
                    )}
                    {error.error}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {remainingCount > 0 && (
            <p className="text-sm text-red-600 mt-2">
              {t("andMoreErrors", { count: remainingCount })}
            </p>
          )}
        </div>

        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-6 w-6 text-red-600 hover:text-red-800 hover:bg-red-100 flex-shrink-0"
            aria-label="Dismiss errors"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

ErrorSummary.displayName = "ErrorSummary";
