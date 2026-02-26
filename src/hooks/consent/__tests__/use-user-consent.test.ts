/**
 * useUserConsent Hook Tests
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { consentClient } from "@/lib/api/services";
import useUserConsent from "../use-user-consent";

vi.unmock("@tanstack/react-query");

describe("useUserConsent", () => {
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

  it("fetches current granted consent by session id", async () => {
    const mockConsent = {
      id: "consent-1",
      session_id: "session-123",
      consent_version_id: "version-1",
      action: "grant",
    };

    mockGet.mockResolvedValue({
      data: {
        consents: [mockConsent],
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ sessionId: "session-123" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockConsent);
    expect(result.current.error).toBeNull();
    expect(mockGet).toHaveBeenCalledWith("/consent", {
      params: {
        query: {
          session_id: "session-123",
          action: "grant",
        },
      },
    });
  });

  it("returns null when consent list is empty", async () => {
    mockGet.mockResolvedValue({
      data: {
        consents: [],
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ sessionId: "session-empty" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles API errors", async () => {
    const mockError = new Error("Failed to fetch user consent");
    mockGet.mockRejectedValue(mockError);

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ sessionId: "session-error" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
  });

  it("does not fetch when sessionId is missing", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ sessionId: undefined }),
      {
        wrapper,
      },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("does not fetch when enabled is false", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useUserConsent({
          sessionId: "session-123",
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
        consents: [{ id: "consent-refetch", session_id: "session-refetch" }],
      },
    });

    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUserConsent({ sessionId: "session-refetch" }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(typeof result.current.refetch).toBe("function");
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
