/**
 * Form Theme Type Definition
 *
 * Comprehensive theme structure following design token best practices
 * Based on 4px/8px spacing scale and semantic token naming
 */

import type { CSSProperties } from "react";

export interface FormTheme {
  name: string;

  // Color tokens - Semantic naming for purpose-driven usage
  colors: {
    // Core brand colors
    primary: string;

    // Border colors
    border: string;
    borderFocus: string;

    // Background colors
    background: string;
    backgroundSecondary?: string;

    // Text colors
    textPrimary?: string;
    textSecondary?: string;

    // State colors
    placeholder: string;
    error: string;
    disabled: string;
    readOnly: string;

    // Radio specific
    radioBorder?: string;

    // Extended semantic colors
    accent?: string;
    accentText?: string;
    surface?: string;
    overlay?: string;
    muted?: string;
    hover?: string;
    headingText?: string;
    containerBorder?: string;
    interactiveBorder?: string;
    infoBackground?: string;
    warning?: string;
    iconSubtle?: string;
    neutralBackground?: string;
  };

  // Spacing tokens - 4px base scale (4, 8, 12, 16, 20, 24, 32, 40, 48...)
  spacing: {
    // Micro spacing (0-8px)
    xxs: string; // 2px
    xs: string; // 4px
    sm: string; // 8px

    // Standard spacing (12-24px)
    md: string; // 12px
    base: string; // 16px
    lg: string; // 20px
    xl: string; // 24px

    // Large spacing (32-48px)
    "2xl": string; // 32px
    "3xl": string; // 40px
    "4xl": string; // 48px

    // Legacy support
    paddingHorizontal?: string;
    paddingVertical?: string;
  };

  // Typography tokens - Font sizes, weights, line heights
  typography: {
    // Font sizes (12-32px scale)
    fontSizes: {
      xs: string; // 12px
      sm: string; // 14px
      base: string; // 16px
      lg: string; // 18px
      xl: string; // 20px
      "2xl": string; // 24px
      "3xl": string; // 32px
    };

    // Font weights
    fontWeights: {
      normal: number; // 400
      medium: number; // 500
      semibold: number; // 600
      bold: number; // 700
    };

    // Line heights
    lineHeights: {
      tight: string; // 16px
      snug: string; // 20px
      normal: string; // 24px
      relaxed: string; // 28px
      loose: string; // 32px
      xl: string; // 40px
    };

    // Legacy support
    fontSize?: string;
    labelFontSize?: string;
    labelFontWeight?: string;
  };

  // Border radius tokens
  borderRadius: {
    sm: string; // 4px
    md: string; // 8px
    lg: string; // 12px
    xl: string; // 16px
    control?: string; // Legacy
  };

  // Size tokens - Component heights
  sizes: {
    sm: string; // 48px
    md: string; // 60px
    lg: string; // 64px
  };

  // Focus ring tokens
  focusRing: {
    width: string;
    color: string;
    opacity: string;
  };

  // Field options
  fieldOptions?: {
    internalLabel?: boolean;
  };

  // Legacy label/error/help styling (backward compatibility)
  label?: {
    base: string;
    required: string;
    disabled: string;
  };

  error?: {
    base: string;
    icon: string;
  };

  help?: {
    base: string;
  };

  // Optional specialized styling for specific field types
  components?: {
    file?: {
      borderDashed: string;
      backgroundDashed: string;
      hoverBackground: string;
      hoverBorder: string;
    };

    ekyc?: {
      success: string;
      processing: string;
      retryButton: string;
    };

    checkable?: {
      checkedColor: string;
      uncheckedBorder: string;
      focusRing: string;
    };
  };
}
