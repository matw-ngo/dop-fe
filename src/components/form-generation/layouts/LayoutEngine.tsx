/**
 * Form Generation Library - Layout Engine
 *
 * Flexible layout system for form fields
 */

"use client";

import type { ReactNode } from "react";
import {
  type FlexLayoutVariantsProps,
  flexLayoutVariants,
  type GridLayoutVariantsProps,
  gridLayoutVariants,
} from "../styles/variants";
import { LayoutType } from "../types";
import { cn } from "../utils/helpers";

// ============================================================================
// Grid Layout
// ============================================================================

export interface GridLayoutProps extends GridLayoutVariantsProps {
  children: ReactNode;
  className?: string;
}

export function GridLayout({
  children,
  columns,
  gap,
  className,
}: GridLayoutProps) {
  return (
    <div className={cn(gridLayoutVariants({ columns, gap }), className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Flex Layout
// ============================================================================

export interface FlexLayoutProps extends FlexLayoutVariantsProps {
  children: ReactNode;
  className?: string;
}

export function FlexLayout({
  children,
  direction,
  align,
  justify,
  wrap,
  gap,
  className,
}: FlexLayoutProps) {
  return (
    <div
      className={cn(
        flexLayoutVariants({ direction, align, justify, wrap, gap }),
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Stack Layout
// ============================================================================

export interface StackLayoutProps {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function StackLayout({
  children,
  gap = "md",
  className,
}: StackLayoutProps) {
  const gapClasses = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
  };

  return (
    <div className={cn("flex flex-col", gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Inline Layout
// ============================================================================

export interface InlineLayoutProps {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function InlineLayout({
  children,
  gap = "md",
  className,
}: InlineLayoutProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div
      className={cn("flex flex-wrap items-center", gapClasses[gap], className)}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Dynamic Layout
// ============================================================================

export interface DynamicLayoutProps {
  type?: LayoutType;
  children: ReactNode;
  columns?: number;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function DynamicLayout({
  type = LayoutType.STACK,
  children,
  columns,
  gap = "md",
  className,
}: DynamicLayoutProps) {
  switch (type) {
    case LayoutType.GRID:
      return (
        <GridLayout columns={columns as any} gap={gap} className={className}>
          {children}
        </GridLayout>
      );

    case LayoutType.FLEX:
      return (
        <FlexLayout gap={gap} className={className}>
          {children}
        </FlexLayout>
      );

    case LayoutType.INLINE:
      return (
        <InlineLayout gap={gap} className={className}>
          {children}
        </InlineLayout>
      );

    case LayoutType.STACK:
    default:
      return (
        <StackLayout gap={gap} className={className}>
          {children}
        </StackLayout>
      );
  }
}
