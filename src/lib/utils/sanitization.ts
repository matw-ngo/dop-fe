/**
 * Input Sanitization Utilities
 * Provides secure input sanitization for preventing XSS and injection attacks
 */

import { securityUtils } from "@/lib/auth/secure-tokens";

/**
 * Sanitization configuration
 */
interface SanitizationConfig {
  allowHTML?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  maxLength?: number;
  trimWhitespace?: boolean;
  normalizeWhitespace?: boolean;
}

/**
 * Default sanitization config for loan applications
 */
const LOAN_APP_SANITIZATION_CONFIG: SanitizationConfig = {
  allowHTML: false,
  maxLength: 1000,
  trimWhitespace: true,
  normalizeWhitespace: true,
};

/**
 * Advanced HTML sanitization
 */
const sanitizeHTML = (input: string, config: SanitizationConfig): string => {
  if (!config.allowHTML) {
    // Remove all HTML tags
    return input.replace(/<[^>]*>/g, "");
  }

  // For more complex HTML sanitization, you might want to use a library like DOMPurify
  // This is a basic implementation
  const allowedTags = config.allowedTags || ["b", "i", "em", "strong", "br"];
  const tagPattern = new RegExp(
    `<(?!/?\\b(${allowedTags.join("|")})\\b)[^>]*>`,
    "gi",
  );
  return input.replace(tagPattern, "");
};

/**
 * Sanitize JavaScript content
 */
const sanitizeJavaScript = (input: string): string => {
  return input
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/vbscript:/gi, "")
    .replace(/data:/gi, "");
};

/**
 * Sanitize SQL injection attempts
 */
const _sanitizeSQL = (input: string): string => {
  return input
    .replace(/('|(\\')|(;)|(\\;))|(--)|(\*|\/)/g, "")
    .replace(
      /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b/gi,
      "",
    );
};

/**
 * Sanitize file path
 */
const sanitizeFilePath = (input: string): string => {
  return input
    .replace(/\.\./g, "") // Remove directory traversal
    .replace(/[/\\:*?"<>|]/g, "") // Remove invalid characters
    .replace(/^\/+/, "") // Remove leading slashes
    .replace(/\/+$/, ""); // Remove trailing slashes
};

/**
 * Normalize Vietnamese text
 */
const _normalizeVietnamese = (input: string): string => {
  return input.replace(
    /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÔƠưăâđôơ]/g,
    (match) => {
      // Convert to normalized form if needed
      return match;
    },
  );
};

/**
 * Sanitize Vietnamese phone number
 */
export const sanitizeVietnamesePhone = (phone: string): string => {
  const sanitized = phone.replace(/[^0-9+]/g, "");

  // Validate Vietnamese phone format
  if (securityUtils.validateVietnamesePhone(sanitized)) {
    return sanitized;
  }

  throw new Error("Invalid Vietnamese phone number format");
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  const sanitized = email.toLowerCase().trim();

  if (securityUtils.validateEmail(sanitized)) {
    return sanitized;
  }

  throw new Error("Invalid email format");
};

/**
 * Sanitize Vietnamese ID number (CCCD)
 */
export const sanitizeVietnameseID = (id: string): string => {
  const sanitized = id.replace(/[^0-9]/g, "");

  if (sanitized.length === 12) {
    return sanitized;
  }

  throw new Error("Invalid Vietnamese ID number. Must be 12 digits.");
};

/**
 * Sanitize loan amount
 */
export const sanitizeLoanAmount = (amount: string | number): number => {
  const sanitized = String(amount).replace(/[^0-9.]/g, "");
  const parsed = parseFloat(sanitized);

  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("Invalid loan amount");
  }

  // Limit to reasonable range (e.g., 1M to 5B VND)
  if (parsed < 1000000 || parsed > 5000000000) {
    throw new Error(
      "Loan amount must be between 1,000,000 and 5,000,000,000 VND",
    );
  }

  return parsed;
};

/**
 * Sanitize loan term
 */
export const sanitizeLoanTerm = (term: string | number): number => {
  const sanitized = String(term).replace(/[^0-9]/g, "");
  const parsed = parseInt(sanitized, 10);

  if (Number.isNaN(parsed) || parsed < 1 || parsed > 360) {
    throw new Error("Loan term must be between 1 and 360 months");
  }

  return parsed;
};

/**
 * Sanitize address components
 */
export const sanitizeAddress = (address: string): string => {
  let sanitized = securityUtils.sanitizeInput(address);

  // Remove special characters but allow Vietnamese characters
  sanitized = sanitized.replace(/[<>]/g, "");

  if (sanitized.length < 5 || sanitized.length > 200) {
    throw new Error("Address must be between 5 and 200 characters");
  }

  return sanitized.trim();
};

/**
 * Sanitize Vietnamese name
 */
export const sanitizeVietnameseName = (name: string): string => {
  // Remove HTML, JavaScript, and special characters but allow Vietnamese
  let sanitized = sanitizeHTML(name, { allowHTML: false });
  sanitized = sanitizeJavaScript(sanitized);

  // Only allow Vietnamese characters, letters, spaces, and some punctuation
  sanitized = sanitized.replace(
    /[^a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ\s.\-']/g,
    "",
  );

  sanitized = sanitized.trim();

  if (sanitized.length < 2 || sanitized.length > 100) {
    throw new Error("Name must be between 2 and 100 characters");
  }

  return sanitized;
};

/**
 * Sanitize application data
 */
export const sanitizeApplicationData = <T extends Record<string, any>>(
  data: T,
  config: SanitizationConfig = LOAN_APP_SANITIZATION_CONFIG,
): T => {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    if (typeof value === "string") {
      let sanitizedValue: string | number = value;

      // Apply sanitization based on field name
      switch (key.toLowerCase()) {
        case "fullname":
        case "name":
          sanitizedValue = sanitizeVietnameseName(value);
          break;
        case "email":
          sanitizedValue = sanitizeEmail(value);
          break;
        case "phonenumber":
        case "phone":
          sanitizedValue = sanitizeVietnamesePhone(value);
          break;
        case "nationalid":
        case "id":
          sanitizedValue = sanitizeVietnameseID(value);
          break;
        case "street":
        case "address":
          sanitizedValue = sanitizeAddress(value);
          break;
        case "loanamount":
        case "amount":
          sanitizedValue = sanitizeLoanAmount(value);
          break;
        case "loanterm":
        case "term":
          sanitizedValue = sanitizeLoanTerm(value);
          break;
        default:
          // General sanitization
          sanitizedValue = securityUtils.sanitizeInput(value);

          if (config.maxLength && sanitizedValue.length > config.maxLength) {
            sanitizedValue = sanitizedValue.substring(0, config.maxLength);
          }

          if (config.trimWhitespace) {
            sanitizedValue = sanitizedValue.trim();
          }

          if (config.normalizeWhitespace) {
            sanitizedValue = sanitizedValue.replace(/\s+/g, " ");
          }
      }

      sanitized[key] = sanitizedValue;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeApplicationData(value, config);
    } else if (Array.isArray(value)) {
      // Sanitize array items
      sanitized[key] = value.map((item) => {
        if (typeof item === "string") {
          return securityUtils.sanitizeInput(item);
        } else if (typeof item === "object" && item !== null) {
          return sanitizeApplicationData(item, config);
        }
        return item;
      });
    } else {
      // For numbers, booleans, etc.
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File,
): { valid: boolean; error?: string } => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        "Invalid file type. Only PDF, JPEG, PNG, and Word documents are allowed.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size exceeds 10MB limit.",
    };
  }

  // Sanitize filename
  const sanitizedFileName = sanitizeFilePath(file.name);
  if (sanitizedFileName !== file.name) {
    console.warn("Filename was sanitized:", file.name, "->", sanitizedFileName);
  }

  return { valid: true };
};

/**
 * Generate safe random ID
 */
export const generateSafeId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
};

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: number[] = [];
  private readonly maxAttempts: number;
  private readonly timeWindow: number;

  constructor(maxAttempts = 5, timeWindowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindowMs;
  }

  canAttempt(): boolean {
    const now = Date.now();
    // Remove old attempts outside the time window
    this.attempts = this.attempts.filter(
      (attempt) => now - attempt < this.timeWindow,
    );

    if (this.attempts.length >= this.maxAttempts) {
      return false;
    }

    this.attempts.push(now);
    return true;
  }

  getRemainingTime(): number {
    const now = Date.now();
    const oldestAttempt = this.attempts[0];
    return oldestAttempt
      ? Math.max(0, this.timeWindow - (now - oldestAttempt))
      : 0;
  }
}

/**
 * Default rate limiter for form submissions
 */
export const formSubmissionRateLimiter = new RateLimiter(3, 300000); // 3 attempts per 5 minutes
