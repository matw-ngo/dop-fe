import { createContext, type ReactNode, useContext } from "react";
import type { TrackingBackend } from "../types";

/**
 * Tracking context value interface
 */
interface TrackingContextValue {
  /** Tracking backend implementation */
  backend?: TrackingBackend;

  /** Whether tracking is enabled */
  enabled: boolean;
}

/**
 * Default tracking context
 */
const TrackingContext = createContext<TrackingContextValue>({
  enabled: false,
});

/**
 * Props for FormTrackingProvider component
 */
export interface FormTrackingProviderProps {
  /**
   * Tracking backend implementation
   */
  backend?: TrackingBackend;

  /**
   * Enable/disable tracking
   * @default true
   */
  enabled?: boolean;

  /**
   * React children
   */
  children: ReactNode;
}

/**
 * Provider component for form tracking context
 */
export function FormTrackingProvider({
  backend,
  enabled = true,
  children,
}: FormTrackingProviderProps) {
  return (
    <TrackingContext.Provider value={{ backend, enabled }}>
      {children}
    </TrackingContext.Provider>
  );
}

/**
 * Hook to access tracking context
 */
export function useFormTracking(): TrackingContextValue {
  return useContext(TrackingContext);
}
