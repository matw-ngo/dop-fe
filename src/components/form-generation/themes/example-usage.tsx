/**
 * Form Generation Library - Simplified Theme Usage Example
 *
 * Example showing how to create and use simplified themes
 */

"use client";

import { legacyLoanThemeSimplified } from "./legacy-loan-simplified";
import { FormThemeProvider } from "./ThemeProvider";
import { createTheme, expandTheme } from "./theme-utils";
import type { FormTheme as SimplifiedFormTheme } from "./types-simplified";

// Example 1: Using the predefined simplified legacy loan theme
export function ExampleWithLegacyTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  // Convert simplified theme to full theme for backward compatibility
  const fullTheme = expandTheme(legacyLoanThemeSimplified);

  return <FormThemeProvider theme={fullTheme}>{children}</FormThemeProvider>;
}

// Example 2: Creating a custom theme with only a few properties
export function createCustomTheme() {
  // Only customize what you need
  const partialTheme: Partial<SimplifiedFormTheme> = {
    name: "my-custom",
    colors: {
      primary: "#3b82f6", // Blue
      border: "#e5e7eb",
      error: "#ef4444",
    },
    borderRadius: {
      control: "12px", // More rounded
    },
    sizes: {
      md: "56px", // Slightly shorter
    },
  };

  // The utility fills in the rest with sensible defaults
  return createTheme(partialTheme);
}

// Example 3: Creating a dark theme
export function createDarkTheme() {
  const darkTheme: SimplifiedFormTheme = {
    name: "dark",
    colors: {
      primary: "#60a5fa",
      border: "#374151",
      borderFocus: "#60a5fa",
      background: "#1f2937",
      placeholder: "#9ca3af",
      error: "#f87171",
      disabled: "#111827",
      readOnly: "#374151",
    },
    borderRadius: {
      control: "6px",
    },
    spacing: {
      paddingHorizontal: "16px",
      paddingVertical: "12px",
    },
    typography: {
      fontSize: "14px",
      labelFontSize: "12px",
      labelFontWeight: "500",
    },
    sizes: {
      sm: "40px",
      md: "48px",
      lg: "56px",
    },
    focusRing: {
      width: "2px",
      color: "#60a5fa",
      opacity: "0.3",
    },
    fieldOptions: {
      internalLabel: false,
    },
  };

  return expandTheme(darkTheme);
}

// Example 4: Minimal theme - change only colors
export const minimalTheme = createTheme({
  name: "minimal",
  colors: {
    primary: "#10b981", // Emerald
    border: "#d1d5db",
  },
});

// Example 5: Brand theme for a company
export const brandTheme = createTheme({
  name: "brand",
  colors: {
    primary: "#6366f1", // Indigo
    border: "#e0e7ff",
    borderFocus: "#6366f1",
    error: "#dc2626",
  },
  borderRadius: {
    control: "4px", // Sharp corners
  },
  focusRing: {
    width: "3px", // Thicker focus ring
    opacity: "0.15",
  },
  fieldOptions: {
    internalLabel: true,
  },
});

// Example component showing usage
export function ThemedFormExample() {
  return (
    <>
      {/* Using legacy loan theme */}
      <ExampleWithLegacyTheme>
        <form>
          {/* Your form fields here */}
          <input type="text" placeholder="Legacy Loan Theme" />
        </form>
      </ExampleWithLegacyTheme>

      {/* Using custom theme */}
      <FormThemeProvider theme={createCustomTheme()}>
        <form>
          {/* Your form fields here */}
          <input type="text" placeholder="Custom Theme" />
        </form>
      </FormThemeProvider>

      {/* Using dark theme */}
      <FormThemeProvider theme={createDarkTheme()}>
        <form className="dark">
          {/* Your form fields here */}
          <input type="text" placeholder="Dark Theme" />
        </form>
      </FormThemeProvider>

      {/* Using minimal theme */}
      <FormThemeProvider theme={minimalTheme}>
        <form>
          {/* Your form fields here */}
          <input type="text" placeholder="Minimal Theme" />
        </form>
      </FormThemeProvider>
    </>
  );
}

/**
 * Migration Guide:
 *
 * OLD WAY (complex):
 * ```tsx
 * const myTheme: FormTheme = {
 *   name: "my-theme",
 *   control: {
 *     base: "w-full border bg-white transition-colors placeholder:text-gray-400 placeholder:text-sm placeholder:font-medium data-[placeholder]:text-gray-400 data-[placeholder]:text-sm data-[placeholder]:font-medium [&::placeholder]:text-gray-400 [&::placeholder]:text-sm [&::placeholder]:font-medium [&[data-placeholder]]:text-gray-400 [&[data-placeholder]]:text-sm [&[data-placeholder]]:font-medium",
 *     variants: {
 *       default: "border-[#bfd1cc] rounded-[8px]",
 *       // ...
 *     },
 *     // ... lots of repeated CSS
 *   },
 *   // ...
 * };
 * ```
 *
 * NEW WAY (simple):
 * ```tsx
 * const myTheme = createTheme({
 *   name: "my-theme",
 *   colors: {
 *     primary: "#017848",
 *     border: "#bfd1cc",
 *   },
 *   borderRadius: {
 *     control: "8px",
 *   },
 * });
 * ```
 */
