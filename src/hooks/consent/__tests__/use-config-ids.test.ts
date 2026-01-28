/**
 * useConfigIds Hook Tests
 *
 * Tests for config IDs fetching hook including:
 * - Fetch success scenarios
 * - Loading state management
 * - Error handling for API failures
 * - Enabled flag behavior
 *
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/api/client";
import { useConfigIds } from "../use-config-ids";

// Mock API client at module level
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
  },
}));

// Mock TanStack Query to use actual implementation in tests
vi.unmock("@tanstack/react-query");

describe("useConfigIds", () => {
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
   * Test: Fetches controller_id and processor_id from API
   */
  it("should fetch config IDs successfully", async () => {
    const mockResponse = {
      controller_id: "controller-123",
      processor_id: "processor-456",
      consent_purpose_id: "purpose-789",
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.controller_id).toBe("controller-123");
    expect(result.current.data?.processor_id).toBe("processor-456");
    expect(result.current.data?.consent_purpose_id).toBe("purpose-789");
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/config/ids");
  });

  /**
   * Test: Returns both IDs as object
   */
  it("should return both IDs as object", async () => {
    const mockResponse = {
      controller_id: "ctrl-abc",
      processor_id: "proc-def",
      consent_purpose_id: "cp-ghi",
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.controller_id).toBe("ctrl-abc");
    expect(result.current.data?.processor_id).toBe("proc-def");
    expect(result.current.data?.consent_purpose_id).toBe("cp-ghi");
    expect(typeof result.current.data?.controller_id).toBe("string");
    expect(typeof result.current.data?.processor_id).toBe("string");
  });

  /**
   * Test: Handles API error and sets error state
   */
  it("should handle API error and set error state", async () => {
    const mockError = new Error("Failed to fetch config IDs");

    (apiClient.GET as any).mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
    expect(apiClient.GET).toHaveBeenCalled();
  });

  /**
   * Test: Sets loading state correctly during fetch
   */
  it("should set loading state correctly during fetch", async () => {
    const mockResponse = {
      controller_id: "ctrl-xyz",
      processor_id: "proc-uvw",
      consent_purpose_id: "cp-rst",
    };

    let resolveFetch: (value: any) => void;
    (apiClient.GET as any).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);

    // Resolve promise
    resolveFetch?.({ data: mockResponse, error: undefined });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Does not fetch when enabled=false
   */
  it("should not fetch when enabled=false", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useConfigIds({
          enabled: false,
        }),
      { wrapper },
    );

    // Should not be loading since enabled=false
    expect(result.current.isLoading).toBe(false);
    expect(apiClient.GET).not.toHaveBeenCalled();
  });

  /**
   * Test: Fetches when enabled=true (default)
   */
  it("should fetch when enabled=true by default", async () => {
    const mockResponse = {
      controller_id: "default-ctrl",
      processor_id: "default-proc",
      consent_purpose_id: "default-cp",
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.GET).toHaveBeenCalled();
  });

  /**
   * Test: Handles network error (rejected promise)
   */
  it("should handle network error (rejected promise)", async () => {
    const mockError = new Error("Network error");

    (apiClient.GET as any).mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
    expect(apiClient.GET).toHaveBeenCalled();
  });
});
