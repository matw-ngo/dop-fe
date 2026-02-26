/**
 * Section Header Component for Loan Form
 *
 * A custom component that displays a section header with:
 * - Green accent bar
 * - Bold title in dark green color
 *
 * Used to visually separate and title different sections of the form.
 */

import type { FieldComponentProps } from "@/components/form-generation";
import { finzoneTheme } from "@/configs/themes/finzone-theme";

/**
 * SectionHeader Component
 *
 * Displays a section header with a green accent bar and bold title.
 * Hidden from layout (used for visual separation only).
 */
export const SectionHeader = ({ field }: FieldComponentProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className="h-6 w-1 rounded-full"
        style={{ backgroundColor: finzoneTheme.colors.primary }}
      />
      <h3 className="text-xl font-bold text-[#003e2c]">{field.label}</h3>
    </div>
  );
};

/**
 * Registration Configuration
 *
 * The SectionHeader component needs to be registered in the form generation system
 * before it can be used in form configurations.
 *
 * Usage:
 * ```typescript
 * import { allowCustomComponent, registerComponent } from "@/components/form-generation";
 * import { SectionHeader } from "./SectionHeader";
 *
 * try {
 *   allowCustomComponent("SectionHeader");
 *   registerComponent("SectionHeader", SectionHeader);
 * } catch (e) {
 *   // Ignore registration errors in strict mode / hot reload
 * }
 * ```
 */

export const SECTION_HEADER_CONFIG = {
  componentName: "SectionHeader",
  component: SectionHeader,
};
