import type { MappedStep } from "@/mappers/flowMapper";
import { FieldType, STEP_PATTERNS } from "../constants/field-types";
import type { StepMetadata } from "../types/field-config";

/**
 * Get step title based on the fields it contains
 */
export function getStepTitle(
  step: MappedStep,
  t: (key: string) => string,
): string {
  const visibleFieldNames = Object.keys(step.fields).filter(
    (name) => (step.fields as any)[name]?.visible,
  );

  // Check against step patterns
  for (const [patternName, pattern] of Object.entries(STEP_PATTERNS)) {
    if (hasMatchingFields(visibleFieldNames, pattern.fields)) {
      return t(`steps.${patternName.toLowerCase()}.title`);
    }
  }

  // Default title if no pattern matches
  return t("steps.default.title");
}

/**
 * Get step description based on the fields it contains
 */
export function getStepDescription(
  step: MappedStep,
  t: (key: string) => string,
): string {
  const visibleFieldNames = Object.keys(step.fields).filter(
    (name) => (step.fields as any)[name]?.visible,
  );

  // Check against step patterns
  for (const [patternName, pattern] of Object.entries(STEP_PATTERNS)) {
    if (hasMatchingFields(visibleFieldNames, pattern.fields)) {
      return t(`steps.${patternName.toLowerCase()}.description`);
    }
  }

  // Default description if no pattern matches
  return t("steps.default.description");
}

/**
 * Get step icon based on the fields it contains
 */
export function getStepIcon(step: MappedStep): any {
  const visibleFieldNames = Object.keys(step.fields).filter(
    (name) => (step.fields as any)[name]?.visible,
  );

  // Check against step patterns
  for (const pattern of Object.values(STEP_PATTERNS)) {
    if (hasMatchingFields(visibleFieldNames, pattern.fields)) {
      return pattern.icon;
    }
  }

  // Default icon
  return STEP_PATTERNS.PERSONAL_INFO.icon;
}

/**
 * Get step metadata including title, description, and icon
 */
export function getStepMetadata(
  step: MappedStep,
  t: (key: string) => string,
): StepMetadata {
  const visibleFieldNames = Object.keys(step.fields).filter(
    (name) => (step.fields as any)[name]?.visible,
  );

  // Determine step category based on fields
  let category = "personal"; // Default category
  for (const [patternName, pattern] of Object.entries(STEP_PATTERNS)) {
    if (hasMatchingFields(visibleFieldNames, pattern.fields)) {
      category = patternName.toLowerCase();
      break;
    }
  }

  return {
    title: getStepTitle(step, t),
    description: getStepDescription(step, t),
    icon: getStepIcon(step),
    category: category as any,
    optional: false,
    weight: calculateStepWeight(visibleFieldNames),
  };
}

/**
 * Calculate step weight for progress tracking
 */
export function calculateStepWeight(fieldNames: string[]): number {
  // Base weight per field
  let weight = fieldNames.length * 1;

  // Extra weight for complex fields
  if (fieldNames.includes(FieldType.EKYC_VERIFICATION)) {
    weight += 3; // eKYC is complex
  }
  if (fieldNames.some((f) => f.includes("Id") || f.includes("national"))) {
    weight += 2; // Identity fields are important
  }

  return Math.min(weight, 10); // Cap at 10
}

/**
 * Check if step matches a field pattern
 */
function hasMatchingFields(
  stepFields: string[],
  patternFields: readonly FieldType[],
): boolean {
  // If step has no fields, don't match
  if (stepFields.length === 0) return false;

  // Check if step has at least one field from the pattern
  return patternFields.some((field) => stepFields.includes(field));
}

/**
 * Classify step by primary purpose
 */
export function classifyStep(step: MappedStep): {
  category: string;
  complexity: "simple" | "medium" | "complex";
  estimatedTime: number; // in seconds
} {
  const visibleFieldNames = Object.keys(step.fields).filter(
    (name) => (step.fields as any)[name]?.visible,
  );

  let category = "general";
  let complexity: "simple" | "medium" | "complex" = "simple";
  let estimatedTime = visibleFieldNames.length * 15; // Base: 15 seconds per field

  // Determine category and complexity
  if (
    visibleFieldNames.some((f) => f.includes("nationalId") || f.includes("Id"))
  ) {
    category = "identity";
    complexity = "medium";
    estimatedTime += 30; // Identity verification takes longer
  }

  if (visibleFieldNames.includes(FieldType.EKYC_VERIFICATION)) {
    category = "verification";
    complexity = "complex";
    estimatedTime = 120; // eKYC takes significant time
  }

  if (
    visibleFieldNames.some((f) => f.includes("income") || f.includes("career"))
  ) {
    category = "financial";
    complexity = "medium";
    estimatedTime += 20;
  }

  return { category, complexity, estimatedTime };
}

/**
 * Get step navigation configuration
 */
export function getStepNavigation(
  step: MappedStep,
  t: (key: string) => string,
) {
  return {
    showSkip: false,
    nextText: t("navigation.next"),
    previousText: t("navigation.previous"),
    skipText: t("navigation.skip"),
    submitText: t("navigation.submit"),
  };
}
