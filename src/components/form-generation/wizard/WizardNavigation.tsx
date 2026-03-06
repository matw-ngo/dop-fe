"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFormWizardStore } from "../store/use-form-wizard-store";
import { useFormTheme } from "../themes/ThemeProvider";
import type { WizardNavigationConfig } from "../types";
import { cn } from "../utils/helpers";
import { useNavigationGuard } from "@/hooks/navigation/use-navigation-guard";
import { useCallback } from "react";

interface WizardNavigationProps {
  config?: WizardNavigationConfig;
  onComplete?: (data: Record<string, any>) => void | Promise<void>;
  className?: string;
}

export function WizardNavigation({
  config,
  onComplete,
  className,
}: WizardNavigationProps) {
  const t = useTranslations("pages.form.buttons");
  const tAll = useTranslations(); // For error translation
  const { theme } = useFormTheme();
  const {
    currentStep,
    steps,
    previousStep,
    nextStep,
    getAllData,
    isSubmitting,
    stepMeta,
  } = useFormWizardStore();

  // Initialize navigation guard
  const navigationGuard = useNavigationGuard();

  // Helper to translate validation errors (same logic as FieldFactory)
  const translateError = useCallback(
    (error?: string) => {
      if (!error) return undefined;

      // Check if error is a translation key (contains | or starts with pages.form.errors or features.)
      if (error.includes("|")) {
        const [key, paramsStr] = error.split("|");
        try {
          const params = JSON.parse(paramsStr);
          return tAll(key, params);
        } catch (_e) {
          return error;
        }
      }

      // Check if it's a translation key (starts with pages. or features.)
      if (error.startsWith("pages.") || error.startsWith("features.")) {
        return tAll(error);
      }

      return error;
    },
    [tAll],
  );

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isSingleStep = steps.length === 1;

  const backButton = config?.backButton || {};
  const nextButton = config?.nextButton || {};
  const submitButton = config?.submitButton || {};

  // Determine button text based on step position
  // Single step OR last step: use submit button config
  // Other steps: use next button config
  const buttonText = (() => {
    if (isSingleStep || isLastStep) {
      // Submit button
      return submitButton.label || t("submit"); // "Hoàn tất"
    }
    // Next button
    return nextButton.label || t("next"); // "Tiếp tục"
  })();

  const handleNext = async () => {
    const success = await nextStep();
    if (!success) {
      // Validation failed, scroll to first error field
      scrollToFirstError();
      return;
    }
  };

  const handleSubmit = async () => {
    // Validate current step first
    const success = await nextStep();
    if (!success) {
      // Validation failed, scroll to first error field
      scrollToFirstError();

      // Show toast for fields with showToastOnError flag
      const currentStepId = steps[currentStep]?.id;
      const currentStepConfig = steps[currentStep];

      if (
        currentStepId &&
        stepMeta[currentStepId]?.errors &&
        currentStepConfig
      ) {
        const errors = stepMeta[currentStepId].errors;

        // Collect fields with errors and showToastOnError flag
        const fieldsWithToastErrors = currentStepConfig.fields
          .filter((field) => field.showToastOnError && errors[field.name])
          .map((field) => ({
            field,
            error: errors[field.name],
            priority: field.errorPriority ?? 0, // Default priority is 0
          }))
          // Sort by priority (lower number = higher priority = shown first)
          .sort((a, b) => a.priority - b.priority);

        // Check if there are any errors from fields WITHOUT showToastOnError
        // (i.e., regular inline errors that user can see)
        const hasOtherErrors = currentStepConfig.fields.some(
          (field) => !field.showToastOnError && errors[field.name],
        );

        // Only show toast if:
        // 1. There are fields with toast errors
        // 2. Either no other errors exist, OR the toast field has priority 0 (high priority)
        if (fieldsWithToastErrors.length > 0) {
          const highestPriorityError = fieldsWithToastErrors[0];

          // If this field has high priority (0), always show
          // If this field has low priority (>0), only show if no other errors
          const shouldShowToast =
            highestPriorityError.priority === 0 || !hasOtherErrors;

          if (shouldShowToast) {
            const translatedError = translateError(highestPriorityError.error);
            toast.error(translatedError);
          }
        }
      }

      return;
    }

    // Submit form
    const allData = getAllData();
    await onComplete?.(allData);
  };

  /**
   * Scroll to the first field with an error
   * Provides better UX by automatically showing the user where to fix issues
   */
  const scrollToFirstError = () => {
    // Wait for DOM to update with error states
    setTimeout(() => {
      // Find first field with error (has aria-invalid="true")
      const firstErrorField = document.querySelector('[aria-invalid="true"]');

      if (firstErrorField) {
        // Scroll to field with smooth behavior
        firstErrorField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Focus the field for keyboard users
        if (firstErrorField instanceof HTMLElement) {
          firstErrorField.focus();
        }
      }
    }, 100);
  };

  // Determine visibility
  const showBack =
    backButton.show !== false &&
    (!isFirstStep || config?.showBackButtonOnFirstStep);

  const showNext = nextButton.show !== false;
  const showSubmit = submitButton.show !== false;

  // Layout configuration
  const position = config?.position || "between";
  const fullWidthButtons = config?.fullWidthButtons;

  // Generic helper for focus ring styles based on theme
  const getFocusClasses = () => {
    if (theme.focusRing) {
      return `focus-visible:ring-[${theme.focusRing.color}]/${theme.focusRing.opacity}`;
    }
    return `focus-visible:ring-[${theme.colors.primary}]/20`;
  };

  // Helper to generate theme-aware classes
  const getThemeButtonClass = (variant: string = "default") => {
    // Only apply if we have a primary color from theme
    if (!theme.colors.primary) return "";

    const primary = theme.colors.primary;
    const focusClasses = getFocusClasses();

    if (variant === "default") {
      return `bg-[${primary}] hover:bg-[${primary}]/90 text-white ${focusClasses}`;
    }

    if (variant === "outline") {
      return `border-[${primary}] text-[${primary}] hover:bg-[${primary}]/10 bg-transparent ${focusClasses}`;
    }

    if (variant === "ghost") {
      return `text-[${primary}] hover:bg-[${primary}]/10 ${focusClasses}`;
    }

    return focusClasses;
  };

  // Determine justify class based on position
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  const justifyClass = justifyClasses[position] || justifyClasses.between;

  // Button styling logic
  const getButtonClass = (
    variant: string = "default",
    customClass?: string,
    isFullWidth?: boolean,
  ) => {
    return cn(
      getThemeButtonClass(variant),
      "cursor-pointer", // Ensure pointer cursor
      (fullWidthButtons || isFullWidth) && "w-full flex-1",
      customClass,
    );
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4",
        fullWidthButtons ? "w-full" : justifyClass,
        config?.stickyNavigation &&
          "sticky bottom-0 bg-background py-4 border-t z-10",
        config?.containerClassName,
        className,
      )}
    >
      {/* Back Button */}
      {showBack && (
        <div className={cn(fullWidthButtons && "flex-1")}>
          <Button
            type="button"
            variant={backButton.variant || "outline"}
            onClick={previousStep}
            disabled={
              !navigationGuard.canGoBack ||
              (isFirstStep && !config?.showBackButtonOnFirstStep)
            }
            className={getButtonClass(
              backButton.variant || "outline",
              backButton.className,
              backButton.fullWidth,
            )}
          >
            {backButton.icon || <ChevronLeft className="h-4 w-4 mr-2" />}
            {backButton.label || t("previous")}
          </Button>
        </div>
      )}

      {/* Next/Submit Button Wrapper */}
      <div
        className={cn(
          fullWidthButtons && "flex-1",
          !fullWidthButtons && position === "between" && !showBack && "ml-auto",
        )}
      >
        {isLastStep
          ? showSubmit && (
              <Button
                type="button"
                variant={submitButton.variant || "default"}
                onClick={handleSubmit}
                disabled={
                  isSubmitting || submitButton.className?.includes("disabled")
                }
                className={cn(
                  "h-14 px-6 text-white font-semibold rounded-lg",
                  getButtonClass(
                    submitButton.variant || "default",
                    submitButton.className,
                    submitButton.fullWidth,
                  ),
                )}
                style={{
                  backgroundColor: theme.colors.primary,
                }}
              >
                {isSubmitting
                  ? submitButton.loadingLabel || t("submitting")
                  : buttonText}
                {!isSubmitting &&
                  !isSingleStep &&
                  (submitButton.icon || <Check className="h-4 w-4 ml-2" />)}
              </Button>
            )
          : showNext && (
              <Button
                type="button"
                variant={nextButton.variant || "default"}
                onClick={handleNext}
                className={cn(
                  "h-14 px-6 text-white font-semibold rounded-lg",
                  getButtonClass(
                    nextButton.variant || "default",
                    nextButton.className,
                    nextButton.fullWidth,
                  ),
                )}
                style={{
                  backgroundColor: theme.colors.primary,
                }}
              >
                {buttonText}
                {nextButton.icon || <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            )}
      </div>
    </div>
  );
}

WizardNavigation.displayName = "WizardNavigation";
