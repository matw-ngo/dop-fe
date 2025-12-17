"use client";

import { useEffect } from "react";
import type { DynamicFormConfig } from "../types";
import { useFormWizardStore } from "../store/use-form-wizard-store";
import { WizardProgress } from "./WizardProgress";
import { StepContent } from "./StepContent";
import { WizardNavigation } from "./WizardNavigation";

export interface StepWizardProps {
  /** Wizard configuration */
  config: DynamicFormConfig;

  /** Initial form data */
  initialData?: Record<string, any>;

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
  onComplete,
  onStepChange,
  className,
}: StepWizardProps) {
  const { currentStep, steps, initWizard, formData, resetWizard } =
    useFormWizardStore();

  // Initialize wizard on mount
  useEffect(() => {
    if (config.steps && config.steps.length > 0) {
      // Only initialize if wizardId changes or it's a fresh start
      initWizard(config.id || "wizard", config.steps, initialData);
    }

    return () => {
      // Cleanup on unmount
      resetWizard();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id, config.steps, initWizard, resetWizard]); // Exclude initialData to avoid loop

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

      {/* Current Step Content */}
      <StepContent step={currentStepConfig} />

      {/* Navigation Buttons */}
      <WizardNavigation config={config.navigation} onComplete={onComplete} />
    </div>
  );
}

StepWizard.displayName = "StepWizard";
