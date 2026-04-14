// ============================================================
// src/lib/polling/PollingController.ts
//
// Vanilla TypeScript class — no React, no Zustand dependency.
// Designed so it can be instantiated inside a React hook, a
// Zustand action, a Web Worker, or a plain Node.js script.
//
// Lifecycle:
//   idle ──start()──► polling ──predicate true──► success
//                          └──max retries/timeout──► timeout
//                          └──fetch throws──► error
//   polling ──pause()──► idle ──resume()──► polling
//   polling / idle ──stop()──► idle  (subscribers notified)
// ============================================================

import type { PollingConfig, PollingState, PollingStatus } from "./types";

export class PollingController<T> {
  private config: Required<
    Pick<PollingConfig<T>, "interval" | "backoff" | "backoffMultiplier">
  > &
    PollingConfig<T>;

  private state: PollingState<T>;

  // ── Timers ──────────────────────────────────────────────
  /** setInterval handle for the polling loop. */
  private timer: ReturnType<typeof setInterval> | null = null;
  /** setTimeout handle for the hard timeout ceiling. */
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;

  // ── In-flight request cancellation ──────────────────────
  private abortController: AbortController | null = null;

  // ── Observer pattern ─────────────────────────────────────
  private subscribers: Set<(state: PollingState<T>) => void> = new Set();

  // ── Internal flag to differentiate pause vs full stop ───
  private _paused = false;

  constructor(config: PollingConfig<T>) {
    this.config = {
      backoff: "fixed",
      backoffMultiplier: 1.5,
      ...config,
    };

    this.state = {
      data: null,
      status: "idle",
      error: null,
      attempt: 0,
    };
  }

  // ── Public API ──────────────────────────────────────────

  start(): void {
    if (this.state.status === "polling") return;

    this._paused = false;
    this.setState({ status: "polling", attempt: 0, error: null });
    this._setupTimeoutTimer();
    this._scheduleNextPoll(0); // immediate first poll
  }

  stop(): void {
    this._clearTimers();
    this.abortController?.abort();
    this._paused = false;
    this.setState({ status: "idle" });
    this.config.onComplete?.(this.state.data);
  }

  /**
   * Temporarily halt polling without resetting attempt count.
   * Use for Page Visibility API integration.
   */
  pause(): void {
    if (this.state.status !== "polling") return;
    this._clearTimers();
    this.abortController?.abort();
    this._paused = true;
    this.setState({ status: "idle" });
  }

  /**
   * Resume a previously paused controller.
   * Does nothing if the controller was stopped (not paused).
   */
  resume(): void {
    if (!this._paused) return;
    this._paused = false;
    this.setState({ status: "polling" });
    this._scheduleNextPoll(0); // immediate re-poll on resume
  }

  getState(): Readonly<PollingState<T>> {
    return this.state;
  }

  getStatus(): PollingStatus {
    return this.state.status;
  }

  /**
   * Register a callback that is called whenever the state changes.
   * Returns an unsubscribe function.
   */
  subscribe(callback: (state: PollingState<T>) => void): () => void {
    this.subscribers.add(callback);
    // Emit current state immediately so new subscribers are in sync.
    callback({ ...this.state });
    return () => this.subscribers.delete(callback);
  }

  // ── Private helpers ─────────────────────────────────────

  private setState(partial: Partial<PollingState<T>>): void {
    this.state = { ...this.state, ...partial };
    this._notify();
  }

  private _notify(): void {
    const snapshot = { ...this.state };
    this.subscribers.forEach((cb) => cb(snapshot));
  }

  private _setupTimeoutTimer(): void {
    const { timeout } = this.config;
    if (!timeout) return;

    this.timeoutTimer = setTimeout(() => {
      if (this.state.status === "polling") {
        this._clearTimers();
        this.abortController?.abort();
        this.setState({ status: "timeout" });
        this.config.onComplete?.(this.state.data);
      }
    }, timeout);
  }

  /**
   * Schedule the next poll tick after `delay` ms.
   * Uses `setTimeout` (not `setInterval`) so we never overlap
   * with a still-running request.
   */
  private _scheduleNextPoll(delay: number): void {
    this.timer = setTimeout(() => this._executePoll(), delay);
  }

  private async _executePoll(): Promise<void> {
    // Guard: another code-path may have stopped us between schedule and execute.
    if (this.state.status !== "polling") return;

    const { maxRetries } = this.config;

    // Check retry ceiling BEFORE fetching.
    if (maxRetries !== undefined && this.state.attempt >= maxRetries) {
      this._clearTimers();
      this.setState({ status: "timeout" });
      this.config.onComplete?.(this.state.data);
      return;
    }

    // Fresh AbortController for this single request.
    this.abortController = new AbortController();

    let data: T;
    const nextAttempt = this.state.attempt + 1;

    try {
      data = await this.config.fetcher();
    } catch (err) {
      // Ignore AbortError — it means pause/stop was called mid-flight.
      if ((err as DOMException)?.name === "AbortError") return;

      const error = err instanceof Error ? err : new Error(String(err));
      this._clearTimers();
      this.setState({ status: "error", error, attempt: nextAttempt });
      this.config.onError?.(error);
      this.config.onComplete?.(this.state.data);
      return;
    }

    // Re-check status after the async fetch (the world may have changed).
    if (this.state.status !== "polling") return;

    this.setState({ data, attempt: nextAttempt });

    if (this.config.predicate(data)) {
      this._clearTimers();
      this.setState({ status: "success" });
      this.config.onSuccess?.(data);
      this.config.onComplete?.(data);
      return;
    }

    // Not done — schedule the next tick with the configured backoff.
    const nextInterval = this._computeNextInterval(nextAttempt);
    this._scheduleNextPoll(nextInterval);
  }

  /**
   * Compute the effective interval for the next poll based on the backoff
   * strategy and the number of attempts already made.
   */
  private _computeNextInterval(attempt: number): number {
    const { interval, backoff, backoffMultiplier } = this.config;
    switch (backoff) {
      case "linear":
        return interval + interval * backoffMultiplier * (attempt - 1);
      case "exponential":
        return interval * Math.pow(backoffMultiplier, attempt - 1);
      case "fixed":
      default:
        return interval;
    }
  }

  private _clearTimers(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.timeoutTimer !== null) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }
}
