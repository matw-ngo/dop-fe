// Helper utilities for building multi-step form configurations
// Provides fluent API for creating multi-step forms

import type { RawFieldConfig } from "../types/data-driven-ui";
import type { MultiStepFormConfig, StepConfig } from "../types/multi-step-form";

/**
 * Create a step configuration
 */
export function createStep(
  id: string,
  title: string,
  fields: RawFieldConfig[],
  options?: Partial<Omit<StepConfig, "id" | "title" | "fields">>,
): StepConfig {
  return {
    id,
    title,
    fields,
    ...options,
  };
}

/**
 * Create a multi-step form configuration
 */
export function createMultiStepForm(
  steps: StepConfig[],
  options?: Partial<Omit<MultiStepFormConfig, "steps">>,
): MultiStepFormConfig {
  return {
    steps,
    initialStep: 0,
    allowBackNavigation: true,
    showProgress: true,
    progressStyle: "steps",
    persistData: false,
    ...options,
  };
}

/**
 * Fluent builder for multi-step forms
 */
export class MultiStepFormBuilder {
  private steps: StepConfig[] = [];
  private config: Partial<Omit<MultiStepFormConfig, "steps">> = {};

  /**
   * Add a step to the form
   */
  addStep(
    id: string,
    title: string,
    fields: RawFieldConfig[],
    options?: Partial<Omit<StepConfig, "id" | "title" | "fields">>,
  ): this {
    this.steps.push(createStep(id, title, fields, options));
    return this;
  }

  /**
   * Set initial step index
   */
  setInitialStep(index: number): this {
    this.config.initialStep = index;
    return this;
  }

  /**
   * Enable/disable back navigation
   */
  allowBackNavigation(allow: boolean = true): this {
    this.config.allowBackNavigation = allow;
    return this;
  }

  /**
   * Show/hide progress indicator
   */
  showProgress(show: boolean = true): this {
    this.config.showProgress = show;
    return this;
  }

  /**
   * Set progress display style
   */
  setProgressStyle(style: "steps" | "bar" | "dots"): this {
    this.config.progressStyle = style;
    return this;
  }

  /**
   * Enable/disable data persistence
   */
  persistData(persist: boolean = true, key?: string): this {
    this.config.persistData = persist;
    if (key) {
      this.config.persistKey = key;
    }
    return this;
  }

  /**
   * Set step complete callback
   */
  onStepComplete(
    callback: (
      stepId: string,
      stepData: Record<string, any>,
    ) => void | Promise<void>,
  ): this {
    this.config.onStepComplete = callback;
    return this;
  }

  /**
   * Set form complete callback
   */
  onComplete(
    callback: (allData: Record<string, any>) => void | Promise<void>,
  ): this {
    this.config.onComplete = callback;
    return this;
  }

  /**
   * Set step change callback
   */
  onStepChange(callback: (fromStep: number, toStep: number) => void): this {
    this.config.onStepChange = callback;
    return this;
  }

  /**
   * Set form-level UI variant
   */
  setFormVariant(variant: {
    size?: string;
    color?: string;
    variant?: string;
  }): this {
    this.config.formVariant = variant;
    return this;
  }

  /**
   * Set step transition animation
   */
  setStepTransitionAnimation(animation: {
    type?: string;
    direction?: string;
    duration?: number;
  }): this {
    this.config.stepTransitionAnimation = animation;
    return this;
  }

  /**
   * Set form responsive configuration
   */
  setResponsiveConfig(responsive: {
    form?: any;
    progress?: any;
    navigation?: any;
  }): this {
    this.config.responsive = responsive;
    return this;
  }

  /**
   * Set form layout properties
   */
  setLayout(layout: {
    display?: string;
    direction?: string;
    align?: string;
    justify?: string;
    gap?: string;
  }): this {
    this.config.layout = layout;
    return this;
  }

  /**
   * Set custom className for the form
   */
  setFormClassName(className: string): this {
    this.config.className = className;
    return this;
  }

  /**
   * Set custom inline styles for the form
   */
  setFormStyle(style: React.CSSProperties): this {
    this.config.style = style;
    return this;
  }

  /**
   * Build the final configuration
   */
  build(): MultiStepFormConfig {
    if (this.steps.length === 0) {
      throw new Error("MultiStepFormBuilder: At least one step is required");
    }

    return {
      steps: this.steps,
      initialStep: 0,
      allowBackNavigation: true,
      showProgress: true,
      progressStyle: "steps",
      persistData: false,
      ...this.config,
    };
  }
}

/**
 * Create a new multi-step form builder instance
 */
export function multiStepForm(): MultiStepFormBuilder {
  return new MultiStepFormBuilder();
}
