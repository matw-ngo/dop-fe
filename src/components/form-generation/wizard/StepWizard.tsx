"use client";

import { useEffect } from "react";
import { useFormWizardStore } from "../store/use-form-wizard-store";
import type { DynamicFormConfig } from "../types";
import { ErrorSummary } from "./ErrorSummary";
import { StepContent } from "./StepContent";
import { WizardNavigation } from "./WizardNavigation";
import { WizardProgress } from "./WizardProgress";

export interface StepWizardProps {
  /** Wizard configuration */
  config: DynamicFormConfig;

  /** Initial form data */
  initialData?: Record<string, any>;

  /** Total steps in flow (for cross-page navigation) */
  totalSteps?: number;

  /** Current step index in flow (for cross-page navigation) */
  currentStepIndex?: number;

  /** Completion handler */
  onComplete?: (data: Record<string, any>) => void | Promise<void>;

  /** Step change callback */
  onStepChange?: (step: number, data: Record<string, any>) => void;

  /** CSS class */
  className?: string;
}

export function StepWizard({
  config,
  initialData = {},
  totalSteps,
  currentStepIndex,
  onComplete,
  onStepChange,
  className,
}: StepWizardProps) {
  const { currentStep, steps, initWizard, formData, resetWizard } =
    useFormWizardStore();

  // Initialize wizard on mount
  useEffect(() => {
    if (config.steps && config.steps.length > 0) {
      // Pass totalSteps and currentStepIndex to initWizard for proper cross-page navigation
      initWizard(
        config.id || "wizard",
        config.steps,
        initialData,
        totalSteps,
        currentStepIndex,
      );
    }

    // Note: We don't reset wizard on unmount to preserve form data across step navigation
    // The wizard state should persist until explicitly reset (e.g., on flow completion)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.id,
    JSON.stringify(config.steps),
    initWizard,
    totalSteps,
    currentStepIndex,
  ]); // Exclude initialData to avoid loop

  // Call step change callback
  useEffect(() => {
    if (steps.length > 0) {
      onStepChange?.(currentStep, formData);
      config.onStepChange?.(currentStep, formData);
    }
  }, [currentStep, formData, onStepChange, config, steps.length]);

  // Auto-save functionality
  useEffect(() => {
    if (config.autoSave?.enabled) {
      const interval = setInterval(() => {
        const key = config.autoSave?.storageKey || "wizard-draft";
        localStorage.setItem(key, JSON.stringify(formData));
      }, config.autoSave.interval || 30000);

      return () => clearInterval(interval);
    }
  }, [config.autoSave, formData]);

  if (!steps || steps.length === 0) {
    return null;
  }

  const currentStepConfig = steps[currentStep];

  // Error display configuration
  const errorDisplay = config.errorDisplay || { mode: "inline" }; // Default to inline only
  const showErrorSummary =
    errorDisplay.mode !== "inline" && errorDisplay.summary?.enabled !== false;
  // const progress = getProgress(); // This line is no longer needed

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Progress Indicator */}
      {config.navigation?.showProgress !== false && (
        <WizardProgress
          type={config.navigation?.progressType || "bar"}
          showTitles={config.navigation?.showStepTitles}
          showPercentage={true}
          showStepNumbers={config.navigation?.showStepNumbers !== false}
        />
      )}

      {/* Error Summary (Top) */}
      {showErrorSummary && errorDisplay.summary?.position !== "bottom" && (
        <ErrorSummary
          position={errorDisplay.summary?.position || "sticky-top"}
          clickable={errorDisplay.summary?.clickable !== false}
          maxErrors={errorDisplay.summary?.maxErrors || 5}
          showFieldLabels={errorDisplay.summary?.showFieldLabels !== false}
        />
      )}

      {/* Current Step Content */}
      <StepContent
        step={currentStepConfig}
        showTitle={config.navigation?.showStepHeader}
        namespace={config.i18n?.namespace}
      />

      {/* Error Summary (Bottom) */}
      {showErrorSummary && errorDisplay.summary?.position === "bottom" && (
        <ErrorSummary
          position="bottom"
          clickable={errorDisplay.summary?.clickable !== false}
          maxErrors={errorDisplay.summary?.maxErrors || 5}
          showFieldLabels={errorDisplay.summary?.showFieldLabels !== false}
        />
      )}

      {/* Navigation Buttons */}
      <WizardNavigation config={config.navigation} onComplete={onComplete} />
    </div>
  );
}

StepWizard.displayName = "StepWizard";
