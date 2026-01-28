/**
 * useConsentLogs Hook Tests
 *
 * Tests for consent logs fetching hook including:
 * - Fetch success scenarios
 * - Loading state management
 * - Error handling for API failures
 * - Query parameter variations
 * - Enabled flag behavior
 *
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/api/client";
import { useConsentLogs } from "../use-consent-logs";

// Mock API client at module level
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
  },
}));

// Mock TanStack Query to use actual implementation in tests
vi.unmock("@tanstack/react-query");

describe("useConsentLogs", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
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
  });

  /**
   * Test: Fetches consent logs with leadId and pagination
   */
  it("should fetch consent logs successfully", async () => {
    const mockResponse = {
      consent_logs: [
        {
          id: "cl-1",
          consent_id: "c-1",
          action: "grant",
          action_by: "user1",
          source: "web",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "cl-2",
          consent_id: "c-1",
          action: "update",
          action_by: "user1",
          source: "web",
          created_at: "2025-01-02T00:00:00Z",
          updated_at: "2025-01-02T00:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        page_size: 10,
        total_count: 2,
      },
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useConsentLogs({ leadId: "lead-123" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/consent-logs" as any, {
      params: {
        query: {
          lead_id: "lead-123",
          page: 1,
          page_size: 10,
        },
      },
    });
  });

  /**
   * Test: Returns logs array with metadata
   */
  it("should return logs array with metadata", async () => {
    const mockResponse = {
      consent_logs: [
        {
          id: "cl-3",
          consent_id: "c-2",
          action: "grant",
          action_by: "user2",
          source: "app",
          created_at: "2025-01-05T00:00:00Z",
          updated_at: "2025-01-05T00:00:00Z",
        },
        {
          id: "cl-4",
          consent_id: "c-2",
          action: "revoke",
          action_by: "user2",
          source: "app",
          created_at: "2025-01-06T00:00:00Z",
          updated_at: "2025-01-06T00:00:00Z",
        },
        {
          id: "cl-5",
          consent_id: "c-2",
          action: "delete",
          action_by: "admin1",
          source: "sms",
          created_at: "2025-01-07T00:00:00Z",
          updated_at: "2025-01-07T00:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        page_size: 10,
        total_count: 3,
      },
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useConsentLogs({
          leadId: "lead-456",
          page: 1,
          pageSize: 10,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.consent_logs).toHaveLength(3);
    expect(result.current.data?.pagination).toEqual({
      page: 1,
      page_size: 10,
      total_count: 3,
    });
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Fetches with custom pagination parameters
   */
  it("should fetch consent logs with custom pagination parameters", async () => {
    const mockResponse = {
      consent_logs: [
        {
          id: "cl-6",
          consent_id: "c-3",
          action: "grant",
          action_by: "user3",
          source: "web",
          created_at: "2025-01-10T00:00:00Z",
          updated_at: "2025-01-10T00:00:00Z",
        },
      ],
      pagination: {
        page: 2,
        page_size: 20,
        total_count: 45,
      },
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useConsentLogs({
          leadId: "lead-789",
          page: 2,
          pageSize: 20,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.pagination).toEqual({
      page: 2,
      page_size: 20,
      total_count: 45,
    });
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/consent-logs" as any, {
      params: {
        query: {
          lead_id: "lead-789",
          page: 2,
          page_size: 20,
        },
      },
    });
  });

  /**
   * Test: Handles empty history
   */
  it("should handle empty history", async () => {
    const mockResponse = {
      consent_logs: [],
      pagination: {
        page: 1,
        page_size: 10,
        total_count: 0,
      },
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useConsentLogs({ leadId: "lead-empty" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.consent_logs).toEqual([]);
    expect(result.current.data?.consent_logs).not.toBeNull();
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalled();
  });

  /**
   * Test: Sets loading state correctly during fetch
   */
  it("should set loading state correctly during fetch", async () => {
    const mockResponse = {
      consent_logs: [
        {
          id: "cl-7",
          consent_id: "c-4",
          action: "grant",
          action_by: "user4",
          source: "web",
          created_at: "2025-01-15T00:00:00Z",
          updated_at: "2025-01-15T00:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        page_size: 10,
        total_count: 1,
      },
    };

    let resolveFetch: (value: any) => void;
    (apiClient.GET as any).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useConsentLogs({ leadId: "lead-loading" }),
      { wrapper },
    );

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);

    // Resolve promise
    resolveFetch?.({ data: mockResponse, error: undefined });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Handles API error and sets error state
   */
  it("should handle API error and set error state", async () => {
    const mockError = new Error("Failed to fetch consent logs");

    (apiClient.GET as any).mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useConsentLogs({ leadId: "lead-error" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
    expect(apiClient.GET).toHaveBeenCalled();
  });

  /**
   * Test: Handles network error (rejected promise)
   */
  it("should handle network error (rejected promise)", async () => {
    const mockError = new Error("Network error");

    (apiClient.GET as any).mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useConsentLogs({ leadId: "lead-network" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
    expect(apiClient.GET).toHaveBeenCalled();
  });

  /**
   * Test: Does not fetch when enabled=false
   */
  it("should not fetch when enabled=false", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useConsentLogs({
          leadId: "lead-disabled",
          enabled: false,
        }),
      { wrapper },
    );

    // Should not be loading since enabled=false
    expect(result.current.isLoading).toBe(false);
    expect(apiClient.GET).not.toHaveBeenCalled();
  });

  /**
   * Test: Does not fetch when leadId is not provided
   */
  it("should not fetch when leadId is not provided", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useConsentLogs(), { wrapper });

    // Should not be loading since leadId is required
    expect(result.current.isLoading).toBe(false);
    expect(apiClient.GET).not.toHaveBeenCalled();
  });
});
