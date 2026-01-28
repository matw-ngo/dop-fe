import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import type { LoanApplicationFormData } from "./schema";

// Form types
export interface LoanApplicationFormProps {
  onSubmit?: (data: LoanApplicationFormData) => void;
  initialData?: Partial<LoanApplicationFormData>;
  className?: string;
}

export interface UseLoanApplicationFormReturn {
  // Form state
  form: Control<LoanApplicationFormData>;
  errors: FieldErrors<LoanApplicationFormData>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;

  // Form actions
  handleSubmit: UseFormHandleSubmit<LoanApplicationFormData>;
  onSubmit: (data: LoanApplicationFormData) => void;

  // Modal state
  modals: {
    phone: boolean;
    otp: boolean;
  };

  // Modal actions
  showPhoneModal: () => void;
  hidePhoneModal: () => void;
  showOtpModal: () => void;
  hideOtpModal: () => void;

  // Field value getters
  values: LoanApplicationFormData;
}

// Modal types
export interface PhoneVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (phoneNumber: string) => void;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
}

export interface OtpVerificationModalProps {
  open: boolean;
  onClose: () => void;
  phoneNumber: string;
  leadId?: string;
  token?: string;
  otpType?: number;
  onSuccess: (otp: string) => void;
  onFailure: (error: string) => void;
  onExpired: () => void;
  size?: number;
}

// Field component props
export interface AmountFieldProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: string;
}

export interface PeriodFieldProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: string;
}

export interface PurposeFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export interface TermsAgreementProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  termsLink?: string;
  termsText?: string;
}

export interface SubmitButtonProps {
  isSubmitting: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  onClick?: () => void;
}

// Validation types
export interface PhoneValidationResult {
  valid: boolean;
  normalizedNumber?: string;
  telco?: string;
  telcoName?: string;
  error?: string;
}

// Tracking types
export interface LoanApplicationTrackingEvents {
  inputExpectedAmount: (amount: number) => void;
  inputPeriod: (period: number) => void;
  inputPurpose: (purpose: string) => void;
  inputPhoneNumber: (phone: string) => void;
  phoneNumberValid: (phone: string, telco: string) => void;
  submitApplication: (data: LoanApplicationFormData) => void;
  otpVerified: () => void;
  otpFailed: (error: string) => void;
}

// Form flow types
export type FormStep =
  | "initial"
  | "phone-verification"
  | "otp-verification"
  | "success"
  | "error";

export interface FormFlowState {
  currentStep: FormStep;
  formData: LoanApplicationFormData;
  phoneNumber?: string;
  error?: string;
}

// API types (for future use)
export interface LoanApplicationSubmissionRequest {
  formData: LoanApplicationFormData;
  formId: string;
  timestamp: string;
}

export interface LoanApplicationSubmissionResponse {
  success: boolean;
  applicationId?: string;
  error?: string;
  nextStep?: FormStep;
}

// Default form values
export const DEFAULT_FORM_VALUES: Partial<LoanApplicationFormData> = {
  expected_amount: 12,
  loan_period: 6,
  loan_purpose: "",
  phone_number: "",
  agreeStatus: "",
};
