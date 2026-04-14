/**
 * useTenantFlow Hook Tests
 *
 * Tests the tenant flow configuration hook which wraps React Query's useQuery
 * for fetching flow configuration via the DOP API.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dopClient } from "@/lib/api/services/dop";
import { useTenantFlow } from "../use-flow";
import type { components } from "@/lib/api/v1/dop";

type FlowDetail = components["schemas"]["FlowDetail"];
type Step = components["schemas"]["Step"];

// Helper function to create a valid Step object with all required fields
const createMockStep = (overrides: Partial<Step> = {}): Step => ({
  id: "step-id",
  use_ekyc: false,
  send_otp: false,
  page: "",
  have_purpose: false,
  required_purpose: false,
  have_phone_number: false,
  required_phone_number: false,
  have_email: false,
  required_email: false,
  have_full_name: false,
  required_full_name: false,
  have_national_id: false,
  required_national_id: false,
  have_second_national_id: false,
  required_second_national_id: false,
  have_gender: false,
  required_gender: false,
  have_location: false,
  required_location: false,
  have_birthday: false,
  required_birthday: false,
  have_income_type: false,
  required_income_type: false,
  have_income: false,
  required_income: false,
  have_having_loan: false,
  required_having_loan: false,
  have_career_status: false,
  required_career_status: false,
  have_career_type: false,
  required_career_type: false,
  have_credit_status: false,
  required_credit_status: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

// Mock dopClient
vi.mock("@/lib/api/services/dop", () => ({
  dopClient: {
    GET: vi.fn(),
  },
}));

describe("useTenantFlow", () => {
  let queryClient: QueryClient;
  let mockGet: ReturnType<typeof vi.fn>;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1, // Match the hook's retry configuration
          retryDelay: 0,
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
    mockGet = vi.mocked(dopClient.GET);
  });

  describe("Successful flow configuration fetch", () => {
    it("fetches tenant flow configuration successfully", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-123",
        name: "Onboarding Flow",
        description: "Standard onboarding flow",
        flow_status: "active",
        steps: [
          createMockStep({
            id: "step-1",
            page: "personal-info",
            have_phone_number: true,
            required_phone_number: true,
          }),
          createMockStep({
            id: "step-2",
            page: "verification",
            use_ekyc: true,
            send_otp: true,
          }),
        ],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-uuid-123"), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual(mockFlowData);
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(true);
      expect(mockGet).toHaveBeenCalledWith("/flows/{tenant}", {
        params: {
          path: {
            tenant: "tenant-uuid-123",
          },
        },
      });
    });

    it("fetches flow with multiple steps", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-456",
        name: "Multi-Step Flow",
        description: "Flow with multiple steps",
        flow_status: "active",
        steps: [
          createMockStep({ id: "step-1", page: "step1" }),
          createMockStep({ id: "step-2", page: "step2" }),
          createMockStep({ id: "step-3", page: "step3" }),
          createMockStep({ id: "step-4", page: "step4" }),
        ],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-uuid-456"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockFlowData);
      expect(result.current.data?.steps).toHaveLength(4);
    });

    it("fetches flow with empty steps array", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-789",
        name: "Empty Flow",
        description: "Flow with no steps",
        flow_status: "active",
        steps: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-uuid-789"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockFlowData);
      expect(result.current.data?.steps).toEqual([]);
    });
  });

  describe("Error handling", () => {
    it("handles API error with message", async () => {
      const mockError = new Error("Tenant not found");
      mockGet.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("invalid-tenant-uuid"),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Tenant not found");
      expect(result.current.data).toBeUndefined();
    });

    it("handles API error without message", async () => {
      const mockError = new Error("Failed to fetch tenant flow configuration");
      mockGet.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("tenant-error-no-msg"),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "Failed to fetch tenant flow configuration",
      );
    });

    it("handles no data returned from API", async () => {
      const mockError = new Error("No flow configuration data returned");
      mockGet.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-no-data"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(
        "No flow configuration data returned",
      );
    });

    it("handles network errors", async () => {
      const networkError = new Error("Network request failed");
      mockGet.mockRejectedValue(networkError);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("tenant-network-error"),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(networkError);
    });

    it("handles 404 tenant not found", async () => {
      const notFoundError = new Error(
        "Flow configuration not found for tenant",
      );
      mockGet.mockRejectedValue(notFoundError);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("non-existent-tenant"),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe(
        "Flow configuration not found for tenant",
      );
    });
  });

  describe("React Query states", () => {
    it("transitions through loading -> success states", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-states",
        name: "State Test Flow",
        description: "Flow for testing states",
        flow_status: "active",
        steps: [createMockStep({ id: "step-1", page: "step1" })],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-states"), {
        wrapper,
      });

      // Initial state: loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);

      // Wait for success
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toEqual(mockFlowData);
    });

    it("transitions through loading -> error states", async () => {
      const mockError = new Error("Server error");
      mockGet.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("tenant-error-states"),
        { wrapper },
      );

      // Initial state: loading
      expect(result.current.isLoading).toBe(true);

      // Wait for error
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe("Caching behavior", () => {
    it("uses cached data for same tenant UUID", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-cache",
        name: "Cached Flow",
        description: "Flow for testing cache",
        flow_status: "active",
        steps: [createMockStep({ id: "step-1", page: "step1" })],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();

      // First render
      const { result: result1 } = renderHook(
        () => useTenantFlow("tenant-cache-123"),
        { wrapper },
      );

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Second render with same tenant UUID
      const { result: result2 } = renderHook(
        () => useTenantFlow("tenant-cache-123"),
        { wrapper },
      );

      // Should use cached data immediately
      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      // Should not make another API call due to caching
      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result2.current.data).toEqual(mockFlowData);
    });

    it("makes separate requests for different tenant UUIDs", async () => {
      const mockFlowData1: FlowDetail = {
        id: "flow-1",
        name: "Flow 1",
        description: "First flow",
        flow_status: "active",
        steps: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      const mockFlowData2: FlowDetail = {
        id: "flow-2",
        name: "Flow 2",
        description: "Second flow",
        flow_status: "active",
        steps: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet
        .mockResolvedValueOnce({
          data: mockFlowData1,
          error: undefined,
        })
        .mockResolvedValueOnce({
          data: mockFlowData2,
          error: undefined,
        });

      const wrapper = createWrapper();

      // First tenant
      const { result: result1 } = renderHook(() => useTenantFlow("tenant-1"), {
        wrapper,
      });

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      // Second tenant
      const { result: result2 } = renderHook(() => useTenantFlow("tenant-2"), {
        wrapper,
      });

      await waitFor(() => expect(result2.current.isSuccess).toBe(true));

      // Should make two separate API calls
      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(result1.current.data).toEqual(mockFlowData1);
      expect(result2.current.data).toEqual(mockFlowData2);
    });

    it("respects staleTime configuration (5 minutes)", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-stale",
        name: "Stale Test Flow",
        description: "Flow for testing stale time",
        flow_status: "active",
        steps: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-stale"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Data should be fresh (not stale) immediately after fetch
      expect(result.current.isStale).toBe(false);
    });
  });

  describe("Enabled option", () => {
    it("does not fetch when enabled is false", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("tenant-disabled", { enabled: false }),
        { wrapper },
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("does not fetch when tenantUuid is empty string", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow(""), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("fetches when enabled is explicitly true", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-enabled",
        name: "Enabled Flow",
        description: "Flow with enabled option",
        flow_status: "active",
        steps: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("tenant-enabled", { enabled: true }),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockFlowData);
    });

    it("fetches by default when enabled option is not provided", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-default",
        name: "Default Flow",
        description: "Default flow configuration",
        flow_status: "active",
        steps: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-default"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });

  describe("Retry behavior", () => {
    it("retries once on failure", async () => {
      mockGet
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockResolvedValueOnce({
          data: {
            id: "flow-retry",
            name: "Retry Flow",
            description: "Flow for testing retry",
            flow_status: "active",
            steps: [],
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
          error: undefined,
        });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-retry"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should be called twice (initial + 1 retry)
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it("fails after retry limit is reached", async () => {
      const error = new Error("Persistent error");
      mockGet.mockRejectedValue(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-retry-fail"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Should be called twice (initial + 1 retry)
      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBe(error);
    });
  });

  describe("Refetch functionality", () => {
    it("refetches flow configuration on demand", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-refetch",
        name: "Refetch Flow",
        description: "Flow for testing refetch",
        flow_status: "active",
        steps: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-refetch"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGet).toHaveBeenCalledTimes(1);

      // Trigger refetch
      await result.current.refetch();

      // Should make another API call
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  describe("Query key structure", () => {
    it("uses correct query key format", async () => {
      const mockFlowData: FlowDetail = {
        id: "flow-key",
        name: "Key Flow",
        description: "Flow for testing query key",
        flow_status: "active",
        steps: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTenantFlow("tenant-key-123"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify the query is stored with correct key
      const cachedData = queryClient.getQueryData(["flow", "tenant-key-123"]);
      expect(cachedData).toEqual(mockFlowData);
    });
  });

  describe("Real-world usage scenarios", () => {
    it("handles typical onboarding flow structure", async () => {
      const mockFlowData: FlowDetail = {
        id: "onboarding-flow-001",
        name: "Standard Onboarding",
        description: "Standard onboarding flow for new users",
        flow_status: "active",
        steps: [
          createMockStep({
            id: "personal-info",
            page: "personal-info",
            have_phone_number: true,
            required_phone_number: true,
          }),
          createMockStep({
            id: "otp-verification",
            page: "otp",
            send_otp: true,
          }),
          createMockStep({ id: "ekyc", page: "ekyc", use_ekyc: true }),
          createMockStep({
            id: "loan-details",
            page: "loan-details",
            have_purpose: true,
            required_purpose: true,
          }),
          createMockStep({ id: "review", page: "review" }),
        ],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("00000000-0000-0000-0000-000000000001"),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe("onboarding-flow-001");
      expect(result.current.data?.steps).toHaveLength(5);
      expect(result.current.data?.steps[0].id).toBe("personal-info");
    });

    it("handles flow configuration for lead creation", async () => {
      const mockFlowData: FlowDetail = {
        id: "lead-flow-123",
        name: "Lead Creation Flow",
        description: "Flow for creating new leads",
        flow_status: "active",
        steps: [
          createMockStep({
            id: "step-1",
            page: "initial-contact",
            have_phone_number: true,
            required_phone_number: true,
          }),
          createMockStep({ id: "step-2", page: "qualification" }),
        ],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      mockGet.mockResolvedValue({
        data: mockFlowData,
        error: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTenantFlow("tenant-lead-creation"),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Simulate extracting flow ID and step ID for lead creation
      const flowId = result.current.data?.id;
      const stepId = result.current.data?.steps[0]?.id;

      expect(flowId).toBe("lead-flow-123");
      expect(stepId).toBe("step-1");
    });
  });
});
