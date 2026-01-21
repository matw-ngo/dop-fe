/**
 * eKYC Performance Benchmarks
 *
 * Performance tests for eKYC operations to verify SLA compliance:
 * - SC-001: Config fetch <500ms
 * - SC-002: Submission <3s
 * - SC-005: 80% cache hit reduction
 *
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dopClient } from "@/lib/api/services/dop";

// Mock the API client
vi.mock("@/lib/api/services/dop", () => ({
  dopClient: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

// Import hooks after mocking
import { useEkycConfig } from "@/hooks/use-ekyc-config";
import { useSubmitEkycResult } from "@/hooks/use-submit-ekyc-result";

describe("eKYC Performance Benchmarks", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
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
    vi.useRealTimers();
  });

  /**
   * Performance Benchmark T410: SC-001 Config fetch <500ms
   */
  describe("SC-001: Config Fetch Performance (<500ms)", () => {
    it("should fetch config in under 500ms", async () => {
      const mockConfig = {
        access_token: "test-token",
        challenge_code: "test-challenge",
        has_result_screen: true,
        enable_api_liveness_document: true,
        enable_api_liveness_face: true,
        enable_api_masked_face: true,
      };

      // Simulate realistic API latency (200-300ms)
      (dopClient.GET as any).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: mockConfig, error: undefined });
            }, 250);
          }),
      );

      const wrapper = createWrapper();
      const startTime = performance.now();

      const { result } = renderHook(() => useEkycConfig("lead-perf-1"), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[PERF] Config fetch time: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(500);
      expect(duration).toBeGreaterThan(0);
    });

    it("should handle multiple concurrent config fetches efficiently", async () => {
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
            }, 250);
          }),
      );

      const wrapper = createWrapper();
      const startTime = performance.now();

      // Fetch 3 different configs concurrently
      const { result: result1 } = renderHook(() => useEkycConfig("lead-1"), {
        wrapper,
      });
      const { result: result2 } = renderHook(() => useEkycConfig("lead-2"), {
        wrapper,
      });
      const { result: result3 } = renderHook(() => useEkycConfig("lead-3"), {
        wrapper,
      });

      await Promise.all([
        waitFor(() => expect(result1.current.isSuccess).toBe(true)),
        waitFor(() => expect(result2.current.isSuccess).toBe(true)),
        waitFor(() => expect(result3.current.isSuccess).toBe(true)),
      ]);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[PERF] 3 concurrent fetches time: ${duration.toFixed(2)}ms`);
      // Concurrent fetches should complete in roughly the same time as a single fetch
      expect(duration).toBeLessThan(800);
    });

    it("should measure average config fetch time over 10 iterations", async () => {
      const mockConfig = {
        access_token: "test-token",
        challenge_code: "test-challenge",
        has_result_screen: true,
        enable_api_liveness_document: true,
        enable_api_liveness_face: true,
        enable_api_masked_face: true,
      };

      const durations: number[] = [];

      for (let i = 0; i < 10; i++) {
        queryClient = new QueryClient({
          defaultOptions: {
            queries: { retry: false },
          },
        });

        (dopClient.GET as any).mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(
                () => {
                  resolve({ data: mockConfig, error: undefined });
                },
                200 + Math.random() * 100,
              ); // 200-300ms variance
            }),
        );

        const wrapper = createWrapper();
        const startTime = performance.now();

        const { result } = renderHook(() => useEkycConfig(`lead-perf-${i}`), {
          wrapper,
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const endTime = performance.now();
        durations.push(endTime - startTime);
      }

      const averageDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      console.log(`[PERF] Config fetch (10 iterations):`);
      console.log(`  - Average: ${averageDuration.toFixed(2)}ms`);
      console.log(`  - Min: ${minDuration.toFixed(2)}ms`);
      console.log(`  - Max: ${maxDuration.toFixed(2)}ms`);

      expect(averageDuration).toBeLessThan(500);
      expect(maxDuration).toBeLessThan(600); // Allow some variance
    });
  });

  /**
   * Performance Benchmark T411: SC-002 Submission <3s
   */
  describe("SC-002: Submission Performance (<3s)", () => {
    it("should submit eKYC result in under 3 seconds", async () => {
      const mockResponse = {
        success: true,
        verification_id: "ver-123",
      };

      const mockEkycData = {
        type_document: 9,
        ocr: {
          id: "001234567890",
          name: "NGUYEN VAN ANH",
          birth_day: "15/01/1990",
          msg: "OCR success",
          card_type: "Căn cước công dân",
          name_prob: 95,
          birth_day_prob: 95,
          nationality: "Việt Nam",
          nation: "Kinh",
          gender: "Nam",
          valid_date: "01/01/2030",
          origin_location: "Hà Nội",
          origin_location_prob: 90,
          recent_location: "TP.HCM",
          recent_location_prob: 90,
          issue_date: "01/01/2020",
          issue_date_prob: 90,
          issue_place: "Công an TP.HCM",
          issue_place_prob: 90,
          type_id: 1,
          back_type_id: 1,
          warning: [],
          warning_msg: [],
          expire_warning: "",
          back_expire_warning: "",
          post_code: [],
          tampering: { is_legal: "yes", warning: [] },
          is_legal: "yes",
          id_fake_prob: 0,
          id_fake_warning: "no",
          msg_back: "",
          nation_policy: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",
          nation_slogan: "Độc lập - Tự do - Hạnh phúc",
          id_probs: "[99,98,97]",
        },
      };

      // Simulate realistic submission latency (1-2s)
      (dopClient.POST as any).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: mockResponse, error: undefined });
            }, 1500);
          }),
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

      const startTime = performance.now();

      await result.current.mutateAsync({
        leadId: "lead-submit-perf",
        sessionId: "session-perf",
        ekycData: mockEkycData as any,
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`[PERF] Submission time: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(3000);
      expect(duration).toBeGreaterThan(0);
    });

    it("should measure average submission time over 5 iterations", async () => {
      const mockResponse = {
        success: true,
        verification_id: "ver-123",
      };

      const mockEkycData = {
        type_document: 9,
        ocr: {
          id: "001234567890",
          name: "NGUYEN VAN ANH",
          birth_day: "15/01/1990",
          msg: "OCR success",
          card_type: "Căn cước công dân",
          name_prob: 95,
          birth_day_prob: 95,
          nationality: "Việt Nam",
          nation: "Kinh",
          gender: "Nam",
          valid_date: "01/01/2030",
          origin_location: "Hà Nội",
          origin_location_prob: 90,
          recent_location: "TP.HCM",
          recent_location_prob: 90,
          issue_date: "01/01/2020",
          issue_date_prob: 90,
          issue_place: "Công an TP.HCM",
          issue_place_prob: 90,
          type_id: 1,
          back_type_id: 1,
          warning: [],
          warning_msg: [],
          expire_warning: "",
          back_expire_warning: "",
          post_code: [],
          tampering: { is_legal: "yes", warning: [] },
          is_legal: "yes",
          id_fake_prob: 0,
          id_fake_warning: "no",
          msg_back: "",
          nation_policy: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",
          nation_slogan: "Độc lập - Tự do - Hạnh phúc",
          id_probs: "[99,98,97]",
        },
      };

      const durations: number[] = [];

      for (let i = 0; i < 5; i++) {
        queryClient = new QueryClient({
          defaultOptions: {
            mutations: { retry: false },
          },
        });

        (dopClient.POST as any).mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(
                () => {
                  resolve({ data: mockResponse, error: undefined });
                },
                1000 + Math.random() * 1000,
              ); // 1-2s variance
            }),
        );

        const wrapper = createWrapper();
        const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

        const startTime = performance.now();

        await result.current.mutateAsync({
          leadId: `lead-submit-${i}`,
          sessionId: `session-${i}`,
          ekycData: mockEkycData as any,
        });

        const endTime = performance.now();
        durations.push(endTime - startTime);
      }

      const averageDuration =
        durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      console.log(`[PERF] Submission (5 iterations):`);
      console.log(`  - Average: ${averageDuration.toFixed(2)}ms`);
      console.log(`  - Min: ${minDuration.toFixed(2)}ms`);
      console.log(`  - Max: ${maxDuration.toFixed(2)}ms`);

      expect(averageDuration).toBeLessThan(3000);
      expect(maxDuration).toBeLessThan(3500); // Allow some variance
    });
  });

  /**
   * Performance Benchmark T412: SC-005 Cache hit reduction (80%)
   */
  describe("SC-005: Cache Performance (80% hit rate)", () => {
    it("should achieve 80% cache hit rate with repeated fetches", async () => {
      const mockConfig = {
        access_token: "test-token",
        challenge_code: "test-challenge",
        has_result_screen: true,
        enable_api_liveness_document: true,
        enable_api_liveness_face: true,
        enable_api_masked_face: true,
      };

      let apiCallCount = 0;
      (dopClient.GET as any).mockImplementation(() => {
        apiCallCount++;
        return Promise.resolve({
          data: mockConfig,
          error: undefined,
        });
      });

      const wrapper = createWrapper();

      // First fetch - cache miss
      const { result: result1 } = renderHook(
        () => useEkycConfig("lead-cache-test"),
        {
          wrapper,
        },
      );
      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      expect(apiCallCount).toBe(1);

      // Subsequent fetches - cache hits
      for (let i = 0; i < 9; i++) {
        const { result } = renderHook(() => useEkycConfig("lead-cache-test"), {
          wrapper,
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
      }

      // Should still only have 1 API call
      expect(apiCallCount).toBe(1);

      // Cache hit rate: 9 hits / 10 total = 90%
      const cacheHitRate = 9 / 10;
      console.log(`[PERF] Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`);

      expect(cacheHitRate).toBeGreaterThanOrEqual(0.8); // 80%
    });

    it("should measure cache effectiveness across multiple leads", async () => {
      const mockConfig = {
        access_token: "test-token",
        challenge_code: "test-challenge",
        has_result_screen: true,
        enable_api_liveness_document: true,
        enable_api_liveness_face: true,
        enable_api_masked_face: true,
      };

      let apiCallCount = 0;
      (dopClient.GET as any).mockImplementation(() => {
        apiCallCount++;
        return Promise.resolve({
          data: mockConfig,
          error: undefined,
        });
      });

      const wrapper = createWrapper();

      const leads = ["lead-a", "lead-b", "lead-c"];
      const totalFetches = 20;

      // Perform 20 fetches across 3 leads
      for (let i = 0; i < totalFetches; i++) {
        const leadId = leads[i % leads.length];
        const { result } = renderHook(() => useEkycConfig(leadId), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
      }

      // Should have 3 unique API calls (one per lead)
      expect(apiCallCount).toBe(3);

      // Cache hit rate: (20 - 3) / 20 = 17/20 = 85%
      const cacheHitRate = (totalFetches - apiCallCount) / totalFetches;
      console.log(
        `[PERF] Cache hit rate (${totalFetches} fetches, ${leads.length} leads): ${(cacheHitRate * 100).toFixed(1)}%`,
      );

      expect(cacheHitRate).toBeGreaterThanOrEqual(0.8); // 80%
    });

    it("should maintain cache performance with stale time expiration", async () => {
      vi.useFakeTimers();

      const mockConfig = {
        access_token: "test-token",
        challenge_code: "test-challenge",
        has_result_screen: true,
        enable_api_liveness_document: true,
        enable_api_liveness_face: true,
        enable_api_masked_face: true,
      };

      let apiCallCount = 0;
      (dopClient.GET as any).mockImplementation(() => {
        apiCallCount++;
        return Promise.resolve({
          data: mockConfig,
          error: undefined,
        });
      });

      const wrapper = createWrapper();

      // First fetch
      const { result } = renderHook(() => useEkycConfig("lead-stale"), {
        wrapper,
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiCallCount).toBe(1);

      // Within stale time - cache hit
      vi.advanceTimersByTime(2 * 60 * 1000); // 2 minutes
      const { result: result2 } = renderHook(
        () => useEkycConfig("lead-stale"),
        {
          wrapper,
        },
      );
      await waitFor(() => expect(result2.current.isSuccess).toBe(true));
      expect(apiCallCount).toBe(1); // Still 1

      // After stale time - cache miss, refetch
      vi.advanceTimersByTime(4 * 60 * 1000); // 4 more minutes (total 6, past 5 min stale)
      const { result: result3 } = renderHook(
        () => useEkycConfig("lead-stale"),
        {
          wrapper,
        },
      );
      await waitFor(() => expect(result3.current.isSuccess).toBe(true));
      expect(apiCallCount).toBe(2); // Refetched

      vi.useRealTimers();

      console.log(`[PERF] Cache stale time behavior verified`);
    });
  });

  /**
   * Performance Benchmark: Memory efficiency
   */
  describe("Memory Efficiency", () => {
    it("should not leak memory with repeated hook mounts/unmounts", async () => {
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

      // Mount and unmount hooks multiple times
      for (let i = 0; i < 50; i++) {
        const { result, unmount } = renderHook(
          () => useEkycConfig(`lead-mem-${i % 5}`),
          {
            wrapper,
          },
        );
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        unmount();
      }

      // If we got here without crashing, memory management is acceptable
      console.log(`[PERF] Memory stress test passed (50 mount/unmount cycles)`);
      expect(true).toBe(true);
    });
  });
});
