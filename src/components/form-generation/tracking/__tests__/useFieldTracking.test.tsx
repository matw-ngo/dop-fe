import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { FormTrackingProvider } from "../TrackingProvider";
import { useFieldTracking } from "../useFieldTracking";
import type { FieldTrackingConfig } from "../../types";

// Mock tracking backend
const mockTrackEvent = vi.fn();
const mockTrackField = vi.fn();

const mockBackend = {
  trackEvent: mockTrackEvent,
  trackField: mockTrackField,
};

describe("useFieldTracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fieldId = "test-field";
  const fieldName = "testField";

  it("should return tracking functions when enabled", () => {
    const trackingConfig: FieldTrackingConfig = {
      trackInput: {
        eventName: "input_event",
      },
      trackBlur: {
        eventName: "blur_event",
      },
      trackValidation: {
        eventName: "validation_event",
      },
      trackSelection: {
        eventName: "selection_event",
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    expect(result.current).toHaveProperty("trackInput");
    expect(result.current).toHaveProperty("trackBlur");
    expect(result.current).toHaveProperty("trackValidation");
    expect(result.current).toHaveProperty("trackSelection");
    expect(result.current).toHaveProperty("trackFocus");
  });

  it("should not call tracking functions when disabled", () => {
    const trackingConfig: FieldTrackingConfig = {
      trackInput: {
        eventName: "input_event",
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={false}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackInput("test value");
    });

    expect(mockTrackEvent).not.toHaveBeenCalled();
    expect(mockTrackField).not.toHaveBeenCalled();
  });

  it("should track input events with debounce", async () => {
    const trackingConfig: FieldTrackingConfig = {
      trackInput: {
        eventName: "input_event",
        debounce: 300,
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    // Fast successive calls should be debounced
    act(() => {
      result.current.trackInput("value1");
      result.current.trackInput("value2");
      result.current.trackInput("value3");
    });

    // Should not have been called immediately due to debounce
    expect(mockTrackEvent).not.toHaveBeenCalled();

    // Wait for debounce
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    // Should have been called once with the last value
    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith("input_event", {
      field_id: fieldId,
      field_name: fieldName,
      value: "value3",
    });
  });

  it("should track input events without debounce", () => {
    const trackingConfig: FieldTrackingConfig = {
      trackInput: {
        eventName: "input_event",
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackInput("test value");
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith("input_event", {
      field_id: fieldId,
      field_name: fieldName,
      value: "test value",
    });
  });

  it("should track validation events only when valid", () => {
    const trackingConfig: FieldTrackingConfig = {
      trackValidation: {
        eventName: "validation_event",
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackValidation("test value", false); // Invalid
    });

    expect(mockTrackEvent).not.toHaveBeenCalled();

    act(() => {
      result.current.trackValidation("test value", true); // Valid
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith("validation_event", {
      field_id: fieldId,
      field_name: fieldName,
      value: "test value",
    });
  });

  it("should track blur events", () => {
    const trackingConfig: FieldTrackingConfig = {
      trackBlur: {
        eventName: "blur_event",
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackBlur("test value");
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith("blur_event", {
      field_id: fieldId,
      field_name: fieldName,
      value: "test value",
    });
  });

  it("should track selection events", () => {
    const trackingConfig: FieldTrackingConfig = {
      trackSelection: {
        eventName: "selection_event",
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackSelection("option1");
    });

    expect(mockTrackEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith("selection_event", {
      field_id: fieldId,
      field_name: fieldName,
      value: "option1",
    });
  });

  it("should use transformValue function when provided", () => {
    const transformValue = vi.fn((value) => `transformed_${value}`);
    const trackingConfig: FieldTrackingConfig = {
      trackInput: {
        eventName: "input_event",
        transformValue,
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackInput("test");
    });

    expect(transformValue).toHaveBeenCalledWith("test");
    expect(mockTrackEvent).toHaveBeenCalledWith("input_event", {
      field_id: fieldId,
      field_name: fieldName,
      value: "transformed_test",
    });
  });

  it("should include metadata when provided", () => {
    const metadata = { source: "form", category: "user_input" };
    const trackingConfig: FieldTrackingConfig = {
      trackInput: {
        eventName: "input_event",
        metadata,
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackInput("test value");
    });

    expect(mockTrackEvent).toHaveBeenCalledWith("input_event", {
      field_id: fieldId,
      field_name: fieldName,
      value: "test value",
      source: "form",
      category: "user_input",
    });
  });

  it("should call customTracking when provided", () => {
    const customTracking = vi.fn();
    const trackingConfig: FieldTrackingConfig = {
      trackInput: {
        eventName: "input_event",
      },
      customTracking,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    const event = {
      fieldId,
      fieldName,
      eventType: "input" as const,
      value: "test",
    };

    act(() => {
      result.current.trackInput("test");
    });

    expect(customTracking).toHaveBeenCalledWith(event);
    expect(mockTrackEvent).not.toHaveBeenCalled();
    expect(mockTrackField).not.toHaveBeenCalled();
  });

  it("should track focus events", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackFocus("test value");
    });

    expect(mockTrackField).toHaveBeenCalledTimes(1);
    expect(mockTrackField).toHaveBeenCalledWith({
      fieldId,
      fieldName,
      eventType: "focus",
      value: "test value",
    });
  });

  it("should cleanup timers on unmount", () => {
    const trackingConfig: FieldTrackingConfig = {
      trackInput: {
        eventName: "input_event",
        debounce: 300,
      },
    };

    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormTrackingProvider backend={mockBackend} enabled={true}>
        {children}
      </FormTrackingProvider>
    );

    const { result, unmount } = renderHook(
      () =>
        useFieldTracking({
          fieldId,
          fieldName,
          trackingConfig,
        }),
      { wrapper },
    );

    act(() => {
      result.current.trackInput("test");
    });

    // Unmount the hook
    unmount();

    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});
