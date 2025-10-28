"use client";

// MultiStepFormRenderer component for Data-Driven UI system
// Renders forms in multiple steps with progress tracking and navigation

import React from "react";
import { FormRenderer } from "./FormRenderer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MultiStepFormRendererProps } from "@/types/multi-step-form";
import { useMultiStepForm } from "@/hooks/form/use-multi-step-form";

export const MultiStepFormRenderer: React.FC<MultiStepFormRendererProps> = ({
  config,
  className,
  translationNamespace,
  renderNavigation,
  renderProgress,
}) => {
  const {
    state,
    actions,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    progress,
  } = useMultiStepForm(config);

  const { steps, showProgress = true, progressStyle = "steps" } = config;

  // Handle form submission for current step
  const handleStepSubmit = async (data: Record<string, any>) => {
    // Update the form data with current step's data
    actions.updateStepData(data);

    // Try to proceed to next step
    await actions.goToNextStep();
  };

  // Default progress indicator
  const defaultProgressRenderer = () => {
    if (!showProgress) return null;

    switch (progressStyle) {
      case "bar":
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Step {state.currentStep + 1} of {steps.length}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );

      case "dots":
        return (
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => actions.goToStep(index)}
                disabled={
                  !state.completedSteps.has(index) &&
                  index !== state.currentStep
                }
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === state.currentStep ? "w-8 bg-primary" : "w-2",
                  state.completedSteps.has(index)
                    ? "bg-primary/60"
                    : "bg-muted",
                  "disabled:cursor-not-allowed",
                )}
                aria-label={`Go to step ${index + 1}: ${steps[index].title}`}
              />
            ))}
          </div>
        );

      case "steps":
      default:
        return (
          <nav aria-label="Form progress" className="mb-8">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isCompleted = state.completedSteps.has(index);
                const isCurrent = index === state.currentStep;
                const isClickable = isCompleted || index === state.currentStep;

                return (
                  <li key={step.id} className="flex-1 relative">
                    {index > 0 && (
                      <div
                        className={cn(
                          "absolute left-0 -ml-px h-0.5 w-full -translate-x-full z-0",
                          "top-5",
                          isCompleted ? "bg-primary" : "bg-muted",
                        )}
                        aria-hidden="true"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => isClickable && actions.goToStep(index)}
                      disabled={!isClickable}
                      className={cn(
                        "group relative flex flex-col items-center w-full z-10",
                        "disabled:cursor-not-allowed",
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors bg-background",
                            isCurrent &&
                              "border-primary bg-primary text-primary-foreground",
                            isCompleted &&
                              !isCurrent &&
                              "border-primary bg-primary text-primary-foreground",
                            !isCurrent &&
                              !isCompleted &&
                              "border-muted text-muted-foreground",
                            isClickable && "group-hover:border-primary/80",
                          )}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </span>
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              "text-xs font-medium text-center max-w-[100px]",
                              isCurrent && "text-primary",
                              !isCurrent && "text-muted-foreground",
                            )}
                          >
                            {step.title}
                          </span>
                          {step.optional && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1 py-0 h-4"
                            >
                              Optional
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        );
    }
  };

  // Default navigation buttons
  const defaultNavigationRenderer = () => (
    <div className="flex items-center justify-between gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={actions.goToPreviousStep}
        disabled={isFirstStep || config.allowBackNavigation === false}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <div className="flex-1" />

      <Button type="submit" disabled={state.isSubmitting}>
        {state.isSubmitting && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isLastStep ? "Submit" : "Next"}
        {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      <Card>
        <CardHeader>
          <CardTitle>{currentStepConfig.title}</CardTitle>
          {currentStepConfig.description && (
            <CardDescription>{currentStepConfig.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          {renderProgress
            ? renderProgress(state, config)
            : defaultProgressRenderer()}

          {showProgress && progressStyle === "steps" && <Separator />}

          {/* Current Step Form */}
          <FormRenderer
            fields={currentStepConfig.fields}
            onSubmit={handleStepSubmit}
            defaultValues={state.formData}
            translationNamespace={translationNamespace}
            formActions={
              renderNavigation
                ? renderNavigation(state, actions)
                : defaultNavigationRenderer()
            }
          />
        </CardContent>
      </Card>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(
                {
                  currentStep: state.currentStep,
                  completedSteps: Array.from(state.completedSteps),
                  formData: state.formData,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiStepFormRenderer;
