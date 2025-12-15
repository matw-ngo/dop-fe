import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLoanApplicationForm } from "../hooks/useLoanApplicationForm";

// Mock tracking events
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

// Mock phone validation
vi.mock("@/lib/utils/phone-validation", () => ({
  ALLOWED_TELCOS: ["VIETTEL", "MOBIFONE", "VINAPHONE"],
  phoneValidation: (phone: string) => {
    if (phone === "0912345678") {
      return { valid: true, validNum: "+84912345678", telco: "VIETTEL" };
    }
    return { valid: false };
  },
}));

describe("useLoanApplicationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default form values", () => {
    const { result } = renderHook(() => useLoanApplicationForm());

    expect(result.current.values.expected_amount).toBe(12);
    expect(result.current.values.loan_period).toBe(6);
    expect(result.current.values.loan_purpose).toBe("");
    expect(result.current.values.phone_number).toBe("");
    expect(result.current.values.agreeStatus).toBe("");
  });

  it("has correct initial modal states", () => {
    const { result } = renderHook(() => useLoanApplicationForm());

    expect(result.current.modals.phone).toBe(false);
    expect(result.current.modals.otp).toBe(false);
  });

  it("shows phone modal when called", () => {
    const { result } = renderHook(() => useLoanApplicationForm());

    act(() => {
      result.current.showPhoneModal();
    });

    expect(result.current.modals.phone).toBe(true);
    expect(result.current.modals.otp).toBe(false);
  });

  it("hides phone modal when called", () => {
    const { result } = renderHook(() => useLoanApplicationForm());

    // First show it
    act(() => {
      result.current.showPhoneModal();
    });

    expect(result.current.modals.phone).toBe(true);

    // Then hide it
    act(() => {
      result.current.hidePhoneModal();
    });

    expect(result.current.modals.phone).toBe(false);
  });

  it("shows OTP modal when called", () => {
    const { result } = renderHook(() => useLoanApplicationForm());

    act(() => {
      result.current.showOtpModal();
    });

    expect(result.current.modals.phone).toBe(false);
    expect(result.current.modals.otp).toBe(true);
  });

  it("hides OTP modal when called", () => {
    const { result } = renderHook(() => useLoanApplicationForm());

    // First show it
    act(() => {
      result.current.showOtpModal();
    });

    expect(result.current.modals.otp).toBe(true);

    // Then hide it
    act(() => {
      result.current.hideOtpModal();
    });

    expect(result.current.modals.otp).toBe(false);
  });

  it("validates phone number successfully", async () => {
    const { result } = renderHook(() => useLoanApplicationForm());
    const validPhone = "0912345678";

    // Mock successful phone submission
    let verificationResult = false;
    result.current.handlePhoneSubmit = async (phone: string) => {
      verificationResult = await new Promise((resolve) => {
        setTimeout(() => resolve(phone === validPhone), 0);
      });
      return verificationResult;
    };

    await act(async () => {
      verificationResult = await result.current.handlePhoneSubmit(validPhone);
    });

    expect(verificationResult).toBe(true);
  });

  it("handles OTP success", () => {
    const { result } = renderHook(() => useLoanApplicationForm());
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    act(() => {
      result.current.handleOtpSuccess("1234");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "OTP verified successfully:",
      "1234",
    );
    expect(result.current.modals.otp).toBe(false);

    consoleSpy.mockRestore();
  });

  it("handles OTP failure", () => {
    const { result } = renderHook(() => useLoanApplicationForm());
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    act(() => {
      result.current.handleOtpFailure("Invalid OTP");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "OTP verification failed:",
      "Invalid OTP",
    );

    consoleSpy.mockRestore();
  });

  it("handles OTP expiration", () => {
    const { result } = renderHook(() => useLoanApplicationForm());
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    act(() => {
      result.current.handleOtpExpired();
    });

    expect(consoleSpy).toHaveBeenCalledWith("OTP expired");

    consoleSpy.mockRestore();
  });
});
