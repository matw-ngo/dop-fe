// Loan amount configuration
export const LOAN_AMOUNT = {
  MIN: 5,
  MAX: 90,
  STEP: 5,
  DEFAULT: 12,
} as const;

// Loan period configuration
export const LOAN_PERIOD = {
  MIN: 3,
  MAX: 36,
  STEP: 1,
  DEFAULT: 6,
} as const;

// Form configuration
export const FORM_CONFIG = {
  PHONE_LENGTH: 10,
  OTP_LENGTH: 4,
  TELCOS: ["VIETTEL", "MOBIFONE", "VINAPHONE", "VNMOBI", "I-TEL"],
} as const;

// Modal sizes
export const MODAL_SIZE = {
  PHONE: "lg",
  OTP: "md",
} as const;

// Animation durations (in ms)
export const ANIMATION = {
  MODAL: 300,
  SLIDER: 200,
  BUTTON: 150,
} as const;

// Form field IDs
export const FIELD_IDS = {
  AMOUNT_SLIDER: "loan-amount-slider",
  PERIOD_SLIDER: "loan-period-slider",
  PURPOSE_SELECT: "loan-purpose-select",
  PHONE_INPUT: "phone-number-input",
  TERMS_AGREE: "terms-agree",
  TERMS_DISAGREE: "terms-disagree",
  SUBMIT_BUTTON: "loan-application-submit",
  PHONE_MODAL: "phone-verification-modal",
  OTP_MODAL: "otp-verification-modal",
} as const;

// Form step tracking
export const FORM_STEPS = {
  INITIAL: "initial",
  PHONE_VERIFICATION: "phone-verification",
  OTP_VERIFICATION: "otp-verification",
  SUCCESS: "success",
  ERROR: "error",
} as const;

// URLs
export const URLS = {
  TERMS_AND_CONDITIONS: "/dieu-khoan-su-dung",
  PRIVACY_POLICY: "/chinh-sach-bao-mat",
} as const;

// Test data
export const TEST_DATA = {
  VALID_PHONE: "0912345678",
  INVALID_PHONE: "123456",
  // OTP values removed - use real API for OTP verification
} as const;
