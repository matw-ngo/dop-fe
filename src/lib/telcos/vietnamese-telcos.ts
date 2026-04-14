/**
 * Vietnamese telecommunications carrier configurations
 * Supports Viettel, Mobifone, Vinaphone, Vietnamobile, and Gmobile
 */

export interface VietnameseTelco {
  name: string;
  code: string;
  prefixes: string[];
  otpLength: 4 | 6;
  maxAttempts: number;
  resendCooldown: number; // seconds
  otpExpiry: number; // seconds
  supportsShortCode: boolean;
  shortCode?: string;
  color: string;
  displayName: string;
}

export const VIETNAMESE_TELCOS: Record<string, VietnameseTelco> = {
  VIETTEL: {
    name: "Viettel",
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
    displayName: "Viettel",
  },
  MOBIFONE: {
    name: "Mobifone",
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
    displayName: "Mobifone",
  },
  VINAPHONE: {
    name: "Vinaphone",
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
    displayName: "Vinaphone",
  },
  VIETNAMOBILE: {
    name: "Vietnamobile",
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
    displayName: "Vietnamobile",
  },
  GTEL: {
    name: "Gmobile",
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
    displayName: "Gmobile",
  },
  // Virtual Network Operators (MVNOs)
  ITEL: {
    name: "Itelecom",
    code: "ITEL",
    prefixes: ["087", "032", "033", "034", "035", "036", "037", "038", "039"],
    otpLength: 4,
    maxAttempts: 3,
    resendCooldown: 90,
    otpExpiry: 300,
    supportsShortCode: false,
    color: "#FFB900",
    displayName: "Itelecom (Itel)",
  },
  REDDI: {
    name: "Reddi",
    code: "REDDI",
    prefixes: ["055", "032", "033", "034", "035", "036", "037", "038", "039"],
    otpLength: 6,
    maxAttempts: 3,
    resendCooldown: 90,
    otpExpiry: 600,
    supportsShortCode: false,
    color: "#E74C3C",
    displayName: "Reddi",
  },
  LAMONGMOBILE: {
    name: "Lao Dong Mobile",
    code: "LAMONGMOBILE",
    prefixes: ["056", "032", "033", "034", "035", "036", "037", "038", "039"],
    otpLength: 6,
    maxAttempts: 3,
    resendCooldown: 90,
    otpExpiry: 600,
    supportsShortCode: false,
    color: "#FF5722",
    displayName: "Lao Dong Mobile",
  },
  // Additional prefixes for number porting and new allocations
  SFONE: {
    name: "S-Fone",
    code: "SFONE",
    prefixes: ["095", "032", "033", "034", "035", "036", "037", "038", "039"],
    otpLength: 6,
    maxAttempts: 3,
    resendCooldown: 90,
    otpExpiry: 600,
    supportsShortCode: false,
    color: "#9C27B0",
    displayName: "S-Fone (Legacy)",
  },
};

/**
 * Get all Vietnamese telco prefixes for validation
 */
export const ALL_VIETNAMESE_PREFIXES = Object.values(VIETNAMESE_TELCOS)
  .flatMap((telco) => telco.prefixes)
  .sort((a, b) => b.length - a.length); // Sort by length (longest first)

/**
 * Get telco by phone number prefix
 */
export const getTelcoByPhoneNumber = (
  phoneNumber: string,
): VietnameseTelco | null => {
  const cleanPhone = phoneNumber.replace(/\D/g, "");

  // Try to match with the clean phone number
  for (const prefix of ALL_VIETNAMESE_PREFIXES) {
    if (cleanPhone.startsWith(prefix)) {
      const telco = Object.values(VIETNAMESE_TELCOS).find((t) =>
        t.prefixes.includes(prefix),
      );
      if (telco) return telco;
    }
  }

  // Try with international format (+84 -> 0)
  if (cleanPhone.startsWith("84")) {
    const localPhone = `0${cleanPhone.slice(2)}`;
    return getTelcoByPhoneNumber(localPhone);
  }

  return null;
};

/**
 * Get telco by code
 */
export const getTelcoByCode = (code: string): VietnameseTelco | null => {
  return VIETNAMESE_TELCOS[code.toUpperCase()] || null;
};

/**
 * Get all telcos sorted by popularity/usage
 */
export const getAllTelcos = (): VietnameseTelco[] => {
  return [
    VIETNAMESE_TELCOS.VIETTEL,
    VIETNAMESE_TELCOS.MOBIFONE,
    VIETNAMESE_TELCOS.VINAPHONE,
    VIETNAMESE_TELCOS.VIETNAMOBILE,
    VIETNAMESE_TELCOS.GTEL,
  ];
};

/**
 * Get telco-specific settings for OTP
 */
export const getOTPSettings = (phoneNumber: string) => {
  const telco = getTelcoByPhoneNumber(phoneNumber);

  return {
    telco,
    otpLength: telco?.otpLength || 6,
    maxAttempts: telco?.maxAttempts || 3,
    resendCooldown: telco?.resendCooldown || 90,
    otpExpiry: telco?.otpExpiry || 600,
    supportsShortCode: telco?.supportsShortCode || false,
    shortCode: telco?.shortCode,
    color: telco?.color || "#666666",
    displayName: telco?.displayName || "Unknown Telco",
  };
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const clean = phoneNumber.replace(/\D/g, "");

  if (clean.startsWith("84")) {
    // International format: +84 XXX XXX XXX
    return `+84 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  } else if (clean.startsWith("0")) {
    // Local format: 0XXX XXX XXX
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }

  return phoneNumber;
};

/**
 * Validate if phone number belongs to a Vietnamese telco
 */
export const isValidVietnamesePhoneNumber = (phoneNumber: string): boolean => {
  const clean = phoneNumber.replace(/\D/g, "");

  // Check if it starts with Vietnamese country code or local prefix
  if (clean.startsWith("84")) {
    const localNumber = `0${clean.slice(2)}`;
    return getTelcoByPhoneNumber(localNumber) !== null;
  } else if (clean.startsWith("0")) {
    return getTelcoByPhoneNumber(clean) !== null;
  }

  return false;
};

/**
 * Sanitize phone number to standard format
 */
export const sanitizePhoneNumber = (phoneNumber: string): string => {
  const clean = phoneNumber.replace(/\D/g, "");

  if (clean.startsWith("84") && clean.length === 11) {
    // Convert to local format
    return `0${clean.slice(2)}`;
  } else if (clean.startsWith("0") && clean.length === 10) {
    // Already in local format
    return clean;
  }

  return clean; // Return as-is if format is unrecognized
};

/**
 * Get OTP validation regex pattern for specific telco
 */
export const getOTPPattern = (phoneNumber: string): RegExp => {
  const { otpLength } = getOTPSettings(phoneNumber);
  return new RegExp(`^\\d{${otpLength}}$`);
};

/**
 * Number porting database - tracks numbers that have been ported between telcos
 */
export const NUMBER_PORTING_DB = new Map<string, string>();

/**
 * Vietnamese regulatory compliance settings
 */
export const VIETNAM_REGULATORY = {
  // Legal framework
  LEGAL_FRAMEWORK: {
    DECREE_91_2020_ND_CP: "Decree 91/2020/ND-CP on telecom services",
    CIRCULAR_30_2021_TT_BTTTT: "Circular 30/2021/TT-BTTTT on OTP services",
    DATA_PROTECTION_LAW: "Law on Cyber Information Security 2018",
    CONSUMER_PROTECTION_LAW: "Law on Protection of Consumer Rights 2010",
  },

  // Data privacy requirements
  DATA_PRIVACY: {
    CONSENT_REQUIRED: true,
    DATA_RETENTION_DAYS: 365,
    ENCRYPTION_REQUIRED: true,
    AUDIT_LOG_RETENTION_DAYS: 1825, // 5 years
    CROSS_BORDER_TRANSFER_RESTRICTED: true,
    USER_RIGHTS: ["access", "correction", "deletion", "portability"],
  },

  // Emergency numbers (exempt from some restrictions)
  EMERGENCY_NUMBERS: ["113", "114", "115", "116", "117", "118", "119"],

  // OTP service requirements
  OTP_REQUIREMENTS: {
    MAX_OTP_PER_DAY_PER_USER: 10,
    MAX_OTP_PER_HOUR_PER_IP: 20,
    MIN_OTP_LENGTH: 4,
    MAX_OTP_LENGTH: 6,
    OTP_EXPIRY_MAX_SECONDS: 1800, // 30 minutes
    RATE_LIMITING_REQUIRED: true,
    TWO_FACTOR_AUTH_REQUIRED: true,
  },
};

/**
 * Check if phone number has been ported and return the current telco
 */
export const checkNumberPorting = (phoneNumber: string): string | null => {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  if (cleanPhone.length === 10 && cleanPhone.startsWith("0")) {
    return NUMBER_PORTING_DB.get(cleanPhone) || null;
  }
  return null;
};

/**
 * Add number porting record
 */
export const addNumberPortingRecord = (
  phoneNumber: string,
  newTelcoCode: string,
): void => {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  if (cleanPhone.length === 10 && cleanPhone.startsWith("0")) {
    NUMBER_PORTING_DB.set(cleanPhone, newTelcoCode);
  }
};

/**
 * Get telco by phone number with number porting support
 */
export const getTelcoByPhoneNumberWithPorting = (
  phoneNumber: string,
): VietnameseTelco | null => {
  const telco = getTelcoByPhoneNumber(phoneNumber);
  const portedTelcoCode = checkNumberPorting(phoneNumber);

  if (portedTelcoCode && VIETNAMESE_TELCOS[portedTelcoCode]) {
    return VIETNAMESE_TELCOS[portedTelcoCode];
  }

  return telco;
};

/**
 * Validate Vietnamese regulatory compliance for OTP services
 */
export const validateRegulatoryCompliance = (
  phoneNumber: string,
  otpAttempts: number,
  lastOtpTime?: number,
): {
  compliant: boolean;
  violations: string[];
  recommendations: string[];
} => {
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Check emergency number exemptions
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  if (VIETNAM_REGULATORY.EMERGENCY_NUMBERS.includes(cleanPhone)) {
    return {
      compliant: true,
      violations: [],
      recommendations: ["Emergency number - special handling required"],
    };
  }

  // Check OTP rate limits
  if (
    otpAttempts > VIETNAM_REGULATORY.OTP_REQUIREMENTS.MAX_OTP_PER_DAY_PER_USER
  ) {
    violations.push(
      `Daily OTP limit exceeded: ${otpAttempts}/${VIETNAM_REGULATORY.OTP_REQUIREMENTS.MAX_OTP_PER_DAY_PER_USER}`,
    );
  }

  // Check minimum time between OTPs
  if (lastOtpTime) {
    const timeSinceLastOtp = Date.now() - lastOtpTime;
    if (timeSinceLastOtp < 30000) {
      // 30 seconds
      violations.push(
        "OTP requests too frequent - minimum 30 seconds required",
      );
    }
  }

  // Validate phone number format for Vietnamese regulations
  if (!isValidVietnamesePhoneNumber(phoneNumber)) {
    violations.push(
      "Phone number does not comply with Vietnamese numbering plan",
    );
  }

  // Check for Vietnamese telco support
  const telco = getTelcoByPhoneNumberWithPorting(phoneNumber);
  if (!telco) {
    violations.push(
      "Phone number not associated with licensed Vietnamese telecom provider",
    );
  }

  // Recommendations
  if (
    otpAttempts >
    VIETNAM_REGULATORY.OTP_REQUIREMENTS.MAX_OTP_PER_DAY_PER_USER * 0.7
  ) {
    recommendations.push(
      "Approaching daily OTP limit - consider alternative authentication",
    );
  }

  if (!telco?.supportsShortCode) {
    recommendations.push("Consider using full-length SMS for this provider");
  }

  return {
    compliant: violations.length === 0,
    violations,
    recommendations,
  };
};

/**
 * Get compliance report for audit purposes
 */
export const getComplianceReport = (
  phoneNumber: string,
): {
  phoneNumber: string;
  telco: string;
  supportsOTP: boolean;
  isVietnameseProvider: boolean;
  regulatoryFramework: string[];
  dataPrivacyNotes: string[];
  recommendations: string[];
} => {
  const telco = getTelcoByPhoneNumberWithPorting(phoneNumber);
  const compliance = validateRegulatoryCompliance(phoneNumber, 0);

  return {
    phoneNumber,
    telco: telco?.name || "Unknown",
    supportsOTP: !!telco,
    isVietnameseProvider: !!telco,
    regulatoryFramework: Object.values(VIETNAM_REGULATORY.LEGAL_FRAMEWORK),
    dataPrivacyNotes: [
      `Data retention: ${VIETNAM_REGULATORY.DATA_PRIVACY.DATA_RETENTION_DAYS} days`,
      `Encryption required: ${VIETNAM_REGULATORY.DATA_PRIVACY.ENCRYPTION_REQUIRED}`,
      `User consent required: ${VIETNAM_REGULATORY.DATA_PRIVACY.CONSENT_REQUIRED}`,
      `Audit log retention: ${VIETNAM_REGULATORY.DATA_PRIVACY.AUDIT_LOG_RETENTION_DAYS} days`,
    ],
    recommendations: [
      ...compliance.recommendations,
      telco
        ? `Use ${telco.displayName} short code: ${telco.shortCode}`
        : "No supported telco detected",
      "Ensure proper user consent for OTP services",
      "Maintain audit logs for regulatory compliance",
    ],
  };
};

/**
 * Enhanced telco-specific error messages with compliance information
 */
export const TELCO_ERROR_MESSAGES = {
  INVALID_PHONE:
    "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam.",
  UNSUPPORTED_TELCO:
    "Nhà mạng không được hỗ trợ. Vui lòng sử dụng số điện thoại của các nhà mạng được cấp phép tại Việt Nam.",
  INVALID_OTP_LENGTH: "Mã OTP không đúng độ dài. Vui lòng kiểm tra lại.",
  OTP_EXPIRED: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
  MAX_ATTEMPTS_EXCEEDED:
    "Bạn đã nhập sai mã OTP quá số lần cho phép. Vui lòng thử lại sau.",
  RESEND_COOLDOWN: "Vui lòng đợi {{seconds}} giây trước khi gửi lại mã OTP.",
  NETWORK_ERROR: "Lỗi kết nối. Vui lòng kiểm tra lại kết nối mạng và thử lại.",
  INVALID_OTP: "Mã OTP không chính xác. Vui lòng nhập lại.",
  RATE_LIMIT_EXCEEDED: "Quá số lần yêu cầu cho phép. Vui lòng thử lại sau.",
  COMPLIANCE_VIOLATION:
    "Yêu cầu không tuân thủ quy định của Bộ Thông tin và Truyền thông.",
  DATA_PRIVACY_CONCERN:
    "Quyền riêng tư dữ liệu không được đảm bảo. Vui lòng liên hệ hỗ trợ.",
  REGULATORY_RESTRICTION: "Giới hạn theo quy định pháp luật Việt Nam.",
  PORTED_NUMBER_DETECTED:
    "Số điện thoại đã chuyển mạng. Vui lòng xác thực với nhà mạng mới.",
  EMERGENCY_NUMBER_BLOCKED: "Không hỗ trợ OTP cho số điện thoại khẩn cấp.",
};

export default VIETNAMESE_TELCOS;
