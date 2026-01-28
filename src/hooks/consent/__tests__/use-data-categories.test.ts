/**
 * useDataCategories Hook Tests
 *
 * Tests for data categories fetching hook including:
 * - Fetch success scenarios
 * - Loading state management
 * - Error handling for API failures
 * - Consent purpose ID filtering
 * - Enabled flag behavior
 *
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/api/client";
import { useDataCategories } from "../use-data-categories";

// Mock API client at module level
vi.mock("@/lib/api/client", () => ({
  default: {
    GET: vi.fn(),
  },
}));

// Mock TanStack Query to use actual implementation in tests
vi.unmock("@tanstack/react-query");

describe("useDataCategories", () => {
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
   * Test: Fetches all data categories successfully
   */
  it("should fetch data categories successfully", async () => {
    const mockResponse = {
      categories: [
        {
          id: "dc-1",
          name: "personal_data",
          description: "Personal information collected from users",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "dc-2",
          name: "financial_data",
          description: "Financial and banking information",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
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
    const { result } = renderHook(() => useDataCategories(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/data-categories", {
      params: {
        query: {
          consent_purpose_id: undefined,
        },
      },
    });
  });

  /**
   * Test: Fetch data categories with consentPurposeId filter
   */
  it("should fetch data categories with consentPurposeId", async () => {
    const mockResponse = {
      categories: [
        {
          id: "dc-3",
          name: "contact_data",
          description: "Contact information for communication",
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
    const { result } = renderHook(
      () =>
        useDataCategories({
          consentPurposeId: "cp-1",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(apiClient.GET).toHaveBeenCalledWith("/data-categories", {
      params: {
        query: {
          consent_purpose_id: "cp-1",
        },
      },
    });
  });

  /**
   * Test: Returns categories list with pagination metadata
   */
  it("should return categories list with pagination metadata", async () => {
    const mockResponse = {
      categories: [
        {
          id: "dc-4",
          name: "location_data",
          description: "Geographic and location information",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "dc-5",
          name: "behavioral_data",
          description: "User behavioral and usage patterns",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "dc-6",
          name: "device_data",
          description: "Device and browser information",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
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
    const { result } = renderHook(() => useDataCategories(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  /**
   * Test: Handles API error and sets error state
   */
  it("should handle API error and set error state", async () => {
    const mockError = new Error("Failed to fetch data categories");

    (apiClient.GET as any).mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDataCategories(), { wrapper });

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
    const { result } = renderHook(() => useDataCategories(), { wrapper });

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
      categories: [
        {
          id: "dc-7",
          name: "preference_data",
          description: "User preferences and settings",
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

    let resolveFetch: (value: any) => void;
    (apiClient.GET as any).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDataCategories(), { wrapper });

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
        useDataCategories({
          enabled: false,
        }),
      { wrapper },
    );

    // Should not be loading since enabled=false
    expect(result.current.isLoading).toBe(false);
    expect(apiClient.GET).not.toHaveBeenCalled();
  });
});
