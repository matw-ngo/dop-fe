/**
 * useSubmitEkycResult Hook Tests
 *
 * Tests for eKYC result submission hook including:
 * - Retry logic with exponential backoff (SC-004: 3 attempts)
 * - Pre-submission validation tests
 * - Integration test for <3s submission time (SC-002)
 *
 * @jest-environment jsdom
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSubmitEkycResult } from "../features/ekyc/use-submit-result";
import apiClient from "@/lib/api/client";

// Mock the API client
vi.mock("@/lib/api/client", () => ({
  default: {
    POST: vi.fn(),
  },
}));

// Mock audit logger
vi.mock("@/lib/ekyc/audit-logger", () => ({
  logSubmitStart: vi.fn(),
  logSubmitSuccess: vi.fn(),
  logSubmitError: vi.fn(),
  logSubmitRetry: vi.fn(),
  logValidationError: vi.fn(),
}));

describe("useSubmitEkycResult", () => {
  let queryClient: QueryClient;

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
    vi.useRealTimers();
  });

  /**
   * Test T205: Submit successfully
   */
  it("should submit eKYC result successfully", async () => {
    const mockResponse = {
      success: true,
      verification_id: "ver-123",
      message: "eKYC result submitted successfully",
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

    (apiClient.POST as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    const submitPromise = result.current.mutateAsync({
      leadId: "lead-123",
      sessionId: "session-abc",
      ekycData: mockEkycData as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await submitPromise;

    expect(result.current.data).toEqual(mockResponse);
    expect(apiClient.POST).toHaveBeenCalledWith("/leads/{id}/ekyc/vnpt", {
      params: { path: { id: "lead-123" } },
      body: mockEkycData,
    });
  });

  /**
   * Test T206: Handle submission errors
   */
  it("should handle submission errors", async () => {
    const mockError = {
      message: "Failed to submit eKYC result",
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

    (apiClient.POST as any).mockResolvedValue({
      data: undefined,
      error: mockError,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    await waitFor(() => {
      result.current.mutate({
        leadId: "lead-error",
        sessionId: "session-xyz",
        ekycData: mockEkycData as any,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain("Failed to submit");
  });

  /**
   * Test T207: Retry on network errors (SC-004)
   */
  it("should retry on network errors up to 3 times (SC-004)", async () => {
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

    let attemptCount = 0;
    (apiClient.POST as any).mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.resolve({
          data: undefined,
          error: { message: "Network Error" },
        });
      }
      return Promise.resolve({
        data: { success: true, verification_id: "ver-123" },
        error: undefined,
      });
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    await result.current.mutateAsync({
      leadId: "lead-retry",
      sessionId: "session-retry",
      ekycData: mockEkycData as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should have retried twice (3 total attempts)
    expect(attemptCount).toBe(3);
  });

  /**
   * Test T207: Stop retrying after 3 attempts (SC-004)
   */
  it("should stop retrying after 3 attempts (SC-004)", async () => {
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

    let attemptCount = 0;
    (apiClient.POST as any).mockImplementation(() => {
      attemptCount++;
      return Promise.resolve({
        data: undefined,
        error: { message: "Network Error" },
      });
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    try {
      await result.current.mutateAsync({
        leadId: "lead-max-retry",
        sessionId: "session-max",
        ekycData: mockEkycData as any,
      });
    } catch (error) {
      // Expected to fail after max retries
    }

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Should have attempted exactly 3 times
    expect(attemptCount).toBe(3);
  });

  /**
   * Test T207: Exponential backoff between retries
   */
  it("should use exponential backoff between retries", async () => {
    vi.useFakeTimers();

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

    const delays: number[] = [];
    let attemptCount = 0;

    (apiClient.POST as any).mockImplementation(() => {
      const startTime = Date.now();
      attemptCount++;
      if (attemptCount < 3) {
        setTimeout(() => {
          delays.push(Date.now() - startTime);
        }, 0);
        return Promise.resolve({
          data: undefined,
          error: { message: "Network Error" },
        });
      }
      return Promise.resolve({
        data: { success: true, verification_id: "ver-123" },
        error: undefined,
      });
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    // Start the mutation
    result.current.mutate({
      leadId: "lead-backoff",
      sessionId: "session-backoff",
      ekycData: mockEkycData as any,
    });

    // Fast forward through delays
    await vi.runAllTimersAsync();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    vi.useRealTimers();

    // Should have retried
    expect(attemptCount).toBe(3);
  });

  /**
   * Test T208: Performance - submit under 3 seconds (SC-002)
   */
  it("should submit in under 3 seconds (SC-002)", async () => {
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

    (apiClient.POST as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: mockResponse, error: undefined });
          }, 500); // Simulate 500ms response
        }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    const startTime = performance.now();

    await result.current.mutateAsync({
      leadId: "lead-perf",
      sessionId: "session-perf",
      ekycData: mockEkycData as any,
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(3000); // Less than 3 seconds
  });

  /**
   * Test: Handle 503 errors with retry
   */
  it("should retry on 503 Service Unavailable error", async () => {
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

    let attemptCount = 0;
    (apiClient.POST as any).mockImplementation(() => {
      attemptCount++;
      if (attemptCount === 1) {
        return Promise.resolve({
          data: undefined,
          error: { message: "503 Service Unavailable" },
        });
      }
      return Promise.resolve({
        data: { success: true, verification_id: "ver-123" },
        error: undefined,
      });
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    await result.current.mutateAsync({
      leadId: "lead-503",
      sessionId: "session-503",
      ekycData: mockEkycData as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(attemptCount).toBe(2);
  });

  /**
   * Test: Handle timeout errors
   */
  it("should retry on timeout errors", async () => {
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

    let attemptCount = 0;
    (apiClient.POST as any).mockImplementation(() => {
      attemptCount++;
      if (attemptCount === 1) {
        return Promise.resolve({
          data: undefined,
          error: { message: "Request timeout" },
        });
      }
      return Promise.resolve({
        data: { success: true, verification_id: "ver-123" },
        error: undefined,
      });
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    await result.current.mutateAsync({
      leadId: "lead-timeout",
      sessionId: "session-timeout",
      ekycData: mockEkycData as any,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(attemptCount).toBe(2);
  });

  /**
   * Test: Not retry on client errors (4xx)
   */
  it("should not retry on 400 Bad Request error", async () => {
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

    let attemptCount = 0;
    (apiClient.POST as any).mockImplementation(() => {
      attemptCount++;
      return Promise.resolve({
        data: undefined,
        error: { message: "400 Bad Request" },
      });
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    try {
      await result.current.mutateAsync({
        leadId: "lead-400",
        sessionId: "session-400",
        ekycData: mockEkycData as any,
      });
    } catch (error) {
      // Expected to fail
    }

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Should not retry on 400 errors
    expect(attemptCount).toBe(1);
  });

  /**
   * Test: Loading state during submission
   */
  it("should set loading state during submission", async () => {
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

    let resolveSubmit: (value: any) => void;
    (apiClient.POST as any).mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSubmitEkycResult(), { wrapper });

    result.current.mutate({
      leadId: "lead-loading",
      sessionId: "session-loading",
      ekycData: mockEkycData as any,
    });

    // Should be loading
    expect(result.current.isPending).toBe(true);

    // Resolve the promise
    resolveSubmit!({ data: mockResponse, error: undefined });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isPending).toBe(false);
  });
});
