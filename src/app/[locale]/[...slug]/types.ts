/**
 * Validation result type for dynamic route validation pipeline
 */
export type ValidationResult = {
  /** Whether the validation passed */
  isValid: boolean;
  /** Path to redirect to if validation failed */
  redirectTo?: string;
  /** Error message to display to user */
  message?: string;
  /** Whether to clear store state before redirect (for redirect loop or session corruption) */
  clearState?: boolean;
};
