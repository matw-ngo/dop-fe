import { ALLOWED_TELCOS, phoneValidation } from "@/lib/utils/phone-validation";
import type { PhoneValidationResult } from "../types";

// Telco mapping for better display names
const TELCO_NAMES: Record<string, string> = {
  VIETTEL: "Viettel",
  MOBIFONE: "Mobifone",
  VINAPHONE: "Vinaphone",
  VNMOBI: "VNMOBI",
  "I-TEL": "I-TEL",
};

// Enhanced phone validation with better error messages
export const validatePhoneNumber = (
  phoneNumber: string,
): PhoneValidationResult => {
  // Check if phone number is empty
  if (!phoneNumber || !phoneNumber.trim()) {
    return {
      valid: false,
      error: "Phone number is required",
    };
  }

  // Remove any spaces or special characters
  const cleanedNumber = phoneNumber.replace(/\s+/g, "");

  // Check if it's a valid format
  if (isNaN(parseInt(cleanedNumber, 10))) {
    return {
      valid: false,
      error: "Phone number must contain only digits",
    };
  }

  // Use existing phone validation
  const validation = phoneValidation(cleanedNumber);

  if (!validation.valid) {
    return {
      valid: false,
      error: "Invalid phone number format",
    };
  }

  // Check if telco is supported
  if (!ALLOWED_TELCOS.includes(validation.telco)) {
    const telcoList = ALLOWED_TELCOS.map(
      (telco) => TELCO_NAMES[telco] || telco,
    ).join(", ");
    return {
      valid: false,
      error: `Your telecom provider is not supported. Supported providers: ${telcoList}`,
    };
  }

  return {
    valid: true,
    normalizedNumber: validation.validNum,
    telco: validation.telco,
    telcoName: TELCO_NAMES[validation.telco] || validation.telco,
  };
};

// Format phone number for display
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";

  // If already formatted, return as is
  if (phoneNumber.includes("-")) return phoneNumber;

  // Format as 0xxx-xxx-xxx for better readability
  if (phoneNumber.length === 10 && phoneNumber.startsWith("0")) {
    return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
  }

  return phoneNumber;
};

// Check if phone number is from a supported telco
export const isSupportedTelco = (phoneNumber: string): boolean => {
  const validation = validatePhoneNumber(phoneNumber);
  return validation.valid;
};

// Get telco name from phone number
export const getTelcoName = (phoneNumber: string): string | null => {
  const validation = validatePhoneNumber(phoneNumber);
  return validation.valid ? validation.telcoName || validation.telco : null;
};
