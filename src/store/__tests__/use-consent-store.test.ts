/**
 * Unit Tests for Consent Store
 *
 * Tests cookie-based persistence, sessionStorage migration, partialize strategy,
 * cookie size monitoring, event dispatch, error handling, and utility functions.
 *
 * **Test Coverage:**
 * - Consent state persistence to cookie
 * - sessionStorage migration with legacy format
 * - Partialize excludes transient fields
 * - Cookie size warning for large payloads (>3KB)
 * - Event dispatch on state changes (consent:status-updated)
 * - Error event dispatch on cookie write failure
 * - clearAllConsentCookies() utility
 * - Fallback to in-memory storage when cookies disabled
 *
 * **Validates Requirements:** 8.2, 8.5
 *
 * @module use-consent-store.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteCookie, getCookie } from "../../lib/utils/cookie";
import {
  type ConsentRecord,
  clearAllConsentCookies,
  useConsentStore,
} from "../use-consent-store";

describe("Consent Store - Unit Tests", () => {
  let cookieStore: Record<string, string> = {};
  let sessionStorageStore: Record<string, string> = {};

  beforeEach(() => {
    // Reset stores
    cookieStore = {};
    sessionStorageStore = {};

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

    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: (key: string) => sessionStorageStore[key] || null,
        setItem: (key: string, value: string) => {
          sessionStorageStore[key] = value;
        },
        removeItem: (key: string) => {
          delete sessionStorageStore[key];
        },
        clear: () => {
          sessionStorageStore = {};
        },
      },
      configurable: true,
      writable: true,
    });

    // Reset Zustand store to initial state
    useConsentStore.setState({
      consentId: null,
      consentStatus: "pending",
      consentData: null,
      isLoading: false,
      error: null,
      lastConsentDate: null,
      modalIsOpen: false,
      modalConfig: null,
    });

    // Clear any existing cookies
    deleteCookie("dop_consent_state", "/");
    deleteCookie("consent_session_id", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Consent state persistence to cookie", () => {
    it("should persist consent state to cookie when setConsentId is called", () => {
      const store = useConsentStore.getState();

      store.setConsentId("consent-123");

      // Wait for persistence (Zustand persist is async)
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const cookieValue = getCookie("dop_consent_state");
          expect(cookieValue).toBeTruthy();

          if (cookieValue) {
            const parsed = JSON.parse(cookieValue);
            expect(parsed.state.consentId).toBe("consent-123");
          }
          resolve();
        }, 100);
      });
    });

    it("should persist consent status to cookie when setConsentStatus is called", () => {
      const store = useConsentStore.getState();

      store.setConsentStatus("agreed");

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const cookieValue = getCookie("dop_consent_state");
          expect(cookieValue).toBeTruthy();

          if (cookieValue) {
            const parsed = JSON.parse(cookieValue);
            expect(parsed.state.consentStatus).toBe("agreed");
            expect(parsed.state.lastConsentDate).toBeTruthy();
          }
          resolve();
        }, 100);
      });
    });

    it("should persist full consent data to cookie when setConsentData is called", () => {
      const store = useConsentStore.getState();

      const consentData: ConsentRecord = {
        id: "consent-456",
        lead_id: "lead-789",
        consent_version_id: "version-1",
        source: "web",
        action: "grant",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      };

      store.setConsentData(consentData);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const cookieValue = getCookie("dop_consent_state");
          expect(cookieValue).toBeTruthy();

          if (cookieValue) {
            const parsed = JSON.parse(cookieValue);
            expect(parsed.state.consentId).toBe("consent-456");
            expect(parsed.state.consentStatus).toBe("agreed");
            expect(parsed.state.consentData).toEqual(consentData);
            expect(parsed.state.lastConsentDate).toBe("2024-01-15T10:00:00Z");
          }
          resolve();
        }, 100);
      });
    });
  });

  describe("sessionStorage migration with legacy format", () => {
    it("should migrate sessionStorage consent state to cookie on initialization", async () => {
      const legacyState = {
        data: JSON.stringify({
          state: {
            consentId: "legacy-consent-123",
            consentStatus: "agreed",
            consentData: null,
            lastConsentDate: "2024-01-15T10:00:00Z",
          },
        }),
        timestamp: Date.now(),
        version: "1.0",
      };

      sessionStorageStore["dop_consent-store"] = JSON.stringify(legacyState);

      // The migration happens in the storage adapter's getItem method
      // We need to trigger it by calling the storage adapter directly
      const cookieStorageAdapter = (
        useConsentStore as any
      ).persist?.getOptions?.()?.storage;
      if (cookieStorageAdapter) {
        cookieStorageAdapter.getItem("dop_consent_state");
      }

      // Wait for migration to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check that cookie was created
      const cookieValue = getCookie("dop_consent_state");
      expect(cookieValue).toBeTruthy();

      if (cookieValue) {
        const parsed = JSON.parse(cookieValue);
        expect(parsed.state.consentId).toBe("legacy-consent-123");
        expect(parsed.state.consentStatus).toBe("agreed");
      }

      // Check that sessionStorage was cleaned up
      expect(sessionStorageStore["dop_consent-store"]).toBeUndefined();
    });

    it("should handle corrupted sessionStorage data gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Set corrupted data
      sessionStorageStore["dop_consent-store"] = "invalid-json";

      // Trigger migration by calling storage adapter
      const cookieStorageAdapter = (
        useConsentStore as any
      ).persist?.getOptions?.()?.storage;
      if (cookieStorageAdapter) {
        cookieStorageAdapter.getItem("dop_consent_state");
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should not throw error and should have default state
      const store = useConsentStore.getState();
      expect(store.consentStatus).toBe("pending");

      // Should clean up corrupted data
      expect(sessionStorageStore["dop_consent-store"]).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });

    it("should handle missing state field in legacy data", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const legacyState = {
        data: JSON.stringify({
          // Missing 'state' field
          consentId: "legacy-consent-123",
        }),
        timestamp: Date.now(),
        version: "1.0",
      };

      sessionStorageStore["dop_consent-store"] = JSON.stringify(legacyState);

      // Trigger store initialization
      const store = useConsentStore.getState();

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Should initialize with default state
          expect(store.consentStatus).toBe("pending");

          consoleErrorSpy.mockRestore();
          resolve();
        }, 100);
      });
    });
  });

  describe("Partialize excludes transient fields", () => {
    it("should only persist consentId, consentStatus, consentData, lastConsentDate", () => {
      const store = useConsentStore.getState();

      // Set both persisted and transient state
      store.setConsentId("consent-123");
      store.setError("Test error");
      store.openConsentModal({ consentPurposeId: "purpose-1" });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const cookieValue = getCookie("dop_consent_state");
          expect(cookieValue).toBeTruthy();

          if (cookieValue) {
            const parsed = JSON.parse(cookieValue);

            // Should persist these fields
            expect(parsed.state.consentId).toBe("consent-123");
            expect(parsed.state.consentStatus).toBeDefined();
            expect(parsed.state.consentData).toBeDefined();
            expect(parsed.state.lastConsentDate).toBeDefined();

            // Should NOT persist these fields
            expect(parsed.state.error).toBeUndefined();
            expect(parsed.state.isLoading).toBeUndefined();
            expect(parsed.state.modalIsOpen).toBeUndefined();
            expect(parsed.state.modalConfig).toBeUndefined();
          }
          resolve();
        }, 100);
      });
    });

    it("should not include transient fields in cookie even when set", () => {
      const store = useConsentStore.getState();

      // Manually set transient state
      useConsentStore.setState({
        consentId: "consent-123",
        consentStatus: "agreed",
        isLoading: true,
        error: "Some error",
        modalIsOpen: true,
        modalConfig: { consentPurposeId: "purpose-1" },
      });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const cookieValue = getCookie("dop_consent_state");

          if (cookieValue) {
            const parsed = JSON.parse(cookieValue);
            const stateKeys = Object.keys(parsed.state);

            // Should only have 4 persisted fields
            expect(stateKeys).toContain("consentId");
            expect(stateKeys).toContain("consentStatus");
            expect(stateKeys).toContain("consentData");
            expect(stateKeys).toContain("lastConsentDate");

            // Should not have transient fields
            expect(stateKeys).not.toContain("isLoading");
            expect(stateKeys).not.toContain("error");
            expect(stateKeys).not.toContain("modalIsOpen");
            expect(stateKeys).not.toContain("modalConfig");
          }
          resolve();
        }, 100);
      });
    });
  });

  describe("Cookie size warning for large payloads (>3KB)", () => {
    it("should log warning when cookie size exceeds 3KB", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const store = useConsentStore.getState();

      // Create large consent data to exceed 3KB
      const largeData: ConsentRecord = {
        id: "consent-123",
        lead_id: "lead-456",
        consent_version_id: "version-789",
        source: "web",
        action: "grant",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        // Add large payload
        // @ts-expect-error - Adding extra field for testing
        metadata: "x".repeat(4000),
      };

      store.setConsentData(largeData);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Should have logged a warning
          expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining("Cookie size"),
            expect.objectContaining({
              actualSize: expect.any(Number),
              limit: 3072,
            }),
          );

          consoleWarnSpy.mockRestore();
          resolve();
        }, 100);
      });
    });

    it("should not log warning when cookie size is under 3KB", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const store = useConsentStore.getState();

      // Create normal-sized consent data
      const normalData: ConsentRecord = {
        id: "consent-123",
        lead_id: "lead-456",
        consent_version_id: "version-789",
        source: "web",
        action: "grant",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      };

      store.setConsentData(normalData);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Should not have logged a size warning
          const sizeWarnings = consoleWarnSpy.mock.calls.filter((call) =>
            call[0]?.toString().includes("Cookie size"),
          );
          expect(sizeWarnings.length).toBe(0);

          consoleWarnSpy.mockRestore();
          resolve();
        }, 100);
      });
    });
  });

  describe("Event dispatch on state changes", () => {
    it("should dispatch consent:id-updated event when setConsentId is called", () => {
      const eventSpy = vi.fn();
      window.addEventListener("consent:id-updated", eventSpy);

      const store = useConsentStore.getState();
      store.setConsentId("consent-123");

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { consentId: "consent-123" },
        }),
      );

      window.removeEventListener("consent:id-updated", eventSpy);
    });

    it("should dispatch consent:status-updated event when setConsentStatus is called", () => {
      const eventSpy = vi.fn();
      window.addEventListener("consent:status-updated", eventSpy);

      const store = useConsentStore.getState();
      store.setConsentStatus("agreed");

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { consentStatus: "agreed" },
        }),
      );

      window.removeEventListener("consent:status-updated", eventSpy);
    });

    it("should dispatch consent:data-updated event when setConsentData is called", () => {
      const eventSpy = vi.fn();
      window.addEventListener("consent:data-updated", eventSpy);

      const store = useConsentStore.getState();

      const consentData: ConsentRecord = {
        id: "consent-456",
        lead_id: "lead-789",
        consent_version_id: "version-1",
        source: "web",
        action: "grant",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      };

      store.setConsentData(consentData);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { consentData },
        }),
      );

      window.removeEventListener("consent:data-updated", eventSpy);
    });

    it("should dispatch consent:error event when setError is called", () => {
      const eventSpy = vi.fn();
      window.addEventListener("consent:error", eventSpy);

      const store = useConsentStore.getState();
      store.setError("Test error message");

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            error: "Test error message",
            timestamp: expect.any(String),
          }),
        }),
      );

      window.removeEventListener("consent:error", eventSpy);
    });
  });

  describe("Error event dispatch on cookie write failure", () => {
    it("should dispatch consent:error event when cookie write fails", () => {
      const eventSpy = vi.fn();
      window.addEventListener("consent:error", eventSpy);

      // Mock cookie write failure
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {
          throw new Error("Quota exceeded");
        },
        configurable: true,
      });

      const store = useConsentStore.getState();
      store.setConsentId("consent-123");

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Should have dispatched error event
          expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              detail: expect.objectContaining({
                error: expect.any(String),
                cookieName: "dop_consent_state",
                fallbackActive: true,
              }),
            }),
          );

          window.removeEventListener("consent:error", eventSpy);
          resolve();
        }, 100);
      });
    });

    it("should log error when cookie write fails", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock cookie write failure
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {
          throw new Error("Cookies disabled");
        },
        configurable: true,
      });

      const store = useConsentStore.getState();
      store.setConsentId("consent-123");

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Should have logged error
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining("[Consent Store] Failed to write cookie:"),
            expect.any(Error),
            expect.any(Object),
          );

          consoleErrorSpy.mockRestore();
          resolve();
        }, 100);
      });
    });
  });

  describe("clearAllConsentCookies() utility", () => {
    it("should remove all consent-related cookies", () => {
      // Set up cookies
      cookieStore["dop_consent_state"] = "test-state";
      cookieStore["consent_session_id"] = "test-session";

      clearAllConsentCookies();

      expect(cookieStore["dop_consent_state"]).toBeUndefined();
      expect(cookieStore["consent_session_id"]).toBeUndefined();
    });

    it("should complete within 100ms", () => {
      const start = performance.now();

      clearAllConsentCookies();

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it("should handle SSR environment gracefully", () => {
      const originalDocument = global.document;
      // @ts-expect-error - Simulating SSR environment
      delete global.document;

      // Should not throw error
      clearAllConsentCookies();

      // Restore document
      global.document = originalDocument;
    });

    it("should log success message when cookies are cleared", () => {
      const consoleInfoSpy = vi
        .spyOn(console, "info")
        .mockImplementation(() => {});

      cookieStore["dop_consent_state"] = "test-state";
      cookieStore["consent_session_id"] = "test-session";

      clearAllConsentCookies();

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Consent Store] All consent cookies cleared"),
        expect.objectContaining({
          duration: expect.any(String),
          cookiesCleared: ["dop_consent_state", "consent_session_id"],
        }),
      );

      consoleInfoSpy.mockRestore();
    });

    it("should handle errors gracefully", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock deleteCookie to throw error
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {
          throw new Error("Delete failed");
        },
        configurable: true,
      });

      // Should not throw error
      clearAllConsentCookies();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Fallback to in-memory storage when cookies disabled", () => {
    it("should fall back to in-memory storage when cookie write fails", async () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Mock cookie write failure
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {
          throw new Error("Cookies disabled");
        },
        configurable: true,
      });

      const store = useConsentStore.getState();
      store.setConsentId("consent-123");

      await new Promise((resolve) => setTimeout(resolve, 50));

      // State should still be updated in memory (check fresh state)
      const updatedStore = useConsentStore.getState();
      expect(updatedStore.consentId).toBe("consent-123");

      // Should have logged fallback warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Consent Store] Falling back to in-memory storage",
        ),
        expect.any(Object),
      );

      consoleWarnSpy.mockRestore();
    });

    it("should maintain state in memory when cookies are disabled", async () => {
      // Mock cookie write failure
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {
          throw new Error("Cookies disabled");
        },
        configurable: true,
      });

      const store = useConsentStore.getState();

      // Set multiple state values
      store.setConsentId("consent-123");
      store.setConsentStatus("agreed");

      await new Promise((resolve) => setTimeout(resolve, 50));

      // State should be maintained in memory (check fresh state)
      const updatedStore = useConsentStore.getState();
      expect(updatedStore.consentId).toBe("consent-123");
      expect(updatedStore.consentStatus).toBe("agreed");
      expect(updatedStore.lastConsentDate).toBeTruthy();
    });

    it("should dispatch error event when falling back to in-memory storage", () => {
      const eventSpy = vi.fn();
      window.addEventListener("consent:error", eventSpy);

      // Mock cookie write failure
      Object.defineProperty(document, "cookie", {
        get: () => "",
        set: () => {
          throw new Error("Cookies disabled");
        },
        configurable: true,
      });

      const store = useConsentStore.getState();
      store.setConsentId("consent-123");

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(eventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              detail: expect.objectContaining({
                fallbackActive: true,
              }),
            }),
          );

          window.removeEventListener("consent:error", eventSpy);
          resolve();
        }, 100);
      });
    });
  });

  describe("Store getters", () => {
    it("hasConsent() should return true when consentId is set", () => {
      const store = useConsentStore.getState();

      expect(store.hasConsent()).toBe(false);

      store.setConsentId("consent-123");

      expect(store.hasConsent()).toBe(true);
    });

    it("getConsentId() should return current consent ID", () => {
      const store = useConsentStore.getState();

      expect(store.getConsentId()).toBe(null);

      store.setConsentId("consent-456");

      expect(store.getConsentId()).toBe("consent-456");
    });

    it("isConsentValid() should return true only when status is agreed", () => {
      const store = useConsentStore.getState();

      expect(store.isConsentValid()).toBe(false);

      store.setConsentId("consent-123");
      expect(store.isConsentValid()).toBe(false);

      store.setConsentStatus("agreed");
      expect(store.isConsentValid()).toBe(true);

      store.setConsentStatus("declined");
      expect(store.isConsentValid()).toBe(false);
    });
  });

  describe("Modal state management", () => {
    it("should open consent modal with configuration", () => {
      const store = useConsentStore.getState();

      const config = { consentPurposeId: "purpose-1" };
      store.openConsentModal(config);

      // Get fresh state after update
      const updatedStore = useConsentStore.getState();
      expect(updatedStore.modalIsOpen).toBe(true);
      expect(updatedStore.modalConfig).toEqual(config);
    });

    it("should close consent modal", () => {
      const store = useConsentStore.getState();

      store.openConsentModal({ consentPurposeId: "purpose-1" });

      // Check state after opening
      let updatedStore = useConsentStore.getState();
      expect(updatedStore.modalIsOpen).toBe(true);

      store.closeConsentModal();

      // Check state after closing
      updatedStore = useConsentStore.getState();
      expect(updatedStore.modalIsOpen).toBe(false);
      expect(updatedStore.modalConfig).toBe(null);
    });

    it("should not persist modal state to cookie", () => {
      const store = useConsentStore.getState();

      store.setConsentId("consent-123");
      store.openConsentModal({ consentPurposeId: "purpose-1" });

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const cookieValue = getCookie("dop_consent_state");

          if (cookieValue) {
            const parsed = JSON.parse(cookieValue);
            expect(parsed.state.modalIsOpen).toBeUndefined();
            expect(parsed.state.modalConfig).toBeUndefined();
          }
          resolve();
        }, 100);
      });
    });
  });

  describe("Error state management", () => {
    it("should set error message", () => {
      const store = useConsentStore.getState();

      store.setError("Test error");

      // Get fresh state after update
      const updatedStore = useConsentStore.getState();
      expect(updatedStore.error).toBe("Test error");
    });

    it("should clear error message", () => {
      const store = useConsentStore.getState();

      store.setError("Test error");

      // Check state after setting error
      let updatedStore = useConsentStore.getState();
      expect(updatedStore.error).toBe("Test error");

      store.clearError();

      // Check state after clearing error
      updatedStore = useConsentStore.getState();
      expect(updatedStore.error).toBe(null);
    });

    it("should not persist error state to cookie", () => {
      const store = useConsentStore.getState();

      store.setConsentId("consent-123");
      store.setError("Test error");

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const cookieValue = getCookie("dop_consent_state");

          if (cookieValue) {
            const parsed = JSON.parse(cookieValue);
            expect(parsed.state.error).toBeUndefined();
          }
          resolve();
        }, 100);
      });
    });
  });
});
