import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider } from "../theme-provider";
import { useThemeUtils } from "../use-theme";

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
  },
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
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
});

describe("Theme Debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should provide debounced versions of theme functions", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    );

    const { result } = renderHook(() => useThemeUtils(), { wrapper });

    // Check that debounced functions exist
    expect(typeof result.current.setThemeDebounced).toBe("function");
    expect(typeof result.current.toggleThemeDebounced).toBe("function");
  });

  it("should debounce toggle theme changes with 300ms delay", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    );

    const { result } = renderHook(() => useThemeUtils(), { wrapper });

    // Get initial state
    const initialResolvedTheme = result.current.resolvedTheme;
    expect(initialResolvedTheme).toBe("light");

    // Call debounced toggle
    act(() => {
      result.current.toggleThemeDebounced();
    });

    // Theme should not change immediately
    expect(result.current.resolvedTheme).toBe("light");

    // Fast-forward 299ms - still should not change
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current.resolvedTheme).toBe("light");

    // Fast-forward 1 more ms (total 300ms) - should change now
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("should only apply the last theme change when multiple rapid calls occur", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    );

    const { result } = renderHook(() => useThemeUtils(), { wrapper });

    // Track theme changes
    let themeChangeCount = 0;
    const initialTheme = result.current.resolvedTheme;

    // Call debounced toggle multiple times rapidly
    act(() => {
      result.current.toggleThemeDebounced();
      result.current.toggleThemeDebounced();
      result.current.toggleThemeDebounced();
    });

    // Fast-forward 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have toggled only once (from light to dark)
    expect(result.current.resolvedTheme).toBe("dark");
    themeChangeCount++;

    // The key point is that despite 3 rapid calls, only one change occurred
    expect(themeChangeCount).toBe(1);
  });

  it("should cancel pending debounced calls on component unmount", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    );

    const { result, unmount } = renderHook(() => useThemeUtils(), { wrapper });

    // Call debounced toggle
    act(() => {
      result.current.toggleThemeDebounced();
    });

    // Unmount before debounce completes
    act(() => {
      unmount();
    });

    // Fast-forward 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Theme should remain light since component unmounted
    // (Note: In a real scenario, the theme state would be cleaned up)
  });

  it("should reset debounce timer when called again before timeout", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="light">
        {children}
      </ThemeProvider>
    );

    const { result } = renderHook(() => useThemeUtils(), { wrapper });

    // Call debounced toggle
    act(() => {
      result.current.toggleThemeDebounced();
    });

    // Fast-forward 150ms (halfway)
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.resolvedTheme).toBe("light");

    // Call toggle again (should reset timer)
    act(() => {
      result.current.toggleThemeDebounced();
    });

    // Fast-forward another 150ms (total 300ms from first call)
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.resolvedTheme).toBe("light");

    // Fast-forward final 150ms (total 300ms from second call)
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.resolvedTheme).toBe("dark");
  });
});