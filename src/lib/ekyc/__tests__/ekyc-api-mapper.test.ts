/**
 * eKYC API Mapper Tests
 *
 * Tests for data transformation between VNPT SDK response and backend API format.
 * Covers:
 * - Unit tests for all mapper functions
 * - Edge case tests for missing/undefined fields
 * - Tests for validation and summary extraction functions
 *
 * @jest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  extractEkycSummary,
  isEkycResponseValid,
  mapEkycResponseToApiRequest,
} from "../ekyc-api-mapper";
import type {
  CompareFaceResponse,
  EkycResponse,
  LivenessCardResponse,
  LivenessFaceResponse,
  MaskedFaceResponse,
  OcrResponse,
  PostCodeInfo,
} from "../types";

// Helper to create minimal valid OCR response
const createMinimalOcr = (): Partial<OcrResponse> => ({
  id: "001234567890",
  name: "NGUYEN VAN ANH",
  birth_day: "15/01/1990",
  msg: "OCR success",
  card_type: "Căn cước công dân gắn chip",
  name_prob: 95,
  birth_day_prob: 95,
  nationality: "Việt Nam",
  nation: "Kinh",
  gender: "Nam",
  valid_date: "01/01/2030",
  origin_location: "Hà Nội",
  origin_location_prob: 90,
  recent_location: "TP.HCM",
  recent_location_prob: 90,
  issue_date: "01/01/2020",
  issue_date_prob: 90,
  issue_place: "Công an TP.HCM",
  issue_place_prob: 90,
  type_id: 1,
  back_type_id: 1,
  warning: [],
  warning_msg: [],
  expire_warning: "",
  back_expire_warning: "",
  post_code: [],
  tampering: { is_legal: "yes", warning: [] },
  is_legal: "yes",
  id_fake_prob: 0,
  id_fake_warning: "no",
  msg_back: "",
  nation_policy: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM",
  nation_slogan: "Độc lập - Tự do - Hạnh phúc",
  id_probs: "[99,98,97,96,95,94,93,92,91,90,89,88]",
});

// Helper to create minimal liveness card response
const createMinimalLivenessCard = (): Partial<LivenessCardResponse> => ({
  message: "Liveness check passed",
  liveness: "success",
  liveness_msg: "Liveness verified",
  face_swapping: false,
  fake_liveness: false,
  object: JSON.stringify({
    face_swapping: "no",
    face_swapping_prob: 0,
    fake_liveness: "no",
    fake_liveness_prob: 0,
    fake_print_photo: "no",
    fake_print_photo_prob: 0,
    liveness: "success",
    liveness_msg: "",
  }),
});

// Helper to create minimal liveness face response
const createMinimalLivenessFace = (): Partial<LivenessFaceResponse> => ({
  message: "Face liveness passed",
  liveness: "success",
  liveness_msg: "Face verified",
  is_eye_open: "yes",
  blur_face: "no",
  object: JSON.stringify({
    age: 30,
    gender: "male",
    liveness: "success",
    liveness_prob: 98,
  }),
});

// Helper to create minimal masked response
const createMinimalMasked = (): Partial<MaskedFaceResponse> => ({
  message: "No mask detected",
  masked: "no",
  object: JSON.stringify({ masked: "no" }),
});

// Helper to create minimal compare response
const createMinimalCompare = (): Partial<CompareFaceResponse> => ({
  message: "Face comparison passed",
  msg: "MATCH",
  prob: "95.5",
  result: "Faces match",
  multiple_faces: false,
  object: JSON.stringify({
    match_warning: "no",
    prob: 95.5,
    result: "MATCH",
  }),
});

describe("ekyc-api-mapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mapEkycResponseToApiRequest", () => {
    /**
     * Test T400: Map complete eKYC response to API request format
     */
    it("should map complete eKYC response to API request format", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        liveness_card_front:
          createMinimalLivenessCard() as LivenessCardResponse,
        liveness_card_back: createMinimalLivenessCard() as LivenessCardResponse,
        ocr: createMinimalOcr() as OcrResponse,
        liveness_face: createMinimalLivenessFace() as LivenessFaceResponse,
        masked: createMinimalMasked() as MaskedFaceResponse,
        compare: createMinimalCompare() as CompareFaceResponse,
        hash_img: {
          img_front: "abc123",
          img_back: "def456",
          img_face: "ghi789",
        },
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result).toBeDefined();
      expect(result.type_document).toBe(9);
      expect(result.liveness_card_front).toBeDefined();
      expect(result.liveness_card_front?.logID).toBe("Liveness check passed");
      expect(result.liveness_card_front?.statusCode).toBe(200);
      expect(result.ocr).toBeDefined();
      expect(result.ocr?.object?.id).toBe("001234567890");
      expect(result.ocr?.object?.name).toBe("NGUYEN VAN ANH");
      expect(result.liveness_face).toBeDefined();
      expect(result.liveness_face?.statusCode).toBe(200);
      expect(result.masked).toBeDefined();
      expect(result.masked?.statusCode).toBe(200);
      expect(result.compare).toBeDefined();
      expect(result.compare?.statusCode).toBe(200);
    });

    /**
     * Test T400: Handle minimal eKYC response with only required fields
     */
    it("should handle minimal eKYC response with only required fields", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result).toBeDefined();
      expect(result.type_document).toBe(9);
      expect(result.liveness_card_front).toBeUndefined();
      expect(result.liveness_card_back).toBeUndefined();
      expect(result.ocr).toBeDefined();
      expect(result.liveness_face).toBeUndefined();
      expect(result.masked).toBeUndefined();
      expect(result.compare).toBeUndefined();
    });

    /**
     * Test T400: Handle missing liveness_card object JSON (parse error)
     */
    it("should handle missing liveness_card object JSON gracefully", () => {
      const livenessCard = createMinimalLivenessCard();
      livenessCard.object = ""; // Empty object
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        liveness_card_front: livenessCard as LivenessCardResponse,
        ocr: createMinimalOcr() as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.liveness_card_front).toBeDefined();
      expect(result.liveness_card_front?.object?.face_swapping).toBeDefined();
      expect(result.liveness_card_front?.object?.liveness).toBe("success");
    });

    /**
     * Test T400: Handle OCR without post_code array
     */
    it("should handle OCR without post_code array", () => {
      const ocr = createMinimalOcr();
      ocr.post_code = [];
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.ocr).toBeDefined();
      expect(result.ocr?.object?.post_code).toBeUndefined();
      expect(result.ocr?.object?.new_post_code).toBeUndefined();
    });

    /**
     * Test T400: Handle OCR with post_code
     */
    it("should handle OCR with post_code array", () => {
      const ocr = createMinimalOcr();
      ocr.post_code = [
        {
          city: ["TP.HCM", "Thành phố Hồ Chí Minh", 79],
          district: ["Quận 1", "Quận 1", 1],
          ward: ["Phường Bến Nghé", "Phường Bến Nghé", 1],
          type: "address",
        },
      ] as PostCodeInfo[];
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.ocr?.object?.post_code).toBeDefined();
      expect(result.ocr?.object?.post_code?.[0]).toEqual({
        city: "TP.HCM",
        detail: "",
        district: "Quận 1",
        type: "address",
        ward: "Phường Bến Nghé",
      });
    });

    /**
     * Test T400: Handle compare with string prob value
     */
    it("should handle compare with string prob value", () => {
      const compare = createMinimalCompare();
      compare.prob = "87.5";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        compare: compare as CompareFaceResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.compare).toBeDefined();
      expect(result.compare?.object?.prob).toBe(87.5);
    });

    /**
     * Test T400: Handle compare with number prob value
     */
    it("should handle compare with number prob value", () => {
      const compare = createMinimalCompare();
      compare.prob = 92.3;
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        compare: compare as CompareFaceResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.compare).toBeDefined();
      expect(result.compare?.object?.prob).toBe(92.3);
    });

    /**
     * Test T400: Handle failed liveness check
     */
    it("should set statusCode 400 for failed liveness check", () => {
      const livenessCard = createMinimalLivenessCard();
      livenessCard.liveness = "failure";
      livenessCard.liveness_msg = "Could not verify liveness";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        liveness_card_front: livenessCard as LivenessCardResponse,
        ocr: createMinimalOcr() as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.liveness_card_front?.statusCode).toBe(400);
    });

    /**
     * Test T400: Handle failed face match
     */
    it("should set statusCode 400 for failed face match", () => {
      const compare = createMinimalCompare();
      compare.msg = "NOMATCH";
      compare.prob = 45.2;
      compare.result = "Faces do not match";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        compare: compare as CompareFaceResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.compare?.statusCode).toBe(400);
    });

    /**
     * Test T400: Handle masked face
     */
    it("should set statusCode 400 for masked face", () => {
      const masked = createMinimalMasked();
      masked.masked = "yes";
      masked.message = "Face is masked";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        masked: masked as MaskedFaceResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.masked?.statusCode).toBe(400);
    });
  });

  describe("mapLivenessCard", () => {
    /**
     * Test edge case: Invalid JSON in object field
     */
    it("should handle invalid JSON in object field", () => {
      const livenessCard = createMinimalLivenessCard();
      livenessCard.object = "invalid json {";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        liveness_card_front: livenessCard as LivenessCardResponse,
        ocr: createMinimalOcr() as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.liveness_card_front).toBeDefined();
    });
  });

  describe("mapOcr", () => {
    /**
     * Test edge case: OCR with tampering detection warnings
     */
    it("should map OCR with tampering detection warnings", () => {
      const ocr = createMinimalOcr();
      ocr.tampering = {
        is_legal: "no",
        warning: ["Possible photocopy", "Screen recapture detected"],
      };
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.ocr).toBeDefined();
      expect(result.ocr?.object?.tampering).toBeDefined();
      expect(result.ocr?.object?.tampering?.is_legal).toBe("no");
      expect(result.ocr?.object?.tampering?.warning).toEqual([
        "Possible photocopy",
        "Screen recapture detected",
      ]);
    });

    /**
     * Test edge case: OCR with id_probs as JSON string
     */
    it("should parse id_probs from JSON string", () => {
      const ocr = createMinimalOcr();
      ocr.id_probs = "[98, 95, 92]";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.ocr?.object?.id_probs).toEqual([98, 95, 92]);
    });

    /**
     * Test edge case: Invalid id_probs JSON
     */
    it("should handle invalid id_probs JSON", () => {
      const ocr = createMinimalOcr();
      ocr.id_probs = "invalid";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.ocr?.object?.id_probs).toBeUndefined();
    });
  });

  describe("isEkycResponseValid", () => {
    /**
     * Test T401: Validate complete eKYC response
     */
    it("should return true for valid eKYC response with OCR data", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
      };

      const result = isEkycResponseValid(ekycResponse as EkycResponse);

      expect(result).toBe(true);
    });

    /**
     * Test T401: Return false for missing OCR data
     */
    it("should return false when OCR data is missing", () => {
      const ekycResponse = { type_document: 9 } as EkycResponse;

      const result = isEkycResponseValid(ekycResponse);

      expect(result).toBe(false);
    });

    /**
     * Test T401: Return false for missing ID number
     */
    it("should return false when ID number is missing", () => {
      const ocr = createMinimalOcr();
      delete ocr.id;
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = isEkycResponseValid(ekycResponse as EkycResponse);

      expect(result).toBe(false);
    });

    /**
     * Test T401: Return false for missing name
     */
    it("should return false when name is missing", () => {
      const ocr = createMinimalOcr();
      delete ocr.name;
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = isEkycResponseValid(ekycResponse as EkycResponse);

      expect(result).toBe(false);
    });

    /**
     * Test T401: Return false for empty ID number
     */
    it("should return false for empty ID number", () => {
      const ocr = createMinimalOcr();
      ocr.id = "";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = isEkycResponseValid(ekycResponse as EkycResponse);

      expect(result).toBe(false);
    });

    /**
     * Test T401: Return false for empty name
     */
    it("should return false for empty name", () => {
      const ocr = createMinimalOcr();
      ocr.name = "";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: ocr as OcrResponse,
      };

      const result = isEkycResponseValid(ekycResponse as EkycResponse);

      expect(result).toBe(false);
    });

    /**
     * Test T401: Return false for null response
     */
    it("should return false for null response", () => {
      const result = isEkycResponseValid(null as any);

      expect(result).toBe(false);
    });

    /**
     * Test T401: Return false for undefined response
     */
    it("should return false for undefined response", () => {
      const result = isEkycResponseValid(undefined as any);

      expect(result).toBe(false);
    });
  });

  describe("extractEkycSummary", () => {
    /**
     * Test T401: Extract summary from complete eKYC response
     */
    it("should extract summary from complete eKYC response", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        liveness_face: createMinimalLivenessFace() as LivenessFaceResponse,
        compare: createMinimalCompare() as CompareFaceResponse,
      };

      const result = extractEkycSummary(ekycResponse as EkycResponse);

      expect(result).toEqual({
        idNumber: "001234567890",
        fullName: "NGUYEN VAN ANH",
        dateOfBirth: "15/01/1990",
        documentType: "Căn cước công dân gắn chip",
        isLivenessPassed: true,
        isFaceMatched: true,
        faceMatchScore: 95.5,
      });
    });

    /**
     * Test T401: Handle missing OCR data
     */
    it("should handle missing OCR data gracefully", () => {
      const ekycResponse = { type_document: 9 } as EkycResponse;

      const result = extractEkycSummary(ekycResponse);

      expect(result.idNumber).toBe("");
      expect(result.fullName).toBe("");
      expect(result.dateOfBirth).toBe("");
    });

    /**
     * Test T401: Handle missing liveness face
     */
    it("should handle missing liveness face", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
      };

      const result = extractEkycSummary(ekycResponse as EkycResponse);

      expect(result.isLivenessPassed).toBe(false);
    });

    /**
     * Test T401: Handle failed liveness
     */
    it("should handle failed liveness check", () => {
      const livenessFace = createMinimalLivenessFace();
      livenessFace.liveness = "failure";
      livenessFace.liveness_msg = "Could not verify";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        liveness_face: livenessFace as LivenessFaceResponse,
      };

      const result = extractEkycSummary(ekycResponse as EkycResponse);

      expect(result.isLivenessPassed).toBe(false);
    });

    /**
     * Test T401: Handle missing compare
     */
    it("should handle missing compare data", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
      };

      const result = extractEkycSummary(ekycResponse as EkycResponse);

      expect(result.isFaceMatched).toBe(false);
      expect(result.faceMatchScore).toBeUndefined();
    });

    /**
     * Test T401: Handle failed face match
     */
    it("should handle failed face match", () => {
      const compare = createMinimalCompare();
      compare.msg = "NOMATCH";
      compare.prob = "45.2";
      compare.result = "Faces do not match";
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        compare: compare as CompareFaceResponse,
      };

      const result = extractEkycSummary(ekycResponse as EkycResponse);

      expect(result.isFaceMatched).toBe(false);
      expect(result.faceMatchScore).toBe(45.2);
    });

    /**
     * Test T401: Handle prob as number
     */
    it("should handle prob as number", () => {
      const compare = createMinimalCompare();
      compare.prob = 92.3;
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        compare: compare as CompareFaceResponse,
      };

      const result = extractEkycSummary(ekycResponse as EkycResponse);

      expect(result.faceMatchScore).toBe(92.3);
    });

    /**
     * Test T401: Handle different document types
     */
    it("should map document type correctly for different types", () => {
      const testCases = [
        { type: -1, expected: "Chứng minh thư nhân dân" },
        { type: 5, expected: "Hộ chiếu" },
        { type: 6, expected: "Bằng lái xe" },
        { type: 7, expected: "Chứng minh thư quân đội" },
        { type: 9, expected: "Căn cước công dân gắn chip" },
        { type: 999, expected: "Không xác định" },
      ];

      testCases.forEach(({ type, expected }) => {
        const ekycResponse: Partial<EkycResponse> = {
          type_document: type,
          ocr: createMinimalOcr() as OcrResponse,
        };

        const result = extractEkycSummary(ekycResponse as EkycResponse);
        expect(result.documentType).toBe(expected);
      });
    });
  });

  describe("safeMapHashImg", () => {
    /**
     * Test edge case: Valid hash_img object
     */
    it("should convert hash_img object to JSON string", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
        hash_img: {
          img_front: "abc123",
          img_back: "def456",
          img_face: "ghi789",
        },
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.hash_img).toBeDefined();
      expect(typeof result.hash_img).toBe("string");
      const parsed = JSON.parse(result.hash_img!);
      expect(parsed.img_front).toBe("abc123");
    });

    /**
     * Test edge case: Undefined hash_img
     */
    it("should handle undefined hash_img", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
        ocr: createMinimalOcr() as OcrResponse,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.hash_img).toBeUndefined();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    /**
     * Test: Handle completely empty response
     */
    it("should handle completely empty response", () => {
      const ekycResponse = {} as EkycResponse;

      const result = mapEkycResponseToApiRequest(ekycResponse);

      expect(result).toBeDefined();
      expect(result.type_document).toBeUndefined();
    });

    /**
     * Test: Handle response with all optional fields missing
     */
    it("should handle response with all optional fields missing", () => {
      const ekycResponse: Partial<EkycResponse> = {
        type_document: 9,
      };

      const result = mapEkycResponseToApiRequest(ekycResponse as EkycResponse);

      expect(result.type_document).toBe(9);
      expect(result.liveness_card_front).toBeUndefined();
      expect(result.ocr).toBeUndefined();
    });
  });
});
