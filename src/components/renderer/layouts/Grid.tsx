"use client";

import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/components/renderer/component-variants/create-variant";
import { useThemeUtils } from "@/components/renderer/theme/use-theme";
import type { ResponsiveValue } from "@/types/ui-theme";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  columns?: ResponsiveValue<number | "auto" | string>;
  gap?: ResponsiveValue<string | number>;
  autoFlow?: "row" | "col" | "row-dense" | "col-dense";
  autoRows?: ResponsiveValue<string>;
  autoColumns?: ResponsiveValue<string>;
  templateAreas?: ResponsiveValue<string>;
  templateRows?: ResponsiveValue<string>;
  templateColumns?: ResponsiveValue<string>;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      as: Component = "div",
      className,
      columns,
      gap = 4,
      autoFlow,
      autoRows,
      autoColumns,
      templateAreas,
      templateRows,
      templateColumns,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const { getSpacing } = useThemeUtils();

    // Generate grid class for columns
    const getColumnsClass = (
      cols: ResponsiveValue<number | "auto" | string>,
    ) => {
      if (typeof cols === "number") {
        return `grid-cols-${cols}`;
      }
      if (typeof cols === "string") {
        if (cols === "auto") return "grid-cols-auto";
        if (cols.includes(" ")) return "grid-cols-subgrid";
        // For custom templates, use style
        return "";
      }
      // Handle responsive object
      if (typeof cols === "object" && cols !== null) {
        const classes = [];
        if (cols.sm !== undefined) {
          classes.push(
            typeof cols.sm === "number"
              ? `sm:grid-cols-${cols.sm}`
              : cols.sm === "auto"
                ? "sm:grid-cols-auto"
                : "",
          );
        }
        if (cols.md !== undefined) {
          classes.push(
            typeof cols.md === "number"
              ? `md:grid-cols-${cols.md}`
              : cols.md === "auto"
                ? "md:grid-cols-auto"
                : "",
          );
        }
        if (cols.lg !== undefined) {
          classes.push(
            typeof cols.lg === "number"
              ? `lg:grid-cols-${cols.lg}`
              : cols.lg === "auto"
                ? "lg:grid-cols-auto"
                : "",
          );
        }
        if (cols.xl !== undefined) {
          classes.push(
            typeof cols.xl === "number"
              ? `xl:grid-cols-${cols.xl}`
              : cols.xl === "auto"
                ? "xl:grid-cols-auto"
                : "",
          );
        }
        if (cols.initial !== undefined) {
          classes.push(
            typeof cols.initial === "number"
              ? `grid-cols-${cols.initial}`
              : cols.initial === "auto"
                ? "grid-cols-auto"
                : "",
          );
        }
        return classes.join(" ");
      }
      return "";
    };

    // Generate gap classes
    const getGapClass = (g: ResponsiveValue<string | number>) => {
      if (typeof g === "string") {
        return `gap-${g}`;
      }
      if (typeof g === "number") {
        return `gap-${g}`;
      }
      // Handle responsive object
      if (typeof g === "object" && g !== null) {
        const classes = [];
        if (g.sm) classes.push(`sm:gap-${g.sm}`);
        if (g.md) classes.push(`md:gap-${g.md}`);
        if (g.lg) classes.push(`lg:gap-${g.lg}`);
        if (g.xl) classes.push(`xl:gap-${g.xl}`);
        if (g.initial) classes.push(`gap-${g.initial}`);
        return classes.join(" ");
      }
      return `gap-4`;
    };

    // Build inline styles for custom values
    const inlineStyles: React.CSSProperties = {
      ...style,
    };

    // Handle custom column templates
    if (typeof templateColumns === "string" && templateColumns.includes("fr")) {
      inlineStyles.gridTemplateColumns = templateColumns;
    }

    // Handle custom row templates
    if (typeof templateRows === "string" && templateRows.includes("fr")) {
      inlineStyles.gridTemplateRows = templateRows;
    }

    // Handle area templates
    if (typeof templateAreas === "string") {
      inlineStyles.gridTemplateAreas = templateAreas
        .split("\n")
        .map((line) => `"${line}"`)
        .join(" ");
    }

    // Handle auto flow
    if (autoFlow) {
      inlineStyles.gridAutoFlow = autoFlow;
    }

    // Handle auto rows
    if (typeof autoRows === "string") {
      inlineStyles.gridAutoRows = autoRows;
    }

    // Handle auto columns
    if (typeof autoColumns === "string") {
      inlineStyles.gridAutoColumns = autoColumns;
    }

    return (
      <Component
        ref={ref}
        className={cn(
          "grid",
          getColumnsClass(columns || 12),
          getGapClass(gap),
          className,
        )}
        style={inlineStyles}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Grid.displayName = "Grid";

export default Grid;
