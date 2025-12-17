import type { Theme } from "../types/ui-theme";

// Light theme
export const lightTheme: Theme = {
  name: "light",

  colors: {
    primary: {
      50: "oklch(0.979 0.014 250.981)",
      100: "oklch(0.945 0.041 247.858)",
      200: "oklch(0.904 0.073 247.858)",
      300: "oklch(0.839 0.113 247.858)",
      400: "oklch(0.733 0.155 247.858)",
      500: "oklch(0.623 0.188 259.815)", // Main primary
      600: "oklch(0.511 0.208 259.815)",
      700: "oklch(0.425 0.199 259.815)",
      800: "oklch(0.353 0.172 259.815)",
      900: "oklch(0.297 0.143 259.815)",
      950: "oklch(0.202 0.108 259.815)",
    },

    secondary: {
      50: "oklch(0.987 0.002 247.858)",
      100: "oklch(0.971 0.009 247.858)",
      200: "oklch(0.938 0.021 247.858)",
      300: "oklch(0.887 0.037 247.858)",
      400: "oklch(0.795 0.051 247.858)",
      500: "oklch(0.685 0.059 247.858)", // Main secondary
      600: "oklch(0.566 0.059 247.858)",
      700: "oklch(0.449 0.055 247.858)",
      800: "oklch(0.293 0.045 247.858)",
      900: "oklch(0.147 0.032 247.858)",
      950: "oklch(0.065 0.019 247.858)",
    },

    gray: {
      50: "oklch(0.989 0.002 247.858)",
      100: "oklch(0.973 0.006 247.858)",
      200: "oklch(0.938 0.011 247.858)",
      300: "oklch(0.873 0.017 247.858)",
      400: "oklch(0.773 0.022 247.858)",
      500: "oklch(0.647 0.025 247.858)",
      600: "oklch(0.516 0.025 247.858)",
      700: "oklch(0.389 0.023 247.858)",
      800: "oklch(0.245 0.02 247.858)",
      900: "oklch(0.13 0.016 247.858)",
      950: "oklch(0.047 0.011 247.858)",
    },

    // Semantic colors
    success: "oklch(0.696 0.149 162.48)",
    warning: "oklch(0.769 0.165 70.08)",
    error: "oklch(0.637 0.208 25.331)",
    info: "oklch(0.715 0.126 215.221)",

    // Background colors
    background: {
      primary: "oklch(1 0 0)",
      secondary: "oklch(0.989 0.002 247.858)",
      tertiary: "oklch(0.973 0.006 247.858)",
      inverse: "oklch(0.245 0.02 247.858)",
    },

    // Text colors
    text: {
      primary: "oklch(0.13 0.016 247.858)",
      secondary: "oklch(0.516 0.025 247.858)",
      tertiary: "oklch(0.647 0.025 247.858)",
      inverse: "oklch(1 0 0)",
      disabled: "oklch(0.773 0.022 247.858)",
    },

    // Border colors
    border: {
      primary: "oklch(0.873 0.017 247.858)",
      secondary: "oklch(0.938 0.011 247.858)",
      focus: "oklch(0.623 0.188 259.815)",
      error: "oklch(0.637 0.208 25.331)",
    },
  },

  typography: {
    fontFamily: {
      sans: [
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        '"Noto Sans"',
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      serif: ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
      mono: [
        '"SF Mono"',
        "Monaco",
        "Inconsolata",
        '"Roboto Mono"',
        '"Source Code Pro"',
        "Menlo",
        "Consolas",
        '"DejaVu Sans Mono"',
        '"Bitstream Vera Sans Mono"',
        "monospace",
      ],
    },

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
    },

    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },

  spacing: {
    0: "0",
    px: "1px",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },

  borderRadius: {
    none: "0",
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "none",
  },

  animations: {
    duration: {
      75: "75ms",
      100: "100ms",
      150: "150ms",
      200: "200ms",
      300: "300ms",
      500: "500ms",
      700: "700ms",
      1000: "1000ms",
    },

    easing: {
      linear: "linear",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
    },
  },

  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// Dark theme
export const darkTheme: Theme = {
  name: "dark",

  colors: {
    primary: {
      50: "oklch(0.202 0.108 259.815)",
      100: "oklch(0.353 0.172 259.815)",
      200: "oklch(0.425 0.199 259.815)",
      300: "oklch(0.511 0.208 259.815)",
      400: "oklch(0.623 0.188 259.815)",
      500: "oklch(0.733 0.155 247.858)", // Main primary (brighter in dark mode)
      600: "oklch(0.839 0.113 247.858)",
      700: "oklch(0.904 0.073 247.858)",
      800: "oklch(0.945 0.041 247.858)",
      900: "oklch(0.979 0.014 250.981)",
      950: "oklch(0.979 0.014 250.981)",
    },

    secondary: {
      50: "oklch(0.065 0.019 247.858)",
      100: "oklch(0.293 0.045 247.858)",
      200: "oklch(0.449 0.055 247.858)",
      300: "oklch(0.566 0.059 247.858)",
      400: "oklch(0.685 0.059 247.858)",
      500: "oklch(0.795 0.051 247.858)", // Main secondary (lighter in dark mode)
      600: "oklch(0.887 0.037 247.858)",
      700: "oklch(0.938 0.021 247.858)",
      800: "oklch(0.971 0.009 247.858)",
      900: "oklch(0.987 0.002 247.858)",
      950: "oklch(0.987 0.002 247.858)",
    },

    gray: {
      50: "oklch(0.047 0.011 247.858)",
      100: "oklch(0.13 0.016 247.858)",
      200: "oklch(0.245 0.02 247.858)",
      300: "oklch(0.389 0.023 247.858)",
      400: "oklch(0.516 0.025 247.858)",
      500: "oklch(0.647 0.025 247.858)",
      600: "oklch(0.773 0.022 247.858)",
      700: "oklch(0.873 0.017 247.858)",
      800: "oklch(0.938 0.011 247.858)",
      900: "oklch(0.973 0.006 247.858)",
      950: "oklch(0.989 0.002 247.858)",
    },

    // Semantic colors
    success: "oklch(0.795 0.139 162.48)",
    warning: "oklch(0.839 0.158 70.08)",
    error: "oklch(0.718 0.181 25.331)",
    info: "oklch(0.815 0.141 215.221)",

    // Background colors
    background: {
      primary: "oklch(0.065 0.019 247.858)",
      secondary: "oklch(0.293 0.045 247.858)",
      tertiary: "oklch(0.449 0.055 247.858)",
      inverse: "oklch(1 0 0)",
    },

    // Text colors
    text: {
      primary: "oklch(0.987 0.002 247.858)",
      secondary: "oklch(0.873 0.017 247.858)",
      tertiary: "oklch(0.773 0.022 247.858)",
      inverse: "oklch(0.065 0.019 247.858)",
      disabled: "oklch(0.516 0.025 247.858)",
    },

    // Border colors
    border: {
      primary: "oklch(0.389 0.023 247.858)",
      secondary: "oklch(0.516 0.025 247.858)",
      focus: "oklch(0.733 0.155 247.858)",
      error: "oklch(0.718 0.181 25.331)",
    },
  },

  typography: {
    ...lightTheme.typography, // Same typography settings
  },

  spacing: {
    ...lightTheme.spacing, // Same spacing scale
  },

  borderRadius: {
    ...lightTheme.borderRadius, // Same border radius
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "none",
  },

  animations: {
    ...lightTheme.animations, // Same animation settings
  },

  breakpoints: {
    ...lightTheme.breakpoints, // Same breakpoints
  },
};
