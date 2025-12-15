import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../theme-provider";
import { lightTheme, darkTheme } from "../default-themes";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});

// Mock document and DOM APIs
const mockStyle = {
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
  getPropertyValue: vi.fn(),
};

Object.defineProperty(document, "documentElement", {
  value: {
    style: mockStyle,
    classList: {
      remove: vi.fn(),
      add: vi.fn(),
      contains: vi.fn(),
    },
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    getAttribute: vi.fn(),
  },
  writable: true,
});

describe("ThemeProvider CSS Variable Optimization", () => {
  beforeEach(() => {
    // Don't clear all mocks as it resets the window.matchMedia mock
    // Instead, clear specific mocks
    mockStyle.setProperty.mockClear();
    mockStyle.removeProperty.mockClear();
    document.documentElement.classList.remove.mockClear();
    document.documentElement.classList.add.mockClear();
    document.documentElement.setAttribute.mockClear();
    document.documentElement.removeAttribute.mockClear();
    document.documentElement.getAttribute.mockClear();

    // Reset localStorage mock
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.getItem.mockReturnValue(null);
  });

  
  describe("Initial Render", () => {
    it("should apply all CSS variables on initial render", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      renderHook(() => useTheme(), { wrapper });

      // Should set data-theme attribute
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "light");

      // Should set data-color-scheme attribute
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-color-scheme", "light");

      // Should apply all CSS variables
      expect(mockStyle.setProperty).toHaveBeenCalled();

      // Check for key CSS variables
      const setPropertyCalls = mockStyle.setProperty.mock.calls;
      const cssVars = setPropertyCalls.map(call => call[0]);

      expect(cssVars).toContain("--color-primary-50");
      expect(cssVars).toContain("--color-secondary-50");
      expect(cssVars).toContain("--color-gray-50");
      expect(cssVars).toContain("--bg-primary");
      expect(cssVars).toContain("--text-primary");
      expect(cssVars).toContain("--font-sans");
      expect(cssVars).toContain("--spacing-0");
      expect(cssVars).toContain("--radius-sm");
    });

    it("should load theme from localStorage if available", () => {
      localStorageMock.getItem.mockReturnValue("dark");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      renderHook(() => useTheme(), { wrapper });

      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-color-scheme", "dark");
      expect(mockStyle.setProperty).toHaveBeenCalledWith(
        "--bg-primary",
        darkTheme.colors.background.primary
      );
    });
  });

  describe("CSS Variable Update Optimization", () => {
    it("should only update changed CSS variables when theme changes", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Clear calls after initial render
      mockStyle.setProperty.mockClear();
      document.documentElement.setAttribute.mockClear();

      // Change to dark theme using context method
      act(() => {
        result.current.setTheme(darkTheme);
      });

      // Should update data attributes
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-color-scheme", "dark");

      // Should have updated CSS variables
      expect(mockStyle.setProperty).toHaveBeenCalled();

      // Should update background colors that differ between themes
      expect(mockStyle.setProperty).toHaveBeenCalledWith(
        "--bg-primary",
        darkTheme.colors.background.primary
      );

      // Should update text colors that differ
      expect(mockStyle.setProperty).toHaveBeenCalledWith(
        "--text-primary",
        darkTheme.colors.text.primary
      );
    });

    it("should not update CSS variables that haven't changed", () => {
      // Create a custom theme that's identical to light theme except for one color
      const customTheme = {
        ...lightTheme,
        name: "custom",
        colors: {
          ...lightTheme.colors,
          primary: {
            ...lightTheme.colors.primary,
            50: "#custom-color",
          },
        },
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider themes={{ light: lightTheme, custom: customTheme }} defaultTheme="light">
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Clear calls after initial render
      mockStyle.setProperty.mockClear();

      // Switch to custom theme using setTheme
      act(() => {
        result.current.setTheme(customTheme);
      });

      // Should have updated primary-50
      expect(mockStyle.setProperty).toHaveBeenCalledWith(
        "--color-primary-50",
        "#custom-color"
      );

      // Should have limited number of updates (only changed properties)
      expect(mockStyle.setProperty.mock.calls.length).toBeLessThan(30);
    });

    it("should track previous theme values correctly", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Clear calls after initial render
      mockStyle.setProperty.mockClear();

      // Change to dark theme
      act(() => {
        result.current.setTheme(darkTheme);
      });

      // Capture dark theme calls
      const darkThemeCalls = new Map(
        mockStyle.setProperty.mock.calls.map(([prop, value]) => [prop, value])
      );
      mockStyle.setProperty.mockClear();

      // Change back to light theme
      act(() => {
        result.current.setTheme(lightTheme);
      });

      // Capture light theme calls
      const lightThemeCalls = new Map(
        mockStyle.setProperty.mock.calls.map(([prop, value]) => [prop, value])
      );

      // Should update properties that are different between themes
      expect(lightThemeCalls.size).toBeGreaterThan(0);

      // Background colors should be different
      expect(lightThemeCalls.get("--bg-primary")).toBe(lightTheme.colors.background.primary);
      expect(lightThemeCalls.get("--bg-primary")).not.toBe(darkTheme.colors.background.primary);
    });

    it("should use toggleTheme to switch between light and dark", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Clear calls after initial render
      mockStyle.setProperty.mockClear();
      document.documentElement.setAttribute.mockClear();

      // Toggle theme
      act(() => {
        result.current.toggleTheme();
      });

      // Should switch to dark theme
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-color-scheme", "dark");
      expect(mockStyle.setProperty).toHaveBeenCalledWith(
        "--bg-primary",
        darkTheme.colors.background.primary
      );
    });
  });

  describe("Performance Characteristics", () => {
    it("should handle rapid theme changes efficiently", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Clear calls after initial render
      mockStyle.setProperty.mockClear();

      const startTime = performance.now();

      // Rapid theme changes
      act(() => {
        result.current.setTheme(darkTheme);
        result.current.setTheme(lightTheme);
        result.current.setTheme(darkTheme);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (< 50ms)
      expect(duration).toBeLessThan(50);

      // Should have made calls for each change (but optimized per change)
      expect(mockStyle.setProperty).toHaveBeenCalled();
    });

    it("should not make unnecessary DOM updates when setting the same theme", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Clear calls after initial render
      mockStyle.setProperty.mockClear();

      // Set the same theme again
      act(() => {
        result.current.setTheme(lightTheme);
      });

      // Should not make any DOM updates since theme values are the same
      expect(mockStyle.setProperty).toHaveBeenCalledTimes(0);
    });
  });

  describe("Theme Data Attribute Management", () => {
    it("should set data attributes when theme changes", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      document.documentElement.setAttribute.mockClear();

      // Change theme
      act(() => {
        result.current.setTheme(darkTheme);
      });

      // Should set data-theme attribute
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");

      // Should set data-color-scheme attribute
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith("data-color-scheme", "dark");
    });
  });

  describe("LocalStorage Integration", () => {
    it("should save theme to localStorage when it changes", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should have saved to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith("test-theme", "light");

      // Clear the mock
      localStorageMock.setItem.mockClear();

      // Change theme and verify it saves again
      act(() => {
        result.current.setTheme(darkTheme);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith("test-theme", "dark");
    });
  });
});