/**
 * Vietnamese Document Types Configuration
 * Supports all major Vietnamese identification documents for eKYC
 */

export interface VietnameseDocumentType {
  id: number;
  name: string;
  nameVi: string;
  code: string;
  description: string;
  descriptionVi: string;
  validation: DocumentValidation;
  ocrConfig: OcrConfig;
  security: SecurityFeatures;
  metadata: DocumentMetadata;
}

export interface DocumentValidation {
  idPattern: RegExp;
  idLength: number;
  idChecksum: boolean;
  nameRequired: boolean;
  birthDateRequired: boolean;
  issueDateRequired: boolean;
  expiryDateRequired: boolean;
  provinceCodes: string[];
  addressRequired: boolean;
}

export interface OcrConfig {
  frontRequired: boolean;
  backRequired: boolean;
  supportUpload: boolean;
  supportCamera: boolean;
  qualityThreshold: number;
  edgeDetection: boolean;
  autoCapture: boolean;
  supportedFormats: string[];
}

export interface SecurityFeatures {
  hologramCheck: boolean;
  uvLightCheck: boolean;
  microprintCheck: boolean;
  barcodeCheck: boolean;
  qrCodeCheck: boolean;
  chipCheck: boolean;
  photoIntegrity: boolean;
  antiSpoofing: boolean;
}

export interface DocumentMetadata {
  issuingAuthority: string;
  issuingAuthorityVi: string;
  documentVersion: string;
  validPeriod: number; // years
  renewalRequired: boolean;
  biometricData: boolean;
  machineReadable: boolean;
}

export const VIETNAMESE_DOCUMENT_TYPES: Record<string, VietnameseDocumentType> = {
  CCCD_CHIP: {
    id: 9,
    name: "Chip-based Citizen ID",
    nameVi: "Căn cước công dân gắn chip",
    code: "CCCD_CHIP",
    description: "Vietnamese citizen identity card with embedded chip",
    descriptionVi: "Căn cước công dân Việt Nam gắn chip điện tử",
    validation: {
      idPattern: /^[0-9]{12}$/,
      idLength: 12,
      idChecksum: true,
      nameRequired: true,
      birthDateRequired: true,
      issueDateRequired: true,
      expiryDateRequired: false,
      provinceCodes: [
        "001", "002", "004", "006", "008", "010", "011", "012", "014", "015",
        "016", "018", "020", "022", "024", "025", "026", "027", "030", "031",
        "032", "033", "034", "035", "036", "037", "038", "040", "042", "044",
        "045", "046", "048", "049", "050", "052", "054", "056", "058", "060",
        "062", "064", "066", "067", "068", "070", "072", "074", "075", "076",
        "077", "078", "079", "080", "082", "083", "084", "086", "087", "088",
        "089", "091", "092", "093", "094", "095", "096", "097", "098", "099"
      ],
      addressRequired: true,
    },
    ocrConfig: {
      frontRequired: true,
      backRequired: true,
      supportUpload: true,
      supportCamera: true,
      qualityThreshold: 0.85,
      edgeDetection: true,
      autoCapture: true,
      supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    },
    security: {
      hologramCheck: true,
      uvLightCheck: true,
      microprintCheck: true,
      barcodeCheck: true,
      qrCodeCheck: true,
      chipCheck: true,
      photoIntegrity: true,
      antiSpoofing: true,
    },
    metadata: {
      issuingAuthority: "Ministry of Public Security",
      issuingAuthorityVi: "Bộ Công an",
      documentVersion: "2013-2024",
      validPeriod: 0, // No expiry for citizens under 25
      renewalRequired: false,
      biometricData: true,
      machineReadable: true,
    },
  },
  CCCD_NO_CHIP: {
    id: 1,
    name: "Citizen ID Card",
    nameVi: "Căn cước công dân",
    code: "CCCD",
    description: "Vietnamese citizen identity card without chip",
    descriptionVi: "Căn cước công dân Việt Nam không gắn chip",
    validation: {
      idPattern: /^[0-9]{12}$/,
      idLength: 12,
      idChecksum: true,
      nameRequired: true,
      birthDateRequired: true,
      issueDateRequired: true,
      expiryDateRequired: false,
      provinceCodes: [
        "001", "002", "004", "006", "008", "010", "011", "012", "014", "015",
        "016", "018", "020", "022", "024", "025", "026", "027", "030", "031",
        "032", "033", "034", "035", "036", "037", "038", "040", "042", "044",
        "045", "046", "048", "049", "050", "052", "054", "056", "058", "060",
        "062", "064", "066", "067", "068", "070", "072", "074", "075", "076",
        "077", "078", "079", "080", "082", "083", "084", "086", "087", "088",
        "089", "091", "092", "093", "094", "095", "096", "097", "098", "099"
      ],
      addressRequired: true,
    },
    ocrConfig: {
      frontRequired: true,
      backRequired: true,
      supportUpload: true,
      supportCamera: true,
      qualityThreshold: 0.80,
      edgeDetection: true,
      autoCapture: true,
      supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    },
    security: {
      hologramCheck: true,
      uvLightCheck: false,
      microprintCheck: true,
      barcodeCheck: true,
      qrCodeCheck: false,
      chipCheck: false,
      photoIntegrity: true,
      antiSpoofing: true,
    },
    metadata: {
      issuingAuthority: "Ministry of Public Security",
      issuingAuthorityVi: "Bộ Công an",
      documentVersion: "2013-2021",
      validPeriod: 0, // No expiry for citizens under 25
      renewalRequired: false,
      biometricData: false,
      machineReadable: true,
    },
  },
  CMND_12: {
    id: -1,
    name: "National ID Card (12 digits)",
    nameVi: "Chứng minh thư nhân dân (12 số)",
    code: "CMND12",
    description: "Vietnamese national identity card with 12 digits",
    descriptionVi: "Chứng minh thư nhân dân 12 số Việt Nam",
    validation: {
      idPattern: /^[0-9]{12}$/,
      idLength: 12,
      idChecksum: false,
      nameRequired: true,
      birthDateRequired: true,
      issueDateRequired: true,
      expiryDateRequired: false,
      provinceCodes: [
        "001", "002", "004", "006", "008", "010", "011", "012", "014", "015",
        "016", "018", "020", "022", "024", "025", "026", "027", "030", "031",
        "032", "033", "034", "035", "036", "037", "038", "040", "042", "044",
        "045", "046", "048", "049", "050", "052", "054", "056", "058", "060",
        "062", "064", "066", "067", "068", "070", "072", "074", "075", "076",
        "077", "078", "079", "080", "082", "083", "084", "086", "087", "088",
        "089", "091", "092", "093", "094", "095", "096", "097", "098", "099"
      ],
      addressRequired: true,
    },
    ocrConfig: {
      frontRequired: true,
      backRequired: true,
      supportUpload: true,
      supportCamera: true,
      qualityThreshold: 0.75,
      edgeDetection: true,
      autoCapture: true,
      supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    },
    security: {
      hologramCheck: true,
      uvLightCheck: false,
      microprintCheck: true,
      barcodeCheck: false,
      qrCodeCheck: false,
      chipCheck: false,
      photoIntegrity: true,
      antiSpoofing: true,
    },
    metadata: {
      issuingAuthority: "Ministry of Public Security",
      issuingAuthorityVi: "Bộ Công an",
      documentVersion: "2000-2013",
      validPeriod: 15,
      renewalRequired: true,
      biometricData: false,
      machineReadable: false,
    },
  },
  CMND_9: {
    id: 0,
    name: "National ID Card (9 digits)",
    nameVi: "Chứng minh thư nhân dân (9 số)",
    code: "CMND9",
    description: "Vietnamese national identity card with 9 digits",
    descriptionVi: "Chứng minh thư nhân dân 9 số Việt Nam",
    validation: {
      idPattern: /^[0-9]{9}$/,
      idLength: 9,
      idChecksum: false,
      nameRequired: true,
      birthDateRequired: true,
      issueDateRequired: true,
      expiryDateRequired: false,
      provinceCodes: [
        "001", "002", "004", "006", "008", "010", "011", "012", "014", "015",
        "016", "018", "020", "022", "024", "025", "026", "027", "030", "031",
        "032", "033", "034", "035", "036", "037", "038", "040", "042", "044",
        "045", "046", "048", "049", "050", "052", "054", "056", "058", "060",
        "062", "064", "066", "067", "068", "070", "072", "074", "075", "076",
        "077", "078", "079", "080", "082", "083", "084", "086", "087", "088",
        "089", "091", "092", "093", "094", "095", "096", "097", "098", "099"
      ],
      addressRequired: true,
    },
    ocrConfig: {
      frontRequired: true,
      backRequired: true,
      supportUpload: true,
      supportCamera: true,
      qualityThreshold: 0.70,
      edgeDetection: true,
      autoCapture: true,
      supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    },
    security: {
      hologramCheck: true,
      uvLightCheck: false,
      microprintCheck: false,
      barcodeCheck: false,
      qrCodeCheck: false,
      chipCheck: false,
      photoIntegrity: true,
      antiSpoofing: true,
    },
    metadata: {
      issuingAuthority: "Ministry of Public Security",
      issuingAuthorityVi: "Bộ Công an",
      documentVersion: "1979-2000",
      validPeriod: 15,
      renewalRequired: true,
      biometricData: false,
      machineReadable: false,
    },
  },
  PASSPORT: {
    id: 5,
    name: "Vietnamese Passport",
    nameVi: "Hộ chiếu Việt Nam",
    code: "PASSPORT",
    description: "Vietnamese passport document",
    descriptionVi: "Hộ chiếu公民 Việt Nam",
    validation: {
      idPattern: /^[A-Z0-9]{7,9}$/,
      idLength: 8,
      idChecksum: true,
      nameRequired: true,
      birthDateRequired: true,
      issueDateRequired: true,
      expiryDateRequired: true,
      provinceCodes: [],
      addressRequired: false,
    },
    ocrConfig: {
      frontRequired: true,
      backRequired: false,
      supportUpload: true,
      supportCamera: true,
      qualityThreshold: 0.85,
      edgeDetection: true,
      autoCapture: true,
      supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    },
    security: {
      hologramCheck: true,
      uvLightCheck: true,
      microprintCheck: true,
      barcodeCheck: false,
      qrCodeCheck: false,
      chipCheck: true,
      photoIntegrity: true,
      antiSpoofing: true,
    },
    metadata: {
      issuingAuthority: "Ministry of Foreign Affairs",
      issuingAuthorityVi: "Bộ Ngoại giao",
      documentVersion: "ICAO compliant",
      validPeriod: 10,
      renewalRequired: true,
      biometricData: true,
      machineReadable: true,
    },
  },
  DRIVER_LICENSE: {
    id: 6,
    name: "Vietnamese Driver's License",
    nameVi: "Bằng lái xe Việt Nam",
    code: "DRIVER_LICENSE",
    description: "Vietnamese driver's license document",
    descriptionVi: "Giấy phép lái xe Việt Nam",
    validation: {
      idPattern: /^[0-9]{12}$/,
      idLength: 12,
      idChecksum: false,
      nameRequired: true,
      birthDateRequired: true,
      issueDateRequired: true,
      expiryDateRequired: true,
      provinceCodes: [
        "001", "002", "004", "006", "008", "010", "011", "012", "014", "015",
        "016", "018", "020", "022", "024", "025", "026", "027", "030", "031",
        "032", "033", "034", "035", "036", "037", "038", "040", "042", "044",
        "045", "046", "048", "049", "050", "052", "054", "056", "058", "060",
        "062", "064", "066", "067", "068", "070", "072", "074", "075", "076",
        "077", "078", "079", "080", "082", "083", "084", "086", "087", "088",
        "089", "091", "092", "093", "094", "095", "096", "097", "098", "099"
      ],
      addressRequired: true,
    },
    ocrConfig: {
      frontRequired: true,
      backRequired: true,
      supportUpload: true,
      supportCamera: true,
      qualityThreshold: 0.75,
      edgeDetection: true,
      autoCapture: true,
      supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    },
    security: {
      hologramCheck: true,
      uvLightCheck: false,
      microprintCheck: true,
      barcodeCheck: true,
      qrCodeCheck: false,
      chipCheck: false,
      photoIntegrity: true,
      antiSpoofing: true,
    },
    metadata: {
      issuingAuthority: "Department of Transport",
      issuingAuthorityVi: "Sở Giao thông vận tải",
      documentVersion: "2008-2023",
      validPeriod: 5,
      renewalRequired: true,
      biometricData: false,
      machineReadable: false,
    },
  },
  MILITARY_ID: {
    id: 7,
    name: "Military Identity Card",
    nameVi: "Chứng minh thư quân đội",
    code: "MILITARY_ID",
    description: "Vietnamese military identity card",
    descriptionVi: "Chứng minh thư quân đội Việt Nam",
    validation: {
      idPattern: /^[0-9]{9,12}$/,
      idLength: 12,
      idChecksum: false,
      nameRequired: true,
      birthDateRequired: true,
      issueDateRequired: true,
      expiryDateRequired: false,
      provinceCodes: [],
      addressRequired: false,
    },
    ocrConfig: {
      frontRequired: true,
      backRequired: true,
      supportUpload: true,
      supportCamera: true,
      qualityThreshold: 0.75,
      edgeDetection: true,
      autoCapture: true,
      supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    },
    security: {
      hologramCheck: true,
      uvLightCheck: false,
      microprintCheck: true,
      barcodeCheck: false,
      qrCodeCheck: false,
      chipCheck: false,
      photoIntegrity: true,
      antiSpoofing: true,
    },
    metadata: {
      issuingAuthority: "Ministry of Defence",
      issuingAuthorityVi: "Bộ Quốc phòng",
      documentVersion: "1990-current",
      validPeriod: 15,
      renewalRequired: true,
      biometricData: false,
      machineReadable: false,
    },
  },
  HEALTH_INSURANCE: {
    id: 8,
    name: "Health Insurance Card",
    nameVi: "Thẻ bảo hiểm y tế",
    code: "HEALTH_INSURANCE",
    description: "Vietnamese health insurance card",
    descriptionVi: "Thẻ bảo hiểm y tế Việt Nam",
    validation: {
      idPattern: /^[A-Z0-9]{10,15}$/,
      idLength: 13,
      idChecksum: true,
      nameRequired: true,
      birthDateRequired: true,
      issueDateRequired: false,
      expiryDateRequired: true,
      provinceCodes: [
        "001", "002", "004", "006", "008", "010", "011", "012", "014", "015",
        "016", "018", "020", "022", "024", "025", "026", "027", "030", "031",
        "032", "033", "034", "035", "036", "037", "038", "040", "042", "044",
        "045", "046", "048", "049", "050", "052", "054", "056", "058", "060",
        "062", "064", "066", "067", "068", "070", "072", "074", "075", "076",
        "077", "078", "079", "080", "082", "083", "084", "086", "087", "088",
        "089", "091", "092", "093", "094", "095", "096", "097", "098", "099"
      ],
      addressRequired: false,
    },
    ocrConfig: {
      frontRequired: true,
      backRequired: false,
      supportUpload: true,
      supportCamera: true,
      qualityThreshold: 0.70,
      edgeDetection: true,
      autoCapture: true,
      supportedFormats: ["image/jpeg", "image/png", "image/webp"],
    },
    security: {
      hologramCheck: true,
      uvLightCheck: false,
      microprintCheck: false,
      barcodeCheck: true,
      qrCodeCheck: true,
      chipCheck: false,
      photoIntegrity: false,
      antiSpoofing: false,
    },
    metadata: {
      issuingAuthority: "Vietnam Social Security",
      issuingAuthorityVi: "Bảo hiểm xã hội Việt Nam",
      documentVersion: "2015-current",
      validPeriod: 5,
      renewalRequired: true,
      biometricData: false,
      machineReadable: false,
    },
  },
};

// Updated Vietnamese administrative divisions (2024)
export const PROVINCE_CODES_VIETNAM = {
  // Thủ đô Hà Nội và các tỉnh phía Bắc
  "001": "Thành phố Hà Nội",
  "002": "Tỉnh Hà Giang",
  "004": "Tỉnh Cao Bằng",
  "006": "Tỉnh Bắc Kạn",
  "008": "Tỉnh Tuyên Quang",
  "010": "Tỉnh Lào Cai",
  "011": "Tỉnh Điện Biên",
  "012": "Tỉnh Lai Châu",
  "014": "Tỉnh Sơn La",
  "015": "Tỉnh Hòa Bình",
  "016": "Tỉnh Thái Nguyên",
  "018": "Tỉnh Lạng Sơn",
  "020": "Tỉnh Quảng Ninh",
  "022": "Tỉnh Bắc Giang",
  "024": "Tỉnh Phú Thọ",
  "025": "Tỉnh Vĩnh Phúc",
  "026": "Tỉnh Bắc Ninh",
  "027": "Tỉnh Hải Dương",
  "030": "Thành phố Hải Phòng",
  "031": "Tỉnh Hưng Yên",
  "032": "Tỉnh Thái Bình",
  "033": "Tỉnh Hà Nam",
  "034": "Tỉnh Nam Định",
  "035": "Tỉnh Ninh Bình",
  "036": "Tỉnh Thanh Hóa",
  "037": "Tỉnh Nghệ An",
  "038": "Tỉnh Hà Tĩnh",
  "040": "Tỉnh Quảng Bình",
  "042": "Tỉnh Quảng Trị",
  "044": "Tỉnh Thừa Thiên Huế",

  // Duyên hải Nam Trung Bộ và Tây Nguyên
  "045": "Thành phố Đà Nẵng",
  "046": "Tỉnh Quảng Nam",
  "048": "Tỉnh Quảng Ngãi",
  "049": "Tỉnh Bình Định",
  "050": "Tỉnh Phú Yên",
  "052": "Tỉnh Khánh Hòa",
  "054": "Tỉnh Ninh Thuận",
  "056": "Tỉnh Bình Thuận",
  "058": "Tỉnh Kon Tum",
  "060": "Tỉnh Gia Lai",
  "062": "Tỉnh Đắk Lắk",
  "064": "Tỉnh Đắk Nông",
  "066": "Tỉnh Lâm Đồng",

  // Đông Nam Bộ
  "067": "Tỉnh Bình Phước",
  "068": "Tỉnh Tây Ninh",
  "070": "Tỉnh Bình Dương",
  "072": "Tỉnh Đồng Nai",
  "074": "Tỉnh Bà Rịa - Vũng Tàu",
  "075": "Thành phố Hồ Chí Minh",

  // Đồng bằng sông Cửu Long
  "076": "Tỉnh Long An",
  "077": "Tỉnh Tiền Giang",
  "078": "Tỉnh Bến Tre",
  "079": "Tỉnh Trà Vinh",
  "080": "Tỉnh Vĩnh Long",
  "082": "Tỉnh Đồng Tháp",
  "083": "Tỉnh An Giang",
  "084": "Tỉnh Kiên Giang",
  "086": "Thành phố Cần Thơ",
  "087": "Tỉnh Hậu Giang",
  "088": "Tỉnh Sóc Trăng",
  "089": "Tỉnh Bạc Liêu",
  "091": "Tỉnh Cà Mau",
} as const;

export const getDocumentTypeById = (id: number): VietnameseDocumentType | null => {
  return Object.values(VIETNAMESE_DOCUMENT_TYPES).find(type => type.id === id) || null;
};

export const getDocumentTypeByCode = (code: string): VietnameseDocumentType | null => {
  return Object.values(VIETNAMESE_DOCUMENT_TYPES).find(type => type.code === code) || null;
};

// Enhanced Vietnamese document validation functions
export const validateDocumentId = (id: string, documentType: VietnameseDocumentType): boolean => {
  const pattern = documentType.validation.idPattern;
  return pattern.test(id) && id.length === documentType.validation.idLength;
};

/**
 * Validate Vietnamese ID number with checksum (if applicable)
 */
export const validateVietnameseIdChecksum = (id: string, documentType: VietnameseDocumentType): boolean => {
  if (!documentType.validation.idChecksum) {
    return true; // No checksum required
  }

  // For CCCD (12-digit IDs with checksum)
  if (documentType.validation.idLength === 12 && documentType.validation.idChecksum) {
    return validateCCCDChecksum(id);
  }

  // For older documents without checksum
  return true;
};

/**
 * Validate CCCD 12-digit checksum using Vietnamese government algorithm
 */
export const validateCCCDChecksum = (id: string): boolean => {
  if (id.length !== 12 || !/^\d{12}$/.test(id)) {
    return false;
  }

  // Vietnamese CCCD checksum algorithm
  // The last digit is a checksum calculated from the first 11 digits
  const digits = id.split('').map(Number);
  const checkDigit = digits[11];

  // Calculate checksum using weights 2,3,4,5,6,7,8,9,1,2,3 for first 11 digits
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }

  const calculatedCheckDigit = (11 - (sum % 11)) % 10;

  return calculatedCheckDigit === checkDigit;
};

/**
 * Validate province code in Vietnamese document
 */
export const validateProvinceCode = (id: string, documentType: VietnameseDocumentType): boolean => {
  // Extract province code from ID (first 3 digits for most documents)
  let provinceCode: string;

  if (documentType.validation.idLength === 9) {
    // 9-digit CMND: first 2 digits for older format
    provinceCode = id.substring(0, 2).padStart(3, '0');
  } else {
    // 12-digit CCCD/CMND: first 3 digits
    provinceCode = id.substring(0, 3);
  }

  return documentType.validation.provinceCodes.includes(provinceCode);
};

/**
 * Get province name from code
 */
export const getProvinceName = (code: string): string => {
  return PROVINCE_CODES_VIETNAM[code as keyof typeof PROVINCE_CODES_VIETNAM] || code;
};

/**
 * Validate document date (issue/expiry) for Vietnamese documents
 */
export const validateVietnameseDocumentDate = (
  dateString: string,
  type: 'issue' | 'expiry',
  documentType: VietnameseDocumentType
): { valid: boolean; message?: string } => {
  if (!dateString) {
    if (type === 'issue' && documentType.validation.issueDateRequired) {
      return { valid: false, message: 'Ngày cấp không được để trống' };
    }
    if (type === 'expiry' && documentType.validation.expiryDateRequired) {
      return { valid: false, message: 'Ngày hết hạn không được để trống' };
    }
    return { valid: true };
  }

  // Parse Vietnamese date format (DD/MM/YYYY or DD-MM-YYYY)
  const dateRegex = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
  const match = dateString.match(dateRegex);

  if (!match) {
    return { valid: false, message: 'Định dạng ngày không hợp lệ. Sử dụng DD/MM/YYYY hoặc DD-MM-YYYY' };
  }

  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);

  // Validate date components
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return { valid: false, message: 'Ngày không hợp lệ' };
  }

  // Validate date range
  const now = new Date();
  const minDate = new Date(1900, 0, 1); // 01/01/1900
  const maxDate = new Date(2100, 11, 31); // 31/12/2100

  if (date < minDate || date > maxDate) {
    return { valid: false, message: 'Ngày nằm ngoài phạm vi hợp lệ' };
  }

  // Specific validations
  if (type === 'issue') {
    // Issue date cannot be in the future
    if (date > now) {
      return { valid: false, message: 'Ngày cấp không thể là ngày trong tương lai' };
    }

    // Document-specific issue date validations
    switch (documentType.code) {
      case 'CMND9':
        // 9-digit CMND issued before 2016
        if (year > 2016) {
          return { valid: false, message: 'CMND 9 số được cấp trước năm 2016' };
        }
        break;

      case 'CMND12':
        // 12-digit CMND issued between 2016-2021
        if (year < 2016 || year > 2021) {
          return { valid: false, message: 'CMND 12 số được cấp từ 2016-2021' };
        }
        break;

      case 'CCCD':
      case 'CCCD_CHIP':
        // CCCD issued from 2016 onwards
        if (year < 2016) {
          return { valid: false, message: 'CCCD được cấp từ năm 2016' };
        }
        break;
    }

  } else if (type === 'expiry') {
    // Expiry date must be in the future for documents that expire
    if (documentType.validation.expiryDateRequired && date <= now) {
      return { valid: false, message: 'Tài liệu đã hết hạn' };
    }
  }

  return { valid: true };
};

/**
 * Comprehensive Vietnamese document validation
 */
export const validateVietnameseDocument = (
  id: string,
  documentType: VietnameseDocumentType,
  options?: {
    issueDate?: string;
    expiryDate?: string;
    name?: string;
    birthDate?: string;
  }
): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic ID validation
  if (!validateDocumentId(id, documentType)) {
    errors.push(`Số định danh không hợp lệ cho ${documentType.nameVi}`);
  }

  // Checksum validation
  if (!validateVietnameseIdChecksum(id, documentType)) {
    errors.push('Mã kiểm tra số định danh không hợp lệ');
  }

  // Province code validation
  if (!validateProvinceCode(id, documentType)) {
    errors.push('Mã tỉnh/thành phố không hợp lệ');
  }

  // Issue date validation
  if (options?.issueDate) {
    const issueValidation = validateVietnameseDocumentDate(
      options.issueDate,
      'issue',
      documentType
    );
    if (!issueValidation.valid) {
      errors.push(issueValidation.message || 'Ngày cấp không hợp lệ');
    }
  }

  // Expiry date validation
  if (options?.expiryDate) {
    const expiryValidation = validateVietnameseDocumentDate(
      options.expiryDate,
      'expiry',
      documentType
    );
    if (!expiryValidation.valid) {
      errors.push(expiryValidation.message || 'Ngày hết hạn không hợp lệ');
    }
  }

  // Birth date validation (if provided)
  if (options?.birthDate && documentType.validation.birthDateRequired) {
    const birthValidation = validateVietnameseDocumentDate(
      options.birthDate,
      'issue', // Use issue validation logic
      documentType
    );
    if (!birthValidation.valid) {
      errors.push('Ngày sinh không hợp lệ');
    }

    // Check reasonable age range
    const birthDate = new Date(options.birthDate.replace(/[\/\-]/g, '/'));
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();

    if (age < 14 || age > 120) {
      warnings.push('Độ tuổi không hợp lệ cho cấp giấy tờ');
    }
  }

  // Name validation (if provided)
  if (options?.name && documentType.validation.nameRequired) {
    if (!options.name.trim() || options.name.length < 2) {
      errors.push('Họ và tên không được để trống');
    }

    // Check for Vietnamese characters
    const vietnameseNameRegex = /^[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÔĐƠƯ\s']+$/;
    if (!vietnameseNameRegex.test(options.name)) {
      warnings.push('Họ và tên có thể chứa ký tự không phải tiếng Việt');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Extract information from Vietnamese ID number
 */
export const extractVietnameseIdInfo = (id: string): {
  provinceCode?: string;
  provinceName?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthYear?: number;
  documentType?: string;
} => {
  const info: any = {};

  if (id.length >= 3) {
    // Extract province code
    const provinceCode = id.substring(0, 3);
    info.provinceCode = provinceCode;
    info.provinceName = getProvinceName(provinceCode);

    // Determine gender and birth year for newer IDs
    if (id.length === 12) {
      const centuryDigit = parseInt(id[3]);
      const birthYearDigits = parseInt(id.substring(4, 6));

      // Gender determination: odd = male, even = female
      info.gender = centuryDigit % 2 === 1 ? 'male' : 'female';

      // Century determination
      let century: number;
      if (centuryDigit === 0) century = 1900;
      else if (centuryDigit === 1) century = 2000;
      else if (centuryDigit === 2) century = 2100;
      else if (centuryDigit === 3) century = 2200;
      else century = 1900; // Default for unknown

      info.birthYear = century + birthYearDigits;

      // Determine document type
      if (info.birthYear >= 2016) {
        info.documentType = 'CCCD/CMCD 12 số';
      } else {
        info.documentType = 'CMND 12 số';
      }
    } else if (id.length === 9) {
      info.documentType = 'CMND 9 số';
    }
  }

  return info;
};