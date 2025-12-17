/**
 * eKYC Field Tests
 *
 * Unit tests for the eKYC field component and its integration
 * with the form generation library.
 */

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { FormProvider } from "@/components/form-generation/context/FormContext";
import { EkycField } from "../fields/EkycField";
import type { EkycFieldConfig } from "@/components/form-generation/types";
import {
  VerificationResult,
  VerificationStatus,
} from "@/lib/verification/types";
import { verificationManager } from "@/lib/verification/manager";
import { VNPTVerificationProvider } from "@/lib/verification/providers/vnpt-provider";

// Create mock references that will be assigned after mocking
let mockVerificationManager: any;
let mockVNPTProvider: any;

// Mock verification manager
vi.mock("@/lib/verification/manager", () => ({
  verificationManager: {
    verify: vi.fn(),
    getResult: vi.fn(),
    cancel: vi.fn(),
    getStatus: vi.fn(),
    registerProvider: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock VNPT provider
vi.mock("@/lib/verification/providers/vnpt-provider", () => ({
  VNPTVerificationProvider: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    verify: vi.fn(),
    cancel: vi.fn(),
    getStatus: vi.fn(),
  })),
}));

// Mock FormContext
const mockFormContext = {
  formData: {},
  setFieldValue: vi.fn(),
  errors: {},
  setErrors: vi.fn(),
  touched: {},
  setTouched: vi.fn(),
  validateField: vi.fn(),
  validateForm: vi.fn(),
  resetForm: vi.fn(),
  submitForm: vi.fn(),
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <FormProvider value={mockFormContext}>{component}</FormProvider>,
  );
};

// Helper to render EkycField with required props
const renderEkycField = (
  field: EkycFieldConfig,
  value?: any,
  onChange?: (value: any) => void,
  props?: Partial<{ disabled: boolean; error: string }>,
) => {
  return renderWithProvider(
    <EkycField
      field={field}
      value={value || null}
      onChange={onChange || vi.fn()}
      disabled={props?.disabled}
      error={props?.error}
    />,
  );
};

describe("EkycField", () => {
  beforeEach(() => {
    // Get reference to the mocked manager
    mockVerificationManager = verificationManager;
    vi.clearAllMocks();
    mockVerificationManager.verify.mockResolvedValue({
      id: "test_session",
      status: "processing",
      provider: "vnpt",
      startedAt: new Date().toISOString(),
    } as any);
    mockVerificationManager.getResult.mockResolvedValue(mockVerificationResult);
    mockVerificationManager.getStatus.mockResolvedValue(
      "success" as VerificationStatus,
    );
  });

  const mockField: EkycFieldConfig = {
    id: "ekyc_test",
    name: "ekyc_test",
    type: "ekyc" as any,
    label: "Identity Verification",
    renderMode: "button",
    verification: {
      provider: "vnpt",
      providerOptions: {
        documentType: "CCCD_CHIP",
        flowType: "DOCUMENT_TO_FACE",
        enableLiveness: true,
        enableFaceMatch: true,
      },
      autofillMapping: {
        full_name: "fullName",
        id_number: "idNumber",
        date_of_birth: "dateOfBirth",
      },
      buttonText: "Verify Identity",
      required: false,
      confidenceThreshold: 70,
      showResultPreview: true,
    },
  };

  const mockVerificationResult: VerificationResult = {
    success: true,
    sessionId: "test_session_123",
    provider: {
      name: "vnpt",
      version: "3.2.0",
    },
    personalData: {
      fullName: "NGUYỄN VĂN A",
      dateOfBirth: "1990-01-01",
      gender: "male",
      nationality: "Việt Nam",
      idNumber: "001234567890",
      address: {
        fullAddress: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        city: "TP. Hồ Chí Minh",
        district: "Quận 1",
        ward: "Bến Nghé",
      },
      documentType: "CCCD",
      issuedDate: "2020-01-01",
      expiryDate: "2030-01-01",
      issuedBy: "Công an TP. Hồ Chí Minh",
    },
    verificationData: {
      confidence: 95,
      livenessScore: 98,
      faceMatchScore: 97,
      documentQuality: 92,
      fraudDetection: {
        isAuthentic: true,
        riskScore: 5,
        warnings: [],
        checks: {
          photocopyDetection: true,
          screenDetection: true,
          digitalManipulation: false,
          faceSwapping: false,
        },
      },
      imageQuality: {
        blurScore: 90,
        brightnessScore: 85,
        glareScore: 95,
        sharpnessScore: 88,
      },
    },
    processing: {
      totalDuration: 5000,
      steps: {
        documentUpload: 1500,
        ocrProcessing: 2000,
        faceCapture: 1000,
        livenessCheck: 500,
      },
      retryCount: 0,
    },
    rawData: {
      response: { code: 200, message: "Success" },
    },
    startedAt: "2024-01-01T10:00:00Z",
    completedAt: "2024-01-01T10:00:05Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormContext.formData = {};
    mockFormContext.setFieldValue = vi.fn();
  });

  it("renders verification button when not verified", () => {
    renderEkycField(mockField);

    expect(screen.getByText("Verify Identity")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("shows loading state during verification", async () => {
    mockVerificationManager.verify.mockResolvedValue({
      id: "test_session",
      status: "processing",
      provider: "vnpt",
      startedAt: new Date().toISOString(),
    } as any);

    const mockGetResult = mockVerificationManager.getResult;
    mockGetResult.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockVerificationResult), 100),
        ),
    );

    renderEkycField(mockField);

    const button = screen.getByText("Verify Identity");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Verifying...")).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it("shows success state after successful verification", async () => {
    const mockVerify = mockVerificationManager.verify;
    mockVerify.mockResolvedValue({
      id: "test_session",
      status: "processing",
      provider: "vnpt",
      startedAt: new Date().toISOString(),
    } as any);

    const mockGetResult = mockVerificationManager.getResult;
    mockGetResult.mockResolvedValue(mockVerificationResult);

    renderEkycField(mockField);

    const button = screen.getByText("Verify Identity");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Identity Verified")).toBeInTheDocument();
      expect(screen.getByText("(Confidence: 95%)")).toBeInTheDocument();
    });

    // Check if autofill was triggered
    expect(mockFormContext.setFieldValue).toHaveBeenCalledWith(
      "full_name",
      "NGUYỄN VĂN A",
    );
    expect(mockFormContext.setFieldValue).toHaveBeenCalledWith(
      "id_number",
      "001234567890",
    );
    expect(mockFormContext.setFieldValue).toHaveBeenCalledWith(
      "date_of_birth",
      "1990-01-01",
    );
  });

  it("shows error state on verification failure", async () => {
    const mockVerify = mockVerificationManager.verify;
    mockVerify.mockRejectedValue(new Error("Network error"));

    renderEkycField(mockField);

    const button = screen.getByText("Verify Identity");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  it("shows low confidence warning", async () => {
    const mockVerify = mockVerificationManager.verify;
    mockVerify.mockResolvedValue({
      id: "test_session",
      status: "processing",
      provider: "vnpt",
      startedAt: new Date().toISOString(),
    } as any);

    const lowConfidenceResult = {
      ...mockVerificationResult,
      verificationData: {
        ...mockVerificationResult.verificationData,
        confidence: 60, // Below threshold of 70
      },
    };

    const mockGetResult = mockVerificationManager.getResult;
    mockGetResult.mockResolvedValue(lowConfidenceResult);

    renderEkycField(mockField);

    const button = screen.getByText("Verify Identity");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Low confidence score: 60%/)).toBeInTheDocument();
    });
  });

  it("disables verification when disabled prop is true", () => {
    const disabledField = {
      ...mockField,
    };

    renderEkycField(disabledField, null, vi.fn(), { disabled: true });

    const button = screen.getByRole("button", { name: "Verify Identity" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "bg-gray-300",
      "text-gray-500",
      "cursor-not-allowed",
    );
  });

  it("calls onVerified callback when verification succeeds", async () => {
    const onVerified = vi.fn();
    const fieldWithCallback = {
      ...mockField,
      verification: {
        ...mockField.verification!,
        onVerified,
      },
    };

    const mockVerify = mockVerificationManager.verify;
    mockVerify.mockResolvedValue({
      id: "test_session",
      status: "processing",
      provider: "vnpt",
      startedAt: new Date().toISOString(),
    } as any);

    const mockGetResult = mockVerificationManager.getResult;
    mockGetResult.mockResolvedValue(mockVerificationResult);

    renderEkycField(fieldWithCallback);

    const button = screen.getByText("Verify Identity");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onVerified).toHaveBeenCalledWith(mockVerificationResult);
    });
  });

  it("calls onError callback when verification fails", async () => {
    const onError = vi.fn();
    const fieldWithErrorCallback = {
      ...mockField,
      verification: {
        ...mockField.verification!,
        onError,
      },
    };

    const mockVerify = mockVerificationManager.verify;
    mockVerify.mockRejectedValue(new Error("API Error"));

    renderEkycField(fieldWithErrorCallback);

    const button = screen.getByText("Verify Identity");
    fireEvent.click(button);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it("initializes VNPT provider on mount", async () => {
    renderEkycField(mockField);

    await waitFor(() => {
      expect(verificationManager.registerProvider).toHaveBeenCalledWith(
        "vnpt",
        expect.any(Object), // Since VNPTVerificationProvider is mocked, expect any object
        expect.objectContaining({
          environment: "production",
          language: "vi",
        }),
        true,
      );
    });
  });

  describe("render modes", () => {
    it("renders inline mode correctly", () => {
      const inlineField = {
        ...mockField,
        renderMode: "inline" as const,
      };

      renderEkycField(inlineField);

      expect(screen.getByText("Verify Your Identity")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Quick and secure verification using your ID document",
        ),
      ).toBeInTheDocument();
    });

    it("renders modal mode correctly", async () => {
      const modalField = {
        ...mockField,
        renderMode: "modal" as const,
        verification: {
          ...mockField.verification!,
          modalConfig: {
            title: "Custom Verification Title",
            size: "lg" as const,
          },
        },
      };

      renderEkycField(modalField);

      // Initially shows button
      expect(screen.getByText("Verify Identity")).toBeInTheDocument();

      // Click to open modal with act
      const button = screen.getByText("Verify Identity");

      await act(async () => {
        fireEvent.click(button);
      });

      // Should show modal content - look for the custom title we set
      await waitFor(() => {
        expect(
          screen.getByText("Custom Verification Title"),
        ).toBeInTheDocument();
      });
    });

    it("renders custom mode with custom render function", () => {
      const customField = {
        ...mockField,
        renderMode: "custom" as const,
        customRender: ({
          startVerification,
          isVerifying,
        }: {
          startVerification: any;
          isVerifying: any;
        }) => (
          <div data-testid="custom-ekyc">
            <button onClick={startVerification} disabled={isVerifying}>
              Custom Verify
            </button>
            {isVerifying && <span>Custom Loading...</span>}
          </div>
        ),
      };

      renderEkycField(customField);

      expect(screen.getByTestId("custom-ekyc")).toBeInTheDocument();
      expect(screen.getByText("Custom Verify")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has proper ARIA labels", () => {
      renderEkycField(mockField);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("announces verification status to screen readers", async () => {
      const mockVerify = mockVerificationManager.verify;
      mockVerify.mockResolvedValue({
        id: "test_session",
        status: "processing",
        provider: "vnpt",
        startedAt: new Date().toISOString(),
      } as any);

      const mockGetResult = mockVerificationManager.getResult;
      mockGetResult.mockResolvedValue(mockVerificationResult);

      renderEkycField(mockField);

      const button = screen.getByText("Verify Identity");
      fireEvent.click(button);

      // Check for loading announcement
      await waitFor(() => {
        expect(screen.getByRole("status")).toBeInTheDocument();
      });
    });
  });

  describe("autofill mapping", () => {
    it("handles nested path mapping", async () => {
      const fieldWithNestedMapping = {
        ...mockField,
        verification: {
          ...mockField.verification!,
          autofillMapping: {
            city: "address.city",
            district: "address.district",
          },
        },
      };

      const mockVerify = mockVerificationManager.verify;
      mockVerify.mockResolvedValue({
        id: "test_session",
        status: "processing",
        provider: "vnpt",
        startedAt: new Date().toISOString(),
      } as any);

      const mockGetResult = mockVerificationManager.getResult;
      mockGetResult.mockResolvedValue(mockVerificationResult);

      renderEkycField(fieldWithNestedMapping);

      const button = screen.getByText("Verify Identity");
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockFormContext.setFieldValue).toHaveBeenCalledWith(
          "city",
          "TP. Hồ Chí Minh",
        );
        expect(mockFormContext.setFieldValue).toHaveBeenCalledWith(
          "district",
          "Quận 1",
        );
      });
    });
  });
});
