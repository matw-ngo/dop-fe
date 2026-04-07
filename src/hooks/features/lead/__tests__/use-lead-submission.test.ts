/**
 * useSubmitLeadInfo Hook Tests
 *
 * Tests for lead info submission hook including:
 * - Successful submission
 * - API error handling (errors properly propagate - no mock fallback)
 * - Request body structure validation
 * - React Query mutation states
 * - No mock fallback exists (Phase 1 requirement)
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dopClient } from "@/lib/api/services/dop";
import { useSubmitLeadInfo } from "../use-lead-submission";
import type { components } from "@/lib/api/v1/dop";

type SubmitLeadInfoRequestBody =
  components["schemas"]["SubmitLeadInfoRequestBody"];

// Mock dopClient
vi.mock("@/lib/api/services/dop", () => ({
  dopClient: {
    POST: vi.fn(),
  },
}));

describe("useSubmitLeadInfo", () => {
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

  describe("Successful submission", () => {
    it("submits lead info successfully with all required fields", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Nguyen Van A",
        phone_number: "+84901234567",
        email: "nguyenvana@example.com",
        loan_amount: 50000000,
        purpose: "Business expansion",
      };

      const mockResponse = {
        success: true,
        message: "Lead info submitted successfully",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      expect(result.current.isPending).toBe(false);

      act(() => {
        result.current.mutate({
          leadId: "lead-123",
          data: mockRequestBody,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
      expect(mockPost).toHaveBeenCalledWith("/leads/{id}/submit-info", {
        params: {
          path: { id: "lead-123" },
        },
        body: mockRequestBody,
      });
    });

    it("submits lead info with minimal required fields", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Tran Thi B",
        phone_number: "+84912345678",
      };

      const mockResponse = {
        success: true,
        message: "Lead info submitted",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      act(() => {
        result.current.mutate({
          leadId: "lead-456",
          data: mockRequestBody,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith("/leads/{id}/submit-info", {
        params: {
          path: { id: "lead-456" },
        },
        body: mockRequestBody,
      });
    });

    it("submits lead info with optional fields", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Le Van C",
        phone_number: "+84923456789",
        email: "levanc@example.com",
        loan_amount: 100000000,
        purpose: "Home renovation",
        income: 20000000,
        career_status: "employed",
      };

      const mockResponse = {
        success: true,
        message: "Lead info submitted with all details",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      act(() => {
        result.current.mutate({
          leadId: "lead-789",
          data: mockRequestBody,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith("/leads/{id}/submit-info", {
        params: {
          path: { id: "lead-789" },
        },
        body: mockRequestBody,
      });
    });
  });

  describe("Error handling - errors properly propagate (no mock fallback)", () => {
    it("throws error when API returns error response", async () => {
      const mockError = {
        message: "Validation failed: phone_number is invalid",
      };

      mockPost.mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      act(() => {
        result.current.mutate({
          leadId: "lead-error",
          data: {
            flow_id: "test-flow",
            step_id: "test-step",
            full_name: "Error Test",
            phone_number: "invalid",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "Validation failed: phone_number is invalid",
      );
      expect(result.current.data).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Submit lead info API failed:",
        mockError,
      );

      consoleErrorSpy.mockRestore();
    });

    it("throws error when API returns error without message", async () => {
      const mockError = {};

      mockPost.mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      act(() => {
        result.current.mutate({
          leadId: "lead-error-no-msg",
          data: {
            flow_id: "test-flow",
            step_id: "test-step",
            full_name: "No Message Test",
            phone_number: "+84934567890",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Failed to submit lead info");
      expect(result.current.data).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });

    it("throws error when no data returned from API", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      act(() => {
        result.current.mutate({
          leadId: "lead-no-data",
          data: {
            flow_id: "test-flow",
            step_id: "test-step",
            full_name: "No Data Test",
            phone_number: "+84945678901",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "No data returned from submit lead info API",
      );
      expect(result.current.data).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "No data returned from submit lead info API",
      );

      consoleErrorSpy.mockRestore();
    });

    it("handles network errors and propagates them", async () => {
      const networkError = new Error("Network request failed");
      mockPost.mockRejectedValue(networkError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      act(() => {
        result.current.mutate({
          leadId: "lead-network-error",
          data: {
            flow_id: "test-flow",
            step_id: "test-step",
            full_name: "Network Error Test",
            phone_number: "+84956789012",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(networkError);
      expect(result.current.data).toBeUndefined();
    });

    it("verifies no mock fallback exists - errors are NOT swallowed", async () => {
      const mockError = {
        message: "Server error 500",
      };

      mockPost.mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      act(() => {
        result.current.mutate({
          leadId: "lead-no-fallback",
          data: {
            flow_id: "test-flow",
            step_id: "test-step",
            full_name: "No Fallback Test",
            phone_number: "+84967890123",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Critical assertion: error must be thrown, not swallowed
      expect(result.current.error).toBeDefined();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeUndefined();
      // Verify no mock success data is returned
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe("Request body structure", () => {
    it("passes request body unchanged to API", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Pham Van D",
        phone_number: "+84978901234",
        email: "phamvand@example.com",
        loan_amount: 75000000,
        purpose: "Education",
      };

      const mockResponse = {
        success: true,
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      act(() => {
        result.current.mutate({
          leadId: "lead-body-test",
          data: mockRequestBody,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPost).toHaveBeenCalledWith("/leads/{id}/submit-info", {
        params: {
          path: { id: "lead-body-test" },
        },
        body: mockRequestBody,
      });
    });

    it("correctly passes leadId in path params", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Hoang Thi E",
        phone_number: "+84989012345",
      };

      const mockResponse = {
        success: true,
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      const testLeadId = "lead-path-param-test-123";

      act(() => {
        result.current.mutate({
          leadId: testLeadId,
          data: mockRequestBody,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPost).toHaveBeenCalledWith("/leads/{id}/submit-info", {
        params: {
          path: { id: testLeadId },
        },
        body: mockRequestBody,
      });
    });
  });

  describe("React Query mutation states", () => {
    it("transitions through idle -> pending -> success states", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Vu Van F",
        phone_number: "+84990123456",
      };

      const mockResponse = {
        success: true,
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      // Initial state: idle
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      act(() => {
        result.current.mutate({
          leadId: "lead-states",
          data: mockRequestBody,
        });
      });

      // Wait for success
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
    });

    it("transitions through idle -> pending -> error states", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Dang Thi G",
        phone_number: "+84901234568",
      };

      mockPost.mockResolvedValue({
        data: undefined,
        error: { message: "Server error" },
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Initial state: idle
      expect(result.current.isPending).toBe(false);

      act(() => {
        result.current.mutate({
          leadId: "lead-error-states",
          data: mockRequestBody,
        });
      });

      // Wait for error
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);

      consoleErrorSpy.mockRestore();
    });

    it("sets loading state during submission", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Bui Van H",
        phone_number: "+84912345679",
      };

      const mockResponse = {
        success: true,
      };

      let resolveSubmit: (value: any) => void;
      mockPost.mockReturnValue(
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      act(() => {
        result.current.mutate({
          leadId: "lead-loading",
          data: mockRequestBody,
        });
      });

      // Should be loading
      expect(result.current.isPending).toBe(true);

      // Resolve the promise
      resolveSubmit?.({ data: mockResponse, error: undefined });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.isPending).toBe(false);
    });
  });

  describe("Mutation callbacks", () => {
    it("calls onSuccess callback with response data", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Ngo Thi I",
        phone_number: "+84923456780",
      };

      const mockResponse = {
        success: true,
        message: "Callback test success",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      const onSuccess = vi.fn();

      act(() => {
        result.current.mutate(
          {
            leadId: "lead-callback",
            data: mockRequestBody,
          },
          {
            onSuccess,
          },
        );
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalled();
      expect(onSuccess.mock.calls[0][0]).toEqual(mockResponse);
    });

    it("calls onError callback with error", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Do Van J",
        phone_number: "+84934567891",
      };

      const mockError = { message: "Callback error test" };

      mockPost.mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const onError = vi.fn();

      act(() => {
        result.current.mutate(
          {
            leadId: "lead-error-callback",
            data: mockRequestBody,
          },
          {
            onError,
          },
        );
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(onError.mock.calls[0][0].message).toBe("Callback error test");

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Multiple mutations", () => {
    it("handles multiple sequential mutations", async () => {
      const mockRequestBody1: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Ly Thi K",
        phone_number: "+84945678902",
      };

      const mockRequestBody2: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Truong Van L",
        phone_number: "+84956789013",
      };

      const mockResponse1 = {
        success: true,
        message: "First submission",
      };

      const mockResponse2 = {
        success: true,
        message: "Second submission",
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
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      // First mutation
      act(() => {
        result.current.mutate({
          leadId: "lead-seq-1",
          data: mockRequestBody1,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse1);

      // Second mutation
      act(() => {
        result.current.mutate({
          leadId: "lead-seq-2",
          data: mockRequestBody2,
        });
      });

      await waitFor(() => expect(result.current.data).toEqual(mockResponse2));

      expect(mockPost).toHaveBeenCalledTimes(2);
    });
  });

  describe("Reset mutation", () => {
    it("resets mutation state back to idle", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Cao Van M",
        phone_number: "+84967890124",
      };

      const mockResponse = {
        success: true,
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      act(() => {
        result.current.mutate({
          leadId: "lead-reset",
          data: mockRequestBody,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.isSuccess).toBe(true);

      // Reset mutation
      act(() => {
        result.current.reset();
      });

      // After reset, mutation can be called again
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  describe("Retry behavior", () => {
    it("does not retry on failure (retry: false)", async () => {
      const mockRequestBody: SubmitLeadInfoRequestBody = {
        flow_id: "test-flow",
        step_id: "test-step",
        full_name: "Phan Thi N",
        phone_number: "+84978901235",
      };

      mockPost.mockResolvedValue({
        data: undefined,
        error: { message: "Temporary error" },
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitLeadInfo(), { wrapper });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      act(() => {
        result.current.mutate({
          leadId: "lead-no-retry",
          data: mockRequestBody,
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Should only be called once (no retries)
      expect(mockPost).toHaveBeenCalledTimes(1);

      consoleErrorSpy.mockRestore();
    });
  });
});
