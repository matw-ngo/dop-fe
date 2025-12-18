/**
 * Form Generation Library - Simplified Theme Types
 *
 * Simplified type definitions for the theme system
 * Only contains truly customizable properties
 */

/**
 * Simplified theme configuration for form controls
 */
export interface FormTheme {
  /**
   * Theme identifier
   */
  name: string;

  /**
   * Color scheme for the theme
   */
  colors: {
    /**
     * Primary brand color (used for focus, labels, etc.)
     */
    primary: string;

    /**
     * Border color for normal state
     */
    border: string;

    /**
     * Border color on focus
     */
    borderFocus: string;

    /**
     * Background color for inputs
     */
    background: string;

    /**
     * Text color for placeholders
     */
    placeholder: string;

    /**
     * Text color for error states
     */
    error: string;

    /**
     * Background color for disabled states
     */
    disabled: string;

    /**
     * Background color for read-only states
     */
    readOnly: string;
  };

  /**
   * Border radius values
   */
  borderRadius: {
    /**
     * Default border radius for inputs
     */
    control: string;
  };

  /**
   * Spacing values
   */
  spacing: {
    /**
     * Horizontal padding for inputs
     */
    paddingHorizontal: string;

    /**
     * Vertical padding for inputs
     */
    paddingVertical: string;
  };

  /**
   * Typography settings
   */
  typography: {
    /**
     * Font size for inputs
     */
    fontSize: string;

    /**
     * Font size for internal labels
     */
    labelFontSize: string;

    /**
     * Font weight for internal labels
     */
    labelFontWeight: string;
  };

  /**
   * Size configurations
   */
  sizes: {
    /**
     * Height for small inputs
     */
    sm: string;

    /**
     * Height for medium inputs (default)
     */
    md: string;

    /**
     * Height for large inputs
     */
    lg: string;
  };

  /**
   * Focus ring configuration
   */
  focusRing: {
    /**
     * Width of the focus ring
     */
    width: string;

    /**
     * Color of the focus ring
     */
    color: string;

    /**
     * Opacity of the focus ring
     */
    opacity: string;
  };

  /**
   * Global field options for this theme
   */
  fieldOptions?: {
    /**
     * If true, renders the label inside the field control border
     */
    internalLabel?: boolean;
  };

  /**
   * Backward compatibility properties for components that expect the old structure
   */
  label?: {
    base: string;
    required?: string;
    disabled?: string;
  };

  /**
   * Backward compatibility properties for error styling
   */
  error?: {
    base: string;
    icon?: string;
  };

  /**
   * Backward compatibility properties for help text styling
   */
  help?: {
    base: string;
  };

  /**
   * Optional specialized styling for specific field types
   */
  components?: {
    /**
     * File field specific styling
     */
    file?: {
      /**
       * Border color for drag-and-drop area
       */
      borderDashed?: string;

      /**
       * Background color for drag-and-drop area
       */
      backgroundDashed?: string;

      /**
       * Hover background color for drag-and-drop area
       */
      hoverBackground?: string;

      /**
       * Hover border color for drag-and-drop area
       */
      hoverBorder?: string;
    };

    /**
     * eKYC field specific styling
     */
    ekyc?: {
      /**
       * Color for success status
       */
      success?: string;

      /**
       * Color for processing status
       */
      processing?: string;

      /**
       * Color for retry button
       */
      retryButton?: string;
    };

    /**
     * Checkbox/Radio field specific styling
     */
    checkable?: {
      /**
       * Accent color for checked state
       */
      checkedColor?: string;

      /**
       * Border color for unchecked state
       */
      uncheckedBorder?: string;

      /**
       * Focus ring color
       */
      focusRing?: string;
    };
  };
}
