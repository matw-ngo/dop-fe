"use client";

import type { FormStep } from "../types";
import { FieldFactory } from "../factory/FieldFactory";
import { useFormWizardStore } from "../store/use-form-wizard-store";
import { StepErrors } from "./StepErrors";
import { ReviewStep } from "./ReviewStep";

interface StepContentProps {
  step: FormStep;
  stepIndex: number;
  className?: string;
}

export function StepContent({ step, stepIndex, className }: StepContentProps) {
  const { updateFieldValue, getStepData, stepMeta } = useFormWizardStore();
  const stepData = getStepData(step.id);
  const meta = stepMeta[step.id];

  if (!step) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Step Header */}
      {(step.title || step.description) && (
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

      {/* Step-level Errors */}
      <StepErrors stepId={step.id} />

      {/* Review Step Content */}
      {step.type === "review" && (
        <ReviewStep
          showHeader={false} // Use StepContent header
          className="mb-6"
        />
      )}

      {/* Fields */}
      <div className="space-y-4">
        {step.fields.map((field) => (
          <FieldFactory
            key={field.id}
            field={field}
            value={stepData[field.name]}
            onChange={(value) => updateFieldValue(step.id, field.name, value)}
            onBlur={() => {
              // Optionally validate field on blur
            }}
            error={meta?.errors?.[field.name]}
          />
        ))}
      </div>
    </div>
  );
}

StepContent.displayName = "StepContent";
