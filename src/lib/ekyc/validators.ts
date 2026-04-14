/**
 * eKYC Validators
 *
 * Provides validation functions for eKYC data including:
 * - Base64 image data validation
 * - Pre-submission validation
 * - Data quality checks
 *
 * @module validators
 */

import type {
  CompareFaceResponse,
  EkycResponse,
  LivenessFaceResponse,
  OcrResponse,
} from "./types";

/**
 * Extended EkycResponse type that includes optional base64 fields from SDK
 */
interface ExtendedEkycResponse extends EkycResponse {
  base64_doc_img_front?: string;
  base64_doc_img_back?: string;
  base64_face_img_far?: string;
  base64_face_img_near?: string;
  hash_doc_front?: string;
  hash_doc_back?: string;
}

/**
 * Maximum base64 image size in bytes (5MB)
 */
export const MAX_BASE64_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Validation error type
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Validates if a string is a valid base64 encoded string
 *
 * @param str - The string to validate
 * @returns true if the string appears to be valid base64
 */
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== "string") {
    return false;
  }

  // Empty string is not valid base64
  if (str.length === 0) {
    return false;
  }

  // Check if it matches base64 pattern
  // Base64 strings consist of alphanumeric characters, +, /, and = for padding
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;

  // Remove data URL prefix if present (e.g., "data:image/png;base64,")
  const base64Data = str.replace(/^data:[^,]+;base64,/, "");

  // Check length - valid base64 must have length divisible by 4 (after padding)
  if (base64Data.length % 4 !== 0) {
    return false;
  }

  // Check pattern match
  if (!base64Pattern.test(base64Data)) {
    return false;
  }

  // Try to decode to ensure it's actually valid base64
  try {
    if (typeof window !== "undefined" && window.atob) {
      window.atob(base64Data);
    } else if (typeof Buffer !== "undefined") {
      Buffer.from(base64Data, "base64");
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates the size of a base64 encoded string
 * Returns the approximate size in bytes
 *
 * @param base64String - The base64 string to check
 * @returns The size in bytes, or -1 if invalid
 */
export function getBase64Size(base64String: string): number {
  if (!isValidBase64(base64String)) {
    return -1;
  }

  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:[^,]+;base64,/, "");

  // Base64 encoding increases size by ~33%, so we divide by 4/3
  return Math.floor((base64Data.length * 3) / 4);
}

/**
 * Checks if a base64 string exceeds a size limit
 *
 * @param base64String - The base64 string to check
 * @param maxSizeBytes - Maximum size in bytes (default: 5MB)
 * @returns true if the size exceeds the limit
 */
export function isBase64TooLarge(
  base64String: string,
  maxSizeBytes: number = 5 * 1024 * 1024,
): boolean {
  const size = getBase64Size(base64String);
  return size > maxSizeBytes;
}

/**
 * Validates OCR response has minimum required fields
 *
 * @param ocr - The OCR response to validate
 * @returns Validation result with errors
 */
function validateOcrResponse(ocr: OcrResponse | undefined): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!ocr) {
    return {
      isValid: false,
      errors: [
        { field: "ocr", message: "OCR data is missing", code: "MISSING_OCR" },
      ],
      warnings: [],
    };
  }

  // Required fields
  if (!ocr.id || ocr.id.trim() === "") {
    errors.push({
      field: "ocr.id",
      message: "ID number is required",
      code: "MISSING_ID",
    });
  }

  if (!ocr.name || ocr.name.trim() === "") {
    errors.push({
      field: "ocr.name",
      message: "Full name is required",
      code: "MISSING_NAME",
    });
  }

  if (!ocr.birth_day || ocr.birth_day.trim() === "") {
    errors.push({
      field: "ocr.birth_day",
      message: "Date of birth is required",
      code: "MISSING_DOB",
    });
  }

  // Warnings for low confidence
  if (ocr.name_prob !== undefined && ocr.name_prob < 70) {
    warnings.push(`Name confidence is low (${ocr.name_prob}%)`);
  }

  if (ocr.id_fake_prob !== undefined && ocr.id_fake_prob > 30) {
    warnings.push(
      `ID fake detection probability is high (${ocr.id_fake_prob}%)`,
    );
  }

  // Warnings from tampering data
  if (ocr.tampering?.is_legal === "no") {
    warnings.push("Document tampering detected");
    if (ocr.tampering.warning && ocr.tampering.warning.length > 0) {
      warnings.push(...ocr.tampering.warning);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates liveness face response
 *
 * @param livenessFace - The liveness face response to validate
 * @returns Validation result with errors
 */
function validateLivenessFace(
  livenessFace: LivenessFaceResponse | undefined,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!livenessFace) {
    return {
      isValid: false,
      errors: [
        {
          field: "liveness_face",
          message: "Liveness face data is missing",
          code: "MISSING_LIVENESS",
        },
      ],
      warnings: [],
    };
  }

  // Check if liveness check passed
  if (livenessFace.liveness !== "success") {
    errors.push({
      field: "liveness_face.liveness",
      message: `Liveness check failed: ${livenessFace.liveness_msg || "Unknown error"}`,
      code: "LIVENESS_FAILED",
    });
  }

  // Check if face is not masked
  if (livenessFace.blur_face === "yes") {
    warnings.push("Face image appears blurry");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates face comparison response
 *
 * @param compare - The compare face response to validate
 * @returns Validation result with errors
 */
function validateFaceCompare(
  compare: CompareFaceResponse | undefined,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (!compare) {
    return {
      isValid: false,
      errors: [
        {
          field: "compare",
          message: "Face comparison data is missing",
          code: "MISSING_COMPARE",
        },
      ],
      warnings: [],
    };
  }

  // Check if faces match
  if (compare.msg !== "MATCH") {
    errors.push({
      field: "compare.msg",
      message: `Face comparison failed: ${compare.result || "Faces do not match"}`,
      code: "FACE_MISMATCH",
    });
  }

  // Check match score
  const probValue =
    typeof compare.prob === "string"
      ? parseFloat(compare.prob)
      : compare.prob || 0;
  if (probValue < 70) {
    warnings.push(`Face match score is low (${probValue}%)`);
  }

  // Check for multiple faces
  if (compare.multiple_faces === true) {
    warnings.push("Multiple faces detected in image");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that required base64 images are present and valid
 *
 * @param ekycResponse - The eKYC response to validate
 * @returns Validation result with errors
 */
function validateBase64Images(ekycResponse: EkycResponse): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Check for base64 images in extended response
  const extendedResponse = ekycResponse as ExtendedEkycResponse;

  // Check document front image
  if (extendedResponse.base64_doc_img_front) {
    if (!isValidBase64(extendedResponse.base64_doc_img_front)) {
      errors.push({
        field: "base64_doc_img_front",
        message: "Document front image is not valid base64",
        code: "INVALID_BASE64",
      });
    } else if (
      isBase64TooLarge(extendedResponse.base64_doc_img_front, 5 * 1024 * 1024)
    ) {
      warnings.push("Document front image is larger than 5MB");
    }
  }

  // Check document back image
  if (extendedResponse.base64_doc_img_back) {
    if (!isValidBase64(extendedResponse.base64_doc_img_back)) {
      errors.push({
        field: "base64_doc_img_back",
        message: "Document back image is not valid base64",
        code: "INVALID_BASE64",
      });
    } else if (
      isBase64TooLarge(extendedResponse.base64_doc_img_back, 5 * 1024 * 1024)
    ) {
      warnings.push("Document back image is larger than 5MB");
    }
  }

  // Check face images
  if (extendedResponse.base64_face_img_far) {
    if (!isValidBase64(extendedResponse.base64_face_img_far)) {
      errors.push({
        field: "base64_face_img_far",
        message: "Face image (far) is not valid base64",
        code: "INVALID_BASE64",
      });
    }
  }

  if (extendedResponse.base64_face_img_near) {
    if (!isValidBase64(extendedResponse.base64_face_img_near)) {
      errors.push({
        field: "base64_face_img_near",
        message: "Face image (near) is not valid base64",
        code: "INVALID_BASE64",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates eKYC response before submission to backend
 *
 * Performs comprehensive validation including:
 * - Required field presence
 * - OCR data quality
 * - Liveness check results
 * - Face match quality
 * - Base64 image validity
 *
 * @param ekycResponse - The eKYC response to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```ts
 * const result = validateEkycResult(ekycResponse);
 * if (!result.isValid) {
 *   console.error("Validation failed:", result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.warn("Warnings:", result.warnings);
 * }
 * ```
 */
export function validateEkycResult(
  ekycResponse: EkycResponse,
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: string[] = [];

  // Validate document type
  if (!ekycResponse.type_document) {
    allErrors.push({
      field: "type_document",
      message: "Document type is required",
      code: "MISSING_DOC_TYPE",
    });
  }

  // Validate OCR data
  const ocrResult = validateOcrResponse(ekycResponse.ocr);
  allErrors.push(...ocrResult.errors);
  allWarnings.push(...ocrResult.warnings);

  // Validate liveness face
  const livenessResult = validateLivenessFace(ekycResponse.liveness_face);
  allErrors.push(...livenessResult.errors);
  allWarnings.push(...livenessResult.warnings);

  // Validate face comparison
  const compareResult = validateFaceCompare(ekycResponse.compare);
  allErrors.push(...compareResult.errors);
  allWarnings.push(...compareResult.warnings);

  // Validate base64 images if present
  const base64Result = validateBase64Images(ekycResponse);
  allErrors.push(...base64Result.errors);
  allWarnings.push(...base64Result.warnings);

  // Check liveness card responses
  if (ekycResponse.liveness_card_front?.liveness !== "success") {
    allWarnings.push("Document front liveness check did not succeed");
  }

  if (ekycResponse.liveness_card_back?.liveness !== "success") {
    allWarnings.push("Document back liveness check did not succeed");
  }

  // Check masked response
  if (ekycResponse.masked?.masked === "yes") {
    allWarnings.push("Face appears to be masked or covered");
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Formats validation errors into a human-readable message
 *
 * @param result - The validation result
 * @returns Formatted error message
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.isValid) {
    return "Validation passed";
  }

  const errorMessages = result.errors
    .map((e) => `${e.field}: ${e.message}`)
    .join("\n");
  return `Validation failed:\n${errorMessages}`;
}

/**
 * Formats validation warnings into a human-readable message
 *
 * @param result - The validation result
 * @returns Formatted warning message
 */
export function formatValidationWarnings(result: ValidationResult): string {
  if (result.warnings.length === 0) {
    return "";
  }

  return `Warnings:\n${result.warnings.join("\n")}`;
}
