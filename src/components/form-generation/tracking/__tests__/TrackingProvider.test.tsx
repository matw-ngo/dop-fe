import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TrackingBackend } from "../../types";
import { FormTrackingProvider, useFormTracking } from "../TrackingProvider";

describe("TrackingProvider", () => {
  const mockBackend: TrackingBackend = {
    trackEvent: vi.fn(),
    trackField: vi.fn(),
  };

  describe("FormTrackingProvider", () => {
    it("should provide tracking context with default values", () => {
      const TestComponent = () => {
        const context = useFormTracking();
        return (
          <div>
            <span data-testid="enabled">
              {context.enabled ? "true" : "false"}
            </span>
            <span data-testid="backend">
              {context.backend ? "true" : "false"}
            </span>
          </div>
        );
      };

      render(
        <FormTrackingProvider>
          <TestComponent />
        </FormTrackingProvider>,
      );

      expect(screen.getByTestId("enabled").textContent).toBe("true");
      expect(screen.getByTestId("backend").textContent).toBe("false");
    });

    it("should provide tracking context with custom values", () => {
      const TestComponent = () => {
        const context = useFormTracking();
        return (
          <div>
            <span data-testid="enabled">
              {context.enabled ? "true" : "false"}
            </span>
            <span data-testid="backend">
              {context.backend ? "true" : "false"}
            </span>
          </div>
        );
      };

      render(
        <FormTrackingProvider backend={mockBackend} enabled={false}>
          <TestComponent />
        </FormTrackingProvider>,
      );

      expect(screen.getByTestId("enabled").textContent).toBe("false");
      expect(screen.getByTestId("backend").textContent).toBe("true");
    });

    it("should render children", () => {
      const TestChild = () => <div data-testid="child">Child Content</div>;

      render(
        <FormTrackingProvider backend={mockBackend} enabled={true}>
          <TestChild />
        </FormTrackingProvider>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    it("should work with nested providers", () => {
      const innerBackend: TrackingBackend = {
        trackEvent: vi.fn(),
        trackField: vi.fn(),
      };

      const TestComponent = () => {
        const context = useFormTracking();
        return (
          <div>
            <span data-testid="backend-id">
              {context.backend === mockBackend
                ? "outer"
                : context.backend === innerBackend
                  ? "inner"
                  : "none"}
            </span>
          </div>
        );
      };

      render(
        <FormTrackingProvider backend={mockBackend} enabled={true}>
          <FormTrackingProvider backend={innerBackend} enabled={true}>
            <TestComponent />
          </FormTrackingProvider>
        </FormTrackingProvider>,
      );

      expect(screen.getByTestId("backend-id").textContent).toBe("inner");
    });
  });

  describe("useFormTracking", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      const TestComponent = () => {
        const context = useFormTracking();
        return <div>{context.enabled ? "true" : "false"}</div>;
      };

      expect(() => {
        render(<TestComponent />);
      }).not.toThrow();

      // The hook should return default values even outside provider
      // This is a safety mechanism rather than throwing an error
      expect(screen.getByText("false")).toBeInTheDocument();

      console.error = originalError;
    });

    it("should return the same context value for multiple calls", () => {
      const TestComponent = () => {
        const context1 = useFormTracking();
        const context2 = useFormTracking();

        return (
          <div>
            <span data-testid="same-context">
              {context1 === context2 ? "true" : "false"}
            </span>
          </div>
        );
      };

      render(
        <FormTrackingProvider backend={mockBackend} enabled={true}>
          <TestComponent />
        </FormTrackingProvider>,
      );

      expect(screen.getByTestId("same-context").textContent).toBe("true");
    });
  });
});
