import { useCallback, useRef, useEffect } from "react";
import { useFormTracking } from "./TrackingProvider";
import type { FieldTrackingConfig, FieldTrackingEvent } from "../types";

/**
 * Props for useFieldTracking hook
 */
interface UseFieldTrackingProps {
  /** Unique field identifier */
  fieldId: string;

  /** Field name for form data */
  fieldName: string;

  /** Tracking configuration for the field */
  trackingConfig?: FieldTrackingConfig;
}

/**
 * Hook for field-level event tracking
 */
export function useFieldTracking({
  fieldId,
  fieldName,
  trackingConfig,
}: UseFieldTrackingProps) {
  const { backend, enabled } = useFormTracking();
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach((timer) => clearTimeout(timer));
      debounceTimers.current.clear();
    };
  }, []);

  const trackEvent = useCallback(
    (event: FieldTrackingEvent) => {
      if (!enabled) return;

      // Call custom tracking if provided (works even without backend)
      if (trackingConfig?.customTracking) {
        trackingConfig.customTracking(event);
        return;
      }

      // Use backend tracking if available
      if (backend) {
        backend.trackField(event);
      }
    },
    [enabled, backend, trackingConfig],
  );

  const trackInput = useCallback(
    (value: any) => {
      if (!enabled || !backend || !trackingConfig?.trackInput) return;

      const {
        eventName,
        transformValue,
        metadata,
        debounce = 0,
      } = trackingConfig.trackInput;

      const performTracking = () => {
        const transformedValue = transformValue ? transformValue(value) : value;

        // Only use backend if there's no custom tracking
        if (eventName && !trackingConfig?.customTracking) {
          backend?.trackEvent(eventName, {
            field_id: fieldId,
            field_name: fieldName,
            value: transformedValue,
            ...metadata,
          });
        }

        trackEvent({
          fieldId,
          fieldName,
          eventType: "input",
          value: transformedValue,
          metadata,
        });
      };

      if (debounce > 0) {
        // Clear existing timer
        const existingTimer = debounceTimers.current.get("input");
        if (existingTimer) clearTimeout(existingTimer);

        // Set new timer
        const timer = setTimeout(performTracking, debounce);
        debounceTimers.current.set("input", timer);
      } else {
        performTracking();
      }
    },
    [enabled, trackingConfig, fieldId, fieldName, backend, trackEvent],
  );

  const trackValidation = useCallback(
    (value: any, isValid: boolean) => {
      if (!enabled || !backend || !trackingConfig?.trackValidation || !isValid)
        return;

      const { eventName, transformValue, metadata } =
        trackingConfig.trackValidation;
      const transformedValue = transformValue ? transformValue(value) : value;

      if (eventName && !trackingConfig?.customTracking) {
        backend?.trackEvent(eventName, {
          field_id: fieldId,
          field_name: fieldName,
          value: transformedValue,
          ...metadata,
        });
      }

      trackEvent({
        fieldId,
        fieldName,
        eventType: "validation",
        value: transformedValue,
        isValid,
        metadata,
      });
    },
    [enabled, trackingConfig, fieldId, fieldName, backend, trackEvent],
  );

  const trackBlur = useCallback(
    (value: any) => {
      if (!enabled || !backend || !trackingConfig?.trackBlur) return;

      const { eventName, transformValue, metadata } = trackingConfig.trackBlur;
      const transformedValue = transformValue ? transformValue(value) : value;

      if (eventName && !trackingConfig?.customTracking) {
        backend?.trackEvent(eventName, {
          field_id: fieldId,
          field_name: fieldName,
          value: transformedValue,
          ...metadata,
        });
      }

      trackEvent({
        fieldId,
        fieldName,
        eventType: "blur",
        value: transformedValue,
        metadata,
      });
    },
    [enabled, trackingConfig, fieldId, fieldName, backend, trackEvent],
  );

  const trackSelection = useCallback(
    (value: any) => {
      if (!enabled || !backend || !trackingConfig?.trackSelection) return;

      const { eventName, transformValue, metadata } =
        trackingConfig.trackSelection;
      const transformedValue = transformValue ? transformValue(value) : value;

      if (eventName && !trackingConfig?.customTracking) {
        backend?.trackEvent(eventName, {
          field_id: fieldId,
          field_name: fieldName,
          value: transformedValue,
          ...metadata,
        });
      }

      trackEvent({
        fieldId,
        fieldName,
        eventType: "selection",
        value: transformedValue,
        metadata,
      });
    },
    [enabled, trackingConfig, fieldId, fieldName, backend, trackEvent],
  );

  const trackFocus = useCallback(
    (value: any) => {
      if (!enabled) return;

      trackEvent({
        fieldId,
        fieldName,
        eventType: "focus",
        value,
      });
    },
    [fieldId, fieldName, enabled, trackEvent],
  );

  return {
    trackInput,
    trackValidation,
    trackBlur,
    trackSelection,
    trackFocus,
  };
}
