import {
  createInputField,
  createSelectField,
  createDatePickerField,
  createEkycField,
  createConfirmationField,
} from "@/components/renderer/builders/field-builder";
import type { RawFieldConfig } from "@/components/renderer/types/data-driven-ui";
import {
  FIELD_VARIANTS,
  FIELD_ANIMATIONS,
  LAYOUT_CONFIG,
  GRID_SPANS,
} from "../constants/ui-themes";

/**
 * Create a field builder factory that returns RawFieldConfig
 * This aligns with the existing field builder system
 */
export function createFieldBuilderFactory(t: (key: string) => string) {
  return {
    input: (name: string, config: any = {}) => {
      const fieldConfig = createInputField(name, {
        type: "text",
        label: t(`fields.${name}.label`),
        placeholder: t(`fields.${name}.placeholder`),
        variant: FIELD_VARIANTS.DEFAULT,
        animation: FIELD_ANIMATIONS.FADE_IN,
        layout: LAYOUT_CONFIG.DEFAULT,
        className: GRID_SPANS.SINGLE,
        ...config,
      });
      return fieldConfig;
    },

    select: (name: string, config: any = {}) => {
      const fieldConfig = createSelectField(name, {
        label: t(`fields.${name}.label`),
        placeholder: t(`fields.${name}.placeholder`),
        variant: FIELD_VARIANTS.DEFAULT,
        animation: FIELD_ANIMATIONS.FADE_IN,
        layout: LAYOUT_CONFIG.DEFAULT,
        className: GRID_SPANS.SINGLE,
        // Filter out empty string options
        options: (config.options || []).filter((opt: any) => opt.value !== ""),
        ...config,
      });
      return fieldConfig;
    },

    datePicker: (name: string, config: any = {}) => {
      const fieldConfig = createDatePickerField(name, {
        label: t(`fields.${name}.label`),
        placeholder: t(`fields.${name}.placeholder`),
        variant: FIELD_VARIANTS.DEFAULT,
        animation: FIELD_ANIMATIONS.FADE_IN,
        layout: LAYOUT_CONFIG.DEFAULT,
        className: GRID_SPANS.SINGLE,
        ...config,
      });
      return fieldConfig;
    },

    ekyc: (name: string, config: any = {}) => {
      const fieldConfig = createEkycField(name, {
        label: t(`fields.${name}.label`),
        variant: FIELD_VARIANTS.LARGE,
        animation: FIELD_ANIMATIONS.SCALE_IN,
        layout: LAYOUT_CONFIG.SPACIOUS,
        className: GRID_SPANS.FULL_WIDTH,
        provider: "default",
        verificationTypes: ["identity"],
        ...config,
      });
      return fieldConfig;
    },

    confirmation: (name: string, config: any = {}) => {
      const fieldConfig = createConfirmationField(name, {
        label: t(`fields.${name}.label`),
        variant: FIELD_VARIANTS.LARGE,
        animation: FIELD_ANIMATIONS.BOUNCE_IN,
        layout: LAYOUT_CONFIG.SPACIOUS,
        className: GRID_SPANS.FULL_WIDTH,
        confirmationType: "success",
        message: config.message || t("confirmation.defaultMessage"),
        ...config,
      });
      return fieldConfig;
    },

    withValidation: (field: RawFieldConfig, validations: any[]) => {
      return {
        ...field,
        props: {
          ...field.props,
          validations,
        },
      };
    },

    makeRequired: (field: RawFieldConfig) => {
      return {
        ...field,
        props: {
          ...field.props,
          required: true,
          validations: [
            ...(field.props.validations || []),
            { type: "required", messageKey: "form.errors.required" },
          ],
        },
      };
    },

    withGridSpan: (field: RawFieldConfig, span: keyof typeof GRID_SPANS) => {
      return {
        ...field,
        props: {
          ...field.props,
          className: GRID_SPANS[span],
        },
      };
    },

    withStyling: (field: RawFieldConfig, styling: any) => {
      return {
        ...field,
        props: {
          ...field.props,
          variant: styling.variant
            ? FIELD_VARIANTS[styling.variant]
            : field.props.variant,
          animation: styling.animation
            ? FIELD_ANIMATIONS[styling.animation]
            : field.props.animation,
          layout: styling.layout
            ? LAYOUT_CONFIG[styling.layout]
            : field.props.layout,
        },
      };
    },
  };
}
