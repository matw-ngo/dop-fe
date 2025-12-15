import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../index.tsx";
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

describe("Unified Theme Provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should provide default theme values", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.theme).toBeDefined();
    expect(result.current.isDark).toBe(false);
    expect(result.current.resolvedTheme).toBe("light");
    expect(result.current.mode).toBe("system");
    expect(result.current.currentTheme).toBe("default");
    expect(result.current.userGroup).toBe("system");
    expect(result.current.availableThemes).toContain("default");
    expect(result.current.canCustomize).toBe(false);
    expect(result.current.themeConfig).toBeDefined();
    expect(result.current.userGroupConfig).toBeDefined();
  });

  it("should toggle theme correctly", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setMode("dark");
    });

    expect(result.current.mode).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("should set theme by name", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider themes={{ light: lightTheme, dark: darkTheme }}>
        {children}
      </ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setThemeByName("dark");
    });

    expect(result.current.theme).toEqual(darkTheme);
  });

  it("should set user group", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultUserGroup="admin">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.userGroup).toBe("admin");
  });

  it("should provide all required context methods", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(typeof result.current.setTheme).toBe("function");
    expect(typeof result.current.toggleTheme).toBe("function");
    expect(typeof result.current.setThemeByName).toBe("function");
    expect(typeof result.current.setThemeById).toBe("function");
    expect(typeof result.current.setUserGroup).toBe("function");
    expect(typeof result.current.setCustomizations).toBe("function");
    expect(typeof result.current.resetCustomizations).toBe("function");
    expect(typeof result.current.setMode).toBe("function");
  });

  it("should provide computed values", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(Array.isArray(result.current.availableThemes)).toBe(true);
    expect(typeof result.current.canCustomize).toBe("boolean");
    expect(typeof result.current.themeConfig).toBe("object");
    expect(typeof result.current.userGroupConfig).toBe("object");
  });

  it("should handle customizations", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultUserGroup="admin">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setCustomizations({
        primary: "#ff0000",
        secondary: "#00ff00",
      });
    });

    expect(result.current.customizations).toEqual({
      primary: "#ff0000",
      secondary: "#00ff00",
    });

    act(() => {
      result.current.resetCustomizations();
    });

    expect(result.current.customizations).toBeUndefined();
  });

  it("should validate color inputs", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultUserGroup="admin">{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Should accept valid colors
    act(() => {
      result.current.setCustomizations({
        primary: "#ff0000",
        secondary: "rgb(0, 255, 0)",
      });
    });

    expect(result.current.customizations?.primary).toBe("#ff0000");
    expect(result.current.customizations?.secondary).toBe("rgb(0, 255, 0)");

    // Should reject invalid colors
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    act(() => {
      result.current.setCustomizations({
        primary: "invalid-color",
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid color value for primary: invalid-color")
    );

    consoleSpy.mockRestore();
  });
});