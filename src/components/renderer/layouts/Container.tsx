"use client";

import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/components/renderer/component-variants/create-variant";
import { useThemeUtils } from "@/components/renderer/theme/use-theme";
import type { ResponsiveValue } from "@/types/ui-theme";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  size?: ResponsiveValue<"sm" | "md" | "lg" | "xl" | "full" | "fluid">;
  centerContent?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      as: Component = "div",
      className,
      size = "full",
      centerContent = false,
      children,
      ...props
    },
    ref,
  ) => {
    const { cssVar } = useThemeUtils();

    // Define container max-widths
    const sizeClasses = {
      sm: "max-w-2xl",
      md: "max-w-4xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-full",
      fluid: "max-w-none",
    };

    const getWidthClass = (width: ResponsiveValue<string>) => {
      if (typeof width === "string") {
        return (
          sizeClasses[width as keyof typeof sizeClasses] || sizeClasses.full
        );
      }
      // Handle responsive object
      if (typeof width === "object" && width !== null) {
        const classes = [];
        if (width.sm) classes.push(`sm:${sizeClasses[width.sm]}`);
        if (width.md) classes.push(`md:${sizeClasses[width.md]}`);
        if (width.lg) classes.push(`lg:${sizeClasses[width.lg]}`);
        if (width.xl) classes.push(`xl:${sizeClasses[width.xl]}`);
        if (width.initial) classes.push(sizeClasses[width.initial]);
        return classes.join(" ");
      }
      return sizeClasses.full;
    };

    return (
      <Component
        ref={ref}
        className={cn(
          "w-full mx-auto px-4 sm:px-6 lg:px-8",
          getWidthClass(size),
          centerContent && "flex items-center justify-center",
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Container.displayName = "Container";

export default Container;
