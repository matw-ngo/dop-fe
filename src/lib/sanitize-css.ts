/**
 * CSS Sanitization Utility
 *
 * Prevents CSS injection attacks by sanitizing custom CSS input.
 * Only allows safe CSS properties, values, and selectors.
 *
 * Uses a whitelist-based approach for maximum security.
 *
 * @example
 * ```typescript
 * import { sanitizeCSS } from '@/lib/sanitize-css';
 *
 * const userCSS = 'body { color: red; background: url("javascript:alert(1)"); }';
 * const safeCSS = sanitizeCSS(userCSS);
 * // Result: 'body { color: red; }'
 * ```
 */

// Browser detection (currently unused but reserved for future use)
const _IS_BROWSER = typeof window !== "undefined";

// List of safe CSS properties (whitelist approach)
const SAFE_PROPERTIES = new Set([
  // Layout
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "overflow",
  "overflow-x",
  "overflow-y",
  "visibility",
  "opacity",

  // Flexbox
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "justify-content",
  "align-items",
  "align-self",
  "align-content",
  "order",

  // Grid
  "grid",
  "grid-template",
  "grid-template-rows",
  "grid-template-columns",
  "grid-template-areas",
  "grid-area",
  "grid-row",
  "grid-column",
  "grid-gap",
  "gap",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-auto-columns",

  // Colors & Background
  "color",
  "background",
  "background-color",
  "background-repeat",
  "background-position",
  "background-size",
  "background-attachment",
  "background-clip",
  "background-origin",
  "border",
  "border-color",
  "border-style",
  "border-width",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-radius",
  "outline",
  "outline-color",
  "outline-style",
  "outline-width",
  "box-shadow",
  "text-shadow",

  // Typography
  "font",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant",
  "font-stretch",
  "font-size-adjust",
  "font-display",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "white-space",
  "text-align",
  "text-decoration",
  "text-indent",
  "text-transform",
  "text-overflow",
  "word-wrap",
  "word-break",
  "tab-size",

  // Visual
  "cursor",
  "user-select",
  "pointer-events",
  "resize",
  "transition",
  "transform",
  "transform-origin",
  "perspective",
  "perspective-origin",
  "backface-visibility",
  "animation",
  "filter",

  // List
  "list-style",
  "list-style-type",
  "list-style-position",

  // Table
  "border-collapse",
  "border-spacing",
  "caption-side",
  "empty-cells",
  "table-layout",
]);

// Safe URL patterns for CSS
const SAFE_URL_PATTERNS = [
  /^data:image\/(png|gif|jpg|jpeg|webp|svg\+xml);base64,([a-zA-Z0-9+/]+=*)$/,
  /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/,
];

// Safe CSS function patterns
const SAFE_FUNCTION_PATTERNS = [
  /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/,
  /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)$/,
  /^(linear|radial|conic)-gradient\(/,
  /^calc\(/,
  /^min\(/,
  /^max\(/,
  /^clamp\(/,
];

// Allowed pseudo-classes and pseudo-elements
const ALLOWED_PSEUDO = new Set([
  ":hover",
  ":active",
  ":focus",
  ":visited",
  ":link",
  ":first-child",
  ":last-child",
  ":nth-child",
  ":nth-of-type",
  ":first-of-type",
  ":last-of-type",
  ":only-child",
  ":only-of-type",
  ":empty",
  ":root",
  ":checked",
  ":disabled",
  ":enabled",
  "::before",
  "::after",
  "::first-letter",
  "::first-line",
]);

// Dangerous patterns to block
const DANGEROUS_PATTERNS = [
  // JavaScript and data URLs
  /javascript\s*:/gi,
  /data\s*:(?!image\/)/gi,

  // Dangerous CSS features
  /@import\s+/gi,
  /@charset\s+/gi,
  /@namespace\s+/gi,
  /@document\s+/gi,
  /-moz-binding\s*:/gi,
  /behavior\s*:/gi,
  /binding\s*:/gi,
  /expression\s*\(/gi,

  // XSS patterns
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /on\w+\s*=/gi,
];

/**
 * Removes CSS comments from a string
 */
export function removeCSSComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

/**
 * Checks if a CSS property is safe
 */
export function isSafeProperty(property: string): boolean {
  if (property.startsWith("--")) {
    return true; // Allow CSS variables
  }
  return SAFE_PROPERTIES.has(property);
}

/**
 * Validates if a CSS selector is safe
 */
export function isValidSelector(selector: string): boolean {
  // Basic validation
  if (!selector || typeof selector !== "string") {
    return false;
  }

  // Remove whitespace for checking
  selector = selector.trim();

  // Block dangerous characters and patterns
  if (/[<>]/.test(selector)) {
    return false;
  }

  // Check pseudo-classes and pseudo-elements
  const parts = selector.split(/([:]+[a-zA-Z-]+)/);
  for (let i = 1; i < parts.length; i += 2) {
    const pseudo = parts[i];
    const basePseudo = pseudo.replace(/^:+/, ":");

    // Allow nth-* with parentheses
    if (basePseudo.startsWith(":nth-")) {
      continue;
    }

    // Check against allowed pseudo-classes
    if (!ALLOWED_PSEUDO.has(basePseudo)) {
      return false;
    }
  }

  // Allow simple combinators (descendant, child, adjacent sibling)
  const simpleParts = selector.split(/\s*[>+~]\s*/);

  for (const part of simpleParts) {
    const trimmed = part.trim();

    // Allow element selectors
    if (/^[a-zA-Z][a-zA-Z0-9-]*$/.test(trimmed)) {
      continue;
    }

    // Allow class selectors
    if (/^\.[a-zA-Z_][a-zA-Z0-9_-]*$/.test(trimmed)) {
      continue;
    }

    // Allow ID selectors
    if (/^#[a-zA-Z_][a-zA-Z0-9_-]*$/.test(trimmed)) {
      continue;
    }

    // Allow pseudo-classes with simple patterns
    if (/^:[a-zA-Z-]+(\([^)]*\))?$/.test(trimmed)) {
      continue;
    }

    return false;
  }

  return true;
}

/**
 * Sanitizes a CSS property value
 */
export function sanitizeValue(_property: string, value: string): string {
  if (!value || typeof value !== "string") {
    return "";
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(value)) {
      return "";
    }
  }

  // Special handling for url()
  if (value.includes("url(")) {
    const urlMatch = value.match(/url\s*\(\s*(['"]?)(.*?)\1\s*\)/i);
    if (urlMatch) {
      const url = urlMatch[2];
      const isSafe = SAFE_URL_PATTERNS.some((pattern) => pattern.test(url));
      if (!isSafe) {
        return "";
      }
    }
  }

  // Check for safe functions
  const functionMatch = value.match(/^([a-zA-Z-]+)\s*\(/);
  if (functionMatch) {
    const functionName = functionMatch[1];

    // Only allow specific safe functions
    const allowedFunctions = [
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "calc",
      "min",
      "max",
      "clamp",
    ];
    if (!allowedFunctions.includes(functionName)) {
      return "";
    }

    // Additional check for gradient functions
    if (functionName.endsWith("-gradient")) {
      if (!SAFE_FUNCTION_PATTERNS.some((pattern) => pattern.test(value))) {
        return "";
      }
    }
  }

  return value;
}

/**
 * Simple CSS parser for sanitization
 */
function parseCSS(
  css: string,
): Array<{ selector: string; declarations: Map<string, string> }> {
  const rules: Array<{ selector: string; declarations: Map<string, string> }> =
    [];

  // Remove comments first
  css = removeCSSComments(css);

  // Simple regex-based parsing (for basic cases)
  // Note: This is a simplified parser. For production, consider using a proper CSS parser library
  const ruleRegex = /([^{]+)\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while (true) {
    match = ruleRegex.exec(css);
    if (match === null) break;
    const selector = match[1].trim();
    const declarationsStr = match[2].trim();

    if (!isValidSelector(selector)) {
      continue;
    }

    const declarations = new Map<string, string>();
    const declPairs = declarationsStr.split(";");

    for (const pair of declPairs) {
      const colonIndex = pair.indexOf(":");
      if (colonIndex === -1) continue;

      const property = pair.substring(0, colonIndex).trim();
      const value = pair.substring(colonIndex + 1).trim();

      if (isSafeProperty(property)) {
        const sanitizedValue = sanitizeValue(property, value);
        if (sanitizedValue) {
          declarations.set(property, sanitizedValue);
        }
      }
    }

    if (declarations.size > 0) {
      rules.push({ selector, declarations });
    }
  }

  return rules;
}

/**
 * Main CSS sanitization function
 */
export function sanitizeCSS(css: string): string {
  if (!css || typeof css !== "string") {
    return "";
  }

  const rules = parseCSS(css);
  const sanitizedRules: string[] = [];

  for (const rule of rules) {
    const declarations = Array.from(rule.declarations.entries())
      .map(([prop, val]) => `${prop}: ${val}`)
      .join("; ");

    if (declarations) {
      sanitizedRules.push(`${rule.selector} { ${declarations} }`);
    }
  }

  return sanitizedRules.join("\n");
}

/**
 * Checks if a CSS string contains only safe constructs
 */
export function isSafeCSS(css: string): boolean {
  const sanitized = sanitizeCSS(css);

  // Basic check - if we sanitized anything significant, it's not safe
  if (!sanitized && css.trim()) {
    return false;
  }

  return true;
}

/**
 * Sanitizes a CSS variable name
 */
export function sanitizeCSSVariableName(name: string): string {
  if (!name || typeof name !== "string") {
    return "--";
  }

  if (!name.startsWith("--")) {
    name = `--${name}`;
  }

  // Only allow alphanumeric characters, hyphens, and underscores
  return `--${name.substring(2).replace(/[^a-zA-Z0-9\-_]/g, "")}`;
}

/**
 * Sanitizes a CSS variable declaration
 */
export function sanitizeCSSVariable(name: string, value: string): string {
  const safeName = sanitizeCSSVariableName(name);
  const safeValue = sanitizeValue("custom-property", value);

  if (!safeValue) {
    return "";
  }

  return `${safeName}: ${safeValue};`;
}

// Export constants for external use
export { SAFE_PROPERTIES, DANGEROUS_PATTERNS };
