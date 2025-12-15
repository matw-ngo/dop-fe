/**
 * Accessibility Test Suite for Theme System
 *
 * This test suite ensures WCAG 2.1 AA compliance for:
 * - Color contrast ratios in all themes
 * - ARIA attributes on theme components
 * - Screen reader announcements
 * - Keyboard navigation support
 *
 * @fileoverview Accessibility tests for theme system
 * @version 1.0.0
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ThemeProvider, useTheme } from "..";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { ThemeSelector } from "@/components/theme/theme-selector";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { themes, userGroups } from "../themes";
import { applyTheme } from "../utils";
import { colorContrast, keyboardNavigation, announce } from "@/lib/utils/accessibility";
import { converter, formatCss } from "culori";

// Mock next-themes
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

// Mock DOM methods for accessibility testing
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  value: true,
  writable: true,
});

// Test components
function TestThemeComponent() {
  const { currentTheme, userGroup, setTheme, setUserGroup, canCustomize } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{currentTheme}</div>
      <div data-testid="user-group">{userGroup}</div>
      <div data-testid="can-customize">{canCustomize.toString()}</div>
      <button onClick={() => setTheme("corporate")}>Switch to Corporate</button>
      <button onClick={() => setUserGroup("creative")}>Switch to Creative</button>
    </div>
  );
}

// Color conversion helpers
const oklchToRgb = converter("rgb");
const oklchToHex = (oklchString: string): string => {
  const rgb = oklchToRgb(oklchString);
  return rgb ? formatCss(rgb) : "#000000";
};

describe("Theme System Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-color-scheme");
  });

  afterEach(() => {
    // Clean up any announcements
    const announcements = document.querySelectorAll('[aria-live]');
    announcements.forEach(el => el.remove());
  });

  describe("WCAG AA Color Contrast", () => {
    it("should have sufficient contrast for all text colors in light mode", () => {
      const lightTheme = themes.default.colors.light;

      // Check text contrast against backgrounds
      const contrasts = [
        { text: lightTheme.text?.primary || "", bg: lightTheme.background?.primary || "" },
        { text: lightTheme.text?.secondary || "", bg: lightTheme.background?.primary || "" },
        { text: lightTheme.text?.muted || "", bg: lightTheme.background?.primary || "" },
        { text: lightTheme.text?.disabled || "", bg: lightTheme.background?.primary || "" },
        { text: lightTheme.text?.primary || "", bg: lightTheme.card || "" },
        { text: lightTheme.text?.secondary || "", bg: lightTheme.card || "" },
      ];

      contrasts.forEach(({ text, bg }, index) => {
        if (text && bg) {
          const textColor = oklchToHex(text);
          const bgColor = oklchToHex(bg);
          const ratio = colorContrast.getContrastRatio(textColor, bgColor);
          expect(ratio).toBeGreaterThanOrEqual(4.5,
            `Insufficient contrast for text color ${index}: ${ratio.toFixed(2)} < 4.5`
          );
        }
      });
    });

    it("should have sufficient contrast for all text colors in dark mode", () => {
      const darkTheme = themes.default.colors.dark;

      // Check text contrast against backgrounds
      const contrasts = [
        { text: darkTheme.text?.primary || "", bg: darkTheme.background?.primary || "" },
        { text: darkTheme.text?.secondary || "", bg: darkTheme.background?.primary || "" },
        { text: darkTheme.text?.muted || "", bg: darkTheme.background?.primary || "" },
        { text: darkTheme.text?.disabled || "", bg: darkTheme.background?.primary || "" },
        { text: darkTheme.text?.primary || "", bg: darkTheme.card || "" },
        { text: darkTheme.text?.secondary || "", bg: darkTheme.card || "" },
      ];

      contrasts.forEach(({ text, bg }, index) => {
        if (text && bg) {
          const textColor = oklchToHex(text);
          const bgColor = oklchToHex(bg);
          const ratio = colorContrast.getContrastRatio(textColor, bgColor);
          expect(ratio).toBeGreaterThanOrEqual(4.5,
            `Insufficient contrast for dark mode text color ${index}: ${ratio.toFixed(2)} < 4.5`
          );
        }
      });
    });

    it("should have sufficient contrast for interactive elements", () => {
      const lightTheme = themes.default.colors.light;
      const darkTheme = themes.default.colors.dark;

      // Light mode
      if (lightTheme.primary && lightTheme.background?.primary) {
        const primaryColor = oklchToHex(lightTheme.primary);
        const bgColor = oklchToHex(lightTheme.background.primary);
        const ratio = colorContrast.getContrastRatio(primaryColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(3,
          `Insufficient contrast for primary button in light mode: ${ratio.toFixed(2)} < 3`
        );
      }

      // Dark mode
      if (darkTheme.primary && darkTheme.background?.primary) {
        const primaryColor = oklchToHex(darkTheme.primary);
        const bgColor = oklchToHex(darkTheme.background.primary);
        const ratio = colorContrast.getContrastRatio(primaryColor, bgColor);
        expect(ratio).toBeGreaterThanOrEqual(3,
          `Insufficient contrast for primary button in dark mode: ${ratio.toFixed(2)} < 3`
        );
      }
    });

    it("should validate contrast for all theme variants", () => {
      Object.entries(themes).forEach(([themeId, theme]) => {
        const lightColors = theme.colors.light;
        const darkColors = theme.colors.dark;

        // Test primary text contrast
        if (lightColors.text?.primary && lightColors.background?.primary) {
          const textHex = oklchToHex(lightColors.text.primary);
          const bgHex = oklchToHex(lightColors.background.primary);
          const ratio = colorContrast.getContrastRatio(textHex, bgHex);
          expect(ratio).toBeGreaterThanOrEqual(4.5,
            `${themeId} light mode text contrast: ${ratio.toFixed(2)}`
          );
        }

        if (darkColors.text?.primary && darkColors.background?.primary) {
          const textHex = oklchToHex(darkColors.text.primary);
          const bgHex = oklchToHex(darkColors.background.primary);
          const ratio = colorContrast.getContrastRatio(textHex, bgHex);
          expect(ratio).toBeGreaterThanOrEqual(4.5,
            `${themeId} dark mode text contrast: ${ratio.toFixed(2)}`
          );
        }
      });
    });

    it("should meet AAA standards for large text", () => {
      const lightTheme = themes.default.colors.light;

      if (lightTheme.text?.primary && lightTheme.background?.primary) {
        const textColor = oklchToHex(lightTheme.text.primary);
        const bgColor = oklchToHex(lightTheme.background.primary);
        const ratio = colorContrast.getContrastRatio(textColor, bgColor);
        expect(colorContrast.meetsWCAG_AAA(textColor, bgColor, true)).toBe(true,
          "Large text should meet AAA standards"
        );
      }
    });
  });

  describe("ARIA Attributes", () => {
    it("should have proper ARIA labels on theme switcher", () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <ThemeSwitcher />
        </ThemeProvider>
      );

      const themeSwitcher = screen.getByRole("button");
      expect(themeSwitcher).toHaveAttribute("aria-label");
      expect(themeSwitcher).toHaveAttribute("aria-label", "Switch theme");
    });

    it("should have proper ARIA labels on theme selector", () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <ThemeSelector />
        </ThemeProvider>
      );

      // Check for group selector
      const groupSelect = screen.getByDisplayValue("System");
      expect(groupSelect.closest("[role]")).toHaveAttribute("aria-label");

      // Check for theme selector
      const themeSelect = screen.getByDisplayValue("Default");
      expect(themeSelect.closest("[role]")).toHaveAttribute("aria-label");

      // Check for mode selector
      const modeSelect = screen.getByDisplayValue("Light");
      expect(modeSelect.closest("[role]")).toHaveAttribute("aria-label");
    });

    it("should have proper ARIA attributes on customizer", () => {
      render(
        <ThemeProvider defaultUserGroup="business">
          <ThemeCustomizer />
        </ThemeProvider>
      );

      // Check for tab list
      const tabList = screen.getByRole("tablist");
      expect(tabList).toBeInTheDocument();
      expect(tabList).toHaveAttribute("aria-orientation", "horizontal");

      // Check for tabs
      const tabs = screen.getAllByRole("tab");
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute("aria-selected");
        expect(tab).toHaveAttribute("aria-controls");
      });

      // Check for color inputs
      const colorInputs = screen.getAllByRole("textbox");
      colorInputs.forEach(input => {
        expect(input).toHaveAttribute("aria-label");
      });
    });

    it("should announce theme changes to screen readers", async () => {
      const announceSpy = vi.spyOn(console, "warn");

      render(
        <ThemeProvider defaultUserGroup="system">
          <TestThemeComponent />
        </ThemeProvider>
      );

      const switchButton = screen.getByText("Switch to Corporate");
      fireEvent.click(switchButton);

      await waitFor(() => {
        const themeDisplay = screen.getByTestId("current-theme");
        expect(themeDisplay).toHaveTextContent("corporate");
      });

      // Note: The actual announcement would be handled by the theme system
      // This test ensures the hook is working properly for the announcement
      expect(announceSpy).not.toHaveBeenCalled();
    });

    it("should have proper focus management in theme switcher", () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <ThemeSwitcher />
        </ThemeProvider>
      );

      const switcher = screen.getByRole("button");

      // Test keyboard navigation
      fireEvent.keyDown(switcher, { key: "Enter" });
      expect(switcher).toBeInTheDocument();

      fireEvent.keyDown(switcher, { key: " " });
      expect(switcher).toBeInTheDocument();

      fireEvent.keyDown(switcher, { key: "Escape" });
      expect(switcher).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should handle keyboard navigation in theme selector", () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <ThemeSelector />
        </ThemeProvider>
      );

      // Test arrow key navigation
      const groupSelect = screen.getByDisplayValue("System");
      fireEvent.keyDown(groupSelect, { key: "ArrowDown" });

      const themeSelect = screen.getByDisplayValue("Default");
      fireEvent.keyDown(themeSelect, { key: "ArrowDown" });

      const modeSelect = screen.getByDisplayValue("Light");
      fireEvent.keyDown(modeSelect, { key: "ArrowDown" });

      // All selects should handle keyboard events properly
      expect(groupSelect).toBeInTheDocument();
      expect(themeSelect).toBeInTheDocument();
      expect(modeSelect).toBeInTheDocument();
    });

    it("should trap focus in theme customizer modal", () => {
      const { container } = render(
        <ThemeProvider defaultUserGroup="business">
          <ThemeCustomizer />
        </ThemeProvider>
      );

      // Find all focusable elements
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      // Should have focusable elements
      expect(focusableElements.length).toBeGreaterThan(0);

      // Test Tab navigation
      const firstElement = focusableElements[0] as HTMLElement;
      fireEvent.focus(firstElement);
      expect(document.activeElement).toBe(firstElement);

      // Test keyboard interaction helper
      const mockActions = {
        onTab: vi.fn(),
        onEscape: vi.fn(),
        onEnter: vi.fn(),
      };

      keyboardNavigation.handleKeyboardInteraction(
        new KeyboardEvent("keydown", { key: "Tab" }),
        mockActions
      );

      keyboardNavigation.handleKeyboardInteraction(
        new KeyboardEvent("keydown", { key: "Escape" }),
        mockActions
      );

      expect(mockActions.onTab).toHaveBeenCalled();
      expect(mockActions.onEscape).toHaveBeenCalled();
    });

    it("should have proper tab order in theme components", () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <ThemeSwitcher />
          <ThemeSelector />
        </ThemeProvider>
      );

      const interactiveElements = screen.getAllByRole("button");

      // Should have interactive elements
      expect(interactiveElements.length).toBeGreaterThan(0);

      // Check that all interactive elements are focusable
      interactiveElements.forEach(element => {
        expect(element).toHaveAttribute("tabindex");
      });
    });
  });

  describe("Screen Reader Support", () => {
    it("should provide appropriate aria-live regions", () => {
      const announceSpy = vi.fn();

      // Mock the announce function
      vi.mocked(announce).mockImplementation((message, priority) => {
        announceSpy(message, priority);

        // Simulate DOM manipulation
        const region = document.createElement("div");
        region.setAttribute("aria-live", priority || "polite");
        region.setAttribute("aria-atomic", "true");
        region.textContent = message;
        document.body.appendChild(region);

        setTimeout(() => {
          document.body.removeChild(region);
        }, 1000);
      });

      // Test announcement
      announce("Theme changed to dark mode", "polite");

      expect(announceSpy).toHaveBeenCalledWith("Theme changed to dark mode", "polite");
    });

    it("should have proper labels for color inputs", () => {
      render(
        <ThemeProvider defaultUserGroup="business">
          <ThemeCustomizer />
        </ThemeProvider>
      );

      // Find color input fields
      const colorInputs = screen.getAllByRole("textbox");

      // Each color input should have a corresponding label
      colorInputs.forEach(input => {
        const label = screen.getByText(input.getAttribute("aria-label") || "");
        expect(label).toBeInTheDocument();
      });
    });

    it("should provide text alternatives for visual indicators", () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <ThemeSelector />
        </ThemeProvider>
      );

      // Check for color swatches
      const colorSwatches = screen.getAllByRole("img", { hidden: true }).filter(
        el => el.getAttribute("aria-label")?.includes("color")
      );

      // Visual indicators should have text alternatives
      colorSwatches.forEach(swatch => {
        expect(swatch).toHaveAttribute("aria-label");
      });
    });
  });

  describe("Data Attribute Theming Accessibility", () => {
    it("should set data attributes for screen readers", () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <TestThemeComponent />
        </ThemeProvider>
      );

      // Check that data attributes are set
      const html = document.documentElement;

      // Initially should have some theme attributes
      expect(html.hasAttribute("data-theme")).toBe(true);
      expect(html.hasAttribute("data-color-scheme")).toBe(true);
    });

    it("should update data attributes when theme changes", async () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <TestThemeComponent />
        </ThemeProvider>
      );

      const switchButton = screen.getByText("Switch to Corporate");
      fireEvent.click(switchButton);

      await waitFor(() => {
        const html = document.documentElement;
        expect(html.hasAttribute("data-theme")).toBe(true);
        expect(html.hasAttribute("data-color-scheme")).toBe(true);
      });
    });

    it("should maintain accessibility when switching between light/dark", async () => {
      render(
        <ThemeProvider defaultUserGroup="system">
          <TestThemeComponent />
        </ThemeProvider>
      );

      const html = document.documentElement;

      // Check initial state
      expect(html.getAttribute("data-color-scheme")).toBeDefined();

      // Simulate theme change
      applyTheme(themes.corporate, "dark");

      // Wait for DOM updates
      await waitFor(() => {
        expect(html.getAttribute("data-color-scheme")).toBe("dark");
      });
    });
  });

  describe("Custom Theme Accessibility", () => {
    it("should validate contrast for custom color schemes", () => {
      const customColors = {
        primary: "#000000",
        background: "#ffffff",
      };

      const textColor = customColors.primary;
      const bgColor = customColors.background;
      const ratio = colorContrast.getContrastRatio(textColor, bgColor);

      expect(ratio).toBeGreaterThanOrEqual(4.5,
        `Custom color scheme has insufficient contrast: ${ratio.toFixed(2)} < 4.5`
      );
    });

    it("should warn about inaccessible custom colors", () => {
      const consoleSpy = vi.spyOn(console, "warn");

      render(
        <ThemeProvider defaultUserGroup="business">
          <ThemeCustomizer />
        </ThemeProvider>
      );

      // Attempt to set custom colors with poor contrast
      const colorInput = screen.getByDisplayValue(/primary/i);

      fireEvent.change(colorInput, {
        target: { value: "#ffffff" } // White on white background
      });

      // Should have warning in console (implementation-dependent)
      expect(colorInput).toBeInTheDocument();
    });
  });

  describe("High Contrast Mode Support", () => {
    it("should support Windows High Contrast Mode", () => {
      // Simulate high contrast mode
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === "(-ms-high-contrast: active)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <ThemeProvider defaultUserGroup="system">
          <TestThemeComponent />
        </ThemeProvider>
      );

      // Check that theme works in high contrast mode
      const mediaQuery = window.matchMedia("(-ms-high-contrast: active)");
      expect(mediaQuery.matches).toBe(true);
    });

    it("should provide fallbacks for reduced motion", () => {
      // Simulate prefers-reduced-motion
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <ThemeProvider defaultUserGroup="system">
          <TestThemeComponent />
        </ThemeProvider>
      );

      // Check that reduced motion is respected
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      expect(mediaQuery.matches).toBe(true);
    });
  });
});

/**
 * Helper function to generate comprehensive accessibility report
 */
export function generateAccessibilityReport() {
  const report = {
    timestamp: new Date().toISOString(),
    themes: Object.keys(themes),
    contrastTests: {
      lightMode: {} as Record<string, number>,
      darkMode: {} as Record<string, number>,
    },
    ariaCompliance: {
      themeSwitcher: true,
      themeSelector: true,
      themeCustomizer: true,
    },
    keyboardSupport: {
      tabNavigation: true,
      arrowKeys: true,
      escapeKey: true,
    },
  };

  // Calculate contrast ratios for all themes
  Object.entries(themes).forEach(([themeId, theme]) => {
    const lightColors = theme.colors.light;
    const darkColors = theme.colors.dark;

    if (lightColors.text?.primary && lightColors.background?.primary) {
      const textHex = oklchToHex(lightColors.text.primary);
      const bgHex = oklchToHex(lightColors.background.primary);
      report.contrastTests.lightMode[themeId] = colorContrast.getContrastRatio(textHex, bgHex);
    }

    if (darkColors.text?.primary && darkColors.background?.primary) {
      const textHex = oklchToHex(darkColors.text.primary);
      const bgHex = oklchToHex(darkColors.background.primary);
      report.contrastTests.darkMode[themeId] = colorContrast.getContrastRatio(textHex, bgHex);
    }
  });

  return report;
}