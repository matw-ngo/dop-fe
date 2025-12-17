"use client";

import { useFormWizardStore } from "../store/use-form-wizard-store";
import type { ProgressIndicatorType } from "../types";
import { DotsIndicator } from "./DotsIndicator";
import { NumberedStepper } from "./NumberedStepper";
import { ProgressBar } from "./ProgressBar";
import { SidebarNav } from "./SidebarNav";

interface WizardProgressProps {
  type?: ProgressIndicatorType;
  showTitles?: boolean;
  showPercentage?: boolean;
  showStepNumbers?: boolean;
  className?: string;
}

export function WizardProgress({
  type = "bar",
  showTitles = true,
  showPercentage = true,
  showStepNumbers = true,
  className,
}: WizardProgressProps) {
  const {
    steps,
    currentStep,
    completedSteps,
    goToStep,
    canGoToStep,
    getProgress,
  } = useFormWizardStore();

  const progress = getProgress();

  const handleStepClick = (stepIndex: number) => {
    if (canGoToStep(stepIndex)) {
      goToStep(stepIndex);
    }
  };

  switch (type) {
    case "dots":
      return (
        <DotsIndicator
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          canGoToStep={canGoToStep}
          className={className}
        />
      );

    case "numbers":
    case "stepper":
      return (
        <NumberedStepper
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          canGoToStep={canGoToStep}
          showTitles={showTitles}
          className={className}
        />
      );

    case "sidebar":
      return (
        <SidebarNav
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          canGoToStep={canGoToStep}
          className={className}
        />
      );

    case "bar":
    default:
      return (
        <ProgressBar
          current={progress.current}
          total={progress.total}
          showPercentage={showPercentage}
          showStepNumbers={showStepNumbers}
          className={className}
        />
      );
  }
}

WizardProgress.displayName = "WizardProgress";
