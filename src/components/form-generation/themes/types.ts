/**
 * Form Generation Library - Theme Types
 *
 * Type definitions for the theme system
 */

/**
 * Theme configuration for form controls
 */
export interface FormTheme {
  /**
   * Theme identifier
   */
  name: string;

  /**
   * Control styles (inputs, selects, etc.)
   */
  control: {
    /**
     * Base styles applied to all controls
     */
    base: string;

    /**
     * Visual variants
     */
    variants: {
      default: string;
      outlined: string;
      filled: string;
      underlined: string;
    };

    /**
     * Size variants
     */
    sizes: {
      sm: string;
      md: string;
      lg: string;
    };

    /**
     * State-based styles
     */
    states: {
      focus: string;
      error: string;
      disabled: string;
      readOnly: string;
    };
  };

  /**
   * Label styles
   */
  label: {
    base: string;
    required: string;
    disabled: string;
  };

  /**
   * Error message styles
   */
  error: {
    base: string;
    icon: string;
  };

  /**
   * Help text styles
   */
  help: {
    base: string;
  };
}
