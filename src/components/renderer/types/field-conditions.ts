// Enhanced field condition types for Data-Driven UI
// Supports complex conditional logic for dynamic form fields

/**
 * Condition operators for field visibility
 */
export type ConditionOperator =
  // Equality
  | "equals"
  | "notEquals"
  // Numeric
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  // String
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "matches" // regex
  // Array
  | "in" // value is in array
  | "notIn"
  | "includesAll" // array includes all values
  | "includesAny" // array includes any value
  // Boolean
  | "isEmpty"
  | "isNotEmpty"
  | "isTrue"
  | "isFalse"
  // Type checks
  | "isDefined"
  | "isUndefined";

/**
 * Single condition rule
 */
export interface ConditionRule {
  /** Name of the field this condition depends on */
  fieldName: string;

  /** Operator for comparison */
  operator: ConditionOperator;

  /** Value to compare against (not needed for isEmpty, isDefined, etc.) */
  value?: any;

  /** For regex matching */
  pattern?: string;
}

/**
 * Logic operator for combining multiple conditions
 */
export type LogicOperator = "AND" | "OR" | "NOT";

/**
 * Complex condition with multiple rules
 */
export interface ComplexCondition {
  /** Logic operator to combine rules */
  logic: LogicOperator;

  /** Array of condition rules */
  rules: ConditionRule[];

  /** Nested conditions (for complex logic) */
  conditions?: ComplexCondition[];
}

/**
 * Simple condition (backward compatible)
 */
export interface SimpleCondition {
  fieldName: string;
  operator: ConditionOperator;
  value?: any;
}

/**
 * Field condition - can be simple or complex
 */
export type FieldCondition = SimpleCondition | ComplexCondition;

/**
 * Helper function to check if condition is complex
 */
export function isComplexCondition(
  condition: FieldCondition,
): condition is ComplexCondition {
  return "logic" in condition && "rules" in condition;
}

/**
 * Evaluate a single condition rule
 */
export function evaluateRule(
  rule: ConditionRule,
  formData: Record<string, any>,
): boolean {
  const { fieldName, operator, value, pattern } = rule;
  const fieldValue = formData[fieldName];

  switch (operator) {
    // Equality
    case "equals":
      return fieldValue === value;
    case "notEquals":
      return fieldValue !== value;

    // Numeric
    case "greaterThan":
      return Number(fieldValue) > Number(value);
    case "lessThan":
      return Number(fieldValue) < Number(value);
    case "greaterThanOrEqual":
      return Number(fieldValue) >= Number(value);
    case "lessThanOrEqual":
      return Number(fieldValue) <= Number(value);

    // String
    case "contains":
      return String(fieldValue).includes(String(value));
    case "notContains":
      return !String(fieldValue).includes(String(value));
    case "startsWith":
      return String(fieldValue).startsWith(String(value));
    case "endsWith":
      return String(fieldValue).endsWith(String(value));
    case "matches":
      if (!pattern) return false;
      return new RegExp(pattern).test(String(fieldValue));

    // Array
    case "in":
      return Array.isArray(value) && value.includes(fieldValue);
    case "notIn":
      return Array.isArray(value) && !value.includes(fieldValue);
    case "includesAll":
      if (!Array.isArray(fieldValue) || !Array.isArray(value)) return false;
      return value.every((v) => fieldValue.includes(v));
    case "includesAny":
      if (!Array.isArray(fieldValue) || !Array.isArray(value)) return false;
      return value.some((v) => fieldValue.includes(v));

    // Boolean
    case "isEmpty":
      return (
        !fieldValue ||
        (Array.isArray(fieldValue) && fieldValue.length === 0) ||
        (typeof fieldValue === "string" && fieldValue.trim() === "") ||
        (typeof fieldValue === "object" && Object.keys(fieldValue).length === 0)
      );
    case "isNotEmpty":
      return !evaluateRule({ ...rule, operator: "isEmpty" }, formData);
    case "isTrue":
      return fieldValue === true;
    case "isFalse":
      return fieldValue === false;

    // Type checks
    case "isDefined":
      return fieldValue !== undefined && fieldValue !== null;
    case "isUndefined":
      return fieldValue === undefined || fieldValue === null;

    default:
      console.warn(`Unknown operator: ${operator}`);
      return true;
  }
}

/**
 * Evaluate complex condition with multiple rules
 */
export function evaluateCondition(
  condition: FieldCondition,
  formData: Record<string, any>,
): boolean {
  // Simple condition (backward compatible)
  if (!isComplexCondition(condition)) {
    return evaluateRule(condition as ConditionRule, formData);
  }

  // Complex condition
  const { logic, rules, conditions = [] } = condition;

  // Evaluate all rules
  const ruleResults = rules.map((rule) => evaluateRule(rule, formData));

  // Evaluate nested conditions
  const conditionResults = conditions.map((cond) =>
    evaluateCondition(cond, formData),
  );

  // Combine all results
  const allResults = [...ruleResults, ...conditionResults];

  // Apply logic operator
  switch (logic) {
    case "AND":
      return allResults.every((result) => result === true);
    case "OR":
      return allResults.some((result) => result === true);
    case "NOT":
      return !allResults.some((result) => result === true);
    default:
      return true;
  }
}
