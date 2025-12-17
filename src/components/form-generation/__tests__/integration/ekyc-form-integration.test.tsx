/**
 * eKYC Form Integration Tests
 *
 * This test suite covers the integration between eKYC verification and form system:
 * - Full verification flow from button click to form submission
 * - Multiple eKYC fields in single form
 * - Validation after eKYC autofill
 * - Form submission with eKYC data
 * - Error recovery and retry flows
 * - Cross-component data flow
 * - Form state management with eKYC
 */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DynamicForm, FormProvider } from "../../index";
import type { DynamicFormConfig, EkycFieldConfig } from "../../types";
import { FieldType } from "../../types";

// Mock the verification manager and provider
const mockVerificationResult = {
  success: true,
  sessionId: "test-session-123",
  provider: {
    name: "vnpt",
    version: "3.2.0",
  },
  personalData: {
    fullName: "NGUYEN VAN A",
    dateOfBirth: "1990-01-15",
    gender: "male" as const,
    nationality: "Việt Nam",
    idNumber: "001234567890",
    address: {
      fullAddress: "123 Đường ABC, Quận 1, TP.HCM",
      city: "TP.HCM",
      district: "Quận 1",
      ward: "Phường Bến Thành",
      street: "123 Đường ABC",
    },
    documentType: "CCCD",
    issuedDate: "2020-01-01",
    expiryDate: "2030-01-01",
    issuedBy: "Công an TP.HCM",
  },
  verificationData: {
    confidence: 95,
    livenessScore: 90,
    faceMatchScore: 92,
    documentQuality: 88,
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
  },
  processing: {
    totalDuration: 1500,
    steps: {
      documentUpload: 450,
      ocrProcessing: 450,
      faceCapture: 300,
      livenessCheck: 150,
      faceComparison: 150,
    },
    retryCount: 0,
  },
  startedAt: "2024-01-15T10:00:00.000Z",
  completedAt: "2024-01-15T10:00:01.500Z",
};

const mockVerificationManager = {
  registerProvider: vi.fn().mockResolvedValue(undefined),
  verify: vi.fn().mockResolvedValue({
    id: "test-session-123",
    status: "processing",
    provider: "vnpt",
    startedAt: new Date().toISOString(),
  }),
  getResult: vi.fn().mockResolvedValue(mockVerificationResult),
  cancel: vi.fn().mockResolvedValue(undefined),
  getStatus: vi.fn().mockResolvedValue("processing"),
  healthCheck: vi.fn().mockResolvedValue(true),
  getActiveSessions: vi.fn().mockReturnValue(new Map()),
  cleanupExpiredSessions: vi.fn(),
  getStats: vi.fn().mockReturnValue({
    totalAttempts: 1,
    successfulVerifications: 1,
    failedVerifications: 0,
    averageProcessingTime: 1500,
    successRateByDocument: { CCCD: 100 },
    commonErrors: [],
    providerPerformance: {
      vnpt: { averageTime: 1500, successRate: 100, errorRate: 0 },
    },
  }),
  resetStats: vi.fn(),
  cleanup: vi.fn(),
};

vi.mock("@/lib/verification/manager", () => ({
  verificationManager: mockVerificationManager,
}));

vi.mock("@/lib/verification/providers/vnpt-provider", () => ({
  VNPTVerificationProvider: vi.fn().mockImplementation(() => ({
    name: "vnpt",
    version: "3.2.0",
    initialize: vi.fn().mockResolvedValue(undefined),
    startVerification: vi.fn().mockResolvedValue({
      id: "test-session-123",
      status: "processing",
      provider: "vnpt",
      startedAt: new Date().toISOString(),
    }),
    getResult: vi.fn().mockResolvedValue(mockVerificationResult),
    getStatus: vi.fn().mockResolvedValue("processing"),
    cancel: vi.fn().mockResolvedValue(undefined),
    cleanup: vi.fn().mockResolvedValue(undefined),
    healthCheck: vi.fn().mockResolvedValue(true),
    capabilities: {
      supportedDocuments: ["CCCD", "PASSPORT"],
      supportedFlows: ["DOCUMENT_TO_FACE"],
      hasLivenessDetection: true,
      hasFaceComparison: true,
      hasAuthenticityCheck: true,
    },
  })),
}));

describe("eKYC Form Integration", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete Verification Flow", () => {
    it("should handle full verification flow with autofill", async () => {
      const onVerifiedCallback = vi.fn();
      const onErrorCallback = vi.fn();

      const formConfig: DynamicFormConfig = {
        id: "test-ekyc-form",
        title: "Test eKYC Form",
        fields: [
          {
            id: "identity_verification",
            name: "identity_verification",
            type: FieldType.EKYC,
            label: "Xác thực danh tính",
            verification: {
              provider: "vnpt",
              providerOptions: {
                documentType: "CCCD",
                flowType: "DOCUMENT_TO_FACE",
                enableLiveness: true,
                enableFaceMatch: true,
              },
              autofillMapping: {
                full_name: "fullName",
                date_of_birth: "dateOfBirth",
                national_id: "idNumber",
                address: "address.fullAddress",
                city: "address.city",
                district: "address.district",
              },
              onVerified: onVerifiedCallback,
              onError: onErrorCallback,
              buttonText: "Xác thực ngay",
            },
          },
          {
            id: "full_name",
            name: "full_name",
            type: FieldType.TEXT,
            label: "Họ và tên",
            required: true,
          },
          {
            id: "date_of_birth",
            name: "date_of_birth",
            type: FieldType.DATE,
            label: "Ngày sinh",
            required: true,
          },
          {
            id: "national_id",
            name: "national_id",
            type: FieldType.TEXT,
            label: "Số CCCD",
            required: true,
          },
          {
            id: "address",
            name: "address",
            type: FieldType.TEXT,
            label: "Địa chỉ",
            required: true,
          },
        ],
        submitButton: {
          text: "Gửi form",
        },
      };

      const onSubmit = vi.fn();

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={onSubmit} />
        </FormProvider>,
      );

      // Initially, verification button should be visible
      const verifyButton = screen.getByText("Xác thực ngay");
      expect(verifyButton).toBeInTheDocument();

      // Form fields should be empty initially
      expect(screen.getByLabelText("Họ và tên")).toHaveValue("");
      expect(screen.getByLabelText("Số CCCD")).toHaveValue("");
      expect(screen.getByLabelText("Địa chỉ")).toHaveValue("");

      // Click verification button
      await user.click(verifyButton);

      // Mock loading state
      expect(screen.getByText("Đang xác thực...")).toBeInTheDocument();

      // Wait for verification to complete
      await waitFor(() => {
        expect(onVerifiedCallback).toHaveBeenCalledWith(mockVerificationResult);
      });

      // Check that form fields are auto-filled
      await waitFor(() => {
        expect(screen.getByLabelText("Họ và tên")).toHaveValue("NGUYEN VAN A");
        expect(screen.getByLabelText("Số CCCD")).toHaveValue("001234567890");
        expect(screen.getByLabelText("Địa chỉ")).toHaveValue(
          "123 Đường ABC, Quận 1, TP.HCM",
        );
      });

      // Date field should be formatted correctly
      expect(screen.getByLabelText("Ngày sinh")).toHaveValue("1990-01-15");

      // Should show verification success indicator
      expect(screen.getByText(/Xác thực thành công/i)).toBeInTheDocument();

      // Submit form with eKYC data
      const submitButton = screen.getByText("Gửi form");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            identity_verification: {
              verified: true,
              sessionId: "test-session-123",
              confidence: 95,
              verifiedAt: "2024-01-15T10:00:01.500Z",
            },
            full_name: "NGUYEN VAN A",
            date_of_birth: "1990-01-15",
            national_id: "001234567890",
            address: "123 Đường ABC, Quận 1, TP.HCM",
          }),
          expect.any(Object),
        );
      });
    });

    it("should handle verification error gracefully", async () => {
      const onErrorCallback = vi.fn();

      // Mock verification failure
      mockVerificationManager.verify.mockRejectedValueOnce(
        new Error("Verification failed"),
      );

      const formConfig: DynamicFormConfig = {
        id: "test-error-form",
        fields: [
          {
            id: "identity_verification",
            name: "identity_verification",
            type: FieldType.EKYC,
            label: "Xác thực danh tính",
            verification: {
              provider: "vnpt",
              autofillMapping: {},
              onError: onErrorCallback,
              buttonText: "Xác thực",
            },
          },
        ],
      };

      const onSubmit = vi.fn();

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={onSubmit} />
        </FormProvider>,
      );

      const verifyButton = screen.getByText("Xác thực");
      await user.click(verifyButton);

      await waitFor(() => {
        expect(onErrorCallback).toHaveBeenCalledWith(expect.any(Error));
      });

      // Should show error message
      expect(screen.getByText(/Verification failed/i)).toBeInTheDocument();

      // Should show retry button
      expect(screen.getByText("Thử lại")).toBeInTheDocument();
    });

    it("should handle low confidence score warning", async () => {
      const lowConfidenceResult = {
        ...mockVerificationResult,
        verificationData: {
          ...mockVerificationResult.verificationData,
          confidence: 65, // Below default threshold of 70
        },
      };

      mockVerificationManager.getResult.mockResolvedValueOnce(
        lowConfidenceResult,
      );

      const formConfig: DynamicFormConfig = {
        id: "test-low-confidence-form",
        fields: [
          {
            id: "identity_verification",
            name: "identity_verification",
            type: FieldType.EKYC,
            label: "Xác thực danh tính",
            verification: {
              provider: "vnpt",
              autofillMapping: {},
              confidenceThreshold: 70,
            },
          },
        ],
      };

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={vi.fn()} />
        </FormProvider>,
      );

      const verifyButton = screen.getByText("Xác thực danh tính");
      await user.click(verifyButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Low confidence score: 65%/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Multiple eKYC Fields", () => {
    it("should handle multiple eKYC fields in single form", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-multiple-ekyc",
        fields: [
          {
            id: "primary_verification",
            name: "primary_verification",
            type: FieldType.EKYC,
            label: "Xác thực chính",
            verification: {
              provider: "vnpt",
              providerOptions: { documentType: "CCCD" },
              autofillMapping: {
                primary_id: "idNumber",
                primary_name: "fullName",
              },
            },
          },
          {
            id: "secondary_verification",
            name: "secondary_verification",
            type: FieldType.EKYC,
            label: "Xác thực phụ",
            verification: {
              provider: "vnpt",
              providerOptions: { documentType: "PASSPORT" },
              autofillMapping: {
                secondary_id: "idNumber",
                secondary_name: "fullName",
              },
            },
          },
          {
            id: "primary_id",
            name: "primary_id",
            type: FieldType.TEXT,
            label: "ID chính",
          },
          {
            id: "primary_name",
            name: "primary_name",
            type: FieldType.TEXT,
            label: "Tên chính",
          },
          {
            id: "secondary_id",
            name: "secondary_id",
            type: FieldType.TEXT,
            label: "ID phụ",
          },
          {
            id: "secondary_name",
            name: "secondary_name",
            type: FieldType.TEXT,
            label: "Tên phụ",
          },
        ],
      };

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={vi.fn()} />
        </FormProvider>,
      );

      // Should have two verification buttons
      expect(screen.getByText("Xác thực chính")).toBeInTheDocument();
      expect(screen.getByText("Xác thực phụ")).toBeInTheDocument();

      // Complete primary verification
      await user.click(screen.getByText("Xác thực chính"));
      await waitFor(() => {
        expect(screen.getByLabelText("ID chính")).toHaveValue("001234567890");
        expect(screen.getByLabelText("Tên chính")).toHaveValue("NGUYEN VAN A");
      });

      // Complete secondary verification
      await user.click(screen.getByText("Xác thực phụ"));
      await waitFor(() => {
        expect(screen.getByLabelText("ID phụ")).toHaveValue("001234567890");
        expect(screen.getByLabelText("Tên phụ")).toHaveValue("NGUYEN VAN A");
      });
    });

    it("should not interfere with other fields during verification", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-non-interference",
        fields: [
          {
            id: "ekyc_field",
            name: "ekyc_field",
            type: FieldType.EKYC,
            label: "eKYC",
            verification: {
              provider: "vnpt",
              autofillMapping: {
                auto_field: "fullName",
              },
            },
          },
          {
            id: "manual_field",
            name: "manual_field",
            type: FieldType.TEXT,
            label: "Manual Entry",
          },
          {
            id: "auto_field",
            name: "auto_field",
            type: FieldType.TEXT,
            label: "Auto Field",
          },
        ],
      };

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={vi.fn()} />
        </FormProvider>,
      );

      // Enter manual data before eKYC
      const manualField = screen.getByLabelText("Manual Entry");
      await user.type(manualField, "Manual input");

      // Perform eKYC verification
      await user.click(screen.getByText("Xác thực danh tính"));

      await waitFor(() => {
        expect(screen.getByLabelText("Auto Field")).toHaveValue("NGUYEN VAN A");
      });

      // Manual field should retain its value
      expect(screen.getByLabelText("Manual Entry")).toHaveValue("Manual input");
    });
  });

  describe("Form Validation with eKYC", () => {
    it("should validate required fields after autofill", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-validation",
        fields: [
          {
            id: "ekyc_verification",
            name: "ekyc_verification",
            type: FieldType.EKYC,
            label: "eKYC Verification",
            verification: {
              provider: "vnpt",
              autofillMapping: {
                required_field: "idNumber",
              },
            },
          },
          {
            id: "required_field",
            name: "required_field",
            type: FieldType.TEXT,
            label: "Required Field",
            required: true,
            validation: {
              minLength: 9,
              maxLength: 12,
              pattern: "^[0-9]+$",
              message: "ID phải là số từ 9-12 ký tự",
            },
          },
        ],
      };

      const onSubmit = vi.fn();

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={onSubmit} />
        </FormProvider>,
      );

      // Try to submit without verification
      const submitButton = screen.getByRole("button", { name: /Submit/i });
      await user.click(submitButton);

      // Should show validation error
      expect(
        screen.getByText(/ID phải là số từ 9-12 ký tự/i),
      ).toBeInTheDocument();

      // Complete eKYC verification
      await user.click(screen.getByText("eKYC Verification"));
      await waitFor(() => {
        expect(screen.getByLabelText("Required Field")).toHaveValue(
          "001234567890",
        );
      });

      // Should now be able to submit without errors
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        expect(
          screen.queryByText(/ID phải là số từ 9-12 ký tự/i),
        ).not.toBeInTheDocument();
      });
    });

    it("should respect read-only fields after eKYC", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-readonly",
        fields: [
          {
            id: "ekyc_field",
            name: "ekyc_field",
            type: FieldType.EKYC,
            label: "eKYC",
            verification: {
              provider: "vnpt",
              autofillMapping: {
                readonly_field: "fullName",
              },
            },
          },
          {
            id: "readonly_field",
            name: "readonly_field",
            type: FieldType.TEXT,
            label: "Readonly Field",
            readOnly: true,
          },
        ],
      };

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={vi.fn()} />
        </FormProvider>,
      );

      // Field should be read-only from the start
      const readonlyField = screen.getByLabelText("Readonly Field");
      expect(readonlyField).toBeDisabled();

      // After eKYC, field should be filled but still read-only
      await user.click(screen.getByText("eKYC"));
      await waitFor(() => {
        expect(readonlyField).toHaveValue("NGUYEN VAN A");
      });
      expect(readonlyField).toBeDisabled();
    });
  });

  describe("Form Submission with eKYC Data", () => {
    it("should include eKYC verification data in submission", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-submission-data",
        fields: [
          {
            id: "ekyc_verification",
            name: "ekyc_verification",
            type: FieldType.EKYC,
            label: "eKYC",
            verification: {
              provider: "vnpt",
              required: true,
              autofillMapping: {
                name: "fullName",
              },
            },
          },
          {
            id: "name",
            name: "name",
            type: FieldType.TEXT,
            label: "Name",
          },
        ],
      };

      const onSubmit = vi.fn();

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={onSubmit} />
        </FormProvider>,
      );

      // Complete eKYC verification
      await user.click(screen.getByText("eKYC"));
      await waitFor(() => {
        expect(screen.getByLabelText("Name")).toHaveValue("NGUYEN VAN A");
      });

      // Submit form
      await user.click(screen.getByRole("button", { name: /Submit/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            ekyc_verification: {
              verified: true,
              sessionId: "test-session-123",
              confidence: 95,
              verifiedAt: "2024-01-15T10:00:01.500Z",
            },
            name: "NGUYEN VAN A",
          }),
          expect.any(Object),
        );
      });
    });

    it("should prevent submission when required eKYC not completed", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-required-ekyc",
        fields: [
          {
            id: "ekyc_verification",
            name: "ekyc_verification",
            type: FieldType.EKYC,
            label: "Required eKYC",
            verification: {
              provider: "vnpt",
              required: true,
            },
          },
        ],
      };

      const onSubmit = vi.fn();

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={onSubmit} />
        </FormProvider>,
      );

      // Try to submit without completing eKYC
      const submitButton = screen.getByRole("button", { name: /Submit/i });
      await user.click(submitButton);

      // Should not submit and show error
      await waitFor(() => {
        expect(onSubmit).not.toHaveBeenCalled();
        expect(
          screen.getByText(/Xác thực danh tính là bắt buộc/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Error Recovery and Retry Flows", () => {
    it("should allow retry after verification failure", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-retry",
        fields: [
          {
            id: "ekyc_verification",
            name: "ekyc_verification",
            type: FieldType.EKYC,
            label: "eKYC",
            verification: {
              provider: "vnpt",
              autofillMapping: {},
              uiConfig: {
                allowRetry: true,
                maxRetries: 3,
              },
            },
          },
        ],
      };

      // Mock failure on first attempt, success on retry
      mockVerificationManager.verify
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          id: "retry-session-456",
          status: "processing",
          provider: "vnpt",
          startedAt: new Date().toISOString(),
        });

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={vi.fn()} />
        </FormProvider>,
      );

      // First attempt fails
      await user.click(screen.getByText("eKYC"));
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        expect(screen.getByText("Thử lại")).toBeInTheDocument();
      });

      // Retry should work
      await user.click(screen.getByText("Thử lại"));
      await waitFor(() => {
        expect(mockVerificationManager.verify).toHaveBeenCalledTimes(2);
      });
    });

    it("should enforce maximum retry limit", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-retry-limit",
        fields: [
          {
            id: "ekyc_verification",
            name: "ekyc_verification",
            type: FieldType.EKYC,
            label: "eKYC",
            verification: {
              provider: "vnpt",
              autofillMapping: {},
              uiConfig: {
                allowRetry: true,
                maxRetries: 2,
              },
            },
          },
        ],
      };

      // Mock all attempts to fail
      mockVerificationManager.verify.mockRejectedValue(
        new Error("Always fails"),
      );

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={vi.fn()} />
        </FormProvider>,
      );

      // Initial attempt + max retries
      for (let i = 0; i < 3; i++) {
        if (i > 0) {
          await user.click(screen.getByText("Thử lại"));
        } else {
          await user.click(screen.getByText("eKYC"));
        }

        if (i < 2) {
          await waitFor(() => {
            expect(screen.getByText("Thử lại")).toBeInTheDocument();
          });
        }
      }

      // After max retries, should not show retry button
      await waitFor(() => {
        expect(screen.queryByText("Thử lại")).not.toBeInTheDocument();
        expect(
          screen.getByText(/Đã đạt số lần thử lại tối đa/i),
        ).toBeInTheDocument();
      });
    });

    it("should handle cancellation during verification", async () => {
      const formConfig: DynamicFormConfig = {
        id: "test-cancellation",
        fields: [
          {
            id: "ekyc_verification",
            name: "ekyc_verification",
            type: FieldType.EKYC,
            label: "eKYC",
            verification: {
              provider: "vnpt",
              autofillMapping: {},
            },
          },
        ],
      };

      render(
        <FormProvider>
          <DynamicForm config={formConfig} onSubmit={vi.fn()} />
        </FormProvider>,
      );

      // Start verification
      await user.click(screen.getByText("eKYC"));

      // Cancel verification
      await user.click(screen.getByText("Hủy"));

      await waitFor(() => {
        expect(mockVerificationManager.cancel).toHaveBeenCalledWith(
          "test-session-123",
        );
      });
    });
  });

  describe("Cross-Component Data Flow", () => {
    it("should maintain form context across eKYC operations", async () => {
      const TestComponent = () => {
        const [formState, setFormState] = useState({});

        const formConfig: DynamicFormConfig = {
          id: "test-context",
          fields: [
            {
              id: "ekyc_field",
              name: "ekyc_field",
              type: FieldType.EKYC,
              label: "eKYC",
              verification: {
                provider: "vnpt",
                autofillMapping: {
                  context_field: "fullName",
                },
              },
            },
            {
              id: "context_field",
              name: "context_field",
              type: FieldType.TEXT,
              label: "Context Field",
            },
          ],
        };

        return (
          <div>
            <div data-testid="form-state">{JSON.stringify(formState)}</div>
            <FormProvider>
              <DynamicForm
                config={formConfig}
                onSubmit={(data) => setFormState(data)}
                onFieldChange={(fieldId, value) => {
                  setFormState((prev) => ({ ...prev, [fieldId]: value }));
                }}
              />
            </FormProvider>
          </div>
        );
      };

      render(<TestComponent />);

      // Complete eKYC verification
      await user.click(screen.getByText("eKYC"));
      await waitFor(() => {
        expect(screen.getByLabelText("Context Field")).toHaveValue(
          "NGUYEN VAN A",
        );
      });

      // Check that form state includes eKYC data
      await waitFor(() => {
        const formStateElement = screen.getByTestId("form-state");
        const state = JSON.parse(formStateElement.textContent || "{}");
        expect(state.ekyc_field).toBeDefined();
        expect(state.context_field).toBe("NGUYEN VAN A");
      });
    });

    it("should handle form reset after eKYC verification", async () => {
      const TestComponent = () => {
        const [key, setKey] = useState(0);

        const formConfig: DynamicFormConfig = {
          id: "test-reset",
          fields: [
            {
              id: "ekyc_field",
              name: "ekyc_field",
              type: FieldType.EKYC,
              label: "eKYC",
              verification: {
                provider: "vnpt",
                autofillMapping: {
                  reset_field: "fullName",
                },
              },
            },
            {
              id: "reset_field",
              name: "reset_field",
              type: FieldType.TEXT,
              label: "Reset Field",
            },
          ],
        };

        return (
          <div>
            <button onClick={() => setKey((prev) => prev + 1)}>
              Reset Form
            </button>
            <FormProvider key={key}>
              <DynamicForm config={formConfig} onSubmit={vi.fn()} />
            </FormProvider>
          </div>
        );
      };

      render(<TestComponent />);

      // Complete eKYC verification
      await user.click(screen.getByText("eKYC"));
      await waitFor(() => {
        expect(screen.getByLabelText("Reset Field")).toHaveValue(
          "NGUYEN VAN A",
        );
      });

      // Reset form
      await user.click(screen.getByText("Reset Form"));

      // Form should be reset
      await waitFor(() => {
        expect(screen.getByLabelText("Reset Field")).toHaveValue("");
        expect(screen.getByText("eKYC")).toBeInTheDocument();
      });
    });
  });
});
