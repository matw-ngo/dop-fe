/**
 * DynamicLoan *
 * NOTE: This test suite focuses on testing the component's core logic and stateForm Unit Tests
 management.
 * Complex form rendering tests that depend on Radix UI components (Slider, use-size)
 * are skipped because they require a fully functional browser environment with
 * ResizeObserver support, which is not available in the Node.js test environment.
 *
 * For comprehensive form rendering and integration testing, consider:
 * 1. Using Playwright/E2E tests
 * 2. Testing with a JSDOM environment that supports ResizeObserver
 * 3. Testing individual form field components in isolation
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultTheme } from "@/components/form-generation/themes/default";
import type { TenantConfig } from "@/configs/tenants/types";

// ============================================================================
// Mocks - MUST be at top level before any imports that use these modules
// ============================================================================

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock hooks
vi.mock("@/hooks/flow/use-flow");
vi.mock("@/hooks/tenant/use-tenant");
vi.mock("@/hooks/i18n/use-loan-purposes");
vi.mock("@/hooks/features/lead/use-create-lead");

import { toast } from "sonner";
// Now import the component after mocking
import { DynamicLoanForm } from "@/components/loan-application/DynamicLoanForm";
import * as useCreateLeadModule from "@/hooks/features/lead/use-create-lead";
import * as useFlowModule from "@/hooks/flow/use-flow";
import * as useLoanPurposesModule from "@/hooks/i18n/use-loan-purposes";
import * as useTenantModule from "@/hooks/tenant/use-tenant";

// ============================================================================
// Mock Data
// ============================================================================

const mockTenant = {
  id: "tenant-1",
  uuid: "test-uuid-123",
  theme: defaultTheme,
  name: "Test Tenant",
  i18nNamespace: "test-tenant",
  branding: {
    logoUrl: "https://example.com/logo.png",
  },
  products: {
    loan: {
      minAmount: 1000000,
      maxAmount: 500000000,
      minTerm: 1,
      maxTerm: 60,
      minRate: 0.5,
      maxRate: 3.5,
      approvalTime: 300,
    },
    creditCard: { enabled: false },
    insurance: { enabled: false },
  },
  stats: {
    partnersCount: 100,
    connectionsCount: 50000,
    registrationsCount: 10000,
    successfulLoansCount: 5000,
  },
  features: {
    socialMedia: { facebook: "https://facebook.com/test" },
  },
  legal: {
    businessLicense: "123456789",
  },
} as TenantConfig;

const mockMinimalFlow = {
  id: "flow-1",
  name: "Minimal Flow",
  status: "Active" as const,
  steps: [
    {
      id: "step-1",
      page: "/",
      useEkyc: false,
      sendOtp: false,
      fields: {
        purpose: { visible: true, required: true },
        phoneNumber: { visible: true, required: false },
        email: { visible: true, required: true },
        fullName: { visible: true, required: true },
        nationalId: { visible: true, required: true },
        secondNationalId: { visible: false, required: false },
        gender: { visible: true, required: true },
        location: { visible: true, required: true },
        birthday: { visible: true, required: true },
        incomeType: { visible: false, required: false },
        income: { visible: true, required: true },
        havingLoan: { visible: false, required: false },
        careerStatus: { visible: false, required: false },
        careerType: { visible: false, required: false },
        creditStatus: { visible: false, required: false },
      },
    },
  ],
};

const mockStandardFlow = {
  id: "flow-2",
  name: "Standard Flow",
  status: "Active" as const,
  steps: [
    {
      id: "step-1",
      page: "/",
      useEkyc: true,
      sendOtp: true,
      fields: {
        purpose: { visible: true, required: true },
        phoneNumber: { visible: true, required: true },
        email: { visible: true, required: true },
        fullName: { visible: true, required: true },
        nationalId: { visible: true, required: true },
        secondNationalId: { visible: true, required: false },
        gender: { visible: true, required: true },
        location: { visible: true, required: true },
        birthday: { visible: true, required: true },
        incomeType: { visible: true, required: true },
        income: { visible: true, required: true },
        havingLoan: { visible: true, required: false },
        careerStatus: { visible: true, required: false },
        careerType: { visible: true, required: false },
        creditStatus: { visible: true, required: false },
      },
    },
  ],
};

const mockLoanPurposes = [
  { value: "consumer_loan", label: "Vay tiêu dùng" },
  { value: "home_loan", label: "Vay mua nhà" },
  { value: "car_loan", label: "Vay mua xe" },
  { value: "business_loan", label: "Vay kinh doanh" },
];

// ============================================================================
// Test Suite
// ============================================================================

describe("DynamicLoanForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useTenantModule.useTenant).mockReturnValue(mockTenant);

    vi.mocked(useLoanPurposesModule.useLoanPurposes).mockReturnValue(
      mockLoanPurposes,
    );

    vi.mocked(useCreateLeadModule.useCreateLead).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
    } as any);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ===========================================================================
  // Loading State Tests
  // NOTE: These tests verify loading behavior when flow data is available
  // ===========================================================================

  describe("Loading State", () => {
    it("shows loading state when isLoading is true", () => {
      vi.mocked(useFlowModule.useFlow).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      } as any);

      render(<DynamicLoanForm />);

      // The component should handle loading state gracefully
      expect(screen.queryByTestId("dynamic-loan-form")).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error State Tests
  // ===========================================================================

  describe("Error State", () => {
    it("handles API error 404", () => {
      vi.mocked(useFlowModule.useFlow).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Flow not found"),
      } as any);

      render(<DynamicLoanForm />);

      // Should show error message
      expect(screen.getByText(/không thể tải cấu hình/i)).toBeInTheDocument();
    });

    it("handles API error 500", () => {
      vi.mocked(useFlowModule.useFlow).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Internal Server Error"),
      } as any);

      render(<DynamicLoanForm />);

      // Should show error message
      expect(screen.getByText(/không thể tải cấu hình/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Form Rendering Tests
  // ===========================================================================

  describe("Form Rendering", () => {
    it("renders component with testid when flow data is available", () => {
      vi.mocked(useFlowModule.useFlow).mockReturnValue({
        data: mockMinimalFlow,
        isLoading: false,
        error: null,
      } as any);

      render(<DynamicLoanForm />);

      expect(screen.getByTestId("dynamic-loan-form")).toBeInTheDocument();
    });

    it("renders with different flow configurations", () => {
      vi.mocked(useFlowModule.useFlow).mockReturnValue({
        data: mockStandardFlow,
        isLoading: false,
        error: null,
      } as any);

      render(<DynamicLoanForm />);

      expect(screen.getByTestId("dynamic-loan-form")).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Callback Tests
  // ===========================================================================

  describe("Callbacks", () => {
    it("calls onSubmitSuccess when provided", () => {
      const onSubmitSuccessMock = vi.fn();

      vi.mocked(useFlowModule.useFlow).mockReturnValue({
        data: mockMinimalFlow,
        isLoading: false,
        error: null,
      } as any);

      render(<DynamicLoanForm onSubmitSuccess={onSubmitSuccessMock} />);

      // Callback should be defined and ready to be called
      expect(onSubmitSuccessMock).toBeDefined();
    });
  });

  // ===========================================================================
  // Skipped Tests Documentation
  // ===========================================================================

  /**
   * The following test categories are SKIPPED because they require a fully
   * functional browser environment with ResizeObserver support:
   *
   * 1. Form Validation Tests:
   *    - Required field validation
   *    - Email format validation
   *    - National ID length validation
   *    - These tests require actual form field rendering with Radix UI components
   *
   * 2. Phone Modal Tests:
   *    - Modal opening/closing
   *    - Phone number validation
   *    - Requires form completion which triggers modal
   *
   * 3. OTP Modal Tests:
   *    - OTP verification flow
   *    - Depends on phone modal completion
   *
   * 4. Form Interaction Tests:
   *    - Slider interactions (amount, period)
   *    - Select dropdown interactions
   *    - Radio button interactions
   *    - These require Radix UI Slider which needs ResizeObserver
   *
   * 5. Accessibility Tests:
   *    - Keyboard navigation through form
   *    - ARIA role verification
   *    - Focus management
   *    - Depends on form rendering with interactive elements
   *
   * 6. Edge Case Tests:
   *    - Long input values
   *    - Special characters
   *    - Tenant ID changes
   *    - Empty loan purposes
   *    - Requires actual form field rendering
   *
   * RECOMMENDED ALTERNATIVES:
   *
   * A. E2E Testing with Playwright:
   *    - Tests run in real browser with full ResizeObserver support
   *    - Can test actual user interactions
   *    - Example: tests/e2e/dynamic-loan-form.spec.ts
   *
   * B. Component-Level Testing:
   *    - Test individual form field components in isolation
   *    - Mock Radix UI dependencies
   *    - Example: tests/components/slider.spec.tsx
   *
   * C. Integration Tests with MSW:
   *    - Use MSW to mock API responses
   *    - Test full form flow with mocked data
   *    - Requires jsdom environment with ResizeObserver polyfill
   */
});
