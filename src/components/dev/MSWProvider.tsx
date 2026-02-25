"use client";

/**
 * MSW Provider Component
 *
 * Initializes MSW in browser mode with proper Next.js 15 + Turbopack compatibility
 */

import { type ReactNode, useEffect, useState } from "react";
import { mswStore } from "@/mocks/store";

type MSWProviderProps = {
  children?: ReactNode;
};

type WindowWithMSW = Window & {
  __MSW_WORKER__?: unknown;
};

export function MSWProvider({ children }: MSWProviderProps) {
  const [isReady, setIsReady] = useState(
    process.env.NODE_ENV !== "development",
  );

  useEffect(() => {
    // Only initialize MSW in development and browser environment
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      // Use async initialization to avoid Next.js compatibility issues
      const initMSW = async () => {
        try {
          // Dynamic import to avoid SSR issues
          const { setupWorker } = await import("msw/browser");
          const { default: consentHandlers } = await import(
            "../../__tests__/msw/handlers/consent"
          );
          const { default: dopHandlers } = await import(
            "../../__tests__/msw/handlers/dop"
          );

          // Create worker with all handlers
          const worker = setupWorker(...consentHandlers, ...dopHandlers);

          if (mswStore.isMswEnabled()) {
            // Start MSW with Next.js compatible configuration
            await worker.start({
              onUnhandledRequest: "bypass",
              quiet: true, // Reduce console noise in development
            });
            console.log("🚀 MSW enabled - API requests will be mocked");
          } else {
            console.log("⏸️ MSW disabled via user preference");
          }

          // Store worker reference for potential cleanup
          (window as WindowWithMSW).__MSW_WORKER__ = worker;
        } catch (error) {
          console.warn("MSW initialization failed:", error);
          console.log("💡 Falling back to real API calls");
        } finally {
          setIsReady(true);
        }
      };

      initMSW();
      return;
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children ?? null}</>;
}
