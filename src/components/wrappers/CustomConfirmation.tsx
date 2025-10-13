"use client";

import React from "react";
import { ConfirmationStep } from "@/components/onboarding/ConfirmationStep";
import { useFormContext } from "react-hook-form";

interface CustomConfirmationProps {
  value?: any;
  onChange?: (value: any) => void;
}

export const CustomConfirmation = React.forwardRef<
  HTMLDivElement,
  CustomConfirmationProps
>((props, ref) => {
  const formContext = useFormContext();

  // Get all form data from parent form
  const allFormData = formContext?.getValues() || {};

  // This component is read-only, just for display
  // The actual form data is managed by the multi-step form

  return (
    <div ref={ref}>
      <ConfirmationStep formData={allFormData} />
    </div>
  );
});

CustomConfirmation.displayName = "CustomConfirmation";
