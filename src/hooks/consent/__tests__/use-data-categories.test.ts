/**
 * useDataCategories Hook Tests
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { consentClient } from "@/lib/api/services";
import { useDataCategories } from "../use-data-categories";

vi.unmock("@tanstack/react-query");

describe("useDataCategories", () => {
  let queryClient: QueryClient;
  let mockGet: ReturnType<typeof vi.spyOn>;

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
    mockGet = vi.spyOn(consentClient, "GET");
  });

  it("fetches data categories from consent service", async () => {
    const categories = [
      {
        id: "cat-1",
        name: "Personal Information",
      },
      {
        id: "cat-2",
        name: "Device Information",
      },
    ];

    mockGet.mockResolvedValue({
      data: {
        categories,
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDataCategories(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(categories);
    expect(result.current.error).toBeNull();
    expect(mockGet).toHaveBeenCalledWith("/data-category", {
      params: {
        query: {
          page: 1,
          page_size: 100,
        },
      },
    });
  });

  it("returns empty array when API has no categories", async () => {
    mockGet.mockResolvedValue({
      data: {
        categories: [],
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useDataCategories({ consentPurposeId: "cp-1" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("handles API errors", async () => {
    const mockError = new Error("Failed to fetch data categories");
    mockGet.mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDataCategories(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
  });

  it("does not fetch when enabled is false", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useDataCategories({
          enabled: false,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("exposes refetch and triggers GET again", async () => {
    mockGet.mockResolvedValue({
      data: {
        categories: [{ id: "cat-3", name: "Location Data" }],
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDataCategories(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(typeof result.current.refetch).toBe("function");
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
