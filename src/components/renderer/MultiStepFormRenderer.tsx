"use client";

// MultiStepFormRenderer component for Data-Driven UI system
// Renders forms in multiple steps with progress tracking and navigation

import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import {
  getResponsiveMargin,
  getResponsivePadding,
  getResponsiveWidth,
} from "@/components/renderer/constants/responsive-classnames";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useMultiStepForm } from "@/hooks/form/use-multi-step-form";
import { cn } from "@/lib/utils";
import { useFormTheme } from "@/components/form-generation/themes/ThemeProvider";
import { AnimatedStepContainer } from "./AnimatedStepContainer";
import { FormRenderer } from "./FormRenderer";
import type { MultiStepFormRendererProps } from "./types/multi-step-form";

export const MultiStepFormRenderer: React.FC<MultiStepFormRendererProps> = ({
  config,
  className,
  translationNamespace,
  renderNavigation,
  renderProgress,
}) => {
  const t = useTranslations("pages.onboarding.navigation");
  const { theme } = useFormTheme();
  const {
    state,
    actions,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    progress,
  } = useMultiStepForm(config);

  const {
    steps,
    showProgress = true,
    progressStyle = "steps",
    formVariant,
    stepTransitionAnimation,
    responsive,
    layout,
    className: formClassName,
    style: formStyle,
  } = config;

  // Build responsive classes for form container
  const formResponsiveClasses = cn(
    // Form-level responsive styles
    responsive?.form && getResponsiveWidth(responsive.form),
    responsive?.form && getResponsivePadding(responsive.form),
    responsive?.form && getResponsiveMargin(responsive.form),
    // Layout styles
    layout?.display === "flex" && "flex",
    layout?.display === "grid" && "grid",
    layout?.direction && `flex-${layout.direction}`,
    layout?.align && `items-${layout.align}`,
    layout?.justify && `justify-${layout.justify}`,
    layout?.wrap && layout.wrap,
    layout?.gap && `gap-${layout.gap}`,
    // Custom class name
    formClassName,
    className,
  );

  // Handle form submission for current step
  const handleStepSubmit = async (data: Record<string, any>) => {
    // Update the form data with current step's data
    actions.updateStepData(data);

    // Proceed to next step
    await actions.goToNextStep();
  };

  // Handle success callback from confirmation step
  const handleConfirmationSuccess = () => {
    // Clear persisted data and redirect to success page
    if (config.persistData && typeof window !== "undefined") {
      try {
        localStorage.removeItem(config.persistKey || "multi-step-form-data");
      } catch (error) {
        console.error("Failed to clear persisted form data:", error);
      }
    }

    // Redirect to success page
    window.location.href = "/onboarding-success";
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
  const defaultNavigationRenderer = () => {
    // Hide navigation for confirmation step since it has its own submit button
    if (currentStepConfig.id === "confirmation") {
      return null;
    }

    // Determine button text based on number of steps
    const nextButtonText =
      steps.length === 1
        ? t("complete") // "Hoàn tất" for single step
        : isLastStep
          ? t("complete") // "Hoàn tất" for last step
          : t("next"); // "Tiếp tục" for other steps

    return (
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={actions.goToPreviousStep}
          disabled={isFirstStep || config.allowBackNavigation === false}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("previous")}
        </Button>

        <div className="flex-1" />

        <Button
          type="submit"
          variant="default"
          disabled={state.isSubmitting}
          className="h-14 px-6 text-white font-semibold rounded-lg"
          style={{
            backgroundColor: theme.colors.primary,
          }}
        >
          {state.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {nextButtonText}
          {!isLastStep && steps.length > 1 && (
            <ChevronRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className={cn("w-full", formResponsiveClasses)} style={formStyle}>
      <Card
        className={cn(
          "w-full",
          // Form variant styles
          formVariant?.variant === "solid" &&
            "bg-primary text-primary-foreground",
          formVariant?.variant === "outline" && "border-2",
          formVariant?.variant === "ghost" && "bg-transparent shadow-none",
          // Form size styles
          formVariant?.size === "sm" && "p-4",
          formVariant?.size === "lg" && "p-8",
          formVariant?.size === "xl" && "p-10",
        )}
      >
        <CardHeader>
          <CardTitle
            className={cn(
              // Form color styles for title
              formVariant?.color === "primary" && "text-primary",
              formVariant?.color === "secondary" && "text-secondary",
              formVariant?.color === "success" && "text-green-600",
              formVariant?.color === "warning" && "text-yellow-600",
              formVariant?.color === "error" && "text-red-600",
              formVariant?.color === "info" && "text-blue-600",
            )}
          >
            {currentStepConfig.title}
          </CardTitle>
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

          {/* Current Step Form with Animation */}
          <AnimatedStepContainer
            isActive={true}
            animation={
              currentStepConfig.animation || {
                type: "fade",
                direction: "up",
                duration: 300,
              }
            }
            responsive={currentStepConfig.responsive}
            className={currentStepConfig.className}
            style={currentStepConfig.style}
            stepId={currentStepConfig.id}
          >
            <FormRenderer
              fields={currentStepConfig.fields.map((field: any) => {
                // Pass success callback to confirmation field
                if (field.component === "Confirmation") {
                  return {
                    ...field,
                    props: {
                      ...field.props,
                      onSuccess: handleConfirmationSuccess,
                      isSubmitting: state.isSubmitting,
                    },
                  };
                }
                return field;
              })}
              onSubmit={handleStepSubmit}
              defaultValues={state.formData}
              translationNamespace={translationNamespace}
              formActions={
                renderNavigation
                  ? renderNavigation(state, actions)
                  : defaultNavigationRenderer()
              }
            />
          </AnimatedStepContainer>
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
