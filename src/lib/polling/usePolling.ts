// ============================================================
// src/lib/polling/usePolling.ts
//
// React hook that wraps PollingController.
// Handles:
//   • Controller lifecycle tied to component mount/unmount
//   • Page Visibility API — auto-pause / auto-resume
//   • Stable callback references via useRef to avoid stale closures
// ============================================================

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type DependencyList,
} from "react";
import { PollingController } from "./PollingController";
import type { PollingConfig, PollingState } from "./types";

// Re-export so callers don't need to import from two places.
export type { PollingConfig, PollingState };

export interface UsePollingResult<T> extends PollingState<T> {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  /** True when the polling has reached a terminal state (success/error/timeout). */
  isComplete: boolean;
}

/**
 * `usePolling` manages a `PollingController` instance for the lifetime of the
 * component.  The config object is intentionally **not** a dependency — the
 * hook captures the *initial* config and uses stable refs for callbacks so
 * callers don't need to memoize every option.
 *
 * To restart polling with a different `fetcher` / `predicate`, unmount and
 * remount the component (or pass a `key` prop to force re-creation).
 */
export function usePolling<T>(
  config: PollingConfig<T>,
  /** Extra deps that trigger controller recreation (e.g. a leadId). */
  deps: DependencyList = [],
): UsePollingResult<T> {
  const controllerRef = useRef<PollingController<T> | null>(null);

  // Keep latest callback refs so mutations inside the component don't
  // cause stale closure bugs inside the controller.
  const onSuccessRef = useRef(config.onSuccess);
  const onErrorRef = useRef(config.onError);
  const onCompleteRef = useRef(config.onComplete);

  useEffect(() => {
    onSuccessRef.current = config.onSuccess;
  }, [config.onSuccess]);
  useEffect(() => {
    onErrorRef.current = config.onError;
  }, [config.onError]);
  useEffect(() => {
    onCompleteRef.current = config.onComplete;
  }, [config.onComplete]);

  const [state, setState] = useState<PollingState<T>>({
    data: null,
    status: "idle",
    error: null,
    attempt: 0,
  });

  // ── Controller creation / teardown ──────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const controller = new PollingController<T>({
      ...config,
      // Route callbacks through refs so the controller always calls the
      // latest version even after re-renders.
      onSuccess: (data) => onSuccessRef.current?.(data),
      onError: (err) => onErrorRef.current?.(err),
      onComplete: (data) => onCompleteRef.current?.(data),
    });

    controllerRef.current = controller;
    const unsubscribe = controller.subscribe(setState);

    return () => {
      unsubscribe();
      controller.stop();
      controllerRef.current = null;
    };
    // `deps` is spread intentionally — callers control recreation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // ── Page Visibility API — auto-pause / auto-resume ──────
  useEffect(() => {
    const handleVisibilityChange = () => {
      const ctrl = controllerRef.current;
      if (!ctrl) return;

      if (document.hidden) {
        ctrl.pause();
      } else {
        ctrl.resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ── Stable action callbacks ──────────────────────────────
  const start = useCallback(() => controllerRef.current?.start(), []);
  const stop = useCallback(() => controllerRef.current?.stop(), []);
  const pause = useCallback(() => controllerRef.current?.pause(), []);
  const resume = useCallback(() => controllerRef.current?.resume(), []);

  const isComplete =
    state.status === "success" ||
    state.status === "error" ||
    state.status === "timeout";

  return { ...state, start, stop, pause, resume, isComplete };
}
