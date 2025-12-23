// Loan amount configuration
export const LOAN_AMOUNT = {
  MIN: 5,
  MAX: 90,
  STEP: 5,
  DEFAULT: 12,
  UNIT: "triệu VNĐ",
  CURRENCY: "VNĐ",
} as const;

// Loan period configuration
export const LOAN_PERIOD = {
  MIN: 3,
  MAX: 36,
  STEP: 1,
  DEFAULT: 6,
  UNIT: "tháng",
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

// Error messages (fallbacks)
export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_PHONE: "Invalid phone number format",
  UNSUPPORTED_TELCO: "Your telecom provider is not supported",
  INVALID_AMOUNT: `Amount must be between ${LOAN_AMOUNT.MIN} and ${LOAN_AMOUNT.MAX} million`,
  INVALID_PERIOD: `Period must be between ${LOAN_PERIOD.MIN} and ${LOAN_PERIOD.MAX} months`,
  TERMS_REQUIRED: "You must agree to the terms and conditions",
  OTP_EXPIRED: "OTP has expired",
  OTP_INVALID: "Invalid OTP",
  NETWORK_ERROR: "Network error. Please try again",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  FORM_SUBMITTED: "Application submitted successfully",
  PHONE_VERIFIED: "Phone number verified",
  OTP_VERIFIED: "OTP verified successfully",
} as const;

// URLs
export const URLS = {
  TERMS_AND_CONDITIONS: "/dieu-khoan-su-dung",
} as const;

// CSS classes
export const CSS_CLASSES = {
  CONTAINER: "max-w-2xl mx-auto p-4",
  FIELD_WRAPPER:
    "relative mb-[34px] rounded-lg border border-[#bfd1cc] bg-white p-4 pb-[9px]",
  FIELD_LABEL: "text-xs font-normal leading-4 text-[#4d7e70]",
  FIELD_VALUE: "mt-0.5 mb-0.5 text-xl font-semibold leading-[30px]",
  FIELD_PLACEHOLDER: "font-medium text-sm leading-[30px] mb-0.5",
  FIELD_SUBTEXT: "text-sm leading-5 ml-1",
  SUBMIT_BUTTON:
    "h-14 w-full rounded-lg whitespace-nowrap bg-[#017848] hover:bg-[#01603a] text-white",
  TERMS_CONTAINER: "my-4 text-xs font-normal leading-5",
  TERMS_TEXT: "text-[#073126]",
  TERMS_LINK: "text-[#017848] font-semibold",
  RADIO_INPUT:
    "relative top-0.5 w-[13px] h-[13px] appearance-none rounded-full border border-[#999] transition-all duration-200 checked:border-4 checked:border-[#017848] outline-none",
  RADIO_LABEL: "ml-2 text-sm md:text-xs font-normal leading-5 text-[#017848]",
  ERROR_TEXT: "block min-h-[18px] text-[11px] text-[rgb(255,116,116)]",
} as const;

// Test data
export const TEST_DATA = {
  VALID_PHONE: "0912345678",
  INVALID_PHONE: "123456",
  VALID_OTP: "1234",
  INVALID_OTP: "12",
} as const;
