/**
 * Form Generation Library - Event Tracking Module
 *
 * Provides event tracking capabilities for form fields with:
 * - Declarative configuration
 * - Pluggable backends
 * - Built-in debouncing
 * - Type safety
 */

// Export types
export type {
  FieldTrackingConfig,
  FieldTrackingEvent,
  TrackingBackend,
} from "../types";

// Export provider and hook
export {
  FormTrackingProvider,
  useFormTracking,
} from "./TrackingProvider";

// Export adapters
export { LibTrackingAdapter } from "./adapters/LibTrackingAdapter";

// Export tracking hook
export { useFieldTracking } from "./useFieldTracking";
