"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useFormWizardStore } from "../store/use-form-wizard-store";
import { useFormTheme } from "../themes/ThemeProvider";
import type { WizardNavigationConfig } from "../types";
import { cn } from "../utils/helpers";

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
  const { theme } = useFormTheme();
  const {
    currentStep,
    steps,
    previousStep,
    nextStep,
    getAllData,
    isSubmitting,
  } = useFormWizardStore();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const backButton = config?.backButton || {};
  const nextButton = config?.nextButton || {};
  const submitButton = config?.submitButton || {};

  const handleNext = async () => {
    const success = await nextStep();
    if (!success) {
      // Validation failed, stay on current step
      return;
    }
  };

  const handleSubmit = async () => {
    // Validate current step first
    const success = await nextStep();
    if (!success) {
      return;
    }

    // Submit form
    const allData = getAllData();
    await onComplete?.(allData);
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
            disabled={isFirstStep && !config?.showBackButtonOnFirstStep}
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
                className={getButtonClass(
                  submitButton.variant || "default",
                  submitButton.className,
                  submitButton.fullWidth,
                )}
              >
                {isSubmitting
                  ? submitButton.loadingLabel || t("submitting")
                  : submitButton.label || t("submit")}
                {!isSubmitting &&
                  (submitButton.icon || <Check className="h-4 w-4 ml-2" />)}
              </Button>
            )
          : showNext && (
              <Button
                type="button"
                variant={nextButton.variant || "default"}
                onClick={handleNext}
                className={getButtonClass(
                  nextButton.variant || "default",
                  nextButton.className,
                  nextButton.fullWidth,
                )}
              >
                {nextButton.label || t("next")}
                {nextButton.icon || <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            )}
      </div>
    </div>
  );
}

WizardNavigation.displayName = "WizardNavigation";
