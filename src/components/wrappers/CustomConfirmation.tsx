"use client";

import React from "react";
import { ConfirmationStep } from "@/components/onboarding/ConfirmationStep";
import { useFormContext } from "react-hook-form";

interface CustomConfirmationProps {
  value?: any;
  onChange?: (value: any) => void;
  flowId?: string;
  stepId?: string;
  domain?: string;
  onSuccess?: () => void;
  isSubmitting?: boolean;
}

export const CustomConfirmation = React.forwardRef<
  HTMLDivElement,
  CustomConfirmationProps
>((props, ref) => {
  const formContext = useFormContext();

  // Get all form data from parent form
  const allFormData = formContext?.getValues() || {};
  console.log("allFormData", allFormData);
  // This component is read-only, just for display
  // The actual form data is managed by the multi-step form

  return (
    <div ref={ref}>
      <ConfirmationStep
        formData={allFormData}
        flowId={props.flowId || ""}
        stepId={props.stepId || ""}
        domain={props.domain}
        onSuccess={props.onSuccess}
        isSubmitting={props.isSubmitting}
      />
    </div>
  );
});

CustomConfirmation.displayName = "CustomConfirmation";
