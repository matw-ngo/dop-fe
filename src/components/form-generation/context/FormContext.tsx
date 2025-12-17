/**
 * Form Generation Context
 *
 * React context provider for form state management.
 */

import React, { createContext, type ReactNode, useContext } from "react";

// ============================================================================
// Form Context Types
// ============================================================================

export interface FormContextValue {
  /** Current form data */
  formData: Record<string, any>;

  /** Set field value */
  setFieldValue: (fieldId: string, value: any) => void;

  /** Form errors */
  errors: Record<string, string>;

  /** Set form errors */
  setErrors: (errors: Record<string, string>) => void;

  /** Touched fields */
  touched: Record<string, boolean>;

  /** Set touched status */
  setTouched: (touched: Record<string, boolean>) => void;

  /** Validate single field */
  validateField: (fieldId: string) => boolean;

  /** Validate entire form */
  validateForm: () => boolean;

  /** Reset form */
  resetForm: () => void;

  /** Submit form */
  submitForm: () => void;
}

// ============================================================================
// Form Context
// ============================================================================

const FormContext = createContext<FormContextValue | undefined>(undefined);

export function FormProvider({
  children,
  value = {
    formData: {},
    setFieldValue: () => {},
    errors: {},
    setErrors: () => {},
    touched: {},
    setTouched: () => {},
    validateField: () => false,
    validateForm: () => false,
    resetForm: () => {},
    submitForm: () => {},
  },
}: {
  children?: ReactNode;
  value?: Partial<FormContextValue>;
}) {
  // Merge default value with provided value
  const contextValue: FormContextValue = {
    formData: {},
    setFieldValue: () => {},
    errors: {},
    setErrors: () => {},
    touched: {},
    setTouched: () => {},
    validateField: () => false,
    validateForm: () => false,
    resetForm: () => {},
    submitForm: () => {},
    ...value,
  };

  return (
    <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}

// ============================================================================
// Exports
// ============================================================================

export { FormContext as default };
