/**
 * useDynamicLoanFormOrchestrator — Hook-level tests
 *
 * Covers all 6 diagram scenarios:
 *   A  Step 1 + sendOtp + no phone   → Phone Modal → createLead → OTP → navigate
 *   B  Step 1 + sendOtp + phone      → createLead → OTP → navigate
 *   C  Step 1 + no sendOtp           → createLead → navigate
 *   D  Step 2+ + sendOtp + phone     → OTP → submit-info → navigate
 *   E  Step 2+ + no sendOtp          → submit-info (final) / navigate (non-final)
 *   F  Step 2+ + sendOtp + no phone  → Phone Modal → OTP → submit-info → navigate
 *
 * Plus error paths and OTP retry/close behavior.
 *
 * ── HOW THE MOCK HOISTING PROBLEM IS SOLVED ──────────────────────────────────
 *
 * vi.mock() is hoisted to the top of the file before any variable declarations.
 * This means you CANNOT reference variables defined at module scope inside the
 * factory function.
 *
 * Solution:
 *   1. vi.mock() factories return plain objects with vi.fn() — no outer refs.
 *   2. Imports of mocked modules go AFTER all vi.mock() calls.
 *   3. In beforeEach, use vi.mocked(importedFn).mockReturnValue(...) to
 *      configure each mock fresh per test.
 *   4. To capture async callbacks (onSuccess/onError) from mutate(), use
 *      mockImplementation() that stores them in a local variable, then call
 *      them manually inside act().
 *
 * ── HOW ZUSTAND getState() IS HANDLED ────────────────────────────────────────
 *
 *   useFormWizardStore.getState() is a static method on the hook function.
 *   Mock it by attaching getState as a property with Object.assign().
 *   Configure in beforeEach with vi.mocked(useFormWizardStore.getState).
 *
 * ── PLACES TO FILL IN ─────────────────────────────────────────────────────────
 *   [FILL] marks spots where you need to adjust to match your actual code.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// vi.mock() — ALL hoisted. Factories use ONLY inline vi.fn(), no outer refs.
// ─────────────────────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/hooks/features/lead/use-create-lead", () => ({
  useCreateLead: vi.fn(),
}));

vi.mock("@/hooks/features/lead/use-lead-submission", () => ({
  useSubmitLeadInfo: vi.fn(),
}));

vi.mock("@/hooks/phone/use-validation-messages", () => ({
  usePhoneValidationMessages: vi.fn(),
}));

vi.mock("@/lib/utils/phone-validation", () => ({
  // ALLOWED_TELCOS matches the real list from phone-validation.ts
  ALLOWED_TELCOS: ["VIETTEL", "MOBIFONE", "VINAPHONE"],
  phoneValidation: vi.fn(),
}));

vi.mock("@/mappers/leadMapper", () => ({
  mapFormDataToLeadInfo: vi.fn(),
  mapFormDataToCreateLeadInfo: vi.fn(),
}));

vi.mock("@/store/use-auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/store/use-loan-search-store", () => ({
  useLoanSearchStore: vi.fn(),
}));

vi.mock("@/contexts/NavigationConfigContext", () => ({
  getNavigationConfig: vi.fn(() => ({})),
}));

// Zustand store — static getState() lives as a property on the hook function
vi.mock("@/components/form-generation/store/use-form-wizard-store", () => ({
  useFormWizardStore: Object.assign(vi.fn(), {
    getState: vi.fn(),
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Imports of mocked modules — must come AFTER all vi.mock() calls
// ─────────────────────────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCreateLead } from "@/hooks/features/lead/use-create-lead";
import { useSubmitLeadInfo } from "@/hooks/features/lead/use-lead-submission";
import { usePhoneValidationMessages } from "@/hooks/phone/use-validation-messages";
import { phoneValidation } from "@/lib/utils/phone-validation";
import { mapFormDataToLeadInfo, mapFormDataToCreateLeadInfo } from "@/mappers/leadMapper";
import { useAuthStore } from "@/store/use-auth-store";
import { useLoanSearchStore } from "@/store/use-loan-search-store";
import { useFormWizardStore } from "@/components/form-generation/store/use-form-wizard-store";

// Subject under test - path relative to test file location
import { useDynamicLoanFormOrchestrator } from "../use-orchestrator";

// ─────────────────────────────────────────────────────────────────────────────
// Test infrastructure
// ─────────────────────────────────────────────────────────────────────────────

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

// Shared mock handles — reassigned in beforeEach, read in tests
let mockRouterPush: ReturnType<typeof vi.fn>;
let mockCreateLeadMutate: ReturnType<typeof vi.fn>;
let mockSubmitLeadInfoMutate: ReturnType<typeof vi.fn>;
let mockWizardStore: Record<string, ReturnType<typeof vi.fn> | unknown>;
let mockLoanSearchStore: Record<string, ReturnType<typeof vi.fn>>;

// Captured async callbacks — populated by mockImplementation, triggered in act()
let capturedLeadCbs: { onSuccess?: (d: any) => void; onError?: () => void };
let capturedSubmitCbs: { onSuccess?: (d: any) => void; onError?: () => void };

// ─────────────────────────────────────────────────────────────────────────────
// Shared flow fixtures
// ─────────────────────────────────────────────────────────────────────────────

const STEP_1 = {
  id: "step-1",
  page: "/apply",
  sendOtp: false,
  fields: { phoneNumber: { required: false } },
};

const STEP_2 = {
  id: "step-2",
  page: "/step2",
  sendOtp: false,
  fields: { phoneNumber: { required: false } },
};

const TWO_STEP_FLOW = { id: "flow-1", steps: [STEP_1, STEP_2] };
const SINGLE_STEP_FLOW = { id: "flow-1", steps: [STEP_1] };

// Base input for Step 1, sendOtp=false, 2-step flow
const BASE_INPUT = {
  page: "/apply",
  flowData: TWO_STEP_FLOW,
  indexStep: STEP_1,
  stepContext: { currentStepIndex: 0, totalSteps: 2 },
  isFirstStep: true,
  tenantId: "tenant-1",
  hasConsent: () => true,
  getConsentId: () => "consent-1",
  openConsentModal: vi.fn(),
  onSubmitSuccess: vi.fn(),
} as const;

// Lead data returned by createLead API
const LEAD_RESPONSE = { id: "lead-123", token: "token-456", matched_products: [] };

// ─────────────────────────────────────────────────────────────────────────────
// beforeEach — fresh mocks for every test
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  capturedLeadCbs = {};
  capturedSubmitCbs = {};

  mockRouterPush = vi.fn();
  vi.mocked(useRouter).mockReturnValue({ push: mockRouterPush } as any);

  // Translations: just echo the key
  vi.mocked(useTranslations).mockReturnValue(((k: string) => k) as any);

  // Phone validation: valid by default; override per-test when needed
  vi.mocked(phoneValidation).mockReturnValue({ valid: true, telco: "VIETTEL" } as any);
  vi.mocked(usePhoneValidationMessages).mockReturnValue({
    getTelcoList: () => "VIETTEL, MOBIFONE",
  } as any);

  // Mapper returns a valid payload matching SubmitLeadInfoRequestBody structure
  vi.mocked(mapFormDataToLeadInfo).mockReturnValue({
    flow_id: "flow-1",
    step_id: "step-1",
    phone_number: "0987654321",
    purpose: "personal_loan",
    loan_amount: 10000000,
    loan_period: 12,
  } as any);
  vi.mocked(mapFormDataToCreateLeadInfo).mockReturnValue({
    flow_id: "flow-1",
    step_id: "step-1",
    phone_number: "0987654321",
    purpose: "personal_loan",
    loan_amount: 10000000,
    loan_period: 12,
  } as any);

  // createLead — captures onSuccess/onError for manual triggering
  mockCreateLeadMutate = vi.fn().mockImplementation((_payload: any, cbs: any) => {
    capturedLeadCbs = cbs ?? {};
  });
  vi.mocked(useCreateLead).mockReturnValue({
    mutate: mockCreateLeadMutate,
    isPending: false,
  } as any);

  // submitLeadInfo — same pattern
  mockSubmitLeadInfoMutate = vi.fn().mockImplementation((_payload: any, cbs: any) => {
    capturedSubmitCbs = cbs ?? {};
  });
  vi.mocked(useSubmitLeadInfo).mockReturnValue({
    mutate: mockSubmitLeadInfoMutate,
    isPending: false,
  } as any);

  // WizardStore instance (returned by the hook call)
  mockWizardStore = {
    detectOTPStep: vi.fn(),
    updateStepData: vi.fn(),
    markStepComplete: vi.fn(),
    goToStep: vi.fn(),
    setCurrentStep: vi.fn(),
    formData: {},
  };
  vi.mocked(useFormWizardStore).mockReturnValue(mockWizardStore as any);
  // Static getState() — used in createVerificationSessionAfterOtp
  vi.mocked(useFormWizardStore.getState).mockReturnValue({
    otpStepIndex: 0,
  } as any);

  // AuthStore
  vi.mocked(useAuthStore).mockReturnValue({
    createVerificationSession: vi.fn(),
  } as any);

  // LoanSearchStore
  mockLoanSearchStore = {
    showLoanSearching: vi.fn(),
    setMatchedProducts: vi.fn(),
    setForwardStatus: vi.fn(),
    setResult: vi.fn(),
    setError: vi.fn(),
  };
  vi.mocked(useLoanSearchStore).mockReturnValue(mockLoanSearchStore as any);
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO C — Step 1 + sendOtp=false
// Expected: createLead → navigate (or loan searching if final step)
// ─────────────────────────────────────────────────────────────────────────────

describe("Scenario C: Step 1 + sendOtp=false", () => {
  it("calls createLead then navigates to next step on success", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(BASE_INPUT),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({ loan_amount: 10000 }));

    expect(mockCreateLeadMutate).toHaveBeenCalledWith(
      expect.objectContaining({ flowId: "flow-1", tenant: "tenant-1" }),
      expect.any(Object),
    );

    act(() => capturedLeadCbs.onSuccess?.(LEAD_RESPONSE));

    expect(mockWizardStore.updateStepData).toHaveBeenCalledWith("step-1", {
      leadId: "lead-123",
      token: "token-456",
    });
    expect(mockRouterPush).toHaveBeenCalledWith("/step2");
    expect(mockLoanSearchStore.showLoanSearching).not.toHaveBeenCalled();
  });

  it("shows loan searching screen when Step 1 is also the final step", () => {
    const input = {
      ...BASE_INPUT,
      flowData: SINGLE_STEP_FLOW,
      stepContext: { currentStepIndex: 0, totalSteps: 1 },
    };

    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({}));
    act(() =>
      capturedLeadCbs.onSuccess?.({
        ...LEAD_RESPONSE,
        matched_products: [{ id: "product-1" }],
      }),
    );

    expect(mockLoanSearchStore.setMatchedProducts).toHaveBeenCalled();
    expect(mockLoanSearchStore.showLoanSearching).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: "lead-123", token: "token-456" }),
    );
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("shows toast error and does not navigate when createLead fails", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(BASE_INPUT),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({}));
    act(() => capturedLeadCbs.onError?.());

    expect(vi.mocked(toast.error)).toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
    // loanSearchStore must NOT be touched at Step 1
    expect(mockLoanSearchStore.setError).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO B — Step 1 + sendOtp=true + phone already in form data
// Expected: createLead immediately → OTP modal → navigate
// ─────────────────────────────────────────────────────────────────────────────

describe("Scenario B: Step 1 + sendOtp=true + phone in form data", () => {
  const step1WithOtp = {
    ...STEP_1,
    sendOtp: true,
    fields: { phoneNumber: { required: true } },
  };
  const input = {
    ...BASE_INPUT,
    flowData: { id: "flow-1", steps: [step1WithOtp, STEP_2] },
    indexStep: step1WithOtp,
  };

  it("calls createLead immediately then opens OTP modal", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({ phone_number: "0987654321" }));

    // createLead called before OTP shown
    expect(mockCreateLeadMutate).toHaveBeenCalled();
    expect(result.current.isOtpModalOpen).toBe(false); // not yet

    act(() => capturedLeadCbs.onSuccess?.(LEAD_RESPONSE));

    expect(result.current.isOtpModalOpen).toBe(true);
    expect(result.current.createdLeadId).toBe("lead-123");
    expect(result.current.createdLeadToken).toBe("token-456");
    expect(result.current.phoneForOtp).toBe("0987654321");
  });

  it("navigates after OTP success", async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({ phone_number: "0987654321" }));
    act(() => capturedLeadCbs.onSuccess?.(LEAD_RESPONSE));
    act(() => result.current.onOtpSuccess("123456"));

    // Advance timers to trigger setTimeout in completeOtpSuccessFlow
    act(() => vi.advanceTimersByTime(150));

    expect(mockRouterPush).toHaveBeenCalledWith("/step2");
    expect(result.current.isOtpModalOpen).toBe(false);
    
    vi.useRealTimers();
  });

  it("does NOT call submitLeadInfo after OTP — Step 1 only navigates", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({ phone_number: "0987654321" }));
    act(() => capturedLeadCbs.onSuccess?.(LEAD_RESPONSE));
    act(() => result.current.onOtpSuccess("123456"));

    expect(mockSubmitLeadInfoMutate).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO A — Step 1 + sendOtp=true + NO phone in form
// Expected: Phone Modal → createLead → OTP modal → navigate
// ─────────────────────────────────────────────────────────────────────────────

describe("Scenario A: Step 1 + sendOtp=true + phone missing from form", () => {
  const step1WithOtp = {
    ...STEP_1,
    sendOtp: true,
    fields: { phoneNumber: { required: true } },
  };
  const input = {
    ...BASE_INPUT,
    flowData: { id: "flow-1", steps: [step1WithOtp, STEP_2] },
    indexStep: step1WithOtp,
  };

  it("opens phone modal — does NOT call createLead yet", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({})); // no phone_number

    expect(result.current.isPhoneModalOpen).toBe(true);
    expect(mockCreateLeadMutate).not.toHaveBeenCalled();
    expect(result.current.isOtpModalOpen).toBe(false);
  });

  it("full Scenario A: Phone Modal → createLead → OTP modal → navigate", async () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    // 1. Form submit without phone → phone modal
    act(() => result.current.onWizardComplete({}));
    expect(result.current.isPhoneModalOpen).toBe(true);

    // 2. User submits phone → createLead
    act(() => result.current.onPhoneVerify("0987654321"));
    expect(mockCreateLeadMutate).toHaveBeenCalled();

    // 3. createLead success → OTP modal, phone modal closed
    act(() => capturedLeadCbs.onSuccess?.(LEAD_RESPONSE));
    expect(result.current.isPhoneModalOpen).toBe(false);
    expect(result.current.isOtpModalOpen).toBe(true);

    // 4. OTP success → navigate (with setTimeout delay)
    act(() => result.current.onOtpSuccess("123456"));
    act(() => vi.advanceTimersByTime(150));
    
    expect(mockRouterPush).toHaveBeenCalledWith("/step2");
    expect(result.current.isOtpModalOpen).toBe(false);
    
    vi.useRealTimers();
  });

  it("closing phone modal resets to idle", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({}));
    expect(result.current.isPhoneModalOpen).toBe(true);

    act(() => result.current.onClosePhone());
    expect(result.current.isPhoneModalOpen).toBe(false);
    expect(mockCreateLeadMutate).not.toHaveBeenCalled();
  });

  it("shows consent modal before phone modal when consent not given", () => {
    const openConsentModal = vi.fn();
    const inputNoConsent = {
      ...input,
      hasConsent: () => false,
      consentPurposeId: "consent-purpose-123",
      openConsentModal,
    };

    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(inputNoConsent),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({}));

    // Consent modal shown first, phone modal NOT open yet
    expect(openConsentModal).toHaveBeenCalledWith(
      expect.objectContaining({ consentPurposeId: "consent-purpose-123" }),
    );
    expect(result.current.isPhoneModalOpen).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO D — Step 2+ + sendOtp=true + phone in form
// Expected: OTP modal immediately → submit-info → navigate/loan searching
// ─────────────────────────────────────────────────────────────────────────────

describe("Scenario D: Step 2+ + sendOtp=true + phone in form", () => {
  const step2WithOtp = {
    ...STEP_2,
    sendOtp: true,
    fields: { phoneNumber: { required: false } },
  };
  const input = {
    ...BASE_INPUT,
    page: "/step2",
    flowData: { id: "flow-1", steps: [STEP_1, step2WithOtp] },
    indexStep: step2WithOtp,
    stepContext: { currentStepIndex: 1, totalSteps: 2 },
    isFirstStep: false,
  };

  // Form data carries leadId/token from Step 1 via wizardStore
  const formDataWithLead = {
    phone_number: "0987654321",
    leadId: "lead-123",
    token: "token-456",
  };

  it("opens OTP modal immediately — does NOT call createLead", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete(formDataWithLead));

    expect(result.current.isOtpModalOpen).toBe(true);
    expect(mockCreateLeadMutate).not.toHaveBeenCalled();
  });

  it("calls submit-info after OTP success", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete(formDataWithLead));
    act(() => result.current.onOtpSuccess("123456"));

    expect(mockSubmitLeadInfoMutate).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: "lead-123" }),
      expect.any(Object),
    );
  });

  it("shows loan searching screen after submit-info success (final step)", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete(formDataWithLead));
    act(() => result.current.onOtpSuccess("123456"));
    act(() => capturedSubmitCbs.onSuccess?.({}));

    // STEP_2 is the last step → loan searching shown
    expect(mockLoanSearchStore.showLoanSearching).toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("closes OTP modal (not retry) when submit-info fails", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete(formDataWithLead));
    act(() => result.current.onOtpSuccess("123456"));

    // submit-info fails — CLOSE_OTP, not OTP_FAILURE (retry loop bug)
    act(() => capturedSubmitCbs.onError?.());

    expect(result.current.isOtpModalOpen).toBe(false);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO E — Step 2+ + sendOtp=false
// Expected: submit-info directly (final step) OR navigate (non-final step)
// ─────────────────────────────────────────────────────────────────────────────

describe("Scenario E: Step 2+ + sendOtp=false", () => {
  const STEP_3 = { id: "step-3", page: "/step3", sendOtp: false, fields: { phoneNumber: { required: false } } };

  it("calls submit-info directly when Step 2+ is the final step", () => {
    const input = {
      ...BASE_INPUT,
      page: "/step2",
      flowData: { id: "flow-1", steps: [STEP_1, STEP_2] },
      indexStep: STEP_2,
      stepContext: { currentStepIndex: 1, totalSteps: 2 },
      isFirstStep: false,
    };

    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() =>
      result.current.onWizardComplete({ leadId: "lead-123", token: "token-456" }),
    );

    expect(mockSubmitLeadInfoMutate).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: "lead-123" }),
      expect.any(Object),
    );
    expect(mockCreateLeadMutate).not.toHaveBeenCalled();
    expect(result.current.isOtpModalOpen).toBe(false);
  });

  it("navigates to next step when Step 2+ is NOT the final step", () => {
    // 3-step flow, currently on step 2
    const threeStepFlow = { id: "flow-1", steps: [STEP_1, STEP_2, STEP_3] };
    const input = {
      ...BASE_INPUT,
      page: "/step2",
      flowData: threeStepFlow,
      indexStep: STEP_2,
      stepContext: { currentStepIndex: 1, totalSteps: 3 },
      isFirstStep: false,
    };

    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onWizardComplete({}));

    expect(mockRouterPush).toHaveBeenCalledWith("/step3");
    expect(mockSubmitLeadInfoMutate).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO F — Step 2+ + sendOtp=true + phone NOT in form
// Expected: Phone Modal → OTP modal → submit-info → navigate/loan searching
// ─────────────────────────────────────────────────────────────────────────────

describe("Scenario F: Step 2+ + sendOtp=true + phone missing", () => {
  const step2WithOtp = {
    ...STEP_2,
    sendOtp: true,
    fields: { phoneNumber: { required: true } },
  };
  const input = {
    ...BASE_INPUT,
    page: "/step2",
    flowData: { id: "flow-1", steps: [STEP_1, step2WithOtp] },
    indexStep: step2WithOtp,
    stepContext: { currentStepIndex: 1, totalSteps: 2 },
    isFirstStep: false,
  };

  it("full Scenario F: Phone Modal → OTP (no createLead) → submit-info", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    // 1. Form submit, no phone → phone modal
    act(() =>
      result.current.onWizardComplete({ leadId: "lead-123", token: "token-456" }),
    );
    expect(result.current.isPhoneModalOpen).toBe(true);

    // 2. User submits phone → OTP shown, createLead NOT called
    act(() => result.current.onPhoneVerify("0987654321"));
    expect(mockCreateLeadMutate).not.toHaveBeenCalled();
    expect(result.current.isOtpModalOpen).toBe(true);
    expect(result.current.isPhoneModalOpen).toBe(false);

    // 3. OTP success → submit-info called
    act(() => result.current.onOtpSuccess("123456"));
    expect(mockSubmitLeadInfoMutate).toHaveBeenCalledWith(
      expect.objectContaining({ leadId: "lead-123" }),
      expect.any(Object),
    );
  });

  it("shows error and does not open OTP when lead identity missing at Step 2+", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(input),
      { wrapper: createWrapper() },
    );

    // No leadId/token in form data — identity resolution fails
    act(() => result.current.onWizardComplete({}));
    act(() => result.current.onPhoneVerify("0987654321"));

    expect(vi.mocked(toast.error)).toHaveBeenCalled();
    expect(result.current.isOtpModalOpen).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OTP retry / close behavior
// ─────────────────────────────────────────────────────────────────────────────

describe("OTP modal: retry and close", () => {
  // Helper: bring hook to isOtpModalOpen=true via Scenario B path
  const openOtp = async (result: any) => {
    const step1WithOtp = {
      ...STEP_1,
      sendOtp: true,
      fields: { phoneNumber: { required: false } },
    };
    // Reconfigure indexStep inline — fixture already wired via renderHook input
    act(() => result.current.onWizardComplete({ phone_number: "0987654321" }));
    act(() => capturedLeadCbs.onSuccess?.(LEAD_RESPONSE));
  };

  const inputWithOtp = {
    ...BASE_INPUT,
    indexStep: { ...STEP_1, sendOtp: true, fields: { phoneNumber: { required: false } } },
    flowData: {
      id: "flow-1",
      steps: [
        { ...STEP_1, sendOtp: true, fields: { phoneNumber: { required: false } } },
        STEP_2,
      ],
    },
  };

  it("OTP failure keeps modal open (retry allowed)", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(inputWithOtp),
      { wrapper: createWrapper() },
    );

    openOtp(result);
    expect(result.current.isOtpModalOpen).toBe(true);

    act(() => result.current.onOtpFailure("Wrong OTP"));

    expect(result.current.isOtpModalOpen).toBe(true);
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Wrong OTP");
  });

  it("OTP expired keeps modal open (resend allowed)", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(inputWithOtp),
      { wrapper: createWrapper() },
    );

    openOtp(result);
    act(() => result.current.onOtpExpired());

    expect(result.current.isOtpModalOpen).toBe(true);
  });

  it("onCloseOtp resets to idle (modal closed)", () => {
    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(inputWithOtp),
      { wrapper: createWrapper() },
    );

    openOtp(result);
    expect(result.current.isOtpModalOpen).toBe(true);

    act(() => result.current.onCloseOtp());
    expect(result.current.isOtpModalOpen).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phone validation
// ─────────────────────────────────────────────────────────────────────────────

describe("Phone validation in onPhoneVerify", () => {
  const inputWithOtp = {
    ...BASE_INPUT,
    indexStep: { ...STEP_1, sendOtp: true, fields: { phoneNumber: { required: true } } },
    flowData: {
      id: "flow-1",
      steps: [
        { ...STEP_1, sendOtp: true, fields: { phoneNumber: { required: true } } },
        STEP_2,
      ],
    },
  };

  it("rejects invalid phone format", () => {
    vi.mocked(phoneValidation).mockReturnValue({ valid: false, telco: "" } as any);

    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(inputWithOtp),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onPhoneVerify("not-a-phone"));

    expect(mockCreateLeadMutate).not.toHaveBeenCalled();
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it("rejects unsupported telco", () => {
    vi.mocked(phoneValidation).mockReturnValue({
      valid: true,
      telco: "UNKNOWN_TELCO",
    } as any);

    const { result } = renderHook(
      () => useDynamicLoanFormOrchestrator(inputWithOtp),
      { wrapper: createWrapper() },
    );

    act(() => result.current.onPhoneVerify("0123456789"));

    expect(mockCreateLeadMutate).not.toHaveBeenCalled();
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });
});
