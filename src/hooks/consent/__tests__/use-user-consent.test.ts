/**
 * useUserConsent Hook Tests
 *
 * Tests for user consent fetching hook including:
 * - Fetch success scenarios with leadId
 * - Loading state management
 * - Error handling for API failures
 * - Handling missing/empty consent data
 * - Enabled flag behavior
 *
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/api/client";
import useUserConsent from "../use-user-consent";

// Mock API client at module level
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
  },
}));

// Mock TanStack Query to use actual implementation in tests
vi.unmock("@tanstack/react-query");

describe("useUserConsent", () => {
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
   * Test: Fetch user's current consent successfully
   */
  it("should fetch user consent successfully", async () => {
    const mockConsent = {
      id: "consent-1",
      controller_id: "controller-1",
      processor_id: "processor-1",
      lead_id: "lead-123",
      consent_version_id: "version-1",
      source: "web",
      action: "grant",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockConsent,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ leadId: "lead-123" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockConsent);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/consent" as any, {
      params: {
        query: {
          lead_id: "lead-123",
        },
      },
    });
  });

  /**
   * Test: Returns correct consent data structure on success
   */
  it("should return correct consent data structure on success", async () => {
    const mockConsent = {
      id: "consent-2",
      controller_id: "controller-2",
      processor_id: "processor-2",
      lead_id: "lead-456",
      consent_version_id: "version-2",
      source: "app",
      action: "grant",
      created_at: "2025-01-15T00:00:00Z",
      updated_at: "2025-01-15T00:00:00Z",
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockConsent,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ leadId: "lead-456" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toMatchObject({
      id: "consent-2",
      controller_id: "controller-2",
      processor_id: "processor-2",
      lead_id: "lead-456",
      consent_version_id: "version-2",
      source: "app",
      action: "grant",
    });
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Handles missing consent (returns empty)
   */
  it("should handle missing consent gracefully", async () => {
    (apiClient.GET as any).mockResolvedValue({
      data: undefined,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ leadId: "lead-789" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).not.toBeNull();
  });

  /**
   * Test: Sets loading state correctly during fetch
   */
  it("should set loading state correctly during fetch", async () => {
    const mockConsent = {
      id: "consent-3",
      controller_id: "controller-3",
      processor_id: "processor-3",
      lead_id: "lead-999",
      consent_version_id: "version-3",
      source: "sms",
      action: "grant",
      created_at: "2025-02-01T00:00:00Z",
      updated_at: "2025-02-01T00:00:00Z",
    };

    let resolveFetch: (value: any) => void;
    (apiClient.GET as any).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ leadId: "lead-999" }),
      { wrapper },
    );

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);

    // Resolve promise
    resolveFetch?.({ data: mockConsent, error: undefined });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockConsent);
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Handles API error and sets error state
   */
  it("should handle API error and set error state", async () => {
    const mockError = new Error("Failed to fetch user consent");

    (apiClient.GET as any).mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ leadId: "lead-error" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
    expect(apiClient.GET).toHaveBeenCalled();
  });

  /**
   * Test: Does not fetch when leadId is missing
   */
  it("should not fetch when leadId is undefined", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUserConsent({ leadId: undefined }), {
      wrapper,
    });

    // Should not be loading since leadId is missing
    expect(result.current.isLoading).toBe(false);
    expect(apiClient.GET).not.toHaveBeenCalled();
  });

  /**
   * Test: Does not fetch when enabled=false
   */
  it("should not fetch when enabled=false", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useUserConsent({
          leadId: "lead-123",
          enabled: false,
        }),
      { wrapper },
    );

    // Should not be loading since enabled=false
    expect(result.current.isLoading).toBe(false);
    expect(apiClient.GET).not.toHaveBeenCalled();
  });

  /**
   * Test: Fetches with revoke action
   */
  it("should fetch user consent with revoke action", async () => {
    const mockConsent = {
      id: "consent-revoke",
      controller_id: "controller-4",
      processor_id: "processor-4",
      lead_id: "lead-revoke",
      consent_version_id: "version-revoke",
      source: "web",
      action: "revoke",
      created_at: "2025-02-10T00:00:00Z",
      updated_at: "2025-02-10T00:00:00Z",
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockConsent,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ leadId: "lead-revoke" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockConsent);
    expect(result.current.data?.action).toBe("revoke");
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Handles network error (rejected promise)
   */
  it("should handle network error (rejected promise)", async () => {
    const mockError = new Error("Network error");

    (apiClient.GET as any).mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ leadId: "lead-network" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
    expect(apiClient.GET).toHaveBeenCalled();
  });

  /**
   * Test: Returns refetch function
   */
  it("should return refetch function", async () => {
    const mockResponse = {
      consents: [
        {
          id: "consent-refetch",
          controller_id: "controller-5",
          processor_id: "processor-5",
          lead_id: "lead-refetch",
          consent_version_id: "version-refetch",
          source: "web",
          action: "grant",
          created_at: "2025-02-15T00:00:00Z",
          updated_at: "2025-02-15T00:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        page_size: 10,
        total_count: 1,
      },
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ leadId: "lead-refetch" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(typeof result.current.refetch).toBe("function");
    expect(result.current.isRefetching).toBe(false);

    // Call refetch
    result.current.refetch();

    expect(apiClient.GET).toHaveBeenCalledTimes(2);
  });
});
