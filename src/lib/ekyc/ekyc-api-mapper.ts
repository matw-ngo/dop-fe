/**
 * eKYC API Mapper - Transform VNPT SDK response to backend API request format
 *
 * This module transforms the raw response data from the VNPT eKYC SDK
 * into the format expected by the backend API endpoint POST /leads/{id}/ekyc/vnpt
 */

import type { components } from "@/lib/api/v1/dop";
import type {
  CompareFaceResponse,
  EkycResponse,
  HashImgResponse,
  LivenessCardResponse,
  LivenessFaceResponse,
  MaskedFaceResponse,
  OcrResponse,
} from "./types";

/**
 * Extended EkycResponse type that includes optional fields from SDK
 * that may not be in the core type definition
 */
interface ExtendedEkycResponse extends EkycResponse {
  qr_code?: string;
  base64_doc_img_front?: string;
  base64_doc_img_back?: string;
  base64_face_img_far?: string;
  base64_face_img_near?: string;
  hash_doc_front?: string;
  hash_doc_back?: string;
}

type VnptEkycRequestBody = components["schemas"]["VnptEkycRequestBody"];
type VNPTLivenessCard = components["schemas"]["VNPTLivenessCard"];
type VNPTOCR = components["schemas"]["VNPTOCR"];
type VNPTLivenessFace = components["schemas"]["VNPTLivenessFace"];
type VNPTMasked = components["schemas"]["VNPTMasked"];
type VNPTCompare = components["schemas"]["VNPTCompare"];
type VNPTBase64DocImg = components["schemas"]["VNPTBase64DocImg"];
type VNPTBase64FaceImg = components["schemas"]["VNPTBase64FaceImg"];
type VNPTHashDocument = components["schemas"]["VNPTHashDocument"];

/**
 * Safely parses a JSON string, returning undefined if parsing fails
 */
function safeParseJSON<T = unknown>(
  jsonString: string | undefined,
): T | undefined {
  if (!jsonString) return undefined;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return undefined;
  }
}

/**
 * Safely extracts a string property from an object
 */
function safeGetString(obj: unknown, key: string): string | undefined {
  if (obj && typeof obj === "object" && key in obj) {
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

/**
 * Maps VNPT SDK eKYC response to backend API request format
 *
 * @param ekycResponse - The response from VNPT eKYC SDK
 * @returns Formatted request body for POST /leads/{id}/ekyc/vnpt
 *
 * @example
 * ```ts
 * const ekycResult = await vnptSdk.process();
 * const apiRequest = mapEkycResponseToApiRequest(ekycResult);
 * await submitEkycResult({ leadId: "123", ekycData: apiRequest });
 * ```
 */
export function mapEkycResponseToApiRequest(
  ekycResponse: EkycResponse,
): VnptEkycRequestBody {
  const extendedResponse = ekycResponse as ExtendedEkycResponse;

  return {
    type_document: ekycResponse.type_document,
    liveness_card_front: ekycResponse.liveness_card_front
      ? mapLivenessCard(ekycResponse.liveness_card_front)
      : undefined,
    liveness_card_back: ekycResponse.liveness_card_back
      ? mapLivenessCard(ekycResponse.liveness_card_back)
      : undefined,
    ocr: ekycResponse.ocr ? mapOcr(ekycResponse.ocr) : undefined,
    liveness_face: ekycResponse.liveness_face
      ? mapLivenessFace(ekycResponse.liveness_face)
      : undefined,
    masked: ekycResponse.masked ? mapMasked(ekycResponse.masked) : undefined,
    compare: ekycResponse.compare
      ? mapCompare(ekycResponse.compare)
      : undefined,
    base64_doc_img: safeMapBase64DocImg(extendedResponse),
    base64_face_img: safeMapBase64FaceImg(extendedResponse),
    data_hash_document: safeMapHashDocument(extendedResponse),
    hash_img: safeMapHashImg(ekycResponse.hash_img),
    qr_code: extendedResponse.qr_code,
  };
}

/**
 * Maps LivenessCardResponse to VNPTLivenessCard API format
 *
 * The SDK response contains an `object` field that is a JSON string.
 * This needs to be parsed and mapped to the API format.
 */
function mapLivenessCard(data: LivenessCardResponse): VNPTLivenessCard {
  const parsedObject = safeParseJSON<{
    face_swapping?: string;
    face_swapping_prob?: number;
    fake_liveness?: string;
    fake_liveness_prob?: number;
    fake_print_photo?: string;
    fake_print_photo_prob?: number;
    liveness?: string;
    liveness_msg?: string;
  }>(data.object);

  return {
    challengeCode: "", // SDK response doesn't include this, will be added by backend
    dataBase64: "", // SDK response doesn't include this, will be added by backend
    dataSign: "", // SDK response doesn't include this, will be added by backend
    imgs: {
      img: "", // SDK response doesn't include this, will be added by backend
    },
    logID: data.message || "",
    message: data.message || "",
    object: {
      face_swapping:
        parsedObject?.face_swapping || (data.face_swapping ? "yes" : "no"),
      face_swapping_prob: parsedObject?.face_swapping_prob || 0,
      fake_liveness:
        parsedObject?.fake_liveness || (data.fake_liveness ? "yes" : "no"),
      fake_liveness_prob: parsedObject?.fake_liveness_prob || 0,
      fake_print_photo: parsedObject?.fake_print_photo || "no",
      fake_print_photo_prob: parsedObject?.fake_print_photo_prob || 0,
      liveness: data.liveness || "failure",
      liveness_msg: data.liveness_msg || "",
    },
    server_version: "", // SDK response doesn't include this
    statusCode: data.liveness === "success" ? 200 : 400,
  };
}

/**
 * Maps OcrResponse to VNPTOCR API format
 *
 * The OCR response contains complex nested data that needs to be
 * transformed to match the API schema.
 */
function mapOcr(data: OcrResponse): VNPTOCR {
  // Map post_code to the API format
  const mappedPostCode = data.post_code?.map((postCode) => ({
    city: postCode.city,
    detail: "",
    district: postCode.district,
    type: postCode.type,
    ward: postCode.ward,
  }));

  return {
    message: data.msg || "",
    challengeCode: "", // SDK response doesn't include this
    dataBase64: "", // SDK response doesn't include this
    dataSign: "", // SDK response doesn't include this
    imgs: {
      img_front: "", // SDK response doesn't include this
      img_back: "", // SDK response doesn't include this
    },
    logID: "", // SDK response doesn't include this
    object: {
      address_fake_warning: false,
      back_corner_warning: data.back_corner_warning,
      back_expired_warning: data.back_expire_warning,
      back_type_id: data.back_type_id,
      birth_day: data.birth_day,
      birth_day_prob: data.birth_day_prob,
      card_type: data.card_type,
      checking_result_back: undefined, // SDK doesn't provide this
      checking_result_front: undefined, // SDK doesn't provide this
      citizen_id: data.citizen_id,
      citizen_id_prob: data.citizen_id_prob,
      corner_warning: data.corner_warning,
      cover_prob_front: 0, // SDK doesn't provide this
      dict_qr: undefined, // SDK doesn't provide this
      dob_fake_warning: false, // SDK doesn't provide this
      dob_fake_warning_prob: 0,
      dupplication_warning: false, // SDK doesn't provide this
      expire_warning: data.expire_warning,
      features: undefined, // SDK doesn't provide this
      features_prob: 0,
      gender: data.gender,
      general_warning: [], // SDK doesn't provide this
      id: data.id,
      id_fake_prob: data.id_fake_prob,
      id_fake_warning: data.id_fake_warning,
      id_probs: safeParseJSON<number[]>(data.id_probs),
      issue_date: data.issue_date,
      issue_date_prob: data.issue_date_prob,
      issue_date_probs: data.issue_date_probs,
      issue_place: data.issue_place,
      issue_place_prob: data.issue_place_prob,
      issuedate_fake_warning: false, // SDK doesn't provide this
      match_front_back: undefined, // SDK doesn't provide this
      match_qr: undefined, // SDK doesn't provide this
      mrz: undefined, // SDK doesn't provide this
      mrz_prob: 0,
      mrz_probs: [],
      mrz_valid_score: 0,
      msg: data.msg,
      msg_back: data.msg_back,
      name: data.name,
      name_fake_warning: "", // SDK doesn't provide this
      name_fake_warning_prob: 0,
      name_prob: data.name_prob,
      name_probs: [], // SDK doesn't provide this
      nation_policy: data.nation_policy,
      nationality: data.nationality,
      new_post_code: mappedPostCode,
      origin_location: data.origin_location,
      origin_location_prob: data.origin_location_prob,
      post_code: mappedPostCode,
      quality_back: undefined, // SDK doesn't provide this
      quality_front: undefined, // SDK doesn't provide this
      recent_location: data.recent_location,
      recent_location_prob: data.recent_location_prob,
      tampering: data.tampering
        ? {
            is_legal: data.tampering.is_legal,
            warning: data.tampering.warning,
          }
        : undefined,
      type_id: data.type_id,
      valid_date: data.valid_date,
      valid_date_prob: 0, // SDK doesn't provide this
    },
    server_version: "", // SDK response doesn't include this
    statusCode: 200, // Assuming success if we have OCR data
  };
}

/**
 * Maps LivenessFaceResponse to VNPTLivenessFace API format
 */
function mapLivenessFace(data: LivenessFaceResponse): VNPTLivenessFace {
  const parsedObject = safeParseJSON<{
    age?: number;
    background_warning?: string;
    blur_face?: string;
    blur_face_prob?: number;
    gender?: string;
    is_eye_open?: string;
    liveness?: string;
    liveness_msg?: string;
    liveness_prob?: number;
    multiple_faces_detail?: {
      multiple_face_1: boolean;
      multiple_face_2: boolean;
    };
  }>(data.object);

  return {
    challengeCode: "", // SDK response doesn't include this
    dataBase64: "", // SDK response doesn't include this
    dataSign: "", // SDK response doesn't include this
    imgs: {
      img_face: "", // SDK response doesn't include this
      img_front: "", // SDK response doesn't include this
    },
    object: {
      age: parsedObject?.age || 0,
      background_warning: parsedObject?.background_warning || "no",
      blur_face: data.blur_face || "no",
      blur_face_prob: parsedObject?.blur_face_prob || 0,
      gender: parsedObject?.gender || "",
      is_eye_open: data.is_eye_open || "no",
      liveness: data.liveness || "failure",
      liveness_msg: data.liveness_msg || "",
      liveness_prob: parsedObject?.liveness_prob || 0,
      multiple_faces_detail: parsedObject?.multiple_faces_detail || {
        multiple_face_1: false,
        multiple_face_2: false,
      },
    },
    server_version: "", // SDK response doesn't include this
    message: data.message || "",
    logID: data.message || "",
    statusCode: data.liveness === "success" ? 200 : 400,
  };
}

/**
 * Maps MaskedFaceResponse to VNPTMasked API format
 */
function mapMasked(data: MaskedFaceResponse): VNPTMasked {
  const parsedObject = safeParseJSON<{ masked?: string }>(data.object);

  return {
    challengeCode: "", // SDK response doesn't include this
    dataBase64: "", // SDK response doesn't include this
    dataSign: "", // SDK response doesn't include this
    imgs: {
      img: "", // SDK response doesn't include this
    },
    message: data.message || "",
    object: {
      masked: parsedObject?.masked || data.masked || "no",
    },
    server_version: "", // SDK response doesn't include this
    statusCode: data.masked === "no" ? 200 : 400,
  };
}

/**
 * Maps CompareFaceResponse to VNPTCompare API format
 */
function mapCompare(data: CompareFaceResponse): VNPTCompare {
  const parsedObject = safeParseJSON<{
    match_warning?: string;
    msg?: string;
    multiple_faces?: boolean;
    multiple_faces_detail?: {
      multiple_face_1: boolean;
      multiple_face_2: boolean;
    };
    prob?: number;
    result?: string;
  }>(data.object);

  // Convert prob from string to number if needed
  const probValue =
    typeof data.prob === "string" ? parseFloat(data.prob) : data.prob;

  return {
    challengeCode: "", // SDK response doesn't include this
    dataBase64: "", // SDK response doesn't include this
    dataSign: "", // SDK response doesn't include this
    imgs: {
      img_face: "", // SDK response doesn't include this
      img_front: "", // SDK response doesn't include this
    },
    object: {
      match_warning: parsedObject?.match_warning || "no",
      msg: data.msg || parsedObject?.msg || "NOMATCH",
      multiple_faces:
        data.multiple_faces || parsedObject?.multiple_faces || false,
      multiple_faces_detail: parsedObject?.multiple_faces_detail || {
        multiple_face_1: false,
        multiple_face_2: false,
      },
      prob: parsedObject?.prob || probValue || 0,
      result: data.result || parsedObject?.result || "",
    },
    server_version: data.server_version || "",
    message: data.message || "",
    logID: data.message || "",
    statusCode: data.msg === "MATCH" ? 200 : 400,
  };
}

/**
 * Safely extracts a property from an object with type safety
 */
function safeExtractProperty<T>(
  data: Record<string, unknown> | null | undefined,
  key: string,
  defaultValue: T,
): T {
  if (!data || typeof data !== "object") {
    return defaultValue;
  }
  const value = data[key];
  return (value as T) ?? defaultValue;
}

/**
 * Safely extracts base64 document images from ExtendedEkycResponse
 *
 * Uses the extended type that includes optional base64 fields from SDK.
 */
function safeMapBase64DocImg(
  data: ExtendedEkycResponse,
): VNPTBase64DocImg | undefined {
  // Check if any base64 data exists before returning the object
  const hasData = data.base64_doc_img_front || data.base64_doc_img_back;
  if (!hasData) return undefined;

  return {
    img_front: data.base64_doc_img_front || "",
    img_back: data.base64_doc_img_back || "",
  };
}

/**
 * Safely extracts base64 face images from ExtendedEkycResponse
 */
function safeMapBase64FaceImg(
  data: ExtendedEkycResponse,
): VNPTBase64FaceImg | undefined {
  // Check if any base64 data exists before returning the object
  const hasData = data.base64_face_img_far || data.base64_face_img_near;
  if (!hasData) return undefined;

  return {
    img_face_far: data.base64_face_img_far || "",
    img_face_near: data.base64_face_img_near || "",
  };
}

/**
 * Safely extracts document hash from ExtendedEkycResponse
 */
function safeMapHashDocument(
  data: ExtendedEkycResponse,
): VNPTHashDocument | undefined {
  // Check if any hash data exists before returning the object
  const hasData = data.hash_doc_front || data.hash_doc_back;
  if (!hasData) return undefined;

  return {
    img_front: data.hash_doc_front || "",
    img_back: data.hash_doc_back || "",
  };
}

/**
 * Safely maps hash_img to a JSON string
 *
 * The API expects hash_img as a string, but the SDK response
 * has it as an object. This function converts it properly.
 */
function safeMapHashImg(
  hashImg: HashImgResponse | undefined,
): string | undefined {
  if (!hashImg) return undefined;
  try {
    return JSON.stringify(hashImg);
  } catch {
    return undefined;
  }
}

/**
 * Validates if the eKYC response has all required fields for submission
 *
 * @param ekycResponse - The eKYC response to validate
 * @returns true if the response has minimum required data
 */
export function isEkycResponseValid(ekycResponse: EkycResponse): boolean {
  return !!(
    ekycResponse &&
    ekycResponse.ocr &&
    ekycResponse.ocr.id &&
    ekycResponse.ocr.name
  );
}

/**
 * Extracts key information from eKYC response for display purposes
 *
 * @param ekycResponse - The eKYC response
 * @returns Object containing display-friendly eKYC summary
 */
export function extractEkycSummary(ekycResponse: EkycResponse): {
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  documentType: string;
  isLivenessPassed: boolean;
  isFaceMatched: boolean;
  faceMatchScore?: number;
} {
  const { ocr, liveness_face, compare } = ekycResponse;

  return {
    idNumber: ocr?.id || "",
    fullName: ocr?.name || "",
    dateOfBirth: ocr?.birth_day || "",
    documentType: getDocumentTypeLabel(ekycResponse.type_document),
    isLivenessPassed: liveness_face?.liveness === "success",
    isFaceMatched: compare?.msg === "MATCH",
    faceMatchScore:
      typeof compare?.prob === "string"
        ? parseFloat(compare.prob)
        : compare?.prob,
  };
}

/**
 * Converts document type enum to human-readable label
 */
function getDocumentTypeLabel(type: number): string {
  const labels: Record<number, string> = {
    "-1": "Chứng minh thư nhân dân",
    5: "Hộ chiếu",
    6: "Bằng lái xe",
    7: "Chứng minh thư quân đội",
    9: "Căn cước công dân gắn chip",
  };
  return labels[type] || "Không xác định";
}
