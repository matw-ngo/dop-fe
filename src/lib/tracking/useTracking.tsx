import { useCallback, useEffect, useRef } from "react";
import {
  type EventType,
  hasUserConsent,
  initializeSession,
  isDNTEnabled,
  setUserConsent,
  trackEvent,
  trackGeneric,
  trackLoanCalculator,
  trackSalaryCalculator,
  trackSavingsCalculator,
} from "./index";

/**
 * React hook for tracking functionality
 * Provides easy integration with React components
 */
export const useTracking = () => {
  const isInitialized = useRef(false);

  // Initialize tracking on mount
  useEffect(() => {
    if (!isInitialized.current && typeof window !== "undefined") {
      initializeSession();
      isInitialized.current = true;
    }
  }, []);

  // Track page view on component mount
  const trackPageView = useCallback(
    (page: string, data?: Record<string, any>) => {
      trackGeneric.pageView(page, data);
    },
    [],
  );

  // Track form field changes with debouncing
  const trackFormField = useCallback(
    (fieldName: string, value: any, debounceMs: number = 500) => {
      // Debounce field changes to avoid too many events
      const timeoutId = setTimeout(() => {
        trackGeneric.formFieldChange(fieldName, value);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [],
  );

  // Track calculation with validation
  const trackCalculation = useCallback(
    (
      calculatorType: "savings" | "loan" | "salary",
      params: Record<string, any>,
    ) => {
      // Only track if we have valid parameters
      if (Object.keys(params).length > 0) {
        trackGeneric.calculationPerformed(calculatorType, params);
      }
    },
    [],
  );

  return {
    // Status
    isTrackingEnabled: hasUserConsent() && !isDNTEnabled(),
    hasConsent: hasUserConsent(),

    // Actions
    setConsent: setUserConsent,
    trackEvent,

    // Generic tracking
    trackPageView,
    trackFormField,
    trackCalculation,

    // Tool-specific tracking
    savings: trackSavingsCalculator,
    loan: trackLoanCalculator,
    salary: trackSalaryCalculator,
  };
};

/**
 * Higher-order component for automatic page view tracking
 */
export const withPageTracking = <P extends object>(
  Component: React.ComponentType<P>,
  pageName: string,
  trackingData?: Record<string, any>,
) => {
  const TrackedComponent = (props: P) => {
    const { trackPageView } = useTracking();

    useEffect(() => {
      trackPageView(pageName, trackingData);
    }, [trackPageView]);

    return <Component {...props} />;
  };

  TrackedComponent.displayName = `withPageTracking(${Component.displayName || Component.name})`;

  return TrackedComponent;
};

/**
 * Hook for tracking form submissions
 */
export const useFormTracking = (formName: string) => {
  const { trackEvent } = useTracking();

  const trackFormSubmit = useCallback(
    (data: Record<string, any>) => {
      trackGeneric.formSubmit(formName, data);
    },
    [formName],
  );

  const trackFormStep = useCallback(
    (step: string, data?: Record<string, any>) => {
      trackEvent("form_field_change" as EventType, {
        formName,
        step,
        ...data,
      });
    },
    [formName],
  );

  return {
    trackFormSubmit,
    trackFormStep,
  };
};
