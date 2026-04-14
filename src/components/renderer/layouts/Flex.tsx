"use client";

import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/components/renderer/component-variants/create-variant";
import { useThemeUtils } from "@/components/renderer/theme/use-theme";
import type { ResponsiveValue } from "@/types/ui-theme";

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  direction?: ResponsiveValue<"row" | "col" | "row-reverse" | "col-reverse">;
  wrap?: ResponsiveValue<"nowrap" | "wrap" | "wrap-reverse">;
  align?: ResponsiveValue<"start" | "center" | "end" | "stretch" | "baseline">;
  justify?: ResponsiveValue<
    "start" | "center" | "end" | "between" | "around" | "evenly"
  >;
  gap?: ResponsiveValue<keyof React.CSSProperties["gap"]>;
  inline?: boolean;
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      as: Component = "div",
      className,
      direction = "row",
      wrap = "nowrap",
      align = "start",
      justify = "start",
      gap,
      inline = false,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const { getSpacing } = useThemeUtils();

    // Generate direction classes
    const getDirectionClass = (
      dir: ResponsiveValue<"row" | "col" | "row-reverse" | "col-reverse">,
    ) => {
      if (typeof dir === "string") {
        return dir === "row"
          ? ""
          : dir === "col"
            ? "flex-col"
            : dir === "row-reverse"
              ? "flex-row-reverse"
              : dir === "col-reverse"
                ? "flex-col-reverse"
                : "";
      }
      // Handle responsive object
      if (typeof dir === "object" && dir !== null) {
        const classes = [];
        if (dir.sm)
          classes.push(
            `sm:${dir.sm === "col" ? "flex-col" : dir.sm === "row-reverse" ? "flex-row-reverse" : dir.sm === "col-reverse" ? "flex-col-reverse" : ""}`,
          );
        if (dir.md)
          classes.push(
            `md:${dir.md === "col" ? "flex-col" : dir.md === "row-reverse" ? "flex-row-reverse" : dir.md === "col-reverse" ? "flex-col-reverse" : ""}`,
          );
        if (dir.lg)
          classes.push(
            `lg:${dir.lg === "col" ? "flex-col" : dir.lg === "row-reverse" ? "flex-row-reverse" : dir.lg === "col-reverse" ? "flex-col-reverse" : ""}`,
          );
        if (dir.xl)
          classes.push(
            `xl:${dir.xl === "col" ? "flex-col" : dir.xl === "row-reverse" ? "flex-row-reverse" : dir.xl === "col-reverse" ? "flex-col-reverse" : ""}`,
          );
        if (dir.initial)
          classes.push(
            `${dir.initial === "col" ? "flex-col" : dir.initial === "row-reverse" ? "flex-row-reverse" : dir.initial === "col-reverse" ? "flex-col-reverse" : ""}`,
          );
        return classes.join(" ");
      }
      return "";
    };

    // Generate wrap classes
    const getWrapClass = (
      w: ResponsiveValue<"nowrap" | "wrap" | "wrap-reverse">,
    ) => {
      if (typeof w === "string") {
        return w === "nowrap"
          ? ""
          : w === "wrap"
            ? "flex-wrap"
            : w === "wrap-reverse"
              ? "flex-wrap-reverse"
              : "";
      }
      // Handle responsive object
      if (typeof w === "object" && w !== null) {
        const classes = [];
        if (w.sm)
          classes.push(
            `sm:${w.sm === "wrap" ? "flex-wrap" : w.sm === "wrap-reverse" ? "flex-wrap-reverse" : ""}`,
          );
        if (w.md)
          classes.push(
            `md:${w.md === "wrap" ? "flex-wrap" : w.md === "wrap-reverse" ? "flex-wrap-reverse" : ""}`,
          );
        if (w.lg)
          classes.push(
            `lg:${w.lg === "wrap" ? "flex-wrap" : w.lg === "wrap-reverse" ? "flex-wrap-reverse" : ""}`,
          );
        if (w.xl)
          classes.push(
            `xl:${w.xl === "wrap" ? "flex-wrap" : w.xl === "wrap-reverse" ? "flex-wrap-reverse" : ""}`,
          );
        if (w.initial)
          classes.push(
            `${w.initial === "wrap" ? "flex-wrap" : w.initial === "wrap-reverse" ? "flex-wrap-reverse" : ""}`,
          );
        return classes.join(" ");
      }
      return "";
    };

    // Generate alignment classes
    const getAlignClass = (
      a: ResponsiveValue<"start" | "center" | "end" | "stretch" | "baseline">,
    ) => {
      if (typeof a === "string") {
        return a === "start"
          ? "items-start"
          : a === "center"
            ? "items-center"
            : a === "end"
              ? "items-end"
              : a === "stretch"
                ? "items-stretch"
                : a === "baseline"
                  ? "items-baseline"
                  : "";
      }
      // Handle responsive object
      if (typeof a === "object" && a !== null) {
        const classes = [];
        if (a.sm) classes.push(`sm:items-${a.sm}`);
        if (a.md) classes.push(`md:items-${a.md}`);
        if (a.lg) classes.push(`lg:items-${a.lg}`);
        if (a.xl) classes.push(`xl:items-${a.xl}`);
        if (a.initial) classes.push(`items-${a.initial}`);
        return classes.join(" ");
      }
      return "";
    };

    // Generate justification classes
    const getJustifyClass = (
      j: ResponsiveValue<
        "start" | "center" | "end" | "between" | "around" | "evenly"
      >,
    ) => {
      if (typeof j === "string") {
        return j === "start"
          ? "justify-start"
          : j === "center"
            ? "justify-center"
            : j === "end"
              ? "justify-end"
              : j === "between"
                ? "justify-between"
                : j === "around"
                  ? "justify-around"
                  : j === "evenly"
                    ? "justify-evenly"
                    : "";
      }
      // Handle responsive object
      if (typeof j === "object" && j !== null) {
        const classes = [];
        if (j.sm) classes.push(`sm:justify-${j.sm}`);
        if (j.md) classes.push(`md:justify-${j.md}`);
        if (j.lg) classes.push(`lg:justify-${j.lg}`);
        if (j.xl) classes.push(`xl:justify-${j.xl}`);
        if (j.initial) classes.push(`justify-${j.initial}`);
        return classes.join(" ");
      }
      return "";
    };

    // Generate gap classes
    const getGapClass = (
      g: ResponsiveValue<keyof React.CSSProperties["gap"]>,
    ) => {
      if (typeof g === "string") {
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
      return "";
    };

    return (
      <Component
        ref={ref}
        className={cn(
          inline ? "inline-flex" : "flex",
          getDirectionClass(direction),
          getWrapClass(wrap),
          getAlignClass(align),
          getJustifyClass(justify),
          gap && getGapClass(gap),
          className,
        )}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Flex.displayName = "Flex";

export default Flex;
