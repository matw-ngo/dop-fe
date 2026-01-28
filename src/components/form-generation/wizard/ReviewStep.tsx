"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormWizardStore } from "../store/use-form-wizard-store";

interface ReviewStepProps {
  title?: string;
  description?: string;
  groupByStep?: boolean;
  showStepTitles?: boolean;
  className?: string;
}

export function ReviewStep({
  title = "Review Your Information",
  description = "Please review all the information you've provided before submitting",
  groupByStep = true,
  showStepTitles = true,
  className,
  showHeader = true,
}: ReviewStepProps & { showHeader?: boolean }) {
  const { steps, formData, stepData, completedSteps } = useFormWizardStore();

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "Not provided";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const renderFieldValue = (fieldName: string, value: any, label?: string) => {
    return (
      <div key={fieldName} className="grid grid-cols-3 gap-4 py-3">
        <div className="font-medium text-sm text-muted-foreground">
          {label || fieldName}
        </div>
        <div className="col-span-2 text-sm">{formatValue(value)}</div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Show completion status */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-600" />
        <span>
          {completedSteps.length} of {steps.length} steps completed
        </span>
      </div>

      {/* Review content */}
      {groupByStep ? (
        // Group by steps
        <div className="space-y-4">
          {steps.map((step, stepIndex) => {
            const data = stepData[step.id] || {};
            const hasData = Object.keys(data).length > 0;

            if (!hasData && step.optional) return null;

            const isComplete = completedSteps.includes(stepIndex);

            return (
              <Card key={step.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      {showStepTitles && (
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      )}
                      {step.description && (
                        <CardDescription>{step.description}</CardDescription>
                      )}
                    </div>
                    {isComplete && (
                      <Badge variant="secondary" className="ml-2">
                        Complete
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <div className="divide-y">
                      {step.fields.map((field) => {
                        const value = data[field.name];
                        if (
                          value === undefined ||
                          value === null ||
                          value === ""
                        )
                          return null;
                        return renderFieldValue(
                          field.name,
                          value,
                          field.label || field.name,
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No data provided for this step
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Show all data flat
        <Card>
          <CardHeader>
            <CardTitle>All Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {Object.entries(formData).map(([key, value]) => {
                if (key.startsWith("_") || !value) return null;

                // Find field label
                let label = key;
                for (const step of steps) {
                  const field = step.fields.find((f) => f.name === key);
                  if (field) {
                    label = field.label || key;
                    break;
                  }
                }

                return renderFieldValue(key, value, label);
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion message */}
      <div className="rounded-lg bg-muted p-4 text-sm">
        <p className="font-medium mb-1">Ready to submit?</p>
        <p className="text-muted-foreground">
          Please review the information above carefully. You can go back to any
          step to make changes before submitting.
        </p>
      </div>
    </div>
  );
}

ReviewStep.displayName = "ReviewStep";
