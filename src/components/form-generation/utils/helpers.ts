/**
 * Form Generation Library - Utilities
 *
 * Helper functions for form generation library
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FieldCondition } from "../types";

// ============================================================================
// CSS Utilities
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Field ID Utilities
// ============================================================================

/**
 * Generate a unique field ID
 */
export function generateFieldId(prefix: string = "field"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize field name for use as HTML id
 */
export function sanitizeFieldId(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

// ============================================================================
// Value Transformation
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };

  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      const sourceValue = source[key];
      const targetValue = output[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        output[key] = deepMerge(targetValue, sourceValue as any);
      } else {
        output[key] = sourceValue as any;
      }
    }
  }

  return output;
}

/**
 * Get nested property value from object
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested property value in object
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime());
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Check if value is a valid date
 */
export function isValidDate(value: any): boolean {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  }

  return false;
}

/**
 * Check if value is a number
 */
export function isNumber(value: any): boolean {
  return typeof value === "number" && !Number.isNaN(value);
}

// ============================================================================
// Conditional Logic Evaluation
// ============================================================================

/**
 * Evaluate a single condition
 */
export function evaluateCondition(
  condition: FieldCondition,
  formValues: Record<string, any>,
): boolean {
  const fieldValue = getNestedValue(formValues, condition.fieldId);
  const conditionValue = condition.value;

  switch (condition.operator) {
    case "equals":
      return fieldValue === conditionValue;

    case "notEquals":
      return fieldValue !== conditionValue;

    case "contains":
      if (typeof fieldValue === "string") {
        return fieldValue.includes(conditionValue);
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue);
      }
      return false;

    case "greaterThan":
      return isNumber(fieldValue) && fieldValue > conditionValue;

    case "lessThan":
      return isNumber(fieldValue) && fieldValue < conditionValue;

    case "in":
      return (
        Array.isArray(conditionValue) && conditionValue.includes(fieldValue)
      );

    case "notIn":
      return (
        Array.isArray(conditionValue) && !conditionValue.includes(fieldValue)
      );

    default:
      return false;
  }
}

/**
 * Evaluate multiple conditions with AND/OR logic
 */
export function evaluateConditions(
  conditions: FieldCondition[],
  formValues: Record<string, any>,
  logic: "and" | "or" = "and",
): boolean {
  if (conditions.length === 0) {
    return true;
  }

  if (logic === "and") {
    return conditions.every((condition) =>
      evaluateCondition(condition, formValues),
    );
  } else {
    return conditions.some((condition) =>
      evaluateCondition(condition, formValues),
    );
  }
}

// ============================================================================
// Format Utilities
// ============================================================================

/**
 * Format number as currency
 */
export function formatCurrency(
  value: number,
  currency: "VND" | "USD" | "EUR" = "VND",
  locale: string = "vi-VN",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "VND" ? 0 : 2,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(value);
  } catch (_error) {
    return value.toString();
  }
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const numericValue = value.replace(/[^0-9.-]/g, "");
  return parseFloat(numericValue) || 0;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (Vietnamese format)
 */
export function isValidPhone(phone: string): boolean {
  // Vietnamese phone number format: 10 digits starting with 0
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array by key
 */
export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string),
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey =
        typeof key === "function" ? key(item) : String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Sort array by key
 */
export function sortBy<T>(
  array: T[],
  key: keyof T | ((item: T) => any),
  order: "asc" | "desc" = "asc",
): T[] {
  const sorted = [...array].sort((a, b) => {
    const aValue = typeof key === "function" ? key(a) : a[key];
    const bValue = typeof key === "function" ? key(b) : b[key];

    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}
