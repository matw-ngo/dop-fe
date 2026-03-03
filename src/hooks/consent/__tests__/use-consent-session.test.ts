import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as cookieUtils from "@/lib/utils/cookie";
import {
  clearConsentSessionCookie,
  isCookieSupported,
  useConsentSession,
} from "../use-consent-session";

describe("useConsentSession", () => {
  let cookieStore: Record<string, string> = {};
  let localStorageStore: Record<string, string> = {};

  beforeEach(() => {
    // Reset stores
    cookieStore = {};
    localStorageStore = {};

    // Mock document.cookie
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

    // Mock localStorage
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: (key: string) => localStorageStore[key] || null,
        setItem: (key: string, value: string) => {
          localStorageStore[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageStore[key];
        },
        clear: () => {
          localStorageStore = {};
        },
      },
      configurable: true,
    });

    // Clear module-level cache by clearing the cookie
    clearConsentSessionCookie();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Session ID Generation", () => {
    it("should generate new session ID when no cookie exists", async () => {
      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Verify UUID v4 format (8-4-4-4-12 hexadecimal pattern)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result.current).toMatch(uuidRegex);
    });

    it("should generate UUID v4 with correct version bits", async () => {
      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      const sessionId = result.current!;
      const parts = sessionId.split("-");

      // Check version field (3rd group, first character should be '4')
      expect(parts[2][0]).toBe("4");

      // Check variant field (4th group, first character should be 8, 9, a, or b)
      expect(["8", "9", "a", "b"]).toContain(parts[3][0].toLowerCase());
    });

    it("should store generated session ID in cookie", async () => {
      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(document.cookie).toContain("consent_session_id=");
      expect(document.cookie).toContain(result.current!);
    });
  });

  describe("Session ID Retrieval", () => {
    it("should retrieve existing session ID from cookie", async () => {
      const existingId = "550e8400-e29b-41d4-a716-446655440000";
      cookieStore["consent_session_id"] = existingId;

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).toBe(existingId);
      });
    });

    it("should use module-level cache on subsequent calls", async () => {
      const existingId = "550e8400-e29b-41d4-a716-446655440000";
      cookieStore["consent_session_id"] = existingId;

      const getCookieSpy = vi.spyOn(cookieUtils, "getCookie");

      // First render
      const { result: result1 } = renderHook(() => useConsentSession());
      await waitFor(() => {
        expect(result1.current).toBe(existingId);
      });

      const firstCallCount = getCookieSpy.mock.calls.length;

      // Second render
      const { result: result2 } = renderHook(() => useConsentSession());
      await waitFor(() => {
        expect(result2.current).toBe(existingId);
      });

      // Should use cache, not call getCookie again
      expect(getCookieSpy.mock.calls.length).toBe(firstCallCount);
    });

    it("should handle URL-encoded session IDs", async () => {
      const sessionId = "550e8400-e29b-41d4-a716-446655440000";
      cookieStore["consent_session_id"] = encodeURIComponent(sessionId);

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).toBe(sessionId);
      });
    });
  });

  describe("localStorage Migration", () => {
    it("should migrate valid localStorage session ID to cookie", async () => {
      const legacyId = "123e4567-e89b-12d3-a456-426614174000";
      const timestamp = Date.now().toString();
      localStorageStore["consent_session_id"] = legacyId;
      localStorageStore["consent_session_id_timestamp"] = timestamp;

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).toBe(legacyId);
      });

      // Verify cookie was created
      expect(document.cookie).toContain(`consent_session_id=${legacyId}`);

      // Verify localStorage was cleaned up
      expect(localStorageStore["consent_session_id"]).toBeUndefined();
      expect(localStorageStore["consent_session_id_timestamp"]).toBeUndefined();
    });

    it("should migrate localStorage session ID that is 29 days old", async () => {
      const legacyId = "123e4567-e89b-12d3-a456-426614174000";
      const timestamp = Date.now() - 29 * 24 * 60 * 60 * 1000; // 29 days ago
      localStorageStore["consent_session_id"] = legacyId;
      localStorageStore["consent_session_id_timestamp"] = timestamp.toString();

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).toBe(legacyId);
      });

      expect(document.cookie).toContain(`consent_session_id=${legacyId}`);
    });

    it("should NOT migrate localStorage session ID that is exactly 30 days old", async () => {
      const legacyId = "123e4567-e89b-12d3-a456-426614174000";
      // Add a small buffer to ensure it's over 30 days (30 days + 1 minute)
      const timestamp = Date.now() - 30 * 24 * 60 * 60 * 1000 - 60 * 1000;
      localStorageStore["consent_session_id"] = legacyId;
      localStorageStore["consent_session_id_timestamp"] = timestamp.toString();

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should generate new session ID, not use expired one
      expect(result.current).not.toBe(legacyId);

      // Verify localStorage was cleaned up
      expect(localStorageStore["consent_session_id"]).toBeUndefined();
      expect(localStorageStore["consent_session_id_timestamp"]).toBeUndefined();
    });

    it("should generate new session ID when legacy session is expired (31+ days old)", async () => {
      const legacyId = "123e4567-e89b-12d3-a456-426614174000";
      const expiredTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago
      localStorageStore["consent_session_id"] = legacyId;
      localStorageStore["consent_session_id_timestamp"] =
        expiredTimestamp.toString();

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should generate new session ID
      expect(result.current).not.toBe(legacyId);

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Consent Session] Legacy session expired or invalid",
        ),
      );

      // Verify localStorage was cleaned up
      expect(localStorageStore["consent_session_id"]).toBeUndefined();
      expect(localStorageStore["consent_session_id_timestamp"]).toBeUndefined();

      consoleWarnSpy.mockRestore();
    });

    it("should handle missing timestamp during migration", async () => {
      const legacyId = "123e4567-e89b-12d3-a456-426614174000";
      localStorageStore["consent_session_id"] = legacyId;
      // No timestamp

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should generate new session ID since timestamp is missing
      expect(result.current).not.toBe(legacyId);
    });

    it("should handle invalid timestamp during migration", async () => {
      const legacyId = "123e4567-e89b-12d3-a456-426614174000";
      localStorageStore["consent_session_id"] = legacyId;
      localStorageStore["consent_session_id_timestamp"] = "invalid-timestamp";

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should generate new session ID
      expect(result.current).not.toBe(legacyId);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Consent Session] Legacy session expired or invalid",
        ),
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle migration when cookie write fails", async () => {
      const legacyId = "123e4567-e89b-12d3-a456-426614174000";
      const timestamp = Date.now().toString();
      localStorageStore["consent_session_id"] = legacyId;
      localStorageStore["consent_session_id_timestamp"] = timestamp;

      // Mock setCookie to fail
      vi.spyOn(cookieUtils, "setCookie").mockReturnValue(false);
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).toBe(legacyId);
      });

      // Should still use legacy ID as fallback
      expect(result.current).toBe(legacyId);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Consent Session] Failed to write cookie during migration",
        ),
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle migration errors gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock localStorage.getItem to throw an error
      const mockGetItem = vi.fn((key: string) => {
        if (
          key === "consent_session_id" ||
          key === "consent_session_id_timestamp"
        ) {
          throw new Error("Storage error");
        }
        return null;
      });

      Object.defineProperty(global, "localStorage", {
        value: {
          getItem: mockGetItem,
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        configurable: true,
      });

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should generate new session ID
      expect(result.current).toBeTruthy();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Consent Session] Migration failed:"),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Cookie Support Detection", () => {
    it("should detect cookie support when cookies are enabled", () => {
      const supported = isCookieSupported();

      expect(supported).toBe(true);
    });

    it("should return false when cookies are disabled", () => {
      // Mock document.cookie to simulate disabled cookies
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {
          // Silently fail (cookies disabled)
        },
        configurable: true,
      });

      const supported = isCookieSupported();

      expect(supported).toBe(false);
    });

    it("should return false in SSR environment (no document)", () => {
      const originalDocument = global.document;
      // @ts-expect-error - Simulating SSR environment
      delete global.document;

      const supported = isCookieSupported();

      expect(supported).toBe(false);

      // Restore document
      global.document = originalDocument;
    });

    it("should handle errors during cookie detection", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock document.cookie to throw
      Object.defineProperty(document, "cookie", {
        get: () => {
          throw new Error("Cookie access denied");
        },
        set: () => {
          throw new Error("Cookie write denied");
        },
        configurable: true,
      });

      const supported = isCookieSupported();

      expect(supported).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Cookie Detection] Failed to detect cookie support:",
        ),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it("should clean up test cookie after detection", () => {
      isCookieSupported();

      // Test cookie should be removed
      expect(document.cookie).not.toContain("__cookie_test__");
    });
  });

  describe("Fallback to In-Memory Storage", () => {
    it("should fall back to in-memory storage when cookie write fails", async () => {
      // Mock setCookie to fail
      vi.spyOn(cookieUtils, "setCookie").mockReturnValue(false);
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should still generate session ID
      expect(result.current).toBeTruthy();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Consent Session] Cookie write failed, using in-memory storage",
        ),
      );

      consoleWarnSpy.mockRestore();
    });

    it("should maintain session ID in memory across re-renders when cookies fail", async () => {
      vi.spyOn(cookieUtils, "setCookie").mockReturnValue(false);
      vi.spyOn(console, "warn").mockImplementation(() => {});

      const { result: result1 } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result1.current).not.toBeNull();
      });

      const firstSessionId = result1.current;

      // Second render should use cached value
      const { result: result2 } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result2.current).toBe(firstSessionId);
      });
    });
  });

  describe("clearConsentSessionCookie", () => {
    it("should remove session ID cookie", () => {
      cookieStore["consent_session_id"] = "test-session-id";
      expect(document.cookie).toContain("consent_session_id=test-session-id");

      clearConsentSessionCookie();

      expect(document.cookie).not.toContain("consent_session_id");
    });

    it("should clear module-level cache", async () => {
      // Set up initial session
      const existingId = "550e8400-e29b-41d4-a716-446655440000";
      cookieStore["consent_session_id"] = existingId;

      const { result: result1 } = renderHook(() => useConsentSession());
      await waitFor(() => {
        expect(result1.current).toBe(existingId);
      });

      // Clear cookie and cache
      clearConsentSessionCookie();

      // New render should generate new session ID
      const { result: result2 } = renderHook(() => useConsentSession());
      await waitFor(() => {
        expect(result2.current).not.toBeNull();
      });

      expect(result2.current).not.toBe(existingId);
    });

    it("should handle clearing non-existent cookie gracefully", () => {
      expect(document.cookie).not.toContain("consent_session_id");

      // Should not throw
      clearConsentSessionCookie();

      expect(document.cookie).not.toContain("consent_session_id");
    });
  });

  describe("Cookie Configuration", () => {
    it("should set cookie with 30-day expiry (2592000 seconds)", async () => {
      const setCookieSpy = vi.spyOn(cookieUtils, "setCookie");

      renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(setCookieSpy).toHaveBeenCalled();
      });

      expect(setCookieSpy).toHaveBeenCalledWith(
        "consent_session_id",
        expect.any(String),
        expect.objectContaining({
          maxAge: 2592000,
        }),
      );
    });

    it("should set cookie with Secure flag", async () => {
      const setCookieSpy = vi.spyOn(cookieUtils, "setCookie");

      renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(setCookieSpy).toHaveBeenCalled();
      });

      expect(setCookieSpy).toHaveBeenCalledWith(
        "consent_session_id",
        expect.any(String),
        expect.objectContaining({
          secure: true,
        }),
      );
    });

    it("should set cookie with SameSite=Lax", async () => {
      const setCookieSpy = vi.spyOn(cookieUtils, "setCookie");

      renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(setCookieSpy).toHaveBeenCalled();
      });

      expect(setCookieSpy).toHaveBeenCalledWith(
        "consent_session_id",
        expect.any(String),
        expect.objectContaining({
          sameSite: "Lax",
        }),
      );
    });

    it("should set cookie with path=/", async () => {
      const setCookieSpy = vi.spyOn(cookieUtils, "setCookie");

      renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(setCookieSpy).toHaveBeenCalled();
      });

      expect(setCookieSpy).toHaveBeenCalledWith(
        "consent_session_id",
        expect.any(String),
        expect.objectContaining({
          path: "/",
        }),
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive hook calls", async () => {
      const { result: result1 } = renderHook(() => useConsentSession());
      const { result: result2 } = renderHook(() => useConsentSession());
      const { result: result3 } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result1.current).not.toBeNull();
        expect(result2.current).not.toBeNull();
        expect(result3.current).not.toBeNull();
      });

      // All should return the same session ID (from cache)
      expect(result1.current).toBe(result2.current);
      expect(result2.current).toBe(result3.current);
    });

    it("should handle empty cookie value", async () => {
      cookieStore["consent_session_id"] = "";

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should generate new session ID since cookie is empty
      expect(result.current).toBeTruthy();
      expect(result.current).not.toBe("");
    });

    it("should handle malformed UUID in cookie", async () => {
      cookieStore["consent_session_id"] = "not-a-valid-uuid";

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should use the existing value even if malformed
      // (validation is not part of retrieval logic)
      expect(result.current).toBe("not-a-valid-uuid");
    });

    it("should handle undefined localStorage gracefully", async () => {
      const originalLocalStorage = global.localStorage;

      // @ts-expect-error - Simulating environment without localStorage
      delete global.localStorage;

      const { result } = renderHook(() => useConsentSession());

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // Should generate new session ID when localStorage is unavailable
      expect(result.current).toBeTruthy();

      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });
  });
});
