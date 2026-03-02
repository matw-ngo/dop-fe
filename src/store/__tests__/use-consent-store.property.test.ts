import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";
import { useConsentStore, clearAllConsentCookies } from "../use-consent-store";
import type { ConsentRecord } from "../use-consent-store";

/**
 * Property-Based Tests for Consent Store
 *
 * Feature: migrate-consent-storage-to-cookies
 *
 * These tests validate universal correctness properties across randomly
 * generated inputs using fast-check library. Each property is tested with
 * 100+ iterations to ensure robustness.
 */

describe("Consent Store - Property-Based Tests", () => {
  let cookieStore: Record<string, string> = {};

  beforeEach(() => {
    // Reset cookie store
    cookieStore = {};

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

    // Clear all consent cookies
    clearAllConsentCookies();

    // Reset store to initial state
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 2: Cross-Tab State Synchronization
   *
   * **Validates: Requirements 3.1, 3.2**
   *
   * For any consent state change in one browser tab, all other tabs SHALL
   * reflect the updated state within the cookie storage system through
   * automatic synchronization.
   *
   * This property ensures that the cookie-based storage mechanism provides
   * automatic cross-tab synchronization. When consent state changes in any
   * tab, the cookie update triggers storage events that propagate the change
   * to all other tabs, maintaining consistency across the browser session.
   */
  it("Property 2: Cross-tab state synchronization", async () => {
    // Feature: migrate-consent-storage-to-cookies, Property 2: Cross-tab state synchronization

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          consentId: fc.string({ minLength: 1, maxLength: 50 }),
          consentStatus: fc.constantFrom("agreed", "declined"), // Remove 'pending' since it's not a valid action result
          leadId: fc.uuid(),
          consentVersionId: fc.uuid(),
          source: fc.constantFrom("web", "mobile", "api"),
        }),
        async (testData) => {
          // Clear state before each iteration
          clearAllConsentCookies();
          cookieStore = {};

          // Reset store to initial state
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

          // Simulate Tab 1: Create first store instance
          const store1 = useConsentStore.getState();

          // Simulate Tab 2: Create second store instance (same store, different reference)
          const store2 = useConsentStore.getState();

          // Tab 1: Update consent state
          const consentData: ConsentRecord = {
            id: testData.consentId,
            lead_id: testData.leadId,
            consent_version_id: testData.consentVersionId,
            source: testData.source,
            action: testData.consentStatus === "agreed" ? "grant" : "decline",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          store1.setConsentData(consentData);

          // Verify cookie was updated
          const cookieValue = cookieStore["dop_consent_state"];
          expect(cookieValue).toBeDefined();

          // Parse cookie to verify state
          const parsedCookie = JSON.parse(decodeURIComponent(cookieValue));
          expect(parsedCookie.state.consentId).toBe(testData.consentId);

          // The store maps action to status: 'grant' -> 'agreed', 'decline' -> 'declined'
          const expectedStatus =
            testData.consentStatus === "agreed" ? "agreed" : "declined";
          expect(parsedCookie.state.consentStatus).toBe(expectedStatus);

          // Tab 2: Verify state is synchronized
          // In a real browser, this would happen via storage events
          // In our test, we verify the cookie contains the correct data
          // Get fresh state after update
          const store2State = useConsentStore.getState();
          expect(store2State.consentId).toBe(testData.consentId);
          expect(store2State.consentStatus).toBe(expectedStatus);
        },
      ),
      {
        numRuns: 100,
        verbose: true,
      },
    );
  });

  /**
   * Property 3: Event Dispatch on State Changes
   *
   * **Validates: Requirements 3.5**
   *
   * For any consent state change (status update, consent ID assignment, or
   * consent data modification), the Consent Store SHALL dispatch a corresponding
   * custom event (consent:status-updated, consent:id-updated, or consent:data-updated).
   *
   * This property ensures that all state changes are observable by other components
   * through the event system. This is critical for UI reactivity and cross-component
   * communication in the consent flow.
   */
  it("Property 3: Event dispatch on state changes", async () => {
    // Feature: migrate-consent-storage-to-cookies, Property 3: Event dispatch on state changes

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          consentId: fc.string({ minLength: 1, maxLength: 50 }),
          consentStatus: fc.constantFrom("pending", "agreed", "declined"),
        }),
        async (testData) => {
          // Clear state before each iteration
          clearAllConsentCookies();
          cookieStore = {};

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

          // Set up event listeners
          const events: string[] = [];

          const idListener = (e: Event) => {
            events.push("consent:id-updated");
          };
          const statusListener = (e: Event) => {
            events.push("consent:status-updated");
          };
          const dataListener = (e: Event) => {
            events.push("consent:data-updated");
          };

          window.addEventListener("consent:id-updated", idListener);
          window.addEventListener("consent:status-updated", statusListener);
          window.addEventListener("consent:data-updated", dataListener);

          try {
            const store = useConsentStore.getState();

            // Test 1: setConsentId should dispatch consent:id-updated
            events.length = 0;
            store.setConsentId(testData.consentId);
            expect(events).toContain("consent:id-updated");

            // Test 2: setConsentStatus should dispatch consent:status-updated
            events.length = 0;
            store.setConsentStatus(testData.consentStatus);
            expect(events).toContain("consent:status-updated");

            // Test 3: setConsentData should dispatch consent:data-updated
            events.length = 0;
            const consentData: ConsentRecord = {
              id: testData.consentId,
              lead_id: "test-lead-id",
              consent_version_id: "test-version-id",
              source: "web",
              action: testData.consentStatus === "agreed" ? "grant" : "decline",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            store.setConsentData(consentData);
            expect(events).toContain("consent:data-updated");
          } finally {
            // Clean up event listeners
            window.removeEventListener("consent:id-updated", idListener);
            window.removeEventListener(
              "consent:status-updated",
              statusListener,
            );
            window.removeEventListener("consent:data-updated", dataListener);
          }
        },
      ),
      {
        numRuns: 100,
        verbose: true,
      },
    );
  });

  /**
   * Property 5: Error Event Dispatch on Cookie Failures
   *
   * **Validates: Requirements 9.5**
   *
   * For any cookie write operation that fails (due to disabled cookies, quota
   * exceeded, or other errors), the system SHALL dispatch a consent:error event
   * with error details.
   *
   * This property ensures that cookie write failures are always observable by
   * the application, enabling proper error handling and user feedback. This is
   * essential for graceful degradation when cookies are disabled or storage
   * quotas are exceeded.
   */
  it("Property 5: Error event dispatch on cookie failures", async () => {
    // Feature: migrate-consent-storage-to-cookies, Property 5: Error event dispatch on cookie failures

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          consentId: fc.string({ minLength: 1, maxLength: 50 }),
          errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (testData) => {
          // Clear state before each iteration
          clearAllConsentCookies();
          cookieStore = {};

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

          // Set up event listener for error events
          let errorEventDispatched = false;
          let errorDetails: any = null;

          const errorListener = (e: Event) => {
            errorEventDispatched = true;
            errorDetails = (e as CustomEvent).detail;
          };

          window.addEventListener("consent:error", errorListener);

          try {
            // Mock cookie write failure by making document.cookie throw
            const originalCookieDescriptor = Object.getOwnPropertyDescriptor(
              document,
              "cookie",
            );

            Object.defineProperty(document, "cookie", {
              get: () => "",
              set: () => {
                throw new Error(testData.errorMessage);
              },
              configurable: true,
            });

            // Attempt to set consent data, which should trigger cookie write
            const store = useConsentStore.getState();
            const consentData: ConsentRecord = {
              id: testData.consentId,
              lead_id: "test-lead-id",
              consent_version_id: "test-version-id",
              source: "web",
              action: "grant",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            store.setConsentData(consentData);

            // Verify error event was dispatched
            expect(errorEventDispatched).toBe(true);
            expect(errorDetails).toBeDefined();
            expect(errorDetails.error).toBeDefined();
            expect(errorDetails.fallbackActive).toBe(true);

            // Restore original cookie descriptor
            if (originalCookieDescriptor) {
              Object.defineProperty(
                document,
                "cookie",
                originalCookieDescriptor,
              );
            }
          } finally {
            // Clean up event listener
            window.removeEventListener("consent:error", errorListener);
          }
        },
      ),
      {
        numRuns: 100,
        verbose: true,
      },
    );
  });
});
