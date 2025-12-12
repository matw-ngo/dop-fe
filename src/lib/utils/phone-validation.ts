import { getLocalizableTelcoByPhoneNumber } from "@/lib/telcos/localizable-telcos";

/**
 * Phone validation result
 */
export interface PhoneValidationResult {
  valid: boolean;
  telco: string;
  telcoCode: string;
  validNum: string;
  originalNumber: string;
  errorMessage?: string;
}

/**
 * Allowed telcos for loan application (using codes)
 */
export const ALLOWED_TELCOS = ["VIETTEL", "MOBIFONE", "VINAPHONE"];

/**
 * Validate Vietnamese phone number for loan application
 * @param phone - Phone number to validate
 * @returns PhoneValidationResult with validation status and telco info
 */
export const phoneValidation = (phone: string): PhoneValidationResult => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Check if phone number is valid (10-11 digits)
  const isValid = /^[0-9]{10,11}$/.test(cleanPhone);

  if (!isValid) {
    return {
      valid: false,
      telco: "",
      telcoCode: "",
      validNum: "",
      originalNumber: phone,
      errorMessage: "INVALID_PHONE",
    };
  }

  // Get telco information
  const telcoInfo = getLocalizableTelcoByPhoneNumber(cleanPhone);
  const telcoCode = telcoInfo?.code || "VIETTEL"; // Default to Viettel for backward compatibility

  // Check if telco is allowed
  const isTelcoAllowed = ALLOWED_TELCOS.includes(telcoCode);

  if (!isTelcoAllowed) {
    return {
      valid: false,
      telco: telcoCode,
      telcoCode: telcoCode,
      validNum: cleanPhone,
      originalNumber: phone,
      errorMessage: "UNSUPPORTED_TELCO",
    };
  }

  return {
    valid: true,
    telco: telcoCode,
    telcoCode: telcoCode,
    validNum: cleanPhone,
    originalNumber: phone,
  };
};

/**
 * Format phone number for display
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const clean = phone.replace(/\D/g, "");

  if (clean.startsWith("84") && clean.length === 11) {
    // International format: +84 XXX XXX XXX
    return `+84 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  } else if (clean.startsWith("0") && clean.length === 10) {
    // Local format: 0XXX XXX XXX
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }

  return phone;
};

/**
 * Sanitize phone number to standard format
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number in local format
 */
export const sanitizePhoneNumber = (phone: string): string => {
  const clean = phone.replace(/\D/g, "");

  if (clean.startsWith("84") && clean.length === 11) {
    // Convert international format to local
    return "0" + clean.slice(2);
  } else if (clean.startsWith("0") && clean.length === 10) {
    // Already in local format
    return clean;
  }

  return clean; // Return as-is if format is unrecognized
};
