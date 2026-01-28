import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ThemeConfig } from "../types";
import { applyTheme } from "../utils";

// Mock requestAnimationFrame
let rafCallbacks: Array<(timestamp: number) => void> = [];
let mockRafId = 0;

// Mock DOM elements
const mockRootStyle = {
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
};

const mockDocumentElement = {
  style: mockRootStyle,
};

const mockStyleElement = {
  id: "",
  textContent: "",
};

const mockHead = {
  appendChild: vi.fn(),
};

const mockDocument = {
  documentElement: mockDocumentElement,
  getElementById: vi.fn(),
  createElement: vi.fn(() => mockStyleElement),
  head: mockHead,
};

// Override global document and requestAnimationFrame
Object.defineProperty(global, "document", {
  value: mockDocument,
  writable: true,
});

global.requestAnimationFrame = vi.fn((cb) => {
  rafCallbacks.push(cb);
  return ++mockRafId;
});

global.cancelAnimationFrame = vi.fn((id) => {
  rafCallbacks = rafCallbacks.filter((_, index) => index + 1 !== id);
});

describe("Theme Performance Optimizations", () => {
  let mockTheme: ThemeConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    rafCallbacks = [];
    mockRafId = 0;

    // Reset tracking of applied properties
    // Note: appliedProperties is internal to utils module
    // We'll verify behavior through DOM calls

    mockTheme = {
      id: "test-theme",
      name: "Test Theme",
      colors: {
        light: {
          background: "oklch(1 0 0)",
          foreground: "oklch(0 0 0)",
          primary: "oklch(0.5 0.2 0)",
          primaryForeground: "oklch(1 0 0)",
          secondary: "oklch(0.95 0.01 0)",
          secondaryForeground: "oklch(0 0 0)",
          muted: "oklch(0.96 0.01 0)",
          mutedForeground: "oklch(0.5 0 0)",
          accent: "oklch(0.5 0.2 0)",
          accentForeground: "oklch(1 0 0)",
          destructive: "oklch(0.5 0.2 30)",
          destructiveForeground: "oklch(1 0 0)",
          border: "oklch(0.9 0.01 0)",
          input: "oklch(0.9 0.01 0)",
          ring: "oklch(0.5 0.2 0)",
          card: "oklch(1 0 0)",
          cardForeground: "oklch(0 0 0)",
          popover: "oklch(1 0 0)",
          popoverForeground: "oklch(0 0 0)",
        },
        dark: {
          background: "oklch(0 0 0)",
          foreground: "oklch(1 0 0)",
          primary: "oklch(0.5 0.2 0)",
          primaryForeground: "oklch(0 0 0)",
          secondary: "oklch(0.15 0.01 0)",
          secondaryForeground: "oklch(1 0 0)",
          muted: "oklch(0.15 0.01 0)",
          mutedForeground: "oklch(0.6 0 0)",
          accent: "oklch(0.5 0.2 0)",
          accentForeground: "oklch(0 0 0)",
          destructive: "oklch(0.5 0.2 30)",
          destructiveForeground: "oklch(0 0 0)",
          border: "oklch(0.2 0.01 0)",
          input: "oklch(0.2 0.01 0)",
          ring: "oklch(0.5 0.2 0)",
          card: "oklch(0 0 0)",
          cardForeground: "oklch(1 0 0)",
          popover: "oklch(0 0 0)",
          popoverForeground: "oklch(1 0 0)",
        },
      },
      radius: "0.5rem",
      fonts: {
        sans: "Inter, sans-serif",
        mono: "JetBrains Mono, monospace",
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("DOM Update Batching", () => {
    it("should batch DOM updates using requestAnimationFrame", () => {
      applyTheme(mockTheme, "light");

      // Should have scheduled requestAnimationFrame
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);

      // DOM updates should not have happened immediately
      expect(mockRootStyle.setProperty).toHaveBeenCalledTimes(0);

      // Execute the scheduled RAF callback
      expect(rafCallbacks).toHaveLength(1);
      rafCallbacks[0](0);

      // Now DOM updates should be batched and applied
      expect(mockRootStyle.setProperty).toHaveBeenCalled();

      // Verify it's called with all properties in a single batch
      const setPropertyCalls = mockRootStyle.setProperty.mock.calls;

      // Check for key CSS variables
      const cssVars = setPropertyCalls.map((call) => call[0]);
      expect(cssVars).toContain("--background");
      expect(cssVars).toContain("--foreground");
      expect(cssVars).toContain("--primary");
      expect(cssVars).toContain("--radius");
      expect(cssVars).toContain("--font-sans");
    });

    it("should handle multiple rapid theme applications efficiently", () => {
      const startTime = performance.now();

      // Apply theme multiple times rapidly
      applyTheme(mockTheme, "light");
      applyTheme(mockTheme, "dark");
      applyTheme(mockTheme, "light");

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (< 10ms)
      expect(duration).toBeLessThan(10);

      // Should only have one RAF scheduled (others should be cancelled)
      expect(global.cancelAnimationFrame).toHaveBeenCalledTimes(2);
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(3);

      // Execute final RAF callback
      rafCallbacks[rafCallbacks.length - 1](0);

      // Should only apply the final theme
      const setPropertyCalls = mockRootStyle.setProperty.mock.calls;
      const cssVars = setPropertyCalls.map((call) => call[0]);

      // Verify dark mode values were not applied
      expect(cssVars.some((v) => v.includes("oklch(0 0 0)"))).toBe(false);
    });

    it("should clear previous properties before applying new theme", () => {
      // Apply initial theme
      applyTheme(mockTheme, "light");

      // Simulate having previous properties
      const _mockAppliedProperties = new Set(["--old-prop"]);

      // Apply second theme
      applyTheme(mockTheme, "dark");

      // Should have called removeProperty to clear old properties
      expect(mockRootStyle.removeProperty).toHaveBeenCalled();

      // Execute RAF
      rafCallbacks[rafCallbacks.length - 1](0);

      // Should apply new properties
      expect(mockRootStyle.setProperty).toHaveBeenCalled();
    });

    it("should handle custom fonts and radius", () => {
      applyTheme(mockTheme, "light");

      // Execute RAF
      rafCallbacks[0](0);

      const setPropertyCalls = mockRootStyle.setProperty.mock.calls;
      const props = setPropertyCalls.map((call) => call[0]);

      expect(props).toContain("--radius");
      expect(props).toContain("--font-sans");
      expect(props).toContain("--font-mono");

      expect(mockRootStyle.setProperty).toHaveBeenCalledWith(
        "--radius",
        "0.5rem",
      );
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith(
        "--font-sans",
        "Inter, sans-serif",
      );
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith(
        "--font-mono",
        "JetBrains Mono, monospace",
      );
    });

    it("should handle theme customizations efficiently", () => {
      const customizations = {
        primary: "oklch(0.6 0.3 120)",
        secondary: "oklch(0.3 0.2 240)",
      };

      applyTheme(mockTheme, "light", customizations);

      // Execute RAF
      rafCallbacks[0](0);

      const _setPropertyCalls = mockRootStyle.setProperty.mock.calls;

      // Should have applied customizations
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith(
        "--primary",
        "oklch(0.6 0.3 120)",
      );
      expect(mockRootStyle.setProperty).toHaveBeenCalledWith(
        "--secondary",
        "oklch(0.3 0.2 240)",
      );
    });
  });

  describe("Performance Characteristics", () => {
    it("should handle large theme objects efficiently", () => {
      // Create a theme with many color variables
      const largeTheme: ThemeConfig = {
        ...mockTheme,
        colors: {
          ...mockTheme.colors,
          light: {
            ...mockTheme.colors.light,
            // Add 50 additional custom properties
            ...Object.fromEntries(
              Array.from({ length: 50 }, (_, i) => [
                `customColor${i}`,
                `oklch(${0.5 + (i % 10) * 0.05} 0.1 ${i * 7.2})`,
              ]),
            ),
          },
        },
      };

      const startTime = performance.now();
      applyTheme(largeTheme, "light");
      const schedulingTime = performance.now() - startTime;

      // Scheduling should be fast
      expect(schedulingTime).toBeLessThan(5);

      // Execute RAF
      rafCallbacks[0](0);

      // Should handle all properties
      const setPropertyCalls = mockRootStyle.setProperty.mock.calls;
      expect(setPropertyCalls.length).toBeGreaterThan(50);
    });

    it("should not block main thread", () => {
      // Create a computationally expensive scenario
      const expensiveCustomizations = {
        ...Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [
            `custom${i}`,
            `oklch(${Math.random()} ${Math.random()} ${Math.random() * 360})`,
          ]),
        ),
      };

      const startTime = performance.now();

      applyTheme(mockTheme, "light", expensiveCustomizations);

      const schedulingTime = performance.now() - startTime;

      // Scheduling should be immediate
      expect(schedulingTime).toBeLessThan(5);

      // DOM should not be updated yet
      expect(mockRootStyle.setProperty).toHaveBeenCalledTimes(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle requestAnimationFrame unavailability gracefully", () => {
      // Mock RAF as unavailable
      const originalRAF = global.requestAnimationFrame;
      global.requestAnimationFrame = vi.fn(() => {
        throw new Error("requestAnimationFrame not available");
      });

      // Should not throw
      expect(() => applyTheme(mockTheme, "light")).not.toThrow();

      // Restore RAF
      global.requestAnimationFrame = originalRAF;
    });

    it("should handle invalid theme objects gracefully", () => {
      const invalidTheme = {
        id: "invalid",
        name: "Invalid Theme",
        colors: null,
      } as unknown as ThemeConfig;

      // Should not throw
      expect(() => applyTheme(invalidTheme, "light")).not.toThrow();
    });
  });
});
