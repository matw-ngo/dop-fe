/**
 * useConsentVersion Hook Tests
 *
 * Tests for consent version fetching hook including:
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
import { useConsentVersion } from "../use-consent-version";

// Mock API client at module level
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
  },
}));

// Mock TanStack Query to use actual implementation in tests
vi.unmock("@tanstack/react-query");

describe("useConsentVersion", () => {
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
   * Test: Fetch latest consent version successfully
   */
  it("should fetch consent versions successfully", async () => {
    const mockResponse = {
      consent_versions: [
        {
          id: "cv-1",
          consent_purpose_id: "cp-1",
          version: 1,
          content: "Privacy Policy v1",
          document_url: "https://example.com/privacy-v1.pdf",
          effective_date: "2025-01-01T00:00:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
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
    const { result } = renderHook(() => useConsentVersion(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/consent-version", {
      params: {
        query: {
          consent_purpose_id: undefined,
          search: undefined,
          page: 1,
          page_size: 10,
        },
      },
    });
  });

  /**
   * Test: Fetch with query parameters (consentPurposeId)
   */
  it("should fetch consent versions with consentPurposeId", async () => {
    const mockResponse = {
      consent_versions: [
        {
          id: "cv-2",
          consent_purpose_id: "cp-2",
          version: 2,
          content: "Terms of Service v2",
          document_url: "https://example.com/terms-v2.pdf",
          effective_date: "2025-01-15T00:00:00Z",
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

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useConsentVersion({
          consentPurposeId: "cp-2",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/consent-version", {
      params: {
        query: {
          consent_purpose_id: "cp-2",
          search: undefined,
          page: 1,
          page_size: 10,
        },
      },
    });
  });

  /**
   * Test: Fetch with search query parameter
   */
  it("should fetch consent versions with search query", async () => {
    const mockResponse = {
      consent_versions: [
        {
          id: "cv-3",
          consent_purpose_id: "cp-3",
          version: 3,
          content: "Privacy Policy v3",
          document_url: "https://example.com/privacy-v3.pdf",
          effective_date: "2025-01-20T00:00:00Z",
          created_at: "2025-01-20T00:00:00Z",
          updated_at: "2025-01-20T00:00:00Z",
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
      () =>
        useConsentVersion({
          search: "privacy",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/consent-version", {
      params: {
        query: {
          consent_purpose_id: undefined,
          search: "privacy",
          page: 1,
          page_size: 10,
        },
      },
    });
  });

  /**
   * Test: Fetch with pagination parameters
   */
  it("should fetch consent versions with pagination parameters", async () => {
    const mockResponse = {
      consent_versions: [
        {
          id: "cv-4",
          consent_purpose_id: "cp-4",
          version: 4,
          content: "Cookie Policy v4",
          document_url: "https://example.com/cookie-v4.pdf",
          effective_date: "2025-01-25T00:00:00Z",
          created_at: "2025-01-25T00:00:00Z",
          updated_at: "2025-01-25T00:00:00Z",
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
        useConsentVersion({
          page: 2,
          pageSize: 20,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/consent-version", {
      params: {
        query: {
          consent_purpose_id: undefined,
          search: undefined,
          page: 2,
          page_size: 20,
        },
      },
    });
  });

  /**
   * Test: Fetch with all query parameters combined
   */
  it("should fetch consent versions with all query parameters combined", async () => {
    const mockResponse = {
      consent_versions: [
        {
          id: "cv-5",
          consent_purpose_id: "cp-5",
          version: 5,
          content: "Data Processing Agreement v5",
          document_url: "https://example.com/dpa-v5.pdf",
          effective_date: "2025-01-30T00:00:00Z",
          created_at: "2025-01-30T00:00:00Z",
          updated_at: "2025-01-30T00:00:00Z",
        },
      ],
      pagination: {
        page: 1,
        page_size: 10,
        total_count: 5,
      },
    };

    (apiClient.GET as any).mockResolvedValue({
      data: mockResponse,
      error: undefined,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useConsentVersion({
          consentPurposeId: "cp-5",
          search: "agreement",
          page: 1,
          pageSize: 10,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/consent-version", {
      params: {
        query: {
          consent_purpose_id: "cp-5",
          search: "agreement",
          page: 1,
          page_size: 10,
        },
      },
    });
  });

  /**
   * Test: Sets loading state correctly during fetch
   */
  it("should set loading state correctly during fetch", async () => {
    const mockResponse = {
      consent_versions: [
        {
          id: "cv-6",
          consent_purpose_id: "cp-6",
          version: 6,
          content: "Consent Form v6",
          document_url: "https://example.com/consent-v6.pdf",
          effective_date: "2025-02-01T00:00:00Z",
          created_at: "2025-02-01T00:00:00Z",
          updated_at: "2025-02-01T00:00:00Z",
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
    const { result } = renderHook(() => useConsentVersion(), { wrapper });

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
    const mockError = new Error("Failed to fetch consent versions");

    (apiClient.GET as any).mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConsentVersion(), { wrapper });

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
    const { result } = renderHook(() => useConsentVersion(), { wrapper });

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
        useConsentVersion({
          enabled: false,
        }),
      { wrapper },
    );

    // Should not be loading since enabled=false
    expect(result.current.isLoading).toBe(false);
    expect(apiClient.GET).not.toHaveBeenCalled();
  });
});
