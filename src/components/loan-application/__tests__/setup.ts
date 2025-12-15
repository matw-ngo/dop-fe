import { vi } from "vitest";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock tracking
vi.mock("@/lib/tracking/events", () => ({
  trackLoanApplication: {
    inputExpectedAmount: vi.fn(),
    inputPeriod: vi.fn(),
    inputPurpose: vi.fn(),
    inputPhoneNumber: vi.fn(),
    phoneNumberValid: vi.fn(),
    submitApplication: vi.fn(),
    otpVerified: vi.fn(),
    otpFailed: vi.fn(),
  },
}));

// Mock hooks
vi.mock("@/hooks/use-loan-purposes", () => ({
  useLoanPurposes: () => [
    { value: "debt-consolidation", label: "Debt Consolidation" },
    { value: "home-improvement", label: "Home Improvement" },
    { value: "business", label: "Business" },
  ],
}));

vi.mock("@/hooks/use-phone-validation-messages", () => ({
  usePhoneValidationMessages: () => ({
    getTelcoList: () => "Viettel, Mobifone, Vinaphone",
  }),
}));
