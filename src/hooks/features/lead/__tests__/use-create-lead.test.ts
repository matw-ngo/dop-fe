/**
 * useCreateLead Hook Tests
 *
 * Tests the lead creation hook which wraps React Query's useMutation
 * for creating leads via the DOP API.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dopClient } from "@/lib/api/services/dop";
import { useCreateLead } from "../use-create-lead";
import type { components } from "@/lib/api/v1/dop";

type CreateLeadResponseBody = components["schemas"]["CreateLeadResponseBody"];

// Mock dopClient
vi.mock("@/lib/api/services/dop", () => ({
  dopClient: {
    POST: vi.fn(),
  },
}));

describe("useCreateLead", () => {
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

  describe("Successful lead creation", () => {
    it("creates a lead successfully with all required fields", async () => {
      const mockResponse: CreateLeadResponseBody = {
        id: "lead-123",
        token: "token-abc-xyz",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isIdle).toBe(true);

      act(() => {
        result.current.mutate({
          flowId: "flow-456",
          tenant: "00000000-0000-0000-0000-000000000001",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+1234567890",
            loan_amount: 50000,
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
      expect(mockPost).toHaveBeenCalledWith("/leads", {
        body: {
          flow_id: "flow-456",
          tenant: "00000000-0000-0000-0000-000000000001",
          deviece_info: {
            flow_id: "test-flow",
            step_id: "test-step",
          }, // Note: typo in API schema
          tracking_params: {},
          info: {
            phone_number: "+1234567890",
            loan_amount: 50000,
          },
          consent_id: undefined,
        },
      });
    });

    it("creates a lead with optional consent_id", async () => {
      const mockResponse: CreateLeadResponseBody = {
        id: "lead-456",
        token: "token-def-uvw",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      act(() => {
        result.current.mutate({
          flowId: "flow-789",
          tenant: "00000000-0000-0000-0000-000000000002",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+9876543210",
          },
          consent_id: "consent-xyz-123",
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledWith("/leads", {
        body: expect.objectContaining({
          consent_id: "consent-xyz-123",
        }),
      });
    });

    it("transforms deviceInfo to deviece_info (API typo)", async () => {
      const mockResponse: CreateLeadResponseBody = {
        id: "lead-789",
        token: "token-ghi-rst",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      act(() => {
        result.current.mutate({
          flowId: "flow-123",
          tenant: "00000000-0000-0000-0000-000000000003",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+1111111111",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPost).toHaveBeenCalledWith("/leads", {
        body: expect.objectContaining({
          deviece_info: {}, // Verify typo transformation
        }),
      });
    });
  });

  describe("Error handling", () => {
    it("handles API error response", async () => {
      const mockError = {
        message: "Validation failed: phone_number is required",
      };

      mockPost.mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      act(() => {
        result.current.mutate({
          flowId: "flow-error",
          tenant: "00000000-0000-0000-0000-000000000004",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "Validation failed: phone_number is required",
      );
      expect(result.current.data).toBeUndefined();
    });

    it("handles API error without message", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: {},
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      act(() => {
        result.current.mutate({
          flowId: "flow-error-no-msg",
          tenant: "00000000-0000-0000-0000-000000000005",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+2222222222",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Failed to create lead");
    });

    it("handles no data returned from API", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      act(() => {
        result.current.mutate({
          flowId: "flow-no-data",
          tenant: "00000000-0000-0000-0000-000000000006",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+3333333333",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "No data returned from create lead API",
      );
    });

    it("handles network errors", async () => {
      const networkError = new Error("Network request failed");
      mockPost.mockRejectedValue(networkError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      act(() => {
        result.current.mutate({
          flowId: "flow-network-error",
          tenant: "00000000-0000-0000-0000-000000000007",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+4444444444",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(networkError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Create lead API failed:",
        networkError,
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("React Query mutation states", () => {
    it("transitions through idle -> pending -> success states", async () => {
      const mockResponse: CreateLeadResponseBody = {
        id: "lead-state-test",
        token: "token-state-test",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      // Initial state: idle
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      act(() => {
        result.current.mutate({
          flowId: "flow-states",
          tenant: "00000000-0000-0000-0000-000000000008",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+5555555555",
          },
        });
      });

      // Pending state
      expect(result.current.isPending).toBe(true);
      expect(result.current.isIdle).toBe(false);

      // Wait for success
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toEqual(mockResponse);
    });

    it("transitions through idle -> pending -> error states", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: { message: "Server error" },
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      // Initial state: idle
      expect(result.current.isIdle).toBe(true);

      act(() => {
        result.current.mutate({
          flowId: "flow-error-states",
          tenant: "00000000-0000-0000-0000-000000000009",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+6666666666",
          },
        });
      });

      // Wait for error
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("Retry behavior", () => {
    it("does not retry on failure (retry: false)", async () => {
      mockPost.mockResolvedValue({
        data: undefined,
        error: { message: "Temporary error" },
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      act(() => {
        result.current.mutate({
          flowId: "flow-no-retry",
          tenant: "00000000-0000-0000-0000-000000000010",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+7777777777",
          },
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Should only be called once (no retries)
      expect(mockPost).toHaveBeenCalledTimes(1);
    });
  });

  describe("Mutation callbacks", () => {
    it("calls onSuccess callback with response data", async () => {
      const mockResponse: CreateLeadResponseBody = {
        id: "lead-callback",
        token: "token-callback",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      const onSuccess = vi.fn();

      act(() => {
        result.current.mutate(
          {
            flowId: "flow-callback",
            tenant: "00000000-0000-0000-0000-000000000011",
            deviceInfo: {},
            trackingParams: {},
            info: {
              flow_id: "test-flow",
              step_id: "test-step",
              phone_number: "+8888888888",
            },
          },
          {
            onSuccess,
          },
        );
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalledWith(
        mockResponse,
        expect.any(Object),
        undefined,
      );
    });

    it("calls onError callback with error", async () => {
      const mockError = { message: "Callback error test" };

      mockPost.mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      const onError = vi.fn();

      act(() => {
        result.current.mutate(
          {
            flowId: "flow-error-callback",
            tenant: "00000000-0000-0000-0000-000000000012",
            deviceInfo: {},
            trackingParams: {},
            info: {
              flow_id: "test-flow",
              step_id: "test-step",
              phone_number: "+9999999999",
            },
          },
          {
            onError,
          },
        );
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
        undefined,
      );
    });
  });

  describe("Request body transformation", () => {
    it("correctly transforms camelCase params to snake_case API format", async () => {
      const mockResponse: CreateLeadResponseBody = {
        id: "lead-transform",
        token: "token-transform",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      const params = {
        flowId: "flow-transform-test",
        tenant: "00000000-0000-0000-0000-000000000013",
        deviceInfo: {},
        trackingParams: {},
        info: {
          flow_id: "test-flow",
          step_id: "test-step",
          phone_number: "+1010101010",
          loan_amount: 100000,
        },
        consent_id: "consent-transform",
      };

      act(() => {
        result.current.mutate(params);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPost).toHaveBeenCalledWith("/leads", {
        body: {
          flow_id: "flow-transform-test",
          tenant: "00000000-0000-0000-0000-000000000013",
          deviece_info: {},
          tracking_params: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+1010101010",
            loan_amount: 100000,
          },
          consent_id: "consent-transform",
        },
      });
    });
  });

  describe("Multiple mutations", () => {
    it("handles multiple sequential mutations", async () => {
      const mockResponse1: CreateLeadResponseBody = {
        id: "lead-seq-1",
        token: "token-seq-1",
      };

      const mockResponse2: CreateLeadResponseBody = {
        id: "lead-seq-2",
        token: "token-seq-2",
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
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      // First mutation
      act(() => {
        result.current.mutate({
          flowId: "flow-seq-1",
          tenant: "00000000-0000-0000-0000-000000000014",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+1212121212",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse1);

      // Second mutation
      act(() => {
        result.current.mutate({
          flowId: "flow-seq-2",
          tenant: "00000000-0000-0000-0000-000000000015",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+1313131313",
          },
        });
      });

      await waitFor(() => expect(result.current.data).toEqual(mockResponse2));

      expect(mockPost).toHaveBeenCalledTimes(2);
    });
  });

  describe("Reset mutation", () => {
    it("resets mutation state", async () => {
      const mockResponse: CreateLeadResponseBody = {
        id: "lead-reset",
        token: "token-reset",
      };

      mockPost.mockResolvedValue({
        data: mockResponse,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateLead(), { wrapper });

      act(() => {
        result.current.mutate({
          flowId: "flow-reset",
          tenant: "00000000-0000-0000-0000-000000000016",
          deviceInfo: {},
          trackingParams: {},
          info: {
            flow_id: "test-flow",
            step_id: "test-step",
            phone_number: "+1414141414",
          },
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);

      // Reset mutation
      act(() => {
        result.current.reset();
      });

      expect(result.current.isIdle).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });
  });
});
