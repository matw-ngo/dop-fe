import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Use class-based dark mode for compatibility with our ThemeProvider
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Use CSS custom properties that align with our theme system
      colors: {
        // Theme-aware colors using CSS variables
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
          DEFAULT: "var(--color-primary-500)",
        },
        secondary: {
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
          950: "var(--color-secondary-950)",
          DEFAULT: "var(--color-secondary-500)",
        },
        gray: {
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
          950: "var(--color-gray-950)",
          DEFAULT: "var(--color-gray-500)",
        },
        // Semantic colors
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
        // Background colors
        background: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          inverse: "var(--bg-inverse)",
        },
        // Text colors
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          inverse: "var(--text-inverse)",
          disabled: "var(--text-disabled)",
        },
        // Border colors
        border: {
          primary: "var(--border-primary)",
          secondary: "var(--border-secondary)",
          focus: "var(--border-focus)",
          error: "var(--border-error)",
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },

      fontSize: {
        xs: [
          "var(--font-size-xs)",
          { lineHeight: "var(--font-size-xs-line-height)" },
        ],
        sm: [
          "var(--font-size-sm)",
          { lineHeight: "var(--font-size-sm-line-height)" },
        ],
        base: [
          "var(--font-size-base)",
          { lineHeight: "var(--font-size-base-line-height)" },
        ],
        lg: [
          "var(--font-size-lg)",
          { lineHeight: "var(--font-size-lg-line-height)" },
        ],
        xl: [
          "var(--font-size-xl)",
          { lineHeight: "var(--font-size-xl-line-height)" },
        ],
        "2xl": [
          "var(--font-size-2xl)",
          { lineHeight: "var(--font-size-2xl-line-height)" },
        ],
        "3xl": [
          "var(--font-size-3xl)",
          { lineHeight: "var(--font-size-3xl-line-height)" },
        ],
        "4xl": [
          "var(--font-size-4xl)",
          { lineHeight: "var(--font-size-4xl-line-height)" },
        ],
        "5xl": [
          "var(--font-size-5xl)",
          { lineHeight: "var(--font-size-5xl-line-height)" },
        ],
        "6xl": [
          "var(--font-size-6xl)",
          { lineHeight: "var(--font-size-6xl-line-height)" },
        ],
      },

      spacing: {
        "0": "var(--spacing-0)",
        px: "var(--spacing-px)",
        "0-5": "var(--spacing-0-5)",
        "1": "var(--spacing-1)",
        "1-5": "var(--spacing-1-5)",
        "2": "var(--spacing-2)",
        "2-5": "var(--spacing-2-5)",
        "3": "var(--spacing-3)",
        "3-5": "var(--spacing-3-5)",
        "4": "var(--spacing-4)",
        "5": "var(--spacing-5)",
        "6": "var(--spacing-6)",
        "7": "var(--spacing-7)",
        "8": "var(--spacing-8)",
        "9": "var(--spacing-9)",
        "10": "var(--spacing-10)",
        "11": "var(--spacing-11)",
        "12": "var(--spacing-12)",
        "14": "var(--spacing-14)",
        "16": "var(--spacing-16)",
        "20": "var(--spacing-20)",
        "24": "var(--spacing-24)",
        "28": "var(--spacing-28)",
        "32": "var(--spacing-32)",
        "36": "var(--spacing-36)",
        "40": "var(--spacing-40)",
        "44": "var(--spacing-44)",
        "48": "var(--spacing-48)",
        "52": "var(--spacing-52)",
        "56": "var(--spacing-56)",
        "60": "var(--spacing-60)",
        "64": "var(--spacing-64)",
        "72": "var(--spacing-72)",
        "80": "var(--spacing-80)",
        "96": "var(--spacing-96)",
      },

      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-DEFAULT)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-DEFAULT)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        none: "var(--shadow-none)",
      },

      transitionDuration: {
        "75": "var(--duration-75)",
        "100": "var(--duration-100)",
        "150": "var(--duration-150)",
        "200": "var(--duration-200)",
        "300": "var(--duration-300)",
        "500": "var(--duration-500)",
        "700": "var(--duration-700)",
        "1000": "var(--duration-1000)",
      },

      transitionTimingFunction: {
        linear: "var(--easing-linear)",
        in: "var(--easing-in)",
        out: "var(--easing-out)",
        "in-out": "var(--easing-in-out)",
        "bounce-in": "var(--easing-bounce-in)",
        smooth: "var(--easing-smooth)",
      },

      // Additional custom components for renderer
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },

      animation: {
        "fade-in": "fade-in var(--duration-200) var(--easing-in-out)",
        "fade-out": "fade-out var(--duration-200) var(--easing-in-out)",
        "slide-in-from-top":
          "slide-in-from-top var(--duration-300) var(--easing-out)",
        "slide-in-from-bottom":
          "slide-in-from-bottom var(--duration-300) var(--easing-out)",
        "slide-in-from-left":
          "slide-in-from-left var(--duration-300) var(--easing-out)",
        "slide-in-from-right":
          "slide-in-from-right var(--duration-300) var(--easing-out)",
        "scale-in": "scale-in var(--duration-200) var(--easing-bounce-in)",
        "scale-out": "scale-out var(--duration-200) var(--easing-in)",
        "bounce-in": "bounce-in var(--duration-500) var(--easing-bounce-in)",
      },
    },
  },
  plugins: [
    // Plugin for component variants
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    // Custom plugin for renderer variants
    function ({ addUtilities, theme }: any) {
      const newUtilities = {
        ".field-container": {
          position: "relative",
          display: "flex",
          flexDirection: "column",
        },
        ".field-label": {
          fontSize: theme("fontSize.sm"),
          fontWeight: theme("fontWeight.medium"),
          color: "var(--text-primary)",
          marginBottom: "var(--spacing-1-5)",
        },
        ".field-error": {
          fontSize: theme("fontSize.sm"),
          color: "var(--color-error)",
          marginTop: "var(--spacing-1)",
        },
        ".field-help": {
          fontSize: theme("fontSize.sm"),
          color: "var(--text-tertiary)",
          marginTop: "var(--spacing-1)",
        },
        // Variant utilities for input sizes
        ".input-sm": {
          fontSize: theme("fontSize.sm"),
          padding: `${theme("spacing.2")} ${theme("spacing.3")}`,
          height: "2rem",
        },
        ".input-md": {
          fontSize: theme("fontSize.base"),
          padding: `${theme("spacing.2-5")} ${theme("spacing.3-5")}`,
          height: "2.5rem",
        },
        ".input-lg": {
          fontSize: theme("fontSize.lg"),
          padding: `${theme("spacing.3")} ${theme("spacing.4")}`,
          height: "3rem",
        },
        ".input-xl": {
          fontSize: theme("fontSize.xl"),
          padding: `${theme("spacing.3-5")} ${theme("spacing.5")}`,
          height: "3.5rem",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

export default config;
