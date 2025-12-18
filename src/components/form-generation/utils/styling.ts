/**
 * Form Generation Library - Styling Utilities
 *
 * Common styling patterns used across form field components
 * These are self-contained styles that don't depend on the theme system
 */

/**
 * Base input styles that are consistent across all input fields
 */
export const baseInputStyles = [
  "w-full",
  "border",
  "transition-all",
  "duration-200",
  "text-sm",
  // Base focus styles
  "focus:outline-none",
  // Placeholder styles
  "placeholder:text-gray-400",
  "placeholder:font-medium",
  // Disabled and readonly states
  "disabled:cursor-not-allowed",
  "disabled:opacity-60",
  "read-only:cursor-default",
] as const;

/**
 * Theme-specific colors and styles
 * These are the design tokens that would normally come from a theme
 */
export const themeStyles = {
  // Colors
  primary: "#017848",
  border: "#bfd1cc",
  error: "#ef4444",
  background: "white",
  disabled: "#f3f4f6",
  readOnly: "#f9fafb",

  // Border radius
  borderRadius: "8px",

  // Focus ring
  focusRing: {
    width: "2px",
    opacity: "0.2",
  },

  // Sizes
  sizes: {
    sm: {
      height: "48px",
      paddingX: "12px",
    },
    md: {
      height: "60px",
      paddingX: "16px",
    },
    lg: {
      height: "64px",
      paddingX: "16px",
      fontSize: "18px",
    },
  },
} as const;

/**
 * Generate input className based on size and state
 */
export function getInputClassName(
  size: "sm" | "md" | "lg" = "md",
  hasError: boolean = false,
  isDisabled: boolean = false,
  isReadOnly: boolean = false,
  customStyles?: string[],
) {
  const sizeStyles = {
    sm: `h-12 px-3`,
    md: `h-[60px] px-4`,
    lg: `h-16 px-4 text-lg`,
  };

  const stateStyles = [
    // Border radius
    `rounded-[${themeStyles.borderRadius}]`,
    // Border color
    "border-[#bfd1cc]",
    // Background
    "bg-white",
    // Focus state
    "focus:border-[#017848]",
    `focus:ring-2`,
    `focus:ring-[#017848]/20`,
    // Error state
    hasError && "border-red-500",
    hasError && "focus:ring-red-500/20",
    // Override background for special states
    isDisabled && "!bg-gray-100",
    isReadOnly && "!bg-gray-50",
  ].filter(Boolean);

  return [
    ...baseInputStyles,
    ...stateStyles,
    sizeStyles[size],
    ...(customStyles || []),
  ].join(" ");
}

/**
 * Generate control styles for non-input controls (checkbox, radio, switch)
 */
export function getControlStyles(
  hasError: boolean = false,
  isDisabled: boolean = false,
) {
  const baseControl = [
    // Focus state
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    `focus-visible:ring-[${themeStyles.primary}]/20`,
    "focus-visible:ring-offset-2",
  ];

  const errorState = [
    "border-red-500",
    "text-red-500",
    `focus-visible:ring-red-500/20`,
  ];

  return [...baseControl, ...(hasError ? errorState : [])].join(" ");
}

/**
 * Generate label styles
 */
export function getLabelStyles(
  isDisabled: boolean = false,
  isForControl: boolean = true,
) {
  const baseLabel = ["text-sm", "font-medium", "text-gray-700"];

  const controlLabel = [
    "select-none",
    "cursor-pointer",
    isDisabled && "!cursor-not-allowed",
  ];

  return [
    ...baseLabel,
    ...(isForControl ? controlLabel : []),
    isDisabled && "opacity-60",
    isDisabled && "cursor-not-allowed",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * File drop zone styles
 */
export const fileDropZoneStyles = [
  "flex",
  "flex-col",
  "items-center",
  "justify-center",
  "w-full",
  "h-32",
  "border-2",
  "border-dashed",
  "rounded-lg",
  "cursor-pointer",
  "hover:bg-muted/50",
  "transition-colors",
  "border-[#bfd1cc]",
  "bg-white",
  "focus:border-[#017848]",
  "focus:ring-2",
  "focus:ring-[#017848]/20",
].join(" ");

/**
 * File list item styles
 */
export const fileListItemStyles = [
  "flex",
  "items-center",
  "gap-3",
  "p-3",
  "rounded-lg",
  "bg-muted",
  "border",
  "border-border",
].join(" ");

/**
 * Checkbox/Radio specific styles
 */
export const checkboxStyles = (hasError: boolean = false) =>
  [
    "data-[state=checked]:bg-[#017848]",
    "data-[state=checked]:border-[#017848]",
    `focus-visible:ring-[#017848]/20`,
    hasError && "border-red-500",
    hasError && "data-[state=checked]:bg-red-500",
    hasError && "data-[state=checked]:border-red-500",
    hasError && "focus-visible:ring-red-500/20",
  ]
    .filter(Boolean)
    .join(" ");

export const radioStyles = (hasError: boolean = false) =>
  [
    `text-[#017848]`,
    `focus-visible:ring-[#017848]/20`,
    hasError && "text-red-500",
    hasError && "border-red-500",
    hasError && "focus-visible:ring-red-500/20",
  ]
    .filter(Boolean)
    .join(" ");

/**
 * Switch specific styles
 */
export const switchStyles = (hasError: boolean = false) =>
  [
    "h-6",
    "w-11",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    `focus-visible:ring-[#017848]/20`,
    "focus-visible:ring-offset-2",
    hasError && "focus-visible:ring-red-500/20",
  ]
    .filter(Boolean)
    .join(" ");
