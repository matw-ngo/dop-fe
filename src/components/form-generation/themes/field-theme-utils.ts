/**
 * Field Theme Utilities
 *
 * Helper functions for field components to use theme consistently
 */

import type { CSSProperties } from "react";
import type { FormTheme } from "./types";

/**
 * Generates CSS variables object for field components
 * Reduces code duplication across field components
 *
 * @param theme - Current theme from useFormTheme()
 * @returns CSS variables object ready to use in style prop
 *
 * @example
 * ```tsx
 * const { theme } = useFormTheme();
 * const cssVars = getFieldCssVars(theme);
 *
 * <div style={cssVars}>
 *   <input className="border-[var(--form-border)]" />
 * </div>
 * ```
 */
export function getFieldCssVars(theme: FormTheme): CSSProperties {
  const textPrimary = theme.colors.textPrimary || "#0f172a";
  const textSecondary = theme.colors.textSecondary || "#64748b";

  return {
    // Form-specific variables
    "--form-primary": theme.colors.primary,
    "--form-border": theme.colors.border,
    "--form-border-focus": theme.colors.borderFocus || theme.colors.primary,
    "--form-bg": theme.colors.background,
    "--form-text": textPrimary,
    "--form-text-secondary": textSecondary,
    "--form-placeholder": theme.colors.placeholder,
    "--form-error": theme.colors.error,
    "--form-disabled-bg": theme.colors.disabled,
    "--form-readonly-bg": theme.colors.readOnly,
    "--form-radio-border": theme.colors.radioBorder || theme.colors.border,
    "--form-muted-bg": theme.colors.readOnly,

    // Shadcn/UI compatibility variables
    "--primary": theme.colors.primary,
    "--primary-foreground": "#ffffff",
    "--ring": theme.colors.borderFocus || theme.colors.primary,
    "--border": theme.colors.border,
    "--input": theme.colors.border,
    "--background": theme.colors.background,
    "--foreground": textPrimary,
    "--muted": theme.colors.readOnly,
    "--muted-foreground": textSecondary,
    "--accent": theme.colors.readOnly,
    "--accent-foreground": textPrimary,
    "--destructive": theme.colors.error,
    "--card": theme.colors.background,
    "--card-foreground": textPrimary,

    // Color-prefixed versions for shadcn components
    "--color-primary": theme.colors.primary,
    "--color-primary-foreground": "#ffffff",
    "--color-ring": theme.colors.borderFocus || theme.colors.primary,
    "--color-border": theme.colors.border,
    "--color-input": theme.colors.border,
    "--color-background": theme.colors.background,
    "--color-foreground": textPrimary,
    "--color-muted": theme.colors.readOnly,
    "--color-muted-foreground": textSecondary,
    "--color-accent": theme.colors.readOnly,
    "--color-accent-foreground": textPrimary,
    "--color-destructive": theme.colors.error,
    "--color-card": theme.colors.background,
    "--color-card-foreground": textPrimary,

    // Layout
    "--radius": theme.borderRadius.control,
  } as CSSProperties;
}

/**
 * Generates CSS variables specifically for popover/dropdown components
 * Used by DateField, SelectField, etc.
 *
 * @param theme - Current theme from useFormTheme()
 * @returns CSS variables object for popover styling
 *
 * @example
 * ```tsx
 * const { theme } = useFormTheme();
 * const popoverVars = getPopoverCssVars(theme);
 *
 * <PopoverContent style={popoverVars}>
 *   ...
 * </PopoverContent>
 * ```
 */
export function getPopoverCssVars(theme: FormTheme): CSSProperties {
  const textPrimary = theme.colors.textPrimary || "#0f172a";
  const textSecondary = theme.colors.textSecondary || "#64748b";

  return {
    backgroundColor: theme.colors.background,
    color: textPrimary,
    borderColor: theme.colors.border,

    // Popover-specific variables
    "--popover": theme.colors.background,
    "--popover-foreground": textPrimary,
    "--color-popover": theme.colors.background,
    "--color-popover-foreground": textPrimary,

    // Other UI variables for consistency
    "--color-background": theme.colors.background,
    "--color-foreground": textPrimary,
    "--color-accent": theme.colors.readOnly,
    "--color-accent-foreground": textPrimary,
    "--color-primary": theme.colors.primary,
    "--color-primary-foreground": "#ffffff",
    "--color-ring": theme.colors.borderFocus || theme.colors.primary,
    "--color-border": theme.colors.border,
    "--color-input": theme.colors.border,
    "--color-muted": theme.colors.readOnly,
    "--color-muted-foreground": textSecondary,
    "--color-destructive": theme.colors.error,
    "--color-card": theme.colors.background,
    "--color-card-foreground": textPrimary,

    // Non-prefixed versions
    "--primary": theme.colors.primary,
    "--primary-foreground": "#ffffff",
    "--ring": theme.colors.borderFocus || theme.colors.primary,
    "--border": theme.colors.border,
    "--input": theme.colors.border,
    "--background": theme.colors.background,
    "--foreground": textPrimary,
    "--accent": theme.colors.readOnly,
    "--accent-foreground": textPrimary,
    "--muted": theme.colors.readOnly,
    "--muted-foreground": textSecondary,
    "--destructive": theme.colors.error,
    "--card": theme.colors.background,
    "--card-foreground": textPrimary,
  } as CSSProperties;
}

/**
 * Common base styles for field components
 * Provides consistent styling across all field types
 */
export const baseFieldStyles = [
  "w-full",
  "border",
  "transition-all",
  "duration-200",
  "text-sm",
  "focus:outline-none",
  "disabled:cursor-not-allowed",
  "disabled:opacity-60",
  "read-only:cursor-default",
] as const;

/**
 * Common theme-aware styles for field components
 * Uses CSS variables for dynamic theming
 */
export const themeFieldStyles = [
  "border-[var(--form-border)]",
  "bg-[var(--form-bg)]",
  "text-[var(--form-text)]",
  "placeholder:text-[var(--form-placeholder)]",
  "focus:border-[var(--form-border-focus)]",
  "focus:ring-2",
  "focus:ring-[var(--form-primary)]/20",
] as const;

/**
 * Error state styles
 */
export const errorFieldStyles = [
  "border-[var(--form-error)]",
  "focus:ring-[var(--form-error)]/20",
] as const;

/**
 * Disabled state styles
 */
export const disabledFieldStyles = [
  "!bg-[var(--form-disabled-bg)]",
  "!cursor-not-allowed",
] as const;

/**
 * Read-only state styles
 */
export const readOnlyFieldStyles = [
  "!bg-[var(--form-readonly-bg)]",
  "!cursor-default",
] as const;

/**
 * Helper to get all field styles based on state
 *
 * @param options - Field state options
 * @returns Array of className strings
 *
 * @example
 * ```tsx
 * const styles = getFieldStyles({
 *   error: !!error,
 *   disabled: isDisabled,
 *   readOnly: isReadOnly,
 * });
 *
 * <input className={cn(...styles)} />
 * ```
 */
export function getFieldStyles(options: {
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  additionalStyles?: string[];
}): string[] {
  const { error, disabled, readOnly, additionalStyles = [] } = options;

  return [
    ...baseFieldStyles,
    ...themeFieldStyles,
    ...(error ? errorFieldStyles : []),
    ...(disabled ? disabledFieldStyles : []),
    ...(readOnly ? readOnlyFieldStyles : []),
    ...additionalStyles,
  ];
}
