// Theme color palette
export interface ThemeColors {
  // Primary colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Main primary color
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };

  // Secondary colors
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Main secondary color
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };

  // Neutral colors
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Background colors
  background: {
    primary: string; // Main background
    secondary: string; // Card/section background
    tertiary: string; // Hover/active states
    inverse: string; // For text on primary
  };

  // Text colors
  text: {
    primary: string; // Primary text
    secondary: string; // Secondary text
    tertiary: string; // Muted text
    inverse: string; // Text on primary background
    disabled: string; // Disabled text
  };

  // Border colors
  border: {
    primary: string; // Default border
    secondary: string; // Subtle border
    focus: string; // Focus ring
    error: string; // Error border
  };
}

// Typography scale
export interface ThemeTypography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };

  fontSize: {
    xs: [string, { lineHeight: string }];
    sm: [string, { lineHeight: string }];
    base: [string, { lineHeight: string }];
    lg: [string, { lineHeight: string }];
    xl: [string, { lineHeight: string }];
    "2xl": [string, { lineHeight: string }];
    "3xl": [string, { lineHeight: string }];
    "4xl": [string, { lineHeight: string }];
    "5xl": [string, { lineHeight: string }];
    "6xl": [string, { lineHeight: string }];
  };

  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
}

// Spacing scale
export interface ThemeSpacing {
  0: "0";
  px: "1px";
  0.5: "0.125rem";
  1: "0.25rem";
  1.5: "0.375rem";
  2: "0.5rem";
  2.5: "0.625rem";
  3: "0.75rem";
  3.5: "0.875rem";
  4: "1rem";
  5: "1.25rem";
  6: "1.5rem";
  7: "1.75rem";
  8: "2rem";
  9: "2.25rem";
  10: "2.5rem";
  11: "2.75rem";
  12: "3rem";
  14: "3.5rem";
  16: "4rem";
  20: "5rem";
  24: "6rem";
  28: "7rem";
  32: "8rem";
  36: "9rem";
  40: "10rem";
  44: "11rem";
  48: "12rem";
  52: "13rem";
  56: "14rem";
  60: "15rem";
  64: "16rem";
  72: "18rem";
  80: "20rem";
  96: "24rem";
}

// Border radius
export interface ThemeBorderRadius {
  none: "0";
  sm: "0.125rem";
  DEFAULT: "0.25rem";
  md: "0.375rem";
  lg: "0.5rem";
  xl: "0.75rem";
  "2xl": "1rem";
  "3xl": "1.5rem";
  full: "9999px";
}

// Shadows
export interface ThemeShadows {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)";
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
  none: "none";
}

// Animation durations and easing
export interface ThemeAnimations {
  duration: {
    75: "75ms";
    100: "100ms";
    150: "150ms";
    200: "200ms";
    300: "300ms";
    500: "500ms";
    700: "700ms";
    1000: "1000ms";
  };

  easing: {
    linear: "linear";
    in: "cubic-bezier(0.4, 0, 1, 1)";
    out: "cubic-bezier(0, 0, 0.2, 1)";
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)";
    "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)";
  };
}

// Breakpoints
export interface ThemeBreakpoints {
  sm: "640px";
  md: "768px";
  lg: "1024px";
  xl: "1280px";
  "2xl": "1536px";
}

// Complete theme interface
export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
  breakpoints: ThemeBreakpoints;
  name: string; // 'light' | 'dark' | custom theme name
}

// Theme context type
export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  resolvedTheme: "light" | "dark";
}

// Component variant types
export interface ComponentVariant {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | string;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | string;
  variant?: "solid" | "outline" | "ghost" | "link" | string;
  state?: "default" | "hover" | "active" | "disabled" | "focus" | string;
  animation?: AnimationVariant;
  responsive?: {
    width?: ResponsiveValue<string | number>;
    height?: ResponsiveValue<string | number>;
    display?: ResponsiveValue<string>;
    order?: ResponsiveValue<string | number>;
  };
  layout?: LayoutProps;
  style?: React.CSSProperties;
  [key: string]: any;
}

// Animation variant types
export interface AnimationVariant {
  type?: "fade" | "slide" | "scale" | "bounce" | "flip" | string;
  direction?: "up" | "down" | "left" | "right" | "center" | string;
  duration?: keyof ThemeAnimations["duration"] | string | number;
  delay?: keyof ThemeAnimations["duration"] | string | number;
  easing?: keyof ThemeAnimations["easing"] | string;
  [key: string]: any;
}

// Layout types
export interface LayoutProps {
  display?: "block" | "flex" | "grid" | "hidden" | string;
  direction?: "row" | "col" | "row-reverse" | "col-reverse" | string;
  align?: "start" | "center" | "end" | "stretch" | "baseline" | string;
  justify?:
    | "start"
    | "center"
    | "end"
    | "between"
    | "around"
    | "evenly"
    | string;
  wrap?: "wrap" | "nowrap" | "wrap-reverse" | string;
  gap?: keyof ThemeSpacing | string | number;
  padding?: keyof ThemeSpacing | string | number;
  margin?: keyof ThemeSpacing | string | number;
  [key: string]: any;
}

// Responsive value type
export type ResponsiveValue<T> =
  | T
  | {
      initial?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      "2xl"?: T;
    };

// Enhanced field config with UI customization
export interface EnhancedFieldConfig {
  fieldName: string;
  component: string;
  props: Record<string, any>;
  condition?: any;

  // UI Customization properties
  variant?: ComponentVariant;
  animation?: AnimationVariant;
  responsive?: {
    width?: ResponsiveValue<string>;
    height?: ResponsiveValue<string>;
    display?: ResponsiveValue<string>;
    order?: ResponsiveValue<number>;
  };
  layout?: LayoutProps;
  className?: string;
  style?: React.CSSProperties;
}
