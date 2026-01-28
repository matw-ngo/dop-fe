/**
 * Form Generation Library - Main Dynamic Form Component
 *
 * Main orchestrator for rendering dynamic forms from configuration
 */

"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldFactory } from "./factory/FieldFactory";
import { FormSection } from "./layouts/FormSection";
import { DynamicLayout } from "./layouts/LayoutEngine";
import { submitButtonVariants } from "./styles/variants";
import type { DynamicFormConfig, FormField } from "./types";
import { cn, evaluateConditions } from "./utils/helpers";
import { ValidationEngine } from "./validation/ValidationEngine";

// ============================================================================
// Dynamic Form Props
// ============================================================================

export interface DynamicFormProps {
  /**
   * Form configuration
   */
  config: DynamicFormConfig;

  /**
   * Initial form values
   */
  initialValues?: Record<string, any>;

  /**
   * Custom submit handler (overrides config.onSubmit)
   */
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;

  /**
   * Custom change handler (overrides config.onChange)
   */
  onChange?: (
    fieldName: string,
    value: any,
    formData: Record<string, any>,
  ) => void;

  /**
   * Form className
   */
  className?: string;

  /**
   * Disable entire form
   */
  disabled?: boolean;

  /**
   * Read-only mode
   */
  readOnly?: boolean;
}

// ============================================================================
// Dynamic Form Component
// ============================================================================

export function DynamicForm({
  config,
  initialValues = {},
  onSubmit: customOnSubmit,
  onChange: customOnChange,
  className,
  disabled = false,
  readOnly = false,
}: DynamicFormProps) {
  // Check if this is a multi-step wizard
  const isMultiStep = config.steps && config.steps.length > 0;

  // If multi-step, render StepWizard
  if (isMultiStep) {
    const { StepWizard } = require("./wizard");
    return (
      <StepWizard
        config={config}
        initialData={initialValues}
        onComplete={config.onComplete || customOnSubmit}
        onStepChange={config.onStepChange}
        className={className}
      />
    );
  }

  // Otherwise, render single-page form
  // Form state
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation abort controllers (to prevent race conditions)
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Initialize form data with default values
  useEffect(() => {
    const defaultValues: Record<string, any> = {};

    // Get all fields (from both fields and sections)
    const allFields: FormField[] = [
      ...(config.fields || []),
      ...(config.sections?.flatMap((s) => s.fields) || []),
    ];

    allFields.forEach((field) => {
      if (
        field.defaultValue !== undefined &&
        formData[field.name] === undefined
      ) {
        defaultValues[field.name] = field.defaultValue;
      }
    });

    if (Object.keys(defaultValues).length > 0) {
      setFormData((prev) => ({ ...prev, ...defaultValues }));
    }
  }, [config.fields, config.sections, formData[field.name]]);

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      // Cancel all pending validations on unmount
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
    };
  }, []);

  // Get all fields with their validation rules
  const fieldValidationRules = useMemo(() => {
    const allFields: FormField[] = [
      ...(config.fields || []),
      ...(config.sections?.flatMap((s) => s.fields) || []),
    ];

    const rules: Record<string, any[]> = {};
    allFields.forEach((field) => {
      if (field.validation && field.validation.length > 0) {
        rules[field.name] = field.validation;
      }
    });

    return rules;
  }, [config.fields, config.sections]);

  // Handle field change
  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      const newFormData = { ...formData, [fieldName]: value };
      setFormData(newFormData);

      // Call custom onChange if provided
      if (customOnChange) {
        customOnChange(fieldName, value, newFormData);
      } else if (config.onChange) {
        config.onChange(fieldName, value);
      }

      // Clear error when field changes
      if (errors[fieldName]) {
        const newErrors = { ...errors };
        delete newErrors[fieldName];
        setErrors(newErrors);
      }

      // Validate on change if enabled
      if (config.validationMode === "onChange") {
        validateField(fieldName, value);
      }
    },
    [formData, customOnChange, config, errors, validateField],
  );

  // Handle field blur
  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      // Validate on blur if enabled
      if (config.validationMode === "onBlur") {
        validateField(fieldName, formData[fieldName]);
      }
    },
    [config.validationMode, formData, validateField],
  );

  // Validate single field with race condition prevention
  const validateField = useCallback(
    async (fieldName: string, value: any) => {
      const rules = fieldValidationRules[fieldName];
      if (!rules) return;

      // Cancel previous validation for this field
      const previousController = abortControllersRef.current.get(fieldName);
      if (previousController) {
        previousController.abort();
      }

      // Create new abort controller for this validation
      const controller = new AbortController();
      abortControllersRef.current.set(fieldName, controller);

      try {
        const result = await ValidationEngine.validateField(value, rules);

        // Check if this validation was cancelled
        if (controller.signal.aborted) {
          return;
        }

        // Update errors based on validation result
        if (!result.valid && result.error) {
          setErrors((prev) => ({ ...prev, [fieldName]: result.error! }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      } finally {
        // Clean up this controller
        abortControllersRef.current.delete(fieldName);
      }
    },
    [fieldValidationRules],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmitting || disabled || readOnly) return;

      setIsSubmitting(true);

      try {
        // Validate entire form
        const validationErrors = await ValidationEngine.validateForm(
          formData,
          fieldValidationRules,
        );

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          // Mark all fields as touched
          const allTouched: Record<string, boolean> = {};
          Object.keys(fieldValidationRules).forEach((key) => {
            allTouched[key] = true;
          });
          setTouched(allTouched);
          setIsSubmitting(false);
          return;
        }

        // Call submit handler
        const submitHandler = customOnSubmit || config.onSubmit;
        if (submitHandler) {
          await submitHandler(formData);
        }
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      fieldValidationRules,
      customOnSubmit,
      config.onSubmit,
      isSubmitting,
      disabled,
      readOnly,
    ],
  );

  // Check if field should be visible based on dependencies
  const isFieldVisible = useCallback(
    (field: FormField): boolean => {
      if (!field.dependencies || field.dependencies.length === 0) {
        return true;
      }

      // Check all dependencies
      return field.dependencies.every((dep) => {
        const conditionsMet = evaluateConditions(
          dep.conditions,
          formData,
          dep.logic,
        );

        if (dep.action === "show") return conditionsMet;
        if (dep.action === "hide") return !conditionsMet;

        return true;
      });
    },
    [formData],
  );

  // Check if field should be disabled based on dependencies
  const isFieldDisabled = useCallback(
    (field: FormField): boolean => {
      if (disabled || field.disabled) return true;

      if (!field.dependencies || field.dependencies.length === 0) {
        return false;
      }

      return field.dependencies.some((dep) => {
        const conditionsMet = evaluateConditions(
          dep.conditions,
          formData,
          dep.logic,
        );

        if (dep.action === "disable") return conditionsMet;
        if (dep.action === "enable") return !conditionsMet;

        return false;
      });
    },
    [formData, disabled],
  );

  // Render field
  const renderField = useCallback(
    (field: FormField) => {
      if (!isFieldVisible(field)) {
        return null;
      }

      return (
        <FieldFactory
          key={field.id}
          field={field}
          value={formData[field.name]}
          onChange={(value) => handleFieldChange(field.name, value)}
          onBlur={() => handleFieldBlur(field.name)}
          namespace={config.i18n?.namespace}
          error={touched[field.name] ? errors[field.name] : undefined}
          disabled={isFieldDisabled(field)}
          readOnly={readOnly}
        />
      );
    },
    [
      formData,
      errors,
      touched,
      isFieldVisible,
      isFieldDisabled,
      handleFieldChange,
      handleFieldBlur,
      config.i18n,
      readOnly,
    ],
  );

  // Render submit button
  const submitButton = config.submitButton || {};
  const submitLabel = submitButton.label || "Submit";
  const submitPosition = submitButton.position || "right";

  const positionClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <form
      id={config.id}
      onSubmit={handleSubmit}
      className={cn("w-full", className)}
    >
      {/* Sections */}
      {config.sections && config.sections.length > 0 ? (
        <div className="space-y-6">
          {config.sections.map((section) => (
            <FormSection
              key={section.id}
              section={section}
              formValues={formData}
              variant={
                section.className?.includes("border") ? "bordered" : "default"
              }
            >
              {section.fields.map((field) => renderField(field))}
            </FormSection>
          ))}
        </div>
      ) : (
        /* Fields (flat structure) */
        <DynamicLayout
          type={config.layout?.type}
          columns={config.layout?.columns}
          gap={config.layout?.gap as any}
        >
          {config.fields?.map((field) => renderField(field))}
        </DynamicLayout>
      )}

      {/* Submit Button */}
      <div className={cn("mt-6 flex", positionClasses[submitPosition])}>
        <button
          type="submit"
          disabled={isSubmitting || submitButton.disabled || disabled}
          className={cn(submitButtonVariants(), submitButton.className)}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Submitting..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

DynamicForm.displayName = "DynamicForm";
