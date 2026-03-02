import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  setCookie,
  getCookie,
  deleteCookie,
  type CookieOptions,
} from "../cookie";

describe("Cookie Utilities", () => {
  let cookieStore: Record<string, string> = {};

  beforeEach(() => {
    // Reset cookie store
    cookieStore = {};

    // Mock document.cookie with a proper getter/setter
    Object.defineProperty(document, "cookie", {
      get: () => {
        return Object.entries(cookieStore)
          .map(([name, value]) => `${name}=${value}`)
          .join("; ");
      },
      set: (cookieString: string) => {
        const [nameValue] = cookieString.split(";");
        const [name, value] = nameValue.split("=");

        if (name && value !== undefined) {
          // Check if this is a deletion (max-age=0 or negative)
          const isDelete =
            cookieString.includes("max-age=0") ||
            cookieString.includes("max-age=-");

          if (isDelete) {
            delete cookieStore[name.trim()];
          } else {
            cookieStore[name.trim()] = value;
          }
        }
      },
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original document.cookie
    Object.defineProperty(document, "cookie", {
      get: () => "",
      set: () => {},
      configurable: true,
    });
  });

  describe("setCookie", () => {
    it("should set a cookie with default options", () => {
      const result = setCookie("test_cookie", "test_value");

      expect(result).toBe(true);
      expect(document.cookie).toContain("test_cookie=test_value");
    });

    it("should set a cookie with custom maxAge", () => {
      const result = setCookie("test_cookie", "test_value", { maxAge: 3600 });

      expect(result).toBe(true);
      expect(document.cookie).toContain("test_cookie=test_value");
    });

    it("should set a cookie with secure flag", () => {
      const result = setCookie("test_cookie", "test_value", { secure: true });

      expect(result).toBe(true);
      // Note: document.cookie only returns name=value pairs, not attributes
      // The secure flag is set but not readable via document.cookie
      expect(document.cookie).toContain("test_cookie=test_value");
    });

    it("should set a cookie with SameSite=Strict", () => {
      const result = setCookie("test_cookie", "test_value", {
        sameSite: "Strict",
      });

      expect(result).toBe(true);
      expect(document.cookie).toContain("test_cookie=test_value");
    });

    it("should set a cookie with SameSite=Lax", () => {
      const result = setCookie("test_cookie", "test_value", {
        sameSite: "Lax",
      });

      expect(result).toBe(true);
      expect(document.cookie).toContain("test_cookie=test_value");
    });

    it("should set a cookie with SameSite=None", () => {
      const result = setCookie("test_cookie", "test_value", {
        sameSite: "None",
      });

      expect(result).toBe(true);
      expect(document.cookie).toContain("test_cookie=test_value");
    });

    it("should set a cookie with custom path", () => {
      const result = setCookie("test_cookie", "test_value", {
        path: "/custom",
      });

      expect(result).toBe(true);
      // Cookie is set but may not be readable if current path doesn't match
      // This is expected browser behavior
    });

    it("should set a cookie with all custom options", () => {
      const options: CookieOptions = {
        maxAge: 7200,
        secure: true,
        sameSite: "Strict",
        path: "/app",
      };

      const result = setCookie("test_cookie", "test_value", options);

      expect(result).toBe(true);
    });

    it("should URL-encode cookie name with special characters", () => {
      const result = setCookie("test cookie!", "value");

      expect(result).toBe(true);
      // The encoded name should be in document.cookie
      expect(document.cookie).toContain("test%20cookie");
    });

    it("should URL-encode cookie value with special characters", () => {
      const result = setCookie("test", "value with spaces & symbols!");

      expect(result).toBe(true);
      expect(document.cookie).toContain("test=");
    });

    it("should handle empty string value", () => {
      const result = setCookie("test_cookie", "");

      expect(result).toBe(true);
      expect(document.cookie).toContain("test_cookie=");
    });

    it("should handle JSON string value", () => {
      const jsonValue = JSON.stringify({ key: "value", number: 123 });
      const result = setCookie("test_cookie", jsonValue);

      expect(result).toBe(true);
      expect(document.cookie).toContain("test_cookie=");
    });

    it("should return false in SSR environment (no document)", () => {
      const originalDocument = global.document;
      // @ts-expect-error - Simulating SSR environment
      delete global.document;

      const result = setCookie("test_cookie", "test_value");

      expect(result).toBe(false);

      // Restore document
      global.document = originalDocument;
    });

    it("should handle errors gracefully and return false", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock document.cookie to throw an error
      Object.defineProperty(document, "cookie", {
        set: () => {
          throw new Error("Cookie write failed");
        },
        configurable: true,
      });

      const result = setCookie("test_cookie", "test_value");

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Cookie Utils] Failed to set cookie test_cookie:",
        ),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();

      // Restore document.cookie
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {},
        configurable: true,
      });
    });
  });

  describe("getCookie", () => {
    it("should retrieve an existing cookie", () => {
      document.cookie = "test_cookie=test_value; path=/";

      const value = getCookie("test_cookie");

      expect(value).toBe("test_value");
    });

    it("should return null for non-existent cookie", () => {
      const value = getCookie("non_existent_cookie");

      expect(value).toBe(null);
    });

    it("should URL-decode cookie value", () => {
      // Set a cookie with encoded value
      document.cookie = "test_cookie=value%20with%20spaces; path=/";

      const value = getCookie("test_cookie");

      expect(value).toBe("value with spaces");
    });

    it("should URL-decode cookie name", () => {
      // Set a cookie with encoded name
      document.cookie = "test%20cookie=value; path=/";

      const value = getCookie("test cookie");

      expect(value).toBe("value");
    });

    it("should handle multiple cookies", () => {
      document.cookie = "cookie1=value1; path=/";
      document.cookie = "cookie2=value2; path=/";
      document.cookie = "cookie3=value3; path=/";

      expect(getCookie("cookie1")).toBe("value1");
      expect(getCookie("cookie2")).toBe("value2");
      expect(getCookie("cookie3")).toBe("value3");
    });

    it("should handle cookies with similar names", () => {
      document.cookie = "test=value1; path=/";
      document.cookie = "test_cookie=value2; path=/";
      document.cookie = "test_cookie_long=value3; path=/";

      expect(getCookie("test")).toBe("value1");
      expect(getCookie("test_cookie")).toBe("value2");
      expect(getCookie("test_cookie_long")).toBe("value3");
    });

    it("should handle empty string cookie value", () => {
      document.cookie = "test_cookie=; path=/";

      const value = getCookie("test_cookie");

      expect(value).toBe("");
    });

    it("should handle JSON string cookie value", () => {
      const jsonValue = JSON.stringify({ key: "value", number: 123 });
      document.cookie = `test_cookie=${encodeURIComponent(jsonValue)}; path=/`;

      const value = getCookie("test_cookie");

      expect(value).toBe(jsonValue);
      expect(JSON.parse(value!)).toEqual({ key: "value", number: 123 });
    });

    it("should handle cookies with special characters in value", () => {
      const specialValue = "value&with=special;chars";
      document.cookie = `test_cookie=${encodeURIComponent(specialValue)}; path=/`;

      const value = getCookie("test_cookie");

      expect(value).toBe(specialValue);
    });

    it("should return null in SSR environment (no document)", () => {
      const originalDocument = global.document;
      // @ts-expect-error - Simulating SSR environment
      delete global.document;

      const value = getCookie("test_cookie");

      expect(value).toBe(null);

      // Restore document
      global.document = originalDocument;
    });

    it("should handle errors gracefully and return null", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock document.cookie to throw an error
      Object.defineProperty(document, "cookie", {
        get: () => {
          throw new Error("Cookie read failed");
        },
        configurable: true,
      });

      const value = getCookie("test_cookie");

      expect(value).toBe(null);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Cookie Utils] Failed to get cookie test_cookie:",
        ),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();

      // Restore document.cookie
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {},
        configurable: true,
      });
    });
  });

  describe("deleteCookie", () => {
    it("should delete an existing cookie", () => {
      document.cookie = "test_cookie=test_value; path=/";
      expect(document.cookie).toContain("test_cookie=test_value");

      deleteCookie("test_cookie");

      expect(document.cookie).not.toContain("test_cookie=test_value");
    });

    it("should delete a cookie with custom path", () => {
      document.cookie = "test_cookie=test_value; path=/custom";

      deleteCookie("test_cookie", "/custom");

      // Cookie should be deleted (though we can't verify path-specific deletion in jsdom)
      expect(document.cookie).not.toContain("test_cookie=test_value");
    });

    it("should handle deleting non-existent cookie gracefully", () => {
      deleteCookie("non_existent_cookie");

      // Should not throw error
      expect(document.cookie).not.toContain("non_existent_cookie");
    });

    it("should URL-encode cookie name when deleting", () => {
      document.cookie = "test%20cookie=value; path=/";

      deleteCookie("test cookie");

      expect(document.cookie).not.toContain("test%20cookie");
    });

    it("should handle SSR environment (no document) gracefully", () => {
      const originalDocument = global.document;
      // @ts-expect-error - Simulating SSR environment
      delete global.document;

      // Should not throw error
      deleteCookie("test_cookie");

      // Restore document
      global.document = originalDocument;
    });

    it("should handle errors gracefully", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock document.cookie to throw an error
      Object.defineProperty(document, "cookie", {
        set: () => {
          throw new Error("Cookie delete failed");
        },
        configurable: true,
      });

      // Should not throw error
      deleteCookie("test_cookie");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Cookie Utils] Failed to delete cookie test_cookie:",
        ),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();

      // Restore document.cookie
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {},
        configurable: true,
      });
    });

    it("should delete multiple cookies independently", () => {
      document.cookie = "cookie1=value1; path=/";
      document.cookie = "cookie2=value2; path=/";
      document.cookie = "cookie3=value3; path=/";

      deleteCookie("cookie2");

      expect(document.cookie).toContain("cookie1=value1");
      expect(document.cookie).not.toContain("cookie2=value2");
      expect(document.cookie).toContain("cookie3=value3");
    });
  });

  describe("Round-trip operations", () => {
    it("should preserve value through set and get", () => {
      const testValue = "test_value_123";

      setCookie("test_cookie", testValue);
      const retrieved = getCookie("test_cookie");

      expect(retrieved).toBe(testValue);
    });

    it("should preserve special characters through set and get", () => {
      const testValue = "value with spaces & symbols! @#$%";

      setCookie("test_cookie", testValue);
      const retrieved = getCookie("test_cookie");

      expect(retrieved).toBe(testValue);
    });

    it("should preserve JSON through set and get", () => {
      const testValue = JSON.stringify({
        id: "123",
        status: "active",
        data: { nested: true },
      });

      setCookie("test_cookie", testValue);
      const retrieved = getCookie("test_cookie");

      expect(retrieved).toBe(testValue);
      expect(JSON.parse(retrieved!)).toEqual(JSON.parse(testValue));
    });

    it("should preserve Unicode characters through set and get", () => {
      const testValue = "Tiếng Việt 中文 日本語 🎉";

      setCookie("test_cookie", testValue);
      const retrieved = getCookie("test_cookie");

      expect(retrieved).toBe(testValue);
    });

    it("should handle set, get, and delete cycle", () => {
      const testValue = "test_value";

      setCookie("test_cookie", testValue);
      expect(getCookie("test_cookie")).toBe(testValue);

      deleteCookie("test_cookie");
      expect(getCookie("test_cookie")).toBe(null);
    });
  });

  describe("Edge cases", () => {
    it("should handle very long cookie values", () => {
      // Create a value close to 4KB limit
      const longValue = "x".repeat(3000);

      const result = setCookie("test_cookie", longValue);
      const retrieved = getCookie("test_cookie");

      expect(result).toBe(true);
      expect(retrieved).toBe(longValue);
    });

    it("should handle cookie name with equals sign", () => {
      const result = setCookie("test=cookie", "value");

      expect(result).toBe(true);
      // The name will be URL-encoded
      const retrieved = getCookie("test=cookie");
      expect(retrieved).toBe("value");
    });

    it("should handle cookie value with equals sign", () => {
      const testValue = "value=with=equals";

      setCookie("test_cookie", testValue);
      const retrieved = getCookie("test_cookie");

      expect(retrieved).toBe(testValue);
    });

    it("should handle cookie value with semicolon", () => {
      const testValue = "value;with;semicolons";

      setCookie("test_cookie", testValue);
      const retrieved = getCookie("test_cookie");

      expect(retrieved).toBe(testValue);
    });

    it("should handle empty cookie name", () => {
      const result = setCookie("", "value");

      expect(result).toBe(true);
      // Empty name is technically valid but not recommended
    });

    it("should handle maxAge of 0 (immediate expiry)", () => {
      setCookie("test_cookie", "value", { maxAge: 0 });

      // Cookie should be immediately expired
      const retrieved = getCookie("test_cookie");
      expect(retrieved).toBe(null);
    });

    it("should handle negative maxAge (immediate expiry)", () => {
      document.cookie = "test_cookie=value; path=/";

      setCookie("test_cookie", "value", { maxAge: -1 });

      // Cookie should be deleted
      const retrieved = getCookie("test_cookie");
      expect(retrieved).toBe(null);
    });
  });
});
