/**
 * Form Generation Library - Constants
 *
 * Global constants and configuration
 */

// ============================================================================
// Custom Component Security
// ============================================================================

/**
 * Allowlist for custom components
 *
 * Only components in this set can be used with FieldType.CUSTOM
 * Add components during app initialization for security
 *
 * @example
 * ```typescript
 * import { ALLOWED_CUSTOM_COMPONENTS } from '@/components/form-generation/constants';
 * import { MyCurrencyInput } from './custom-fields';
 *
 * // During app initialization
 * ALLOWED_CUSTOM_COMPONENTS.add('MyCurrencyInput');
 * ```
 */
export const ALLOWED_CUSTOM_COMPONENTS = new Set<string>();

/**
 * Register a custom component as allowed
 *
 * @param componentName - Name of the component to allow
 */
export function allowCustomComponent(componentName: string): void {
  ALLOWED_CUSTOM_COMPONENTS.add(componentName);
}

/**
 * Check if a custom component is allowed
 *
 * @param componentName - Name of the component to check
 * @returns true if component is allowed, false otherwise
 */
export function isCustomComponentAllowed(componentName: string): boolean {
  return ALLOWED_CUSTOM_COMPONENTS.has(componentName);
}

/**
 * Remove a custom component from allowlist
 *
 * @param componentName - Name of the component to remove
 */
export function disallowCustomComponent(componentName: string): void {
  ALLOWED_CUSTOM_COMPONENTS.delete(componentName);
}

/**
 * Clear all allowed custom components
 */
export function clearAllowedCustomComponents(): void {
  ALLOWED_CUSTOM_COMPONENTS.clear();
}

// ============================================================================
// Validation Configuration
// ============================================================================

/**
 * Maximum validation timeout in milliseconds
 * Prevents hung validation from blocking UI
 */
export const VALIDATION_TIMEOUT_MS = 5000;

/**
 * Debounce delay for onChange validation (milliseconds)
 */
export const VALIDATION_DEBOUNCE_MS = 300;

// ============================================================================
// File Upload Configuration
// ============================================================================

/**
 * Default maximum file size (5MB in bytes)
 */
export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed file extensions for security
 */
export const ALLOWED_FILE_TYPES = {
  images: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  documents: [".pdf", ".doc", ".docx", ".txt"],
  all: "*",
} as const;

// ============================================================================
// Field Configuration
// ============================================================================

/**
 * Default field sizes
 */
export const FIELD_SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

/**
 * Default validation modes
 */
export const VALIDATION_MODES = {
  onChange: "onChange",
  onBlur: "onBlur",
  onSubmit: "onSubmit",
} as const;
