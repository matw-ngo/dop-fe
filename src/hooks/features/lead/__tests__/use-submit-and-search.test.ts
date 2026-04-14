/**
 * useSubmitAndSearch Hook Tests
 *
 * Tests the lead submission hook that submits lead info and tracks forwarding status.
 * This hook integrates with useLoanSearchStore to update forward status and results.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dopClient } from "@/lib/api/services/dop";
import { useSubmitAndSearch } from "../use-submit-and-search";
import type { components } from "@/lib/api/v1/dop";

type SubmitLeadInfoResponseBody =
  components["schemas"]["SubmitLeadInfoResponseBody"];
type ForwardResult = components["schemas"]["ForwardResult"];

// Mock dopClient
vi.mock("@/lib/api/services/dop", () => ({
  dopClient: {
    POST: vi.fn(),
  },
}));

// Create mock store functions
const mockSetResult = vi.fn();
const mockSetForwardStatus = vi.fn();
const mockSetError = vi.fn();

// Mock the store module
vi.mock("@/store/use-loan-search-store", () => ({
  useLoanSearchStore: vi.fn(() => ({
    setResult: mockSetResult,
    setForwardStatus: mockSetForwardStatus,
    setError: mockSetError,
  })),
}));

describe("useSubmitAndSearch", () => {
  let queryClient: QueryClient;
  let mockPost: ReturnType<typeof vi.fn>;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPost = vi.mocked(dopClient.POST);
  });

  describe("Successful submission with forward_result", () => {
    it("submits lead info and updates store with forward_result", async () => {
      const mockForwardResult: ForwardResult = {
        status: "forwarded",
        partner_name: "Test Bank",
        partner_id: "partner-123",
      };

      const mockResponse: SubmitLeadInfoResponseBody = {
        forward_result: mockForwardResult,
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-123",
          flowId: "flow-456",
          stepId: "step-789",
          formData: {
            phone_number: "+1234567890",
            loan_amount: 50000,
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(mockSetResult).toHaveBeenCalledWith(mockForwardResult);
      expect(mockSetForwardStatus).toHaveBeenCalledWith("forwarded");
    });

    it("handles forward_result with rejected status", async () => {
      const mockForwardResult: ForwardResult = {
        status: "rejected",
        partner_name: "Test Bank",
        partner_id: "partner-456",
      };

      const mockResponse: SubmitLeadInfoResponseBody = {
        forward_result: mockForwardResult,
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-456",
          flowId: "flow-789",
          stepId: "step-012",
          formData: {
            phone_number: "+9876543210",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockSetResult).toHaveBeenCalledWith(mockForwardResult);
      expect(mockSetForwardStatus).toHaveBeenCalledWith("rejected");
    });

    it("handles forward_result with exhausted status", async () => {
      const mockForwardResult: ForwardResult = {
        status: "exhausted",
        partner_name: "Test Bank",
        partner_id: "partner-789",
      };

      const mockResponse: SubmitLeadInfoResponseBody = {
        forward_result: mockForwardResult,
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-789",
          flowId: "flow-012",
          stepId: "step-345",
          formData: {
            phone_number: "+1111111111",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockSetForwardStatus).toHaveBeenCalledWith("exhausted");
    });
  });

  describe("Successful submission without forward_result", () => {
    it("sets forward status to 'forwarded' when no forward_result in response", async () => {
      const mockResponse: SubmitLeadInfoResponseBody = {
        // No forward_result field
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-no-forward",
          flowId: "flow-no-forward",
          stepId: "step-no-forward",
          formData: {
            phone_number: "+2222222222",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockSetForwardStatus).toHaveBeenCalledWith("forwarded");
      expect(mockSetResult).not.toHaveBeenCalled();
    });
  });

  describe("Request body structure", () => {
    it("correctly transforms params to API request body format", async () => {
      const mockResponse: SubmitLeadInfoResponseBody = {};

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-transform",
          flowId: "flow-transform",
          stepId: "step-transform",
          formData: {
            phone_number: "+3333333333",
            loan_amount: 100000,
            employment_status: "employed",
          },
          token: "token-abc-123",
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPost).toHaveBeenCalledWith("/leads/{id}/submit-info", {
        params: {
          path: { id: "lead-transform" },
        },
        body: {
          flow_id: "flow-transform",
          step_id: "step-transform",
          phone_number: "+3333333333",
          loan_amount: 100000,
          employment_status: "employed",
        },
      });
    });

    it("includes phone_number from formData in request body", async () => {
      const mockResponse: SubmitLeadInfoResponseBody = {};

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-phone",
          flowId: "flow-phone",
          stepId: "step-phone",
          formData: {
            phone_number: "+4444444444",
            other_field: "value",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPost).toHaveBeenCalledWith("/leads/{id}/submit-info", {
        params: {
          path: { id: "lead-phone" },
        },
        body: expect.objectContaining({
          phone_number: "+4444444444",
          other_field: "value",
        }),
      });
    });

    it("spreads all formData fields into request body", async () => {
      const mockResponse: SubmitLeadInfoResponseBody = {};

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      const formData = {
        phone_number: "+5555555555",
        loan_amount: 75000,
        employment_status: "self-employed",
        monthly_income: 5000,
        purpose: "home_renovation",
      };

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-spread",
          flowId: "flow-spread",
          stepId: "step-spread",
          formData,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPost).toHaveBeenCalledWith("/leads/{id}/submit-info", {
        params: {
          path: { id: "lead-spread" },
        },
        body: {
          flow_id: "flow-spread",
          step_id: "step-spread",
          ...formData,
        },
      });
    });
  });

  describe("Error handling", () => {
    it("handles API error response and updates store error state", async () => {
      const mockError = {
        message: "Validation failed: phone_number is required",
      };

      mockPost.mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-error",
          flowId: "flow-error",
          stepId: "step-error",
          formData: {},
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "Validation failed: phone_number is required",
      );
      expect(mockSetError).toHaveBeenCalledWith(
        "Validation failed: phone_number is required",
      );
    });

    it("handles API error without message", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: {},
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-error-no-msg",
          flowId: "flow-error-no-msg",
          stepId: "step-error-no-msg",
          formData: {
            phone_number: "+6666666666",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Failed to submit lead info");
      expect(mockSetError).toHaveBeenCalledWith("Failed to submit lead info");
    });

    it("handles no data returned from API", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-no-data",
          flowId: "flow-no-data",
          stepId: "step-no-data",
          formData: {
            phone_number: "+7777777777",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "No data returned from submit lead info API",
      );
      expect(mockSetError).toHaveBeenCalledWith(
        "No data returned from submit lead info API",
      );
    });

    it("handles network errors", async () => {
      const networkError = new Error("Network request failed");
      mockPost.mockRejectedValue(networkError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-network-error",
          flowId: "flow-network-error",
          stepId: "step-network-error",
          formData: {
            phone_number: "+8888888888",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(networkError);
      expect(mockSetError).toHaveBeenCalledWith("Network request failed");
    });
  });

  describe("React Query mutation states", () => {
    it("transitions through pending -> success states", async () => {
      const mockResponse: SubmitLeadInfoResponseBody = {
        forward_result: {
          status: "forwarded",
          partner_name: "Test Bank",
          partner_id: "partner-state",
        },
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-states",
          flowId: "flow-states",
          stepId: "step-states",
          formData: {
            phone_number: "+9999999999",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
    });

    it("transitions through pending -> error states", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: { message: "Server error" },
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      expect(result.current.isPending).toBe(false);

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-error-states",
          flowId: "flow-error-states",
          stepId: "step-error-states",
          formData: {
            phone_number: "+1010101010",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("Store integration", () => {
    it("does not update store result/status on error", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: { message: "API error" },
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-store-error",
          flowId: "flow-store-error",
          stepId: "step-store-error",
          formData: {
            phone_number: "+1212121212",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(mockSetResult).not.toHaveBeenCalled();
      expect(mockSetForwardStatus).not.toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith("API error");
    });

    it("updates store with result before status", async () => {
      const mockForwardResult: ForwardResult = {
        status: "forwarded",
        partner_name: "Test Bank",
        partner_id: "partner-order",
      };

      const mockResponse: SubmitLeadInfoResponseBody = {
        forward_result: mockForwardResult,
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      const callOrder: string[] = [];
      mockSetResult.mockImplementation(() => callOrder.push("setResult"));
      mockSetForwardStatus.mockImplementation(() =>
        callOrder.push("setForwardStatus"),
      );

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-order",
          flowId: "flow-order",
          stepId: "step-order",
          formData: {
            phone_number: "+1313131313",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(callOrder).toEqual(["setResult", "setForwardStatus"]);
    });
  });

  describe("Multiple submissions", () => {
    it("handles multiple sequential submissions", async () => {
      const mockResponse1: SubmitLeadInfoResponseBody = {
        forward_result: {
          status: "forwarded",
          partner_name: "Bank 1",
          partner_id: "partner-1",
        },
      };

      const mockResponse2: SubmitLeadInfoResponseBody = {
        forward_result: {
          status: "rejected",
          partner_name: "Bank 2",
          partner_id: "partner-2",
        },
      };

      mockPost
        .mockResolvedValueOnce({
          data: mockResponse1,
          error: undefined,
        })
        .mockResolvedValueOnce({
          data: mockResponse2,
          error: undefined,
        });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitAndSearch(), { wrapper });

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-seq-1",
          flowId: "flow-seq-1",
          stepId: "step-seq-1",
          formData: {
            phone_number: "+1414141414",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse1);
      expect(mockSetForwardStatus).toHaveBeenCalledWith("forwarded");

      act(() => {
        result.current.submitAndSearch({
          leadId: "lead-seq-2",
          flowId: "flow-seq-2",
          stepId: "step-seq-2",
          formData: {
            phone_number: "+1515151515",
          },
        });
      });

      await waitFor(() => expect(result.current.data).toEqual(mockResponse2));
      expect(mockSetForwardStatus).toHaveBeenCalledWith("rejected");
      expect(mockPost).toHaveBeenCalledTimes(2);
    });
  });
});
