"use client";

import { cn } from "@/components/form-generation/utils/helpers";
import type { FormStep } from "../types";

interface DotsIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  canGoToStep?: (stepIndex: number) => boolean;
  className?: string;
}

export function DotsIndicator({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  canGoToStep,
  className,
}: DotsIndicatorProps) {
  const getStepStatus = (index: number) => {
    if (completedSteps.includes(index)) return "complete";
    if (index === currentStep) return "current";
    if (canGoToStep && !canGoToStep(index)) return "locked";
    return "pending";
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isClickable = onStepClick && status !== "locked";

        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepClick?.(index)}
            disabled={!isClickable}
            className={cn(
              "h-3 w-3 rounded-full transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              status === "complete" && "bg-primary scale-100",
              status === "current" &&
                "bg-primary scale-125 ring-2 ring-primary/30",
              status === "pending" && "bg-muted hover:bg-muted/80",
              status === "locked" && "bg-muted/50 cursor-not-allowed",
              isClickable && status !== "current" && "hover:scale-110",
            )}
            aria-label={`Step ${index + 1}: ${step.title}`}
            aria-current={status === "current" ? "step" : undefined}
          />
        );
      })}
    </div>
  );
}

DotsIndicator.displayName = "DotsIndicator";
