/**
 * eKYC Security Tests
 *
 * Security validation tests for eKYC operations:
 * - SC-010: No PII in logs
 * - PII sanitization verification
 * - Base64 image data sanitization
 * - Sensitive data masking
 *
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createAuditLogEntry,
  logAuditEvent,
  logConfigFetchStart,
  logConfigFetchSuccess,
  logSubmitStart,
  logSubmitSuccess,
  logSessionInit,
} from "@/lib/ekyc/audit-logger";
import type { AuditLogEntry, AuditEventType } from "@/lib/ekyc/audit-logger";

describe("eKYC Security Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Security Test T420: PII sanitization in audit logs (SC-010)
   */
  describe("SC-010: No PII in Logs", () => {
    it("should sanitize PII from audit log metadata", () => {
      const metadata = {
        id: "001234567890",
        idNumber: "001234567890",
        fullName: "NGUYEN VAN ANH",
        name: "NGUYEN VAN ANH",
        address: "123 Nguyễn Văn Linh, TP.HCM",
        phone: "0901234567",
        email: "test@example.com",
        dateOfBirth: "15/01/1990",
        birth_day: "15/01/1990",
        safeField: "This should remain",
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      expect(entry.metadata).toBeDefined();
      expect(entry.metadata?.id).not.toBe("001234567890");
      expect(entry.metadata?.idNumber).not.toBe("001234567890");
      expect(entry.metadata?.fullName).not.toBe("NGUYEN VAN ANH");
      expect(entry.metadata?.name).not.toBe("NGUYEN VAN ANH");
      expect(entry.metadata?.address).not.toBe("123 Nguyễn Văn Linh, TP.HCM");
      expect(entry.metadata?.phone).not.toBe("0901234567");
      expect(entry.metadata?.email).not.toBe("test@example.com");
      expect(entry.metadata?.dateOfBirth).not.toBe("15/01/1990");
      expect(entry.metadata?.birth_day).not.toBe("15/01/1990");
      expect(entry.metadata?.safeField).toBe("This should remain");
    });

    it("should mask PII values with asterisks", () => {
      const metadata = {
        fullName: "NGUYEN VAN ANH",
        idNumber: "001234567890",
        phone: "0901234567",
        email: "test@example.com",
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      // Check that PII fields are masked
      expect(entry.metadata?.fullName).toMatch(/^\*\{2,}/); // Starts with asterisks
      expect(entry.metadata?.idNumber).toMatch(/^\*\{2,}/);
      expect(entry.metadata?.phone).toMatch(/^\*\{2,}/);
      expect(entry.metadata?.email).toMatch(/^\*\{2,}/);

      // Check that masking preserves first and last characters
      expect(entry.metadata?.fullName).not.toBe("NGUYEN VAN ANH");
      expect(entry.metadata?.fullName).toContain("NG"); // First two chars
      expect(entry.metadata?.fullName).toContain("ANH"); // Last three chars
    });

    it("should remove base64 image data from logs", () => {
      const metadata = {
        base64Image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        faceImage: "base64stringdata",
        hashValue: "abc123def456",
        normalImage: "not-base64",
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      // Base64 and hash fields should be removed
      expect(entry.metadata?.base64Image).toBeUndefined();
      expect(entry.metadata?.faceImage).toBeUndefined();
      expect(entry.metadata?.hashValue).toBeUndefined();

      // Normal fields should remain
      expect(entry.metadata?.normalImage).toBe("not-base64");
    });

    it("should remove long alphanumeric strings that look like base64", () => {
      const metadata = {
        longString: "a".repeat(250), // Long alphanumeric string
        shortString: "abc",
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      // Long string should be detected as base64 and removed
      expect(entry.metadata?.longString).toBe("[BASE64_DATA_REMOVED]");
      expect(entry.metadata?.shortString).toBe("abc");
    });

    it("should sanitize nested objects recursively", () => {
      const metadata = {
        user: {
          fullName: "NGUYEN VAN ANH",
          idNumber: "001234567890",
          address: {
            street: "123 Main St",
            city: "Ho Chi Minh City",
          },
        },
        documents: [
          {
            type: "CCCD",
            base64Data: "data:image/png;base64,ABC123",
          },
        ],
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      // Check nested PII is masked
      expect(entry.metadata?.user?.fullName).not.toBe("NGUYEN VAN ANH");
      expect(entry.metadata?.user?.idNumber).not.toBe("001234567890");

      // Check safe fields remain
      expect(entry.metadata?.user?.address?.street).toBe("123 Main St");
      expect(entry.metadata?.user?.address?.city).toBe("Ho Chi Minh City");

      // Check nested base64 is removed
      expect(entry.metadata?.documents?.[0]?.base64Data).toBeUndefined();
    });

    it("should sanitize arrays with PII data", () => {
      const metadata = {
        users: [
          { name: "USER ONE", id: "111" },
          { name: "USER TWO", id: "222" },
        ],
        ids: ["001234567890", "098765432123"],
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      // Arrays should be sanitized
      expect(entry.metadata?.users).toBeDefined();
      expect(entry.metadata?.users?.[0]?.name).not.toBe("USER ONE");
      expect(entry.metadata?.ids?.[0]).not.toBe("001234567890");
    });
  });

  /**
   * Security Test T421: Verify audit log functions don't leak PII
   */
  describe("Audit Log Functions Security", () => {
    it("should not log PII in config fetch events", () => {
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      logConfigFetchStart("lead-123");

      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls;
      const logData = JSON.stringify(logCalls);

      // Verify no PII patterns in logs
      expect(logData).not.toMatch(/\d{12}/); // ID number pattern
      expect(logData).not.toMatch(/base64/i);
      expect(logData).not.toMatch(/data:image/i);

      consoleSpy.mockRestore();
    });

    it("should not log PII in submit events", () => {
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      logSubmitStart("lead-123", "session-abc");

      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls;
      const logData = JSON.stringify(logCalls);

      // Verify no PII patterns in logs
      expect(logData).not.toMatch(/\d{12}/);
      expect(logData).not.toMatch(/NGUYEN VAN/i);
      expect(logData).not.toMatch(/base64/i);

      consoleSpy.mockRestore();
    });

    it("should not log PII in session init events", () => {
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      logSessionInit("lead-123", "session-abc");

      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls;
      const logData = JSON.stringify(logCalls);

      // Verify session ID is logged but no PII
      expect(logData).toContain("session-abc");
      expect(logData).toContain("lead-123");
      expect(logData).not.toMatch(/\d{12}/);

      consoleSpy.mockRestore();
    });

    it("should sanitize metadata in audit log events", () => {
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        level: "info" as any,
        eventType: "ekyc.test.event" as AuditEventType,
        leadId: "lead-123",
        sessionId: "session-abc",
        message: "Test event with PII",
        metadata: {
          fullName: "NGUYEN VAN ANH",
          idNumber: "001234567890",
          base64Image: "data:image/png;base64,ABC123",
        } as any,
      };

      logAuditEvent(entry);

      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls;
      const logData = JSON.stringify(logCalls);

      // Verify PII is not in logs
      expect(logData).not.toContain("NGUYEN VAN ANH");
      expect(logData).not.toContain("001234567890");
      expect(logData).not.toContain("data:image/png;base64");

      consoleSpy.mockRestore();
    });
  });

  /**
   * Security Tests: Base64 detection and removal
   */
  describe("Base64 Data Detection", () => {
    it("should detect and remove base64 encoded images", () => {
      const testCases = [
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
        "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbybl",
        "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQ",
      ];

      testCases.forEach((base64String) => {
        const metadata = { image: base64String };
        const entry = createAuditLogEntry(
          "info" as any,
          "ekyc.test.event" as AuditEventType,
          "Test event",
          metadata,
          "lead-123",
          "session-abc",
        );

        expect(entry.metadata?.image).toBe("[BASE64_DATA_REMOVED]");
      });
    });

    it("should preserve non-base64 data", () => {
      const metadata = {
        shortString: "abc123",
        normalText: "Hello World",
        number: 12345,
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      expect(entry.metadata?.shortString).toBe("abc123");
      expect(entry.metadata?.normalText).toBe("Hello World");
      expect(entry.metadata?.number).toBe(12345);
    });
  });

  /**
   * Security Tests: Field name based sanitization
   */
  describe("Field Name Based Sanitization", () => {
    it("should sanitize based on sensitive field names", () => {
      const metadata = {
        img_front: "some-value",
        img_back: "some-value",
        base64_face_img: "some-value",
        hash_doc: "some-value",
        face_data: "some-value",
        safe_field: "some-value",
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      // Fields with sensitive keywords should be redacted
      expect(entry.metadata?.img_front).toBe("[REDACTED]");
      expect(entry.metadata?.img_back).toBe("[REDACTED]");
      expect(entry.metadata?.base64_face_img).toBe("[REDACTED]");
      expect(entry.metadata?.hash_doc).toBe("[REDACTED]");
      expect(entry.metadata?.face_data).toBe("[REDACTED]");
      expect(entry.metadata?.safe_field).toBe("some-value");
    });

    it("should handle case-insensitive field name matching", () => {
      const metadata = {
        BASE64_DATA: "value",
        Img_Front: "value",
        hAsh_dOc: "value",
        FaCe_Img: "value",
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      expect(entry.metadata?.BASE64_DATA).toBe("[REDACTED]");
      expect(entry.metadata?.Img_Front).toBe("[REDACTED]");
      expect(entry.metadata?.hAsh_dOc).toBe("[REDACTED]");
      expect(entry.metadata?.FaCe_Img).toBe("[REDACTED]");
    });
  });

  /**
   * Security Tests: Edge cases
   */
  describe("Security Edge Cases", () => {
    it("should handle null and undefined metadata gracefully", () => {
      const entry1 = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        null as any,
        "lead-123",
        "session-abc",
      );

      expect(entry1.metadata).toBeUndefined();

      const entry2 = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        undefined as any,
        "lead-123",
        "session-abc",
      );

      expect(entry2.metadata).toBeUndefined();
    });

    it("should handle circular references without crashing", () => {
      const metadata: any = { name: "test" };
      metadata.self = metadata;

      expect(() => {
        createAuditLogEntry(
          "info" as any,
          "ekyc.test.event" as AuditEventType,
          "Test event",
          metadata,
          "lead-123",
          "session-abc",
        );
      }).not.toThrow();
    });

    it("should handle very deep object nesting", () => {
      let metadata: any = { value: "deep" };
      for (let i = 0; i < 100; i++) {
        metadata = { nested: metadata };
      }

      expect(() => {
        createAuditLogEntry(
          "info" as any,
          "ekyc.test.event" as AuditEventType,
          "Test event",
          metadata,
          "lead-123",
          "session-abc",
        );
      }).not.toThrow();
    });

    it("should handle special characters in PII", () => {
      const metadata = {
        fullName: "NGUYỄN VĂN ANH", // Vietnamese characters
        address: "123 Đường Nguyễn Văn Linh, TP.HCM",
        idNumber: "001234567890",
      };

      const entry = createAuditLogEntry(
        "info" as any,
        "ekyc.test.event" as AuditEventType,
        "Test event",
        metadata,
        "lead-123",
        "session-abc",
      );

      // Should still mask PII with special characters
      expect(entry.metadata?.fullName).not.toBe("NGUYỄN VĂN ANH");
      expect(entry.metadata?.address).not.toBe(
        "123 Đường Nguyễn Văn Linh, TP.HCM",
      );
      expect(entry.metadata?.idNumber).not.toBe("001234567890");
    });
  });

  /**
   * Security Tests: Verify SC-010 compliance
   */
  describe("SC-010 Compliance Verification", () => {
    it("should ensure complete PII removal across all audit events", () => {
      const piiData = {
        idNumber: "001234567890",
        fullName: "NGUYEN VAN ANH",
        dateOfBirth: "15/01/1990",
        address: "123 Nguyễn Văn Linh, TP.HCM",
        base64Image: "data:image/png;base64,ABC123",
      };

      const eventTypes: AuditEventType[] = [
        "ekyc.config.fetch.start",
        "ekyc.submit.start",
        "ekyc.submit.success",
        "ekyc.session.init",
      ];

      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      eventTypes.forEach((eventType) => {
        const entry = createAuditLogEntry(
          "info" as any,
          eventType,
          "Test event",
          piiData,
          "lead-123",
          "session-abc",
        );

        logAuditEvent(entry);
      });

      const allLogs = consoleSpy.mock.calls.map((call) => JSON.stringify(call));
      const combinedLogs = allLogs.join(" ");

      // Verify no PII in any logs
      expect(combinedLogs).not.toContain("001234567890");
      expect(combinedLogs).not.toContain("NGUYEN VAN ANH");
      expect(combinedLogs).not.toContain("15/01/1990");
      expect(combinedLogs).not.toContain("123 Nguyễn Văn Linh");
      expect(combinedLogs).not.toContain("data:image/png;base64");

      consoleSpy.mockRestore();
    });
  });
});
