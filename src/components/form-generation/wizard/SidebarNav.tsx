"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/components/form-generation/utils/helpers";
import type { FormStep } from "../types";

interface SidebarNavProps {
  steps: FormStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepIndex: number) => void;
  canGoToStep?: (stepIndex: number) => boolean;
  className?: string;
}

export function SidebarNav({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  canGoToStep,
  className,
}: SidebarNavProps) {
  const getStepStatus = (index: number) => {
    if (completedSteps.includes(index)) return "complete";
    if (index === currentStep) return "current";
    if (canGoToStep && !canGoToStep(index)) return "locked";
    return "pending";
  };

  return (
    <nav className={cn("space-y-1", className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isClickable = onStepClick && status !== "locked";

        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepClick?.(index)}
            disabled={!isClickable}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg transition-all",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "flex items-center gap-3",
              status === "current" &&
                "bg-primary text-primary-foreground shadow-sm",
              status === "complete" &&
                "bg-muted/50 hover:bg-muted text-foreground",
              status === "pending" && "hover:bg-accent text-muted-foreground",
              status === "locked" &&
                "opacity-50 cursor-not-allowed text-muted-foreground",
            )}
            aria-current={status === "current" ? "step" : undefined}
            aria-label={`Step ${index + 1}: ${step.title}`}
          >
            {/* Step Number/Icon */}
            <div className="flex-shrink-0">
              {step.icon ? (
                <div className="h-6 w-6">{step.icon}</div>
              ) : status === "complete" ? (
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full bg-primary/20",
                  )}
                >
                  <Check className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    status === "current" &&
                      "bg-primary-foreground/20 text-primary-foreground",
                    status === "pending" && "bg-muted text-muted-foreground",
                    status === "locked" &&
                      "bg-muted/50 text-muted-foreground/50",
                  )}
                >
                  {index + 1}
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "font-medium text-sm",
                  status === "current" && "text-primary-foreground",
                  status === "complete" && "text-foreground",
                  (status === "pending" || status === "locked") &&
                    "text-muted-foreground",
                )}
              >
                {step.title}
              </div>
              {step.description && (
                <div
                  className={cn(
                    "text-xs mt-0.5 line-clamp-1",
                    status === "current" && "text-primary-foreground/80",
                    status === "complete" && "text-muted-foreground",
                    (status === "pending" || status === "locked") &&
                      "text-muted-foreground/70",
                  )}
                >
                  {step.description}
                </div>
              )}
            </div>

            {/* Chevron for current/clickable */}
            {(status === "current" ||
              (isClickable && status !== "complete")) && (
              <ChevronRight
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  status === "current" && "text-primary-foreground/70",
                )}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

SidebarNav.displayName = "SidebarNav";
