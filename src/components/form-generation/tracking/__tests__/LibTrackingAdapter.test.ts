import { vi, describe, it, expect, beforeEach } from "vitest";
import { LibTrackingAdapter } from "../adapters/LibTrackingAdapter";
import type { FieldTrackingEvent } from "../../types";

// Mock the tracking library
vi.mock("@/lib/tracking", () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from "@/lib/tracking";

const mockTrackEvent = trackEvent as ReturnType<typeof vi.fn>;

describe("LibTrackingAdapter", () => {
  let adapter: LibTrackingAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new LibTrackingAdapter();
  });

  describe("trackEvent", () => {
    it("should call the library trackEvent with provided parameters", () => {
      const eventName = "test_event";
      const data = { field_id: "field1", value: "test" };

      adapter.trackEvent(eventName, data);

      expect(mockTrackEvent).toHaveBeenCalledWith(eventName, data);
      expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    });

    it("should handle empty data", () => {
      const eventName = "test_event";

      adapter.trackEvent(eventName);

      expect(mockTrackEvent).toHaveBeenCalledWith(eventName, {});
    });

    it("should handle complex data structures", () => {
      const eventName = "complex_event";
      const data = {
        field_id: "field1",
        value: { nested: "object" },
        metadata: { source: "form", timestamp: Date.now() },
      };

      adapter.trackEvent(eventName, data);

      expect(mockTrackEvent).toHaveBeenCalledWith(eventName, data);
    });
  });

  describe("trackField", () => {
    it("should map input events to form_field_input", () => {
      const event: FieldTrackingEvent = {
        fieldId: "field1",
        fieldName: "testField",
        eventType: "input",
        value: "test value",
        metadata: { source: "user" },
      };

      adapter.trackField(event);

      expect(mockTrackEvent).toHaveBeenCalledWith("form_field_input", {
        field_id: "field1",
        field_name: "testField",
        value: "test value",
        is_valid: undefined,
        source: "user",
      });
    });

    it("should map validation events to form_field_validation_success", () => {
      const event: FieldTrackingEvent = {
        fieldId: "field1",
        fieldName: "testField",
        eventType: "validation",
        value: "test value",
        isValid: true,
      };

      adapter.trackField(event);

      expect(mockTrackEvent).toHaveBeenCalledWith(
        "form_field_validation_success",
        {
          field_id: "field1",
          field_name: "testField",
          value: "test value",
          is_valid: true,
        },
      );
    });

    it("should map blur events to form_field_blur", () => {
      const event: FieldTrackingEvent = {
        fieldId: "field1",
        fieldName: "testField",
        eventType: "blur",
        value: "test value",
        isValid: true,
      };

      adapter.trackField(event);

      expect(mockTrackEvent).toHaveBeenCalledWith("form_field_blur", {
        field_id: "field1",
        field_name: "testField",
        value: "test value",
        is_valid: true,
      });
    });

    it("should map selection events to form_field_selection", () => {
      const event: FieldTrackingEvent = {
        fieldId: "field1",
        fieldName: "testField",
        eventType: "selection",
        value: "option1",
        metadata: { options: ["option1", "option2"] },
      };

      adapter.trackField(event);

      expect(mockTrackEvent).toHaveBeenCalledWith("form_field_selection", {
        field_id: "field1",
        field_name: "testField",
        value: "option1",
        is_valid: undefined,
        options: ["option1", "option2"],
      });
    });

    it("should map focus events to form_field_focus", () => {
      const event: FieldTrackingEvent = {
        fieldId: "field1",
        fieldName: "testField",
        eventType: "focus",
        value: null,
      };

      adapter.trackField(event);

      expect(mockTrackEvent).toHaveBeenCalledWith("form_field_focus", {
        field_id: "field1",
        field_name: "testField",
        value: null,
        is_valid: undefined,
      });
    });

    it("should handle unknown event types", () => {
      const event: FieldTrackingEvent = {
        fieldId: "field1",
        fieldName: "testField",
        eventType: "custom" as any,
        value: "test",
      };

      adapter.trackField(event);

      expect(mockTrackEvent).not.toHaveBeenCalled();
    });

    it("should handle events without metadata", () => {
      const event: FieldTrackingEvent = {
        fieldId: "field1",
        fieldName: "testField",
        eventType: "input",
        value: "test",
      };

      adapter.trackField(event);

      expect(mockTrackEvent).toHaveBeenCalledWith("form_field_input", {
        field_id: "field1",
        field_name: "testField",
        value: "test",
        is_valid: undefined,
      });
    });

    it("should handle null and undefined values", () => {
      const event1: FieldTrackingEvent = {
        fieldId: "field1",
        fieldName: "testField",
        eventType: "input",
        value: null,
      };

      const event2: FieldTrackingEvent = {
        fieldId: "field2",
        fieldName: "testField2",
        eventType: "blur",
        value: undefined,
      };

      adapter.trackField(event1);
      adapter.trackField(event2);

      expect(mockTrackEvent).toHaveBeenCalledTimes(2);
      expect(mockTrackEvent).toHaveBeenNthCalledWith(1, "form_field_input", {
        field_id: "field1",
        field_name: "testField",
        value: null,
        is_valid: undefined,
      });
      expect(mockTrackEvent).toHaveBeenNthCalledWith(2, "form_field_blur", {
        field_id: "field2",
        field_name: "testField2",
        value: undefined,
        is_valid: undefined,
      });
    });
  });
});
