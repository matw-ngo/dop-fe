"use client";

import { useCallback } from "react";
import { FieldFactory } from "../factory/FieldFactory";
import { useFormWizardStore } from "../store/use-form-wizard-store";
import type { FieldDependency, FormField, FormStep } from "../types";
import { evaluateConditions } from "../utils/helpers";
import { ReviewStep } from "./ReviewStep";

interface StepContentProps {
  step: FormStep;
  className?: string;
  showTitle?: boolean;
  namespace?: string;
}

export function StepContent({
  step,
  className,
  showTitle = true,
  namespace,
}: StepContentProps) {
  const { updateFieldValue, getStepData, stepMeta, formData, clearFieldError } =
    useFormWizardStore();

  // Check if a field should be visible based on its dependencies
  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      if (!field.dependencies || field.dependencies.length === 0) {
        return true;
      }

      // Check all dependencies
      const visible = field.dependencies.every((dep: FieldDependency) => {
        const conditionsMet = evaluateConditions(
          dep.conditions,
          formData,
          dep.logic || "and",
        );

        if (dep.action === "show") return conditionsMet;
        if (dep.action === "hide") return !conditionsMet;

        return true;
      });

      // Debug logging
      if (field.dependencies.length > 0) {
        console.log(`Field "${field.name}" visibility:`, {
          dependencies: field.dependencies,
          formData,
          visible,
        });
      }

      return visible;
    },
    [formData],
  );

  if (!step) {
    return null;
  }

  const stepData = getStepData(step.id);
  const meta = stepMeta[step.id];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      {showTitle && (step.title || step.description) && (
        <div className="space-y-2">
          {step.title && (
            <h2 className="text-2xl font-semibold tracking-tight">
              {step.title}
            </h2>
          )}
          {step.description && (
            <p className="text-muted-foreground">{step.description}</p>
          )}
        </div>
      )}

      {/* Help Text */}
      {step.helpText && (
        <div className="rounded-lg bg-muted p-4 text-sm">{step.helpText}</div>
      )}

      {/* Review Step Content */}
      {step.type === "review" && (
        <ReviewStep
          showHeader={false} // Use StepContent header
          className="mb-6"
        />
      )}

      {/* Fields */}
      <div className="space-y-4">
        {step.fields.filter(isFieldVisible).map((field) => (
          <FieldFactory
            key={field.id}
            field={field}
            value={stepData[field.name]}
            onChange={(value) => {
              updateFieldValue(step.id, field.name, value);
              // Clear error when user changes the field
              clearFieldError(step.id, field.name);
            }}
            onBlur={() => {
              // Optionally validate field on blur
            }}
            error={meta?.errors?.[field.name]}
            namespace={namespace || "common"}
          />
        ))}
      </div>
    </div>
  );
}

StepContent.displayName = "StepContent";
