"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { ConfirmationStep } from "@/components/onboarding/ConfirmationStep";
import type { FieldType } from "@/components/user-onboarding/constants/field-types";
import type { GeneratedStepConfig } from "@/components/user-onboarding/types/field-config";
import type { MappedFlow } from "@/mappers/flowMapper";

interface CustomConfirmationProps {
  value?: any;
  onChange?: (value: any) => void;
  flowId?: string;
  stepId?: string;
  domain?: string;
  onSuccess?: () => void;
  isSubmitting?: boolean;
  // NEW: Pass field configuration for dynamic rendering
  fieldConfig?: GeneratedStepConfig[];
  flowData?: MappedFlow;
  // NEW: Enable editing functionality
  enableEdit?: boolean;
  onFieldEdit?: (fieldType: FieldType | null, currentValue?: any) => void;
}

export const CustomConfirmation = React.forwardRef<
  HTMLDivElement,
  CustomConfirmationProps
>((props, ref) => {
  const formContext = useFormContext();

  // Get all form data from parent form
  const allFormData = formContext?.getValues() || {};

  // Handle field editing
  const handleFieldEdit = (fieldType: FieldType, currentValue: any) => {
    if (props.onFieldEdit) {
      props.onFieldEdit(fieldType, currentValue);
      // Could also navigate back to the specific step
    }
  };

  return (
    <div ref={ref}>
      <ConfirmationStep
        formData={allFormData}
        flowId={props.flowId || ""}
        stepId={props.stepId || ""}
        domain={props.domain}
        onSuccess={props.onSuccess}
        isSubmitting={props.isSubmitting}
        // NEW: Pass field configuration for dynamic rendering
        fieldConfig={props.fieldConfig}
        flowData={props.flowData}
        // NEW: Enable editing if requested
        showEditButtons={props.enableEdit}
        onEditField={props.enableEdit ? handleFieldEdit : undefined}
      />
    </div>
  );
});

CustomConfirmation.displayName = "CustomConfirmation";
