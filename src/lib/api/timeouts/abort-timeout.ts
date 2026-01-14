/**
 * Configurable API Timeout AbortController Integration
 *
 * This file provides AbortController-based timeout functionality with
 * fallback for older browsers that don't support AbortSignal.timeout().
 *
 * @feature 002-configurable-api-timeout
 * @module abort-timeout
 */

/**
 * Creates an AbortSignal that aborts after the specified timeout
 *
 * Uses native AbortSignal.timeout() if available (Chrome 103+, Firefox 115+, Safari 16.4+)
 * with a fallback to setTimeout() + AbortController.abort() for older browsers.
 *
 * @param timeout - Timeout duration in milliseconds
 * @returns AbortSignal that aborts after timeout
 *
 * @example
 * ```typescript
 * const signal = createTimeoutSignal(5000);
 * fetch('/api/endpoint', { signal })
 *   .then(response => response.json())
 *   .catch(error => {
 *     if (error.name === 'AbortError') {
 *       console.log('Request timed out');
 *     }
 *   });
 * ```
 */
export function createTimeoutSignal(timeout: number): AbortSignal {
  // Check if native AbortSignal.timeout() is available
  if ("timeout" in AbortSignal) {
    return (AbortSignal as any).timeout(timeout);
  }

  // Fallback for older browsers
  const controller = new AbortController();
  const signal = controller.signal;

  setTimeout(() => {
    controller.abort();
  }, timeout);

  return signal;
}

/**
 * Creates an AbortSignal with manual abort capability
 *
 * Returns both the signal and the controller, allowing manual abort
 * before the timeout occurs (e.g., for user cancellation).
 *
 * @param timeout - Timeout duration in milliseconds
 * @returns Object with signal and controller
 *
 * @example
 * ```typescript
 * const { signal, controller } = createTimeoutController(5000);
 *
 * // Manual abort (e.g., user cancellation)
 * cancelButton.addEventListener('click', () => {
 *   controller.abort();
 * });
 *
 * fetch('/api/endpoint', { signal })
 *   .then(response => response.json())
 *   .catch(error => {
 *     if (error.name === 'AbortError') {
 *       console.log('Request was cancelled or timed out');
 *     }
 *   });
 * ```
 */
export function createTimeoutController(timeout: number): {
  signal: AbortSignal;
  controller: AbortController;
  timeoutId: ReturnType<typeof setTimeout>;
} {
  const controller = new AbortController();
  const signal = controller.signal;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  return { signal, controller, timeoutId };
}

/**
 * Wraps a Promise with timeout functionality
 *
 * Creates a Promise that rejects with AbortError if the timeout
 * occurs before the original Promise resolves.
 *
 * @param promise - The Promise to wrap
 * @param timeout - Timeout duration in milliseconds
 * @returns Promise that rejects on timeout
 *
 * @example
 * ```typescript
 * try {
 *   const result = await withTimeout(
 *     fetch('/api/endpoint').then(r => r.json()),
 *     5000
 *   );
 *   console.log(result);
 * } catch (error) {
 *   if (error.name === 'AbortError') {
 *     console.log('Request timed out after 5 seconds');
 *   }
 * }
 * ```
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
): Promise<T> {
  // Create timeout signal
  const { signal, controller, timeoutId } = createTimeoutController(timeout);

  // Race between the original promise and timeout
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      signal.addEventListener("abort", () => {
        const error = new Error("Request timed out") as Error & {
          name: string;
        };
        error.name = "AbortError";
        reject(error);
      });
    }),
  ]).finally(() => {
    // Clean up timeout if promise resolves first
    clearTimeout(timeoutId);
  });
}

/**
 * Checks if AbortSignal.timeout() is natively supported
 *
 * @returns True if native timeout is available
 */
export function hasNativeTimeoutSupport(): boolean {
  return "timeout" in AbortSignal;
}

/**
 * Gets the timeout implementation being used
 *
 * @returns 'native' or 'fallback'
 */
export function getTimeoutImplementation(): "native" | "fallback" {
  return hasNativeTimeoutSupport() ? "native" : "fallback";
}

/**
 * Creates a timeout signal with abort callback
 *
 * Allows registering a callback that will be called when the signal aborts.
 *
 * @param timeout - Timeout duration in milliseconds
 * @param onAbort - Callback function to call on abort
 * @returns AbortSignal that aborts after timeout
 *
 * @example
 * ```typescript
 * const signal = createTimeoutSignalWithCallback(
 *   5000,
 *   () => console.log('Request timed out')
 * );
 *
 * fetch('/api/endpoint', { signal })
 *   .then(response => response.json())
 *   .catch(error => {
 *     if (error.name === 'AbortError') {
 *       console.log('Request timed out');
 *     }
 *   });
 * ```
 */
export function createTimeoutSignalWithCallback(
  timeout: number,
  onAbort: () => void,
): AbortSignal {
  const { signal, controller, timeoutId } = createTimeoutController(timeout);

  signal.addEventListener("abort", () => {
    onAbort();
  });

  return signal;
}

/**
 * Checks if an AbortSignal has been aborted
 *
 * @param signal - The AbortSignal to check
 * @returns True if the signal has been aborted
 */
export function isAborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

/**
 * Gets the abort reason from an AbortSignal
 *
 * @param signal - The AbortSignal to check
 * @returns The abort reason, or undefined if not aborted
 */
export function getAbortReason(signal: AbortSignal): unknown {
  if ("reason" in signal) {
    return (signal as AbortSignal & { reason: unknown }).reason;
  }
  const anySignal = signal as AbortSignal & { aborted: boolean };
  return anySignal.aborted
    ? new DOMException("Aborted", "AbortError")
    : undefined;
}
