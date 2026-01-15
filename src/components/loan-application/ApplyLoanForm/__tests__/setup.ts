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

// Mock use-tenant hook
vi.mock("@/hooks/use-tenant", () => ({
  useTenant: () => ({
    uuid: "00000000-0000-0000-0000-000000000001",
    name: "Test Tenant",
    logo: null,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  }),
}));

// Mock use-tenant-flow hook
vi.mock("@/hooks/use-tenant-flow", () => ({
  useTenantFlow: () => ({
    data: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Test Flow",
      description: "Test flow description",
      flow_status: "active" as const,
      steps: [
        {
          id: "00000000-0000-0000-0000-000000000001",
          use_ekyc: false,
          send_otp: true,
          page: "loan-application",
          have_purpose: true,
          required_purpose: true,
          have_phone_number: true,
          required_phone_number: true,
          have_email: false,
          required_email: false,
          have_full_name: true,
          required_full_name: true,
          have_national_id: true,
          required_national_id: true,
          have_second_national_id: false,
          required_second_national_id: false,
          have_gender: false,
          required_gender: false,
          have_location: false,
          required_location: false,
          have_birthday: false,
          required_birthday: false,
          have_income_type: true,
          required_income_type: true,
          have_income: true,
          required_income: true,
          have_having_loan: false,
          required_having_loan: false,
          have_career_status: true,
          required_career_status: true,
          have_career_type: true,
          required_career_type: true,
          have_credit_status: false,
          required_credit_status: false,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ],
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    isLoading: false,
  }),
}));

// Mock use-confirmation-fields hook
vi.mock("@/hooks/use-confirmation-fields", () => ({
  useConfirmationFields: () => ({
    fields: [],
    isLoading: false,
  }),
}));
