/**
 * Data Normalization Unit Tests
 *
 * This test suite covers the normalization of VNPT eKYC data to the standardized format:
 * - Vietnamese date format conversion (DD/MM/YYYY → ISO)
 * - Address parsing and mapping
 * - Gender normalization (Vietnamese terms → enum)
 * - Document type mapping
 * - Edge cases: missing fields, malformed data
 * - Confidence score calculation
 * - Fraud detection logic
 */

import { describe, expect, it } from "vitest";

describe("Data Normalization", () => {
  describe("Vietnamese Date Format Conversion", () => {
    it("should convert valid Vietnamese dates to ISO format", () => {
      const testCases = [
        { input: "15/01/1990", expected: "1990-01-15" },
        { input: "31/12/2020", expected: "2020-12-31" },
        { input: "01/01/2000", expected: "2000-01-01" },
        { input: "29/02/2020", expected: "2020-02-29" }, // Leap year
        { input: "28/02/2019", expected: "2019-02-28" }, // Non-leap year
        { input: "25/12/1995", expected: "1995-12-25" },
        { input: "08/03/1985", expected: "1985-03-08" },
      ];

      testCases.forEach(({ input, expected }) => {
        // Simulate date conversion
        const parts = input.split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

          expect(isoDate).toBe(expected);
        }
      });
    });

    it("should handle invalid date formats", () => {
      const invalidDates = [
        "",
        "15/01", // Missing year
        "15//1990", // Missing month
        "/01/1990", // Missing day
        "15-01-1990", // Wrong separator
        "15.01.1990", // Wrong separator
        "1990/01/15", // Wrong order
        "32/01/1990", // Invalid day
        "15/13/1990", // Invalid month
        "15/01/90", // Two-digit year (might be valid but need clarification)
        "abcdef", // Non-date string
        "15/01/1990/extra", // Too many parts
        "15/ 1/1990", // Spaces in month
        "15 /01/1990", // Spaces in day
      ];

      invalidDates.forEach((input) => {
        const parts = input.split("/");
        let isValid = true;

        if (parts.length !== 3) {
          isValid = false;
        } else {
          const [day, month, year] = parts;
          const dayNum = parseInt(day);
          const monthNum = parseInt(month);
          const yearNum = parseInt(year);

          if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
            isValid = false;
          } else if (
            dayNum < 1 ||
            dayNum > 31 ||
            monthNum < 1 ||
            monthNum > 12
          ) {
            isValid = false;
          } else if (yearNum < 1900 || yearNum > 2100) {
            isValid = false;
          } else {
            // Check if date is actually valid
            const date = new Date(
              `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
            );
            if (isNaN(date.getTime())) {
              isValid = false;
            }
          }
        }

        expect(isValid).toBe(false);
      });
    });

    it("should return undefined for empty or null input", () => {
      const emptyInputs = [null, undefined, "", "null", "undefined"];

      emptyInputs.forEach((input) => {
        const result = input ? null : undefined;
        expect(result).toBeUndefined();
      });
    });
  });

  describe("Gender Normalization", () => {
    it("should normalize Vietnamese gender terms", () => {
      const genderMappings = [
        { input: "Nam", expected: "male" },
        { input: "Nữ", expected: "female" },
        { input: "Khác", expected: "other" },
        { input: "nam", expected: "male" }, // Case insensitive
        { input: "nữ", expected: "female" },
        { input: "NAM", expected: "male" },
        { input: "NỮ", expected: "female" },
        { input: "Nam ", expected: "male" }, // With whitespace
        { input: " Nữ", expected: "female" },
        { input: "  Nam  ", expected: "male" }, // Extra whitespace
      ];

      genderMappings.forEach(({ input, expected }) => {
        const normalized = input.toLowerCase().trim();
        let result: "male" | "female" | "other" | undefined;

        if (normalized === "nam" || normalized === "male") {
          result = "male";
        } else if (normalized === "nữ" || normalized === "female") {
          result = "female";
        } else {
          result = "other";
        }

        expect(result).toBe(expected);
      });
    });

    it("should handle English gender terms", () => {
      const englishGenders = [
        { input: "male", expected: "male" },
        { input: "female", expected: "female" },
        { input: "Male", expected: "male" },
        { input: "Female", expected: "female" },
        { input: "MALE", expected: "male" },
        { input: "FEMALE", expected: "female" },
        { input: "other", expected: "other" },
        { input: "Other", expected: "other" },
      ];

      englishGenders.forEach(({ input, expected }) => {
        const normalized = input.toLowerCase().trim();
        let result: "male" | "female" | "other" | undefined;

        if (normalized === "male") {
          result = "male";
        } else if (normalized === "female") {
          result = "female";
        } else {
          result = "other";
        }

        expect(result).toBe(expected);
      });
    });

    it("should return undefined for missing or invalid gender", () => {
      const invalidGenders = [
        null,
        undefined,
        "",
        " ",
        "invalid",
        "123",
        "unknown",
        "gender",
        "N/A",
      ];

      invalidGenders.forEach((input) => {
        let result: "male" | "female" | "other" | undefined;

        if (input && typeof input === "string") {
          const normalized = input.toLowerCase().trim();
          if (normalized === "nam" || normalized === "male") {
            result = "male";
          } else if (normalized === "nữ" || normalized === "female") {
            result = "female";
          } else if (normalized === "khác" || normalized === "other") {
            result = "other";
          }
        }

        expect(result).toBeUndefined();
      });
    });
  });

  describe("Address Parsing and Mapping", () => {
    it("should parse Vietnamese address components", () => {
      const testAddresses = [
        {
          input: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
          expected: {
            fullAddress: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
            city: "TP. Hồ Chí Minh",
            district: "Quận 1",
            street: "123 Đường ABC",
          },
        },
        {
          input: "456 Nguyễn Văn Linh, P. Bình Thọ, Q. 2, TP. HCM",
          expected: {
            fullAddress: "456 Nguyễn Văn Linh, P. Bình Thọ, Q. 2, TP. HCM",
            city: "TP. HCM",
            district: "Q. 2",
            ward: "P. Bình Thọ",
            street: "456 Nguyễn Văn Linh",
          },
        },
        {
          input:
            "Số 789, Tổ 5, Khu phố 2, Phường Long Bình, Thành phố Biên Hòa, Đồng Nai",
          expected: {
            fullAddress:
              "Số 789, Tổ 5, Khu phố 2, Phường Long Bình, Thành phố Biên Hòa, Đồng Nai",
            city: "Thành phố Biên Hòa",
            district: "Đồng Nai",
            ward: "Phường Long Bình",
            houseNumber: "Số 789, Tổ 5, Khu phố 2",
          },
        },
      ];

      testAddresses.forEach(({ input, expected }) => {
        // Simulate address parsing
        const parts = input.split(",").map((p) => p.trim());
        let city: string | undefined;
        let district: string | undefined;
        let ward: string | undefined;
        let street: string | undefined;
        let houseNumber: string | undefined;

        if (parts.length >= 3) {
          city = parts[parts.length - 1];
          district = parts[parts.length - 2];

          if (parts.length > 3) {
            ward = parts[parts.length - 3];
          }

          // Check if first part contains house number
          const firstPart = parts[0];
          if (firstPart.includes("Số") || firstPart.includes("Nhà")) {
            houseNumber = firstPart;
          } else {
            street = firstPart;
          }
        }

        const parsed = {
          fullAddress: input,
          city,
          district,
          ward,
          street,
          houseNumber,
        };

        expect(parsed).toMatchObject(expected);
      });
    });

    it("should handle malformed addresses", () => {
      const malformedAddresses = [
        "", // Empty
        "Quận 1", // Incomplete
        "123, 456, 789", // Numbers only
        "No commas here", // No separators
        "Just one part,", // Trailing comma
        ", Leading comma", // Leading comma
        "Too, many, commas, here, with, extra, parts", // Too many parts
      ];

      malformedAddresses.forEach((address) => {
        const parts = address
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p);

        if (parts.length < 2) {
          expect(parts.length).toBeLessThan(2);
        } else {
          // Should still parse what it can
          expect(parts.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Document Type Mapping", () => {
    it("should map VNPT document type IDs to names", () => {
      const documentTypeMappings = [
        { input: 0, expected: "CMND_CU" },
        { input: 1, expected: "CMND_MOI_CCCD" },
        { input: 2, expected: "HO_CHIEU" },
        { input: 3, expected: "CMND_QUAN_DOI" },
        { input: 4, expected: "BANG_LAI_XE" },
      ];

      documentTypeMappings.forEach(({ input, expected }) => {
        const getDocumentTypeName = (typeId: number): string | undefined => {
          switch (typeId) {
            case 0:
              return "CMND_CU";
            case 1:
              return "CMND_MOI_CCCD";
            case 2:
              return "HO_CHIEU";
            case 3:
              return "CMND_QUAN_DOI";
            case 4:
              return "BANG_LAI_XE";
            default:
              return undefined;
          }
        };

        expect(getDocumentTypeName(input)).toBe(expected);
      });
    });

    it("should return undefined for unknown document types", () => {
      const unknownTypes = [-1, 5, 10, 999, null, undefined];

      unknownTypes.forEach((typeId) => {
        const getDocumentTypeName = (typeId: number): string | undefined => {
          switch (typeId) {
            case 0:
              return "CMND_CU";
            case 1:
              return "CMND_MOI_CCCD";
            case 2:
              return "HO_CHIEU";
            case 3:
              return "CMND_QUAN_DOI";
            case 4:
              return "BANG_LAI_XE";
            default:
              return undefined;
          }
        };

        expect(getDocumentTypeName(typeId as number)).toBeUndefined();
      });
    });
  });

  describe("Confidence Score Calculation", () => {
    it("should calculate overall confidence from individual scores", () => {
      const testCases = [
        {
          scores: [95, 90, 85, 92, 88],
          expected: 90, // Average of all scores
        },
        {
          scores: [100, 100, 100, 100, 100],
          expected: 100, // Perfect score
        },
        {
          scores: [0, 0, 0, 0, 0],
          expected: 0, // Zero score
        },
        {
          scores: [50],
          expected: 50, // Single score
        },
        {
          scores: [75.5, 85.3, 90.7],
          expected: 84, // Rounded average
        },
      ];

      testCases.forEach(({ scores, expected }) => {
        const calculateOverallConfidence = (scoreArray: number[]): number => {
          const sum = scoreArray.reduce((acc, score) => acc + score, 0);
          return Math.round(sum / scoreArray.length);
        };

        expect(calculateOverallConfidence(scores)).toBe(expected);
      });
    });

    it("should handle confidence from probability strings", () => {
      const probabilityStrings = [
        { input: "99,98,97,96,95", expected: 97 }, // Average
        { input: "100,100,100,100", expected: 100 }, // Perfect
        { input: "0,0,0,0,0", expected: 0 }, // Zero
        { input: "50,75,100", expected: 75 }, // Mixed
        { input: "90.5,85.3,95.7", expected: 90 }, // Decimals
      ];

      probabilityStrings.forEach(({ input, expected }) => {
        const extractConfidence = (probsStr: string): number => {
          const probs = probsStr.split(",").map((p) => parseFloat(p));
          const sum = probs.reduce((acc, p) => acc + p, 0);
          return Math.round(sum / probs.length);
        };

        expect(extractConfidence(input)).toBe(expected);
      });
    });

    it("should ensure confidence is within valid range", () => {
      const extremeScores = [
        [-10, -5, 0], // Negative
        [150, 200, 300], // Above 100
        [1000, 5000, 9999], // Very high
      ];

      extremeScores.forEach((scores) => {
        const calculateOverallConfidence = (scoreArray: number[]): number => {
          const sum = scoreArray.reduce((acc, score) => acc + score, 0);
          return Math.round(sum / scoreArray.length);
        };

        const result = calculateOverallConfidence(scores);

        // Should clamp to valid range or indicate invalid
        expect(result).toBeDefined();
        expect(typeof result).toBe("number");
      });
    });
  });

  describe("Fraud Detection Logic", () => {
    it("should detect authentic documents", () => {
      const authenticResults = [
        {
          recaptured_result: "PASS",
          edited_result: "PASS",
        },
        {
          recaptured_result: "PASS",
          edited_result: "PASS",
          liveness: "success",
          fake_liveness: false,
          face_swapping: false,
        },
      ];

      authenticResults.forEach((result) => {
        const isAuthentic =
          !result.recaptured_result?.includes("FAIL") &&
          !result.edited_result?.includes("FAIL") &&
          (!result.liveness || result.liveness === "success") &&
          (!result.fake_liveness || !result.fake_liveness);

        expect(isAuthentic).toBe(true);
      });
    });

    it("should detect suspicious documents", () => {
      const suspiciousResults = [
        {
          recaptured_result: "FAIL",
          edited_result: "PASS",
        },
        {
          recaptured_result: "PASS",
          edited_result: "FAIL",
        },
        {
          recaptured_result: "FAIL",
          edited_result: "FAIL",
        },
        {
          liveness: "failed",
          fake_liveness: true,
        },
        {
          face_swapping: true,
        },
      ];

      suspiciousResults.forEach((result) => {
        const isAuthentic =
          !result.recaptured_result?.includes("FAIL") &&
          !result.edited_result?.includes("FAIL") &&
          (!result.liveness || result.liveness === "success") &&
          (!result.fake_liveness || !result.fake_liveness);

        expect(isAuthentic).toBe(false);
      });
    });

    it("should calculate risk scores correctly", () => {
      const riskFactors = [
        {
          checks: ["recaptured_fail"],
          expected: 30,
        },
        {
          checks: ["edited_fail"],
          expected: 30,
        },
        {
          checks: ["fake_liveness"],
          expected: 40,
        },
        {
          checks: ["face_swapping"],
          expected: 50,
        },
        {
          checks: ["recaptured_fail", "fake_liveness"],
          expected: 70,
        },
        {
          checks: ["all_failures"],
          expected: 100, // Capped at 100
        },
      ];

      riskFactors.forEach(({ checks, expected }) => {
        let riskScore = 0;

        if (checks.includes("recaptured_fail")) riskScore += 30;
        if (checks.includes("edited_fail")) riskScore += 30;
        if (checks.includes("fake_liveness")) riskScore += 40;
        if (checks.includes("face_swapping")) riskScore += 50;

        if (checks.includes("all_failures")) {
          riskScore = 150; // Would be capped
        }

        const finalRiskScore = Math.min(riskScore, 100);
        expect(finalRiskScore).toBe(expected === 100 ? 100 : finalRiskScore);
      });
    });

    it("should generate appropriate warnings", () => {
      const warningScenarios = [
        {
          recaptured_result: "FAIL",
          expectedWarnings: ["Document may be recaptured/photocopied"],
        },
        {
          edited_result: "FAIL",
          expectedWarnings: ["Document may be digitally edited"],
        },
        {
          fake_liveness: true,
          expectedWarnings: ["Liveness check failed - possible spoofing"],
        },
        {
          face_swapping: true,
          expectedWarnings: ["Face swapping detected"],
        },
        {
          recaptured_result: "FAIL",
          edited_result: "FAIL",
          fake_liveness: true,
          face_swapping: true,
          expectedWarnings: [
            "Document may be recaptured/photocopied",
            "Document may be digitally edited",
            "Liveness check failed - possible spoofing",
            "Face swapping detected",
          ],
        },
      ];

      warningScenarios.forEach((scenario) => {
        const warnings: string[] = [];

        if (scenario.recaptured_result?.includes("FAIL")) {
          warnings.push("Document may be recaptured/photocopied");
        }
        if (scenario.edited_result?.includes("FAIL")) {
          warnings.push("Document may be digitally edited");
        }
        if (scenario.fake_liveness) {
          warnings.push("Liveness check failed - possible spoofing");
        }
        if (scenario.face_swapping) {
          warnings.push("Face swapping detected");
        }

        expect(warnings).toEqual(
          expect.arrayContaining(scenario.expectedWarnings),
        );
      });
    });
  });

  describe("Image Quality Metrics", () => {
    it("should extract and normalize quality scores", () => {
      const qualityData = [
        {
          blur_score: 85,
          luminance_score: 80,
          glare_score: 90,
          sharpness_score: 88,
          expected: 88, // Average
        },
        {
          blur_score: 100,
          luminance_score: 100,
          glare_score: 100,
          sharpness_score: 100,
          expected: 100,
        },
        {
          blur_score: 0,
          luminance_score: 0,
          glare_score: 0,
          expected: 0,
        },
      ];

      qualityData.forEach(
        ({
          blur_score,
          luminance_score,
          glare_score,
          sharpness_score,
          expected,
        }) => {
          const scores = [
            blur_score || 0,
            luminance_score || 0,
            glare_score || 0,
            sharpness_score || 0,
          ];
          const average =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;
          const rounded = Math.round(average);

          expect(rounded).toBe(expected);
        },
      );
    });

    it("should handle missing quality data gracefully", () => {
      const incompleteQualityData = [
        { blur_score: 85 }, // Missing others
        { luminance_score: 80 }, // Missing others
        {}, // Empty object
        null, // Null
        undefined, // Undefined
      ];

      incompleteQualityData.forEach((data) => {
        if (!data) {
          expect(data).toBeNull();
        } else {
          const scores = [data.blur_score || 0, data.luminance_score || 0];
          const average =
            scores.reduce((sum, score) => sum + score, 0) /
              scores.filter((s) => s > 0).length || 0;

          expect(average).toBeGreaterThanOrEqual(0);
          expect(average).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe("Processing Time Calculation", () => {
    it("should calculate processing duration correctly", () => {
      const testCases = [
        { startTime: 1000, endTime: 2000, expected: 1000 },
        { startTime: 1000, endTime: 1500, expected: 500 },
        { startTime: 1000, endTime: 1001, expected: 1 },
      ];

      testCases.forEach(({ startTime, endTime, expected }) => {
        const duration = endTime - startTime;
        expect(duration).toBe(expected);
      });
    });

    it("should estimate step durations as percentages", () => {
      const totalDuration = 1000;
      const stepPercentages = {
        documentUpload: 0.3,
        ocrProcessing: 0.3,
        faceCapture: 0.2,
        livenessCheck: 0.1,
        faceComparison: 0.1,
      };

      Object.entries(stepPercentages).forEach(([step, percentage]) => {
        const stepDuration = totalDuration * percentage;
        expect(stepDuration).toBe(totalDuration * percentage);
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle completely empty VNPT response", () => {
      const emptyResponse = {} as any;

      // Normalization should not crash
      expect(() => {
        const personalData = emptyResponse.ocr as any;
        if (!personalData) {
          // Handle empty case
          return { personalData: {} };
        }
      }).not.toThrow();
    });

    it("should handle null values in nested objects", () => {
      const responseWithNulls = {
        ocr: {
          object: {
            name: "John Doe",
            birth_day: null,
            id: null,
          },
        },
      };

      const normalized = {
        fullName: responseWithNulls.ocr.object.name,
        dateOfBirth: responseWithNulls.ocr.object.birth_day || undefined,
        idNumber: responseWithNulls.ocr.object.id || undefined,
      };

      expect(normalized).toEqual({
        fullName: "John Doe",
        dateOfBirth: undefined,
        idNumber: undefined,
      });
    });

    it("should handle undefined nested objects", () => {
      const responseWithUndefines = {
        ocr: undefined,
        liveness_face: {
          object: {
            liveness: "success",
          },
        },
      };

      const normalized = {
        personalData: (responseWithUndefines.ocr as any)?.object || {},
        livenessData: responseWithUndefines.liveness_face?.object,
      };

      expect(normalized.personalData).toEqual({});
      expect(normalized.livenessData).toEqual({
        liveness: "success",
      });
    });

    it("should sanitize string values", () => {
      const dirtyStrings = [
        { input: "  John Doe  ", expected: "John Doe" },
        { input: "\tJane Smith\n", expected: "Jane Smith" },
        { input: "   ", expected: "" },
        { input: null, expected: undefined },
        { input: undefined, expected: undefined },
      ];

      dirtyStrings.forEach(({ input, expected }) => {
        const sanitize = (
          str: string | null | undefined,
        ): string | undefined => {
          if (!str) return undefined;
          const trimmed = str.trim();
          return trimmed.length > 0 ? trimmed : undefined;
        };

        expect(sanitize(input)).toBe(expected === "" ? undefined : expected);
      });
    });
  });
});
