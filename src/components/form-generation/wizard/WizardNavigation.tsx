"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormWizardStore } from "../store/use-form-wizard-store";
import type { WizardNavigationConfig } from "../types";

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

  return (
    <div
      className={`flex items-center justify-between gap-4 ${config?.stickyNavigation ? "sticky bottom-0 bg-background py-4 border-t" : ""} ${className}`}
    >
      {/* Back Button */}
      <div>
        {!isFirstStep && backButton.show !== false && (
          <Button
            type="button"
            variant={backButton.variant || "outline"}
            onClick={previousStep}
            className={backButton.className}
          >
            {backButton.icon || <ChevronLeft className="h-4 w-4 mr-2" />}
            {backButton.label || "Back"}
          </Button>
        )}
      </div>

      {/* Next/Submit Button */}
      <div className="ml-auto">
        {isLastStep
          ? // Submit Button
            submitButton.show !== false && (
              <Button
                type="button"
                variant={submitButton.variant || "default"}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={submitButton.className}
              >
                {isSubmitting
                  ? submitButton.loadingLabel || "Submitting..."
                  : submitButton.label || "Submit"}
                {!isSubmitting &&
                  (submitButton.icon || <Check className="h-4 w-4 ml-2" />)}
              </Button>
            )
          : // Next Button
            nextButton.show !== false && (
              <Button
                type="button"
                variant={nextButton.variant || "default"}
                onClick={handleNext}
                className={nextButton.className}
              >
                {nextButton.label || "Next"}
                {nextButton.icon || <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            )}
      </div>
    </div>
  );
}

WizardNavigation.displayName = "WizardNavigation";
