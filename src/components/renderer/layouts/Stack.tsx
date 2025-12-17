"use client";

import React, { forwardRef } from "react";
import { cn } from "@/components/renderer/component-variants/create-variant";
import { useThemeUtils } from "@/components/renderer/theme/use-theme";
import type { LayoutProps, ResponsiveValue } from "@/types/ui-theme";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  direction?: ResponsiveValue<"vertical" | "horizontal">;
  spacing?: ResponsiveValue<keyof React.CSSProperties["gap"]>;
  align?: ResponsiveValue<"start" | "center" | "end" | "stretch">;
  justify?: ResponsiveValue<
    "start" | "center" | "end" | "between" | "around" | "evenly"
  >;
  wrap?: boolean;
  divider?: React.ReactNode | ((index: number) => React.ReactNode);
  children: React.ReactNode;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      as: Component = "div",
      className,
      direction = "vertical",
      spacing = 4,
      align = "start",
      justify,
      wrap = false,
      divider,
      children,
      ...props
    },
    ref,
  ) => {
    const { getSpacing } = useThemeUtils();

    // Convert stack direction to flex direction
    const getFlexDirection = (
      dir: ResponsiveValue<"vertical" | "horizontal">,
    ) => {
      if (typeof dir === "string") {
        return dir === "vertical" ? "col" : "row";
      }
      // Handle responsive object
      if (typeof dir === "object" && dir !== null) {
        const result: any = {};
        if (dir.sm) result.sm = dir.sm === "vertical" ? "col" : "row";
        if (dir.md) result.md = dir.md === "vertical" ? "col" : "row";
        if (dir.lg) result.lg = dir.lg === "vertical" ? "col" : "row";
        if (dir.xl) result.xl = dir.xl === "vertical" ? "col" : "row";
        if (dir.initial)
          result.initial = dir.initial === "vertical" ? "col" : "row";
        return result;
      }
      return "col";
    };

    const flexDirection = getFlexDirection(direction);

    // Generate classes
    const getClasses = () => {
      const classes = ["flex"];

      // Direction classes
      if (typeof flexDirection === "string") {
        classes.push(flexDirection === "col" ? "flex-col" : "flex-row");
      } else {
        // Responsive direction
        if (flexDirection.sm)
          classes.push(
            `sm:${flexDirection.sm === "col" ? "flex-col" : "flex-row"}`,
          );
        if (flexDirection.md)
          classes.push(
            `md:${flexDirection.md === "col" ? "flex-col" : "flex-row"}`,
          );
        if (flexDirection.lg)
          classes.push(
            `lg:${flexDirection.lg === "col" ? "flex-col" : "flex-row"}`,
          );
        if (flexDirection.xl)
          classes.push(
            `xl:${flexDirection.xl === "col" ? "flex-col" : "flex-row"}`,
          );
        if (flexDirection.initial)
          classes.push(
            `${flexDirection.initial === "col" ? "flex-col" : "flex-row"}`,
          );
      }

      // Wrap
      if (wrap) {
        classes.push("flex-wrap");
      }

      // Align
      if (typeof align === "string") {
        classes.push(
          align === "start"
            ? "items-start"
            : align === "center"
              ? "items-center"
              : align === "end"
                ? "items-end"
                : align === "stretch"
                  ? "items-stretch"
                  : "",
        );
      } else if (typeof align === "object" && align !== null) {
        if (align.sm) classes.push(`sm:items-${align.sm}`);
        if (align.md) classes.push(`md:items-${align.md}`);
        if (align.lg) classes.push(`lg:items-${align.lg}`);
        if (align.xl) classes.push(`xl:items-${align.xl}`);
        if (align.initial) classes.push(`items-${align.initial}`);
      }

      // Justify
      if (justify) {
        if (typeof justify === "string") {
          classes.push(
            justify === "start"
              ? "justify-start"
              : justify === "center"
                ? "justify-center"
                : justify === "end"
                  ? "justify-end"
                  : justify === "between"
                    ? "justify-between"
                    : justify === "around"
                      ? "justify-around"
                      : justify === "evenly"
                        ? "justify-evenly"
                        : "",
          );
        } else if (typeof justify === "object" && justify !== null) {
          if (justify.sm) classes.push(`sm:justify-${justify.sm}`);
          if (justify.md) classes.push(`md:justify-${justify.md}`);
          if (justify.lg) classes.push(`lg:justify-${justify.lg}`);
          if (justify.xl) classes.push(`xl:justify-${justify.xl}`);
          if (justify.initial) classes.push(`justify-${justify.initial}`);
        }
      }

      // Spacing
      if (typeof spacing === "string") {
        classes.push(`gap-${spacing}`);
      } else if (typeof spacing === "object" && spacing !== null) {
        if (spacing.sm) classes.push(`sm:gap-${spacing.sm}`);
        if (spacing.md) classes.push(`md:gap-${spacing.md}`);
        if (spacing.lg) classes.push(`lg:gap-${spacing.lg}`);
        if (spacing.xl) classes.push(`xl:gap-${spacing.xl}`);
        if (spacing.initial) classes.push(`gap-${spacing.initial}`);
      } else {
        classes.push("gap-4");
      }

      return cn(classes, className);
    };

    // Render children with optional dividers
    const renderChildren = () => {
      const childrenArray = React.Children.toArray(children);

      if (!divider) {
        return childrenArray;
      }

      return childrenArray.map((child, index) => {
        if (index === 0) return child;

        const dividerElement =
          typeof divider === "function" ? divider(index - 1) : divider;

        return (
          <React.Fragment key={index}>
            {dividerElement}
            {child}
          </React.Fragment>
        );
      });
    };

    return (
      <Component ref={ref} className={getClasses()} {...props}>
        {renderChildren()}
      </Component>
    );
  },
);

Stack.displayName = "Stack";

// Convenience components
export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  (props, ref) => <Stack ref={ref} direction="vertical" {...props} />,
);

VStack.displayName = "VStack";

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  (props, ref) => <Stack ref={ref} direction="horizontal" {...props} />,
);

HStack.displayName = "HStack";

export default Stack;
