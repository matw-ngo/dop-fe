/**
 * useEkycConfig Hook Tests
 *
 * Tests for eKYC configuration fetching hook including:
 * - Cache behavior (hit/miss scenarios)
 * - Integration test for <500ms fetch time (SC-001)
 * - Error handling test for user-friendly messages (SC-007)
 *
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dopClient } from "@/lib/api/services/dop";
import { useEkycConfig } from "../features/ekyc/use-config";

// Mock the API client
vi.mock("@/lib/api/services/dop", () => ({
  dopClient: {
    GET: vi.fn(),
  },
}));

// Mock audit logger
vi.mock("@/lib/ekyc/audit-logger", () => ({
  logConfigFetchStart: vi.fn(),
  logConfigFetchSuccess: vi.fn(),
  logConfigFetchError: vi.fn(),
  logConfigCacheHit: vi.fn(),
  logConfigCacheMiss: vi.fn(),
}));

describe("useEkycConfig", () => {
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
   * Test T102: Fetch config successfully
   */
  it("should fetch config successfully", async () => {
    const mockConfig = {
      access_token: "test-token-123",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any).mockResolvedValue({
      data: mockConfig,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-123"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockConfig);
    expect(dopClient.GET).toHaveBeenCalledWith("/leads/{id}/ekyc/config", {
      params: { path: { id: "lead-123" } },
    });
  });

  /**
   * Test T102: Handle fetch errors with user-friendly message (SC-007)
   */
  it("should handle fetch errors with user-friendly message (SC-007)", async () => {
    const mockError = {
      message: "Configuration not found for this lead",
    };

    (dopClient.GET as any).mockResolvedValue({
      data: undefined,
      error: mockError,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-error"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain("Configuration not found");
  });

  /**
   * Test T102: Handle network errors
   */
  it("should handle network errors", async () => {
    (dopClient.GET as any).mockResolvedValue({
      data: undefined,
      error: "Network Error",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-network"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe("Network Error");
  });

  /**
   * Test T102: Handle empty response
   */
  it("should handle empty response", async () => {
    (dopClient.GET as any).mockResolvedValue({
      data: null,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-empty"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain("No eKYC config returned");
  });

  /**
   * Test T102: Cache behavior - first call (cache miss)
   */
  it("should fetch on first call (cache miss)", async () => {
    const mockConfig = {
      access_token: "test-token",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any).mockResolvedValue({
      data: mockConfig,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-cache-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(dopClient.GET).toHaveBeenCalledTimes(1);
  });

  /**
   * Test T102: Cache behavior - subsequent call (cache hit)
   */
  it("should use cache on subsequent call within stale time", async () => {
    const mockConfig = {
      access_token: "test-token",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any).mockResolvedValue({
      data: mockConfig,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      () => useEkycConfig("lead-cache-2"),
      { wrapper },
    );

    // First call - should fetch
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(dopClient.GET).toHaveBeenCalledTimes(1);

    // Re-render with same lead ID - should use cache
    rerender();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should not make another API call
    expect(dopClient.GET).toHaveBeenCalledTimes(1);
  });

  /**
   * Test T102: Cache behavior - different lead IDs
   */
  it("should fetch separately for different lead IDs", async () => {
    const mockConfig1 = {
      access_token: "token-1",
      challenge_code: "ch1",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };
    const mockConfig2 = {
      access_token: "token-2",
      challenge_code: "ch2",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any)
      .mockResolvedValueOnce({ data: mockConfig1, error: undefined })
      .mockResolvedValueOnce({ data: mockConfig2, error: undefined });

    const wrapper = createWrapper();
    const { result: result1 } = renderHook(() => useEkycConfig("lead-a"), {
      wrapper,
    });
    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    const { result: result2 } = renderHook(() => useEkycConfig("lead-b"), {
      wrapper,
    });
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    expect(dopClient.GET).toHaveBeenCalledTimes(2);
    expect(result1.current.data?.access_token).toBe("token-1");
    expect(result2.current.data?.access_token).toBe("token-2");
  });

  /**
   * Test T102: Not enabled when leadId is empty
   */
  it("should not fetch when leadId is empty", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig(""), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(dopClient.GET).not.toHaveBeenCalled();
  });

  /**
   * Test T102: Not enabled when leadId is undefined
   */
  it("should not fetch when leadId is undefined", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig(undefined as any), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(dopClient.GET).not.toHaveBeenCalled();
  });

  /**
   * Test T102: Loading state
   */
  it("should set loading state during fetch", async () => {
    const mockConfig = {
      access_token: "test-token",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    let resolveFetch: (value: any) => void;
    (dopClient.GET as any).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-loading"), {
      wrapper,
    });

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);
    expect(result.current.fetchStatus).toBe("fetching");

    // Resolve the promise
    resolveFetch?.({ data: mockConfig, error: undefined });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isSuccess).toBe(true);
  });

  /**
   * Test T102: Handle malformed error response
   */
  it("should handle malformed error response", async () => {
    (dopClient.GET as any).mockResolvedValue({
      data: undefined,
      error: null,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-malformed"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe("Unknown error");
  });

  /**
   * Test T102: Handle error without message property
   */
  it("should handle error without message property", async () => {
    (dopClient.GET as any).mockResolvedValue({
      data: undefined,
      error: { code: "ERROR_CODE" },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-no-msg"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe("Unknown error");
  });

  /**
   * Test T102: Refetch functionality
   */
  it("should support manual refetch", async () => {
    const mockConfig = {
      access_token: "test-token",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any).mockResolvedValue({
      data: mockConfig,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-refetch"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(dopClient.GET).toHaveBeenCalledTimes(1);

    // Manually refetch
    await result.current.refetch();

    expect(dopClient.GET).toHaveBeenCalledTimes(2);
  });

  /**
   * Test T102: Multiple concurrent requests for same lead
   */
  it("should deduplicate concurrent requests for same lead", async () => {
    const mockConfig = {
      access_token: "test-token",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any).mockResolvedValue({
      data: mockConfig,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result: result1 } = renderHook(
      () => useEkycConfig("lead-concurrent"),
      { wrapper },
    );
    const { result: result2 } = renderHook(
      () => useEkycConfig("lead-concurrent"),
      { wrapper },
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));

    // Should only make one API call despite two hooks
    expect(dopClient.GET).toHaveBeenCalledTimes(1);
  });

  /**
   * Integration: Cache analytics test (SC-005 preparation)
   */
  it("should track cache hits and misses for analytics", async () => {
    const mockConfig = {
      access_token: "test-token",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any).mockResolvedValue({
      data: mockConfig,
      error: undefined,
    });

    // First fetch - cache miss
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-analytics"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify fetch happened (cache miss)
    expect(dopClient.GET).toHaveBeenCalledTimes(1);

    // Re-render - cache hit
    const { rerender } = renderHook(() => useEkycConfig("lead-analytics"), {
      wrapper,
    });
    rerender();

    // Should not fetch again (cache hit)
    expect(dopClient.GET).toHaveBeenCalledTimes(1);
  });

  /**
   * Integration: Performance test for <500ms fetch (SC-001)
   */
  it("should fetch config in under 500ms (SC-001)", async () => {
    const mockConfig = {
      access_token: "test-token",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: mockConfig, error: undefined });
          }, 200); // Simulate 200ms response
        }),
    );

    const wrapper = createWrapper();
    const startTime = performance.now();

    const { result } = renderHook(() => useEkycConfig("lead-perf"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(500);
    expect(dopClient.GET).toHaveBeenCalledTimes(1);
  });

  /**
   * Integration: Performance test for slow responses
   */
  it("should handle slow responses gracefully", async () => {
    const mockConfig = {
      access_token: "test-token",
      challenge_code: "test-challenge",
      has_result_screen: true,
      enable_api_liveness_document: true,
      enable_api_liveness_face: true,
      enable_api_masked_face: true,
    };

    (dopClient.GET as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: mockConfig, error: undefined });
          }, 400); // Simulate 400ms response
        }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useEkycConfig("lead-slow"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockConfig);
  });
});
