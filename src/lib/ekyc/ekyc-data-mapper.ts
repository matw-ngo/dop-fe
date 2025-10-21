/**
 * eKYC Data Mapper - Transform eKYC result to form data
 *
 * Maps OCR data from VNPT eKYC SDK to onboarding form fields
 */

export interface EkycOcrData {
  // Thông tin cơ bản
  id: string; // Số CMND/CCCD
  name: string; // Họ và tên
  birth_day: string; // Ngày sinh (DD/MM/YYYY)
  gender?: string; // Giới tính: "Nam" / "Nữ"
  nationality?: string; // Quốc tịch: "Việt Nam"

  // Địa chỉ
  origin_location?: string; // Quê quán
  recent_location?: string; // Nơi ở hiện tại (có thể chứa \n)
  address?: string; // Địa chỉ (alternative field)

  // Thông tin giấy tờ
  card_type?: string; // "CĂN CƯỚC CÔNG DÂN"
  type_id?: number; // 5 = CCCD mới
  issue_date?: string; // Ngày cấp (DD/MM/YYYY)
  valid_date?: string; // Hiệu lực đến (DD/MM/YYYY)
  issue_place?: string; // Nơi cấp (có thể chứa \n)

  // Mã QR và MRZ
  mrz?: string[]; // Mảng 3 dòng MRZ
  dict_qr?: Record<string, any>; // Dữ liệu từ QR code
  match_qr?: Record<string, any>;

  // Post code / Địa chỉ chi tiết
  post_code?: Array<{
    debug?: string;
    city: [string, string, number]; // [code, name, confidence]
    district: [string, string, number];
    ward: [string, string, number];
    detail: string;
    type: "address" | "hometown";
  }>;
  new_post_code?: Array<{
    city: [string, string, number];
    district: [string, string, number];
    ward: [string, string, number];
    detail: string;
    type: "address" | "hometown";
  }>;

  // Chất lượng và kiểm tra
  quality_front?: {
    blur_score: number;
    luminance_score: number;
    bright_spot_score: number;
    resolution: [number, number];
    bright_spot_param: Record<string, any>;
    final_result: Record<string, string>;
  };
  quality_back?: {
    blur_score: number;
    luminance_score: number;
    bright_spot_score: number;
    resolution: [number, number];
    bright_spot_param: Record<string, any>;
    final_result: Record<string, string>;
  };

  checking_result_front?: {
    corner_cut_result: string;
    corner_cut_prob: number[];
    edited_result: string;
    edited_prob: number;
    recaptured_result: string;
    recaptured_prob: number;
    check_photocopied_result: string;
    check_photocopied_prob: number;
  };
  checking_result_back?: {
    corner_cut_result: string;
    corner_cut_prob: number[];
    edited_result: string;
    edited_prob: number;
    recaptured_result: string;
    recaptured_prob: number;
    check_photocopied_result: string;
    check_photocopied_prob: number;
  };

  // Cảnh báo và kiểm tra
  corner_warning?: string; // "yes" / "no"
  back_corner_warning?: string;
  expire_warning?: string;
  back_expire_warning?: string;
  id_fake_warning?: string;
  dob_fake_warning?: boolean;
  name_fake_warning?: string; // "real" / "fake"
  address_fake_warning?: boolean;
  issuedate_fake_warning?: boolean;
  dupplication_warning?: boolean;
  general_warning?: string[];

  // Xác suất (probability scores)
  name_prob?: number;
  name_probs?: number[]; // Xác suất từng ký tự
  birth_day_prob?: number;
  issue_date_prob?: number;
  issue_date_probs?: number[];
  valid_date_prob?: number;
  origin_location_prob?: number;
  recent_location_prob?: number;
  place_birth_prob?: number;
  issue_place_prob?: number;
  citizen_id_prob?: number;
  mrz_prob?: number;
  mrz_probs?: number[];
  mrz_valid_score?: number;
  features_prob?: number;
  id_probs?: string; // JSON string: "[1.0, 1.0, ...]"
  id_fake_prob?: number;
  name_fake_warning_prob?: number;
  dob_fake_warning_prob?: number;
  cover_prob_front?: number;

  // So khớp mặt trước và sau
  match_front_back?: {
    match_name: string; // "yes" / "no"
    match_sex: string;
    match_bod: string;
    match_id: string;
    match_valid_date: string;
  };

  // Thông tin khác
  features?: string; // Đặc điểm nhận dạng
  nation_policy?: string; // "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
  citizen_id?: string; // CMND (nếu có)
  back_type_id?: number;
  msg?: string; // "OK"
  msg_back?: string;

  // Lại có thể có các field khác tùy version SDK
  [key: string]: any;
}

export interface EkycLivenessFaceData {
  multiple_faces_details?: {
    multiple_face_1: boolean;
    multiple_face_2: boolean;
  };
  gender?: string; // "Nam" hoặc "Nữ"
  blur_face?: string; // "yes" hoặc "no"
  liveness: string; // "success" hoặc "fail"
  liveness_msg?: string; // "Người thật" hoặc "Giấy tờ thật"
  is_eye_open?: string; // "yes" hoặc "no"
  age?: number;
  blur_face_score?: number;
  liveness_prob?: number;
  background_warning?: string; // "yes" hoặc "no"
  multiple_faces?: boolean;
  [key: string]: any;
}

export interface EkycCompareData {
  result: string; // "Khuôn mặt khớp XX%" (message string, NOT boolean!)
  msg: string; // "MATCH" hoặc "NOT_MATCH"
  prob: number; // similarity score (0-100)
  match_warning?: string; // "yes" hoặc "no"
  multiple_faces_details?: {
    multiple_face_1: boolean;
    multiple_face_2: boolean;
  };
  multiple_faces?: boolean;
  [key: string]: any;
}

export interface EkycFullResult {
  code?: number; // 0 = success
  message?: string;
  data?: any;
  type_document: number; // -1: CMND, 5: Passport, etc.
  ocr: {
    object: EkycOcrData; // OCR data nằm trong ocr.object theo thực tế
    [key: string]: any;
  };
  liveness_face?: {
    object: EkycLivenessFaceData;
    [key: string]: any;
  };
  compare?: {
    object: EkycCompareData;
    [key: string]: any;
  };
  [key: string]: any; // Allow other fields
}

export interface OnboardingFormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO format: YYYY-MM-DD
  gender: "male" | "female" | "other";
  address: string;
  city: string;
  occupation: string;
  monthlyIncome: string;
}

/**
 * Convert DD/MM/YYYY to YYYY-MM-DD (ISO format for date input)
 */
export function convertVietnameseDateToISO(vietnameseDate: string): string {
  if (!vietnameseDate) return "";

  // Handle format: DD/MM/YYYY
  const parts = vietnameseDate.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return vietnameseDate; // Return as-is if format is unexpected
}

/**
 * Map gender from Vietnamese to form value
 */
export function mapGenderFromVietnamese(
  vietnameseSex: string,
): "male" | "female" | "other" {
  const normalized = vietnameseSex?.toLowerCase().trim();

  if (normalized === "nam" || normalized === "male" || normalized === "m") {
    return "male";
  }
  if (
    normalized === "nữ" ||
    normalized === "nu" ||
    normalized === "female" ||
    normalized === "f"
  ) {
    return "female";
  }

  return "other";
}

/**
 * Extract city from address string
 * Try to match common Vietnamese city names
 */
export function extractCityFromAddress(address: string): string {
  if (!address) return "";

  const cityMap: Record<string, string> = {
    "hà nội": "hanoi",
    "ha noi": "hanoi",
    hanoi: "hanoi",
    "hồ chí minh": "hcm",
    "ho chi minh": "hcm",
    hcm: "hcm",
    "sài gòn": "hcm",
    saigon: "hcm",
    "đà nẵng": "danang",
    "da nang": "danang",
    danang: "danang",
    "hải phòng": "haiphong",
    "hai phong": "haiphong",
    haiphong: "haiphong",
    "cần thơ": "cantho",
    "can tho": "cantho",
    cantho: "cantho",
  };

  const normalizedAddress = address.toLowerCase();

  for (const [cityName, cityValue] of Object.entries(cityMap)) {
    if (normalizedAddress.includes(cityName)) {
      return cityValue;
    }
  }

  return ""; // Let user select manually if not found
}

/**
 * Map eKYC OCR result to onboarding form data
 *
 * @param ekycResult - Full eKYC result from SDK
 * @returns Partial form data that can be merged with form state
 */
export function mapEkycToFormData(
  ekycResult: EkycFullResult,
): Partial<OnboardingFormData> {
  console.log("[eKYC Mapper] Raw eKYC result:", ekycResult);

  // OCR data nằm trong ocr.object theo cấu trúc thực tế
  const ocrData = ekycResult?.ocr?.object || ekycResult?.ocr;

  if (!ocrData) {
    console.warn("[eKYC Mapper] No OCR data found in result");
    return {};
  }

  console.log("[eKYC Mapper] Extracted OCR data:", ocrData);

  const formData: Partial<OnboardingFormData> = {};

  // Map full name - chuẩn hóa capitalize
  if (ocrData.name && typeof ocrData.name === "string") {
    const cleanName = ocrData.name.trim();
    if (cleanName.length > 0) {
      formData.fullName = cleanName;
    }
  }

  // Map date of birth - validate format
  if (ocrData.birth_day && typeof ocrData.birth_day === "string") {
    const isoDate = convertVietnameseDateToISO(ocrData.birth_day);
    // Kiểm tra date hợp lệ (năm từ 1900 đến hiện tại)
    if (isoDate && isoDate.length === 10) {
      const year = parseInt(isoDate.split("-")[0]);
      const currentYear = new Date().getFullYear();
      if (year >= 1900 && year <= currentYear) {
        formData.dateOfBirth = isoDate;
      } else {
        console.warn("[eKYC Mapper] Invalid birth year:", year);
      }
    }
  }

  // Map gender - ưu tiên 'gender', fallback 'sex'
  const genderValue = ocrData.gender || ocrData.sex;
  if (genderValue && typeof genderValue === "string") {
    formData.gender = mapGenderFromVietnamese(genderValue);
  }

  // Map address - ưu tiên 'recent_location', fallback 'address'
  const addressValue = ocrData.recent_location || ocrData.address;
  if (addressValue && typeof addressValue === "string") {
    // Xóa nhiều spaces liền kề, replace \n thành dấu phẩy
    const cleanAddress = addressValue
      .trim()
      .replace(/\n+/g, ", ") // Nhiều \n -> 1 dấu phẩy
      .replace(/\s+/g, " ") // Nhiều spaces -> 1 space
      .replace(/,\s*,/g, ","); // Xóa dấu phẩy dư thừa

    if (cleanAddress.length > 0) {
      formData.address = cleanAddress;

      // Try to extract city from address
      const extractedCity = extractCityFromAddress(cleanAddress);
      if (extractedCity) {
        formData.city = extractedCity;
      }
    }
  }

  // Note: Email, phone, occupation, monthlyIncome are NOT in OCR data
  // These must be filled manually by user

  console.log("[eKYC Mapper] Mapped form data:", formData);

  return formData;
}

/**
 * Validate eKYC result for completeness
 */
export function isEkycResultValid(result: EkycFullResult): boolean {
  if (!result) return false;

  // Result từ SDK không có field 'code' ở top level
  // Nó nằm trong ocr.statusCode, liveness_face.statusCode, etc.

  // // Check OCR data exists
  // const ocrData = result?.ocr?.object || result?.ocr;
  // if (!ocrData || !ocrData.name || !ocrData.id) {
  //   console.warn("[eKYC Mapper] Missing required OCR data");
  //   return false;
  // }

  return true;
}

/**
 * Get eKYC summary for display/confirmation
 */
export function getEkycSummary(result: EkycFullResult): {
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  verifiedAt: string;
  faceMatch?: boolean;
  matchScore?: number;
  matchMessage?: string;
} {
  const ocrData = result?.ocr?.object || result?.ocr;
  const compareData = result?.compare?.object || result?.compare;

  // Clean address (replace \n với dấu phẩy)
  const rawAddress = ocrData?.recent_location || ocrData?.address || "N/A";
  const cleanAddress =
    rawAddress !== "N/A"
      ? rawAddress.trim().replace(/\n+/g, ", ").replace(/\s+/g, " ")
      : rawAddress;

  return {
    idNumber: ocrData?.id || "N/A",
    fullName: ocrData?.name || "N/A",
    dateOfBirth: ocrData?.birth_day || "N/A",
    address: cleanAddress,
    verifiedAt: new Date().toISOString(),
    faceMatch: compareData?.msg === "MATCH",
    matchScore: compareData?.prob,
    matchMessage: compareData?.result,
  };
}
