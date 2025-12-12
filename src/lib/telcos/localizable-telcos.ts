/**
 * Localizable Vietnamese telecommunications carrier configurations
 * This version supports dynamic localization of names and messages
 */

export interface LocalizableVietnameseTelco {
  code: string;
  prefixes: string[];
  otpLength: 4 | 6;
  maxAttempts: number;
  resendCooldown: number; // seconds
  otpExpiry: number; // seconds
  supportsShortCode: boolean;
  shortCode?: string;
  color: string;
}

export const LOCALIZABLE_VIETNAMESE_TELCOS: Record<
  string,
  LocalizableVietnameseTelco
> = {
  VIETTEL: {
    code: "VIETTEL",
    prefixes: [
      "032",
      "033",
      "034",
      "035",
      "036",
      "037",
      "038",
      "039",
      "096",
      "097",
      "098",
      "086",
      "081",
      "082",
      "083",
      "084",
      "085",
    ],
    otpLength: 4,
    maxAttempts: 3,
    resendCooldown: 60,
    otpExpiry: 300, // 5 minutes
    supportsShortCode: true,
    shortCode: "1221",
    color: "#0033A0",
  },
  MOBIFONE: {
    code: "MOBIFONE",
    prefixes: [
      "090",
      "093",
      "070",
      "079",
      "0120",
      "0121",
      "0122",
      "0126",
      "0128",
      "089",
      "056",
      "058",
      "059",
    ],
    otpLength: 6,
    maxAttempts: 3,
    resendCooldown: 90,
    otpExpiry: 600, // 10 minutes
    supportsShortCode: true,
    shortCode: "9999",
    color: "#FF6600",
  },
  VINAPHONE: {
    code: "VINAPHONE",
    prefixes: [
      "091",
      "094",
      "083",
      "084",
      "085",
      "081",
      "082",
      "088",
      "058",
      "086",
    ],
    otpLength: 6,
    maxAttempts: 3,
    resendCooldown: 90,
    otpExpiry: 600, // 10 minutes
    supportsShortCode: true,
    shortCode: "9191",
    color: "#FF0000",
  },
  VIETNAMOBILE: {
    code: "VIETNAMOBILE",
    prefixes: [
      "092",
      "056",
      "058",
      "032",
      "033",
      "034",
      "035",
      "036",
      "037",
      "038",
      "039",
    ],
    otpLength: 4,
    maxAttempts: 3,
    resendCooldown: 60,
    otpExpiry: 300, // 5 minutes
    supportsShortCode: true,
    shortCode: "789",
    color: "#FFCC00",
  },
  GTEL: {
    code: "GTEL",
    prefixes: [
      "099",
      "059",
      "032",
      "033",
      "034",
      "035",
      "036",
      "037",
      "038",
      "039",
    ],
    otpLength: 4,
    maxAttempts: 3,
    resendCooldown: 60,
    otpExpiry: 300, // 5 minutes
    supportsShortCode: true,
    shortCode: "199",
    color: "#00CC66",
  },
};

/**
 * Get all Vietnamese telco prefixes for validation
 */
export const ALL_VIETNAMESE_PREFIXES = Object.values(
  LOCALIZABLE_VIETNAMESE_TELCOS,
)
  .flatMap((telco) => telco.prefixes)
  .sort((a, b) => b.length - a.length); // Sort by length (longest first)

/**
 * Get telco by phone number prefix
 */
export const getLocalizableTelcoByPhoneNumber = (
  phoneNumber: string,
): LocalizableVietnameseTelco | null => {
  const cleanPhone = phoneNumber.replace(/\D/g, "");

  // Try to match with the clean phone number
  for (const prefix of ALL_VIETNAMESE_PREFIXES) {
    if (cleanPhone.startsWith(prefix)) {
      const telco = Object.values(LOCALIZABLE_VIETNAMESE_TELCOS).find((t) =>
        t.prefixes.includes(prefix),
      );
      if (telco) return telco;
    }
  }

  // Try with international format (+84 -> 0)
  if (cleanPhone.startsWith("84")) {
    const localPhone = "0" + cleanPhone.slice(2);
    return getLocalizableTelcoByPhoneNumber(localPhone);
  }

  return null;
};

/**
 * Get telco by code
 */
export const getLocalizableTelcoByCode = (
  code: string,
): LocalizableVietnameseTelco | null => {
  return LOCALIZABLE_VIETNAMESE_TELCOS[code.toUpperCase()] || null;
};
