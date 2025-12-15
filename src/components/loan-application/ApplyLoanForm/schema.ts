import { z } from "zod";

// Loan amount constraints
const LOAN_AMOUNT = {
  MIN: 5,
  MAX: 90,
  STEP: 5,
} as const;

// Loan period constraints
const LOAN_PERIOD = {
  MIN: 3,
  MAX: 36,
  STEP: 1,
} as const;

// Phone validation regex
const PHONE_REGEX = /^0[0-9]{9}$/;

// Type for translation function
type TranslationFunction = (
  key: string,
  values?: Record<string, any>,
) => string;

// Helper function to create i18n validation messages
const createValidationMessages = (t?: TranslationFunction) => ({
  amount: {
    min:
      t?.("validation.amount.min", { min: LOAN_AMOUNT.MIN }) ||
      `Số tiền vay tối thiểu là ${LOAN_AMOUNT.MIN} triệu đồng`,
    max:
      t?.("validation.amount.max", { max: LOAN_AMOUNT.MAX }) ||
      `Số tiền vay tối đa là ${LOAN_AMOUNT.MAX} triệu đồng`,
    required: t?.("validation.amount.required") || "Vui lòng chọn khoản vay",
  },
  period: {
    min:
      t?.("validation.period.min", { min: LOAN_PERIOD.MIN }) ||
      `Thời hạn vay tối thiểu là ${LOAN_PERIOD.MIN} tháng`,
    max:
      t?.("validation.period.max", { max: LOAN_PERIOD.MAX }) ||
      `Thời hạn vay tối đa là ${LOAN_PERIOD.MAX} tháng`,
    required:
      t?.("validation.period.required") || "Vui lòng chọn thời gian vay",
  },
  purpose: {
    required:
      t?.("validation.purpose.required") || "Vui lòng chọn mục đích vay",
    invalid:
      t?.("validation.purpose.invalid") || "Vui lòng chọn mục đích vay hợp lệ",
  },
  phone: {
    required:
      t?.("validation.phone.required") || "Số điện thoại không được để trống",
    invalid: t?.("validation.phone.invalid") || "Số điện thoại không hợp lệ",
    format:
      t?.("validation.phone.format") ||
      "Số điện thoại phải có 10 số bắt đầu bằng số 0",
  },
  terms: {
    required:
      t?.("validation.terms.required") ||
      "Vui lòng đồng ý với điều khoản dịch vụ để tiếp tục",
  },
  otp: {
    required: t?.("validation.otp.required") || "OTP phải có 4 chữ số",
    invalid: t?.("validation.otp.invalid") || "OTP không hợp lệ",
  },
});

// Function to create schema with i18n support
export const createLoanApplicationSchema = (t?: TranslationFunction) => {
  const messages = createValidationMessages(t);

  return z.object({
    expected_amount: z
      .number()
      .min(LOAN_AMOUNT.MIN, messages.amount.min)
      .max(LOAN_AMOUNT.MAX, messages.amount.max)
      .default(LOAN_AMOUNT.MIN),

    loan_period: z
      .number()
      .min(LOAN_PERIOD.MIN, messages.period.min)
      .max(LOAN_PERIOD.MAX, messages.period.max)
      .default(LOAN_PERIOD.MIN),

    loan_purpose: z
      .string()
      .min(1, messages.purpose.required)
      .refine((val) => val !== "-1", messages.purpose.invalid),

    phone_number: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true; // Optional in first step
          return PHONE_REGEX.test(val);
        },
        {
          message: messages.phone.invalid,
        },
      ),

    agreeStatus: z.enum(["0", "1", ""]).refine((val) => val === "1", {
      message: messages.terms.required,
    }),
  });
};

// Function to create phone validation schema with i18n support
export const createPhoneValidationSchema = (t?: TranslationFunction) => {
  const messages = createValidationMessages(t);

  return z.object({
    phone_number: z
      .string()
      .min(1, messages.phone.required)
      .regex(PHONE_REGEX, messages.phone.format),
  });
};

// Function to create OTP validation schema with i18n support
export const createOtpVerificationSchema = (t?: TranslationFunction) => {
  const messages = createValidationMessages(t);

  return z.object({
    otp: z.string().length(4, messages.otp.required),
  });
};

// Default schemas (backward compatibility)
export const loanApplicationSchema = createLoanApplicationSchema();
export const phoneValidationSchema = createPhoneValidationSchema();
export const otpVerificationSchema = createOtpVerificationSchema();

// Export types (using the i18n schema for consistency)
export type LoanApplicationFormData = z.infer<
  ReturnType<typeof createLoanApplicationSchema>
>;
export type PhoneValidationData = z.infer<
  ReturnType<typeof createPhoneValidationSchema>
>;
export type OtpVerificationData = z.infer<
  ReturnType<typeof createOtpVerificationSchema>
>;

// Export constants
export { LOAN_AMOUNT, LOAN_PERIOD, PHONE_REGEX };
