import type { ThemeSpacing } from "./ui-theme";

// Breakpoint values
export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

// Responsive value type - single value or object with breakpoint keys
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

// Responsive style configuration
export interface ResponsiveStyles {
  // Display
  display?: ResponsiveValue<
    | "none"
    | "block"
    | "inline"
    | "inline-block"
    | "flex"
    | "inline-flex"
    | "grid"
    | "inline-grid"
  >;

  // Layout
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  minWidth?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;
  minHeight?: ResponsiveValue<string | number>;
  maxHeight?: ResponsiveValue<string | number>;

  // Spacing
  margin?: ResponsiveValue<string | number>;
  marginTop?: ResponsiveValue<string | number>;
  marginRight?: ResponsiveValue<string | number>;
  marginBottom?: ResponsiveValue<string | number>;
  marginLeft?: ResponsiveValue<string | number>;
  marginX?: ResponsiveValue<string | number>;
  marginY?: ResponsiveValue<string | number>;
  padding?: ResponsiveValue<string | number>;
  paddingTop?: ResponsiveValue<string | number>;
  paddingRight?: ResponsiveValue<string | number>;
  paddingBottom?: ResponsiveValue<string | number>;
  paddingLeft?: ResponsiveValue<string | number>;
  paddingX?: ResponsiveValue<string | number>;
  paddingY?: ResponsiveValue<string | number>;

  // Flexbox
  flexDirection?: ResponsiveValue<
    "row" | "col" | "row-reverse" | "col-reverse"
  >;
  flexWrap?: ResponsiveValue<"nowrap" | "wrap" | "wrap-reverse">;
  justifyContent?: ResponsiveValue<
    "start" | "center" | "end" | "between" | "around" | "evenly"
  >;
  alignItems?: ResponsiveValue<
    "start" | "center" | "end" | "stretch" | "baseline"
  >;
  alignContent?: ResponsiveValue<
    "start" | "center" | "end" | "stretch" | "between" | "around"
  >;
  gap?: ResponsiveValue<string | number>;
  rowGap?: ResponsiveValue<string | number>;
  columnGap?: ResponsiveValue<string | number>;
  flexGrow?: ResponsiveValue<number>;
  flexShrink?: ResponsiveValue<number>;
  flexBasis?: ResponsiveValue<string | number>;

  // Grid
  gridTemplateColumns?: ResponsiveValue<string>;
  gridTemplateRows?: ResponsiveValue<string>;
  gridTemplateAreas?: ResponsiveValue<string>;
  gridAutoColumns?: ResponsiveValue<string>;
  gridAutoRows?: ResponsiveValue<string>;
  gridAutoFlow?: ResponsiveValue<"row" | "col" | "row-dense" | "col-dense">;
  gridColumn?: ResponsiveValue<string | number>;
  gridRow?: ResponsiveValue<string | number>;
  gridColumnStart?: ResponsiveValue<string | number>;
  gridColumnEnd?: ResponsiveValue<string | number>;
  gridRowStart?: ResponsiveValue<string | number>;
  gridRowEnd?: ResponsiveValue<string | number>;

  // Position
  position?: ResponsiveValue<
    "static" | "relative" | "absolute" | "fixed" | "sticky"
  >;
  top?: ResponsiveValue<string | number>;
  right?: ResponsiveValue<string | number>;
  bottom?: ResponsiveValue<string | number>;
  left?: ResponsiveValue<string | number>;
  zIndex?: ResponsiveValue<number>;

  // Typography
  fontSize?: ResponsiveValue<string>;
  fontWeight?: ResponsiveValue<number | string>;
  lineHeight?: ResponsiveValue<string | number>;
  textAlign?: ResponsiveValue<"left" | "center" | "right" | "justify">;
  fontFamily?: ResponsiveValue<string>;

  // Visual
  color?: ResponsiveValue<string>;
  backgroundColor?: ResponsiveValue<string>;
  opacity?: ResponsiveValue<number>;
  borderRadius?: ResponsiveValue<string | number>;
  borderWidth?: ResponsiveValue<string | number>;
  borderStyle?: ResponsiveValue<string>;
  borderColor?: ResponsiveValue<string>;

  // Shadow
  boxShadow?: ResponsiveValue<string>;

  // Transform
  transform?: ResponsiveValue<string>;
  scale?: ResponsiveValue<number | string>;
  scaleX?: ResponsiveValue<number | string>;
  scaleY?: ResponsiveValue<number | string>;
  rotate?: ResponsiveValue<string | number>;
  translateX?: ResponsiveValue<string | number>;
  translateY?: ResponsiveValue<string | number>;
}

// Responsive configuration for form fields
export interface ResponsiveFieldConfig {
  // Field width at different breakpoints
  width?: ResponsiveValue<
    "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4" | number | string
  >;

  // Field order
  order?: ResponsiveValue<number>;

  // Hide/show at breakpoints
  display?: ResponsiveValue<"none" | "block" | "flex" | "grid">;

  // Spacing
  margin?: ResponsiveValue<keyof ThemeSpacing>;
  padding?: ResponsiveValue<keyof ThemeSpacing>;

  // Typography
  fontSize?: ResponsiveValue<
    "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
  >;

  // Stack direction for multi-field layouts
  stackDirection?: ResponsiveValue<"vertical" | "horizontal">;
}

// Responsive breakpoints configuration
export interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

// Media query configuration
export interface MediaQueryConfig {
  query: string;
  breakpoint: Breakpoint;
  value: any;
}

// CSS-in-JS responsive object
export interface ResponsiveStyleObject {
  [property: string]: ResponsiveValue<any>;
}

// Helper function return type
export type ResolvedStyles = {
  className: string;
  style: React.CSSProperties;
  mediaQueries: MediaQueryConfig[];
};
