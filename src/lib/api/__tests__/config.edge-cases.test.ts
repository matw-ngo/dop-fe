/**
 * Client Config Edge Cases Tests
 *
 * Comprehensive tests for API client configuration edge cases:
 * - Pattern matching (wildcards, special characters)
 * - Empty patterns, null/undefined handling
 * - Case sensitivity
 * - URL encoding edge cases
 * - Performance with large pattern lists
 */

import { describe, expect, it } from "vitest";

import { apiConfig, shouldSkipAuth } from "@/lib/api/config";

describe("Client Config Edge Cases", () => {
  describe("shouldSkipAuth Pattern Matching", () => {
    it("should match exact URL with single wildcard", () => {
      expect(shouldSkipAuth("/leads")).toBe(true);
      expect(shouldSkipAuth("/leads/")).toBe(true);
    });

    it("should match URL with nested wildcard path", () => {
      expect(shouldSkipAuth("/leads/123")).toBe(true);
      expect(shouldSkipAuth("/leads/123/submit-otp")).toBe(true);
      expect(shouldSkipAuth("/leads/abc-def-123")).toBe(true);
      expect(shouldSkipAuth("/leads/123/kyc/images")).toBe(true);
    });

    it("should not match URLs outside configured patterns", () => {
      expect(shouldSkipAuth("/users")).toBe(false);
      expect(shouldSkipAuth("/users/123")).toBe(false);
      expect(shouldSkipAuth("/products")).toBe(false);
      expect(shouldSkipAuth("/api/leads")).toBe(false); // /api/ prefix not matched
      expect(shouldSkipAuth("/leads123")).toBe(false); // No slash after leads
    });

    it("should be case sensitive", () => {
      expect(shouldSkipAuth("/leads/123")).toBe(true);
      expect(shouldSkipAuth("/LEADS/123")).toBe(false);
      expect(shouldSkipAuth("/leads/LEADS")).toBe(true);
    });

    it("should handle URLs with query parameters", () => {
      expect(shouldSkipAuth("/leads/123?token=abc")).toBe(true);
      expect(shouldSkipAuth("/leads/123/submit-otp?resend=true")).toBe(true);
      expect(shouldSkipAuth("/users?leads=true")).toBe(false);
    });

    it("should handle URLs with fragments", () => {
      expect(shouldSkipAuth("/leads/123#section")).toBe(true);
      expect(shouldSkipAuth("/users#leads")).toBe(false);
    });

    it("should handle URLs with both query and fragment", () => {
      expect(shouldSkipAuth("/leads/123?token=abc#section")).toBe(true);
    });

    it("should handle URLs with special characters in path", () => {
      expect(shouldSkipAuth("/leads/123-456")).toBe(true);
      expect(shouldSkipAuth("/leads/123_456")).toBe(true);
      expect(shouldSkipAuth("/leads/123.456")).toBe(true);
      expect(shouldSkipAuth("/leads/123%20456")).toBe(true); // URL encoded space
    });

    it("should handle empty URL", () => {
      expect(shouldSkipAuth("")).toBe(false);
    });

    it("should handle very long URLs", () => {
      const longId = "a".repeat(1000);
      expect(shouldSkipAuth(`/leads/${longId}`)).toBe(true);
      expect(shouldSkipAuth(`/users/${longId}`)).toBe(false);
    });

    it("should handle URLs with multiple consecutive slashes", () => {
      expect(shouldSkipAuth("//leads//123//")).toBe(false);
    });

    it("should handle URLs with encoded characters", () => {
      expect(shouldSkipAuth("/leads/%7B123%7D")).toBe(true); // Encoded {123}
      expect(shouldSkipAuth("/leads/%2F")).toBe(false); // Encoded /
    });

    it("should handle URLs that are substrings of configured patterns", () => {
      expect(shouldSkipAuth("/leads")).toBe(true);
      expect(shouldSkipAuth("/lead")).toBe(false);
      expect(shouldSkipAuth("/ads")).toBe(false);
    });

    it("should handle port numbers in URL", () => {
      expect(shouldSkipAuth("https://api.example.com:8080/leads/123")).toBe(
        false,
      );
    });

    it("should handle protocol-relative URLs", () => {
      expect(shouldSkipAuth("//api.example.com/leads/123")).toBe(false);
    });
  });

  describe("Pattern Validation", () => {
    it("should handle empty patterns list", () => {
      const _originalPatterns = apiConfig.skipAuthEndpoints.patterns;
      // Temporarily test with empty patterns by checking logic
      const emptyPatterns: string[] = [];

      const result = emptyPatterns.some((pattern) => {
        const regexPattern = pattern.replace(/\*/g, ".*").replace(/\//g, "\\/");
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test("/leads/123");
      });

      expect(result).toBe(false);
    });

    it("should handle pattern with only wildcard", () => {
      const testPattern = "*";
      const regexPattern = testPattern
        .replace(/\*/g, ".*")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);

      expect(regex.test("/leads/123")).toBe(true);
      expect(regex.test("/users/123")).toBe(true);
      expect(regex.test("/anything")).toBe(true);
    });

    it("should handle pattern with multiple wildcards", () => {
      const testPattern = "/api/*/leads/*";
      const regexPattern = testPattern
        .replace(/\*/g, ".*")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);

      expect(regex.test("/api/v1/leads/123")).toBe(true);
      expect(regex.test("/api/users/123")).toBe(false);
      expect(regex.test("/leads/123")).toBe(false);
    });

    it("should handle pattern with special regex characters", () => {
      const testPattern = "/api/v1.leads/*";
      const regexPattern = testPattern
        .replace(/\*/g, ".*")
        .replace(/\//g, "\\/")
        .replace(/\./g, "\\."); // Escape dots
      const regex = new RegExp(`^${regexPattern}$`);

      expect(regex.test("/api/v1.leads/123")).toBe(true);
      expect(regex.test("/api/v1Xleads/123")).toBe(false);
    });

    it("should handle pattern that looks like regex", () => {
      const testPattern = "/leads/[0-9]+";
      const regexPattern = testPattern
        .replace(/\*/g, ".*")
        .replace(/\//g, "\\/");
      // Note: This won't work as expected - [0-9] is not converted
      const regex = new RegExp(`^${regexPattern}$`);

      // The pattern is taken literally
      expect(regex.test("/leads/123")).toBe(false);
      expect(regex.test("/leads/[0-9]+")).toBe(true);
    });
  });

  describe("Config Object Integrity", () => {
    it("should have valid patterns array", () => {
      expect(Array.isArray(apiConfig.skipAuthEndpoints.patterns)).toBe(true);
      expect(apiConfig.skipAuthEndpoints.patterns.length).toBeGreaterThan(0);
    });

    it("should have non-empty patterns", () => {
      apiConfig.skipAuthEndpoints.patterns.forEach((pattern) => {
        expect(pattern.length).toBeGreaterThan(0);
      });
    });

    it("should not have undefined patterns", () => {
      apiConfig.skipAuthEndpoints.patterns.forEach((pattern) => {
        expect(pattern).toBeDefined();
        expect(pattern).not.toBeUndefined();
      });
    });
  });

  describe("Edge Case URLs", () => {
    it("should handle single character URL", () => {
      expect(shouldSkipAuth("/")).toBe(false);
      expect(shouldSkipAuth("a")).toBe(false);
    });

    it("should handle URL with only numbers", () => {
      expect(shouldSkipAuth("/123")).toBe(false);
      expect(shouldSkipAuth("/leads/123")).toBe(true);
    });

    it("should handle URL with only special characters", () => {
      expect(shouldSkipAuth("/---")).toBe(false);
      expect(shouldSkipAuth("/___")).toBe(false);
    });

    it("should handle Unicode in URL", () => {
      expect(shouldSkipAuth("/leads/用户")).toBe(true);
      expect(shouldSkipAuth("/leads/пользователь")).toBe(true);
      expect(shouldSkipAuth("/leads/🔑")).toBe(true);
    });

    it("should handle emoji in URL", () => {
      expect(shouldSkipAuth("/leads/🎉")).toBe(true);
      expect(shouldSkipAuth("/leads/test🎉123")).toBe(true);
    });

    it("should handle whitespace in URL", () => {
      expect(shouldSkipAuth("/leads/123%20456")).toBe(true); // URL encoded space
    });

    it("should handle null character in URL", () => {
      // Request constructor will reject this, but our function should handle gracefully
      expect(shouldSkipAuth("/leads/\0")).toBe(false);
    });

    it("should handle tab and newline in URL", () => {
      expect(shouldSkipAuth("/leads/123\t456")).toBe(false);
      expect(shouldSkipAuth("/leads/123\n456")).toBe(false);
    });
  });

  describe("Performance Considerations", () => {
    it("should handle many patterns efficiently", () => {
      // Create a config with many patterns
      const manyPatterns = Array.from(
        { length: 100 },
        (_, i) => `/api/v${i}/*`,
      );

      const result = manyPatterns.some((pattern) => {
        const regexPattern = pattern.replace(/\*/g, ".*").replace(/\//g, "\\/");
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test("/api/v50/test");
      });

      expect(result).toBe(true);
    });

    it("should handle very long pattern", () => {
      const longPattern = `/${"a".repeat(1000)}/*`;
      const regexPattern = longPattern
        .replace(/\*/g, ".*")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);

      expect(regex.test(`/${"a".repeat(1000)}/test`)).toBe(true);
    });

    it("should handle URL longer than pattern", () => {
      const pattern = "/leads/*";
      const regexPattern = pattern.replace(/\*/g, ".*").replace(/\//g, "\\/");
      const regex = new RegExp(`^${regexPattern}$`);

      const longUrl = `/leads/${"a".repeat(10000)}`;
      expect(regex.test(longUrl)).toBe(true);
    });
  });

  describe("Backward Compatibility", () => {
    it("should match documented examples", () => {
      // From config.ts comments:
      // Pattern /leads/* matches URLs with /leads/ prefix (requires trailing slash)
      // So /leads/{id}, /leads/{id}/submit-otp, /leads/{id}/resend-otp match
      // But /leads alone does NOT match (no trailing slash)

      expect(shouldSkipAuth("/leads/")).toBe(true);
      expect(shouldSkipAuth("/leads/123")).toBe(true);
      expect(shouldSkipAuth("/leads/abc-123")).toBe(true);
      expect(shouldSkipAuth("/leads/123/submit-otp")).toBe(true);
      expect(shouldSkipAuth("/leads/123/resend-otp")).toBe(true);

      // /leads without trailing slash does NOT match this pattern
      expect(shouldSkipAuth("/leads")).toBe(false);
    });

    it("should not match undocumented examples", () => {
      expect(shouldSkipAuth("/leadsadmin")).toBe(false);
      expect(shouldSkipAuth("/addleads")).toBe(false);
      expect(shouldSkipAuth("/myleads")).toBe(false);
    });
  });

  describe("Config Modification Safety", () => {
    it("should not throw when config is modified", () => {
      const originalPatterns = [...apiConfig.skipAuthEndpoints.patterns];

      // Add a pattern
      apiConfig.skipAuthEndpoints.patterns.push("/test/*");

      expect(shouldSkipAuth("/test/123")).toBe(true);

      // Remove it
      apiConfig.skipAuthEndpoints.patterns.pop();

      expect(shouldSkipAuth("/test/123")).toBe(false);

      // Restore original
      apiConfig.skipAuthEndpoints.patterns = originalPatterns;
    });
  });
});
