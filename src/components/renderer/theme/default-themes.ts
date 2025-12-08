import { Theme } from "@/types/ui-theme";

// Light theme
export const lightTheme: Theme = {
  name: "light",

  colors: {
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6", // Main primary
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },

    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b", // Main secondary
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },

    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
      950: "#030712",
    },

    // Semantic colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#06b6d4",

    // Background colors
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
      inverse: "#1f2937",
    },

    // Text colors
    text: {
      primary: "#111827",
      secondary: "#4b5563",
      tertiary: "#6b7280",
      inverse: "#ffffff",
      disabled: "#9ca3af",
    },

    // Border colors
    border: {
      primary: "#d1d5db",
      secondary: "#e5e7eb",
      focus: "#3b82f6",
      error: "#ef4444",
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
      50: "#1e3a8a",
      100: "#1e40af",
      200: "#1d4ed8",
      300: "#2563eb",
      400: "#3b82f6",
      500: "#60a5fa", // Main primary (brighter in dark mode)
      600: "#93c5fd",
      700: "#bfdbfe",
      800: "#dbeafe",
      900: "#eff6ff",
      950: "#eff6ff",
    },

    secondary: {
      50: "#0f172a",
      100: "#1e293b",
      200: "#334155",
      300: "#475569",
      400: "#64748b",
      500: "#94a3b8", // Main secondary (lighter in dark mode)
      600: "#cbd5e1",
      700: "#e2e8f0",
      800: "#f1f5f9",
      900: "#f8fafc",
      950: "#f8fafc",
    },

    gray: {
      50: "#030712",
      100: "#111827",
      200: "#1f2937",
      300: "#374151",
      400: "#4b5563",
      500: "#6b7280",
      600: "#9ca3af",
      700: "#d1d5db",
      800: "#e5e7eb",
      900: "#f3f4f6",
      950: "#f9fafb",
    },

    // Semantic colors
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
    info: "#22d3ee",

    // Background colors
    background: {
      primary: "#0f172a",
      secondary: "#1e293b",
      tertiary: "#334155",
      inverse: "#ffffff",
    },

    // Text colors
    text: {
      primary: "#f9fafb",
      secondary: "#d1d5db",
      tertiary: "#9ca3af",
      inverse: "#0f172a",
      disabled: "#4b5563",
    },

    // Border colors
    border: {
      primary: "#374151",
      secondary: "#4b5563",
      focus: "#60a5fa",
      error: "#f87171",
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
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.6)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.3)",
    none: "none",
  },

  animations: {
    ...lightTheme.animations, // Same animation settings
  },

  breakpoints: {
    ...lightTheme.breakpoints, // Same breakpoints
  },
};
