import { getResponsiveClasses } from "@/components/renderer/constants/responsive-classnames";
import type {
  ComponentVariant,
  LayoutProps,
  ResponsiveValue,
} from "@/components/renderer/types/ui-theme";
import { cn } from "@/lib/utils";

interface FormClassNamesOptions {
  className?: string;
  variant?: ComponentVariant;
  responsive?: {
    form?: ResponsiveValue<string>;
    fields?: ResponsiveValue<string>;
  };
  layout?: LayoutProps | "grid" | "flex" | "block";
}

interface FormClassNamesResult {
  formClasses: string;
  formResponsiveClasses: string;
  formLayoutClasses: string;
  formVariantClasses: string;
}

/**
 * Utility function that generates all CSS classes for form components
 * - Handles responsive classes
 * - Manages layout classes
 * - Applies variant classes
 * - Combines all classes with proper ordering
 */
export function useFormClassNames(
  options: FormClassNamesOptions,
): FormClassNamesResult {
  const { className, variant, responsive, layout } = options;

  // Generate responsive classes for the form
  const formResponsiveClasses = (() => {
    if (!responsive) return "";

    const classes: string[] = [];

    if (responsive.form) {
      classes.push(getResponsiveClasses(responsive.form, (val) => String(val)));
    }

    return classes.join(" ");
  })();

  // Generate layout classes for the form
  const formLayoutClasses = (() => {
    if (!layout) return "";

    // If layout is a string, just return it
    if (typeof layout === "string") {
      return layout;
    }

    const classes: string[] = [];

    if (layout.display) {
      classes.push(layout.display);
    }

    if (layout.justify) {
      classes.push(`justify-${layout.justify}`);
    }

    if (layout.align) {
      classes.push(`items-${layout.align}`);
    }

    if (layout.direction) {
      classes.push(`flex-${layout.direction}`);
    }

    if (layout.gap) {
      classes.push(`gap-${String(layout.gap)}`);
    }

    if (layout.padding) {
      classes.push(String(layout.padding));
    }

    if (layout.margin) {
      classes.push(String(layout.margin));
    }

    return classes.join(" ");
  })();

  // Generate variant classes for the form
  const formVariantClasses = (() => {
    if (!variant) return "";

    const classes: string[] = [];

    if (variant.size) {
      classes.push(`form-${variant.size}`);
    }

    if (variant.color) {
      classes.push(`form-${variant.color}`);
    }

    if (variant.variant) {
      classes.push(`form-${variant.variant}`);
    }

    return classes.join(" ");
  })();

  // Check if we're using grid layout
  const isGridLayout = layout === "grid";

  // Combine all form CSS classes
  const formClasses = cn(
    // Only use space-y for non-grid layouts
    !isGridLayout && "space-y-6",
    // Add grid classes for grid layout
    isGridLayout &&
      "grid gap-4 w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    formResponsiveClasses,
    formLayoutClasses,
    formVariantClasses,
    className,
  );

  return {
    formClasses,
    formResponsiveClasses,
    formLayoutClasses,
    formVariantClasses,
  };
}
