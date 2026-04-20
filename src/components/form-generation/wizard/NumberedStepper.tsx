"use client";

import { Check } from "lucide-react";
import { cn } from "@/components/form-generation/utils/helpers";
import type { FormStep } from "../types";

interface NumberedStepperProps {
  steps: FormStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  canGoToStep?: (stepIndex: number) => boolean;
  showTitles?: boolean;
  className?: string;
}

export function NumberedStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  canGoToStep,
  showTitles = true,
  className,
}: NumberedStepperProps) {
  const getStepStatus = (index: number) => {
    if (completedSteps.includes(index)) return "complete";
    if (index === currentStep) return "current";
    if (canGoToStep && !canGoToStep(index)) return "locked";
    return "pending";
  };

  return (
    <div className={cn("flex items-start justify-center", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isClickable = onStepClick && status !== "locked";
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-start flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  status === "complete" &&
                    "bg-primary border-primary text-primary-foreground",
                  status === "current" &&
                    "border-primary text-primary bg-background",
                  status === "pending" &&
                    "border-muted text-muted-foreground bg-background",
                  status === "locked" &&
                    "border-muted/50 text-muted-foreground/50 cursor-not-allowed",
                  isClickable && "hover:border-primary/70",
                )}
                aria-label={`Step ${index + 1}: ${step.title}`}
                aria-current={status === "current" ? "step" : undefined}
              >
                {status === "complete" ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step Title */}
              {showTitles && (
                <div className="mt-2 text-center max-w-[120px] hidden sm:block">
                  <p
                    className={cn(
                      "text-xs font-medium leading-tight",
                      status === "current" && "text-foreground",
                      status === "complete" && "text-muted-foreground",
                      (status === "pending" || status === "locked") &&
                        "text-muted-foreground/70",
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && status === "current" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 flex-1 self-center mt-5 transition-colors",
                  status === "complete" ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

NumberedStepper.displayName = "NumberedStepper";
