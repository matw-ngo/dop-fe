/**
 * useConfigIds Hook Tests
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { consentClient } from "@/lib/api/services";
import { useConfigIds } from "../use-config-ids";

vi.unmock("@tanstack/react-query");

describe("useConfigIds", () => {
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

  it("fetches config ids from consent service", async () => {
    const mockResponse = {
      controller_id: "controller-123",
      processor_id: "processor-456",
      consent_purpose_id: "purpose-789",
    };

    mockGet.mockResolvedValue({
      data: mockResponse,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
    expect(mockGet).toHaveBeenCalledWith("/config/ids", {
      params: {},
    });
  });

  it("handles API errors", async () => {
    const mockError = new Error("Failed to fetch config IDs");
    mockGet.mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
  });

  it("does not fetch when enabled is false", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useConfigIds({
          enabled: false,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("exposes refetch and triggers GET again", async () => {
    const mockResponse = {
      controller_id: "controller-refetch",
      processor_id: "processor-refetch",
    };

    mockGet.mockResolvedValue({
      data: mockResponse,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConfigIds(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(typeof result.current.refetch).toBe("function");
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
