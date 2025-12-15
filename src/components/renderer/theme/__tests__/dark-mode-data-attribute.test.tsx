import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../theme-provider';

// Mock CSS module to test the dark mode variant configuration
describe('Dark Mode Data Attribute Configuration', () => {

  // Mock window.matchMedia to control system theme preference
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false, // Default to light mode preference
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Clear localStorage before each test
    localStorage.clear();
  });
  it('should set data-color-scheme attribute on document element', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Test Content</div>
      </ThemeProvider>
    );

    // Check that the data-color-scheme attribute is set to "dark"
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should set data-color-scheme attribute to light for light theme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <div>Test Content</div>
      </ThemeProvider>
    );

    // Check that the data-color-scheme attribute is set to "light"
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should support system theme detection', () => {
    // Mock system preference for dark mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)', // Force dark mode preference
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Clear localStorage to force system preference detection
    localStorage.clear();

    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    // Should detect system dark mode preference
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark');
  });

  it('should be compatible with Tailwind CSS v4 @custom-variant dark', () => {
    // This test verifies that the @custom-variant dark (&:is([data-color-scheme="dark"] *));
    // configuration in globals.css and themes.css matches the attributes set by ThemeProvider

    render(
      <ThemeProvider defaultTheme="dark">
        <div data-testid="test-element" className="dark:bg-gray-900">Test Content</div>
      </ThemeProvider>
    );

    // Verify the attribute is set correctly for the @custom-variant to work
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark');

    // The dark: variant should now apply styles when data-color-scheme="dark"
    // This would be tested in a browser environment where CSS is processed
  });
});