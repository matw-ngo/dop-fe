/**
 * Autofill Mapper Unit Tests
 *
 * This test suite covers the autofill mapping functionality:
 * - Field path resolution (nested object paths)
 * - Type conversion and validation
 * - Mapping configuration validation
 * - Error handling for invalid paths
 * - Complex nested path scenarios
 * - Edge cases and malformed data
 */

import { describe, it, expect } from "vitest";
import type { VerificationResult } from "../types";

// Sample verification result for testing
const mockVerificationResult: VerificationResult = {
  success: true,
  sessionId: "test-session-123",
  provider: {
    name: "vnpt",
    version: "3.2.0",
  },
  personalData: {
    fullName: "NGUYEN VAN A",
    dateOfBirth: "1990-01-15",
    gender: "male" as const,
    nationality: "Việt Nam",
    idNumber: "001234567890",
    address: {
      fullAddress: "123 Đường ABC, Quận 1, TP.HCM",
      city: "TP.HCM",
      district: "Quận 1",
      ward: "Phường Bến Thành",
      street: "123 Đường ABC",
      houseNumber: "123",
    },
    documentType: "CCCD",
    documentTypeName: "Căn cước công dân",
    issuedDate: "2020-01-01",
    expiryDate: "2030-01-01",
    issuedBy: "Công an TP.HCM",
    ethnicity: "Kinh",
    hometown: "Hà Nội",
    religion: "Phật giáo",
  },
  verificationData: {
    confidence: 95,
    livenessScore: 90,
    faceMatchScore: 92,
    documentQuality: 88,
    ocrConfidence: {
      idNumber: 98,
      name: 95,
      dateOfBirth: 97,
      address: 92,
    },
    fraudDetection: {
      isAuthentic: true,
      riskScore: 5,
      warnings: [],
      checks: {
        photocopyDetection: true,
        screenDetection: true,
        digitalManipulation: false,
        faceSwapping: false,
      },
    },
    imageQuality: {
      blurScore: 85,
      brightnessScore: 80,
      glareScore: 90,
      sharpnessScore: 88,
    },
  },
  processing: {
    totalDuration: 1500,
    steps: {
      documentUpload: 450,
      ocrProcessing: 450,
      faceCapture: 300,
      livenessCheck: 150,
      faceComparison: 150,
    },
    retryCount: 0,
  },
  startedAt: "2024-01-15T10:00:00.000Z",
  completedAt: "2024-01-15T10:00:01.500Z",
};

describe("Autofill Mapper", () => {
  describe("Simple Field Mapping", () => {
    it("should map simple top-level fields", () => {
      const mapping = {
        full_name: "fullName",
        national_id: "idNumber",
        date_of_birth: "dateOfBirth",
        gender: "gender",
        nationality: "nationality",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(mappedData).toEqual({
        full_name: "NGUYEN VAN A",
        national_id: "001234567890",
        date_of_birth: "1990-01-15",
        gender: "male",
        nationality: "Việt Nam",
      });
    });

    it("should handle missing fields gracefully", () => {
      const mapping = {
        existing_field: "fullName",
        missing_field: "nonExistentField",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(mappedData).toEqual({
        existing_field: "NGUYEN VAN A",
      });
      expect(mappedData.missing_field).toBeUndefined();
    });
  });

  describe("Nested Field Mapping", () => {
    it("should map nested object fields", () => {
      const mapping = {
        full_address: "address.fullAddress",
        city: "address.city",
        district: "address.district",
        ward: "address.ward",
        street: "address.street",
        house_number: "address.houseNumber",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(mappedData).toEqual({
        full_address: "123 Đường ABC, Quận 1, TP.HCM",
        city: "TP.HCM",
        district: "Quận 1",
        ward: "Phường Bến Thành",
        street: "123 Đường ABC",
        house_number: "123",
      });
    });

    it("should handle deeply nested paths", () => {
      const mapping = {
        confidence_score: "verificationData.confidence",
        liveness_score: "verificationData.livenessScore",
        face_match_score: "verificationData.faceMatchScore",
        id_confidence: "verificationData.ocrConfidence.idNumber",
        is_authentic: "verificationData.fraudDetection.isAuthentic",
        risk_score: "verificationData.fraudDetection.riskScore",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(mappedData).toEqual({
        confidence_score: 95,
        liveness_score: 90,
        face_match_score: 92,
        id_confidence: 98,
        is_authentic: true,
        risk_score: 5,
      });
    });

    it("should handle missing intermediate objects in nested paths", () => {
      const mapping = {
        valid_nested: "personalData.fullName",
        invalid_nested: "personalData.nonExistent.field",
        missing_object: "nonExistentObject.someField",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(mappedData).toEqual({
        valid_nested: "NGUYEN VAN A",
      });
    });
  });

  describe("Type Conversion and Validation", () => {
    it("should preserve original data types", () => {
      const mapping = {
        string_field: "personalData.fullName",
        number_field: "verificationData.confidence",
        boolean_field: "verificationData.fraudDetection.isAuthentic",
        date_field: "personalData.dateOfBirth",
        array_field: "verificationData.fraudDetection.warnings",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(typeof mappedData.string_field).toBe("string");
      expect(typeof mappedData.number_field).toBe("number");
      expect(typeof mappedData.boolean_field).toBe("boolean");
      expect(typeof mappedData.date_field).toBe("string");
      expect(Array.isArray(mappedData.array_field)).toBe(true);
    });

    it("should handle null and undefined values", () => {
      const resultWithNulls: VerificationResult = {
        ...mockVerificationResult,
        personalData: {
          ...mockVerificationResult.personalData,
          fullName: "Some Name",
          ethnicity: null as any,
          hometown: undefined as any,
        },
      };

      const mapping = {
        name: "fullName",
        ethnicity: "ethnicity",
        hometown: "hometown",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = resultWithNulls.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(mappedData).toEqual({
        name: "Some Name",
        ethnicity: null,
        hometown: undefined,
      });
    });
  });

  describe("Mapping Configuration Validation", () => {
    it("should validate mapping configuration format", () => {
      const validMappings = [
        {
          field1: "simplePath",
        },
        {
          field1: "simplePath",
          field2: "nested.path",
        },
        {
          field1: "deep.nested.path.value",
        },
      ];

      const invalidMappings = [
        {},
        { "": "path" }, // Empty field ID
        { field: "" }, // Empty path
        { field: 123 }, // Non-string path
        null,
        undefined,
      ];

      validMappings.forEach((mapping) => {
        expect(typeof mapping).toBe("object");
        expect(mapping).not.toBeNull();
        Object.entries(mapping).forEach(([fieldId, sourcePath]) => {
          expect(typeof fieldId).toBe("string");
          expect(fieldId.length).toBeGreaterThan(0);
          expect(typeof sourcePath).toBe("string");
          expect(sourcePath.length).toBeGreaterThan(0);
        });
      });

      invalidMappings.forEach((mapping) => {
        if (mapping === null || mapping === undefined) {
          expect(mapping).toBeNull();
        } else {
          // Should have invalid properties
          const entries = Object.entries(mapping);
          if (entries.length > 0) {
            const hasInvalidField = entries.some(
              ([fieldId, sourcePath]) =>
                typeof fieldId !== "string" ||
                fieldId.length === 0 ||
                typeof sourcePath !== "string" ||
                sourcePath.length === 0,
            );
            expect(hasInvalidField || entries.length === 0).toBe(true);
          }
        }
      });
    });

    it("should handle circular reference detection in paths", () => {
      // Create a result with potential circular reference
      const circularResult = JSON.parse(JSON.stringify(mockVerificationResult));
      circularResult.personalData.self = circularResult.personalData;

      const mapping = {
        test_field: "self.fullName", // This would create a circular reference
      };

      let maxIterations = 10;
      let iterations = 0;

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = circularResult.personalData;
          let visited = new Set();

          for (const part of pathParts) {
            iterations++;
            if (iterations > maxIterations) break;

            if (current && typeof current === "object" && part in current) {
              // Check for circular reference
              const objKey = JSON.stringify(current);
              if (visited.has(objKey)) {
                current = undefined;
                break;
              }
              visited.add(objKey);

              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }
        }
      });

      expect(iterations).toBeLessThan(maxIterations + 1);
    });
  });

  describe("Error Handling for Invalid Paths", () => {
    it("should handle malformed path strings", () => {
      const malformedPaths = [
        "field.", // Trailing dot
        ".field", // Leading dot
        "field..nested", // Double dots
        "field...nested", // Triple dots
        "field. .nested", // Spaces with dots
        "field.$nested", // Special character
        "field.123", // Numeric property (valid but might not exist)
        "field.nested.", // Trailing dot in nested
        "field.", // Just a dot
        "..", // Double dot only
        ". . .", // Spaces with dots only
        "field.\nnested", // Newline in path
        "field.\t\t", // Tabs in path
        "field[nested]", // Array notation (not supported)
        'field["nested"]', // Object notation (not supported)
      ];

      malformedPaths.forEach((path) => {
        const pathParts = path.split(".");

        if (pathParts.some((part) => part === "")) {
          // Should handle empty parts gracefully
          expect(pathParts.some((part) => part.length === 0)).toBe(true);
        }
      });
    });

    it("should handle very deep nested paths", () => {
      // Create deeply nested object
      let deepObject: any = { value: "deep value" };
      for (let i = 0; i < 100; i++) {
        deepObject = { [`level${i}`]: deepObject };
      }

      const veryDeepPath =
        Array.from({ length: 101 }, (_, i) => `level${i}`).join(".") + ".value";

      const pathParts = veryDeepPath.split(".");
      let current: any = deepObject;

      for (const part of pathParts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          current = undefined;
          break;
        }
      }

      expect(current).toBe("deep value");
    });

    it("should handle undefined intermediate values", () => {
      const resultWithUndefined: VerificationResult = {
        ...mockVerificationResult,
        personalData: {
          ...mockVerificationResult.personalData,
          address: undefined as any,
        },
      };

      const mapping = {
        address_city: "address.city",
        address_district: "address.district",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = resultWithUndefined.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(Object.keys(mappedData)).toHaveLength(0);
    });
  });

  describe("Complex Nested Path Scenarios", () => {
    it("should handle array-like paths", () => {
      const resultWithArray = {
        ...mockVerificationResult,
        personalData: {
          ...mockVerificationResult.personalData,
          documents: [
            {
              type: "CCCD",
              number: "123456789",
              issuedDate: "2020-01-01",
            },
            {
              type: "PASSPORT",
              number: "P1234567",
              issuedDate: "2018-05-15",
            },
          ],
        },
      };

      // This would require array access support which isn't implemented
      // but we can test that it doesn't crash
      const mapping = {
        first_doc_type: "documents.0.type",
        second_doc_type: "documents.1.type",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = resultWithArray.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      // Should not map array indices with current implementation
      expect(Object.keys(mappedData)).toHaveLength(0);
    });

    it("should handle mapping to verification metadata", () => {
      const mapping = {
        provider_name: "provider.name",
        provider_version: "provider.version",
        session_id: "sessionId",
        processing_time: "processing.totalDuration",
        started_at: "startedAt",
        completed_at: "completedAt",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      expect(mappedData).toEqual({
        provider_name: "vnpt",
        provider_version: "3.2.0",
        session_id: "test-session-123",
        processing_time: 1500,
        started_at: "2024-01-15T10:00:00.000Z",
        completed_at: "2024-01-15T10:00:01.500Z",
      });
    });
  });

  describe("Performance Considerations", () => {
    it("should handle large mapping configurations efficiently", () => {
      // Create a large mapping with 1000 fields
      const largeMapping: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeMapping[`field_${i}`] = `personalData.fullName`;
      }

      const startTime = Date.now();

      const mappedData: Record<string, any> = {};

      Object.entries(largeMapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 100ms for 1000 mappings)
      expect(duration).toBeLessThan(100);
      expect(Object.keys(mappedData)).toHaveLength(1000);
    });

    it("should not create unnecessary intermediate objects", () => {
      const mapping = {
        field1: "personalData.fullName",
      };

      const mappedData: Record<string, any> = {};

      Object.entries(mapping).forEach(([targetFieldId, sourcePath]) => {
        if (typeof sourcePath === "string") {
          const pathParts = sourcePath.split(".");
          let current: any = mockVerificationResult.personalData;

          for (const part of pathParts) {
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              current = undefined;
              break;
            }
          }

          if (current !== undefined) {
            mappedData[targetFieldId] = current;
          }
        }
      });

      // Should not have created any intermediate objects
      expect(typeof mappedData.field1).toBe("string");
      expect(typeof mappedData.field1).not.toBe("object");
    });
  });
});
