import { trackEvent } from "@/lib/tracking";
import type { FieldTrackingEvent, TrackingBackend } from "../../types";

/**
 * Adapter for the existing tracking library
 * Maps field tracking events to the existing tracking system
 */
export class LibTrackingAdapter implements TrackingBackend {
  /**
   * Track a generic event using the existing tracking library
   */
  trackEvent(eventName: string, data?: Record<string, any>): void {
    // Use existing tracking library
    void trackEvent(eventName as any, data || {});
  }

  /**
   * Track field-specific event
   */
  trackField(event: FieldTrackingEvent): void {
    // Map field events to library events
    const eventName = this.mapFieldEventToLibEvent(event);
    if (eventName) {
      this.trackEvent(eventName, {
        field_id: event.fieldId,
        field_name: event.fieldName,
        value: event.value,
        is_valid: event.isValid,
        ...event.metadata,
      });
    }
  }

  /**
   * Map field tracking events to library event names
   */
  private mapFieldEventToLibEvent(event: FieldTrackingEvent): string | null {
    // Map generic field events to specific event names
    // This can be customized per project or field type
    const eventTypeMap: Record<string, string> = {
      input: "form_field_input",
      validation: "form_field_validation_success",
      blur: "form_field_blur",
      selection: "form_field_selection",
      focus: "form_field_focus",
    };

    return eventTypeMap[event.eventType] || null;
  }
}
