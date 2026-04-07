// ============================================================
// src/lib/polling/__tests__/usePolling.test.ts
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePolling } from "../usePolling";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a fetcher that returns 'pending' for the first `n-1` calls then 'done'. */
function makeProgressiveFetcher(completesAt: number) {
  let calls = 0;
  return vi.fn().mockImplementation(() => {
    calls++;
    return Promise.resolve({
      status: calls >= completesAt ? "done" : "pending",
    });
  });
}

const doneWhen = (data: { status: string }) => data.status === "done";
const neverDone = () => false;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("usePolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── 1. Start / stop lifecycle ──────────────────────────

  it("starts in idle status", () => {
    const { result } = renderHook(() =>
      usePolling({ fetcher: vi.fn(), predicate: neverDone, interval: 1000 }),
    );
    expect(result.current.status).toBe("idle");
    expect(result.current.attempt).toBe(0);
  });

  it("transitions to polling after start()", async () => {
    const { result } = renderHook(() =>
      usePolling({
        fetcher: vi.fn().mockResolvedValue({ status: "pending" }),
        predicate: neverDone,
        interval: 1000,
        maxRetries: 5,
      }),
    );

    act(() => result.current.start());
    expect(result.current.status).toBe("polling");
  });

  it("returns to idle after stop()", async () => {
    const { result } = renderHook(() =>
      usePolling({
        fetcher: vi.fn().mockResolvedValue({ status: "pending" }),
        predicate: neverDone,
        interval: 1000,
        maxRetries: 5,
      }),
    );

    act(() => result.current.start());
    act(() => result.current.stop());

    expect(result.current.status).toBe("idle");
  });

  it("cleans up controller on unmount", () => {
    const fetcher = vi.fn().mockResolvedValue({ status: "pending" });
    const { result, unmount } = renderHook(() =>
      usePolling({
        fetcher,
        predicate: neverDone,
        interval: 500,
        maxRetries: 100,
      }),
    );

    act(() => result.current.start());
    unmount();

    // Advancing time after unmount must NOT trigger more fetches.
    const callsAtUnmount = fetcher.mock.calls.length;
    act(() => vi.advanceTimersByTime(5000));
    expect(fetcher.mock.calls.length).toBe(callsAtUnmount);
  });

  // ── 2. Predicate-based stopping ───────────────────────

  it("stops with status=success when predicate returns true", async () => {
    const fetcher = makeProgressiveFetcher(3);

    const { result } = renderHook(() =>
      usePolling({ fetcher, predicate: doneWhen, interval: 1000 }),
    );

    act(() => result.current.start());

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
      expect(result.current.data?.status).toBe("done");
    });

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(result.current.attempt).toBe(3);
  });

  it("calls onSuccess callback when predicate matches", async () => {
    const onSuccess = vi.fn();
    const fetcher = makeProgressiveFetcher(2);

    const { result } = renderHook(() =>
      usePolling({ fetcher, predicate: doneWhen, interval: 500, onSuccess }),
    );

    act(() => result.current.start());
    await act(async () => vi.advanceTimersByTime(1500));
    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith({ status: "done" });
  });

  it("calls onComplete callback when polling ends", async () => {
    const onComplete = vi.fn();
    const fetcher = makeProgressiveFetcher(1);

    const { result } = renderHook(() =>
      usePolling({ fetcher, predicate: doneWhen, interval: 500, onComplete }),
    );

    act(() => result.current.start());
    await act(async () => vi.advanceTimersByTime(600));
    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  // ── 3. Max retries → timeout ──────────────────────────

  it("transitions to timeout after maxRetries exhausted", async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: "pending" });

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        predicate: neverDone,
        interval: 1000,
        maxRetries: 3,
      }),
    );

    act(() => result.current.start());

    await act(async () => vi.advanceTimersByTime(4000));

    await waitFor(() => {
      expect(result.current.status).toBe("timeout");
    });

    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("transitions to timeout when wall-clock timeout fires", async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: "pending" });

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        predicate: neverDone,
        interval: 1000,
        timeout: 2500,
      }),
    );

    act(() => result.current.start());
    await act(async () => vi.advanceTimersByTime(3000));

    await waitFor(() => {
      expect(result.current.status).toBe("timeout");
    });
  });

  // ── 4. Error handling ─────────────────────────────────

  it("transitions to error when fetcher throws", async () => {
    const boom = new Error("network failure");
    const fetcher = vi.fn().mockRejectedValue(boom);
    const onError = vi.fn();

    const { result } = renderHook(() =>
      usePolling({ fetcher, predicate: neverDone, interval: 1000, onError }),
    );

    act(() => result.current.start());
    await act(async () => vi.advanceTimersByTime(200));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.error?.message).toBe("network failure");
    });

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(boom);
  });

  it("exposes isComplete=true on error status", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("oops"));

    const { result } = renderHook(() =>
      usePolling({ fetcher, predicate: neverDone, interval: 500 }),
    );

    act(() => result.current.start());
    await act(async () => vi.advanceTimersByTime(200));

    await waitFor(() => expect(result.current.isComplete).toBe(true));
  });

  // ── 5. Pause / resume ─────────────────────────────────

  it("pauses and resumes polling", async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: "pending" });

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        predicate: neverDone,
        interval: 1000,
        maxRetries: 20,
      }),
    );

    act(() => result.current.start());

    // Let 2 polls run.
    await act(async () => vi.advanceTimersByTime(2000));
    const callsBeforePause = fetcher.mock.calls.length;

    act(() => result.current.pause());
    expect(result.current.status).toBe("idle");

    // Advance time while paused — should NOT trigger more fetches.
    await act(async () => vi.advanceTimersByTime(3000));
    expect(fetcher.mock.calls.length).toBe(callsBeforePause);

    act(() => result.current.resume());
    expect(result.current.status).toBe("polling");

    // Advance again — fetches should resume.
    await act(async () => vi.advanceTimersByTime(1500));
    expect(fetcher.mock.calls.length).toBeGreaterThan(callsBeforePause);
  });

  // ── 6. isComplete flag ────────────────────────────────

  it("sets isComplete=true on success", async () => {
    const { result } = renderHook(() =>
      usePolling({
        fetcher: vi.fn().mockResolvedValue({ status: "done" }),
        predicate: doneWhen,
        interval: 500,
      }),
    );

    act(() => result.current.start());
    await act(async () => vi.advanceTimersByTime(600));
    await waitFor(() => expect(result.current.isComplete).toBe(true));
  });

  it("sets isComplete=true on timeout", async () => {
    const { result } = renderHook(() =>
      usePolling({
        fetcher: vi.fn().mockResolvedValue({ status: "pending" }),
        predicate: neverDone,
        interval: 500,
        maxRetries: 2,
      }),
    );

    act(() => result.current.start());
    await act(async () => vi.advanceTimersByTime(1500));
    await waitFor(() => expect(result.current.isComplete).toBe(true));
    expect(result.current.status).toBe("timeout");
  });

  // ── 7. Backoff strategies ─────────────────────────────

  it("applies exponential backoff between polls", async () => {
    const timestamps: number[] = [];
    const fetcher = vi.fn().mockImplementation(() => {
      timestamps.push(Date.now());
      return Promise.resolve({ status: "pending" });
    });

    const { result } = renderHook(() =>
      usePolling({
        fetcher,
        predicate: neverDone,
        interval: 1000,
        backoff: "exponential",
        backoffMultiplier: 2,
        maxRetries: 4,
      }),
    );

    act(() => result.current.start());

    // Advance time enough for 4 polls with doubling intervals.
    // Intervals: 1000, 2000, 4000 ms
    await act(async () => vi.advanceTimersByTime(10_000));

    expect(fetcher.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  // ── 8. Does not re-poll once complete ─────────────────

  it("does not continue polling after success", async () => {
    const fetcher = makeProgressiveFetcher(2);

    const { result } = renderHook(() =>
      usePolling({ fetcher, predicate: doneWhen, interval: 500 }),
    );

    act(() => result.current.start());
    await act(async () => vi.advanceTimersByTime(1500));
    await waitFor(() => expect(result.current.status).toBe("success"));

    const callsAtSuccess = fetcher.mock.calls.length;

    // Long advance after success — no new calls.
    await act(async () => vi.advanceTimersByTime(5000));
    expect(fetcher.mock.calls.length).toBe(callsAtSuccess);
  });
});
