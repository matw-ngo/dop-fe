"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useStepMeta } from "../store/use-form-wizard-store";

interface StepErrorsProps {
  stepId: string;
  className?: string;
}

export function StepErrors({ stepId, className }: StepErrorsProps) {
  const stepMeta = useStepMeta(stepId);

  if (
    !stepMeta ||
    !stepMeta.errors ||
    Object.keys(stepMeta.errors).length === 0
  ) {
    return null;
  }

  const stepLevelError = stepMeta.errors._step;
  const fieldErrors = Object.entries(stepMeta.errors).filter(
    ([key]) => key !== "_step",
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Step-level error */}
      {stepLevelError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{stepLevelError}</AlertDescription>
        </Alert>
      )}

      {/* Field errors summary (optional) */}
      {fieldErrors.length > 0 && !stepLevelError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix {fieldErrors.length} error
            {fieldErrors.length > 1 ? "s" : ""} above
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

StepErrors.displayName = "StepErrors";
