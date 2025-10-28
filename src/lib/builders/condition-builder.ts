// Helper functions for building field conditions
// Provides a fluent API for creating complex conditional logic

import type {
  ConditionRule,
  ComplexCondition,
  FieldCondition,
  ConditionOperator,
} from "@/types/field-conditions";

/**
 * Create a simple condition rule
 */
export function when(
  fieldName: string,
  operator: ConditionOperator,
  value?: any,
): ConditionRule {
  return { fieldName, operator, value };
}

/**
 * Shorthand operators
 */
export const is = {
  equals: (fieldName: string, value: any) => when(fieldName, "equals", value),
  notEquals: (fieldName: string, value: any) =>
    when(fieldName, "notEquals", value),
  greaterThan: (fieldName: string, value: number) =>
    when(fieldName, "greaterThan", value),
  lessThan: (fieldName: string, value: number) =>
    when(fieldName, "lessThan", value),
  greaterThanOrEqual: (fieldName: string, value: number) =>
    when(fieldName, "greaterThanOrEqual", value),
  lessThanOrEqual: (fieldName: string, value: number) =>
    when(fieldName, "lessThanOrEqual", value),
  contains: (fieldName: string, value: any) =>
    when(fieldName, "contains", value),
  notContains: (fieldName: string, value: any) =>
    when(fieldName, "notContains", value),
  startsWith: (fieldName: string, value: string) =>
    when(fieldName, "startsWith", value),
  endsWith: (fieldName: string, value: string) =>
    when(fieldName, "endsWith", value),
  in: (fieldName: string, values: any[]) => when(fieldName, "in", values),
  notIn: (fieldName: string, values: any[]) => when(fieldName, "notIn", values),
  empty: (fieldName: string) => when(fieldName, "isEmpty"),
  notEmpty: (fieldName: string) => when(fieldName, "isNotEmpty"),
  true: (fieldName: string) => when(fieldName, "isTrue"),
  false: (fieldName: string) => when(fieldName, "isFalse"),
  defined: (fieldName: string) => when(fieldName, "isDefined"),
  undefined: (fieldName: string) => when(fieldName, "isUndefined"),
};

/**
 * AND condition builder
 */
export function and(
  ...rules: (ConditionRule | ComplexCondition)[]
): ComplexCondition {
  const conditions: ComplexCondition[] = [];
  const simpleRules: ConditionRule[] = [];

  rules.forEach((rule) => {
    if ("logic" in rule) {
      conditions.push(rule);
    } else {
      simpleRules.push(rule);
    }
  });

  return {
    logic: "AND",
    rules: simpleRules,
    conditions,
  };
}

/**
 * OR condition builder
 */
export function or(
  ...rules: (ConditionRule | ComplexCondition)[]
): ComplexCondition {
  const conditions: ComplexCondition[] = [];
  const simpleRules: ConditionRule[] = [];

  rules.forEach((rule) => {
    if ("logic" in rule) {
      conditions.push(rule);
    } else {
      simpleRules.push(rule);
    }
  });

  return {
    logic: "OR",
    rules: simpleRules,
    conditions,
  };
}

/**
 * NOT condition builder
 */
export function not(
  ...rules: (ConditionRule | ComplexCondition)[]
): ComplexCondition {
  const conditions: ComplexCondition[] = [];
  const simpleRules: ConditionRule[] = [];

  rules.forEach((rule) => {
    if ("logic" in rule) {
      conditions.push(rule);
    } else {
      simpleRules.push(rule);
    }
  });

  return {
    logic: "NOT",
    rules: simpleRules,
    conditions,
  };
}

/**
 * Examples:
 *
 * // Simple condition
 * is.equals('country', 'us')
 *
 * // AND condition
 * and(
 *   is.equals('country', 'us'),
 *   is.greaterThan('age', 18)
 * )
 *
 * // OR condition
 * or(
 *   is.equals('role', 'admin'),
 *   is.equals('role', 'moderator')
 * )
 *
 * // Nested conditions
 * and(
 *   is.equals('country', 'us'),
 *   or(
 *     is.equals('state', 'CA'),
 *     is.equals('state', 'NY')
 *   )
 * )
 *
 * // Complex example
 * or(
 *   and(
 *     is.equals('userType', 'premium'),
 *     is.greaterThan('subscriptionMonths', 6)
 *   ),
 *   is.equals('userType', 'enterprise')
 * )
 */
